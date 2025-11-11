/*
  # Organize Database Tables for Better Structure

  1. New Tables
    - `customers` - Store customer information separately
    - `order_items` - Store individual items in orders (many-to-many relationship)
    - `product_categories` - Separate table for categories
    - `inventory` - Track product stock levels
    - `delivery_zones` - Manage delivery areas and costs
    - `order_tracking` - Track order status changes

  2. Enhanced Tables
    - Update `orders` table structure
    - Add proper relationships between tables
    - Add indexes for performance

  3. Security
    - Enable RLS on all tables
    - Add appropriate policies for public ordering
*/

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone_number text NOT NULL,
  email text NOT NULL,
  delivery_addresses jsonb DEFAULT '[]'::jsonb,
  notes text,
  total_orders integer DEFAULT 0,
  total_spent numeric(12,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(phone_number),
  UNIQUE(email)
);

-- Create product categories table
CREATE TABLE IF NOT EXISTS product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  image_url text,
  parent_id uuid REFERENCES product_categories(id),
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create delivery zones table
CREATE TABLE IF NOT EXISTS delivery_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  counties text[] NOT NULL,
  delivery_fee numeric(8,2) DEFAULT 0,
  estimated_days integer DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  stock_quantity integer DEFAULT 0,
  reserved_quantity integer DEFAULT 0,
  low_stock_threshold integer DEFAULT 5,
  last_restocked_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id)
);

-- Update orders table structure
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES customers(id),
ADD COLUMN IF NOT EXISTS order_number text UNIQUE,
ADD COLUMN IF NOT EXISTS subtotal numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_fee numeric(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_amount numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_zone_id uuid REFERENCES delivery_zones(id),
ADD COLUMN IF NOT EXISTS estimated_delivery_date date,
ADD COLUMN IF NOT EXISTS actual_delivery_date date,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create order items table (for multiple products per order)
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  product_name text NOT NULL,
  product_image text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  product_options jsonb DEFAULT '{}'::jsonb, -- color, size, etc.
  created_at timestamptz DEFAULT now()
);

-- Create order tracking table
CREATE TABLE IF NOT EXISTS order_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  notes text,
  created_by text DEFAULT 'system',
  created_at timestamptz DEFAULT now()
);

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  new_number text;
  counter integer;
BEGIN
  -- Get current date in YYYYMMDD format
  SELECT 'LT' || to_char(now(), 'YYYYMMDD') || '-' INTO new_number;
  
  -- Get count of orders today
  SELECT COUNT(*) + 1 INTO counter
  FROM orders 
  WHERE created_at::date = CURRENT_DATE;
  
  -- Pad with zeros to make it 4 digits
  new_number := new_number || LPAD(counter::text, 4, '0');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_categories_updated_at ON product_categories;
CREATE TRIGGER update_product_categories_updated_at
  BEFORE UPDATE ON product_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to auto-generate order numbers
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_order_number_trigger ON orders;
CREATE TRIGGER set_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION set_order_number();

-- Add trigger to track order status changes
CREATE OR REPLACE FUNCTION track_order_status_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert tracking record when status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_tracking (order_id, status, notes)
    VALUES (NEW.id, NEW.status, 'Status changed from ' || COALESCE(OLD.status, 'new') || ' to ' || NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS track_order_status_trigger ON orders;
CREATE TRIGGER track_order_status_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION track_order_status_changes();

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers
CREATE POLICY "Public can insert customers" ON customers
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Customers can read own data" ON customers
  FOR SELECT TO authenticated USING (phone_number = current_setting('request.jwt.claims', true)::json->>'phone');

CREATE POLICY "Service role can manage customers" ON customers
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RLS Policies for product_categories
CREATE POLICY "Public can read active categories" ON product_categories
  FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Authenticated users can manage categories" ON product_categories
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for delivery_zones
CREATE POLICY "Public can read active delivery zones" ON delivery_zones
  FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Authenticated users can manage delivery zones" ON delivery_zones
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for inventory
CREATE POLICY "Public can read inventory" ON inventory
  FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can manage inventory" ON inventory
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for order_items
CREATE POLICY "Public can insert order items" ON order_items
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Users can read order items" ON order_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role can manage order items" ON order_items
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RLS Policies for order_tracking
CREATE POLICY "Users can read order tracking" ON order_tracking
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role can manage order tracking" ON order_tracking
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers (phone_number);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers (email);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_categories_slug ON product_categories (slug);
CREATE INDEX IF NOT EXISTS idx_product_categories_parent ON product_categories (parent_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_active ON product_categories (is_active);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items (product_id);

CREATE INDEX IF NOT EXISTS idx_order_tracking_order ON order_tracking (order_id);
CREATE INDEX IF NOT EXISTS idx_order_tracking_created_at ON order_tracking (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory (product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stock ON inventory (stock_quantity);

-- Insert default delivery zones
INSERT INTO delivery_zones (name, counties, delivery_fee, estimated_days) VALUES
('Nairobi Metro', ARRAY['Nairobi'], 200, 1),
('Central Kenya', ARRAY['Kiambu', 'Murang''a', 'Nyeri', 'Kirinyaga', 'Nyandarua'], 300, 2),
('Coast Region', ARRAY['Mombasa', 'Kilifi', 'Kwale', 'Taita-Taveta', 'Lamu', 'Tana River'], 500, 3),
('Western Kenya', ARRAY['Kakamega', 'Bungoma', 'Busia', 'Vihiga', 'Trans Nzoia'], 400, 2),
('Nyanza Region', ARRAY['Kisumu', 'Siaya', 'Kisii', 'Nyamira', 'Homa Bay', 'Migori'], 450, 3),
('Rift Valley', ARRAY['Nakuru', 'Uasin Gishu', 'Nandi', 'Kericho', 'Bomet', 'Kajiado', 'Narok', 'Laikipia'], 350, 2),
('Eastern Kenya', ARRAY['Machakos', 'Makueni', 'Kitui', 'Embu', 'Tharaka-Nithi', 'Meru', 'Isiolo'], 400, 3),
('Northern Kenya', ARRAY['Marsabit', 'Samburu', 'Turkana', 'West Pokot', 'Baringo', 'Elgeyo-Marakwet'], 600, 4),
('North Eastern', ARRAY['Garissa', 'Wajir', 'Mandera'], 700, 5)
ON CONFLICT DO NOTHING;

-- Insert default product categories
INSERT INTO product_categories (name, slug, description, icon) VALUES
('Electronics', 'electronics', 'Phones, laptops, and electronic devices', '📱'),
('Home & Kitchen', 'home-kitchen', 'Home appliances and kitchen equipment', '🏠'),
('Fashion', 'fashion', 'Clothing, shoes, and accessories', '👕'),
('Sports & Fitness', 'sports-fitness', 'Sports equipment and fitness gear', '🏋️'),
('Books & Education', 'books-education', 'Books, educational materials', '📚'),
('Health & Beauty', 'health-beauty', 'Health and beauty products', '💄'),
('Automotive', 'automotive', 'Car parts and automotive accessories', '🚗'),
('Baby & Kids', 'baby-kids', 'Baby and children products', '👶'),
('Gaming', 'gaming', 'Gaming consoles and accessories', '🎮'),
('Office Supplies', 'office-supplies', 'Office equipment and supplies', '🖥️')
ON CONFLICT (slug) DO NOTHING;
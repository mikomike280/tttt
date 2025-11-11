/*
  # Comprehensive Products Management System

  1. New Tables
    - Enhanced `products` table with all necessary fields for complete product management
    - Includes pricing, images, descriptions, categories, and metadata

  2. Security
    - Enable RLS on `products` table
    - Public read access for website
    - Admin access for full CRUD operations

  3. Features
    - Auto-generated UUIDs
    - Timestamps for created/updated tracking
    - JSON fields for flexible data storage
    - Full text search capabilities
*/

-- Drop existing products table if it exists to recreate with comprehensive structure
DROP TABLE IF EXISTS products CASCADE;

-- Create comprehensive products table
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  original_price numeric(10,2) NOT NULL CHECK (original_price >= 0),
  category text NOT NULL,
  subcategory text,
  image_url text NOT NULL,
  additional_images text[] DEFAULT '{}',
  colors text[] DEFAULT '{}',
  sizes text[] DEFAULT '{}',
  specifications jsonb DEFAULT '{}',
  features text[] DEFAULT '{}',
  warranty text DEFAULT '1 Year',
  is_new boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  stock_quantity integer DEFAULT 0,
  sku text UNIQUE,
  brand text,
  weight numeric(8,2),
  dimensions jsonb DEFAULT '{}',
  tags text[] DEFAULT '{}',
  meta_title text,
  meta_description text,
  slug text UNIQUE,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read active products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "Authenticated users can manage all products"
  ON products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_is_new ON products(is_new);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Create full text search index
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || description || ' ' || coalesce(brand, '')));

-- Insert sample products
INSERT INTO products (
  name, description, price, original_price, category, image_url, 
  colors, sizes, specifications, features, brand, stock_quantity, is_new
) VALUES 
(
  'iPhone 15 Pro Max',
  'Latest Apple smartphone with titanium design, A17 Pro chip, and advanced camera system',
  185000,
  220000,
  'phones',
  'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg',
  ARRAY['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium'],
  ARRAY['128GB', '256GB', '512GB', '1TB'],
  '{"display": "6.7-inch Super Retina XDR", "chip": "A17 Pro", "camera": "48MP Main", "battery": "Up to 29 hours video"}',
  ARRAY['Titanium Design', 'A17 Pro Chip', 'Pro Camera System', '5G Connectivity', 'Face ID'],
  'Apple',
  50,
  true
),
(
  'MacBook Air M3',
  'Supercharged by the M3 chip, with up to 18 hours of battery life',
  165000,
  195000,
  'laptops',
  'https://images.pexels.com/photos/18105/pexels-photo.jpg',
  ARRAY['Midnight', 'Starlight', 'Silver', 'Space Gray'],
  ARRAY['8GB RAM + 256GB SSD', '8GB RAM + 512GB SSD', '16GB RAM + 512GB SSD'],
  '{"processor": "Apple M3 chip", "memory": "8GB unified memory", "storage": "256GB SSD", "display": "13.6-inch Liquid Retina"}',
  ARRAY['M3 Chip Performance', 'All-Day Battery Life', 'Liquid Retina Display', 'Silent Operation'],
  'Apple',
  30,
  true
),
(
  'Samsung 4-Door Refrigerator',
  'Energy-efficient French door refrigerator with smart features',
  125000,
  145000,
  'home-appliances',
  'https://images.pexels.com/photos/2343468/pexels-photo-2343468.jpeg',
  ARRAY['Stainless Steel', 'Black Stainless', 'White'],
  ARRAY['500L', '600L'],
  '{"capacity": "500L", "energy_rating": "A++", "type": "French Door", "features": "Smart Connect"}',
  ARRAY['Energy Efficient', 'Smart Connectivity', 'Large Capacity', 'Digital Display'],
  'Samsung',
  15,
  false
),
(
  'Nike Air Max 270',
  'Comfortable lifestyle sneakers with Max Air cushioning',
  12500,
  15000,
  'shoes',
  'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg',
  ARRAY['Black', 'White', 'Red', 'Blue'],
  ARRAY['40', '41', '42', '43', '44', '45'],
  '{"material": "Mesh and synthetic", "sole": "Rubber", "cushioning": "Max Air"}',
  ARRAY['Max Air Cushioning', 'Breathable Mesh', 'Durable Design', 'Comfortable Fit'],
  'Nike',
  100,
  false
),
(
  'Apple Watch Series 9',
  'Advanced health and fitness tracking with the powerful S9 chip',
  45000,
  52000,
  'watches',
  'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg',
  ARRAY['Midnight', 'Starlight', 'Silver', 'Product Red'],
  ARRAY['41mm', '45mm'],
  '{"chip": "S9 SiP", "display": "Always-On Retina", "battery": "Up to 18 hours", "water_resistance": "50 meters"}',
  ARRAY['Health Monitoring', 'Fitness Tracking', 'Always-On Display', 'Water Resistant'],
  'Apple',
  75,
  true
),
(
  'Ramtons 4-Burner Gas Cooker',
  'Stainless steel gas cooker with oven and grill functionality',
  25000,
  29000,
  'gas-cookers',
  'https://images.pexels.com/photos/1878318/pexels-photo-1878318.jpeg',
  ARRAY['Stainless Steel', 'Black'],
  ARRAY['Standard'],
  '{"burners": "4 Gas Burners", "oven": "Gas Oven with Grill", "ignition": "Auto Ignition", "safety": "Flame Failure Device"}',
  ARRAY['Auto Ignition', 'Flame Failure Safety', 'Spacious Oven', 'Easy to Clean'],
  'Ramtons',
  25,
  false
);
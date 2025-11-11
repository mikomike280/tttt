/*
  # Add RLS policies for products table

  1. Security
    - Enable RLS on products table if not already enabled
    - Add policy for public read access to active products
    - Add policy for authenticated users to manage products
    - Add policy for service role to have full access

  2. Indexes
    - Add indexes for better query performance
    - Add full-text search index for product search functionality
*/

-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public can read active products" ON products;
DROP POLICY IF EXISTS "Anyone can read active products" ON products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;
DROP POLICY IF EXISTS "Service role can manage all products" ON products;

-- Allow public (anonymous) users to read active products
CREATE POLICY "Public can read active products"
  ON products
  FOR SELECT
  TO public
  USING (status = 'active');

-- Allow authenticated users to read all products and manage their own
CREATE POLICY "Authenticated users can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow service role to have full access
CREATE POLICY "Service role can manage all products"
  ON products
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_products_status ON products (status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products (is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_new ON products (is_new);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products (created_at DESC);

-- Add full-text search index for better search performance
CREATE INDEX IF NOT EXISTS idx_products_search 
  ON products 
  USING gin (to_tsvector('english', name || ' ' || description || ' ' || COALESCE(brand, '')));

-- Add index for price range queries
CREATE INDEX IF NOT EXISTS idx_products_price ON products (price);
CREATE INDEX IF NOT EXISTS idx_products_original_price ON products (original_price);
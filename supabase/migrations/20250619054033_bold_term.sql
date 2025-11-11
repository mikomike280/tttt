/*
  # Create products table for admin management

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `description` (text, required)
      - `price` (numeric, required)
      - `original_price` (numeric, required)
      - `category` (text, required)
      - `subcategory` (text, optional)
      - `image_url` (text, required)
      - `colors` (text array, optional)
      - `sizes` (text array, optional)
      - `specifications` (jsonb, optional)
      - `features` (text array, optional)
      - `warranty` (text, optional)
      - `is_new` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `products` table
    - Add policy for public read access
    - Add policy for authenticated users to manage products
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL,
  original_price numeric NOT NULL,
  category text NOT NULL,
  subcategory text,
  image_url text NOT NULL,
  colors text[],
  sizes text[],
  specifications jsonb DEFAULT '{}',
  features text[],
  warranty text DEFAULT '1 Year',
  is_new boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read products (for public website)
CREATE POLICY "Anyone can read products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated users to manage products (for admin)
CREATE POLICY "Authenticated users can manage products"
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
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
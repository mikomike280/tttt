/*
  # Create orders table

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `full_name` (text, required)
      - `phone_number` (text, required)
      - `email` (text, required)
      - `delivery_address` (text, required)
      - `product_name` (text, required)
      - `payment_method` (text, required)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `orders` table
    - Add policy for public insert access (for order submissions)
    - Add policy for authenticated users to read their own orders
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone_number text NOT NULL,
  email text NOT NULL,
  delivery_address text NOT NULL,
  product_name text NOT NULL,
  payment_method text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert orders (for public order submissions)
CREATE POLICY "Anyone can insert orders"
  ON orders
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow users to read their own orders if authenticated
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');
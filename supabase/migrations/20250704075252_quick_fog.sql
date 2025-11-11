/*
  # Add product condition field

  1. Changes
    - Add `condition` column to products table
    - Set default value to 'new'
    - Add check constraint for valid condition values
    - Update existing products with default condition

  2. Valid Conditions
    - 'new' - Brand new products
    - 'refurbished' - Refurbished products
    - 'x-uk' - UK imported products
    - 'x-us' - US imported products
*/

-- Add condition column to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'condition'
  ) THEN
    ALTER TABLE products ADD COLUMN condition text DEFAULT 'new' CHECK (condition IN ('new', 'refurbished', 'x-uk', 'x-us'));
  END IF;
END $$;

-- Update existing products to have 'new' condition if not set
UPDATE products SET condition = 'new' WHERE condition IS NULL;

-- Add index for condition filtering
CREATE INDEX IF NOT EXISTS idx_products_condition ON products(condition);

-- Update some sample products with different conditions for demonstration
UPDATE products SET condition = 'refurbished' WHERE name LIKE '%MacBook%' AND price < original_price * 0.8;
UPDATE products SET condition = 'x-uk' WHERE name LIKE '%iPhone%' AND brand = 'Apple';
UPDATE products SET condition = 'x-us' WHERE name LIKE '%Samsung%' AND category = 'tv-audio';
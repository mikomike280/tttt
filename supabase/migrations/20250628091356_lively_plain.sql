/*
  # Create M-Pesa transactions table

  1. New Tables
    - `mpesa_transactions`
      - `id` (uuid, primary key)
      - `checkout_request_id` (text, unique, required)
      - `merchant_request_id` (text, required)
      - `phone_number` (text, required)
      - `amount` (numeric, required)
      - `account_reference` (text, required)
      - `transaction_desc` (text, required)
      - `mpesa_receipt_number` (text, optional)
      - `transaction_date` (text, optional)
      - `status` (text, default 'pending')
      - `result_code` (integer, optional)
      - `result_desc` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `mpesa_transactions` table
    - Add policy for service role access
    - Add policy for authenticated users to read their own transactions

  3. Indexes
    - Index on checkout_request_id for fast lookups
    - Index on phone_number for customer queries
    - Index on status for filtering
*/

CREATE TABLE IF NOT EXISTS mpesa_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_request_id text UNIQUE NOT NULL,
  merchant_request_id text NOT NULL,
  phone_number text NOT NULL,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  account_reference text NOT NULL,
  transaction_desc text NOT NULL,
  mpesa_receipt_number text,
  transaction_date text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  result_code integer,
  result_desc text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE mpesa_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Service role can manage all transactions"
  ON mpesa_transactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read their own transactions"
  ON mpesa_transactions
  FOR SELECT
  TO authenticated
  USING (phone_number = auth.jwt() ->> 'phone');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mpesa_checkout_request_id ON mpesa_transactions(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_phone_number ON mpesa_transactions(phone_number);
CREATE INDEX IF NOT EXISTS idx_mpesa_status ON mpesa_transactions(status);
CREATE INDEX IF NOT EXISTS idx_mpesa_created_at ON mpesa_transactions(created_at DESC);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_mpesa_transactions_updated_at
    BEFORE UPDATE ON mpesa_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add amount column to orders table for M-Pesa integration
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN amount numeric(10,2);
  END IF;
END $$;

-- Add M-Pesa receipt number to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'mpesa_receipt_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN mpesa_receipt_number text;
  END IF;
END $$;

-- Add status column to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'status'
  ) THEN
    ALTER TABLE orders ADD COLUMN status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'));
  END IF;
END $$;
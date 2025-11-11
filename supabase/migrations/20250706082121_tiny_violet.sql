/*
  # Create Database Webhook for Order Email Notifications

  1. Database Trigger Function
    - Creates a function that will be called when new orders are inserted
    - Sends HTTP request to our Edge Function
    - Handles errors gracefully

  2. Trigger Setup
    - Triggers on INSERT to orders table
    - Calls the webhook function automatically
    - Passes the new order data as JSON

  3. Security
    - Uses service role for HTTP requests
    - Includes error handling and logging
*/

-- Create function to send webhook when new order is inserted
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url text;
  payload jsonb;
  response_status int;
BEGIN
  -- Construct the webhook URL (replace with your actual Supabase project URL)
  webhook_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/order-email-webhook';
  
  -- If the setting doesn't exist, use a default pattern
  IF webhook_url IS NULL OR webhook_url = '/functions/v1/order-email-webhook' THEN
    webhook_url := 'https://mholriycnpbkdaxlmmby.supabase.co/functions/v1/order-email-webhook';
  END IF;

  -- Create payload with order data
  payload := jsonb_build_object(
    'type', 'INSERT',
    'table', 'orders',
    'record', row_to_json(NEW),
    'schema', 'public'
  );

  -- Log the webhook attempt
  RAISE LOG 'Sending order webhook to: % with payload: %', webhook_url, payload;

  -- Send HTTP POST request to the webhook
  BEGIN
    SELECT status INTO response_status
    FROM http((
      'POST',
      webhook_url,
      ARRAY[
        http_header('Content-Type', 'application/json'),
        http_header('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true))
      ],
      'application/json',
      payload::text
    )::http_request);

    -- Log success
    RAISE LOG 'Webhook sent successfully with status: %', response_status;
    
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the insert
    RAISE LOG 'Failed to send webhook: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires after INSERT on orders table
DROP TRIGGER IF EXISTS trigger_new_order_webhook ON orders;
CREATE TRIGGER trigger_new_order_webhook
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION notify_new_order() TO service_role;
GRANT EXECUTE ON FUNCTION notify_new_order() TO postgres;

-- Create settings for webhook configuration (optional, for easier management)
-- You can update these values as needed
DO $$
BEGIN
  -- Set Supabase URL setting
  PERFORM set_config('app.settings.supabase_url', 'https://mholriycnpbkdaxlmmby.supabase.co', false);
  
  -- Note: Service role key should be set via environment variables for security
  -- This is just a placeholder - the actual key should come from Supabase environment
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Could not set configuration: %', SQLERRM;
END $$;
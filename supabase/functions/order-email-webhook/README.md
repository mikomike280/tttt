# Order Email Webhook

This Edge Function automatically sends email notifications when new orders are placed.

## Setup Instructions

### 1. Deploy the Edge Function

```bash
# Deploy the function to Supabase
supabase functions deploy order-email-webhook
```

### 2. Set Environment Variables

In your Supabase dashboard, go to Settings > Edge Functions and add:

```
RESEND_API_KEY=re_MaLQXQaM_4pq3buuiGhKm8K4LevV4FNvS
```

### 3. Configure Database Webhook

The migration file will automatically create a database trigger that calls this function when new orders are inserted.

### 4. Verify Email Domain

Make sure `technologieslifetime@gmail.com` is verified in your Resend account as a sending domain.

## How It Works

1. When a new row is inserted into the `orders` table
2. A database trigger automatically calls this Edge Function
3. The function extracts order details and sends a formatted email
4. Email is sent from and to `technologieslifetime@gmail.com`

## Email Content

The email includes:
- Customer name
- Order ID
- Total amount
- Order number (if available)
- Customer contact details
- Product information
- Timestamp

## Testing

You can test the webhook by inserting a new order:

```sql
INSERT INTO orders (full_name, phone_number, email, product_name, total_amount)
VALUES ('Test Customer', '+254712345678', 'test@example.com', 'Test Product', 15000);
```

## Troubleshooting

1. Check Supabase function logs for any errors
2. Verify Resend API key is correct
3. Ensure email domain is verified in Resend
4. Check that the database trigger is properly created
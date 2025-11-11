# M-Pesa STK Push Integration Guide

## 🚀 Complete M-Pesa Payment Integration for Lifetime Technology

This implementation provides a complete M-Pesa STK Push integration with the following features:

### ✅ **Features Implemented**

1. **Frontend Payment Form**
   - Clean, responsive M-Pesa payment modal
   - Phone number validation and formatting
   - Real-time payment status updates
   - Success/failure handling with user feedback

2. **Backend API (Supabase Edge Functions)**
   - STK Push initiation (`mpesa-stk-push`)
   - Payment callback handler (`mpesa-callback`)
   - Payment status checker (`mpesa-status`)

3. **Database Integration**
   - Transaction logging in Supabase
   - Order creation on successful payment
   - Real-time status updates

4. **Admin Dashboard**
   - Transaction monitoring and management
   - Export functionality (CSV)
   - Real-time statistics
   - Transaction detail views

### 🔧 **Setup Instructions**

#### 1. **Safaricom Daraja API Setup**

1. **Register at Safaricom Developer Portal**
   - Go to [https://developer.safaricom.co.ke](https://developer.safaricom.co.ke)
   - Create an account and verify your email
   - Create a new app to get Consumer Key and Consumer Secret

2. **Get Your Credentials**
   ```
   Consumer Key: Your_Consumer_Key
   Consumer Secret: Your_Consumer_Secret
   Business Short Code: 174379 (for sandbox)
   Passkey: Your_Passkey (provided by Safaricom)
   ```

3. **Test Credentials (Sandbox)**
   ```
   Consumer Key: dpkJWBKgOqcVGGWVoElb9w7XjqeK3GP1
   Consumer Secret: 2UgqhLgVGGWVoElb9w7XjqeK3GP1
   Business Short Code: 174379
   Passkey: bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
   ```

#### 2. **Environment Variables**

Create a `.env` file in your project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# M-Pesa Daraja API Configuration
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=your_mpesa_passkey
MPESA_CALLBACK_URL=https://your-domain.com/functions/v1/mpesa-callback
MPESA_ENVIRONMENT=sandbox
```

#### 3. **Deploy Supabase Edge Functions**

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy edge functions
supabase functions deploy mpesa-stk-push
supabase functions deploy mpesa-callback
supabase functions deploy mpesa-status

# Set environment variables
supabase secrets set MPESA_CONSUMER_KEY=your_key
supabase secrets set MPESA_CONSUMER_SECRET=your_secret
supabase secrets set MPESA_BUSINESS_SHORTCODE=174379
supabase secrets set MPESA_PASSKEY=your_passkey
supabase secrets set MPESA_CALLBACK_URL=https://your-domain.com/functions/v1/mpesa-callback
supabase secrets set MPESA_ENVIRONMENT=sandbox
```

#### 4. **Database Migration**

Run the migration to create the M-Pesa transactions table:

```sql
-- This is already included in the migration file
-- supabase/migrations/20250628120000_mpesa_transactions.sql
```

### 📱 **User Flow**

1. **Customer initiates payment**
   - Selects M-Pesa as payment method
   - Enters phone number (254XXXXXXXXX format)
   - Clicks "Pay with M-Pesa"

2. **STK Push sent**
   - Backend validates phone number and amount
   - Generates access token from Safaricom
   - Sends STK Push request
   - Stores transaction in database

3. **Customer completes payment**
   - Receives M-Pesa prompt on phone
   - Enters M-Pesa PIN
   - Payment processed by Safaricom

4. **Callback processing**
   - Safaricom sends callback to your server
   - Transaction status updated in database
   - Order created if payment successful

5. **Frontend updates**
   - Real-time status polling
   - Success/failure notification
   - Automatic redirect on completion

### 🔒 **Security Features**

- **Input validation** for phone numbers and amounts
- **Rate limiting** to prevent abuse
- **Secure token generation** using OAuth2
- **Encrypted communication** with Safaricom APIs
- **Database security** with Row Level Security (RLS)
- **Error handling** with proper logging

### 📊 **Admin Features**

- **Real-time dashboard** showing transaction statistics
- **Transaction filtering** by status, date, phone number
- **Export functionality** for accounting and reporting
- **Detailed transaction views** with all M-Pesa data
- **Revenue tracking** and analytics

### 🧪 **Testing**

#### Sandbox Testing
1. Use test phone numbers: `254708374149`, `254711XXXXXX`
2. Use test amounts: Any amount between 1-70000
3. Test scenarios:
   - Successful payment
   - User cancellation
   - Insufficient funds
   - Invalid phone number

#### Production Testing
1. Use real phone numbers registered with M-Pesa
2. Start with small amounts for testing
3. Monitor callback responses
4. Verify transaction records in admin dashboard

### 🚨 **Important Notes**

1. **Callback URL must be HTTPS** in production
2. **Phone numbers must be in 254XXXXXXXXX format**
3. **Amount limits**: KSh 1 - KSh 70,000 per transaction
4. **Timeout**: STK Push expires after 30 seconds
5. **Rate limits**: Safaricom has API rate limits
6. **Webhook reliability**: Implement proper retry mechanisms

### 📞 **Support**

For M-Pesa integration support:
- **Safaricom Developer Support**: [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
- **Documentation**: [developer.safaricom.co.ke/docs](https://developer.safaricom.co.ke/docs)
- **Test Environment**: Available 24/7
- **Production Support**: Business hours

### 🎯 **Next Steps**

1. **Test thoroughly** in sandbox environment
2. **Apply for production** access from Safaricom
3. **Update environment** variables for production
4. **Monitor transactions** using the admin dashboard
5. **Implement additional features** like refunds, recurring payments

This implementation provides a production-ready M-Pesa integration that's secure, scalable, and user-friendly! 🚀
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// M-Pesa API Configuration
const MPESA_CONFIG = {
  consumerKey: Deno.env.get('MPESA_CONSUMER_KEY') || '',
  consumerSecret: Deno.env.get('MPESA_CONSUMER_SECRET') || '',
  businessShortCode: Deno.env.get('MPESA_BUSINESS_SHORTCODE') || '174379',
  passkey: Deno.env.get('MPESA_PASSKEY') || '',
  callbackUrl: Deno.env.get('MPESA_CALLBACK_URL') || 'https://your-domain.com/api/mpesa/callback',
  environment: Deno.env.get('MPESA_ENVIRONMENT') || 'sandbox', // 'sandbox' or 'production'
}

const MPESA_URLS = {
  sandbox: {
    oauth: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    stkPush: 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
  },
  production: {
    oauth: 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    stkPush: 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
  }
}

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface STKPushRequest {
  phoneNumber: string
  amount: number
  productName: string
  accountReference: string
  transactionDesc: string
}

// Generate M-Pesa access token
async function generateAccessToken(): Promise<string> {
  const auth = btoa(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`)
  const url = MPESA_URLS[MPESA_CONFIG.environment as keyof typeof MPESA_URLS].oauth
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to generate access token')
  }

  const data = await response.json()
  return data.access_token
}

// Generate password for STK Push
function generatePassword(): string {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3)
  const password = btoa(`${MPESA_CONFIG.businessShortCode}${MPESA_CONFIG.passkey}${timestamp}`)
  return password
}

// Get current timestamp
function getTimestamp(): string {
  return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3)
}

// Initiate STK Push
async function initiateSTKPush(request: STKPushRequest) {
  try {
    const accessToken = await generateAccessToken()
    const timestamp = getTimestamp()
    const password = generatePassword()
    
    const url = MPESA_URLS[MPESA_CONFIG.environment as keyof typeof MPESA_URLS].stkPush
    
    const payload = {
      BusinessShortCode: MPESA_CONFIG.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: request.amount,
      PartyA: request.phoneNumber,
      PartyB: MPESA_CONFIG.businessShortCode,
      PhoneNumber: request.phoneNumber,
      CallBackURL: MPESA_CONFIG.callbackUrl,
      AccountReference: request.accountReference,
      TransactionDesc: request.transactionDesc
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    
    if (response.ok && data.ResponseCode === '0') {
      // Store transaction in database
      const { error } = await supabase
        .from('mpesa_transactions')
        .insert({
          checkout_request_id: data.CheckoutRequestID,
          merchant_request_id: data.MerchantRequestID,
          phone_number: request.phoneNumber,
          amount: request.amount,
          account_reference: request.accountReference,
          transaction_desc: request.transactionDesc,
          status: 'pending',
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Database error:', error)
      }

      return {
        success: true,
        message: 'STK Push sent successfully',
        checkoutRequestId: data.CheckoutRequestID,
        merchantRequestId: data.MerchantRequestID
      }
    } else {
      throw new Error(data.errorMessage || 'STK Push failed')
    }
  } catch (error) {
    console.error('STK Push error:', error)
    throw error
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phoneNumber, amount, productName, accountReference, transactionDesc }: STKPushRequest = await req.json()

    // Validate input
    if (!phoneNumber || !amount || !productName) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate phone number format
    const phoneRegex = /^254[0-9]{9}$/
    if (!phoneRegex.test(phoneNumber)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid phone number format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate amount
    if (amount < 1 || amount > 70000) {
      return new Response(
        JSON.stringify({ success: false, message: 'Amount must be between KSh 1 and KSh 70,000' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const result = await initiateSTKPush({
      phoneNumber,
      amount,
      productName,
      accountReference: accountReference || `LT-${Date.now()}`,
      transactionDesc: transactionDesc || `Payment for ${productName}`
    })

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
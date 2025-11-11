import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface CallbackData {
  Body: {
    stkCallback: {
      MerchantRequestID: string
      CheckoutRequestID: string
      ResultCode: number
      ResultDesc: string
      CallbackMetadata?: {
        Item: Array<{
          Name: string
          Value: string | number
        }>
      }
    }
  }
}

// Function to send order email
async function sendOrderEmail(orderData: any) {
  try {
    const emailData = {
      customerName: orderData.full_name || 'M-Pesa Customer',
      phoneNumber: orderData.phone_number,
      email: orderData.email || 'mpesa@customer.com',
      totalAmount: orderData.amount,
      items: [{
        name: orderData.product_name || orderData.transaction_desc,
        quantity: 1,
        price: orderData.amount
      }],
      deliveryAddress: orderData.delivery_address || 'To be provided',
      paymentMethod: 'M-Pesa',
      orderNumber: orderData.order_number,
      mpesaReceiptNumber: orderData.mpesa_receipt_number
    };

    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-order-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      console.error('Failed to send order email');
    } else {
      console.log('Order email sent successfully');
    }
  } catch (error) {
    console.error('Error sending order email:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const callbackData: CallbackData = await req.json()
    const { stkCallback } = callbackData.Body

    console.log('M-Pesa Callback received:', JSON.stringify(stkCallback, null, 2))

    const checkoutRequestId = stkCallback.CheckoutRequestID
    const merchantRequestId = stkCallback.MerchantRequestID
    const resultCode = stkCallback.ResultCode
    const resultDesc = stkCallback.ResultDesc

    let transactionData: any = {
      status: resultCode === 0 ? 'completed' : 'failed',
      result_code: resultCode,
      result_desc: resultDesc,
      updated_at: new Date().toISOString()
    }

    // If payment was successful, extract transaction details
    if (resultCode === 0 && stkCallback.CallbackMetadata) {
      const metadata = stkCallback.CallbackMetadata.Item
      
      const getMetadataValue = (name: string) => {
        const item = metadata.find(item => item.Name === name)
        return item ? item.Value : null
      }

      transactionData = {
        ...transactionData,
        mpesa_receipt_number: getMetadataValue('MpesaReceiptNumber'),
        transaction_date: getMetadataValue('TransactionDate'),
        phone_number: getMetadataValue('PhoneNumber'),
        amount: getMetadataValue('Amount'),
      }
    }

    // Update transaction in database
    const { error } = await supabase
      .from('mpesa_transactions')
      .update(transactionData)
      .eq('checkout_request_id', checkoutRequestId)

    if (error) {
      console.error('Database update error:', error)
      return new Response(
        JSON.stringify({ success: false, message: 'Database update failed' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // If payment was successful, create order record and send email
    if (resultCode === 0) {
      // Get the transaction details to create order
      const { data: transaction } = await supabase
        .from('mpesa_transactions')
        .select('*')
        .eq('checkout_request_id', checkoutRequestId)
        .single()

      if (transaction) {
        // Create order record
        const orderData = {
          full_name: 'M-Pesa Customer', // You might want to collect this during payment
          phone_number: transaction.phone_number,
          email: 'mpesa@customer.com', // You might want to collect this during payment
          delivery_address: 'To be provided', // You might want to collect this during payment
          product_name: transaction.transaction_desc,
          payment_method: 'M-Pesa',
          amount: transaction.amount,
          mpesa_receipt_number: transactionData.mpesa_receipt_number,
          status: 'paid',
          created_at: new Date().toISOString()
        }

        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert(orderData)
          .select()
          .single()

        if (orderError) {
          console.error('Order creation error:', orderError)
        } else {
          // Send order email notification
          await sendOrderEmail({
            ...orderData,
            order_number: order.order_number
          })
        }
      }
    }

    // Respond to Safaricom
    return new Response(
      JSON.stringify({ 
        ResultCode: 0,
        ResultDesc: "Callback received successfully"
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Callback processing error:', error)
    return new Response(
      JSON.stringify({ 
        ResultCode: 1,
        ResultDesc: "Callback processing failed"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
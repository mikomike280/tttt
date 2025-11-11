import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface OrderData {
  id: string
  customer_name?: string
  full_name?: string
  total_amount?: number
  amount?: number
  phone_number?: string
  email?: string
  product_name?: string
  order_number?: string
  created_at?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the webhook payload
    const payload = await req.json()
    console.log('Webhook payload received:', JSON.stringify(payload, null, 2))

    // Extract order data from the webhook payload
    const orderData: OrderData = payload.record || payload

    // Extract customer name (try different possible column names)
    const customerName = orderData.customer_name || orderData.full_name || 'Unknown Customer'
    
    // Extract order ID
    const orderId = orderData.id || 'Unknown ID'
    
    // Extract total amount (try different possible column names)
    const totalAmount = orderData.total_amount || orderData.amount || 0

    // Your Resend API key
    const resendApiKey = 're_MaLQXQaM_4pq3buuiGhKm8K4LevV4FNvS'

    // Create email content
    const emailData = {
      from: 'you@onresend.com',
      to: ['technologieslifetime@gmail.com'],
      subject: '🛒 New Order Placed on Lifetime Technologies',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Order Notification</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0; 
              padding: 0; 
              background-color: #f4f4f4;
            }
            .container { 
              max-width: 600px; 
              margin: 20px auto; 
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #006B3C 0%, #004d2a 100%); 
              color: white; 
              padding: 30px; 
              text-align: center; 
            }
            .content { 
              padding: 30px; 
            }
            .order-details { 
              background: #f8f9fa; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0; 
              border-left: 4px solid #006B3C;
            }
            .highlight { 
              color: #006B3C; 
              font-weight: bold; 
              font-size: 1.2em;
            }
            .footer { 
              text-align: center; 
              padding: 20px; 
              background: #f8f9fa; 
              color: #666; 
              font-size: 14px; 
            }
            .badge {
              background: #006B3C;
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🛒 New Order Alert!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Lifetime Technology Kenya</p>
            </div>
            
            <div class="content">
              <h2 style="color: #006B3C; margin-top: 0;">Order Details</h2>
              
              <div class="order-details">
                <p><strong>Customer Name:</strong> <span class="highlight">${customerName}</span></p>
                <p><strong>Order ID:</strong> <span class="highlight">${orderId}</span></p>
                <p><strong>Total Amount:</strong> <span class="highlight">KSh ${Number(totalAmount).toLocaleString()}</span></p>
                ${orderData.order_number ? `<p><strong>Order Number:</strong> <span class="highlight">${orderData.order_number}</span></p>` : ''}
                ${orderData.phone_number ? `<p><strong>Phone:</strong> ${orderData.phone_number}</p>` : ''}
                ${orderData.email ? `<p><strong>Email:</strong> ${orderData.email}</p>` : ''}
                ${orderData.product_name ? `<p><strong>Product:</strong> ${orderData.product_name}</p>` : ''}
                <p><strong>Order Time:</strong> ${new Date(orderData.created_at || new Date()).toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}</p>
              </div>

              <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #006B3C; margin-top: 0;">⚡ Action Required</h3>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>Contact customer to confirm order details</li>
                  <li>Verify product availability</li>
                  <li>Arrange delivery logistics</li>
                  <li>Update order status in admin panel</li>
                </ul>
              </div>
            </div>

            <div class="footer">
              <p><span class="badge">AUTOMATED NOTIFICATION</span></p>
              <p>This email was automatically generated when a new order was placed.</p>
              <p>© 2024 Lifetime Technology Kenya - Kenya's Premier Tech Store</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        🛒 NEW ORDER PLACED ON LIFETIME TECHNOLOGIES

        Customer Name: ${customerName}
        Order ID: ${orderId}
        Total Amount: KSh ${Number(totalAmount).toLocaleString()}
        ${orderData.order_number ? `Order Number: ${orderData.order_number}` : ''}
        ${orderData.phone_number ? `Phone: ${orderData.phone_number}` : ''}
        ${orderData.email ? `Email: ${orderData.email}` : ''}
        ${orderData.product_name ? `Product: ${orderData.product_name}` : ''}
        Order Time: ${new Date(orderData.created_at || new Date()).toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}

        Action Required:
        - Contact customer to confirm order details
        - Verify product availability
        - Arrange delivery logistics
        - Update order status in admin panel

        This is an automated notification from Lifetime Technology Kenya.
      `
    }

    console.log('Sending email with data:', JSON.stringify(emailData, null, 2))

    // Send email using Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    const emailResult = await emailResponse.json()

    if (!emailResponse.ok) {
      console.error('Resend API error:', emailResult)
      throw new Error(`Failed to send email: ${emailResult.message || 'Unknown error'}`)
    }

    console.log('Email sent successfully:', emailResult.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Order notification email sent successfully',
        emailId: emailResult.id,
        orderData: {
          customerName,
          orderId,
          totalAmount
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in order email webhook:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to process webhook',
        error: error instanceof Error ? error.stack : String(error)
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
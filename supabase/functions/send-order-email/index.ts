import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface OrderEmailData {
  customerName: string
  phoneNumber: string
  email: string
  totalAmount: number
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  deliveryAddress?: string
  paymentMethod: string
  orderNumber?: string
  mpesaReceiptNumber?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const orderData: OrderEmailData = await req.json()
    
    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('re_MaLQXQaM_4pq3buuiGhKm8K4LevV4FNvS')
    if (!resendApiKey) {
      throw new Error('re_MaLQXQaM_4pq3buuiGhKm8K4LevV4FNvS')
    }

    // Format items list for email
    const itemsList = orderData.items.map(item => 
      `<li style="margin-bottom: 8px;">
        <strong>${item.name}</strong><br>
        Quantity: ${item.quantity} × KSh ${item.price.toLocaleString()} = KSh ${(item.quantity * item.price).toLocaleString()}
      </li>`
    ).join('')

    // Create HTML email content
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order Received</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0a0a0a 0%, #2d2d2d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .customer-info { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .items-list { background: #f3e5f5; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .total-amount { background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        h1 { margin: 0; font-size: 28px; }
        h2 { color: #0a0a0a; margin-top: 0; }
        h3 { color: #333; margin-bottom: 10px; }
        ul { margin: 0; padding-left: 20px; }
        .highlight { color: #006B3C; font-weight: bold; }
        .badge { background: #006B3C; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 New Order Received!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Lifetime Technology Kenya</p>
        </div>
        
        <div class="content">
          <div class="order-details">
            <h2>📋 Order Summary</h2>
            ${orderData.orderNumber ? `<p><strong>Order Number:</strong> <span class="highlight">${orderData.orderNumber}</span></p>` : ''}
            <p><strong>Date:</strong> ${new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}</p>
            ${orderData.mpesaReceiptNumber ? `<p><strong>M-Pesa Receipt:</strong> <span class="highlight">${orderData.mpesaReceiptNumber}</span></p>` : ''}
          </div>

          <div class="customer-info">
            <h3>👤 Customer Information</h3>
            <p><strong>Name:</strong> ${orderData.customerName}</p>
            <p><strong>Phone:</strong> <a href="tel:${orderData.phoneNumber}">${orderData.phoneNumber}</a></p>
            <p><strong>Email:</strong> <a href="mailto:${orderData.email}">${orderData.email}</a></p>
            ${orderData.deliveryAddress ? `<p><strong>Delivery Address:</strong><br>${orderData.deliveryAddress}</p>` : ''}
          </div>

          <div class="items-list">
            <h3>🛍️ Order Items</h3>
            <ul style="list-style: none; padding: 0;">
              ${itemsList}
            </ul>
          </div>

          <div class="total-amount">
            <h3>💰 Payment Details</h3>
            <p><strong>Payment Method:</strong> <span class="badge">${orderData.paymentMethod}</span></p>
            <p style="font-size: 24px; margin: 15px 0;"><strong>Total Amount: <span class="highlight">KSh ${orderData.totalAmount.toLocaleString()}</span></strong></p>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">⚡ Next Steps</h3>
            <ul style="color: #856404; margin: 0;">
              <li>Contact customer to confirm order details</li>
              <li>Verify product availability</li>
              <li>Arrange delivery logistics</li>
              <li>Update order status in admin panel</li>
            </ul>
          </div>
        </div>

        <div class="footer">
          <p>This email was automatically generated by the Lifetime Technology Kenya order system.</p>
          <p>📧 <strong>Admin Panel:</strong> <a href="https://your-domain.com/admin.html">Manage Orders</a></p>
          <p>© 2024 Lifetime Technology Kenya - Kenya's Premier Tech Store</p>
        </div>
      </div>
    </body>
    </html>
    `

    // Send email using Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: ['technologieslifetime@gmail.com'],
        subject: `🛒 New Order Received - ${orderData.orderNumber || 'Order'} - KSh ${orderData.totalAmount.toLocaleString()}`,
        html: htmlContent,
      }),
    })

    const emailResult = await emailResponse.json()

    if (!emailResponse.ok) {
      console.error('Resend API error:', emailResult)
      throw new Error(`Failed to send email: ${emailResult.message || 'Unknown error'}`)
    }

    console.log('Order email sent successfully:', emailResult.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Order email sent successfully',
        emailId: emailResult.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error sending order email:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to send email' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
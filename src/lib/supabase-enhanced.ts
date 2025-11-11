import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Enhanced Database types for the new structure
export interface Customer {
  id?: string
  full_name: string
  phone_number: string
  email: string
  delivery_addresses?: any[]
  notes?: string
  total_orders?: number
  total_spent?: number
  created_at?: string
  updated_at?: string
}

export interface ProductCategory {
  id?: string
  name: string
  slug: string
  description?: string
  icon?: string
  image_url?: string
  parent_id?: string
  sort_order?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface DeliveryZone {
  id?: string
  name: string
  counties: string[]
  delivery_fee: number
  estimated_days: number
  is_active?: boolean
  created_at?: string
}

export interface OrderItem {
  id?: string
  order_id: string
  product_id: string
  product_name: string
  product_image?: string
  quantity: number
  unit_price: number
  total_price: number
  product_options?: any
  created_at?: string
}

export interface EnhancedOrder {
  id?: string
  customer_id?: string
  order_number?: string
  full_name: string
  phone_number: string
  email: string
  delivery_address: string
  subtotal?: number
  delivery_fee?: number
  total_amount?: number
  delivery_zone_id?: string
  payment_method: string
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'paid'
  estimated_delivery_date?: string
  actual_delivery_date?: string
  notes?: string
  created_at?: string
  updated_at?: string
  
  // Relations
  customer?: Customer
  order_items?: OrderItem[]
  delivery_zone?: DeliveryZone
}

export interface OrderTracking {
  id?: string
  order_id: string
  status: string
  notes?: string
  created_by?: string
  created_at?: string
}

export interface CartItem {
  product_id: string
  product_name: string
  product_image: string
  unit_price: number
  quantity: number
  options?: {
    color?: string
    size?: string
    [key: string]: any
  }
}

// Enhanced Order Management
export class EnhancedOrderManager {
  // Create customer or get existing
  static async createOrGetCustomer(customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    // First try to find existing customer by phone or email
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('*')
      .or(`phone_number.eq.${customerData.phone_number},email.eq.${customerData.email}`)
      .single()

    if (existingCustomer) {
      // Update existing customer info
      const { data: updatedCustomer, error } = await supabase
        .from('customers')
        .update({
          full_name: customerData.full_name,
          email: customerData.email,
          phone_number: customerData.phone_number
        })
        .eq('id', existingCustomer.id)
        .select()
        .single()

      if (error) throw error
      return updatedCustomer
    }

    // Create new customer
    const { data: newCustomer, error } = await supabase
      .from('customers')
      .insert([customerData])
      .select()
      .single()

    if (error) throw error
    return newCustomer
  }

  // Create order with multiple items
  static async createOrderWithItems(
    orderData: Omit<EnhancedOrder, 'id' | 'created_at' | 'updated_at' | 'order_number'>,
    cartItems: CartItem[]
  ): Promise<EnhancedOrder> {
    try {
      // Start transaction-like operations
      
      // 1. Create or get customer
      const customer = await this.createOrGetCustomer({
        full_name: orderData.full_name,
        phone_number: orderData.phone_number,
        email: orderData.email
      })

      // 2. Calculate totals
      const subtotal = cartItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
      
      // 3. Get delivery zone and fee
      const deliveryZone = await this.getDeliveryZoneByAddress(orderData.delivery_address)
      const deliveryFee = deliveryZone?.delivery_fee || 0
      const totalAmount = subtotal + deliveryFee

      // 4. Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          ...orderData,
          customer_id: customer.id,
          subtotal,
          delivery_fee: deliveryFee,
          total_amount: totalAmount,
          delivery_zone_id: deliveryZone?.id,
          status: 'pending'
        }])
        .select()
        .single()

      if (orderError) throw orderError

      // 5. Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity,
        product_options: item.options || {}
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // 6. Update customer stats
      await supabase
        .from('customers')
        .update({
          total_orders: (customer.total_orders || 0) + 1,
          total_spent: (customer.total_spent || 0) + totalAmount
        })
        .eq('id', customer.id)

      return order
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  }

  // Get delivery zone by address (simple matching)
  static async getDeliveryZoneByAddress(address: string): Promise<DeliveryZone | null> {
    const { data: zones } = await supabase
      .from('delivery_zones')
      .select('*')
      .eq('is_active', true)

    if (!zones) return null

    // Simple county matching - in production, you'd want more sophisticated matching
    const addressLower = address.toLowerCase()
    
    for (const zone of zones) {
      for (const county of zone.counties) {
        if (addressLower.includes(county.toLowerCase())) {
          return zone
        }
      }
    }

    // Default to Nairobi if no match found
    return zones.find(z => z.name === 'Nairobi Metro') || zones[0]
  }

  // Get all delivery zones
  static async getDeliveryZones(): Promise<DeliveryZone[]> {
    const { data, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .eq('is_active', true)
      .order('delivery_fee')

    if (error) throw error
    return data || []
  }

  // Get order with full details
  static async getOrderWithDetails(orderId: string): Promise<EnhancedOrder | null> {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        order_items(*),
        delivery_zone:delivery_zones(*)
      `)
      .eq('id', orderId)
      .single()

    if (error) {
      console.error('Error fetching order details:', error)
      return null
    }

    return order
  }

  // Get all orders with details
  static async getAllOrdersWithDetails(): Promise<EnhancedOrder[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        order_items(*),
        delivery_zone:delivery_zones(*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      throw error
    }

    return data || []
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: string, notes?: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (error) throw error

    // Add manual tracking entry if notes provided
    if (notes) {
      await supabase
        .from('order_tracking')
        .insert([{
          order_id: orderId,
          status,
          notes,
          created_by: 'admin'
        }])
    }
  }

  // Get order tracking history
  static async getOrderTracking(orderId: string): Promise<OrderTracking[]> {
    const { data, error } = await supabase
      .from('order_tracking')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  }

  // Get customer orders
  static async getCustomerOrders(customerId: string): Promise<EnhancedOrder[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*),
        delivery_zone:delivery_zones(*)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Search orders
  static async searchOrders(query: string): Promise<EnhancedOrder[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        order_items(*),
        delivery_zone:delivery_zones(*)
      `)
      .or(`order_number.ilike.%${query}%,full_name.ilike.%${query}%,phone_number.ilike.%${query}%,email.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Get order statistics
  static async getOrderStatistics() {
    const { data: orders } = await supabase
      .from('orders')
      .select('status, total_amount, created_at')

    if (!orders) return {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      completedOrders: 0,
      todayOrders: 0,
      thisMonthRevenue: 0
    }

    const today = new Date().toISOString().split('T')[0]
    const thisMonth = new Date().toISOString().slice(0, 7)

    return {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0),
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      completedOrders: orders.filter(o => ['delivered', 'paid'].includes(o.status)).length,
      todayOrders: orders.filter(o => o.created_at?.startsWith(today)).length,
      thisMonthRevenue: orders
        .filter(o => o.created_at?.startsWith(thisMonth))
        .reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0)
    }
  }
}

// Product Category Management
export class CategoryManager {
  static async getAllCategories(): Promise<ProductCategory[]> {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')

    if (error) throw error
    return data || []
  }

  static async getCategoryBySlug(slug: string): Promise<ProductCategory | null> {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) return null
    return data
  }
}
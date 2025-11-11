import { createClient } from '@supabase/supabase-js'

// Use hardcoded values as fallbacks for Netlify deployment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mholriycnpbkdaxlmmby.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ob2xyaXljbnBia2RheGxtbWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDQxMjMsImV4cCI6MjA2NTgyMDEyM30.PO3kDxJru16MWBBJyNPhA9mp3hWV0DTIhrNvdcGxogg'

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Enhanced Database types
export interface Order {
  id?: string
  full_name: string
  phone_number: string
  email: string
  delivery_address: string
  product_name: string
  payment_method: string
  amount?: number
  mpesa_receipt_number?: string
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'paid'
  order_number?: string
  notes?: string
  delivery_date?: string
  created_at?: string
  updated_at?: string
}

// Order management functions
export class OrderManager {
  // Get all orders
  static async getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      throw error
    }

    return data || []
  }

  // Get orders by status
  static async getOrdersByStatus(status: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders by status:', error)
      throw error
    }

    return data || []
  }

  // Get single order
  static async getOrderById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching order:', error)
      return null
    }

    return data
  }

  // Create new order
  static async createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'order_number'>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single()

    if (error) {
      console.error('Error creating order:', error)
      throw error
    }

    return data
  }

  // Update order
  static async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating order:', error)
      throw error
    }

    return data
  }

  // Delete order
  static async deleteOrder(id: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting order:', error)
      throw error
    }
  }

  // Search orders
  static async searchOrders(query: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .or(`full_name.ilike.%${query}%,phone_number.ilike.%${query}%,email.ilike.%${query}%,product_name.ilike.%${query}%,order_number.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching orders:', error)
      throw error
    }

    return data || []
  }

  // Get order statistics
  static async getOrderStats() {
    const { data: totalOrders, error: totalError } = await supabase
      .from('orders')
      .select('id', { count: 'exact' })

    const { data: pendingOrders, error: pendingError } = await supabase
      .from('orders')
      .select('id', { count: 'exact' })
      .eq('status', 'pending')

    const { data: completedOrders, error: completedError } = await supabase
      .from('orders')
      .select('id', { count: 'exact' })
      .in('status', ['delivered', 'paid'])

    if (totalError || pendingError || completedError) {
      console.error('Error fetching order stats:', { totalError, pendingError, completedError })
      return {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0
      }
    }

    return {
      totalOrders: totalOrders?.length || 0,
      pendingOrders: pendingOrders?.length || 0,
      completedOrders: completedOrders?.length || 0
    }
  }

  // Get revenue statistics
  static async getRevenueStats() {
    const { data, error } = await supabase
      .from('orders')
      .select('amount, status')
      .not('amount', 'is', null)

    if (error) {
      console.error('Error fetching revenue stats:', error)
      return {
        totalRevenue: 0,
        paidRevenue: 0,
        pendingRevenue: 0
      }
    }

    const totalRevenue = data?.reduce((sum, order) => sum + (Number(order.amount) || 0), 0) || 0
    const paidRevenue = data?.filter(order => ['delivered', 'paid'].includes(order.status))
      .reduce((sum, order) => sum + (Number(order.amount) || 0), 0) || 0
    const pendingRevenue = data?.filter(order => order.status === 'pending')
      .reduce((sum, order) => sum + (Number(order.amount) || 0), 0) || 0

    return {
      totalRevenue,
      paidRevenue,
      pendingRevenue
    }
  }
}
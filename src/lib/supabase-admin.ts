import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mholriycnpbkdaxlmmby.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ob2xyaXljbnBia2RheGxtbWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDQxMjMsImV4cCI6MjA2NTgyMDEyM30.PO3kDxJru16MWBBJyNPhA9mp3hWV0DTIhrNvdcGxogg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Enhanced Product interface matching Supabase schema
export interface SupabaseProduct {
  id?: string
  name: string
  description: string
  price: number
  original_price: number
  category: string
  subcategory?: string
  image_url: string
  additional_images?: string[]
  colors?: string[]
  sizes?: string[]
  specifications?: Record<string, any>
  features?: string[]
  warranty?: string
  is_new?: boolean
  is_featured?: boolean
  stock_quantity?: number
  sku?: string
  brand?: string
  weight?: number
  dimensions?: Record<string, any>
  tags?: string[]
  meta_title?: string
  meta_description?: string
  slug?: string
  status?: 'active' | 'inactive' | 'draft'
  created_at?: string
  updated_at?: string
}

// Product management functions
export class ProductManager {
  // Get all products
  static async getAllProducts(): Promise<SupabaseProduct[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching products:', error)
      throw error
    }

    return data || []
  }

  // Get products by category
  static async getProductsByCategory(category: string): Promise<SupabaseProduct[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching products by category:', error)
      throw error
    }

    return data || []
  }

  // Get single product
  static async getProductById(id: string): Promise<SupabaseProduct | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching product:', error)
      return null
    }

    return data
  }

  // Create new product
  static async createProduct(product: Omit<SupabaseProduct, 'id' | 'created_at' | 'updated_at'>): Promise<SupabaseProduct> {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single()

    if (error) {
      console.error('Error creating product:', error)
      throw error
    }

    return data
  }

  // Update product
  static async updateProduct(id: string, updates: Partial<SupabaseProduct>): Promise<SupabaseProduct> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating product:', error)
      throw error
    }

    return data
  }

  // Delete product
  static async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  }

  // Search products
  static async searchProducts(query: string): Promise<SupabaseProduct[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%`)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching products:', error)
      throw error
    }

    return data || []
  }

  // Get featured products
  static async getFeaturedProducts(): Promise<SupabaseProduct[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching featured products:', error)
      throw error
    }

    return data || []
  }

  // Get new products
  static async getNewProducts(): Promise<SupabaseProduct[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_new', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching new products:', error)
      throw error
    }

    return data || []
  }

  // Get product statistics
  static async getProductStats() {
    const { data: totalProducts, error: totalError } = await supabase
      .from('products')
      .select('id', { count: 'exact' })
      .eq('status', 'active')

    const { data: newProducts, error: newError } = await supabase
      .from('products')
      .select('id', { count: 'exact' })
      .eq('is_new', true)
      .eq('status', 'active')

    const { data: categories, error: categoriesError } = await supabase
      .from('products')
      .select('category')
      .eq('status', 'active')

    if (totalError || newError || categoriesError) {
      console.error('Error fetching stats:', { totalError, newError, categoriesError })
      return {
        totalProducts: 0,
        newProducts: 0,
        categories: 0
      }
    }

    const uniqueCategories = new Set(categories?.map(p => p.category) || [])

    return {
      totalProducts: totalProducts?.length || 0,
      newProducts: newProducts?.length || 0,
      categories: uniqueCategories.size
    }
  }
}

// Real-time subscriptions
export class ProductSubscriptions {
  // Subscribe to product changes
  static subscribeToProducts(callback: (payload: any) => void) {
    return supabase
      .channel('products-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'products' 
        }, 
        callback
      )
      .subscribe()
  }

  // Subscribe to specific product
  static subscribeToProduct(productId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`product-${productId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'products',
          filter: `id=eq.${productId}`
        }, 
        callback
      )
      .subscribe()
  }
}
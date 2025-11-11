import { createClient } from '@supabase/supabase-js'

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 5000   // 5 seconds
}

// Retry helper function
async function retryOperation<T>(
  operation: () => Promise<T>,
  retries: number = RETRY_CONFIG.maxRetries,
  delay: number = RETRY_CONFIG.baseDelay
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (retries <= 0) {
      throw error
    }
    
    console.warn(`Operation failed, retrying in ${delay}ms. Retries left: ${retries}`, error)
    await new Promise(resolve => setTimeout(resolve, delay))
    
    // Exponential backoff with max delay
    const nextDelay = Math.min(delay * 2, RETRY_CONFIG.maxDelay)
    return retryOperation(operation, retries - 1, nextDelay)
  }
}

// Validate Supabase configuration
function validateSupabaseConfig(url: string, key: string, category?: string): void {
  if (!url || url === 'undefined' || !url.startsWith('https://')) {
    throw new Error(`Invalid Supabase URL for ${category || 'main'}: ${url}`)
  }
  if (!key || key === 'undefined' || key.length < 10) {
    throw new Error(`Invalid Supabase key for ${category || 'main'}`)
  }
}

// Category-specific Supabase configurations with validation
const categoryDatabases = {
  phones: {
    url: import.meta.env.VITE_SUPABASE_PHONES_URL || import.meta.env.VITE_SUPABASE_URL || 'https://mholriycnpbkdaxlmmby.supabase.co',
    key: import.meta.env.VITE_SUPABASE_PHONES_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ob2xyaXljbnBia2RheGxtbWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDQxMjMsImV4cCI6MjA2NTgyMDEyM30.PO3kDxJru16MWBBJyNPhA9mp3hWV0DTIhrNvdcGxogg'
  },
  laptops: {
    url: import.meta.env.VITE_SUPABASE_LAPTOPS_URL || import.meta.env.VITE_SUPABASE_URL || 'https://mholriycnpbkdaxlmmby.supabase.co',
    key: import.meta.env.VITE_SUPABASE_LAPTOPS_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ob2xyaXljbnBia2RheGxtbWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDQxMjMsImV4cCI6MjA2NTgyMDEyM30.PO3kDxJru16MWBBJyNPhA9mp3hWV0DTIhrNvdcGxogg'
  },
  'home-appliances': {
    url: import.meta.env.VITE_SUPABASE_APPLIANCES_URL || import.meta.env.VITE_SUPABASE_URL || 'https://mholriycnpbkdaxlmmby.supabase.co',
    key: import.meta.env.VITE_SUPABASE_APPLIANCES_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ob2xyaXljbnBia2RheGxtbWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDQxMjMsImV4cCI6MjA2NTgyMDEyM30.PO3kDxJru16MWBBJyNPhA9mp3hWV0DTIhrNvdcGxogg'
  },
  'tv-audio': {
    url: import.meta.env.VITE_SUPABASE_TV_URL || import.meta.env.VITE_SUPABASE_URL || 'https://mholriycnpbkdaxlmmby.supabase.co',
    key: import.meta.env.VITE_SUPABASE_TV_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ob2xyaXljbnBia2RheGxtbWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDQxMjMsImV4cCI6MjA2NTgyMDEyM30.PO3kDxJru16MWBBJyNPhA9mp3hWV0DTIhrNvdcGxogg'
  },
  'headphones-audio': {
    url: import.meta.env.VITE_SUPABASE_AUDIO_URL || import.meta.env.VITE_SUPABASE_URL || 'https://mholriycnpbkdaxlmmby.supabase.co',
    key: import.meta.env.VITE_SUPABASE_AUDIO_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ob2xyaXljbnBia2RheGxtbWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDQxMjMsImV4cCI6MjA2NTgyMDEyM30.PO3kDxJru16MWBBJyNPhA9mp3hWV0DTIhrNvdcGxogg'
  },
  watches: {
    url: import.meta.env.VITE_SUPABASE_WATCHES_URL || import.meta.env.VITE_SUPABASE_URL || 'https://mholriycnpbkdaxlmmby.supabase.co',
    key: import.meta.env.VITE_SUPABASE_WATCHES_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ob2xyaXljbnBia2RheGxtbWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDQxMjMsImV4cCI6MjA2NTgyMDEyM30.PO3kDxJru16MWBBJyNPhA9mp3hWV0DTIhrNvdcGxogg'
  },
  'gaming-accessories': {
    url: import.meta.env.VITE_SUPABASE_GAMING_URL || import.meta.env.VITE_SUPABASE_URL || 'https://mholriycnpbkdaxlmmby.supabase.co',
    key: import.meta.env.VITE_SUPABASE_GAMING_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ob2xyaXljbnBia2RheGxtbWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDQxMjMsImV4cCI6MjA2NTgyMDEyM30.PO3kDxJru16MWBBJyNPhA9mp3hWV0DTIhrNvdcGxogg'
  },
  shoes: {
    url: import.meta.env.VITE_SUPABASE_SHOES_URL || import.meta.env.VITE_SUPABASE_URL || 'https://mholriycnpbkdaxlmmby.supabase.co',
    key: import.meta.env.VITE_SUPABASE_SHOES_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ob2xyaXljbnBia2RheGxtbWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDQxMjMsImV4cCI6MjA2NTgyMDEyM30.PO3kDxJru16MWBBJyNPhA9mp3hWV0DTIhrNvdcGxogg'
  },
  'gas-cookers': {
    url: import.meta.env.VITE_SUPABASE_COOKERS_URL || import.meta.env.VITE_SUPABASE_URL || 'https://mholriycnpbkdaxlmmby.supabase.co',
    key: import.meta.env.VITE_SUPABASE_COOKERS_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ob2xyaXljbnBia2RheGxtbWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDQxMjMsImV4cCI6MjA2NTgyMDEyM30.PO3kDxJru16MWBBJyNPhA9mp3hWV0DTIhrNvdcGxogg'
  }
}

// Create category-specific Supabase clients with validation
const categoryClients: Record<string, any> = {}

Object.entries(categoryDatabases).forEach(([category, config]) => {
  try {
    validateSupabaseConfig(config.url, config.key, category)
    categoryClients[category] = createClient(config.url, config.key, {
      auth: {
        persistSession: false
      },
      global: {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    })
    console.log(`✅ Supabase client created for category: ${category}`)
  } catch (error) {
    console.error(`❌ Failed to create Supabase client for ${category}:`, error)
  }
})

// Default client for orders and general operations
const mainUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mholriycnpbkdaxlmmby.supabase.co'
const mainKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ob2xyaXljbnBia2RheGxtbWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDQxMjMsImV4cCI6MjA2NTgyMDEyM30.PO3kDxJru16MWBBJyNPhA9mp3hWV0DTIhrNvdcGxogg'

validateSupabaseConfig(mainUrl, mainKey, 'main')
export const mainSupabase = createClient(mainUrl, mainKey, {
  auth: {
    persistSession: false
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  }
})

// Enhanced Product interface
export interface CategoryProduct {
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

// Custom error classes
export class SupabaseConnectionError extends Error {
  constructor(category: string, originalError: any) {
    super(`Failed to connect to Supabase for category '${category}': ${originalError.message}`)
    this.name = 'SupabaseConnectionError'
  }
}

export class ProductFetchError extends Error {
  constructor(category: string, operation: string, originalError: any) {
    super(`Failed to ${operation} products in category '${category}': ${originalError.message}`)
    this.name = 'ProductFetchError'
  }
}

// Category-specific product management
export class CategoryProductManager {
  // Get Supabase client for specific category
  static getClientForCategory(category: string) {
    const client = categoryClients[category]
    if (!client) {
      console.warn(`No specific client found for category '${category}', using main client`)
      return mainSupabase
    }
    return client
  }

  // Test connection to a specific category database
  static async testConnection(category: string): Promise<boolean> {
    try {
      const client = this.getClientForCategory(category)
      const { error } = await client.from('products').select('id').limit(1)
      
      if (error) {
        console.error(`Connection test failed for ${category}:`, error)
        return false
      }
      
      console.log(`✅ Connection test passed for ${category}`)
      return true
    } catch (error) {
      console.error(`Connection test error for ${category}:`, error)
      return false
    }
  }

  // Get all products from a specific category database with retry logic
  static async getProductsByCategory(category: string): Promise<CategoryProduct[]> {
    console.log(`🔄 Fetching products for category: ${category}`)
    
    try {
      return await retryOperation(async () => {
        const client = this.getClientForCategory(category)
        
        const { data, error } = await client
          .from('products')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })

        if (error) {
          console.error(`❌ Supabase error for ${category}:`, error)
          throw new ProductFetchError(category, 'fetch', error)
        }

        console.log(`✅ Successfully fetched ${data?.length || 0} products for ${category}`)
        return data || []
      })
    } catch (error) {
      console.error(`❌ Failed to fetch ${category} products after retries:`, error)
      
      // Re-throw with more context
      if (error instanceof ProductFetchError) {
        throw error
      } else {
        throw new ProductFetchError(category, 'fetch', error)
      }
    }
  }

  // Get all products from all category databases with parallel fetching and error handling
  static async getAllProducts(): Promise<CategoryProduct[]> {
    console.log('🔄 Fetching products from all categories...')
    
    const allProducts: CategoryProduct[] = []
    const errors: string[] = []
    
    // Fetch from all categories in parallel
    const fetchPromises = Object.keys(categoryDatabases).map(async (category) => {
      try {
        const categoryProducts = await this.getProductsByCategory(category)
        return { category, products: categoryProducts, error: null }
      } catch (error) {
        console.error(`❌ Error fetching products from ${category}:`, error)
        errors.push(`${category}: ${error.message}`)
        return { category, products: [], error: error.message }
      }
    })

    const results = await Promise.allSettled(fetchPromises)
    
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.products.length > 0) {
        allProducts.push(...result.value.products)
      }
    })

    console.log(`✅ Total products fetched: ${allProducts.length}`)
    
    if (errors.length > 0) {
      console.warn(`⚠️ Some categories failed to load:`, errors)
    }
    
    // If no products were fetched and there were errors, throw an error
    if (allProducts.length === 0 && errors.length > 0) {
      throw new Error(`Failed to fetch products from all categories. Errors: ${errors.join(', ')}`)
    }

    return allProducts
  }

  // Get single product from appropriate category database
  static async getProductById(id: string, category?: string): Promise<CategoryProduct | null> {
    console.log(`🔄 Fetching product by ID: ${id}${category ? ` in category: ${category}` : ''}`)
    
    if (category) {
      try {
        return await retryOperation(async () => {
          const client = this.getClientForCategory(category)
          const { data, error } = await client
            .from('products')
            .select('*')
            .eq('id', id)
            .single()

          if (error) {
            if (error.code === 'PGRST116') {
              // No rows returned
              return null
            }
            throw new ProductFetchError(category, 'fetch by ID', error)
          }

          console.log(`✅ Found product ${id} in ${category}`)
          return data
        })
      } catch (error) {
        console.error(`❌ Error fetching product ${id} from ${category}:`, error)
        return null
      }
    }

    // Search across all category databases if category not specified
    for (const cat of Object.keys(categoryDatabases)) {
      try {
        const product = await this.getProductById(id, cat)
        if (product) {
          console.log(`✅ Found product ${id} in ${cat}`)
          return product
        }
      } catch (error) {
        console.error(`❌ Error searching for product ${id} in ${cat}:`, error)
      }
    }

    console.log(`❌ Product ${id} not found in any category`)
    return null
  }

  // Create product in specific category database
  static async createProduct(category: string, product: Omit<CategoryProduct, 'id' | 'created_at' | 'updated_at'>): Promise<CategoryProduct | null> {
    try {
      return await retryOperation(async () => {
        const client = this.getClientForCategory(category)
        
        const { data, error } = await client
          .from('products')
          .insert([{ ...product, category }])
          .select()
          .single()

        if (error) {
          throw new ProductFetchError(category, 'create', error)
        }

        console.log(`✅ Created product in ${category}:`, data.id)
        return data
      })
    } catch (error) {
      console.error(`❌ Error creating product in ${category}:`, error)
      throw error
    }
  }

  // Update product in specific category database
  static async updateProduct(category: string, id: string, updates: Partial<CategoryProduct>): Promise<CategoryProduct | null> {
    try {
      return await retryOperation(async () => {
        const client = this.getClientForCategory(category)
        
        const { data, error } = await client
          .from('products')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (error) {
          throw new ProductFetchError(category, 'update', error)
        }

        console.log(`✅ Updated product ${id} in ${category}`)
        return data
      })
    } catch (error) {
      console.error(`❌ Error updating product ${id} in ${category}:`, error)
      throw error
    }
  }

  // Delete product from specific category database
  static async deleteProduct(category: string, id: string): Promise<boolean> {
    try {
      await retryOperation(async () => {
        const client = this.getClientForCategory(category)
        
        const { error } = await client
          .from('products')
          .delete()
          .eq('id', id)

        if (error) {
          throw new ProductFetchError(category, 'delete', error)
        }
      })

      console.log(`✅ Deleted product ${id} from ${category}`)
      return true
    } catch (error) {
      console.error(`❌ Error deleting product ${id} from ${category}:`, error)
      return false
    }
  }

  // Search products across specific category
  static async searchProductsInCategory(category: string, query: string): Promise<CategoryProduct[]> {
    try {
      return await retryOperation(async () => {
        const client = this.getClientForCategory(category)
        
        const { data, error } = await client
          .from('products')
          .select('*')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%`)
          .eq('status', 'active')
          .order('created_at', { ascending: false })

        if (error) {
          throw new ProductFetchError(category, 'search', error)
        }

        console.log(`✅ Search in ${category} returned ${data?.length || 0} results for "${query}"`)
        return data || []
      })
    } catch (error) {
      console.error(`❌ Error searching products in ${category}:`, error)
      return []
    }
  }

  // Search products across all categories
  static async searchAllProducts(query: string): Promise<CategoryProduct[]> {
    console.log(`🔄 Searching all categories for: "${query}"`)
    
    const allResults: CategoryProduct[] = []
    
    const searchPromises = Object.keys(categoryDatabases).map(async (category) => {
      try {
        const categoryResults = await this.searchProductsInCategory(category, query)
        return categoryResults
      } catch (error) {
        console.error(`❌ Error searching in ${category}:`, error)
        return []
      }
    })

    const results = await Promise.allSettled(searchPromises)
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allResults.push(...result.value)
      }
    })

    console.log(`✅ Search completed. Found ${allResults.length} total results`)
    return allResults
  }

  // Get featured products from all categories
  static async getFeaturedProducts(): Promise<CategoryProduct[]> {
    console.log('🔄 Fetching featured products from all categories...')
    
    const featuredProducts: CategoryProduct[] = []
    
    const fetchPromises = Object.keys(categoryDatabases).map(async (category) => {
      try {
        return await retryOperation(async () => {
          const client = this.getClientForCategory(category)
          const { data, error } = await client
            .from('products')
            .select('*')
            .eq('is_featured', true)
            .eq('status', 'active')
            .limit(2) // Limit per category to avoid too many results

          if (error) {
            throw new ProductFetchError(category, 'fetch featured', error)
          }

          return data || []
        })
      } catch (error) {
        console.error(`❌ Error fetching featured products from ${category}:`, error)
        return []
      }
    })

    const results = await Promise.allSettled(fetchPromises)
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        featuredProducts.push(...result.value)
      }
    })

    console.log(`✅ Fetched ${featuredProducts.length} featured products`)
    return featuredProducts
  }

  // Get new products from all categories
  static async getNewProducts(): Promise<CategoryProduct[]> {
    console.log('🔄 Fetching new products from all categories...')
    
    const newProducts: CategoryProduct[] = []
    
    const fetchPromises = Object.keys(categoryDatabases).map(async (category) => {
      try {
        return await retryOperation(async () => {
          const client = this.getClientForCategory(category)
          const { data, error } = await client
            .from('products')
            .select('*')
            .eq('is_new', true)
            .eq('status', 'active')
            .limit(2) // Limit per category

          if (error) {
            throw new ProductFetchError(category, 'fetch new', error)
          }

          return data || []
        })
      } catch (error) {
        console.error(`❌ Error fetching new products from ${category}:`, error)
        return []
      }
    })

    const results = await Promise.allSettled(fetchPromises)
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        newProducts.push(...result.value)
      }
    })

    console.log(`✅ Fetched ${newProducts.length} new products`)
    return newProducts
  }

  // Get category statistics
  static async getCategoryStats(category: string) {
    try {
      return await retryOperation(async () => {
        const client = this.getClientForCategory(category)
        
        const [totalResult, newResult, featuredResult] = await Promise.all([
          client.from('products').select('id', { count: 'exact' }).eq('status', 'active'),
          client.from('products').select('id', { count: 'exact' }).eq('is_new', true).eq('status', 'active'),
          client.from('products').select('id', { count: 'exact' }).eq('is_featured', true).eq('status', 'active')
        ])

        if (totalResult.error || newResult.error || featuredResult.error) {
          throw new Error(`Stats fetch error: ${totalResult.error?.message || newResult.error?.message || featuredResult.error?.message}`)
        }

        return {
          totalProducts: totalResult.count || 0,
          newProducts: newResult.count || 0,
          featuredProducts: featuredResult.count || 0
        }
      })
    } catch (error) {
      console.error(`❌ Error fetching stats for ${category}:`, error)
      return {
        totalProducts: 0,
        newProducts: 0,
        featuredProducts: 0
      }
    }
  }
}

// Real-time subscriptions for category-specific changes
export class CategorySubscriptions {
  // Subscribe to changes in specific category
  static subscribeToCategory(category: string, callback: (payload: any) => void) {
    const client = CategoryProductManager.getClientForCategory(category)
    
    return client
      .channel(`${category}-products-changes`)
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

  // Subscribe to specific product in category
  static subscribeToProduct(category: string, productId: string, callback: (payload: any) => void) {
    const client = CategoryProductManager.getClientForCategory(category)
    
    return client
      .channel(`${category}-product-${productId}`)
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

export { categoryClients, categoryDatabases }
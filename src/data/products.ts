export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  subcategory?: string;
  image: string;
  images: string[];
  colors?: string[];
  sizes?: string[];
  condition?: 'new' | 'refurbished' | 'x-uk' | 'x-us';
  seller: {
    name: string;
    phone: string;
    email: string;
  };
  videos: string[];
  relatedProducts: string[];
  isNew?: boolean;
  specifications: {
    [key: string]: string;
  };
  features: string[];
  warranty: string;
}

// Kenyan Counties for delivery
export const kenyanCounties = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa',
  'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi',
  'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos',
  'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a',
  'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri',
  'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi', 'Trans Nzoia',
  'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
];

// Expanded categories with more diverse product types
export const categories = [
  { id: 'phones', name: 'Phones & Tablets', icon: '📱' },
  { id: 'laptops', name: 'Laptops & Computers', icon: '💻' },
  { id: 'home-appliances', name: 'Home Appliances', icon: '🏠' },
  { id: 'tv-audio', name: 'TV & Audio', icon: '📺' },
  { id: 'headphones-audio', name: 'Headphones & Audio', icon: '🎧' },
  { id: 'cameras-photography', name: 'Cameras & Photography', icon: '📷' },
  { id: 'gaming-accessories', name: 'Gaming & Accessories', icon: '🎮' },
  { id: 'watches', name: 'Watches & Wearables', icon: '⌚' },
  { id: 'automotive-parts', name: 'Automotive & Parts', icon: '🚗' },
  { id: 'fashion-clothing', name: 'Fashion & Clothing', icon: '👕' },
  { id: 'shoes', name: 'Shoes & Footwear', icon: '👟' },
  { id: 'baby-kids', name: 'Baby & Kids', icon: '👶' },
  { id: 'sports-fitness', name: 'Sports & Fitness', icon: '🏋️' },
  { id: 'books-education', name: 'Books & Education', icon: '📚' },
  { id: 'art-crafts', name: 'Art & Crafts', icon: '🎨' },
  { id: 'gas-cookers', name: 'Gas Cookers & Kitchen', icon: '🔥' }
];

// Import enhanced product manager with error handling
import { EnhancedProductManager, SupabaseError, ProductFetchError } from '../lib/supabase-enhanced-error-handling';
import { logger } from '../lib/logger';

// Convert database product to Product interface
function convertDatabaseProduct(dbProduct: any): Product {
  return {
    id: dbProduct.id || '',
    name: dbProduct.name,
    description: dbProduct.description,
    price: Number(dbProduct.price),
    originalPrice: Number(dbProduct.original_price),
    category: dbProduct.category,
    subcategory: dbProduct.subcategory,
    image: dbProduct.image_url,
    images: dbProduct.additional_images || [dbProduct.image_url],
    colors: dbProduct.colors,
    sizes: dbProduct.sizes,
    condition: dbProduct.condition || 'new',
    seller: {
      name: `${dbProduct.brand || 'Lifetime Technology'} Store Kenya`,
      phone: '+254705925800',
      email: 'technologieslifetime@gmail.com'
    },
    videos: ['demo1.mp4', 'demo2.mp4'],
    relatedProducts: [],
    isNew: dbProduct.is_new,
    specifications: dbProduct.specifications || {},
    features: dbProduct.features || [],
    warranty: dbProduct.warranty || '1 Year'
  };
}

// Robust fallback products that will always be available
const fallbackProducts: Product[] = [
  {
    id: 'phone-1',
    name: 'iPhone 15 Pro Max',
    description: 'Latest Apple smartphone with titanium design, A17 Pro chip, and advanced camera system. Experience the future of mobile technology.',
    price: 185000,
    originalPrice: 220000,
    category: 'phones',
    subcategory: 'smartphone',
    image: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg',
    images: [
      'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg',
      'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg'
    ],
    colors: ['Space Black', 'Silver', 'Gold', 'Blue Titanium'],
    sizes: ['128GB', '256GB', '512GB', '1TB'],
    condition: 'x-uk',
    seller: {
      name: 'Apple Store Kenya',
      phone: '+254705925800',
      email: 'technologieslifetime@gmail.com'
    },
    videos: ['video1.mp4', 'video2.mp4', 'video3.mp4'],
    relatedProducts: ['phone-2', 'phone-3'],
    isNew: true,
    specifications: {
      'Display': '6.7" Super Retina XDR',
      'Chip': 'A17 Pro',
      'Camera': '48MP Main + 12MP Ultra Wide + 12MP Telephoto',
      'Battery': 'Up to 29 hours video',
      'Storage': '128GB to 1TB',
      'Connectivity': '5G, WiFi 6E, Bluetooth 5.3'
    },
    features: [
      'Titanium Design',
      'A17 Pro Chip',
      'Pro Camera System',
      '5G Connectivity',
      'Face ID',
      'MagSafe Compatible',
      'Water Resistant IP68'
    ],
    warranty: '2 Years'
  },
  {
    id: 'laptop-1',
    name: 'MacBook Air M3',
    description: 'Supercharged by the M3 chip with up to 18 hours of battery life. Perfect for professionals and students.',
    price: 165000,
    originalPrice: 195000,
    category: 'laptops',
    subcategory: 'ultrabook',
    image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg',
    images: [
      'https://images.pexels.com/photos/18105/pexels-photo.jpg',
      'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg'
    ],
    colors: ['Midnight', 'Starlight', 'Silver', 'Space Gray'],
    sizes: ['8GB RAM + 256GB SSD', '8GB RAM + 512GB SSD', '16GB RAM + 512GB SSD'],
    condition: 'refurbished',
    seller: {
      name: 'Apple Store Kenya',
      phone: '+254705925800',
      email: 'technologieslifetime@gmail.com'
    },
    videos: ['video1.mp4', 'video2.mp4'],
    relatedProducts: ['laptop-2'],
    isNew: true,
    specifications: {
      'Processor': 'Apple M3 chip 8-core CPU',
      'Memory': '8GB unified memory',
      'Storage': '256GB SSD',
      'Display': '13.6-inch Liquid Retina',
      'Battery': 'Up to 18 hours',
      'Weight': '1.24 kg'
    },
    features: [
      'M3 Chip Performance',
      'All-Day Battery Life',
      'Liquid Retina Display',
      'Silent Operation',
      'MagSafe Charging',
      'Touch ID'
    ],
    warranty: '2 Years'
  },
  {
    id: 'shoes-1',
    name: 'Nike Air Max 270',
    description: 'Comfortable running shoes with Air Max technology for all-day comfort and style.',
    price: 12500,
    originalPrice: 15000,
    category: 'shoes',
    subcategory: 'running',
    image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg',
    images: [
      'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg',
      'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg'
    ],
    colors: ['Black', 'White', 'Red', 'Blue'],
    sizes: ['40', '41', '42', '43', '44', '45'],
    condition: 'new',
    seller: {
      name: 'Nike Store Kenya',
      phone: '+254705925800',
      email: 'technologieslifetime@gmail.com'
    },
    videos: ['demo1.mp4', 'demo2.mp4'],
    relatedProducts: ['shoes-2', 'shoes-3'],
    isNew: false,
    specifications: {
      'Material': 'Synthetic and Mesh',
      'Sole': 'Rubber',
      'Technology': 'Air Max 270',
      'Weight': '350g',
      'Type': 'Running Shoes'
    },
    features: [
      'Air Max 270 Technology',
      'Breathable Mesh Upper',
      'Durable Rubber Sole',
      'Comfortable Fit',
      'Stylish Design'
    ],
    warranty: '1 Year'
  },
  {
    id: 'appliance-1',
    name: 'Samsung 4-Door Refrigerator',
    description: 'Energy-efficient French door refrigerator with smart features and large capacity.',
    price: 125000,
    originalPrice: 145000,
    category: 'home-appliances',
    subcategory: 'refrigerator',
    image: 'https://images.pexels.com/photos/2343468/pexels-photo-2343468.jpeg',
    images: [
      'https://images.pexels.com/photos/2343468/pexels-photo-2343468.jpeg'
    ],
    colors: ['Stainless Steel', 'Black Stainless', 'White'],
    sizes: ['500L', '600L'],
    condition: 'x-us',
    seller: {
      name: 'Samsung Store Kenya',
      phone: '+254705925800',
      email: 'technologieslifetime@gmail.com'
    },
    videos: ['demo1.mp4'],
    relatedProducts: [],
    isNew: false,
    specifications: {
      'Capacity': '500L',
      'Energy Rating': 'A++',
      'Type': 'French Door',
      'Features': 'Smart Connect'
    },
    features: [
      'Energy Efficient',
      'Smart Connectivity',
      'Large Capacity',
      'Digital Display'
    ],
    warranty: '2 Years'
  }
];

// Cache for products with error tracking
let productsCache: Product[] = [];
let lastFetchTime = 0;
let lastError: string | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Enhanced error handling wrapper
async function withErrorHandling<T>(
  operation: () => Promise<T>,
  fallback: T,
  operationName: string
): Promise<{ data: T; error: string | null }> {
  try {
    logger.debug(`Starting operation: ${operationName}`);
    const data = await operation();
    logger.info(`Operation completed successfully: ${operationName}`);
    return { data, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error(`Operation failed: ${operationName}`, error);
    
    // Provide user-friendly error messages
    let userFriendlyMessage = errorMessage;
    if (error instanceof ProductFetchError) {
      userFriendlyMessage = `Unable to load products. Please check your internet connection and try again.`;
    } else if (error instanceof SupabaseError) {
      userFriendlyMessage = `Database connection failed. Please try again later.`;
    } else if (errorMessage.includes('Failed to fetch')) {
      userFriendlyMessage = `Network error: Unable to connect to the server. Please check your internet connection.`;
    }
    
    return { data: fallback, error: userFriendlyMessage };
  }
}

// Get all products with enhanced error handling and caching
export async function getAllProducts(): Promise<Product[]> {
  logger.info('Getting all products...');
  
  // Check cache first
  const now = Date.now();
  if (productsCache.length > 0 && (now - lastFetchTime) < CACHE_DURATION && !lastError) {
    logger.info('Returning cached products', { count: productsCache.length });
    return productsCache;
  }
  
  const { data: dbProducts, error } = await withErrorHandling(
    () => EnhancedProductManager.getAllProducts(),
    [],
    'fetch all products'
  );
  
  if (error) {
    lastError = error;
    logger.warn('Using fallback products due to error:', error);
    return fallbackProducts;
  }
  
  const convertedProducts = dbProducts.map(convertDatabaseProduct);
  
  if (convertedProducts.length > 0) {
    productsCache = convertedProducts;
    lastFetchTime = now;
    lastError = null;
    logger.info(`Successfully loaded ${convertedProducts.length} products from database`);
    return convertedProducts;
  }
  
  // Fallback to static products if no products found
  logger.info('No products found in database, using fallback products');
  return fallbackProducts;
}

// Get products by category with enhanced error handling
export async function getProductsByCategory(category: string): Promise<Product[]> {
  logger.info(`Getting products by category: ${category}`);
  
  const { data: dbProducts, error } = await withErrorHandling(
    () => EnhancedProductManager.getProductsByCategory(category),
    [],
    `fetch products for category: ${category}`
  );
  
  if (error) {
    logger.warn(`Error fetching ${category} products, using fallback:`, error);
    // Return fallback products filtered by category
    return fallbackProducts.filter(p => p.category === category);
  }
  
  const convertedProducts = dbProducts.map(convertDatabaseProduct);
  
  if (convertedProducts.length > 0) {
    logger.info(`Successfully loaded ${convertedProducts.length} products for ${category}`);
    return convertedProducts;
  }
  
  // Fallback to static products filtered by category
  logger.info(`No products found for ${category}, using fallback products`);
  return fallbackProducts.filter(p => p.category === category);
}

// Get product by ID with enhanced error handling
export async function getProductById(id: string): Promise<Product | undefined> {
  logger.info(`Getting product by ID: ${id}`);
  
  // First try to get from cache
  const cachedProduct = productsCache.find(p => p.id === id);
  if (cachedProduct) {
    logger.info(`Found product ${id} in cache`);
    return cachedProduct;
  }
  
  // Try to get all products and find the one we need
  const allProducts = await getAllProducts();
  const product = allProducts.find(p => p.id === id);
  
  if (product) {
    logger.info(`Found product ${id}`);
  } else {
    logger.warn(`Product ${id} not found`);
  }
  
  return product;
}

// Get related products with enhanced error handling
export async function getRelatedProducts(productId: string): Promise<Product[]> {
  logger.info(`Getting related products for: ${productId}`);
  
  const product = await getProductById(productId);
  if (!product) {
    logger.warn(`Product ${productId} not found, cannot get related products`);
    return [];
  }
  
  const categoryProducts = await getProductsByCategory(product.category);
  const relatedProducts = categoryProducts.filter(p => p.id !== productId).slice(0, 4);
  
  logger.info(`Found ${relatedProducts.length} related products for ${productId}`);
  return relatedProducts;
}

// Clear cache function for real-time updates
export function clearProductsCache() {
  productsCache = [];
  lastFetchTime = 0;
  lastError = null;
  logger.info('Products cache cleared');
}

// Get cache status for debugging
export function getCacheStatus() {
  return {
    cacheSize: productsCache.length,
    lastFetchTime: new Date(lastFetchTime).toISOString(),
    lastError,
    cacheAge: Date.now() - lastFetchTime
  };
}

// Export fallback products as allProducts for backward compatibility
export const allProducts = fallbackProducts;
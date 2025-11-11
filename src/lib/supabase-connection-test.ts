import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mholriycnpbkdaxlmmby.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ob2xyaXljbnBia2RheGxtbWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDQxMjMsImV4cCI6MjA2NTgyMDEyM30.PO3kDxJru16MWBBJyNPhA9mp3hWV0DTIhrNvdcGxogg';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection function
export async function testSupabaseConnection() {
  try {
    logger.info('Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    if (error) {
      logger.error('Supabase connection failed:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }

    logger.info('Supabase connection successful!');
    return {
      success: true,
      message: 'Connected to Supabase successfully!',
      url: supabaseUrl
    };
  } catch (error) {
    logger.error('Supabase connection error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    };
  }
}

// Initialize sample data if needed
export async function initializeSampleData() {
  try {
    logger.info('Checking for existing products...');
    
    const { data: existingProducts, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (error) {
      logger.error('Error checking products:', error);
      return false;
    }

    if (existingProducts && existingProducts.length > 0) {
      logger.info('Products already exist in database');
      return true;
    }

    logger.info('No products found, initializing sample data...');
    
    // Sample products to insert
    const sampleProducts = [
      {
        name: 'iPhone 15 Pro Max',
        description: 'Latest Apple smartphone with titanium design, A17 Pro chip, and advanced camera system. Experience the future of mobile technology.',
        price: 185000,
        original_price: 220000,
        category: 'phones',
        subcategory: 'smartphone',
        image_url: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg',
        additional_images: ['https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg'],
        colors: ['Space Black', 'Silver', 'Gold', 'Blue Titanium'],
        sizes: ['128GB', '256GB', '512GB', '1TB'],
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
        warranty: '2 Years',
        brand: 'Apple',
        stock_quantity: 50,
        is_new: true,
        is_featured: true,
        status: 'active'
      },
      {
        name: 'MacBook Air M3',
        description: 'Supercharged by the M3 chip with up to 18 hours of battery life. Perfect for professionals and students.',
        price: 165000,
        original_price: 195000,
        category: 'laptops',
        subcategory: 'ultrabook',
        image_url: 'https://images.pexels.com/photos/18105/pexels-photo.jpg',
        additional_images: ['https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg'],
        colors: ['Midnight', 'Starlight', 'Silver', 'Space Gray'],
        sizes: ['8GB RAM + 256GB SSD', '8GB RAM + 512GB SSD', '16GB RAM + 512GB SSD'],
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
        warranty: '2 Years',
        brand: 'Apple',
        stock_quantity: 30,
        is_new: true,
        is_featured: true,
        status: 'active'
      },
      {
        name: 'Samsung 4-Door Refrigerator',
        description: 'Energy-efficient French door refrigerator with smart features and large capacity.',
        price: 125000,
        original_price: 145000,
        category: 'home-appliances',
        subcategory: 'refrigerator',
        image_url: 'https://images.pexels.com/photos/2343468/pexels-photo-2343468.jpeg',
        colors: ['Stainless Steel', 'Black Stainless', 'White'],
        sizes: ['500L', '600L'],
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
        warranty: '2 Years',
        brand: 'Samsung',
        stock_quantity: 15,
        is_featured: false,
        status: 'active'
      },
      {
        name: 'Nike Air Max 270',
        description: 'Comfortable running shoes with Air Max technology for all-day comfort and style.',
        price: 12500,
        original_price: 15000,
        category: 'shoes',
        subcategory: 'running',
        image_url: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg',
        additional_images: ['https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg'],
        colors: ['Black', 'White', 'Red', 'Blue'],
        sizes: ['40', '41', '42', '43', '44', '45'],
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
        warranty: '1 Year',
        brand: 'Nike',
        stock_quantity: 100,
        is_new: false,
        status: 'active'
      }
    ];

    const { data: insertedProducts, error: insertError } = await supabase
      .from('products')
      .insert(sampleProducts)
      .select();

    if (insertError) {
      logger.error('Error inserting sample products:', insertError);
      return false;
    }

    logger.info(`Successfully inserted ${insertedProducts?.length || 0} sample products`);
    return true;
  } catch (error) {
    logger.error('Error initializing sample data:', error);
    return false;
  }
}
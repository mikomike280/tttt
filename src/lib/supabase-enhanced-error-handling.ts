import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

// Enhanced error handling for Supabase operations
export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any,
    public hint?: string
  ) {
    super(message);
    this.name = 'SupabaseError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'NetworkError';
  }
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 5000,
  backoffFactor: 2
};

// Enhanced retry function with exponential backoff
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  retries: number = RETRY_CONFIG.maxRetries,
  delay: number = RETRY_CONFIG.baseDelay,
  operationName: string = 'operation'
): Promise<T> {
  try {
    logger.debug(`Attempting ${operationName}`, { attempt: RETRY_CONFIG.maxRetries - retries + 1 });
    return await operation();
  } catch (error) {
    logger.warn(`${operationName} failed`, { 
      error: error instanceof Error ? error.message : error,
      retriesLeft: retries,
      nextDelay: delay 
    });

    if (retries <= 0) {
      logger.error(`${operationName} failed after all retries`, error);
      throw error;
    }

    // Check if it's a network error that we should retry
    const shouldRetry = isRetryableError(error);
    if (!shouldRetry) {
      logger.error(`${operationName} failed with non-retryable error`, error);
      throw error;
    }

    await new Promise(resolve => setTimeout(resolve, delay));
    
    const nextDelay = Math.min(delay * RETRY_CONFIG.backoffFactor, RETRY_CONFIG.maxDelay);
    return retryWithBackoff(operation, retries - 1, nextDelay, operationName);
  }
}

function isRetryableError(error: any): boolean {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  
  // Supabase connection errors
  if (error?.message?.includes('Failed to fetch') || 
      error?.message?.includes('Network request failed') ||
      error?.message?.includes('Connection failed')) {
    return true;
  }
  
  // HTTP status codes that should be retried
  if (error?.status >= 500 && error?.status < 600) {
    return true;
  }
  
  // Rate limiting
  if (error?.status === 429) {
    return true;
  }
  
  return false;
}

// Enhanced Supabase client with better error handling and fallbacks
function createEnhancedSupabaseClient() {
  // Use environment variables with fallbacks
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mholriycnpbkdaxlmmby.supabase.co';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ob2xyaXljbnBia2RheGxtbWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDQxMjMsImV4cCI6MjA2NTgyMDEyM30.PO3kDxJru16MWBBJyNPhA9mp3hWV0DTIhrNvdcGxogg';

  // Validate environment variables
  if (!supabaseUrl || supabaseUrl === 'undefined') {
    const errorMessage = 'Missing VITE_SUPABASE_URL environment variable';
    logger.error('Supabase configuration error', new Error(errorMessage));
    throw new SupabaseError(errorMessage, 'MISSING_ENV_VARS');
  }

  if (!supabaseAnonKey || supabaseAnonKey === 'undefined') {
    const errorMessage = 'Missing VITE_SUPABASE_ANON_KEY environment variable';
    logger.error('Supabase configuration error', new Error(errorMessage));
    throw new SupabaseError(errorMessage, 'MISSING_ENV_VARS');
  }

  // Validate URL format
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    const errorMessage = `Invalid Supabase URL format: ${supabaseUrl}`;
    logger.error('Supabase URL validation failed', new Error(errorMessage));
    throw new SupabaseError(errorMessage, 'INVALID_URL');
  }

  logger.info('Creating Supabase client', { 
    url: supabaseUrl.substring(0, 30) + '...', 
    keyLength: supabaseAnonKey.length 
  });

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false
    },
    global: {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `LifetimeTechnology-Web/${import.meta.env.VITE_APP_VERSION || '1.0.0'}`
      }
    }
  });
}

// Enhanced product fetching with comprehensive error handling
export class EnhancedProductManager {
  private static client: any;

  static getClient() {
    if (!this.client) {
      try {
        this.client = createEnhancedSupabaseClient();
      } catch (error) {
        logger.error('Failed to create Supabase client', error);
        // Return a mock client that will fail gracefully
        return null;
      }
    }
    return this.client;
  }

  static async getProductsByCategory(category: string): Promise<any[]> {
    const operationName = `getProductsByCategory(${category})`;
    logger.info(`Starting ${operationName}`);

    const client = this.getClient();
    if (!client) {
      logger.error('No Supabase client available');
      return [];
    }

    return retryWithBackoff(async () => {
      const { data, error } = await client
        .from('products')
        .select('*')
        .eq('category', category)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error(`Supabase query failed for ${operationName}`, error);
        throw new SupabaseError(
          `Failed to fetch ${category} products: ${error.message}`,
          error.code,
          error.details,
          error.hint
        );
      }

      logger.info(`Successfully fetched ${data?.length || 0} products for ${category}`);
      return data || [];
    }, RETRY_CONFIG.maxRetries, RETRY_CONFIG.baseDelay, operationName);
  }

  static async getAllProducts(): Promise<any[]> {
    const operationName = 'getAllProducts';
    logger.info(`Starting ${operationName}`);

    const client = this.getClient();
    if (!client) {
      logger.error('No Supabase client available');
      return [];
    }

    return retryWithBackoff(async () => {
      const { data, error } = await client
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error(`Supabase query failed for ${operationName}`, error);
        throw new SupabaseError(
          `Failed to fetch all products: ${error.message}`,
          error.code,
          error.details,
          error.hint
        );
      }

      logger.info(`Successfully fetched ${data?.length || 0} total products`);
      return data || [];
    }, RETRY_CONFIG.maxRetries, RETRY_CONFIG.baseDelay, operationName);
  }

  static async testConnection(): Promise<boolean> {
    try {
      logger.info('Testing Supabase connection');
      const client = this.getClient();
      
      if (!client) {
        logger.error('No Supabase client available for connection test');
        return false;
      }
      
      const { error } = await client
        .from('products')
        .select('id')
        .limit(1);

      if (error) {
        logger.error('Supabase connection test failed', error);
        return false;
      }

      logger.info('Supabase connection test successful');
      return true;
    } catch (error) {
      logger.error('Supabase connection test error', error);
      return false;
    }
  }
}

// Export enhanced error types
export { NetworkError as ProductFetchError, SupabaseError as SupabaseConnectionError };
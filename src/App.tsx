import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CategoryStrip from './components/CategoryStrip';
import QuickLinks from './components/QuickLinks';
import ProductGrid from './components/ProductGrid';
import ProductOverlay from './components/ProductOverlay';
import CheckoutModal from './components/CheckoutModal';
import OrderForm from './components/OrderForm';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import NetworkError from './components/NetworkError';
import { Product, getAllProducts, getProductsByCategory } from './data/products';
import { logger } from './lib/logger';
import { EnhancedProductManager } from './lib/supabase-enhanced-error-handling';

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutData, setCheckoutData] = useState<{product: Product; options: any} | null>(null);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderFormProduct, setOrderFormProduct] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Log app initialization
    logger.info('App initialized', {
      environment: import.meta.env.MODE,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });

    // Test Supabase connection on app start (silently)
    testSupabaseConnection();
    
    loadProducts();
  }, [selectedCategory]);

  const testSupabaseConnection = async () => {
    try {
      const isConnected = await EnhancedProductManager.testConnection();
      if (!isConnected) {
        logger.warn('Supabase connection test failed on app start');
      }
    } catch (error) {
      logger.error('Failed to test Supabase connection', error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    setNetworkError(false);
    
    try {
      logger.info('Loading products', { 
        category: selectedCategory, 
        retryCount,
        timestamp: new Date().toISOString() 
      });
      
      let products: Product[] = [];
      
      if (selectedCategory) {
        products = await getProductsByCategory(selectedCategory);
        logger.info('Category products loaded successfully', { 
          category: selectedCategory, 
          count: products.length 
        });
      } else {
        // Show random mix of different categories
        const allProducts = await getAllProducts();
        logger.info('All products loaded successfully', { count: allProducts.length });
        
        if (allProducts.length === 0) {
          throw new Error('No products available');
        }
        
        const categories = ['phones', 'laptops', 'home-appliances', 'shoes', 'watches', 'gas-cookers', 'tv-audio', 'headphones-audio'];
        const mixedProducts: Product[] = [];
        
        categories.forEach(category => {
          const categoryProducts = allProducts.filter(p => p.category === category);
          const shuffledCategoryProducts = categoryProducts.sort(() => 0.5 - Math.random());
          mixedProducts.push(...shuffledCategoryProducts.slice(0, 2));
        });
        
        const shuffled = mixedProducts.sort(() => 0.5 - Math.random());
        products = shuffled.slice(0, 12);
      }
      
      setDisplayedProducts(products);
      setRetryCount(0); // Reset retry count on success
      
    } catch (error) {
      logger.error('Error loading products', error, {
        category: selectedCategory,
        retryCount,
        errorType: error instanceof Error ? error.constructor.name : typeof error
      });
      
      // Determine error type and set appropriate state
      if (error instanceof Error && 
          (error.message.includes('Failed to fetch') || 
           error.message.includes('Network') ||
           error.message.includes('Connection'))) {
        setNetworkError(true);
        setError('Unable to connect to the server. Please check your internet connection.');
      } else {
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      }
      
      // Fallback to empty array to prevent complete failure
      setDisplayedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    logger.info('User initiated retry', { retryCount: retryCount + 1 });
    loadProducts();
  };

  const handleCategorySelect = (category: string) => {
    logger.info('Category selected', { category });
    setSelectedCategory(category);
  };

  const handleProductSelect = (product: Product) => {
    logger.info('Product selected', { productId: product.id, productName: product.name });
    setSelectedProduct(product);
  };

  const handleCloseOverlay = () => {
    setSelectedProduct(null);
  };

  const handleOrderNow = (product: Product, options?: any) => {
    logger.info('Order initiated', { 
      productId: product.id, 
      productName: product.name, 
      hasOptions: !!options 
    });
    
    if (options) {
      setSelectedProduct(null);
      setCheckoutData({ product, options });
    } else {
      setOrderFormProduct(product.name);
      setShowOrderForm(true);
    }
  };

  const handleCloseCheckout = () => {
    setCheckoutData(null);
  };

  const handleCloseOrderForm = () => {
    setShowOrderForm(false);
    setOrderFormProduct('');
  };

  const getGridTitle = () => {
    if (selectedCategory) {
      const categoryName = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1).replace('-', ' ');
      return categoryName;
    }
    return 'Featured Products';
  };

  // Show network error screen
  if (networkError && !loading) {
    return (
      <ErrorBoundary>
        <NetworkError onRetry={handleRetry} />
      </ErrorBoundary>
    );
  }

  // Show loading screen
  if (loading && displayedProducts.length === 0) {
    return (
      <ErrorBoundary>
        <LoadingSpinner 
          message={retryCount > 0 ? `Retrying... (${retryCount})` : 'Loading products...'} 
          fullScreen 
        />
      </ErrorBoundary>
    );
  }

  // Show error message if there's a critical error
  if (error && displayedProducts.length === 0 && !loading) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center p-8 max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={handleRetry}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors shadow-3d hover:shadow-3d-hover"
            >
              Try Again
            </button>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Enhanced SEO Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Lifetime Technology Kenya",
              "alternateName": "Lifetime Technology",
              "url": window.location.origin,
              "description": "Kenya's premier electronics store offering authentic phones, laptops, home appliances, watches, shoes and tech gadgets with fast delivery across all 47 counties.",
              "keywords": "electronics Kenya, phones Kenya, laptops Kenya, iPhone Kenya, MacBook Kenya, Samsung Kenya, home appliances Kenya, tech store Kenya, gadgets Kenya, Nairobi electronics",
              "inLanguage": "en-KE",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": `${window.location.origin}/search?q={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Lifetime Technology Kenya",
                "logo": {
                  "@type": "ImageObject",
                  "url": `${window.location.origin}/logo.png`,
                  "width": 200,
                  "height": 200
                }
              },
              "mainEntity": {
                "@type": "ItemList",
                "name": "Electronics and Technology Products",
                "description": "Comprehensive collection of authentic electronics and tech products",
                "numberOfItems": displayedProducts.length,
                "itemListElement": displayedProducts.slice(0, 5).map((product, index) => ({
                  "@type": "Product",
                  "position": index + 1,
                  "name": product.name,
                  "description": product.description,
                  "image": product.image,
                  "offers": {
                    "@type": "Offer",
                    "price": product.price,
                    "priceCurrency": "KES",
                    "availability": "https://schema.org/InStock",
                    "seller": {
                      "@type": "Organization",
                      "name": "Lifetime Technology Kenya"
                    }
                  }
                }))
              }
            })
          }}
        />

        <Header />
        
        <main className="pt-20">
          <div className="h-6"></div>
          
          <CategoryStrip onCategorySelect={handleCategorySelect} />
          <QuickLinks />
          
          {error && displayedProducts.length > 0 && (
            <div className="px-4 sm:px-6 lg:px-8 mb-4">
              <div className="max-w-7xl mx-auto">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ Some features may be limited. {error}
                  </p>
                  <button
                    onClick={handleRetry}
                    className="text-yellow-800 hover:text-yellow-900 underline text-sm font-medium"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <ProductGrid
            products={displayedProducts}
            title={getGridTitle()}
            onProductSelect={handleProductSelect}
            onOrderNow={handleOrderNow}
            loading={loading}
          />
        </main>

        <Footer />

        {/* Overlays */}
        {selectedProduct && (
          <ProductOverlay
            product={selectedProduct}
            onClose={handleCloseOverlay}
            onOrderNow={handleOrderNow}
          />
        )}

        {checkoutData && (
          <CheckoutModal
            product={checkoutData.product}
            options={checkoutData.options}
            onClose={handleCloseCheckout}
          />
        )}

        <OrderForm
          isVisible={showOrderForm}
          onClose={handleCloseOrderForm}
          productName={orderFormProduct}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;
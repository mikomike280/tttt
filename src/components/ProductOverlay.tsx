import React, { useState } from 'react';
import { X, Phone, Mail, Play, ChevronLeft, ChevronRight, Star, Shield, Truck } from 'lucide-react';
import { Product, getRelatedProducts } from '../data/products';

interface ProductOverlayProps {
  product: Product;
  onClose: () => void;
  onOrderNow: (product: Product, options: any) => void;
}

export default function ProductOverlay({ product, onClose, onOrderNow }: ProductOverlayProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [relatedProductIndex, setRelatedProductIndex] = useState(0);
  
  const relatedProducts = getRelatedProducts(product.id);

  const handleOrderNow = () => {
    onOrderNow(product, {
      color: selectedColor,
      size: selectedSize,
      quantity
    });
  };

  const handlePhoneClick = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmailClick = (email: string) => {
    window.open(`mailto:${email}`, '_self');
  };

  const nextRelatedProduct = () => {
    setRelatedProductIndex((prev) => (prev + 1) % relatedProducts.length);
  };

  const prevRelatedProduct = () => {
    setRelatedProductIndex((prev) => (prev - 1 + relatedProducts.length) % relatedProducts.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 lg:p-4 bg-vantablack/75 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full h-full lg:max-w-none lg:w-[95vw] lg:h-[90vh] overflow-y-auto shadow-3d">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 lg:p-6 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-xl lg:text-2xl font-bold text-vantablack">{product.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
            {/* Left Column - Image and Basic Info */}
            <div>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 lg:h-80 object-cover rounded-2xl shadow-3d mb-4 lg:mb-6"
              />
              
              {/* Price and Basic Info */}
              <div className="mb-4 lg:mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl lg:text-3xl font-bold text-kenyan-green">
                    KSh {(product.price * quantity).toLocaleString()}
                  </span>
                  <span className="text-lg lg:text-xl text-gray-400 line-through">
                    KSh {(product.originalPrice * quantity).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Price includes 17% discount</p>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">(4.8/5 - 127 reviews)</span>
                </div>
              </div>

              {/* Seller Contact */}
              <div className="bg-kenyan-green/10 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-vantablack mb-3">Seller Information</h3>
                <div className="space-y-2">
                  <p className="font-medium text-vantablack">{product.seller.name}</p>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Phone size={16} />
                    <button 
                      onClick={() => handlePhoneClick(product.seller.phone)}
                      className="hover:text-kenyan-green transition-colors underline"
                    >
                      {product.seller.phone}
                    </button>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Mail size={16} />
                    <button 
                      onClick={() => handleEmailClick(product.seller.email)}
                      className="hover:text-kenyan-green transition-colors underline"
                    >
                      {product.seller.email}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Options and Actions */}
            <div>
              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-vantablack mb-3">Color</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-xl border-2 transition-colors ${
                          selectedColor === color
                            ? 'border-kenyan-green bg-kenyan-green text-white'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-kenyan-green'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-vantablack mb-3">
                    {product.category === 'shoes' ? 'Size' : product.category === 'phones' ? 'Storage' : 'Size'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-xl border-2 transition-colors ${
                          selectedSize === size
                            ? 'border-kenyan-green bg-kenyan-green text-white'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-kenyan-green'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <h4 className="font-semibold text-vantablack mb-3">Quantity</h4>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <Shield className="mx-auto mb-2 text-kenyan-green" size={24} />
                  <p className="text-xs font-medium">Warranty</p>
                  <p className="text-xs text-gray-600">{product.warranty}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <Truck className="mx-auto mb-2 text-kenyan-green" size={24} />
                  <p className="text-xs font-medium">Fast Delivery</p>
                  <p className="text-xs text-gray-600">Same Day</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <Star className="mx-auto mb-2 text-kenyan-green" size={24} />
                  <p className="text-xs font-medium">Quality</p>
                  <p className="text-xs text-gray-600">Guaranteed</p>
                </div>
              </div>

              {/* Order Button */}
              <button
                onClick={handleOrderNow}
                className="w-full bg-kenyan-green hover:bg-deep-green text-white font-semibold py-4 px-6 rounded-xl transition-colors shadow-3d hover:shadow-3d-hover mb-6"
              >
                Order Now - KSh {(product.price * quantity).toLocaleString()}
              </button>
            </div>
          </div>

          {/* Three Detailed Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-6 lg:mb-8">
            {/* Section 1: Technical Specifications */}
            <div className="bg-gray-50 rounded-2xl p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-bold text-vantablack mb-4 flex items-center">
                <div className="w-8 h-8 bg-kenyan-green rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                Technical Specifications
              </h3>
              <div className="space-y-3">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                    <span className="font-medium text-gray-700">{key}:</span>
                    <span className="text-vantablack font-semibold">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-kenyan-green/10 rounded-lg">
                <p className="text-sm text-kenyan-green font-medium">
                  All specifications verified and tested for optimal performance
                </p>
              </div>
            </div>

            {/* Section 2: Key Features & Benefits */}
            <div className="bg-gray-50 rounded-2xl p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-bold text-vantablack mb-4 flex items-center">
                <div className="w-8 h-8 bg-kenyan-green rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                Key Features & Benefits
              </h3>
              <div className="space-y-4">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-kenyan-green rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div>
                      <p className="font-medium text-vantablack">{feature}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Enhanced performance and reliability for everyday use
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 font-medium">
                  Premium features designed for maximum user satisfaction
                </p>
              </div>
            </div>

            {/* Section 3: Warranty & Support */}
            <div className="bg-gray-50 rounded-2xl p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-bold text-vantablack mb-4 flex items-center">
                <div className="w-8 h-8 bg-kenyan-green rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                Warranty & Support
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <Shield className="text-kenyan-green" size={20} />
                    <span className="font-semibold text-vantablack">Comprehensive Warranty</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {product.warranty} comprehensive warranty covering all manufacturing defects and hardware issues.
                  </p>
                </div>
                
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <Phone className="text-kenyan-green" size={20} />
                    <span className="font-semibold text-vantablack">24/7 Customer Support</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Round-the-clock technical support and customer service for all your queries.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <Truck className="text-kenyan-green" size={20} />
                    <span className="font-semibold text-vantablack">Free Installation</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Professional installation and setup service included at no extra cost.
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700 font-medium">
                  Lifetime Kenya guarantee: 100% satisfaction or money back
                </p>
              </div>
            </div>
          </div>

          {/* Video Section */}
          <div className="mb-6 lg:mb-8">
            <h3 className="text-lg lg:text-xl font-bold text-vantablack mb-4">Product Demonstration Videos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {product.videos.slice(0, 3).map((video, index) => (
                <div key={index} className="relative group cursor-pointer" onClick={() => setActiveVideo(`video-${index}`)}>
                  <div className="w-full h-32 lg:h-40 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center shadow-3d group-hover:shadow-3d-hover transition-all">
                    <div className="text-center">
                      <Play size={32} lg:size={40} className="text-kenyan-green mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700">Demo Video {index + 1}</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-kenyan-green/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h3 className="text-lg lg:text-xl font-bold text-vantablack mb-4">Related Products</h3>
              <div className="relative">
                <div className="flex space-x-4 overflow-hidden">
                  {relatedProducts.slice(relatedProductIndex, relatedProductIndex + 4).map((relatedProduct) => (
                    <div key={relatedProduct.id} className="flex-shrink-0 w-48 lg:w-56 bg-gray-50 rounded-xl p-4 shadow-3d hover:shadow-3d-hover transition-all cursor-pointer">
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="w-full h-28 lg:h-32 object-cover rounded-lg mb-3"
                      />
                      <h4 className="font-medium text-sm text-vantablack mb-1 line-clamp-1">
                        {relatedProduct.name}
                      </h4>
                      <p className="text-kenyan-green font-semibold text-sm">
                        KSh {relatedProduct.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 line-through">
                        KSh {relatedProduct.originalPrice.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                
                {relatedProducts.length > 4 && (
                  <>
                    <div className="absolute inset-y-0 -right-2 flex items-center">
                      <button
                        onClick={nextRelatedProduct}
                        className="p-2 bg-white rounded-full shadow-3d hover:shadow-3d-hover transition-all"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                    
                    <div className="absolute inset-y-0 -left-2 flex items-center">
                      <button
                        onClick={prevRelatedProduct}
                        className="p-2 bg-white rounded-full shadow-3d hover:shadow-3d-hover transition-all"
                      >
                        <ChevronLeft size={20} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-vantablack/90"
          onClick={() => setActiveVideo(null)}
        >
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Product Demonstration</h3>
              <button
                onClick={() => setActiveVideo(null)}
                className="p-2 hover:bg-gray-100 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>
            <div className="w-full h-64 lg:h-80 bg-gray-200 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Play size={48} className="text-kenyan-green mx-auto mb-4" />
                <p className="text-gray-600">Video Player - Product Demonstration</p>
                <p className="text-sm text-gray-500 mt-2">Click to play video content</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
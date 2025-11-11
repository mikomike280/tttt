import React from 'react';
import { Product } from '../data/products';
import { Star, Shield, Truck } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onMoreInfo: (product: Product) => void;
  onOrderNow?: (product: Product) => void;
}

export default function ProductCard({ product, onMoreInfo, onOrderNow }: ProductCardProps) {
  const handleOrderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOrderNow) {
      onOrderNow(product);
    }
  };

  const discountPercentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'new':
        return { text: '🆕 NEW', color: 'bg-gradient-to-r from-green-500 to-emerald-500' };
      case 'refurbished':
        return { text: '🔄 REFURBISHED', color: 'bg-gradient-to-r from-blue-500 to-cyan-500' };
      case 'x-uk':
        return { text: '🇬🇧 X-UK', color: 'bg-gradient-to-r from-purple-500 to-indigo-500' };
      case 'x-us':
        return { text: '🇺🇸 X-US', color: 'bg-gradient-to-r from-orange-500 to-red-500' };
      default:
        return { text: '🆕 NEW', color: 'bg-gradient-to-r from-green-500 to-emerald-500' };
    }
  };

  const conditionBadge = getConditionBadge(product.condition || 'new');

  return (
    <div 
      className="bg-white rounded-xl sm:rounded-2xl shadow-3d hover:shadow-3d-hover transition-all duration-300 overflow-hidden group border border-gray-50 transform hover:scale-105 cursor-pointer"
      itemScope 
      itemType="https://schema.org/Product"
      onClick={() => onMoreInfo(product)}
    >
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-32 sm:h-40 lg:h-44 object-cover group-hover:scale-105 transition-transform duration-300"
          itemProp="image"
          loading="lazy"
        />
        
        {/* Enhanced badges - Mobile optimized */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {/* Condition Badge */}
          <div className={`${conditionBadge.color} text-white px-1.5 py-0.5 rounded text-xs font-bold shadow-lg`}>
            <span className="hidden sm:inline">{conditionBadge.text}</span>
            <span className="sm:hidden">{conditionBadge.text.split(' ')[0]}</span>
          </div>
          
          {product.isNew && (
            <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-1.5 py-0.5 rounded text-xs font-bold shadow-lg">
              <span className="hidden sm:inline">✨ LATEST</span>
              <span className="sm:hidden">✨</span>
            </div>
          )}
          
          {discountPercentage > 0 && (
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-1.5 py-0.5 rounded text-xs font-bold shadow-lg">
              -{discountPercentage}%
            </div>
          )}
        </div>
        
        {/* Trust indicators - Mobile optimized */}
        <div className="absolute top-2 right-2 flex flex-col space-y-1">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-1">
            <Shield size={10} className="text-green-600" />
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-1">
            <Truck size={10} className="text-blue-600" />
          </div>
        </div>
      </div>
      
      <div className="p-3 sm:p-4 lg:p-5">
        <h3 
          className="font-semibold text-sm sm:text-base lg:text-lg text-black mb-1 sm:mb-2 line-clamp-1 group-hover:text-gray-700 transition-colors"
          itemProp="name"
        >
          {product.name}
        </h3>
        
        <p 
          className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2"
          itemProp="description"
        >
          {product.description}
        </p>
        
        {/* Enhanced pricing - Mobile optimized */}
        <div className="mb-2 sm:mb-3" itemProp="offers" itemScope itemType="https://schema.org/Offer">
          <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
            <span 
              className="text-lg sm:text-xl lg:text-2xl font-bold text-black"
              itemProp="price"
              content={product.price.toString()}
            >
              KSh {product.price.toLocaleString()}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs sm:text-sm text-gray-400 line-through">
                KSh {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          
          {/* Rating and reviews - Mobile optimized */}
          <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={10} className="text-yellow-400 fill-current" />
              ))}
            </div>
            <span className="text-xs text-gray-500">(4.8/5)</span>
          </div>
          
          <meta itemProp="priceCurrency" content="KES" />
          <meta itemProp="availability" content="https://schema.org/InStock" />
        </div>
        
        {/* Enhanced action buttons - Mobile optimized */}
        <div className="flex space-x-1 sm:space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoreInfo(product);
            }}
            className="flex-1 bg-white hover:bg-gray-50 text-black font-medium py-2 px-2 sm:px-3 rounded-lg transition-all duration-200 shadow-3d hover:shadow-3d-hover transform hover:scale-105 text-xs sm:text-sm border border-gray-300 hover:border-black"
          >
            <span className="hidden sm:inline">View Details</span>
            <span className="sm:hidden">View</span>
          </button>
          <button
            onClick={handleOrderClick}
            className="flex-1 bg-black hover:bg-gray-800 text-white font-medium py-2 px-2 sm:px-3 rounded-lg transition-all duration-200 shadow-3d hover:shadow-3d-hover transform hover:scale-105 text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Order Now</span>
            <span className="sm:hidden">Order</span>
          </button>
        </div>
        
        {/* Quick features - Mobile optimized */}
        <div className="mt-2 sm:mt-3 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center">
            <Shield size={8} className="mr-1 text-green-600" />
            <span className="hidden sm:inline">{product.warranty}</span>
            <span className="sm:hidden">Warranty</span>
          </span>
          <span className="flex items-center">
            <Truck size={8} className="mr-1 text-blue-600" />
            <span className="hidden sm:inline">Fast Delivery</span>
            <span className="sm:hidden">Fast</span>
          </span>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Product } from '../data/products';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  title: string;
  onProductSelect: (product: Product) => void;
  onOrderNow?: (product: Product) => void;
  loading?: boolean;
}

export default function ProductGrid({ products, title, onProductSelect, onOrderNow, loading = false }: ProductGridProps) {
  if (loading) {
    return (
      <div className="px-2 sm:px-4 lg:px-8 mb-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-vantablack mb-3 sm:mb-4 px-2">{title}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl sm:rounded-2xl shadow-3d overflow-hidden border border-gray-50 animate-pulse">
                <div className="w-full h-32 sm:h-40 lg:h-44 bg-gray-200"></div>
                <div className="p-3 sm:p-4 lg:p-5">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-2 sm:h-3 bg-gray-200 rounded mb-3"></div>
                  <div className="h-5 sm:h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="flex space-x-2">
                    <div className="flex-1 h-8 sm:h-10 bg-gray-200 rounded-lg sm:rounded-xl"></div>
                    <div className="flex-1 h-8 sm:h-10 bg-gray-200 rounded-lg sm:rounded-xl"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="px-2 sm:px-4 lg:px-8 mb-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-vantablack mb-3 sm:mb-4 px-2">{title}</h2>
          <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-xl sm:rounded-2xl mx-2">
            <p className="text-gray-500 text-sm sm:text-base">No products found in this category</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 lg:px-8 mb-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-vantablack mb-3 sm:mb-4 px-2">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onMoreInfo={onProductSelect}
              onOrderNow={onOrderNow}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
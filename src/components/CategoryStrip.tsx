import React from 'react';
import { 
  Smartphone, 
  Laptop, 
  Home, 
  Footprints, 
  Watch, 
  Flame,
  Tv,
  Headphones,
  Camera,
  Gamepad2,
  Car,
  Shirt,
  Baby,
  Dumbbell,
  Book,
  Palette
} from 'lucide-react';
import { categories } from '../data/products';

const categoryIcons = {
  phones: Smartphone,
  laptops: Laptop,
  'home-appliances': Home,
  shoes: Footprints,
  watches: Watch,
  'gas-cookers': Flame,
  'tv-audio': Tv,
  'headphones-audio': Headphones,
  'cameras-photography': Camera,
  'gaming-accessories': Gamepad2,
  'automotive-parts': Car,
  'fashion-clothing': Shirt,
  'baby-kids': Baby,
  'sports-fitness': Dumbbell,
  'books-education': Book,
  'art-crafts': Palette,
};

interface CategoryStripProps {
  onCategorySelect: (category: string) => void;
}

export default function CategoryStrip({ onCategorySelect }: CategoryStripProps) {
  const handleCategoryClick = (categoryId: string) => {
    onCategorySelect(categoryId);
  };

  // Triple the categories for seamless infinite scroll
  const tripleCategories = [...categories, ...categories, ...categories];

  return (
    <div className="mt-4 mb-6 px-2 sm:px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Mobile-first responsive container */}
        <div className="relative overflow-hidden">
          {/* Gradient overlays for smooth edges */}
          <div className="absolute left-0 top-0 bottom-0 w-4 sm:w-8 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-4 sm:w-8 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"></div>
          
          {/* Scrolling container */}
          <div className="category-scroll-container">
            <div className="category-scroll-content">
              {tripleCategories.map((category, index) => {
                const IconComponent = categoryIcons[category.id as keyof typeof categoryIcons];
                return (
                  <div
                    key={`${category.id}-${index}`}
                    className="category-card"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <div className="category-icon">
                      <IconComponent size={16} className="text-kenyan-green" />
                    </div>
                    <div className="category-text">
                      <h3 className="category-title">{category.name}</h3>
                      <p className="category-subtitle">Browse all</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
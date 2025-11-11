import React, { useState, useEffect } from 'react';
import { Search, Menu, ShoppingCart, User } from 'lucide-react';

const carouselImages = [
  'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg',
  'https://images.pexels.com/photos/18105/pexels-photo.jpg',
  'https://images.pexels.com/photos/2343468/pexels-photo-2343468.jpeg',
  'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg',
  'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg'
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-3d' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo Section - Mobile optimized */}
          <div className="flex items-center space-x-2 sm:space-x-4 w-1/4 min-w-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Logo */}
              <div className="relative w-8 h-8 sm:w-12 sm:h-12 bg-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-3d border border-gray-100 group hover:scale-105 transition-transform">
                <img 
                  src="/public/assets_task_01jybmgdy7fjfsgmqtg63vgaj2_1750589867_img_3.webp"
                  alt="Lifetime Technology Logo"
                  className="w-6 h-6 sm:w-10 sm:h-10 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-6 h-6 sm:w-10 sm:h-10 bg-black rounded-lg flex items-center justify-center">
                          <span class="text-white font-bold text-xs sm:text-sm">LT</span>
                        </div>
                      `;
                    }
                  }}
                />
              </div>
              
              <div className="hidden sm:block min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-black truncate">
                  Lifetime Technology
                </h1>
                <p className="text-xs text-gray-600 font-medium">Kenya's Premier Tech Store</p>
              </div>
            </div>
          </div>

          {/* Enhanced Carousel Section - Mobile responsive */}
          <div className="relative w-3/4 h-12 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden shadow-3d ml-2 sm:ml-4 group">
            {carouselImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={image}
                  alt={`Tech showcase ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white px-2">
                    <h2 className="text-xs sm:text-lg md:text-xl font-bold mb-1">
                      {index === 0 && (
                        <>
                          <span className="hidden sm:inline">Latest iPhones & Samsung</span>
                          <span className="sm:hidden">Latest Phones</span>
                        </>
                      )}
                      {index === 1 && (
                        <>
                          <span className="hidden sm:inline">MacBooks & Gaming Laptops</span>
                          <span className="sm:hidden">Laptops</span>
                        </>
                      )}
                      {index === 2 && (
                        <>
                          <span className="hidden sm:inline">Smart Home Appliances</span>
                          <span className="sm:hidden">Appliances</span>
                        </>
                      )}
                      {index === 3 && (
                        <>
                          <span className="hidden sm:inline">Premium Watches & Wearables</span>
                          <span className="sm:hidden">Watches</span>
                        </>
                      )}
                      {index === 4 && (
                        <>
                          <span className="hidden sm:inline">Gaming & Audio Gear</span>
                          <span className="sm:hidden">Gaming</span>
                        </>
                      )}
                    </h2>
                    <p className="text-xs opacity-90 font-medium hidden sm:block">
                      {index === 0 && "Authentic • Fast Delivery • Best Prices"}
                      {index === 1 && "Professional Grade • Student Discounts"}
                      {index === 2 && "Energy Efficient • Smart Features"}
                      {index === 3 && "Health Tracking • Style & Function"}
                      {index === 4 && "Immersive Experience • Pro Quality"}
                    </p>
                  </div>
                </div>
                
                {/* Tech pattern overlay */}
                <div className="absolute top-1 right-1 sm:top-2 sm:right-2 opacity-30">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Progress indicators - Mobile optimized */}
            <div className="absolute bottom-1 sm:bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {carouselImages.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1 sm:w-2 sm:h-1 rounded-full transition-all duration-300 ${
                    index === currentImageIndex ? 'bg-white w-3 sm:w-4' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Navigation - Mobile Menu */}
          <div className="md:hidden ml-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl bg-black text-white shadow-3d hover:shadow-3d-hover transform hover:scale-105 transition-all duration-200"
            >
              <Menu size={16} />
            </button>
          </div>

          {/* Enhanced Navigation - Desktop */}
          <div className="hidden md:flex items-center space-x-4 ml-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-black transition-colors" size={20} />
              <input
                type="search"
                placeholder="Search phones, laptops, appliances..."
                className="pl-10 pr-4 py-2 w-64 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent shadow-3d hover:shadow-3d-hover transition-all"
                itemProp="query-input"
              />
            </div>
            
            <button className="relative p-2 rounded-xl bg-black text-white hover:bg-gray-800 transition-all shadow-3d hover:shadow-3d-hover transform hover:scale-105 duration-200 group">
              <ShoppingCart size={20} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-black text-xs rounded-full flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                0
              </span>
            </button>
            
            <button className="p-2 rounded-xl bg-white text-black border border-gray-200 hover:bg-black hover:text-white transition-all shadow-3d hover:shadow-3d-hover transform hover:scale-105 duration-200">
              <User size={20} />
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4 animate-slide-in rounded-b-2xl shadow-3d">
            <div className="flex flex-col space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="search"
                  placeholder="Search electronics..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3">
                <button className="flex-1 py-2 px-4 rounded-xl bg-black text-white font-medium shadow-3d hover:shadow-3d-hover transform hover:scale-105 transition-all duration-200">
                  Cart (0)
                </button>
                <button className="flex-1 py-2 px-4 rounded-xl bg-white text-black border border-gray-200 font-medium shadow-3d hover:shadow-3d-hover transform hover:scale-105 transition-all duration-200 hover:bg-black hover:text-white">
                  Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
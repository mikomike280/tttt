import React from 'react';
import { 
  Star, 
  Truck, 
  ShieldCheck, 
  Headphones, 
  Gift, 
  Zap 
} from 'lucide-react';

const quickLinks = [
  {
    id: 'new-arrivals',
    title: 'New Arrivals',
    description: 'Latest products',
    icon: Star,
    gradient: 'from-purple-500 via-purple-600 to-indigo-600',
    hoverGradient: 'from-purple-600 via-purple-700 to-indigo-700',
    shadowColor: 'shadow-purple-500/25',
    action: () => window.open('https://peppy-shortbread-8e86fa.netlify.app/', '_blank')
  },
  {
    id: 'fast-delivery',
    title: 'Pay on Delivery',
    description: 'Same day delivery',
    icon: Truck,
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    hoverGradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    shadowColor: 'shadow-emerald-500/25'
  },
  {
    id: 'warranty',
    title: 'Warranty',
    description: 'Protected purchases',
    icon: ShieldCheck,
    gradient: 'from-blue-500 via-blue-600 to-blue-700',
    hoverGradient: 'from-blue-600 via-blue-700 to-blue-800',
    shadowColor: 'shadow-blue-500/25'
  },
  {
    id: 'support',
    title: '24/7 Support',
    description: 'Always here to help',
    icon: Headphones,
    gradient: 'from-orange-500 via-red-500 to-pink-600',
    hoverGradient: 'from-orange-600 via-red-600 to-pink-700',
    shadowColor: 'shadow-orange-500/25'
  },
  {
    id: 'offers',
    title: 'Special Offers',
    description: 'Limited time deals',
    icon: Gift,
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-600',
    hoverGradient: 'from-rose-600 via-pink-600 to-fuchsia-700',
    shadowColor: 'shadow-rose-500/25'
  },
  {
    id: 'express',
    title: 'Express Setup',
    description: 'Quick installation',
    icon: Zap,
    gradient: 'from-yellow-500 via-amber-500 to-orange-500',
    hoverGradient: 'from-yellow-600 via-amber-600 to-orange-600',
    shadowColor: 'shadow-yellow-500/25'
  }
];

export default function QuickLinks() {
  return (
    <div className="px-2 sm:px-4 lg:px-8 mb-8 sm:mb-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2 sm:mb-3">Quick Access</h2>
          <p className="text-gray-600 text-base sm:text-lg">Fast access to our most popular services</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
          {quickLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <div
                key={link.id}
                onClick={link.action}
                className={`group relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-3d hover:shadow-3d-hover transition-all duration-500 cursor-pointer border border-gray-100 transform hover:scale-105 hover:-translate-y-2 ${
                  link.action ? 'hover:scale-105' : ''
                }`}
              >
                {/* Gradient Background Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${link.gradient} opacity-0 group-hover:opacity-10 rounded-xl sm:rounded-2xl transition-opacity duration-500`}></div>
                
                {/* Icon Container with Beautiful Gradient */}
                <div className={`relative w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br ${link.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-all duration-500 shadow-lg ${link.shadowColor} group-hover:shadow-xl`}>
                  <IconComponent size={20} className="text-white drop-shadow-sm" />
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="font-bold text-sm sm:text-base text-black mb-1 sm:mb-2 group-hover:text-gray-800 transition-colors duration-300">
                    {link.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                    {link.description}
                  </p>
                </div>
                
                {/* Hover Border Effect */}
                <div className={`absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-transparent group-hover:border-gradient-to-br group-hover:${link.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
                
                {/* Floating Particles Effect */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Bottom Decorative Element with Colorful Dots */}
        <div className="mt-6 sm:mt-8 flex justify-center">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
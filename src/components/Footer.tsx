import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Send, Shield, Truck, Star } from 'lucide-react';

const footerImages = [
  'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg',
  'https://images.pexels.com/photos/18105/pexels-photo.jpg',
  'https://images.pexels.com/photos/2343468/pexels-photo-2343468.jpeg',
  'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg',
];

interface FooterProps {
  pageIndex?: number;
}

// Particle component
const Particle = ({ delay }: { delay: number }) => {
  return (
    <div
      className="absolute w-1 h-1 bg-white rounded-full opacity-60 animate-float"
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${8 + Math.random() * 4}s`,
      }}
    />
  );
};

export default function Footer({ pageIndex = 0 }: FooterProps) {
  const [email, setEmail] = useState('');
  const [particles, setParticles] = useState<number[]>([]);

  // Generate particles on mount
  useEffect(() => {
    const particleCount = 50;
    const particleArray = Array.from({ length: particleCount }, (_, i) => i);
    setParticles(particleArray);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      alert('Thank you for subscribing to our tech newsletter!');
      setEmail('');
    }
  };

  const footerImage = footerImages[pageIndex % footerImages.length];

  return (
    <footer className="relative bg-black text-white overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={footerImage}
          alt="Tech background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <Particle key={particle} delay={particle * 0.2} />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Enhanced Brand Section with Your Logo */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              {/* Your Provided Logo */}
              <div className="relative w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-3d group hover:scale-105 transition-transform">
                <img 
                  src="/public/assets_task_01jybmgdy7fjfsgmqtg63vgaj2_1750589867_img_3.webp"
                  alt="Lifetime Technology Logo"
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    // Fallback to text logo if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                          <span class="text-white font-bold text-lg">LT</span>
                        </div>
                      `;
                    }
                  }}
                />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Lifetime Technology
                </h3>
                <p className="text-gray-300 font-medium">Kenya's Premier Tech Store</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
              🇰🇪 Kenya's most trusted electronics store since 2020. We bring you authentic iPhones, MacBooks, Samsung devices, 
              home appliances, and cutting-edge tech gadgets with lightning-fast delivery across all 47 counties.
            </p>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Shield className="mx-auto mb-2 text-green-400" size={20} />
                <p className="text-xs font-medium text-white">100% Authentic</p>
                <p className="text-xs text-gray-400">Genuine Products</p>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Truck className="mx-auto mb-2 text-blue-400" size={20} />
                <p className="text-xs font-medium text-white">Fast Delivery</p>
                <p className="text-xs text-gray-400">Same Day Nairobi</p>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Star className="mx-auto mb-2 text-yellow-400" size={20} />
                <p className="text-xs font-medium text-white">5-Star Service</p>
                <p className="text-xs text-gray-400">10,000+ Reviews</p>
              </div>
            </div>
            
            {/* Newsletter Subscription */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-white">🔥 Get Tech Deals & New Arrivals</h4>
              <form onSubmit={handleSubscribe} className="flex space-x-2 max-w-sm">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email for exclusive deals"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent backdrop-blur-sm"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-black hover:bg-gray-100 rounded-xl transition-all shadow-3d hover:shadow-3d-hover flex items-center font-medium"
                >
                  <Send size={16} />
                </button>
              </form>
              <p className="text-xs text-gray-400 mt-2">Join 50,000+ tech enthusiasts. Unsubscribe anytime.</p>
            </div>
          </div>

          {/* Product Categories */}
          <div>
            <h4 className="font-semibold mb-4 text-white">🛍️ Shop Categories</h4>
            <ul className="space-y-3">
              <li>
                <a href="#phones" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  📱 Phones & Tablets
                </a>
              </li>
              <li>
                <a href="#laptops" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  💻 Laptops & Computers
                </a>
              </li>
              <li>
                <a href="#appliances" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  🏠 Home Appliances
                </a>
              </li>
              <li>
                <a href="#gaming" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  🎮 Gaming & Accessories
                </a>
              </li>
              <li>
                <a href="#audio" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  🎧 Audio & Headphones
                </a>
              </li>
              <li>
                <a href="#watches" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  ⌚ Watches & Wearables
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="font-semibold mb-4 text-white">📞 Contact & Support</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Phone className="text-white flex-shrink-0 mt-1" size={18} />
                <div>
                  <a href="tel:+254705925800" className="text-white font-medium hover:text-green-400 transition-colors">
                    +254 705 925 800
                  </a>
                  <p className="text-gray-400 text-sm">WhatsApp & Calls</p>
                  <p className="text-gray-400 text-sm">Mon-Sat: 8AM-8PM</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Mail className="text-white flex-shrink-0 mt-1" size={18} />
                <div>
                  <a href="mailto:technologieslifetime@gmail.com" className="text-white hover:text-green-400 transition-colors">
                    technologieslifetime@gmail.com
                  </a>
                  <p className="text-gray-400 text-sm">24/7 Email Support</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="text-white flex-shrink-0 mt-1" size={18} />
                <div>
                  <a 
                    href="https://www.google.com/maps/place/Corner+House/@-1.2849644,36.8213318,17z/data=!3m1!4b1!4m6!3m5!1s0x182f11006472deff:0x8ec5d2d21a7b4d53!8m2!3d-1.2849644!4d36.8239121!16s%2Fg%2F11ltjc0zvj?entry=ttu&g_ep=EgoyMDI1MDYzMC4wIKXMDSoASAFQAw%3D%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-green-400 transition-colors"
                  >
                    Corner House, Nairobi
                  </a>
                  <p className="text-gray-400 text-sm">Delivery to all 47 counties</p>
                  <p className="text-gray-400 text-sm">📍 Click for directions</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-6">
              <h5 className="font-medium mb-3 text-white">🌐 Follow Us</h5>
              <div className="flex space-x-3">
                <a
                  href="https://facebook.com/lifetimetechnologykenya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white hover:text-black transition-all backdrop-blur-sm group"
                >
                  <Facebook size={18} className="group-hover:scale-110 transition-transform" />
                </a>
                <a
                  href="https://instagram.com/lifetimetechnologykenya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white hover:text-black transition-all backdrop-blur-sm group"
                >
                  <Instagram size={18} className="group-hover:scale-110 transition-transform" />
                </a>
                <a
                  href="https://twitter.com/lifetimetech_ke"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white hover:text-black transition-all backdrop-blur-sm group"
                >
                  <Twitter size={18} className="group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Bar */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                © 2024 Lifetime Technology Kenya. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                🇰🇪 Proudly Kenyan • Serving 47 Counties • 50,000+ Happy Customers
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
              <a href="#privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#returns" className="hover:text-white transition-colors">
                Returns & Refunds
              </a>
              <a href="#shipping" className="hover:text-white transition-colors">
                Shipping Info
              </a>
              <a 
                href="/admin.html" 
                className="text-xs text-gray-500 hover:text-white transition-colors opacity-50 hover:opacity-100"
              >
                Admin
              </a>
            </div>
          </div>
          
          {/* Trust Badges */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <Shield size={14} className="text-green-400" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star size={14} className="text-yellow-400" />
                <span>5-Star Rated</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck size={14} className="text-blue-400" />
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={14} className="text-white" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
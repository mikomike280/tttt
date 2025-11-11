import React, { useState, useEffect } from 'react';
import { X, CreditCard, Truck, CheckCircle, AlertCircle, Smartphone, Package, User, Mail, MapPin } from 'lucide-react';
import { supabase, Order } from '../lib/supabase';

interface OrderFormProps {
  isVisible: boolean;
  onClose: () => void;
  productName?: string;
}

export default function OrderForm({ isVisible, onClose, productName = '' }: OrderFormProps) {
  const [formData, setFormData] = useState<Omit<Order, 'id' | 'created_at'>>({
    full_name: '',
    phone_number: '',
    email: '',
    delivery_address: '',
    product_name: productName,
    payment_method: 'pay-on-delivery'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update product name when prop changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, product_name: productName }));
  }, [productName]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const modal = document.getElementById('orderFormContainer');
      
      if (isVisible && modal && !modal.contains(target) && !isSubmitting) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isVisible, onClose, isSubmitting]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible && !isSubmitting) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, onClose, isSubmitting]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.full_name.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.phone_number.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Valid email is required');
      return false;
    }
    if (!formData.delivery_address.trim()) {
      setError('Delivery address is required');
      return false;
    }
    if (!formData.product_name.trim()) {
      setError('Product name is required');
      return false;
    }
    return true;
  };

  const sendOrderEmail = async (orderData: any) => {
    try {
      const emailData = {
        customerName: orderData.full_name,
        phoneNumber: orderData.phone_number,
        email: orderData.email,
        totalAmount: 0, // Will be updated when amount is available
        items: [{
          name: orderData.product_name,
          quantity: 1,
          price: 0 // Will be updated when price is available
        }],
        deliveryAddress: orderData.delivery_address,
        paymentMethod: orderData.payment_method,
        orderNumber: orderData.order_number
      };

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-order-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        console.error('Failed to send order email');
      } else {
        console.log('Order email sent successfully');
      }
    } catch (error) {
      console.error('Error sending order email:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const { data: order, error: supabaseError } = await supabase
        .from('orders')
        .insert([{
          ...formData,
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      // Send email notification
      await sendOrderEmail({
        ...formData,
        order_number: order.order_number
      });

      setShowSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          full_name: '',
          phone_number: '',
          email: '',
          delivery_address: '',
          product_name: '',
          payment_method: 'pay-on-delivery'
        });
        setShowSuccess(false);
        onClose();
      }, 3000);

    } catch (err) {
      console.error('Error submitting order:', err);
      setError('Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError(null);
      setShowSuccess(false);
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div 
        id="orderFormContainer"
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-3d animate-fade-in border border-gray-100"
      >
        {/* Enhanced Header with Black Theme */}
        <div className="relative bg-gradient-to-r from-black via-gray-800 to-black text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Package className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Place Your Order</h2>
                <p className="text-gray-300 text-sm">Fast & secure ordering process</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-50 backdrop-blur-sm"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-4 right-20 opacity-20">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        </div>

        {/* Success Message with Beautiful Design */}
        {showSuccess && (
          <div className="mx-6 mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl flex items-center space-x-4 shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <CheckCircle className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-green-800 text-lg">Order Submitted Successfully! 🎉</h3>
              <p className="text-green-700">We'll contact you shortly to confirm your order and arrange delivery.</p>
            </div>
          </div>
        )}

        {/* Error Message with Beautiful Design */}
        {error && (
          <div className="mx-6 mt-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl flex items-center space-x-3 shadow-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
              <AlertCircle className="text-white" size={20} />
            </div>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Enhanced Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-8">
            {/* Personal Information Section */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-black to-gray-800 rounded-xl flex items-center justify-center">
                  <User className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-bold text-black">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="full_name" className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                    <User size={16} className="text-black" />
                    <span>Full Name *</span>
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:opacity-50 shadow-sm"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone_number" className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                    <Smartphone size={16} className="text-black" />
                    <span>Phone Number *</span>
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:opacity-50 shadow-sm"
                    placeholder="+254 712 345 678"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <Mail size={16} className="text-black" />
                  <span>Email Address *</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:opacity-50 shadow-sm"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* Product Information Section */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-black to-gray-800 rounded-xl flex items-center justify-center">
                  <Package className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-bold text-black">Product Information</h3>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="productInput" className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <Package size={16} className="text-black" />
                  <span>Product Name *</span>
                </label>
                <input
                  type="text"
                  id="productInput"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:opacity-50 shadow-sm"
                  placeholder="Enter product name"
                />
              </div>
            </div>

            {/* Delivery Information Section */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-black to-gray-800 rounded-xl flex items-center justify-center">
                  <MapPin className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-bold text-black">Delivery Information</h3>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="delivery_address" className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <MapPin size={16} className="text-black" />
                  <span>Delivery Address *</span>
                </label>
                <textarea
                  id="delivery_address"
                  name="delivery_address"
                  value={formData.delivery_address}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:opacity-50 resize-none shadow-sm"
                  placeholder="Enter your complete delivery address including building name, street, area, and city"
                />
              </div>
            </div>

            {/* Payment Method Section - Only Pay on Delivery */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-black to-gray-800 rounded-xl flex items-center justify-center">
                  <CreditCard className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-bold text-black">Payment Method</h3>
              </div>
              
              <div className="space-y-4">
                {/* Payment Method Visual Indicator */}
                <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-black bg-gray-50 shadow-lg">
                  <Truck className="text-black" size={24} />
                  <div>
                    <span className="text-lg font-semibold text-gray-800">💰 Pay on Delivery</span>
                    <p className="text-sm text-gray-600">Pay cash when you receive your order</p>
                    <p className="text-xs text-green-600 font-medium">✅ Available nationwide • Safe & Secure</p>
                  </div>
                </div>
                
                <input type="hidden" name="payment_method" value="pay-on-delivery" />
              </div>
            </div>
          </div>

          {/* Enhanced Submit Section */}
          <div className="mt-8 pt-6 border-t-2 border-gray-100">
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 bg-white hover:bg-gray-50 text-black font-semibold py-4 px-6 rounded-xl transition-all duration-300 border-2 border-gray-300 hover:border-gray-400 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || showSuccess}
                className="flex-1 bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-3d hover:shadow-3d-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 transform hover:scale-105"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting Order...</span>
                  </>
                ) : (
                  <>
                    <Package size={20} />
                    <span>Submit Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
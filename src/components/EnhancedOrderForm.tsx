import React, { useState, useEffect } from 'react';
import { X, Package, User, Mail, MapPin, ShoppingCart, Plus, Minus, Trash2, CreditCard } from 'lucide-react';
import { EnhancedOrderManager, CartItem, DeliveryZone } from '../lib/supabase-enhanced';

interface EnhancedOrderFormProps {
  isVisible: boolean;
  onClose: () => void;
  initialProduct?: {
    id: string;
    name: string;
    price: number;
    image: string;
    colors?: string[];
    sizes?: string[];
  };
}

export default function EnhancedOrderForm({ isVisible, onClose, initialProduct }: EnhancedOrderFormProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerData, setCustomerData] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    delivery_address: ''
  });
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible) {
      loadDeliveryZones();
      if (initialProduct) {
        addToCart(initialProduct);
      }
    }
  }, [isVisible, initialProduct]);

  const loadDeliveryZones = async () => {
    try {
      const zones = await EnhancedOrderManager.getDeliveryZones();
      setDeliveryZones(zones);
    } catch (error) {
      console.error('Error loading delivery zones:', error);
    }
  };

  const addToCart = (product: any, options?: { color?: string; size?: string }) => {
    const existingItemIndex = cart.findIndex(
      item => item.product_id === product.id && 
      JSON.stringify(item.options) === JSON.stringify(options)
    );

    if (existingItemIndex >= 0) {
      updateQuantity(existingItemIndex, cart[existingItemIndex].quantity + 1);
    } else {
      const newItem: CartItem = {
        product_id: product.id,
        product_name: product.name,
        product_image: product.image,
        unit_price: product.price,
        quantity: 1,
        options: options || {}
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }

    const updatedCart = [...cart];
    updatedCart[index].quantity = newQuantity;
    setCart(updatedCart);
  };

  const removeFromCart = (index: number) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const deliveryFee = selectedZone?.delivery_fee || 0;
    return subtotal + deliveryFee;
  };

  const handleAddressChange = (address: string) => {
    setCustomerData(prev => ({ ...prev, delivery_address: address }));
    
    // Auto-detect delivery zone based on address
    const addressLower = address.toLowerCase();
    const matchedZone = deliveryZones.find(zone => 
      zone.counties.some(county => addressLower.includes(county.toLowerCase()))
    );
    
    if (matchedZone) {
      setSelectedZone(matchedZone);
    } else {
      // Default to Nairobi Metro
      const defaultZone = deliveryZones.find(z => z.name === 'Nairobi Metro');
      setSelectedZone(defaultZone || deliveryZones[0]);
    }
  };

  const validateForm = (): boolean => {
    if (!customerData.full_name.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!customerData.phone_number.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!customerData.email.trim() || !/\S+@\S+\.\S+/.test(customerData.email)) {
      setError('Valid email is required');
      return false;
    }
    if (!customerData.delivery_address.trim()) {
      setError('Delivery address is required');
      return false;
    }
    if (cart.length === 0) {
      setError('Please add at least one item to your cart');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const order = await EnhancedOrderManager.createOrderWithItems(
        {
          ...customerData,
          payment_method: 'Pay on Delivery',
          delivery_zone_id: selectedZone?.id
        },
        cart
      );

      setShowSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setCart([]);
        setCustomerData({
          full_name: '',
          phone_number: '',
          email: '',
          delivery_address: ''
        });
        setSelectedZone(null);
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
      setCart([]);
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-vantablack/75 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-3d animate-fade-in border border-gray-100">
        {/* Enhanced Header */}
        <div className="relative bg-gradient-to-r from-vantablack via-gray-800 to-vantablack text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <ShoppingCart className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Complete Your Order</h2>
                <p className="text-gray-300 text-sm">Add multiple items • Pay on delivery</p>
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
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mx-6 mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl flex items-center space-x-4 shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-green-800 text-lg">Order Submitted Successfully! 🎉</h3>
              <p className="text-green-700">We'll contact you shortly to confirm your order and arrange delivery.</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Customer Info & Delivery */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <User className="text-white" size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-vantablack">Customer Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={customerData.full_name}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, full_name: e.target.value }))}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:opacity-50 shadow-sm"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={customerData.phone_number}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, phone_number: e.target.value }))}
                        required
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:opacity-50 shadow-sm"
                        placeholder="+254 712 345 678"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={customerData.email}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:opacity-50 shadow-sm"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <MapPin className="text-white" size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-vantablack">Delivery Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Delivery Address *
                    </label>
                    <textarea
                      value={customerData.delivery_address}
                      onChange={(e) => handleAddressChange(e.target.value)}
                      required
                      disabled={isSubmitting}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:opacity-50 resize-none shadow-sm"
                      placeholder="Enter your complete delivery address including county, town, and specific location"
                    />
                  </div>

                  {selectedZone && (
                    <div className="bg-white rounded-xl p-4 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-green-800">{selectedZone.name}</p>
                          <p className="text-sm text-green-600">
                            Delivery: {selectedZone.estimated_days} day{selectedZone.estimated_days > 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-700">
                            KSh {selectedZone.delivery_fee.toLocaleString()}
                          </p>
                          <p className="text-xs text-green-600">Delivery fee</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Cart & Summary */}
            <div className="space-y-6">
              {/* Shopping Cart */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="text-white" size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-vantablack">Your Cart ({cart.length} items)</h3>
                </div>

                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {cart.map((item, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 border border-purple-200 shadow-sm">
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-vantablack text-sm">{item.product_name}</h4>
                          {item.options && Object.keys(item.options).length > 0 && (
                            <div className="text-xs text-gray-600 mt-1">
                              {Object.entries(item.options).map(([key, value]) => (
                                <span key={key} className="mr-2">{key}: {value}</span>
                              ))}
                            </div>
                          )}
                          <p className="text-sm font-bold text-purple-600">
                            KSh {item.unit_price.toLocaleString()} each
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(index, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-purple-200 hover:bg-purple-300 flex items-center justify-center transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromCart(index)}
                            className="w-8 h-8 rounded-full bg-red-200 hover:bg-red-300 flex items-center justify-center transition-colors ml-2"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 text-right">
                        <span className="font-bold text-vantablack">
                          Total: KSh {(item.unit_price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}

                  {cart.length === 0 && (
                    <div className="text-center py-8">
                      <ShoppingCart className="mx-auto text-gray-400 mb-2" size={48} />
                      <p className="text-gray-500">Your cart is empty</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-xl flex items-center justify-center">
                    <CreditCard className="text-white" size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-vantablack">Order Summary</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">KSh {calculateSubtotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee:</span>
                    <span className="font-semibold">
                      KSh {(selectedZone?.delivery_fee || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-orange-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-vantablack">Total:</span>
                      <span className="text-2xl font-bold text-orange-600">
                        KSh {calculateTotal().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white rounded-xl border border-orange-200">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="text-orange-600" size={20} />
                    <div>
                      <p className="font-semibold text-vantablack">💰 Pay on Delivery</p>
                      <p className="text-sm text-gray-600">Pay cash when you receive your order</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 pt-6 border-t-2 border-gray-100">
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 bg-white hover:bg-gray-50 text-vantablack font-semibold py-4 px-6 rounded-xl transition-all duration-300 border-2 border-gray-300 hover:border-gray-400 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || showSuccess || cart.length === 0}
                className="flex-1 bg-gradient-to-r from-vantablack to-gray-800 hover:from-gray-800 hover:to-vantablack text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-3d hover:shadow-3d-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 transform hover:scale-105"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting Order...</span>
                  </>
                ) : (
                  <>
                    <Package size={20} />
                    <span>Place Order - KSh {calculateTotal().toLocaleString()}</span>
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
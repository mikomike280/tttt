import React, { useState } from 'react';
import { X, CreditCard, Truck, Smartphone } from 'lucide-react';
import { Product, kenyanCounties } from '../data/products';
import { supabase } from '../lib/supabase';

interface CheckoutModalProps {
  product: Product;
  options: any;
  onClose: () => void;
}

export default function CheckoutModal({ product, options, onClose }: CheckoutModalProps) {
  const [selectedCounty, setSelectedCounty] = useState('');
  const [address, setAddress] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPrice = product.price * options.quantity;

  const sendOrderEmail = async (orderData: any) => {
    try {
      const emailData = {
        customerName: orderData.full_name,
        phoneNumber: orderData.phone_number,
        email: orderData.email,
        totalAmount: totalPrice,
        items: [{
          name: `${product.name} ${options.color ? `(${options.color})` : ''} ${options.size ? `(${options.size})` : ''}`,
          quantity: options.quantity,
          price: product.price
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
    
    if (!customerName || !customerPhone || !customerEmail || !address) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order in database
      const orderData = {
        full_name: customerName,
        phone_number: customerPhone,
        email: customerEmail,
        delivery_address: `${address}, ${selectedCounty}`,
        product_name: `${product.name} ${options.color ? `(${options.color})` : ''} ${options.size ? `(${options.size})` : ''} - Qty: ${options.quantity}`,
        payment_method: 'Pay on Delivery',
        amount: totalPrice,
        status: 'pending'
      };

      const { data: order, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) throw error;

      // Send email notification
      await sendOrderEmail({
        ...orderData,
        order_number: order.order_number
      });

      alert('🎉 Order placed successfully! We will contact you shortly to confirm your order and arrange delivery.');
      onClose();
    } catch (error) {
      console.error('Error placing order:', error);
      alert('❌ Failed to place order. Please try again or contact our support team.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-vantablack/75 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-3d">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-vantablack">Complete Your Order</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-vantablack mb-3">Order Summary</h3>
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="font-medium text-vantablack">{product.name}</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {options.color && <p>Color: {options.color}</p>}
                  {options.size && <p>Size: {options.size}</p>}
                  <p>Quantity: {options.quantity}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-vantablack">
                  KSh {totalPrice.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-6">
            <h3 className="font-semibold text-vantablack mb-3">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-vantablack focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+254..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-vantablack focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-vantablack focus:border-transparent"
              />
            </div>
          </div>

          {/* Payment Method - Only Pay on Delivery */}
          <div className="mb-6">
            <h3 className="font-semibold text-vantablack mb-3">Payment Method</h3>
            <div className="p-4 rounded-xl border-2 border-vantablack bg-vantablack/5">
              <div className="flex items-center space-x-3">
                <Truck className="text-vantablack" size={24} />
                <div>
                  <h4 className="font-medium text-vantablack">Pay on Delivery</h4>
                  <p className="text-sm text-gray-600">Cash payment when you receive your order</p>
                  <p className="text-xs text-green-600 font-medium">✅ Available nationwide • Safe & Secure</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="mb-6">
            <h3 className="font-semibold text-vantablack mb-3">Delivery Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  County *
                </label>
                <select
                  required
                  value={selectedCounty}
                  onChange={(e) => setSelectedCounty(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-vantablack focus:border-transparent"
                >
                  <option value="">Select County</option>
                  {kenyanCounties.map((county) => (
                    <option key={county} value={county}>
                      {county}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Address *
                </label>
                <textarea
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your detailed address including building name, street name, etc."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-vantablack focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Total and Submit */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-semibold text-vantablack">Total Amount:</span>
              <span className="text-2xl font-bold text-vantablack">
                KSh {totalPrice.toLocaleString()}
              </span>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-white hover:bg-gray-50 text-vantablack font-medium py-3 px-6 rounded-xl transition-colors border border-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-vantablack hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-xl transition-colors shadow-3d hover:shadow-3d-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <Truck size={16} />
                    <span>Place Order</span>
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
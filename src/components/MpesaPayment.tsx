import React, { useState } from 'react';
import { X, Smartphone, Shield, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface MpesaPaymentProps {
  isVisible: boolean;
  onClose: () => void;
  amount: number;
  productName: string;
  onSuccess?: (transactionId: string) => void;
}

interface PaymentStatus {
  status: 'idle' | 'processing' | 'success' | 'failed';
  message: string;
  transactionId?: string;
}

export default function MpesaPayment({ isVisible, onClose, amount, productName, onSuccess }: MpesaPaymentProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ status: 'idle', message: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const formatPhoneNumber = (phone: string) => {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Convert to international format
    if (cleaned.startsWith('0')) {
      return '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('254')) {
      return cleaned;
    } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
      return '254' + cleaned;
    }
    
    return cleaned;
  };

  const validatePhoneNumber = (phone: string) => {
    const formatted = formatPhoneNumber(phone);
    return formatted.length === 12 && formatted.startsWith('254');
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhoneNumber(phoneNumber)) {
      setPaymentStatus({
        status: 'failed',
        message: 'Please enter a valid Kenyan phone number (e.g., 0712345678)'
      });
      return;
    }

    setIsProcessing(true);
    setPaymentStatus({ status: 'processing', message: 'Initiating M-Pesa payment...' });

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      // Call STK Push API
      const response = await fetch('/api/mpesa/stk-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          amount: amount,
          productName: productName,
          accountReference: `LT-${Date.now()}`,
          transactionDesc: `Payment for ${productName}`
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPaymentStatus({
          status: 'processing',
          message: 'Payment request sent! Please check your phone and enter your M-Pesa PIN.'
        });

        // Poll for payment status
        pollPaymentStatus(data.checkoutRequestId);
      } else {
        throw new Error(data.message || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus({
        status: 'failed',
        message: error instanceof Error ? error.message : 'Payment failed. Please try again.'
      });
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (checkoutRequestId: string) => {
    const maxAttempts = 30; // 30 attempts = 1.5 minutes
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/mpesa/payment-status/${checkoutRequestId}`);
        const data = await response.json();

        if (data.status === 'completed') {
          setPaymentStatus({
            status: 'success',
            message: 'Payment successful! Your order has been confirmed.',
            transactionId: data.transactionId
          });
          setIsProcessing(false);
          
          if (onSuccess) {
            onSuccess(data.transactionId);
          }
          
          // Auto-close after 3 seconds
          setTimeout(() => {
            onClose();
          }, 3000);
          
        } else if (data.status === 'failed' || data.status === 'cancelled') {
          setPaymentStatus({
            status: 'failed',
            message: data.message || 'Payment was cancelled or failed.'
          });
          setIsProcessing(false);
          
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 3000); // Poll every 3 seconds
        } else {
          setPaymentStatus({
            status: 'failed',
            message: 'Payment timeout. Please try again or contact support.'
          });
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('Status polling error:', error);
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 3000);
        } else {
          setPaymentStatus({
            status: 'failed',
            message: 'Unable to verify payment status. Please contact support.'
          });
          setIsProcessing(false);
        }
      }
    };

    poll();
  };

  const handleClose = () => {
    if (!isProcessing) {
      setPhoneNumber('');
      setPaymentStatus({ status: 'idle', message: '' });
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-vantablack/75 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-3d animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Smartphone className="text-green-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-vantablack">M-Pesa Payment</h2>
              <p className="text-sm text-gray-600">Secure mobile payment</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Payment Details */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-vantablack mb-2">Payment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Product:</span>
                <span className="font-medium text-vantablack">{productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-green-600">KSh {amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {paymentStatus.message && (
            <div className={`p-4 rounded-xl mb-6 flex items-center space-x-3 ${
              paymentStatus.status === 'success' ? 'bg-green-50 border border-green-200' :
              paymentStatus.status === 'failed' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              {paymentStatus.status === 'processing' && <Loader className="text-blue-600 animate-spin" size={20} />}
              {paymentStatus.status === 'success' && <CheckCircle className="text-green-600" size={20} />}
              {paymentStatus.status === 'failed' && <AlertCircle className="text-red-600" size={20} />}
              <div>
                <p className={`text-sm font-medium ${
                  paymentStatus.status === 'success' ? 'text-green-800' :
                  paymentStatus.status === 'failed' ? 'text-red-800' :
                  'text-blue-800'
                }`}>
                  {paymentStatus.message}
                </p>
                {paymentStatus.transactionId && (
                  <p className="text-xs text-green-600 mt-1">
                    Transaction ID: {paymentStatus.transactionId}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Payment Form */}
          {paymentStatus.status !== 'success' && (
            <form onSubmit={handlePayment} className="space-y-6">
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  M-Pesa Phone Number *
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0712345678 or 254712345678"
                  required
                  disabled={isProcessing}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the phone number registered with M-Pesa
                </p>
              </div>

              {/* Security Notice */}
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-start space-x-3">
                  <Shield className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                  <div className="text-sm">
                    <p className="font-medium text-green-800 mb-1">Secure Payment</p>
                    <ul className="text-green-700 space-y-1">
                      <li>• Your payment is processed securely through Safaricom</li>
                      <li>• You'll receive an M-Pesa prompt on your phone</li>
                      <li>• Enter your M-Pesa PIN to complete payment</li>
                      <li>• No card details or passwords required</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="flex-1 bg-white hover:bg-gray-50 text-vantablack font-medium py-3 px-6 rounded-xl transition-colors border border-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !phoneNumber.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-xl transition-colors shadow-3d hover:shadow-3d-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader className="animate-spin" size={16} />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Smartphone size={16} />
                      <span>Pay KSh {amount.toLocaleString()}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Success Actions */}
          {paymentStatus.status === 'success' && (
            <div className="flex justify-center">
              <button
                onClick={handleClose}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-xl transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
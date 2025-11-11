import React from 'react';
import { Wifi, RefreshCw, AlertCircle } from 'lucide-react';

interface NetworkErrorProps {
  onRetry?: () => void;
  message?: string;
}

export default function NetworkError({ 
  onRetry, 
  message = 'Unable to connect to the server. Please check your internet connection and try again.' 
}: NetworkErrorProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-3d p-8 text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Wifi className="text-orange-600" size={32} />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Connection Problem
        </h1>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        
        <div className="space-y-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
            >
              <RefreshCw size={16} />
              <span>Try Again</span>
            </button>
          )}
          
          <div className="text-sm text-gray-500">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <AlertCircle size={14} />
              <span>Troubleshooting tips:</span>
            </div>
            <ul className="text-left space-y-1">
              <li>• Check your internet connection</li>
              <li>• Refresh the page</li>
              <li>• Try again in a few moments</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
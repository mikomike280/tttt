import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { testSupabaseConnection, initializeSampleData } from '../lib/supabase-connection-test';

export default function SupabaseConnectionStatus() {
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean;
    message: string;
    error?: string;
    url?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const result = await testSupabaseConnection();
      setConnectionStatus(result);
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: 'Connection test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initializeData = async () => {
    setIsInitializing(true);
    try {
      const success = await initializeSampleData();
      if (success) {
        alert('✅ Sample data initialized successfully!');
        // Refresh the page to show the new data
        window.location.reload();
      } else {
        alert('❌ Failed to initialize sample data. Check console for details.');
      }
    } catch (error) {
      alert('❌ Error initializing data: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  if (!connectionStatus && isLoading) {
    return (
      <div className="fixed top-4 right-4 bg-white rounded-xl shadow-3d p-4 border border-gray-200 z-50">
        <div className="flex items-center space-x-3">
          <RefreshCw className="animate-spin text-blue-600" size={20} />
          <span className="text-sm font-medium">Testing Supabase connection...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-white rounded-xl shadow-3d p-4 border border-gray-200 z-50 max-w-sm">
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg ${connectionStatus?.success ? 'bg-green-100' : 'bg-red-100'}`}>
          {connectionStatus?.success ? (
            <CheckCircle className="text-green-600" size={20} />
          ) : (
            <XCircle className="text-red-600" size={20} />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Database size={16} className="text-gray-600" />
            <span className="text-sm font-semibold text-gray-900">Supabase Status</span>
          </div>
          
          <p className={`text-sm ${connectionStatus?.success ? 'text-green-700' : 'text-red-700'}`}>
            {connectionStatus?.message || 'Testing connection...'}
          </p>
          
          {connectionStatus?.url && (
            <p className="text-xs text-gray-500 mt-1">
              Connected to: {connectionStatus.url.substring(0, 30)}...
            </p>
          )}
          
          {connectionStatus?.error && (
            <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
              <div className="flex items-center space-x-1 mb-1">
                <AlertCircle size={12} className="text-red-600" />
                <span className="text-xs font-medium text-red-800">Error Details:</span>
              </div>
              <p className="text-xs text-red-700">{connectionStatus.error}</p>
            </div>
          )}
          
          <div className="flex space-x-2 mt-3">
            <button
              onClick={testConnection}
              disabled={isLoading}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
              <span>Test</span>
            </button>
            
            {connectionStatus?.success && (
              <button
                onClick={initializeData}
                disabled={isInitializing}
                className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
              >
                <Database size={12} />
                <span>{isInitializing ? 'Initializing...' : 'Init Data'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
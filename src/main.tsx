import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { logger } from './lib/logger.ts';

// Log app startup
logger.info('Application starting', {
  environment: import.meta.env.MODE,
  timestamp: new Date().toISOString(),
  url: window.location.href,
  userAgent: navigator.userAgent
});

// Check for required environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mholriycnpbkdaxlmmby.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ob2xyaXljbnBia2RheGxtbWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDQxMjMsImV4cCI6MjA2NTgyMDEyM30.PO3kDxJru16MWBBJyNPhA9mp3hWV0DTIhrNvdcGxogg';

// Validate environment variables
if (!supabaseUrl || supabaseUrl === 'undefined') {
  logger.error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey || supabaseAnonKey === 'undefined') {
  logger.error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Log environment status
logger.info('Environment variables status', {
  hasSupabaseUrl: !!supabaseUrl && supabaseUrl !== 'undefined',
  hasSupabaseKey: !!supabaseAnonKey && supabaseAnonKey !== 'undefined',
  supabaseUrl: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'missing',
  keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  logger.error('Root element not found');
  throw new Error('Root element not found');
}

try {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  logger.info('Application rendered successfully');
} catch (error) {
  logger.error('Failed to render application', error);
  
  // Fallback error display
  rootElement.innerHTML = `
    <div style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f9fafb;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 1rem;
    ">
      <div style="
        max-width: 500px;
        background: white;
        border-radius: 1rem;
        padding: 2rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        text-align: center;
      ">
        <div style="
          width: 4rem;
          height: 4rem;
          background: #fee2e2;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          font-size: 2rem;
        ">💥</div>
        <h1 style="
          font-size: 1.5rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 1rem;
        ">Application Error</h1>
        <p style="
          color: #6b7280;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        ">
          Something went wrong while starting the application. Please refresh the page or contact support.
        </p>
        <button onclick="window.location.reload()" style="
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
        ">Refresh Page</button>
      </div>
    </div>
  `;
}
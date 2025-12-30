
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';

// Get publishable key from environment - use fallback for development
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_aWRlYWwtbW9yYXktNTkuY2xlcmsuYWNjb3VudHMuZGV2JA';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Only render with Clerk if we have a publishable key
if (PUBLISHABLE_KEY) {
  root.render(
    <React.StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <App />
      </ClerkProvider>
    </React.StrictMode>
  );
} else {
  // Fallback if no key - show error message
  root.render(
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#064e3b',
      color: 'white',
      fontFamily: 'system-ui',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div>
        <h1>Configuration Error</h1>
        <p>Missing VITE_CLERK_PUBLISHABLE_KEY</p>
        <p style={{ opacity: 0.6, fontSize: '14px' }}>
          Add this to your .env.local file or Vercel environment variables
        </p>
      </div>
    </div>
  );
}

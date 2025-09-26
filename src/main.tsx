import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { errorHandlingService } from './services/ErrorHandlingService';
import { optimizeResourceLoading, monitorWebVitals } from './utils/performance';
import './index.css';

// Initialize performance optimizations
try {
  // Preload critical resources
  optimizeResourceLoading();

  // Monitor web vitals in production
  if ((import.meta as any).env?.PROD) {
    monitorWebVitals();
  }
} catch (error) {
  console.warn('Performance monitoring initialization failed:', error);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary
      onError={(error, errorInfo) => {
        errorHandlingService.handleError(error, {
          component: 'Root',
          action: 'render',
          additionalData: { errorInfo },
        });
      }}
    >
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

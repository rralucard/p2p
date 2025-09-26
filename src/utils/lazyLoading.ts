import { lazy } from 'react';

/**
 * Utility functions for code splitting and lazy loading
 */

/**
 * Create a lazy-loaded component with error boundary
 */
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  const LazyComponent = lazy(importFn);
  
  return LazyComponent;
};

/**
 * Preload a lazy component
 */
export const preloadComponent = (importFn: () => Promise<any>) => {
  return importFn();
};

/**
 * Create a lazy route component
 */
export const createLazyRoute = (importFn: () => Promise<any>) => {
  return lazy(importFn);
};

/**
 * Intersection Observer utility for lazy loading
 */
export class LazyLoadObserver {
  private observer: IntersectionObserver;
  private callbacks: Map<Element, () => void> = new Map();

  constructor(options?: IntersectionObserverInit) {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const callback = this.callbacks.get(entry.target);
            if (callback) {
              callback();
              this.unobserve(entry.target);
            }
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
        ...options,
      }
    );
  }

  observe(element: Element, callback: () => void) {
    this.callbacks.set(element, callback);
    this.observer.observe(element);
  }

  unobserve(element: Element) {
    this.callbacks.delete(element);
    this.observer.unobserve(element);
  }

  disconnect() {
    this.observer.disconnect();
    this.callbacks.clear();
  }
}

/**
 * Image preloader utility
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Batch image preloader
 */
export const preloadImages = async (srcs: string[]): Promise<void> => {
  const promises = srcs.map(preloadImage);
  await Promise.all(promises);
};

/**
 * Resource hints utility
 */
export const addResourceHint = (
  href: string,
  rel: 'preload' | 'prefetch' | 'preconnect' | 'dns-prefetch',
  as?: string,
  crossorigin?: boolean
) => {
  const link = document.createElement('link');
  link.rel = rel;
  link.href = href;
  
  if (as) {
    link.as = as;
  }
  
  if (crossorigin) {
    link.crossOrigin = 'anonymous';
  }
  
  document.head.appendChild(link);
};

/**
 * Preload critical resources
 */
export const preloadCriticalResources = () => {
  // Preload Google Maps API if needed
  addResourceHint('https://maps.googleapis.com', 'preconnect');
  addResourceHint('https://maps.gstatic.com', 'preconnect');
  
  // Preload fonts
  addResourceHint('https://fonts.googleapis.com', 'preconnect');
  addResourceHint('https://fonts.gstatic.com', 'preconnect', undefined, true);
};

/**
 * Dynamic import with retry logic
 */
export const dynamicImportWithRetry = async <T>(
  importFn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await importFn();
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  
  throw new Error('Dynamic import failed after retries');
};
import React, { Suspense } from 'react';
import { createLazyComponent } from '../utils/lazyLoading';
import { LoadingIndicator } from './LoadingIndicator';

/**
 * Lazy-loaded components for better performance
 */

// Lazy load heavy components
export const LazyMapView = createLazyComponent(
  () => import('./MapView')
);

export const LazyVenueDetail = createLazyComponent(
  () => import('./VenueDetail')
);

export const LazySearchHistory = createLazyComponent(
  () => import('./SearchHistory')
);

/**
 * Wrapper component with suspense and error boundary
 */
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback,
  errorFallback,
}) => {
  const defaultFallback = (
    <div className="flex items-center justify-center p-8">
      <LoadingIndicator type="spinner" size="md" text="加载中..." />
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

/**
 * Lazy Map View with proper loading state
 */
interface LazyMapViewWrapperProps {
  center: any;
  userLocations: any[];
  venues: any[];
  onVenueClick: (venue: any) => void;
}

export const LazyMapViewWrapper: React.FC<LazyMapViewWrapperProps> = (props) => {
  return (
    <LazyWrapper
      fallback={
        <div className="h-96 lg:h-[500px] bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <LoadingIndicator type="spinner" size="lg" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">加载地图中...</p>
          </div>
        </div>
      }
    >
      <LazyMapView {...props} />
    </LazyWrapper>
  );
};

/**
 * Lazy Venue Detail with proper loading state
 */
interface LazyVenueDetailWrapperProps {
  venue: any;
  userLocations: [any, any];
  onBack: () => void;
}

export const LazyVenueDetailWrapper: React.FC<LazyVenueDetailWrapperProps> = (props) => {
  return (
    <LazyWrapper
      fallback={
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      }
    >
      <LazyVenueDetail {...props} />
    </LazyWrapper>
  );
};

/**
 * Lazy Search History with proper loading state
 */
interface LazySearchHistoryWrapperProps {
  onHistorySelect: (item: any) => void;
  onClose: () => void;
}

export const LazySearchHistoryWrapper: React.FC<LazySearchHistoryWrapperProps> = (props) => {
  return (
    <LazyWrapper
      fallback={
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg max-w-2xl w-full">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <LazySearchHistory {...props} />
    </LazyWrapper>
  );
};
import React from 'react';

/**
 * 加载指示器类型
 */
type LoadingType = 'spinner' | 'dots' | 'pulse' | 'skeleton';

/**
 * 加载指示器大小
 */
type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * 加载指示器Props接口
 */
interface LoadingIndicatorProps {
  type?: LoadingType;
  size?: LoadingSize;
  text?: string;
  className?: string;
  overlay?: boolean;
}

/**
 * 获取尺寸类名
 */
const getSizeClasses = (size: LoadingSize) => {
  switch (size) {
    case 'sm':
      return 'w-4 h-4';
    case 'md':
      return 'w-6 h-6';
    case 'lg':
      return 'w-8 h-8';
    case 'xl':
      return 'w-12 h-12';
    default:
      return 'w-6 h-6';
  }
};

/**
 * 旋转加载器
 */
const SpinnerLoader: React.FC<{ size: LoadingSize; className?: string }> = ({ size, className }) => (
  <div
    className={`animate-spin rounded-full border-2 border-gray-200 dark:border-gray-700 border-t-primary-600 ${getSizeClasses(size)} ${className || ''}`}
    role="status"
    aria-label="加载中"
  />
);

/**
 * 点状加载器
 */
const DotsLoader: React.FC<{ size: LoadingSize; className?: string }> = ({ size, className }) => {
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4';
  
  return (
    <div className={`flex space-x-1 ${className || ''}`} role="status" aria-label="加载中">
      <div className={`${dotSize} bg-primary-600 rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
      <div className={`${dotSize} bg-primary-600 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
      <div className={`${dotSize} bg-primary-600 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
    </div>
  );
};

/**
 * 脉冲加载器
 */
const PulseLoader: React.FC<{ size: LoadingSize; className?: string }> = ({ size, className }) => (
  <div
    className={`bg-primary-600 rounded-full animate-pulse-gentle ${getSizeClasses(size)} ${className || ''}`}
    role="status"
    aria-label="加载中"
  />
);

/**
 * 主加载指示器组件
 */
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  type = 'spinner',
  size = 'md',
  text,
  className = '',
  overlay = false,
}) => {
  const renderLoader = () => {
    switch (type) {
      case 'spinner':
        return <SpinnerLoader size={size} />;
      case 'dots':
        return <DotsLoader size={size} />;
      case 'pulse':
        return <PulseLoader size={size} />;
      default:
        return <SpinnerLoader size={size} />;
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {renderLoader()}
      {text && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 font-medium animate-pulse-gentle">
          {text}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-large animate-scale-in">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

/**
 * 骨架屏组件Props接口
 */
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: boolean;
  animate?: boolean;
}

/**
 * 基础骨架屏组件
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  className = '',
  rounded = false,
  animate = true,
}) => {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`bg-gray-300 ${animate ? 'animate-pulse' : ''} ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
      style={style}
      role="status"
      aria-label="加载中"
    />
  );
};

/**
 * 店铺卡片骨架屏
 */
export const VenueCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
    <Skeleton height="12rem" className="rounded-none" />
    <div className="p-4 space-y-3">
      <Skeleton height="1.5rem" width="80%" />
      <Skeleton height="1rem" width="60%" />
      <div className="flex justify-between items-center">
        <div className="flex space-x-3">
          <Skeleton height="1rem" width="3rem" />
          <Skeleton height="1rem" width="2rem" />
        </div>
        <Skeleton height="1rem" width="4rem" />
      </div>
    </div>
  </div>
);

/**
 * 地点输入骨架屏
 */
export const LocationInputSkeleton: React.FC = () => (
  <div className="space-y-2">
    <Skeleton height="1rem" width="6rem" />
    <Skeleton height="2.5rem" className="rounded-lg" />
  </div>
);

/**
 * 店铺详情骨架屏
 */
export const VenueDetailSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
    <Skeleton height="16rem" className="rounded-none" />
    <div className="p-6 space-y-4">
      <Skeleton height="2rem" width="70%" />
      <Skeleton height="1rem" width="50%" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton height="1rem" />
        <Skeleton height="1rem" />
      </div>
      <div className="space-y-2">
        <Skeleton height="1rem" />
        <Skeleton height="1rem" width="80%" />
        <Skeleton height="1rem" width="60%" />
      </div>
      <div className="flex space-x-3">
        <Skeleton height="2.5rem" width="6rem" />
        <Skeleton height="2.5rem" width="6rem" />
      </div>
    </div>
  </div>
);

/**
 * 地图骨架屏
 */
export const MapSkeleton: React.FC<{ height?: string }> = ({ height = '24rem' }) => (
  <div className={`bg-gray-300 animate-pulse rounded-lg flex items-center justify-center`} style={{ height }}>
    <div className="text-gray-500 text-center">
      <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
      <p className="text-sm">地图加载中...</p>
    </div>
  </div>
);

export default LoadingIndicator;
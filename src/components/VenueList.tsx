import React, { useMemo, useState } from 'react';
import { Venue } from '../types/venue';

/**
 * 排序选项
 */
type SortOption = 'distance' | 'rating' | 'price';

/**
 * VenueList组件的Props接口
 */
interface VenueListProps {
  venues: Venue[];
  onVenueSelect: (venue: Venue) => void;
  loading?: boolean;
  className?: string;
}

/**
 * 店铺卡片组件
 */
interface VenueCardProps {
  venue: Venue;
  onClick: (venue: Venue) => void;
}

const VenueCard: React.FC<VenueCardProps> = ({ venue, onClick }) => {
  const formatDistance = (distance: number): string => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const formatPriceLevel = (priceLevel: number): string => {
    return '¥'.repeat(Math.max(1, Math.min(4, priceLevel)));
  };

  const formatRating = (rating: number): string => {
    return rating.toFixed(1);
  };

  const getOpenStatus = (openingHours: any): { isOpen: boolean; text: string } => {
    if (!openingHours) {
      return { isOpen: false, text: '营业时间未知' };
    }
    
    if (typeof openingHours.openNow === 'boolean') {
      return {
        isOpen: openingHours.openNow,
        text: openingHours.openNow ? '营业中' : '已关门'
      };
    }
    
    return { isOpen: false, text: '营业时间未知' };
  };

  const openStatus = getOpenStatus(venue.openingHours);

  return (
    <div
      className="card card-interactive group animate-fade-in hover:shadow-glow transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={() => onClick(venue)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(venue);
        }
      }}
      aria-label={`选择店铺 ${venue.name}`}
    >
      {/* 店铺图片 */}
      <div className="h-48 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
        {venue.photos && venue.photos.length > 0 ? (
          <img
            src={venue.photos[0].photoReference}
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
            <svg
              className="w-16 h-16 text-gray-400 dark:text-gray-500 group-hover:scale-110 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
        )}
        
        {/* 营业状态标签 */}
        <div className="absolute top-3 right-3">
          <span
            className={`badge ${
              openStatus.isOpen
                ? 'badge-success'
                : 'badge-error'
            } backdrop-blur-sm bg-opacity-90`}
          >
            {openStatus.text}
          </span>
        </div>
        
        {/* 悬停遮罩 */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-90 group-hover:scale-100">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-3">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 店铺信息 */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
            {venue.name}
          </h3>
          <div className="flex items-center ml-3 bg-gray-50 dark:bg-gray-700 rounded-lg px-2 py-1">
            <svg
              className="w-4 h-4 text-yellow-500 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {formatRating(venue.rating)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              ({venue.userRatingsTotal})
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {venue.address}
        </p>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                {formatDistance(venue.distance)}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span className="text-sm font-semibold text-success-600 dark:text-success-400">
                {formatPriceLevel(venue.priceLevel)}
              </span>
            </div>
          </div>
          
          <button
            className="btn btn-ghost btn-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 group/btn"
            onClick={(e) => {
              e.stopPropagation();
              onClick(venue);
            }}
          >
            <span>查看详情</span>
            <svg className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * 加载状态组件
 */
const LoadingVenueCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="card overflow-hidden animate-pulse"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="h-48 bg-gray-300 dark:bg-gray-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
          <div className="p-5 space-y-3">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-lg" />
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
            <div className="flex justify-between items-center">
              <div className="flex space-x-3">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12" />
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-8" />
              </div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * 空状态组件
 */
const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-16 animate-fade-in">
      <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
        <svg
          className="h-16 w-16 text-gray-400 dark:text-gray-500 animate-pulse-gentle"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
        未找到合适的店铺
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
        尝试选择不同的店铺类型或调整搜索条件，我们会为您找到更多选择
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <span className="badge badge-gray">尝试扩大搜索范围</span>
        <span className="badge badge-gray">选择更多店铺类型</span>
        <span className="badge badge-gray">检查地点输入</span>
      </div>
    </div>
  );
};

/**
 * 店铺列表组件
 * 展示搜索结果，支持排序和交互
 */
export const VenueList: React.FC<VenueListProps> = ({
  venues,
  onVenueSelect,
  loading = false,
  className = '',
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('distance');

  // 排序后的店铺列表
  const sortedVenues = useMemo(() => {
    const venuesCopy = [...venues];
    
    switch (sortBy) {
      case 'distance':
        return venuesCopy.sort((a, b) => a.distance - b.distance);
      case 'rating':
        return venuesCopy.sort((a, b) => b.rating - a.rating);
      case 'price':
        return venuesCopy.sort((a, b) => a.priceLevel - b.priceLevel);
      default:
        return venuesCopy;
    }
  }, [venues, sortBy]);

  // 处理排序选择
  const handleSortChange = (newSortBy: SortOption) => {
    setSortBy(newSortBy);
  };

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            搜索中...
          </h2>
        </div>
        <LoadingVenueCards />
      </div>
    );
  }

  // 如果没有结果，显示空状态
  if (!loading && venues.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* 标题和排序控件 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            找到 {venues.length} 个推荐地点
          </h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">排序:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            className="input text-sm py-2 px-3 min-w-[120px]"
            aria-label="选择排序方式"
          >
            <option value="distance">距离最近</option>
            <option value="rating">评分最高</option>
            <option value="price">价格最低</option>
          </select>
        </div>
      </div>

      {/* 店铺列表网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedVenues.map((venue, index) => (
          <div
            key={venue.placeId}
            style={{ animationDelay: `${index * 100}ms` }}
            className="animate-slide-up"
          >
            <VenueCard
              venue={venue}
              onClick={onVenueSelect}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VenueList;
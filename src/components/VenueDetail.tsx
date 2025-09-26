import React, { useState, useEffect } from 'react';
import { Venue, Location, DirectionsResult } from '../types';

/**
 * VenueDetail组件的Props接口
 */
interface VenueDetailProps {
  venue: Venue;
  userLocations: [Location, Location];
  onBack: () => void;
  className?: string;
}

/**
 * 照片轮播组件
 */
interface PhotoCarouselProps {
  photos: any[];
  venueName: string;
}

const PhotoCarousel: React.FC<PhotoCarouselProps> = ({ photos, venueName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  if (!photos || photos.length === 0) {
    return (
      <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg">
        <svg
          className="w-16 h-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative h-64 rounded-lg overflow-hidden bg-gray-200">
      <img
        src={photos[currentIndex].photoReference}
        alt={`${venueName} - 图片 ${currentIndex + 1}`}
        className="w-full h-full object-cover"
      />
      
      {photos.length > 1 && (
        <>
          {/* 上一张按钮 */}
          <button
            onClick={prevPhoto}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
            aria-label="上一张图片"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* 下一张按钮 */}
          <button
            onClick={nextPhoto}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
            aria-label="下一张图片"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* 指示器 */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
                aria-label={`查看第 ${index + 1} 张图片`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/**
 * 路线信息组件
 */
interface RouteInfoProps {
  userLocations: [Location, Location];
  venue: Venue;
}

const RouteInfo: React.FC<RouteInfoProps> = ({ userLocations, venue }) => {
  const [directions, setDirections] = useState<DirectionsResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟获取路线信息
    // 在实际实现中，这里会调用LocationService获取真实的路线数据
    const mockDirections: DirectionsResult[] = [
      {
        distance: {
          text: `${(venue.distance / 2 / 1000).toFixed(1)}km`,
          value: venue.distance / 2
        },
        duration: {
          text: `${Math.round(venue.distance / 2 / 1000 * 3)}分钟`,
          value: Math.round(venue.distance / 2 / 1000 * 3) * 60
        },
        routes: []
      },
      {
        distance: {
          text: `${(venue.distance / 2 / 1000).toFixed(1)}km`,
          value: venue.distance / 2
        },
        duration: {
          text: `${Math.round(venue.distance / 2 / 1000 * 3)}分钟`,
          value: Math.round(venue.distance / 2 / 1000 * 3) * 60
        },
        routes: []
      }
    ];

    setTimeout(() => {
      setDirections(mockDirections);
      setLoading(false);
    }, 1000);
  }, [userLocations, venue]);

  if (loading) {
    return (
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">路线信息</h3>
        <div className="space-y-3">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">路线信息</h3>
      <div className="space-y-3">
        {userLocations.map((location, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white rounded-md">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${index === 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {index === 0 ? '地点A' : '地点B'}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-48">
                  {location.address}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {directions[index]?.distance.text || '计算中...'}
              </p>
              <p className="text-xs text-gray-500">
                {directions[index]?.duration.text || ''}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * 店铺详情组件
 * 显示完整的店铺信息，包括照片轮播、详细信息和路线信息
 */
export const VenueDetail: React.FC<VenueDetailProps> = ({
  venue,
  userLocations,
  onBack,
  className = '',
}) => {
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
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* 返回按钮 */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          aria-label="返回店铺列表"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回列表
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* 照片轮播 */}
        <div className="p-6 pb-4">
          <PhotoCarousel photos={venue.photos} venueName={venue.name} />
        </div>

        {/* 基本信息 */}
        <div className="px-6 pb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{venue.name}</h1>
              <p className="text-gray-600 mb-2">{venue.address}</p>
              
              {/* 评分和价格 */}
              <div className="flex items-center space-x-4 mb-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-medium text-gray-900">{formatRating(venue.rating)}</span>
                  <span className="text-gray-500 ml-1">({venue.userRatingsTotal} 条评价)</span>
                </div>
                
                <div className="flex items-center">
                  <span className="font-medium text-green-600">{formatPriceLevel(venue.priceLevel)}</span>
                </div>
                
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-600">{formatDistance(venue.distance)}</span>
                </div>
              </div>
            </div>
            
            {/* 营业状态 */}
            <div className="ml-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  openStatus.isOpen
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {openStatus.text}
              </span>
            </div>
          </div>

          {/* 联系信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">联系信息</h3>
              <div className="space-y-2">
                {venue.phoneNumber && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href={`tel:${venue.phoneNumber}`} className="text-blue-600 hover:text-blue-800">
                      {venue.phoneNumber}
                    </a>
                  </div>
                )}
                
                {venue.website && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                    </svg>
                    <a 
                      href={venue.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      访问官网
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* 营业时间 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">营业时间</h3>
              <div className="space-y-1">
                {venue.openingHours?.weekdayText && venue.openingHours.weekdayText.length > 0 ? (
                  venue.openingHours.weekdayText.map((dayText, index) => (
                    <p key={index} className="text-sm text-gray-600">
                      {dayText}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">营业时间信息暂无</p>
                )}
              </div>
            </div>
          </div>

          {/* 路线信息 */}
          <RouteInfo userLocations={userLocations} venue={venue} />
        </div>
      </div>
    </div>
  );
};

export default VenueDetail;
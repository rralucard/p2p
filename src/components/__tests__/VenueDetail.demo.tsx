import React, { useState } from 'react';
import { VenueDetail } from '../VenueDetail';
import { Venue, Location } from '../../types';

// Demo venue data
const demoVenues: Venue[] = [
  {
    placeId: 'demo-restaurant-1',
    name: '北京烤鸭王',
    address: '北京市东城区前门大街128号',
    location: {
      address: '北京市东城区前门大街128号',
      latitude: 39.9042,
      longitude: 116.4074
    },
    rating: 4.8,
    userRatingsTotal: 256,
    priceLevel: 4,
    photos: [
      {
        photoReference: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
        width: 400,
        height: 300
      },
      {
        photoReference: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
        width: 400,
        height: 300
      },
      {
        photoReference: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
        width: 400,
        height: 300
      }
    ],
    openingHours: {
      openNow: true,
      periods: [],
      weekdayText: [
        '周一: 11:00 - 22:00',
        '周二: 11:00 - 22:00',
        '周三: 11:00 - 22:00',
        '周四: 11:00 - 22:00',
        '周五: 11:00 - 23:00',
        '周六: 10:00 - 23:00',
        '周日: 10:00 - 22:00'
      ]
    },
    phoneNumber: '+86-10-67028833',
    website: 'https://example-restaurant.com',
    types: ['restaurant', 'chinese_restaurant'],
    distance: 1200
  },
  {
    placeId: 'demo-cafe-1',
    name: 'Blue Bottle Coffee',
    address: '北京市朝阳区三里屯太古里南区S4-31',
    location: {
      address: '北京市朝阳区三里屯太古里南区S4-31',
      latitude: 39.9368,
      longitude: 116.4472
    },
    rating: 4.5,
    userRatingsTotal: 89,
    priceLevel: 3,
    photos: [
      {
        photoReference: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
        width: 400,
        height: 300
      },
      {
        photoReference: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
        width: 400,
        height: 300
      }
    ],
    openingHours: {
      openNow: false,
      periods: [],
      weekdayText: [
        '周一: 07:00 - 20:00',
        '周二: 07:00 - 20:00',
        '周三: 07:00 - 20:00',
        '周四: 07:00 - 20:00',
        '周五: 07:00 - 21:00',
        '周六: 08:00 - 21:00',
        '周日: 08:00 - 20:00'
      ]
    },
    phoneNumber: '+86-10-64172288',
    website: 'https://bluebottlecoffee.com',
    types: ['cafe', 'coffee_shop'],
    distance: 800
  },
  {
    placeId: 'demo-minimal',
    name: '简约小店',
    address: '北京市海淀区中关村大街1号',
    location: {
      address: '北京市海淀区中关村大街1号',
      latitude: 39.9889,
      longitude: 116.3061
    },
    rating: 3.2,
    userRatingsTotal: 12,
    priceLevel: 1,
    photos: [],
    openingHours: {
      openNow: false,
      periods: [],
      weekdayText: []
    },
    types: ['store'],
    distance: 2500
  }
];

const demoUserLocations: [Location, Location] = [
  {
    address: '北京市海淀区中关村大街1号',
    latitude: 39.9889,
    longitude: 116.3061
  },
  {
    address: '北京市东城区王府井大街138号',
    latitude: 39.9097,
    longitude: 116.4109
  }
];

/**
 * VenueDetail组件演示
 * 展示不同类型店铺的详情页面
 */
export const VenueDetailDemo: React.FC = () => {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(demoVenues[0]);

  const handleBack = () => {
    setSelectedVenue(null);
  };

  const handleSelectVenue = (venue: Venue) => {
    setSelectedVenue(venue);
  };

  if (selectedVenue) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <VenueDetail
          venue={selectedVenue}
          userLocations={demoUserLocations}
          onBack={handleBack}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">VenueDetail 组件演示</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoVenues.map((venue) => (
            <div
              key={venue.placeId}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
              onClick={() => handleSelectVenue(venue)}
            >
              {venue.photos.length > 0 ? (
                <img
                  src={venue.photos[0].photoReference}
                  alt={venue.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{venue.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{venue.address}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-medium">{venue.rating.toFixed(1)}</span>
                  </div>
                  
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    查看详情 →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">功能特性</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">照片轮播</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 支持多张照片展示</li>
                <li>• 左右导航按钮</li>
                <li>• 底部指示器</li>
                <li>• 无照片时显示占位符</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">详细信息</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 店铺基本信息展示</li>
                <li>• 联系方式（电话、网站）</li>
                <li>• 营业时间显示</li>
                <li>• 评分和价格等级</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">路线信息</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 从两个地点到店铺的距离</li>
                <li>• 预估到达时间</li>
                <li>• 加载状态处理</li>
                <li>• 可视化路线展示</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">用户体验</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 响应式设计</li>
                <li>• 键盘导航支持</li>
                <li>• 无障碍访问优化</li>
                <li>• 返回列表功能</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDetailDemo;
import React, { useState } from 'react';
import MapView from '../MapView';
import { Location, Venue } from '../../types';

/**
 * MapView 组件演示
 * 展示地图组件的各种功能和交互
 */
const MapViewDemo: React.FC = () => {
    const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

    // 模拟数据
    const center: Location = {
        address: '北京市朝阳区国贸中心',
        latitude: 39.9088,
        longitude: 116.4123
    };

    const userLocations: Location[] = [
        {
            address: '北京市朝阳区三里屯',
            latitude: 39.9368,
            longitude: 116.4472,
            placeId: 'sanlitun'
        },
        {
            address: '北京市朝阳区望京',
            latitude: 39.9965,
            longitude: 116.4706,
            placeId: 'wangjing'
        }
    ];

    const venues: Venue[] = [
        {
            placeId: 'venue1',
            name: '北京饭店',
            address: '北京市东城区王府井大街33号',
            location: {
                address: '北京市东城区王府井大街33号',
                latitude: 39.9139,
                longitude: 116.4074
            },
            rating: 4.5,
            userRatingsTotal: 1250,
            priceLevel: 4,
            photos: [
                {
                    photoReference: 'photo1',
                    width: 400,
                    height: 300
                }
            ],
            openingHours: {
                openNow: true,
                periods: [
                    {
                        open: { day: 0, time: '0600' },
                        close: { day: 0, time: '2200' }
                    }
                ],
                weekdayText: ['周一: 06:00 - 22:00', '周二: 06:00 - 22:00']
            },
            phoneNumber: '+86 10 6513 7766',
            website: 'https://www.beijinghotel.com.cn',
            types: ['restaurant', 'lodging'],
            distance: 850
        },
        {
            placeId: 'venue2',
            name: 'Starbucks 国贸店',
            address: '北京市朝阳区建国门外大街1号国贸商城',
            location: {
                address: '北京市朝阳区建国门外大街1号国贸商城',
                latitude: 39.9077,
                longitude: 116.4138
            },
            rating: 4.2,
            userRatingsTotal: 890,
            priceLevel: 2,
            photos: [
                {
                    photoReference: 'photo2',
                    width: 400,
                    height: 300
                }
            ],
            openingHours: {
                openNow: true,
                periods: [
                    {
                        open: { day: 0, time: '0700' },
                        close: { day: 0, time: '2100' }
                    }
                ],
                weekdayText: ['周一: 07:00 - 21:00', '周二: 07:00 - 21:00']
            },
            phoneNumber: '+86 10 6505 2266',
            types: ['cafe'],
            distance: 320
        },
        {
            placeId: 'venue3',
            name: '华贸购物中心',
            address: '北京市朝阳区建国路81号',
            location: {
                address: '北京市朝阳区建国路81号',
                latitude: 39.9045,
                longitude: 116.4201
            },
            rating: 4.3,
            userRatingsTotal: 2100,
            priceLevel: 3,
            photos: [
                {
                    photoReference: 'photo3',
                    width: 400,
                    height: 300
                }
            ],
            openingHours: {
                openNow: true,
                periods: [
                    {
                        open: { day: 0, time: '1000' },
                        close: { day: 0, time: '2200' }
                    }
                ],
                weekdayText: ['周一: 10:00 - 22:00', '周二: 10:00 - 22:00']
            },
            phoneNumber: '+86 10 8588 1234',
            website: 'https://www.huamao.com',
            types: ['shopping_mall'],
            distance: 650
        }
    ];

    const handleVenueClick = (venue: Venue) => {
        setSelectedVenue(venue);
        console.log('Venue clicked:', venue);
    };

    const resetSelection = () => {
        setSelectedVenue(null);
    };

    return (
        <div className="w-full h-screen bg-gray-100">
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="bg-white shadow-sm p-4 border-b">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">MapView 组件演示</h1>
                    <p className="text-gray-600">
                        展示地图组件的功能：用户地点标记（蓝色）、中心点标记（绿色）、店铺标记（红色）
                    </p>

                    {/* Controls */}
                    <div className="mt-4 flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow"></div>
                            <span className="text-sm text-gray-600">用户地点 ({userLocations.length})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow"></div>
                            <span className="text-sm text-gray-600">中心点</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow"></div>
                            <span className="text-sm text-gray-600">推荐店铺 ({venues.length})</span>
                        </div>
                        {selectedVenue && (
                            <button
                                onClick={resetSelection}
                                className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                            >
                                清除选择
                            </button>
                        )}
                    </div>
                </div>

                {/* Map Container */}
                <div className="flex-1 flex">
                    {/* Map */}
                    <div className="flex-1">
                        <MapView
                            center={center}
                            userLocations={userLocations}
                            venues={venues}
                            onVenueClick={handleVenueClick}
                            className="h-full"
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="w-80 bg-white border-l overflow-y-auto">
                        <div className="p-4">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">地点信息</h2>

                            {/* Center Point */}
                            <div className="mb-6">
                                <h3 className="text-md font-medium text-green-600 mb-2 flex items-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                    中心点
                                </h3>
                                <p className="text-sm text-gray-600">{center.address}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {center.latitude.toFixed(4)}, {center.longitude.toFixed(4)}
                                </p>
                            </div>

                            {/* User Locations */}
                            <div className="mb-6">
                                <h3 className="text-md font-medium text-blue-600 mb-2 flex items-center">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                    用户地点
                                </h3>
                                {userLocations.map((location, index) => (
                                    <div key={index} className="mb-2 p-2 bg-blue-50 rounded">
                                        <p className="text-sm text-gray-700">{location.address}</p>
                                        <p className="text-xs text-gray-500">
                                            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Venues */}
                            <div className="mb-6">
                                <h3 className="text-md font-medium text-red-600 mb-2 flex items-center">
                                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                    推荐店铺
                                </h3>
                                {venues.map((venue) => (
                                    <div
                                        key={venue.placeId}
                                        className={`mb-2 p-3 rounded cursor-pointer transition-colors ${selectedVenue?.placeId === venue.placeId
                                            ? 'bg-red-100 border-2 border-red-300'
                                            : 'bg-red-50 hover:bg-red-100'
                                            }`}
                                        onClick={() => handleVenueClick(venue)}
                                    >
                                        <h4 className="font-medium text-gray-800">{venue.name}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{venue.address}</p>
                                        <div className="flex items-center gap-2 mt-2 text-sm">
                                            <span className="text-yellow-500">★ {venue.rating}</span>
                                            <span className="text-gray-400">•</span>
                                            <span className="text-gray-600">{venue.distance}m</span>
                                            <span className="text-gray-400">•</span>
                                            <span className="text-gray-600">
                                                {'$'.repeat(venue.priceLevel)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Selected Venue Details */}
                            {selectedVenue && (
                                <div className="border-t pt-4">
                                    <h3 className="text-md font-medium text-gray-800 mb-2">选中店铺详情</h3>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <h4 className="font-medium text-gray-800">{selectedVenue.name}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{selectedVenue.address}</p>
                                        <div className="mt-2 space-y-1 text-sm">
                                            <p><span className="text-gray-500">评分:</span> {selectedVenue.rating} ({selectedVenue.userRatingsTotal} 评价)</p>
                                            <p><span className="text-gray-500">价格:</span> {'$'.repeat(selectedVenue.priceLevel)}</p>
                                            <p><span className="text-gray-500">距离:</span> {selectedVenue.distance}m</p>
                                            <p><span className="text-gray-500">营业状态:</span> {selectedVenue.openingHours.openNow ? '营业中' : '已关闭'}</p>
                                            {selectedVenue.phoneNumber && (
                                                <p><span className="text-gray-500">电话:</span> {selectedVenue.phoneNumber}</p>
                                            )}
                                            {selectedVenue.website && (
                                                <p>
                                                    <span className="text-gray-500">网站:</span>{' '}
                                                    <a href={selectedVenue.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                        访问
                                                    </a>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapViewDemo;
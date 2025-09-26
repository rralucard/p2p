import React from 'react';
import { Location, Venue } from '../types';

interface MapDebugInfoProps {
  center: Location;
  userLocations: Location[];
  venues: Venue[];
}

export const MapDebugInfo: React.FC<MapDebugInfoProps> = ({
  center,
  userLocations,
  venues
}) => {
  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-sm z-50 text-xs">
      <h3 className="font-bold mb-2">地图调试信息</h3>
      
      <div className="mb-2">
        <strong>中心点:</strong>
        <div>地址: {center?.address || '未设置'}</div>
        <div>坐标: {center?.latitude?.toFixed(4)}, {center?.longitude?.toFixed(4)}</div>
      </div>
      
      <div className="mb-2">
        <strong>用户地点 ({userLocations?.length || 0}):</strong>
        {userLocations?.map((loc, i) => (
          <div key={i}>
            {i + 1}. {loc.address} ({loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)})
          </div>
        ))}
      </div>
      
      <div className="mb-2">
        <strong>店铺 ({venues?.length || 0}):</strong>
        {venues?.slice(0, 3).map((venue, i) => (
          <div key={i}>
            {i + 1}. {venue.name} - {venue.distance}m
          </div>
        ))}
        {venues?.length > 3 && <div>...还有 {venues.length - 3} 个</div>}
      </div>
      
      <div className="text-green-600">
        API Key: {(import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ? '已设置' : '未设置'}
      </div>
    </div>
  );
};
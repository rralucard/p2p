import React from 'react';
import { VenueType } from '../types';

interface VenueTypeSelectorProps {
  selectedTypes: VenueType[];
  onTypesChange: (types: VenueType[]) => void;
  error?: string;
  className?: string;
}

// 店铺类型的中文显示名称和图标
const VENUE_TYPE_CONFIG = {
  [VenueType.RESTAURANT]: {
    label: '餐厅',
    icon: '🍽️',
    description: '各类餐厅和美食'
  },
  [VenueType.CAFE]: {
    label: '咖啡厅',
    icon: '☕',
    description: '咖啡厅和茶室'
  },
  [VenueType.MOVIE_THEATER]: {
    label: '电影院',
    icon: '🎬',
    description: '电影院和影城'
  },
  [VenueType.SHOPPING_MALL]: {
    label: '购物中心',
    icon: '🛍️',
    description: '商场和购物中心'
  },
  [VenueType.BAR]: {
    label: '酒吧',
    icon: '🍸',
    description: '酒吧和夜店'
  },
  [VenueType.PARK]: {
    label: '公园',
    icon: '🌳',
    description: '公园和户外场所'
  },
  [VenueType.MUSEUM]: {
    label: '博物馆',
    icon: '🏛️',
    description: '博物馆和展览馆'
  },
  [VenueType.AMUSEMENT_PARK]: {
    label: '游乐园',
    icon: '🎡',
    description: '游乐园和主题公园'
  },
  [VenueType.BOWLING_ALLEY]: {
    label: '保龄球馆',
    icon: '🎳',
    description: '保龄球和娱乐中心'
  },
  [VenueType.GYM]: {
    label: '健身房',
    icon: '💪',
    description: '健身房和运动场所'
  }
};

export const VenueTypeSelector: React.FC<VenueTypeSelectorProps> = ({
  selectedTypes,
  onTypesChange,
  error,
  className = ''
}) => {
  const handleTypeToggle = (type: VenueType) => {
    const isSelected = selectedTypes.includes(type);
    
    if (isSelected) {
      // 移除选中的类型
      onTypesChange(selectedTypes.filter(t => t !== type));
    } else {
      // 添加新的类型
      onTypesChange([...selectedTypes, type]);
    }
  };

  const handleSelectAll = () => {
    onTypesChange(Object.values(VenueType));
  };

  const handleClearAll = () => {
    onTypesChange([]);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 标题和操作按钮 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          选择约会场所类型
        </h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            全选
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            清空
          </button>
        </div>
      </div>

      {/* 类型选择网格 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.entries(VENUE_TYPE_CONFIG).map(([type, config]) => {
          const venueType = type as VenueType;
          const isSelected = selectedTypes.includes(venueType);
          
          return (
            <button
              key={type}
              type="button"
              onClick={() => handleTypeToggle(venueType)}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200
                hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${isSelected
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {/* 选中状态指示器 */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              
              {/* 图标 */}
              <div className="text-2xl mb-2">{config.icon}</div>
              
              {/* 标签 */}
              <div className="font-medium text-sm">{config.label}</div>
              
              {/* 描述 */}
              <div className="text-xs text-gray-500 mt-1 leading-tight">
                {config.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* 选择计数 */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          已选择 {selectedTypes.length} 种类型
          {selectedTypes.length > 0 && (
            <span className="ml-2 text-gray-400">
              ({selectedTypes.map(type => VENUE_TYPE_CONFIG[type].label).join(', ')})
            </span>
          )}
        </span>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* 提示信息 */}
      {selectedTypes.length === 0 && !error && (
        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
          💡 请至少选择一种约会场所类型来获取推荐
        </div>
      )}
    </div>
  );
};

export default VenueTypeSelector;
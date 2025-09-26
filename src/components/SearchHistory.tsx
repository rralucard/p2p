import React, { useState, useEffect } from 'react';
import { SearchHistoryItem, VenueType } from '../types';
import { searchHistoryService } from '../services/SearchHistoryService';

interface SearchHistoryProps {
  onHistorySelect: (item: SearchHistoryItem) => void;
  onClose?: () => void;
  className?: string;
}

/**
 * 搜索历史组件
 * 显示和管理用户的搜索历史记录
 */
export const SearchHistory: React.FC<SearchHistoryProps> = ({
  onHistorySelect,
  onClose,
  className = ''
}) => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHistory, setFilteredHistory] = useState<SearchHistoryItem[]>([]);
  const [showAll, setShowAll] = useState(false);

  // 加载历史记录
  useEffect(() => {
    const loadHistory = () => {
      const historyData = searchHistoryService.getHistory();
      setHistory(historyData);
      setFilteredHistory(historyData);
    };

    loadHistory();
  }, []);

  // 搜索过滤
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = searchHistoryService.searchHistory(searchQuery);
      setFilteredHistory(filtered);
    } else {
      setFilteredHistory(history);
    }
  }, [searchQuery, history]);

  // 处理历史项选择
  const handleHistorySelect = (item: SearchHistoryItem) => {
    onHistorySelect(item);
    onClose?.();
  };

  // 删除历史项
  const handleDeleteItem = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    searchHistoryService.removeHistoryItem(id);
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    setFilteredHistory(updatedHistory.filter(item => 
      !searchQuery.trim() || searchHistoryService.searchHistory(searchQuery).some(h => h.id === item.id)
    ));
  };

  // 清除所有历史
  const handleClearAll = () => {
    if (window.confirm('确定要清除所有搜索历史吗？')) {
      searchHistoryService.clearHistory();
      setHistory([]);
      setFilteredHistory([]);
    }
  };

  // 格式化时间
  const formatTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return '今天 ' + date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffDays === 1) {
      return '昨天 ' + date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  // 获取店铺类型显示名称
  const getVenueTypeDisplayName = (type: VenueType): string => {
    const displayNames: Partial<Record<VenueType, string>> = {
      [VenueType.RESTAURANT]: '餐厅',
      [VenueType.CAFE]: '咖啡厅',
      [VenueType.MOVIE_THEATER]: '电影院',
      [VenueType.SHOPPING_MALL]: '购物中心',
      [VenueType.BAR]: '酒吧',
      [VenueType.PARK]: '公园'
    };
    
    return displayNames[type] || type;
  };

  // 显示的历史记录
  const displayHistory = showAll ? filteredHistory : filteredHistory.slice(0, 5);

  if (history.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">搜索历史</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500">暂无搜索历史</p>
          <p className="text-sm text-gray-400 mt-1">开始搜索后，历史记录会显示在这里</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">搜索历史</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleClearAll}
            className="text-sm text-red-600 hover:text-red-700 transition-colors"
          >
            清除全部
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 搜索框 */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索历史记录..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* 历史记录列表 */}
      <div className="max-h-96 overflow-y-auto">
        {filteredHistory.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">没有找到匹配的历史记录</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {displayHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => handleHistorySelect(item)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* 地点信息 */}
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.location1.address}
                        </p>
                      </div>
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.location2.address}
                        </p>
                      </div>
                    </div>

                    {/* 店铺类型 */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.venueTypes.map((type) => (
                        <span
                          key={type}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {getVenueTypeDisplayName(type)}
                        </span>
                      ))}
                    </div>

                    {/* 时间和结果数量 */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatTime(item.timestamp)}</span>
                      <span>{item.resultCount} 个结果</span>
                    </div>
                  </div>

                  {/* 删除按钮 */}
                  <button
                    onClick={(e) => handleDeleteItem(item.id, e)}
                    className="ml-2 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 显示更多按钮 */}
      {filteredHistory.length > 5 && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            {showAll ? '收起' : `显示全部 ${filteredHistory.length} 条记录`}
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchHistory;
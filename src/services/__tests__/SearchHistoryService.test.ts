import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SearchHistoryService } from '../SearchHistoryService';
import { VenueType, Location, SearchParams } from '../../types';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('SearchHistoryService', () => {
  let searchHistoryService: SearchHistoryService;

  const mockLocation1: Location = {
    address: '北京市朝阳区三里屯',
    latitude: 39.9388,
    longitude: 116.4574
  };

  const mockLocation2: Location = {
    address: '北京市海淀区中关村',
    latitude: 39.9833,
    longitude: 116.3167
  };

  const mockSearchParams: SearchParams = {
    location1: mockLocation1,
    location2: mockLocation2,
    venueTypes: [VenueType.RESTAURANT, VenueType.CAFE]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    searchHistoryService = new SearchHistoryService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('addToHistory', () => {
    it('应该添加搜索记录到历史', () => {
      const historyItem = searchHistoryService.addToHistory(mockSearchParams, 5);

      expect(historyItem).toMatchObject({
        id: expect.any(String),
        location1: mockLocation1,
        location2: mockLocation2,
        venueTypes: [VenueType.RESTAURANT, VenueType.CAFE],
        timestamp: expect.any(Date),
        resultCount: 5
      });

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('应该更新现有的相似搜索', () => {
      // 添加第一个搜索
      searchHistoryService.addToHistory(mockSearchParams, 5);
      
      // 添加相似的搜索
      const updatedItem = searchHistoryService.addToHistory(mockSearchParams, 8);
      
      const history = searchHistoryService.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].resultCount).toBe(8);
    });

    it('应该限制历史记录数量', () => {
      // 添加超过限制的记录
      for (let i = 0; i < 25; i++) {
        const params = {
          ...mockSearchParams,
          location1: { ...mockLocation1, latitude: mockLocation1.latitude + i * 0.001 }
        };
        searchHistoryService.addToHistory(params, i);
      }

      const history = searchHistoryService.getHistory();
      expect(history.length).toBeLessThanOrEqual(20);
    });
  });

  describe('getHistory', () => {
    it('应该返回所有历史记录', () => {
      searchHistoryService.addToHistory(mockSearchParams, 5);
      
      const history = searchHistoryService.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject({
        location1: mockLocation1,
        location2: mockLocation2,
        venueTypes: [VenueType.RESTAURANT, VenueType.CAFE],
        resultCount: 5
      });
    });

    it('应该支持限制返回数量', () => {
      // 添加多个记录
      for (let i = 0; i < 5; i++) {
        const params = {
          ...mockSearchParams,
          location1: { ...mockLocation1, latitude: mockLocation1.latitude + i * 0.001 }
        };
        searchHistoryService.addToHistory(params, i);
      }

      const limitedHistory = searchHistoryService.getHistory(3);
      expect(limitedHistory).toHaveLength(3);
    });
  });

  describe('searchHistory', () => {
    beforeEach(() => {
      searchHistoryService.addToHistory(mockSearchParams, 5);
      
      const params2 = {
        location1: { address: '上海市浦东新区陆家嘴', latitude: 31.2304, longitude: 121.4737 },
        location2: { address: '上海市黄浦区外滩', latitude: 31.2396, longitude: 121.4990 },
        venueTypes: [VenueType.BAR]
      };
      searchHistoryService.addToHistory(params2, 3);
    });

    it('应该根据地点搜索历史记录', () => {
      const results = searchHistoryService.searchHistory('三里屯');
      expect(results).toHaveLength(1);
      expect(results[0].location1.address).toContain('三里屯');
    });

    it('应该根据店铺类型搜索历史记录', () => {
      const results = searchHistoryService.searchHistory('餐厅');
      expect(results).toHaveLength(1);
      expect(results[0].venueTypes).toContain(VenueType.RESTAURANT);
    });

    it('应该在空查询时返回所有记录', () => {
      const results = searchHistoryService.searchHistory('');
      expect(results).toHaveLength(2);
    });
  });

  describe('removeHistoryItem', () => {
    it('应该删除指定的历史项', () => {
      const historyItem = searchHistoryService.addToHistory(mockSearchParams, 5);
      
      const removed = searchHistoryService.removeHistoryItem(historyItem.id);
      expect(removed).toBe(true);
      
      const history = searchHistoryService.getHistory();
      expect(history).toHaveLength(0);
    });

    it('应该在项目不存在时返回false', () => {
      const removed = searchHistoryService.removeHistoryItem('non-existent-id');
      expect(removed).toBe(false);
    });
  });

  describe('clearHistory', () => {
    it('应该清除所有历史记录', () => {
      searchHistoryService.addToHistory(mockSearchParams, 5);
      
      searchHistoryService.clearHistory();
      
      const history = searchHistoryService.getHistory();
      expect(history).toHaveLength(0);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'date-location-finder-search-history',
        '[]'
      );
    });
  });

  describe('getFrequentLocations', () => {
    it('应该返回常用地点', () => {
      // 添加多个使用相同地点的搜索
      searchHistoryService.addToHistory(mockSearchParams, 5);
      
      const params2 = {
        ...mockSearchParams,
        location2: { address: '北京市东城区王府井', latitude: 39.9042, longitude: 116.4074 }
      };
      searchHistoryService.addToHistory(params2, 3);

      const frequentLocations = searchHistoryService.getFrequentLocations(5);
      expect(frequentLocations.length).toBeGreaterThan(0);
      expect(frequentLocations[0]).toMatchObject({
        address: expect.any(String),
        latitude: expect.any(Number),
        longitude: expect.any(Number)
      });
    });
  });

  describe('getFrequentVenueTypeCombinations', () => {
    it('应该返回常用店铺类型组合', () => {
      searchHistoryService.addToHistory(mockSearchParams, 5);
      searchHistoryService.addToHistory(mockSearchParams, 3); // 相同组合

      const params2 = {
        ...mockSearchParams,
        venueTypes: [VenueType.BAR]
      };
      searchHistoryService.addToHistory(params2, 2);

      const combinations = searchHistoryService.getFrequentVenueTypeCombinations(5);
      expect(combinations.length).toBeGreaterThan(0);
      expect(combinations[0]).toEqual([VenueType.RESTAURANT, VenueType.CAFE]);
    });
  });

  describe('导入导出功能', () => {
    it('应该导出历史记录', () => {
      searchHistoryService.addToHistory(mockSearchParams, 5);
      
      const exported = searchHistoryService.exportHistory();
      const data = JSON.parse(exported);
      
      expect(data).toMatchObject({
        version: '1.0',
        exportDate: expect.any(String),
        history: expect.any(Array)
      });
      expect(data.history).toHaveLength(1);
    });

    it('应该导入历史记录', () => {
      const historyData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        history: [{
          id: 'test-id',
          location1: mockLocation1,
          location2: mockLocation2,
          venueTypes: [VenueType.RESTAURANT],
          timestamp: new Date(),
          resultCount: 5
        }]
      };

      const success = searchHistoryService.importHistory(JSON.stringify(historyData));
      expect(success).toBe(true);
      
      const history = searchHistoryService.getHistory();
      expect(history).toHaveLength(1);
    });

    it('应该在导入无效数据时返回false', () => {
      const success = searchHistoryService.importHistory('invalid json');
      expect(success).toBe(false);
    });
  });

  describe('本地存储集成', () => {
    it('应该从localStorage加载历史记录', () => {
      const mockHistoryData = JSON.stringify([{
        id: 'test-id',
        location1: mockLocation1,
        location2: mockLocation2,
        venueTypes: [VenueType.RESTAURANT],
        timestamp: new Date(),
        resultCount: 5
      }]);

      localStorageMock.getItem.mockReturnValue(mockHistoryData);
      
      const newService = new SearchHistoryService();
      const history = newService.getHistory();
      
      expect(history).toHaveLength(1);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('date-location-finder-search-history');
    });

    it('应该处理localStorage加载错误', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      // 应该不抛出错误
      expect(() => new SearchHistoryService()).not.toThrow();
    });
  });
});
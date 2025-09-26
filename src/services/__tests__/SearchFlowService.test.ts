import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchFlowService } from '../SearchFlowService';
import { LocationService } from '../LocationService';
import { VenueType, Location, SearchParams } from '../../types';

// Mock LocationService
vi.mock('../LocationService');

describe('SearchFlowService', () => {
  let searchFlowService: SearchFlowService;
  let mockLocationService: any;

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

  const mockMidpoint: Location = {
    address: '北京市东城区王府井',
    latitude: 39.9611,
    longitude: 116.3870
  };

  const mockVenues = [
    {
      placeId: 'venue1',
      name: '测试餐厅',
      address: '测试地址1',
      location: mockMidpoint,
      rating: 4.5,
      userRatingsTotal: 100,
      priceLevel: 2,
      photos: [],
      openingHours: { openNow: true, periods: [], weekdayText: [] },
      types: ['restaurant'],
      distance: 100
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockLocationService = {
      calculateMidpoint: vi.fn().mockResolvedValue(mockMidpoint),
      searchNearbyVenues: vi.fn().mockResolvedValue(mockVenues),
      searchPlaces: vi.fn().mockResolvedValue([]),
      geocodeAddress: vi.fn().mockResolvedValue(mockLocation1),
      getPlaceDetails: vi.fn().mockResolvedValue(mockVenues[0]),
      getDirections: vi.fn().mockResolvedValue({
        distance: { text: '5.2 km', value: 5200 },
        duration: { text: '15 分钟', value: 900 }
      })
    };

    // Mock the LocationService constructor
    (LocationService as any).mockImplementation(() => mockLocationService);
    
    searchFlowService = new SearchFlowService();
  });

  describe('executeSearchFlow', () => {
    it('应该执行完整的搜索流程', async () => {
      const searchParams: SearchParams = {
        location1: mockLocation1,
        location2: mockLocation2,
        venueTypes: [VenueType.RESTAURANT],
        radius: 5000
      };

      const result = await searchFlowService.executeSearchFlow(searchParams);

      expect(result).toEqual({
        venues: mockVenues,
        midpoint: mockMidpoint,
        fromCache: false,
        searchTime: expect.any(Number),
        totalResults: 1
      });

      expect(mockLocationService.calculateMidpoint).toHaveBeenCalledWith(
        mockLocation1,
        mockLocation2
      );
      expect(mockLocationService.searchNearbyVenues).toHaveBeenCalledWith(
        mockMidpoint,
        [VenueType.RESTAURANT],
        5000
      );
    });

    it('应该验证搜索参数', async () => {
      const invalidParams: SearchParams = {
        location1: mockLocation1,
        location2: null as any,
        venueTypes: [],
      };

      await expect(searchFlowService.executeSearchFlow(invalidParams))
        .rejects.toMatchObject({
          type: 'INVALID_INPUT',
          message: '需要提供两个有效的地点'
        });
    });

    it('应该使用缓存结果', async () => {
      const searchParams: SearchParams = {
        location1: mockLocation1,
        location2: mockLocation2,
        venueTypes: [VenueType.RESTAURANT],
        radius: 5000
      };

      // 第一次搜索
      const result1 = await searchFlowService.executeSearchFlow(searchParams);
      expect(result1.fromCache).toBe(false);

      // 第二次搜索应该使用缓存
      const result2 = await searchFlowService.executeSearchFlow(searchParams);
      expect(result2.fromCache).toBe(true);
      expect(result2.venues).toEqual(mockVenues);

      // 验证只调用了一次API
      expect(mockLocationService.searchNearbyVenues).toHaveBeenCalledTimes(1);
    });
  });

  describe('getLocationSuggestions', () => {
    it('应该获取地点建议', async () => {
      const mockPlaces = [
        {
          placeId: 'place1',
          name: '三里屯太古里',
          address: '北京市朝阳区三里屯路19号',
          location: mockLocation1,
          rating: 4.5,
          types: ['shopping_mall']
        }
      ];

      mockLocationService.searchPlaces.mockResolvedValue(mockPlaces);

      const suggestions = await searchFlowService.getLocationSuggestions('三里屯');
      
      expect(suggestions).toEqual([mockLocation1]);
      expect(mockLocationService.searchPlaces).toHaveBeenCalledWith('三里屯', undefined);
    });

    it('应该在查询长度不足时返回空数组', async () => {
      const suggestions = await searchFlowService.getLocationSuggestions('a');
      expect(suggestions).toEqual([]);
      expect(mockLocationService.searchPlaces).not.toHaveBeenCalled();
    });
  });

  describe('缓存管理', () => {
    it('应该清除缓存', async () => {
      const searchParams: SearchParams = {
        location1: mockLocation1,
        location2: mockLocation2,
        venueTypes: [VenueType.RESTAURANT],
      };

      // 执行搜索以创建缓存
      await searchFlowService.executeSearchFlow(searchParams);
      
      // 清除缓存
      searchFlowService.clearCache();
      
      // 再次搜索应该不使用缓存
      const result = await searchFlowService.executeSearchFlow(searchParams);
      expect(result.fromCache).toBe(false);
    });

    it('应该获取缓存统计信息', () => {
      const stats = searchFlowService.getCacheStats();
      
      expect(stats).toEqual({
        totalItems: expect.any(Number),
        validItems: expect.any(Number),
        expiredItems: expect.any(Number),
        maxSize: 50
      });
    });
  });

  describe('其他服务方法', () => {
    it('应该地理编码地址', async () => {
      const location = await searchFlowService.geocodeAddress('北京市朝阳区三里屯');
      
      expect(location).toEqual(mockLocation1);
      expect(mockLocationService.geocodeAddress).toHaveBeenCalledWith('北京市朝阳区三里屯');
    });

    it('应该获取店铺详情', async () => {
      const venue = await searchFlowService.getVenueDetails('venue1');
      
      expect(venue).toEqual(mockVenues[0]);
      expect(mockLocationService.getPlaceDetails).toHaveBeenCalledWith('venue1');
    });

    it('应该获取路线信息', async () => {
      const directions = await searchFlowService.getDirections(mockLocation1, mockLocation2);
      
      expect(directions).toEqual({
        distance: { text: '5.2 km', value: 5200 },
        duration: { text: '15 分钟', value: 900 }
      });
      expect(mockLocationService.getDirections).toHaveBeenCalledWith(mockLocation1, mockLocation2);
    });
  });
});
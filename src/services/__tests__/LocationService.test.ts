import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocationService } from '../LocationService';
import { googleMapsService } from '../GoogleMapsService';
import { ErrorType, VenueType } from '../../types';

// Mock Google Maps service
vi.mock('../GoogleMapsService', () => ({
  googleMapsService: {
    geocodeAddress: vi.fn(),
    searchPlaces: vi.fn(),
    getPlaceDetails: vi.fn(),
    calculateMidpoint: vi.fn(),
    searchNearbyVenues: vi.fn(),
    getDirections: vi.fn()
  }
}));

describe('LocationService', () => {
  let locationService: LocationService;
  const mockGoogleMapsService = vi.mocked(googleMapsService);

  beforeEach(() => {
    locationService = new LocationService();
    vi.clearAllMocks();
  });

  describe('geocodeAddress', () => {
    it('should successfully geocode a valid address', async () => {
      const mockResult = {
        address: '北京市朝阳区',
        latitude: 39.9042,
        longitude: 116.4074,
        placeId: 'test_place_id'
      };

      mockGoogleMapsService.geocodeAddress.mockResolvedValue(mockResult);

      const result = await locationService.geocodeAddress('北京市朝阳区');

      expect(result).toEqual(mockResult);
      expect(mockGoogleMapsService.geocodeAddress).toHaveBeenCalledWith('北京市朝阳区');
    });

    it('should handle errors from Google Maps service', async () => {
      const error = {
        type: ErrorType.INVALID_INPUT,
        message: '地址不能为空',
        timestamp: new Date()
      };

      mockGoogleMapsService.geocodeAddress.mockRejectedValue(error);

      await expect(locationService.geocodeAddress('')).rejects.toMatchObject({
        type: ErrorType.INVALID_INPUT,
        message: '地址不能为空'
      });
    });
  });

  describe('searchPlaces', () => {
    it('should successfully search places', async () => {
      const mockResult = [{
        placeId: 'test_place_1',
        name: '测试餐厅',
        address: '测试地址',
        location: {
          address: '测试地址',
          latitude: 39.9042,
          longitude: 116.4074,
          placeId: 'test_place_1'
        },
        rating: 4.5,
        types: ['restaurant']
      }];

      mockGoogleMapsService.searchPlaces.mockResolvedValue(mockResult);

      const result = await locationService.searchPlaces('餐厅');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        placeId: 'test_place_1',
        name: '测试餐厅',
        address: '测试地址',
        rating: 4.5,
        types: ['restaurant']
      });
    });

    it('should handle errors from Google Maps service', async () => {
      const error = {
        type: ErrorType.INVALID_INPUT,
        message: '搜索查询不能为空',
        timestamp: new Date()
      };

      mockGoogleMapsService.searchPlaces.mockRejectedValue(error);

      await expect(locationService.searchPlaces('')).rejects.toMatchObject({
        type: ErrorType.INVALID_INPUT,
        message: '搜索查询不能为空'
      });
    });
  });

  describe('getPlaceDetails', () => {
    it('should successfully get place details', async () => {
      const mockResult = {
        placeId: 'test_place_id',
        name: '测试餐厅',
        address: '测试地址',
        location: {
          address: '测试地址',
          latitude: 39.9042,
          longitude: 116.4074,
          placeId: 'test_place_id'
        },
        rating: 4.5,
        userRatingsTotal: 100,
        priceLevel: 2,
        photos: [{
          photoReference: 'test_photo_ref',
          width: 400,
          height: 300
        }],
        openingHours: {
          openNow: true,
          periods: [],
          weekdayText: []
        },
        phoneNumber: '+86 138-0013-8000',
        website: 'https://example.com',
        types: ['restaurant'],
        distance: 0
      };

      mockGoogleMapsService.getPlaceDetails.mockResolvedValue(mockResult);

      const result = await locationService.getPlaceDetails('test_place_id');

      expect(result).toMatchObject({
        placeId: 'test_place_id',
        name: '测试餐厅',
        address: '测试地址',
        rating: 4.5,
        userRatingsTotal: 100,
        priceLevel: 2,
        phoneNumber: '+86 138-0013-8000',
        website: 'https://example.com',
        types: ['restaurant']
      });
    });

    it('should handle errors from Google Maps service', async () => {
      const error = {
        type: ErrorType.INVALID_INPUT,
        message: 'Place ID不能为空',
        timestamp: new Date()
      };

      mockGoogleMapsService.getPlaceDetails.mockRejectedValue(error);

      await expect(locationService.getPlaceDetails('')).rejects.toMatchObject({
        type: ErrorType.INVALID_INPUT,
        message: 'Place ID不能为空'
      });
    });
  });

  describe('calculateMidpoint', () => {
    it('should calculate midpoint correctly', async () => {
      const location1 = {
        address: '地点1',
        latitude: 39.9042,
        longitude: 116.4074
      };

      const location2 = {
        address: '地点2',
        latitude: 39.9142,
        longitude: 116.4174
      };

      const mockResult = {
        address: '中心点地址',
        latitude: 39.9092,
        longitude: 116.4124
      };

      mockGoogleMapsService.calculateMidpoint.mockResolvedValue(mockResult);

      const result = await locationService.calculateMidpoint(location1, location2);

      expect(result.latitude).toBeCloseTo(39.9092, 3);
      expect(result.longitude).toBeCloseTo(116.4124, 3);
      expect(result.address).toBe('中心点地址');
    });

    it('should handle errors from Google Maps service', async () => {
      const error = {
        type: ErrorType.INVALID_INPUT,
        message: '需要提供两个有效的地点',
        timestamp: new Date()
      };

      mockGoogleMapsService.calculateMidpoint.mockRejectedValue(error);

      await expect(locationService.calculateMidpoint(null as any, null as any)).rejects.toMatchObject({
        type: ErrorType.INVALID_INPUT,
        message: '需要提供两个有效的地点'
      });
    });
  });

  describe('searchNearbyVenues', () => {
    it('should search nearby venues successfully', async () => {
      const location = {
        address: '测试地点',
        latitude: 39.9042,
        longitude: 116.4074
      };

      const mockResult = [{
        placeId: 'test_place_1',
        name: '测试餐厅',
        address: '测试地址',
        location: {
          address: '测试地址',
          latitude: 39.9042,
          longitude: 116.4074,
          placeId: 'test_place_1'
        },
        rating: 4.5,
        userRatingsTotal: 100,
        priceLevel: 2,
        photos: [],
        openingHours: {
          openNow: true,
          periods: [],
          weekdayText: []
        },
        types: ['restaurant'],
        distance: 0
      }];

      mockGoogleMapsService.searchNearbyVenues.mockResolvedValue(mockResult);

      const result = await locationService.searchNearbyVenues(location, [VenueType.RESTAURANT]);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('测试餐厅');
      expect(result[0].distance).toBeGreaterThanOrEqual(0);
    });

    it('should handle errors from Google Maps service', async () => {
      const error = {
        type: ErrorType.INVALID_INPUT,
        message: '需要提供搜索位置',
        timestamp: new Date()
      };

      mockGoogleMapsService.searchNearbyVenues.mockRejectedValue(error);

      await expect(locationService.searchNearbyVenues(null as any, [])).rejects.toMatchObject({
        type: ErrorType.INVALID_INPUT
      });
    });
  });

  describe('getDirections', () => {
    it('should get directions successfully', async () => {
      const origin = {
        address: '起点',
        latitude: 39.9042,
        longitude: 116.4074
      };

      const destination = {
        address: '终点',
        latitude: 39.9142,
        longitude: 116.4174
      };

      const mockResult = {
        distance: {
          text: '2.5 公里',
          value: 2500
        },
        duration: {
          text: '8 分钟',
          value: 480
        },
        routes: [{
          legs: [{
            distance: {
              text: '2.5 公里',
              value: 2500
            },
            duration: {
              text: '8 分钟',
              value: 480
            }
          }]
        }]
      };

      mockGoogleMapsService.getDirections.mockResolvedValue(mockResult);

      const result = await locationService.getDirections(origin, destination);

      expect(result).toMatchObject({
        distance: {
          text: '2.5 公里',
          value: 2500
        },
        duration: {
          text: '8 分钟',
          value: 480
        }
      });
    });

    it('should handle errors from Google Maps service', async () => {
      const error = {
        type: ErrorType.INVALID_INPUT,
        message: '需要提供起点和终点',
        timestamp: new Date()
      };

      mockGoogleMapsService.getDirections.mockRejectedValue(error);

      await expect(locationService.getDirections(null as any, null as any)).rejects.toMatchObject({
        type: ErrorType.INVALID_INPUT,
        message: '需要提供起点和终点'
      });
    });
  });
});
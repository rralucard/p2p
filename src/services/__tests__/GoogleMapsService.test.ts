import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GoogleMapsService } from '../GoogleMapsService';
import { ErrorType, VenueType } from '../../types';

// Mock fetch
global.fetch = vi.fn();

describe('GoogleMapsService', () => {
  let googleMapsService: GoogleMapsService;
  const mockFetch = vi.mocked(fetch);

  beforeEach(() => {
    googleMapsService = new GoogleMapsService();
    vi.clearAllMocks();
  });

  describe('geocodeAddress', () => {
    it('should successfully geocode a valid address', async () => {
      const mockResponse = {
        status: 'OK',
        results: [{
          formatted_address: '北京市朝阳区',
          geometry: {
            location: {
              lat: 39.9042,
              lng: 116.4074
            }
          },
          place_id: 'test_place_id'
        }]
      };

      mockFetch.mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      } as Response);

      const result = await googleMapsService.geocodeAddress('北京市朝阳区');

      expect(result).toEqual({
        address: '北京市朝阳区',
        latitude: 39.9042,
        longitude: 116.4074,
        placeId: 'test_place_id'
      });
    });

    it('should throw error for empty address', async () => {
      await expect(googleMapsService.geocodeAddress('')).rejects.toMatchObject({
        type: ErrorType.INVALID_INPUT,
        message: '地址不能为空'
      });
    });

    it('should handle ZERO_RESULTS status', async () => {
      const mockResponse = {
        status: 'ZERO_RESULTS',
        results: []
      };

      mockFetch.mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      } as Response);

      await expect(googleMapsService.geocodeAddress('invalid address')).rejects.toMatchObject({
        type: ErrorType.LOCATION_NOT_FOUND
      });
    });

    it('should handle OVER_QUERY_LIMIT status', async () => {
      const mockResponse = {
        status: 'OVER_QUERY_LIMIT',
        results: []
      };

      mockFetch.mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      } as Response);

      await expect(googleMapsService.geocodeAddress('test address')).rejects.toMatchObject({
        type: ErrorType.API_QUOTA_EXCEEDED
      });
    });
  });

  describe('searchPlaces', () => {
    it('should successfully search places', async () => {
      const mockResponse = {
        status: 'OK',
        results: [{
          place_id: 'test_place_1',
          name: '测试餐厅',
          formatted_address: '测试地址',
          geometry: {
            location: {
              lat: 39.9042,
              lng: 116.4074
            }
          },
          rating: 4.5,
          types: ['restaurant']
        }]
      };

      mockFetch.mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      } as Response);

      const result = await googleMapsService.searchPlaces('餐厅');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        placeId: 'test_place_1',
        name: '测试餐厅',
        address: '测试地址',
        rating: 4.5,
        types: ['restaurant']
      });
    });

    it('should throw error for empty query', async () => {
      await expect(googleMapsService.searchPlaces('')).rejects.toMatchObject({
        type: ErrorType.INVALID_INPUT,
        message: '搜索查询不能为空'
      });
    });
  });

  describe('getPlaceDetails', () => {
    it('should successfully get place details', async () => {
      const mockResponse = {
        status: 'OK',
        result: {
          place_id: 'test_place_id',
          name: '测试餐厅',
          formatted_address: '测试地址',
          geometry: {
            location: {
              lat: 39.9042,
              lng: 116.4074
            }
          },
          rating: 4.5,
          user_ratings_total: 100,
          price_level: 2,
          photos: [{
            photo_reference: 'test_photo_ref',
            width: 400,
            height: 300
          }],
          opening_hours: {
            open_now: true,
            periods: [],
            weekday_text: []
          },
          formatted_phone_number: '+86 138-0013-8000',
          website: 'https://example.com',
          types: ['restaurant']
        }
      };

      mockFetch.mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      } as Response);

      const result = await googleMapsService.getPlaceDetails('test_place_id');

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

    it('should throw error for empty place ID', async () => {
      await expect(googleMapsService.getPlaceDetails('')).rejects.toMatchObject({
        type: ErrorType.INVALID_INPUT,
        message: 'Place ID不能为空'
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

      // Mock nearby search response
      const mockNearbyResponse = {
        status: 'OK',
        results: [{
          place_id: 'test_place_1',
          name: '测试餐厅',
          vicinity: '测试地址'
        }]
      };

      // Mock place details response
      const mockDetailsResponse = {
        status: 'OK',
        result: {
          place_id: 'test_place_1',
          name: '测试餐厅',
          formatted_address: '测试地址',
          geometry: {
            location: {
              lat: 39.9042,
              lng: 116.4074
            }
          },
          rating: 4.5,
          user_ratings_total: 100,
          price_level: 2,
          photos: [],
          opening_hours: {
            open_now: true,
            periods: [],
            weekday_text: []
          },
          types: ['restaurant']
        }
      };

      mockFetch
        .mockResolvedValueOnce({
          json: () => Promise.resolve(mockNearbyResponse)
        } as Response)
        .mockResolvedValueOnce({
          json: () => Promise.resolve(mockDetailsResponse)
        } as Response);

      const result = await googleMapsService.searchNearbyVenues(location, [VenueType.RESTAURANT]);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('测试餐厅');
      expect(result[0].distance).toBeGreaterThanOrEqual(0);
    });

    it('should throw error for invalid input', async () => {
      await expect(googleMapsService.searchNearbyVenues(null as any, [])).rejects.toMatchObject({
        type: ErrorType.INVALID_INPUT
      });

      const location = {
        address: '测试地点',
        latitude: 39.9042,
        longitude: 116.4074
      };

      await expect(googleMapsService.searchNearbyVenues(location, [])).rejects.toMatchObject({
        type: ErrorType.INVALID_INPUT,
        message: '需要选择至少一种店铺类型'
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

      const mockResponse = {
        status: 'OK',
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

      mockFetch.mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      } as Response);

      const result = await googleMapsService.getDirections(origin, destination);

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

    it('should throw error for invalid locations', async () => {
      await expect(googleMapsService.getDirections(null as any, null as any)).rejects.toMatchObject({
        type: ErrorType.INVALID_INPUT,
        message: '需要提供起点和终点'
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

      // Mock reverse geocoding
      const mockResponse = {
        status: 'OK',
        results: [{
          formatted_address: '中心点地址'
        }]
      };

      mockFetch.mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      } as Response);

      const result = await googleMapsService.calculateMidpoint(location1, location2);

      expect(result.latitude).toBeCloseTo(39.9092, 3);
      expect(result.longitude).toBeCloseTo(116.4124, 3);
      expect(result.address).toBe('中心点地址');
    });

    it('should throw error for invalid locations', async () => {
      await expect(googleMapsService.calculateMidpoint(null as any, null as any)).rejects.toMatchObject({
        type: ErrorType.INVALID_INPUT,
        message: '需要提供两个有效的地点'
      });
    });
  });

  describe('reverseGeocode', () => {
    it('should successfully reverse geocode coordinates', async () => {
      const mockResponse = {
        status: 'OK',
        results: [{
          formatted_address: '测试地址'
        }]
      };

      mockFetch.mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      } as Response);

      const result = await googleMapsService.reverseGeocode(39.9042, 116.4074);

      expect(result).toBe('测试地址');
    });

    it('should return coordinates as string when geocoding fails', async () => {
      const mockResponse = {
        status: 'ZERO_RESULTS',
        results: []
      };

      mockFetch.mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      } as Response);

      const result = await googleMapsService.reverseGeocode(39.9042, 116.4074);

      expect(result).toBe('39.904200, 116.407400');
    });
  });
});
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { locationService } from '../LocationService';
import { googleMapsService } from '../GoogleMapsService';

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

describe('Integration Tests - MCP to REST API Migration', () => {
  const mockGoogleMapsService = vi.mocked(googleMapsService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully complete a full user flow', async () => {
    // Mock responses for a complete user flow
    const location1 = {
      address: '北京市朝阳区',
      latitude: 39.9042,
      longitude: 116.4074,
      placeId: 'place_1'
    };

    const location2 = {
      address: '北京市海淀区',
      latitude: 39.9889,
      longitude: 116.3058,
      placeId: 'place_2'
    };

    const midpoint = {
      address: '北京市西城区',
      latitude: 39.9465,
      longitude: 116.3566
    };

    const venues = [{
      placeId: 'restaurant_1',
      name: '测试餐厅',
      address: '测试地址',
      location: {
        address: '测试地址',
        latitude: 39.9465,
        longitude: 116.3566,
        placeId: 'restaurant_1'
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
      phoneNumber: '+86 138-0013-8000',
      website: 'https://example.com',
      types: ['restaurant'],
      distance: 100
    }];

    // Setup mocks
    mockGoogleMapsService.geocodeAddress
      .mockResolvedValueOnce(location1)
      .mockResolvedValueOnce(location2);
    
    mockGoogleMapsService.calculateMidpoint.mockResolvedValue(midpoint);
    mockGoogleMapsService.searchNearbyVenues.mockResolvedValue(venues);

    // Execute the flow
    const result1 = await locationService.geocodeAddress('北京市朝阳区');
    const result2 = await locationService.geocodeAddress('北京市海淀区');
    const midpointResult = await locationService.calculateMidpoint(result1, result2);
    const venuesResult = await locationService.searchNearbyVenues(midpointResult, ['restaurant']);

    // Verify results
    expect(result1).toEqual(location1);
    expect(result2).toEqual(location2);
    expect(midpointResult).toEqual(midpoint);
    expect(venuesResult).toEqual(venues);

    // Verify all services were called correctly
    expect(mockGoogleMapsService.geocodeAddress).toHaveBeenCalledTimes(2);
    expect(mockGoogleMapsService.calculateMidpoint).toHaveBeenCalledWith(location1, location2);
    expect(mockGoogleMapsService.searchNearbyVenues).toHaveBeenCalledWith(midpoint, ['restaurant'], 2000);
  });

  it('should handle errors gracefully throughout the flow', async () => {
    // Test error handling
    const error = {
      type: 'GEOCODING_FAILED',
      message: '地理编码失败',
      timestamp: new Date()
    };

    mockGoogleMapsService.geocodeAddress.mockRejectedValue(error);

    await expect(locationService.geocodeAddress('invalid address')).rejects.toMatchObject({
      type: 'GEOCODING_FAILED',
      message: '地理编码失败'
    });
  });

  it('should maintain backward compatibility with existing interfaces', async () => {
    // Verify that the LocationService interface hasn't changed
    expect(typeof locationService.geocodeAddress).toBe('function');
    expect(typeof locationService.searchPlaces).toBe('function');
    expect(typeof locationService.getPlaceDetails).toBe('function');
    expect(typeof locationService.calculateMidpoint).toBe('function');
    expect(typeof locationService.searchNearbyVenues).toBe('function');
    expect(typeof locationService.getDirections).toBe('function');
  });
});
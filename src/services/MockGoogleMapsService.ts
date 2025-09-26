import {
  Location,
  Venue,
  Place,
  DirectionsResult,
  VenueType,
  AppError,
  ErrorType
} from '../types';

/**
 * 模拟Google Maps服务 - 用于开发和测试
 */
export class MockGoogleMapsService {
  /**
   * 模拟地理编码
   */
  async geocodeAddress(address: string): Promise<Location> {
    if (!address || address.trim().length === 0) {
      throw this.createError(ErrorType.INVALID_INPUT, '地址不能为空');
    }

    // 模拟延迟
    await this.delay(500);

    const mockLocations: { [key: string]: Location } = {
      '沈阳': {
        address: '辽宁省沈阳市',
        latitude: 41.8057,
        longitude: 123.4315,
        placeId: 'mock_shenyang'
      },
      '大连': {
        address: '辽宁省大连市',
        latitude: 38.9140,
        longitude: 121.6147,
        placeId: 'mock_dalian'
      },
      '北京': {
        address: '北京市',
        latitude: 39.9042,
        longitude: 116.4074,
        placeId: 'mock_beijing'
      },
      '上海': {
        address: '上海市',
        latitude: 31.2304,
        longitude: 121.4737,
        placeId: 'mock_shanghai'
      }
    };

    // 查找匹配的地址
    const normalizedAddress = address.trim().toLowerCase();
    for (const [key, location] of Object.entries(mockLocations)) {
      if (normalizedAddress.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedAddress)) {
        return location;
      }
    }

    // 如果没有找到匹配的，返回一个通用的位置
    return {
      address: `${address}（模拟地址）`,
      latitude: 39.9042 + (Math.random() - 0.5) * 0.1,
      longitude: 116.4074 + (Math.random() - 0.5) * 0.1,
      placeId: `mock_${Date.now()}`
    };
  }

  /**
   * 模拟搜索地点
   */
  async searchPlaces(query: string, location?: Location): Promise<Place[]> {
    if (!query || query.trim().length === 0) {
      throw this.createError(ErrorType.INVALID_INPUT, '搜索查询不能为空');
    }

    await this.delay(300);

    const mockPlaces: Place[] = [
      {
        placeId: `mock_place_${Date.now()}_1`,
        name: `${query}相关地点1`,
        address: `${query}附近的地址1`,
        location: {
          address: `${query}附近的地址1`,
          latitude: (location?.latitude || 39.9042) + (Math.random() - 0.5) * 0.01,
          longitude: (location?.longitude || 116.4074) + (Math.random() - 0.5) * 0.01,
          placeId: `mock_place_${Date.now()}_1`
        },
        rating: 4.0 + Math.random(),
        types: ['establishment']
      },
      {
        placeId: `mock_place_${Date.now()}_2`,
        name: `${query}相关地点2`,
        address: `${query}附近的地址2`,
        location: {
          address: `${query}附近的地址2`,
          latitude: (location?.latitude || 39.9042) + (Math.random() - 0.5) * 0.01,
          longitude: (location?.longitude || 116.4074) + (Math.random() - 0.5) * 0.01,
          placeId: `mock_place_${Date.now()}_2`
        },
        rating: 4.0 + Math.random(),
        types: ['establishment']
      }
    ];

    return mockPlaces;
  }

  /**
   * 模拟获取地点详情
   */
  async getPlaceDetails(placeId: string): Promise<Venue> {
    if (!placeId || placeId.trim().length === 0) {
      throw this.createError(ErrorType.INVALID_INPUT, 'Place ID不能为空');
    }

    await this.delay(400);

    return {
      placeId,
      name: '模拟店铺',
      address: '模拟地址',
      location: {
        address: '模拟地址',
        latitude: 39.9042 + (Math.random() - 0.5) * 0.01,
        longitude: 116.4074 + (Math.random() - 0.5) * 0.01,
        placeId
      },
      rating: 4.0 + Math.random(),
      userRatingsTotal: Math.floor(Math.random() * 1000) + 100,
      priceLevel: Math.floor(Math.random() * 4) + 1,
      photos: [],
      openingHours: {
        openNow: Math.random() > 0.5,
        periods: [],
        weekdayText: ['周一: 09:00–21:00', '周二: 09:00–21:00']
      },
      phoneNumber: '+86 138-0013-8000',
      website: 'https://example.com',
      types: ['restaurant'],
      distance: Math.floor(Math.random() * 2000) + 100
    };
  }

  /**
   * 模拟搜索附近店铺
   */
  async searchNearbyVenues(
    location: Location,
    venueTypes: VenueType[],
    radius: number = 2000
  ): Promise<Venue[]> {
    if (!location) {
      throw this.createError(ErrorType.INVALID_INPUT, '需要提供搜索位置');
    }

    if (!venueTypes || venueTypes.length === 0) {
      throw this.createError(ErrorType.INVALID_INPUT, '需要选择至少一种店铺类型');
    }

    await this.delay(800);

    const venues: Venue[] = [];
    
    for (const venueType of venueTypes) {
      for (let i = 0; i < 3; i++) {
        venues.push({
          placeId: `mock_venue_${venueType}_${i}`,
          name: `模拟${this.getVenueTypeName(venueType)}${i + 1}`,
          address: `模拟地址${i + 1}`,
          location: {
            address: `模拟地址${i + 1}`,
            latitude: location.latitude + (Math.random() - 0.5) * 0.01,
            longitude: location.longitude + (Math.random() - 0.5) * 0.01,
            placeId: `mock_venue_${venueType}_${i}`
          },
          rating: 4.0 + Math.random(),
          userRatingsTotal: Math.floor(Math.random() * 500) + 50,
          priceLevel: Math.floor(Math.random() * 4) + 1,
          photos: [],
          openingHours: {
            openNow: Math.random() > 0.3,
            periods: [],
            weekdayText: ['周一: 09:00–21:00']
          },
          phoneNumber: '+86 138-0013-8000',
          website: 'https://example.com',
          types: [venueType],
          distance: Math.floor(Math.random() * radius) + 100
        });
      }
    }

    return venues.sort((a, b) => a.distance - b.distance);
  }

  /**
   * 模拟获取路线
   */
  async getDirections(origin: Location, destination: Location): Promise<DirectionsResult> {
    if (!origin || !destination) {
      throw this.createError(ErrorType.INVALID_INPUT, '需要提供起点和终点');
    }

    await this.delay(600);

    const distance = this.calculateDistance(origin, destination);
    const duration = Math.floor(distance / 50 * 60); // 假设平均速度50km/h

    return {
      distance: {
        text: `${(distance / 1000).toFixed(1)} 公里`,
        value: Math.floor(distance)
      },
      duration: {
        text: `${Math.floor(duration / 60)} 分钟`,
        value: duration
      },
      routes: []
    };
  }

  /**
   * 模拟计算中心点
   */
  async calculateMidpoint(location1: Location, location2: Location): Promise<Location> {
    if (!location1 || !location2) {
      throw this.createError(ErrorType.INVALID_INPUT, '需要提供两个有效的地点');
    }

    await this.delay(200);

    const midpointLat = (location1.latitude + location2.latitude) / 2;
    const midpointLon = (location1.longitude + location2.longitude) / 2;

    return {
      address: `${location1.address}和${location2.address}的中心点`,
      latitude: midpointLat,
      longitude: midpointLon
    };
  }

  /**
   * 模拟反向地理编码
   */
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    await this.delay(300);
    return `模拟地址 (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  }

  // 辅助方法

  private getVenueTypeName(venueType: VenueType): string {
    const names: { [key in VenueType]: string } = {
      [VenueType.RESTAURANT]: '餐厅',
      [VenueType.CAFE]: '咖啡厅',
      [VenueType.BAR]: '酒吧',
      [VenueType.SHOPPING_MALL]: '购物中心',
      [VenueType.MOVIE_THEATER]: '电影院',
      [VenueType.PARK]: '公园',
      [VenueType.MUSEUM]: '博物馆',
      [VenueType.GYM]: '健身房'
    };
    return names[venueType] || '场所';
  }

  private calculateDistance(location1: Location, location2: Location): number {
    const R = 6371e3; // 地球半径（米）
    const φ1 = this.toRadians(location1.latitude);
    const φ2 = this.toRadians(location2.latitude);
    const Δφ = this.toRadians(location2.latitude - location1.latitude);
    const Δλ = this.toRadians(location2.longitude - location1.longitude);

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private createError(type: ErrorType, message: string, details?: any): AppError {
    return {
      type,
      message,
      details,
      timestamp: new Date()
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 导出单例实例
export const mockGoogleMapsService = new MockGoogleMapsService();
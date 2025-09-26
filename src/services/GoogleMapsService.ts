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
 * Google Maps JavaScript API服务
 * 使用Google Maps JavaScript API替代REST API以避免CORS问题
 */
export class GoogleMapsService {
  private readonly apiKey: string;
  private geocoder: google.maps.Geocoder | null = null;
  private placesService: google.maps.places.PlacesService | null = null;
  private directionsService: google.maps.DirectionsService | null = null;
  private isLoaded = false;

  constructor() {
    // 从环境变量获取API密钥
    this.apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('Google Maps API key not found. Please set VITE_GOOGLE_MAPS_API_KEY environment variable.');
    }
    
    this.initializeGoogleMaps();
  }

  /**
   * 初始化Google Maps JavaScript API
   */
  private async initializeGoogleMaps(): Promise<void> {
    if (this.isLoaded) return;

    try {
      // 检查是否已经加载了Google Maps API
      if (typeof google !== 'undefined' && google.maps) {
        this.initializeServices();
        this.isLoaded = true;
        return;
      }

      // 动态加载Google Maps JavaScript API
      await this.loadGoogleMapsScript();
      this.initializeServices();
      this.isLoaded = true;
    } catch (error) {
      console.error('Failed to initialize Google Maps:', error);
    }
  }

  /**
   * 动态加载Google Maps JavaScript API脚本
   */
  private loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places&language=zh-CN`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps script'));
      
      document.head.appendChild(script);
    });
  }

  /**
   * 初始化Google Maps服务
   */
  private initializeServices(): void {
    if (typeof google === 'undefined' || !google.maps) {
      throw new Error('Google Maps API not loaded');
    }

    this.geocoder = new google.maps.Geocoder();
    this.directionsService = new google.maps.DirectionsService();
    
    // PlacesService需要一个地图实例或div元素
    const div = document.createElement('div');
    const map = new google.maps.Map(div);
    this.placesService = new google.maps.places.PlacesService(map);
  }

  /**
   * 确保API已加载
   */
  private async ensureLoaded(): Promise<void> {
    if (!this.isLoaded) {
      await this.initializeGoogleMaps();
    }
    
    if (!this.geocoder || !this.placesService || !this.directionsService) {
      throw this.createError(ErrorType.NETWORK_ERROR, 'Google Maps服务未初始化');
    }
  }

  /**
   * 地址地理编码 - 将地址转换为经纬度坐标
   */
  async geocodeAddress(address: string): Promise<Location> {
    if (!address || address.trim().length === 0) {
      throw this.createError(ErrorType.INVALID_INPUT, '地址不能为空');
    }

    await this.ensureLoaded();

    return new Promise((resolve, reject) => {
      this.geocoder!.geocode(
        {
          address: address.trim(),
          language: 'zh-CN'
        },
        (results, status) => {
          if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
            reject(this.createError(ErrorType.LOCATION_NOT_FOUND, `无法找到地址: ${address}`));
            return;
          }

          if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
            reject(this.createError(ErrorType.API_QUOTA_EXCEEDED, 'API配额已用完，请稍后重试'));
            return;
          }

          if (status !== google.maps.GeocoderStatus.OK || !results || results.length === 0) {
            reject(this.createError(ErrorType.GEOCODING_FAILED, `地理编码失败: ${status}`));
            return;
          }

          const result = results[0];
          const location = result.geometry.location;

          resolve({
            address: result.formatted_address,
            latitude: location.lat(),
            longitude: location.lng(),
            placeId: result.place_id
          });
        }
      );
    });
  }

  /**
   * 反向地理编码 - 根据坐标获取地址
   */
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      await this.ensureLoaded();

      return new Promise((resolve) => {
        this.geocoder!.geocode(
          {
            location: { lat, lng },
            language: 'zh-CN'
          },
          (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
              resolve(results[0].formatted_address);
            } else {
              resolve(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            }
          }
        );
      });
    } catch (error) {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  }

  /**
   * 搜索地点 - 根据查询词搜索地点
   */
  async searchPlaces(query: string, location?: Location): Promise<Place[]> {
    if (!query || query.trim().length === 0) {
      throw this.createError(ErrorType.INVALID_INPUT, '搜索查询不能为空');
    }

    await this.ensureLoaded();

    return new Promise((resolve, reject) => {
      const request: google.maps.places.TextSearchRequest = {
        query: query.trim(),
        language: 'zh-CN'
      };

      if (location) {
        request.location = new google.maps.LatLng(location.latitude, location.longitude);
        request.radius = 5000;
      }

      this.placesService!.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
          reject(this.createError(ErrorType.API_QUOTA_EXCEEDED, 'API配额已用完，请稍后重试'));
          return;
        }

        if (status !== google.maps.places.PlacesServiceStatus.OK || !results) {
          resolve([]);
          return;
        }

        const places: Place[] = results.map((result) => ({
          placeId: result.place_id!,
          name: result.name!,
          address: result.formatted_address || result.vicinity || '',
          location: {
            address: result.formatted_address || result.vicinity || '',
            latitude: result.geometry!.location!.lat(),
            longitude: result.geometry!.location!.lng(),
            placeId: result.place_id!
          },
          rating: result.rating,
          types: result.types || []
        }));

        resolve(places);
      });
    });
  }

  /**
   * 搜索附近的店铺 - 根据位置和店铺类型搜索
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

    await this.ensureLoaded();

    const venues: Venue[] = [];

    // 为每种店铺类型进行搜索
    for (const venueType of venueTypes) {
      try {
        const nearbyResults = await this.searchNearbyByType(location, venueType, radius);
        
        for (const result of nearbyResults) {
          try {
            const venue = await this.getPlaceDetails(result.place_id!);
            venue.distance = this.calculateDistance(location, venue.location);
            venues.push(venue);
          } catch (error) {
            console.warn(`Failed to get details for place ${result.place_id}:`, error);
          }
        }
      } catch (error) {
        console.warn(`Failed to search for ${venueType}:`, error);
      }
    }

    // 去重并按距离排序
    const uniqueVenues = this.removeDuplicateVenues(venues);
    return uniqueVenues.sort((a, b) => a.distance - b.distance);
  }

  /**
   * 根据类型搜索附近地点
   */
  private searchNearbyByType(
    location: Location,
    venueType: VenueType,
    radius: number
  ): Promise<google.maps.places.PlaceResult[]> {
    return new Promise((resolve, reject) => {
      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(location.latitude, location.longitude),
        radius,
        type: venueType as any,
        language: 'zh-CN'
      };

      this.placesService!.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
          reject(this.createError(ErrorType.API_QUOTA_EXCEEDED, 'API配额已用完，请稍后重试'));
          return;
        }

        if (status !== google.maps.places.PlacesServiceStatus.OK || !results) {
          resolve([]);
          return;
        }

        resolve(results);
      });
    });
  }

  /**
   * 获取店铺详情 - 根据placeId获取详细信息
   */
  async getPlaceDetails(placeId: string): Promise<Venue> {
    if (!placeId || placeId.trim().length === 0) {
      throw this.createError(ErrorType.INVALID_INPUT, 'Place ID不能为空');
    }

    await this.ensureLoaded();

    return new Promise((resolve, reject) => {
      const request: google.maps.places.PlaceDetailsRequest = {
        placeId: placeId.trim(),
        fields: [
          'place_id',
          'name',
          'formatted_address',
          'geometry',
          'rating',
          'user_ratings_total',
          'price_level',
          'photos',
          'opening_hours',
          'formatted_phone_number',
          'website',
          'types'
        ],
        language: 'zh-CN'
      };

      this.placesService!.getDetails(request, (result, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
          reject(this.createError(ErrorType.API_QUOTA_EXCEEDED, 'API配额已用完，请稍后重试'));
          return;
        }

        if (status !== google.maps.places.PlacesServiceStatus.OK || !result) {
          reject(this.createError(ErrorType.PLACE_DETAILS_FAILED, `无法获取店铺详情: ${placeId}`));
          return;
        }

        const location = result.geometry!.location!;

        const venue: Venue = {
          placeId: result.place_id!,
          name: result.name!,
          address: result.formatted_address!,
          location: {
            address: result.formatted_address!,
            latitude: location.lat(),
            longitude: location.lng(),
            placeId: result.place_id!
          },
          rating: result.rating || 0,
          userRatingsTotal: result.user_ratings_total || 0,
          priceLevel: result.price_level || 0,
          photos: this.parsePhotos(result.photos),
          openingHours: this.parseOpeningHours(result.opening_hours),
          phoneNumber: result.formatted_phone_number,
          website: result.website,
          types: result.types || [],
          distance: 0 // Will be calculated separately
        };

        resolve(venue);
      });
    });
  }

  /**
   * 获取路线信息
   */
  async getDirections(origin: Location, destination: Location): Promise<DirectionsResult> {
    if (!origin || !destination) {
      throw this.createError(ErrorType.INVALID_INPUT, '需要提供起点和终点');
    }

    await this.ensureLoaded();

    return new Promise((resolve, reject) => {
      const request: google.maps.DirectionsRequest = {
        origin: new google.maps.LatLng(origin.latitude, origin.longitude),
        destination: new google.maps.LatLng(destination.latitude, destination.longitude),
        travelMode: google.maps.TravelMode.DRIVING,
        language: 'zh-CN'
      };

      this.directionsService!.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OVER_QUERY_LIMIT) {
          reject(this.createError(ErrorType.API_QUOTA_EXCEEDED, 'API配额已用完，请稍后重试'));
          return;
        }

        if (status !== google.maps.DirectionsStatus.OK || !result) {
          reject(this.createError(ErrorType.NETWORK_ERROR, '无法获取路线信息'));
          return;
        }

        const route = result.routes[0];
        const leg = route.legs[0];

        resolve({
          distance: leg.distance!,
          duration: leg.duration!,
          routes: result.routes
        });
      });
    });
  }

  /**
   * 计算中心点 - 计算两个地点之间的中心位置
   */
  async calculateMidpoint(location1: Location, location2: Location): Promise<Location> {
    if (!location1 || !location2) {
      throw this.createError(ErrorType.INVALID_INPUT, '需要提供两个有效的地点');
    }

    try {
      // 使用球面几何计算中心点
      const lat1 = this.toRadians(location1.latitude);
      const lon1 = this.toRadians(location1.longitude);
      const lat2 = this.toRadians(location2.latitude);
      const lon2 = this.toRadians(location2.longitude);

      const dLon = lon2 - lon1;

      const Bx = Math.cos(lat2) * Math.cos(dLon);
      const By = Math.cos(lat2) * Math.sin(dLon);

      const lat3 = Math.atan2(
        Math.sin(lat1) + Math.sin(lat2),
        Math.sqrt((Math.cos(lat1) + Bx) * (Math.cos(lat1) + Bx) + By * By)
      );
      const lon3 = lon1 + Math.atan2(By, Math.cos(lat1) + Bx);

      const midpointLat = this.toDegrees(lat3);
      const midpointLon = this.toDegrees(lon3);

      // 使用反向地理编码获取中心点地址
      const address = await this.reverseGeocode(midpointLat, midpointLon);

      return {
        address,
        latitude: midpointLat,
        longitude: midpointLon
      };
    } catch (error) {
      throw this.createError(ErrorType.GEOCODING_FAILED, `计算中心点失败: ${(error as Error).message}`);
    }
  }

  // 私有辅助方法

  /**
   * 创建标准化错误对象
   */
  private createError(type: ErrorType, message: string, details?: any): AppError {
    return {
      type,
      message,
      details,
      timestamp: new Date()
    };
  }

  /**
   * 解析照片数据
   */
  private parsePhotos(photos: google.maps.places.PlacePhoto[] | undefined): any[] {
    if (!photos || !Array.isArray(photos)) {
      return [];
    }

    return photos.map(photo => ({
      photoReference: photo.getUrl({ maxWidth: 400, maxHeight: 300 }),
      width: 400,
      height: 300
    }));
  }

  /**
   * 解析营业时间数据
   */
  private parseOpeningHours(openingHours: google.maps.places.PlaceOpeningHours | undefined): any {
    if (!openingHours) {
      return {
        openNow: false,
        periods: [],
        weekdayText: []
      };
    }

    return {
      openNow: openingHours.open_now || false,
      periods: openingHours.periods || [],
      weekdayText: openingHours.weekday_text || []
    };
  }

  /**
   * 计算两点之间的距离（米）
   */
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

  /**
   * 去除重复的店铺
   */
  private removeDuplicateVenues(venues: Venue[]): Venue[] {
    const seen = new Set<string>();
    return venues.filter(venue => {
      if (seen.has(venue.placeId)) {
        return false;
      }
      seen.add(venue.placeId);
      return true;
    });
  }

  /**
   * 角度转弧度
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * 弧度转角度
   */
  private toDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }
}

// 导出单例实例
export const googleMapsService = new GoogleMapsService();
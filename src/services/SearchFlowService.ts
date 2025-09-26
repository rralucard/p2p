import { LocationService } from './LocationService';
import { Location, Venue, SearchParams, AppError, ErrorType } from '../types';

/**
 * 搜索结果缓存项
 */
interface CacheItem {
  key: string;
  data: Venue[];
  timestamp: number;
  expiresAt: number;
}

/**
 * 搜索流程服务
 * 整合完整的搜索流程，包括缓存机制和历史记录
 */
export class SearchFlowService {
  public readonly locationService: LocationService;
  private cache: Map<string, CacheItem> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30分钟缓存
  private readonly MAX_CACHE_SIZE = 50; // 最大缓存条目数

  constructor() {
    this.locationService = new LocationService();
    this.startCacheCleanup();
  }

  /**
   * 执行完整的搜索流程
   * @param searchParams 搜索参数
   * @returns Promise<SearchFlowResult> 搜索结果
   */
  async executeSearchFlow(searchParams: SearchParams): Promise<SearchFlowResult> {
    const startTime = Date.now();
    
    try {
      // 1. 验证搜索参数
      this.validateSearchParams(searchParams);

      // 2. 计算中心点
      const midpoint = await this.locationService.calculateMidpoint(
        searchParams.location1,
        searchParams.location2
      );

      // 3. 检查缓存
      const cacheKey = this.generateCacheKey(searchParams, midpoint);
      const cachedResult = this.getFromCache(cacheKey);
      
      if (cachedResult) {
        return {
          venues: cachedResult,
          midpoint,
          fromCache: true,
          searchTime: Date.now() - startTime,
          totalResults: cachedResult.length
        };
      }

      // 4. 执行搜索
      const venues = await this.locationService.searchNearbyVenues(
        midpoint,
        searchParams.venueTypes,
        searchParams.radius || 5000
      );

      // 5. 缓存结果
      this.saveToCache(cacheKey, venues);

      return {
        venues,
        midpoint,
        fromCache: false,
        searchTime: Date.now() - startTime,
        totalResults: venues.length
      };

    } catch (error) {
      throw this.handleSearchError(error);
    }
  }

  /**
   * 获取地点建议（自动补全）
   * @param query 查询字符串
   * @param location 可选的位置偏好
   * @returns Promise<Location[]> 地点建议列表
   */
  async getLocationSuggestions(query: string, location?: Location): Promise<Location[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const places = await this.locationService.searchPlaces(query, location);
      return places.map(place => place.location);
    } catch (error) {
      console.warn('Failed to get location suggestions:', error);
      return [];
    }
  }

  /**
   * 地理编码地址
   * @param address 地址字符串
   * @returns Promise<Location> 地点信息
   */
  async geocodeAddress(address: string): Promise<Location> {
    return this.locationService.geocodeAddress(address);
  }

  /**
   * 获取店铺详细信息
   * @param placeId 店铺ID
   * @returns Promise<Venue> 店铺详情
   */
  async getVenueDetails(placeId: string): Promise<Venue> {
    return this.locationService.getPlaceDetails(placeId);
  }

  /**
   * 获取路线信息
   * @param origin 起点
   * @param destination 终点
   * @returns Promise<DirectionsResult> 路线信息
   */
  async getDirections(origin: Location, destination: Location) {
    return this.locationService.getDirections(origin, destination);
  }

  /**
   * 清除搜索缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): CacheStats {
    const now = Date.now();
    let validItems = 0;
    let expiredItems = 0;

    for (const item of this.cache.values()) {
      if (item.expiresAt > now) {
        validItems++;
      } else {
        expiredItems++;
      }
    }

    return {
      totalItems: this.cache.size,
      validItems,
      expiredItems,
      maxSize: this.MAX_CACHE_SIZE
    };
  }

  // 私有方法

  /**
   * 验证搜索参数
   */
  private validateSearchParams(params: SearchParams): void {
    if (!params.location1 || !params.location2) {
      throw {
        type: ErrorType.INVALID_INPUT,
        message: '需要提供两个有效的地点',
        timestamp: new Date()
      } as AppError;
    }

    if (!params.venueTypes || params.venueTypes.length === 0) {
      throw {
        type: ErrorType.INVALID_INPUT,
        message: '需要选择至少一种店铺类型',
        timestamp: new Date()
      } as AppError;
    }

    // 验证地点坐标
    if (!this.isValidCoordinate(params.location1.latitude, params.location1.longitude) ||
        !this.isValidCoordinate(params.location2.latitude, params.location2.longitude)) {
      throw {
        type: ErrorType.INVALID_INPUT,
        message: '地点坐标无效',
        timestamp: new Date()
      } as AppError;
    }
  }

  /**
   * 验证坐标是否有效
   */
  private isValidCoordinate(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(params: SearchParams, midpoint: Location): string {
    const key = [
      params.location1.latitude.toFixed(6),
      params.location1.longitude.toFixed(6),
      params.location2.latitude.toFixed(6),
      params.location2.longitude.toFixed(6),
      params.venueTypes.sort().join(','),
      params.radius || 5000,
      midpoint.latitude.toFixed(6),
      midpoint.longitude.toFixed(6)
    ].join('|');

    return btoa(key); // Base64编码以确保键的安全性
  }

  /**
   * 从缓存获取数据
   */
  private getFromCache(key: string): Venue[] | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // 检查是否过期
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * 保存到缓存
   */
  private saveToCache(key: string, data: Venue[]): void {
    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.findOldestCacheKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    const now = Date.now();
    const item: CacheItem = {
      key,
      data,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION
    };

    this.cache.set(key, item);
  }

  /**
   * 查找最旧的缓存键
   */
  private findOldestCacheKey(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  /**
   * 处理搜索错误
   */
  private handleSearchError(error: unknown): AppError {
    if (error && typeof error === 'object' && 'type' in error) {
      return error as AppError;
    }

    if (error instanceof Error) {
      return {
        type: ErrorType.PLACES_SEARCH_FAILED,
        message: `搜索失败: ${error.message}`,
        timestamp: new Date()
      };
    }

    return {
      type: ErrorType.PLACES_SEARCH_FAILED,
      message: '未知搜索错误',
      timestamp: new Date()
    };
  }

  /**
   * 启动缓存清理定时器
   */
  private startCacheCleanup(): void {
    // 每10分钟清理一次过期缓存
    setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.cache.entries()) {
        if (item.expiresAt <= now) {
          this.cache.delete(key);
        }
      }
    }, 10 * 60 * 1000);
  }
}

/**
 * 搜索流程结果
 */
export interface SearchFlowResult {
  venues: Venue[];
  midpoint: Location;
  fromCache: boolean;
  searchTime: number; // 搜索耗时（毫秒）
  totalResults: number;
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  totalItems: number;
  validItems: number;
  expiredItems: number;
  maxSize: number;
}

// 导出单例实例
export const searchFlowService = new SearchFlowService();
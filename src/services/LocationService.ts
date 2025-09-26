import {
  Location,
  Venue,
  Place,
  DirectionsResult,
  VenueType,
  AppError,
  ErrorType,
  RetryConfig
} from '../types';
import { googleMapsService } from './GoogleMapsService';
import { mockGoogleMapsService } from './MockGoogleMapsService';

/**
 * LocationService - 封装Google Maps API调用的服务类
 * 提供地理编码、地点搜索、店铺详情获取等功能
 */
export class LocationService {
  private readonly defaultRetryConfig: RetryConfig = {
    maxAttempts: 3,
    delayMs: 1000,
    backoffMultiplier: 2
  };

  private readonly mapsService = googleMapsService;

  /**
   * 地址地理编码 - 将地址转换为经纬度坐标
   * @param address 地址字符串
   * @returns Promise<Location> 包含坐标信息的位置对象
   */
  async geocodeAddress(address: string): Promise<Location> {
    return this.withRetry(async () => {
      return await this.mapsService.geocodeAddress(address);
    });
  }

  /**
   * 搜索地点 - 根据查询词搜索地点
   * @param query 搜索查询词
   * @param location 可选的搜索中心位置
   * @returns Promise<Place[]> 搜索结果列表
   */
  async searchPlaces(query: string, location?: Location): Promise<Place[]> {
    return this.withRetry(async () => {
      return await this.mapsService.searchPlaces(query, location);
    });
  }

  /**
   * 获取店铺详情 - 根据placeId获取详细信息
   * @param placeId Google Places的place_id
   * @returns Promise<Venue> 店铺详细信息
   */
  async getPlaceDetails(placeId: string): Promise<Venue> {
    return this.withRetry(async () => {
      return await this.mapsService.getPlaceDetails(placeId);
    });
  }

  /**
   * 计算中心点 - 计算两个地点之间的中心位置
   * @param location1 第一个地点
   * @param location2 第二个地点
   * @returns Promise<Location> 中心点位置
   */
  async calculateMidpoint(location1: Location, location2: Location): Promise<Location> {
    return this.withRetry(async () => {
      return await this.mapsService.calculateMidpoint(location1, location2);
    });
  }

  /**
   * 搜索附近的店铺 - 根据位置和店铺类型搜索
   * @param location 搜索中心位置
   * @param venueTypes 店铺类型数组
   * @param radius 搜索半径（米）
   * @returns Promise<Venue[]> 店铺列表
   */
  async searchNearbyVenues(
    location: Location,
    venueTypes: VenueType[],
    radius: number = 2000
  ): Promise<Venue[]> {
    return this.withRetry(async () => {
      return await this.mapsService.searchNearbyVenues(location, venueTypes, radius);
    });
  }

  /**
   * 获取路线信息
   * @param origin 起点
   * @param destination 终点
   * @returns Promise<DirectionsResult> 路线信息
   */
  async getDirections(origin: Location, destination: Location): Promise<DirectionsResult> {
    return this.withRetry(async () => {
      return await this.mapsService.getDirections(origin, destination);
    });
  }

  // 私有辅助方法

  /**
   * 重试机制包装器
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    config: RetryConfig = this.defaultRetryConfig
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // 如果是最后一次尝试，直接抛出错误
        if (attempt === config.maxAttempts) {
          throw lastError;
        }

        // 某些错误不需要重试
        if (this.shouldNotRetry(error as AppError)) {
          throw lastError;
        }

        // 等待后重试
        const delay = config.delayMs * Math.pow(config.backoffMultiplier, attempt - 1);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * 判断错误是否不应该重试
   */
  private shouldNotRetry(error: AppError): boolean {
    const noRetryErrors = [
      ErrorType.INVALID_INPUT,
      ErrorType.API_QUOTA_EXCEEDED,
      ErrorType.LOCATION_NOT_FOUND
    ];
    return noRetryErrors.includes(error.type);
  }

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
   * 延迟函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 导出单例实例
export const locationService = new LocationService();
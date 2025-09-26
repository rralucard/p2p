/**
 * 错误处理相关的类型定义
 */

export enum ErrorType {
  GEOCODING_FAILED = 'GEOCODING_FAILED',
  PLACES_SEARCH_FAILED = 'PLACES_SEARCH_FAILED',
  PLACE_DETAILS_FAILED = 'PLACE_DETAILS_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MCP_CONNECTION_ERROR = 'MCP_CONNECTION_ERROR',
  API_QUOTA_EXCEEDED = 'API_QUOTA_EXCEEDED',
  LOCATION_NOT_FOUND = 'LOCATION_NOT_FOUND'
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  timestamp?: Date;
}

/**
 * API 响应包装器
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: AppError;
}

/**
 * 重试配置
 */
export interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
}
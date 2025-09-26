import { Location } from './location';
import { Venue, VenueType } from './venue';
import { AppError } from './error';

/**
 * 搜索状态模型
 */
export interface SearchState {
  // 用户输入的两个地点
  location1: Location | null;
  location2: Location | null;
  
  // 计算出的中心点
  midpoint: Location | null;
  
  // 选择的店铺类型
  selectedVenueTypes: VenueType[];
  
  // 搜索结果
  venues: Venue[];
  
  // 当前选中的店铺
  selectedVenue: Venue | null;
  
  // 加载状态
  loading: boolean;
  
  // 错误信息
  error: AppError | null;
  
  // 搜索历史（可选功能）
  searchHistory: SearchHistoryItem[];
}

/**
 * 搜索历史项
 */
export interface SearchHistoryItem {
  id: string;
  location1: Location;
  location2: Location;
  venueTypes: VenueType[];
  timestamp: Date;
  resultCount: number;
}

/**
 * 搜索参数
 */
export interface SearchParams {
  location1: Location;
  location2: Location;
  venueTypes: VenueType[];
  radius?: number; // 搜索半径，默认为合理值
  maxResults?: number; // 最大结果数量
}

/**
 * 搜索过滤器
 */
export interface SearchFilters {
  minRating?: number;
  maxPriceLevel?: number;
  openNow?: boolean;
  sortBy: 'distance' | 'rating' | 'price';
}
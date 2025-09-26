import { SearchHistoryItem, SearchParams, Location, VenueType } from '../types';

/**
 * 搜索历史服务
 * 管理用户的搜索历史记录
 */
export class SearchHistoryService {
  private readonly STORAGE_KEY = 'date-location-finder-search-history';
  private readonly MAX_HISTORY_ITEMS = 20;
  private history: SearchHistoryItem[] = [];

  constructor() {
    this.loadHistory();
  }

  /**
   * 添加搜索记录到历史
   * @param params 搜索参数
   * @param resultCount 结果数量
   * @returns SearchHistoryItem 添加的历史项
   */
  addToHistory(params: SearchParams, resultCount: number): SearchHistoryItem {
    // 检查是否已存在相似的搜索
    const existingIndex = this.findSimilarSearch(params);
    
    const historyItem: SearchHistoryItem = {
      id: this.generateId(),
      location1: params.location1,
      location2: params.location2,
      venueTypes: [...params.venueTypes],
      timestamp: new Date(),
      resultCount
    };

    if (existingIndex >= 0) {
      // 更新现有记录并移到最前面
      this.history.splice(existingIndex, 1);
    }

    // 添加到历史记录开头
    this.history.unshift(historyItem);

    // 保持历史记录数量限制
    if (this.history.length > this.MAX_HISTORY_ITEMS) {
      this.history = this.history.slice(0, this.MAX_HISTORY_ITEMS);
    }

    this.saveHistory();
    return historyItem;
  }

  /**
   * 获取搜索历史
   * @param limit 可选的限制数量
   * @returns SearchHistoryItem[] 历史记录列表
   */
  getHistory(limit?: number): SearchHistoryItem[] {
    const result = [...this.history];
    return limit ? result.slice(0, limit) : result;
  }

  /**
   * 根据ID获取历史项
   * @param id 历史项ID
   * @returns SearchHistoryItem | null
   */
  getHistoryItem(id: string): SearchHistoryItem | null {
    return this.history.find(item => item.id === id) || null;
  }

  /**
   * 删除历史项
   * @param id 历史项ID
   * @returns boolean 是否删除成功
   */
  removeHistoryItem(id: string): boolean {
    const index = this.history.findIndex(item => item.id === id);
    if (index >= 0) {
      this.history.splice(index, 1);
      this.saveHistory();
      return true;
    }
    return false;
  }

  /**
   * 清除所有历史记录
   */
  clearHistory(): void {
    this.history = [];
    this.saveHistory();
  }

  /**
   * 搜索历史记录
   * @param query 搜索查询
   * @returns SearchHistoryItem[] 匹配的历史记录
   */
  searchHistory(query: string): SearchHistoryItem[] {
    if (!query || query.trim().length === 0) {
      return this.getHistory();
    }

    const lowerQuery = query.toLowerCase().trim();
    
    return this.history.filter(item => {
      // 搜索地点名称
      const location1Match = item.location1.address.toLowerCase().includes(lowerQuery);
      const location2Match = item.location2.address.toLowerCase().includes(lowerQuery);
      
      // 搜索店铺类型
      const venueTypeMatch = item.venueTypes.some(type => 
        this.getVenueTypeDisplayName(type).toLowerCase().includes(lowerQuery)
      );

      return location1Match || location2Match || venueTypeMatch;
    });
  }

  /**
   * 获取最近的搜索记录
   * @param count 数量，默认5条
   * @returns SearchHistoryItem[]
   */
  getRecentSearches(count: number = 5): SearchHistoryItem[] {
    return this.history.slice(0, count);
  }

  /**
   * 获取常用的地点
   * @param limit 限制数量
   * @returns Location[] 常用地点列表
   */
  getFrequentLocations(limit: number = 10): Location[] {
    const locationCount = new Map<string, { location: Location; count: number }>();

    // 统计地点使用频率
    this.history.forEach(item => {
      [item.location1, item.location2].forEach(location => {
        const key = `${location.latitude},${location.longitude}`;
        const existing = locationCount.get(key);
        
        if (existing) {
          existing.count++;
        } else {
          locationCount.set(key, { location, count: 1 });
        }
      });
    });

    // 按使用频率排序并返回
    return Array.from(locationCount.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(item => item.location);
  }

  /**
   * 获取常用的店铺类型组合
   * @param limit 限制数量
   * @returns VenueType[][] 常用类型组合
   */
  getFrequentVenueTypeCombinations(limit: number = 5): VenueType[][] {
    const combinationCount = new Map<string, { types: VenueType[]; count: number }>();

    this.history.forEach(item => {
      const key = item.venueTypes.sort().join(',');
      const existing = combinationCount.get(key);
      
      if (existing) {
        existing.count++;
      } else {
        combinationCount.set(key, { types: [...item.venueTypes], count: 1 });
      }
    });

    return Array.from(combinationCount.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(item => item.types);
  }

  /**
   * 导出历史记录
   * @returns string JSON格式的历史记录
   */
  exportHistory(): string {
    return JSON.stringify({
      version: '1.0',
      exportDate: new Date().toISOString(),
      history: this.history
    }, null, 2);
  }

  /**
   * 导入历史记录
   * @param jsonData JSON格式的历史记录
   * @returns boolean 是否导入成功
   */
  importHistory(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.history || !Array.isArray(data.history)) {
        return false;
      }

      // 验证数据格式
      const validHistory = data.history.filter(this.isValidHistoryItem);
      
      if (validHistory.length === 0) {
        return false;
      }

      // 合并历史记录，去重
      const mergedHistory = [...validHistory, ...this.history];
      const uniqueHistory = this.removeDuplicateHistory(mergedHistory);
      
      this.history = uniqueHistory.slice(0, this.MAX_HISTORY_ITEMS);
      this.saveHistory();
      
      return true;
    } catch (error) {
      console.error('Failed to import history:', error);
      return false;
    }
  }

  // 私有方法

  /**
   * 从本地存储加载历史记录
   */
  private loadHistory(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.history = Array.isArray(data) ? data.filter(this.isValidHistoryItem) : [];
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
      this.history = [];
    }
  }

  /**
   * 保存历史记录到本地存储
   */
  private saveHistory(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.history));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }

  /**
   * 查找相似的搜索
   */
  private findSimilarSearch(params: SearchParams): number {
    return this.history.findIndex(item => {
      const sameLocations = this.isSameLocation(item.location1, params.location1) &&
                           this.isSameLocation(item.location2, params.location2);
      
      const sameVenueTypes = item.venueTypes.length === params.venueTypes.length &&
                            item.venueTypes.every(type => params.venueTypes.includes(type));

      return sameLocations && sameVenueTypes;
    });
  }

  /**
   * 检查两个地点是否相同
   */
  private isSameLocation(loc1: Location, loc2: Location): boolean {
    const latDiff = Math.abs(loc1.latitude - loc2.latitude);
    const lngDiff = Math.abs(loc1.longitude - loc2.longitude);
    
    // 允许小的坐标差异（约100米）
    return latDiff < 0.001 && lngDiff < 0.001;
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * 验证历史项是否有效
   */
  private isValidHistoryItem(item: any): item is SearchHistoryItem {
    return item &&
           typeof item.id === 'string' &&
           item.location1 && typeof item.location1.latitude === 'number' &&
           item.location2 && typeof item.location2.latitude === 'number' &&
           Array.isArray(item.venueTypes) &&
           item.timestamp;
  }

  /**
   * 去除重复的历史记录
   */
  private removeDuplicateHistory(history: SearchHistoryItem[]): SearchHistoryItem[] {
    const seen = new Set<string>();
    return history.filter(item => {
      const key = `${item.location1.latitude},${item.location1.longitude}|${item.location2.latitude},${item.location2.longitude}|${item.venueTypes.sort().join(',')}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * 获取店铺类型的显示名称
   */
  private getVenueTypeDisplayName(type: VenueType): string {
    const displayNames: Partial<Record<VenueType, string>> = {
      [VenueType.RESTAURANT]: '餐厅',
      [VenueType.CAFE]: '咖啡厅',
      [VenueType.MOVIE_THEATER]: '电影院',
      [VenueType.SHOPPING_MALL]: '购物中心',
      [VenueType.BAR]: '酒吧',
      [VenueType.PARK]: '公园'
    };
    
    return displayNames[type] || type;
  }
}

// 导出单例实例
export const searchHistoryService = new SearchHistoryService();
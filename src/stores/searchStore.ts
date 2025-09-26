import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SearchState, SearchParams, SearchFilters } from '../types/search';
import { Location } from '../types/location';
import { Venue, VenueType } from '../types/venue';
import { AppError } from '../types/error';

/**
 * 搜索状态管理的Actions接口
 */
interface SearchActions {
  // 地点管理
  setLocation1: (location: Location | null) => void;
  setLocation2: (location: Location | null) => void;
  setMidpoint: (location: Location | null) => void;
  clearLocations: () => void;
  
  // 店铺类型管理
  setSelectedVenueTypes: (types: VenueType[]) => void;
  addVenueType: (type: VenueType) => void;
  removeVenueType: (type: VenueType) => void;
  clearVenueTypes: () => void;
  
  // 搜索结果管理
  setVenues: (venues: Venue[]) => void;
  setSelectedVenue: (venue: Venue | null) => void;
  clearSearchResults: () => void;
  
  // 状态管理
  setLoading: (loading: boolean) => void;
  setError: (error: AppError | null) => void;
  clearError: () => void;
  
  // 搜索过滤器
  setFilters: (filters: Partial<SearchFilters>) => void;
  
  // 重置所有状态
  resetAll: () => void;
  
  // 搜索历史管理
  addToHistory: (params: SearchParams, resultCount: number) => void;
  clearHistory: () => void;
}

/**
 * 完整的Store接口
 */
type SearchStore = SearchState & SearchActions;

/**
 * 初始状态
 */
const initialState: SearchState = {
  location1: null,
  location2: null,
  midpoint: null,
  selectedVenueTypes: [],
  venues: [],
  selectedVenue: null,
  loading: false,
  error: null,
  searchHistory: [],
};



/**
 * 搜索状态Store
 * 使用Zustand进行状态管理，支持持久化存储
 */
export const useSearchStore = create<SearchStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // 地点管理Actions
      setLocation1: (location) => {
        set({ location1: location });
        // 清除之前的搜索结果和错误
        if (location) {
          set({ venues: [], selectedVenue: null, error: null });
        }
      },
      
      setLocation2: (location) => {
        set({ location2: location });
        // 清除之前的搜索结果和错误
        if (location) {
          set({ venues: [], selectedVenue: null, error: null });
        }
      },
      
      setMidpoint: (location) => set({ midpoint: location }),
      
      clearLocations: () => set({
        location1: null,
        location2: null,
        midpoint: null,
        venues: [],
        selectedVenue: null,
        error: null,
      }),
      
      // 店铺类型管理Actions
      setSelectedVenueTypes: (types) => {
        set({ selectedVenueTypes: types });
        // 清除之前的搜索结果
        set({ venues: [], selectedVenue: null });
      },
      
      addVenueType: (type) => {
        const { selectedVenueTypes } = get();
        if (!selectedVenueTypes.includes(type)) {
          set({ 
            selectedVenueTypes: [...selectedVenueTypes, type],
            venues: [],
            selectedVenue: null,
          });
        }
      },
      
      removeVenueType: (type) => {
        const { selectedVenueTypes } = get();
        set({ 
          selectedVenueTypes: selectedVenueTypes.filter(t => t !== type),
          venues: [],
          selectedVenue: null,
        });
      },
      
      clearVenueTypes: () => set({
        selectedVenueTypes: [],
        venues: [],
        selectedVenue: null,
      }),
      
      // 搜索结果管理Actions
      setVenues: (venues) => set({ venues, selectedVenue: null }),
      
      setSelectedVenue: (venue) => set({ selectedVenue: venue }),
      
      clearSearchResults: () => set({
        venues: [],
        selectedVenue: null,
        error: null,
      }),
      
      // 状态管理Actions
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ 
        error,
        loading: false, // 出错时停止加载状态
      }),
      
      clearError: () => set({ error: null }),
      
      // 搜索过滤器管理
      setFilters: (filters) => {
        // 这里可以扩展为更复杂的过滤逻辑
        // 目前主要用于排序和基本过滤
        const { venues } = get();
        if (venues.length > 0 && filters.sortBy) {
          let sortedVenues = [...venues];
          switch (filters.sortBy) {
            case 'distance':
              sortedVenues.sort((a, b) => a.distance - b.distance);
              break;
            case 'rating':
              sortedVenues.sort((a, b) => b.rating - a.rating);
              break;
            case 'price':
              sortedVenues.sort((a, b) => a.priceLevel - b.priceLevel);
              break;
          }
          set({ venues: sortedVenues });
        }
      },
      
      // 重置所有状态
      resetAll: () => set(initialState),
      
      // 搜索历史管理
      addToHistory: (params, resultCount) => {
        const { searchHistory } = get();
        const historyItem = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          location1: params.location1,
          location2: params.location2,
          venueTypes: params.venueTypes,
          timestamp: new Date(),
          resultCount,
        };
        
        // 保持历史记录最多10条，最新的在前面
        const newHistory = [historyItem, ...searchHistory.slice(0, 9)];
        set({ searchHistory: newHistory });
      },
      
      clearHistory: () => set({ searchHistory: [] }),
    }),
    {
      name: 'date-location-finder-search', // 持久化存储的key
      storage: createJSONStorage(() => localStorage),
      // 只持久化部分状态，不包括loading和error
      partialize: (state) => ({
        searchHistory: state.searchHistory,
        selectedVenueTypes: state.selectedVenueTypes,
      }),
    }
  )
);

/**
 * 选择器函数 - 用于获取特定的状态片段
 */
export const searchSelectors = {
  // 检查是否可以开始搜索
  canStartSearch: (state: SearchState) => 
    state.location1 !== null && 
    state.location2 !== null && 
    state.selectedVenueTypes.length > 0,
  
  // 检查是否有搜索结果
  hasResults: (state: SearchState) => state.venues.length > 0,
  
  // 检查是否有错误
  hasError: (state: SearchState) => state.error !== null,
  
  // 获取当前搜索参数
  getCurrentSearchParams: (state: SearchState): SearchParams | null => {
    if (!state.location1 || !state.location2 || state.selectedVenueTypes.length === 0) {
      return null;
    }
    return {
      location1: state.location1,
      location2: state.location2,
      venueTypes: state.selectedVenueTypes,
    };
  },
};

/**
 * Hook用于获取搜索状态的计算属性
 */
export const useSearchSelectors = () => {
  const state = useSearchStore();
  
  return {
    canStartSearch: searchSelectors.canStartSearch(state),
    hasResults: searchSelectors.hasResults(state),
    hasError: searchSelectors.hasError(state),
    currentSearchParams: searchSelectors.getCurrentSearchParams(state),
  };
};
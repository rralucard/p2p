import { describe, it, expect, beforeEach } from 'vitest';
import { useSearchStore, searchSelectors } from '../searchStore';
import { VenueType } from '../../types/venue';
import { ErrorType } from '../../types/error';

// Mock location data for testing
const mockLocation1 = {
  address: '北京市朝阳区',
  latitude: 39.9042,
  longitude: 116.4074,
  placeId: 'place1',
};

const mockLocation2 = {
  address: '北京市海淀区',
  latitude: 39.9889,
  longitude: 116.3058,
  placeId: 'place2',
};

const mockVenue = {
  placeId: 'venue1',
  name: '测试餐厅',
  address: '测试地址',
  location: mockLocation1,
  rating: 4.5,
  userRatingsTotal: 100,
  priceLevel: 2,
  photos: [],
  openingHours: {
    openNow: true,
    periods: [],
    weekdayText: [],
  },
  types: ['restaurant'],
  distance: 500,
};

describe('SearchStore', () => {
  beforeEach(() => {
    // 重置store状态
    useSearchStore.getState().resetAll();
  });

  describe('Location Management', () => {
    it('should set location1 correctly', () => {
      const { setLocation1 } = useSearchStore.getState();
      
      setLocation1(mockLocation1);
      
      const state = useSearchStore.getState();
      expect(state.location1).toEqual(mockLocation1);
      expect(state.venues).toEqual([]); // 应该清除之前的搜索结果
    });

    it('should set location2 correctly', () => {
      const { setLocation2 } = useSearchStore.getState();
      
      setLocation2(mockLocation2);
      
      const state = useSearchStore.getState();
      expect(state.location2).toEqual(mockLocation2);
    });

    it('should clear all locations', () => {
      const { setLocation1, setLocation2, clearLocations } = useSearchStore.getState();
      
      // 先设置一些数据
      setLocation1(mockLocation1);
      setLocation2(mockLocation2);
      
      // 清除
      clearLocations();
      
      const state = useSearchStore.getState();
      expect(state.location1).toBeNull();
      expect(state.location2).toBeNull();
      expect(state.midpoint).toBeNull();
    });
  });

  describe('Venue Type Management', () => {
    it('should set selected venue types', () => {
      const { setSelectedVenueTypes } = useSearchStore.getState();
      const types = [VenueType.RESTAURANT, VenueType.CAFE];
      
      setSelectedVenueTypes(types);
      
      const state = useSearchStore.getState();
      expect(state.selectedVenueTypes).toEqual(types);
    });

    it('should add venue type', () => {
      const { addVenueType } = useSearchStore.getState();
      
      addVenueType(VenueType.RESTAURANT);
      addVenueType(VenueType.CAFE);
      
      const state = useSearchStore.getState();
      expect(state.selectedVenueTypes).toContain(VenueType.RESTAURANT);
      expect(state.selectedVenueTypes).toContain(VenueType.CAFE);
    });

    it('should not add duplicate venue type', () => {
      const { addVenueType } = useSearchStore.getState();
      
      addVenueType(VenueType.RESTAURANT);
      addVenueType(VenueType.RESTAURANT); // 重复添加
      
      const state = useSearchStore.getState();
      expect(state.selectedVenueTypes.filter(t => t === VenueType.RESTAURANT)).toHaveLength(1);
    });

    it('should remove venue type', () => {
      const { setSelectedVenueTypes, removeVenueType } = useSearchStore.getState();
      
      setSelectedVenueTypes([VenueType.RESTAURANT, VenueType.CAFE]);
      removeVenueType(VenueType.RESTAURANT);
      
      const state = useSearchStore.getState();
      expect(state.selectedVenueTypes).not.toContain(VenueType.RESTAURANT);
      expect(state.selectedVenueTypes).toContain(VenueType.CAFE);
    });
  });

  describe('Search Results Management', () => {
    it('should set venues', () => {
      const { setVenues } = useSearchStore.getState();
      const venues = [mockVenue];
      
      setVenues(venues);
      
      const state = useSearchStore.getState();
      expect(state.venues).toEqual(venues);
      expect(state.selectedVenue).toBeNull(); // 应该清除选中的venue
    });

    it('should set selected venue', () => {
      const { setSelectedVenue } = useSearchStore.getState();
      
      setSelectedVenue(mockVenue);
      
      const state = useSearchStore.getState();
      expect(state.selectedVenue).toEqual(mockVenue);
    });

    it('should clear search results', () => {
      const { setVenues, setSelectedVenue, clearSearchResults } = useSearchStore.getState();
      
      // 先设置一些数据
      setVenues([mockVenue]);
      setSelectedVenue(mockVenue);
      
      // 清除
      clearSearchResults();
      
      const state = useSearchStore.getState();
      expect(state.venues).toEqual([]);
      expect(state.selectedVenue).toBeNull();
    });
  });

  describe('State Management', () => {
    it('should set loading state', () => {
      const { setLoading } = useSearchStore.getState();
      
      setLoading(true);
      expect(useSearchStore.getState().loading).toBe(true);
      
      setLoading(false);
      expect(useSearchStore.getState().loading).toBe(false);
    });

    it('should set error state', () => {
      const { setError } = useSearchStore.getState();
      const error = {
        type: ErrorType.NETWORK_ERROR,
        message: 'Test error',
      };
      
      setError(error);
      
      const state = useSearchStore.getState();
      expect(state.error).toEqual(error);
      expect(state.loading).toBe(false); // 出错时应该停止加载
    });

    it('should clear error', () => {
      const { setError, clearError } = useSearchStore.getState();
      
      setError({
        type: ErrorType.NETWORK_ERROR,
        message: 'Test error',
      });
      
      clearError();
      
      expect(useSearchStore.getState().error).toBeNull();
    });
  });

  describe('Search History', () => {
    it('should add to history', () => {
      const { addToHistory } = useSearchStore.getState();
      const params = {
        location1: mockLocation1,
        location2: mockLocation2,
        venueTypes: [VenueType.RESTAURANT],
      };
      
      addToHistory(params, 5);
      
      const state = useSearchStore.getState();
      expect(state.searchHistory).toHaveLength(1);
      expect(state.searchHistory[0].location1).toEqual(mockLocation1);
      expect(state.searchHistory[0].resultCount).toBe(5);
    });

    it('should limit history to 10 items', () => {
      const { addToHistory } = useSearchStore.getState();
      const params = {
        location1: mockLocation1,
        location2: mockLocation2,
        venueTypes: [VenueType.RESTAURANT],
      };
      
      // 添加12个历史记录
      for (let i = 0; i < 12; i++) {
        addToHistory(params, i);
      }
      
      const state = useSearchStore.getState();
      expect(state.searchHistory).toHaveLength(10); // 应该限制为10个
    });
  });

  describe('Selectors', () => {
    it('should check if can start search', () => {
      const { setLocation1, setLocation2, addVenueType } = useSearchStore.getState();
      
      // 初始状态不能搜索
      expect(searchSelectors.canStartSearch(useSearchStore.getState())).toBe(false);
      
      // 只有location1不能搜索
      setLocation1(mockLocation1);
      expect(searchSelectors.canStartSearch(useSearchStore.getState())).toBe(false);
      
      // 有两个location但没有venue type不能搜索
      setLocation2(mockLocation2);
      expect(searchSelectors.canStartSearch(useSearchStore.getState())).toBe(false);
      
      // 所有条件满足可以搜索
      addVenueType(VenueType.RESTAURANT);
      expect(searchSelectors.canStartSearch(useSearchStore.getState())).toBe(true);
    });

    it('should check if has results', () => {
      const { setVenues } = useSearchStore.getState();
      
      expect(searchSelectors.hasResults(useSearchStore.getState())).toBe(false);
      
      setVenues([mockVenue]);
      expect(searchSelectors.hasResults(useSearchStore.getState())).toBe(true);
    });

    it('should get current search params', () => {
      const { setLocation1, setLocation2, addVenueType } = useSearchStore.getState();
      
      // 初始状态返回null
      expect(searchSelectors.getCurrentSearchParams(useSearchStore.getState())).toBeNull();
      
      // 设置完整参数
      setLocation1(mockLocation1);
      setLocation2(mockLocation2);
      addVenueType(VenueType.RESTAURANT);
      
      const params = searchSelectors.getCurrentSearchParams(useSearchStore.getState());
      expect(params).toEqual({
        location1: mockLocation1,
        location2: mockLocation2,
        venueTypes: [VenueType.RESTAURANT],
      });
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all state', () => {
      const { 
        setLocation1, 
        setLocation2, 
        addVenueType, 
        setVenues, 
        setLoading, 
        setError,
        resetAll 
      } = useSearchStore.getState();
      
      // 设置一些状态
      setLocation1(mockLocation1);
      setLocation2(mockLocation2);
      addVenueType(VenueType.RESTAURANT);
      setVenues([mockVenue]);
      setLoading(true);
      setError({
        type: ErrorType.NETWORK_ERROR,
        message: 'Test error',
      });
      
      // 重置
      resetAll();
      
      const state = useSearchStore.getState();
      expect(state.location1).toBeNull();
      expect(state.location2).toBeNull();
      expect(state.selectedVenueTypes).toEqual([]);
      expect(state.venues).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
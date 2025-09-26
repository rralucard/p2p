/**
 * 状态管理Store导出
 * 
 * 这个文件统一导出所有的Zustand stores和相关的工具函数
 */

// 搜索状态管理
export {
  useSearchStore,
  searchSelectors,
  useSearchSelectors,
} from './searchStore';

// UI状态管理
export {
  useUIStore,
  uiSelectors,
  useUISelectors,
  initializeUIStore,
} from './uiStore';

// 类型导出
export type { SearchState, SearchParams, SearchFilters } from '../types/search';
export type { Location } from '../types/location';
export type { Venue, VenueType } from '../types/venue';
export type { AppError, ErrorType } from '../types/error';

/**
 * 组合Hook - 同时获取搜索和UI状态
 */
export const useAppState = () => {
  const searchState = useSearchStore();
  const uiState = useUIStore();
  const searchSelectors = useSearchSelectors();
  const uiSelectors = useUISelectors();
  
  return {
    // 搜索状态
    search: searchState,
    searchSelectors,
    
    // UI状态
    ui: uiState,
    uiSelectors,
    
    // 组合的计算属性
    isAppLoading: uiSelectors.hasAnyLoading || searchState.loading,
    canStartSearch: searchSelectors.canStartSearch && !uiSelectors.hasAnyLoading,
  };
};

/**
 * 重置所有状态的工具函数
 */
export const resetAllStores = () => {
  useSearchStore.getState().resetAll();
  useUIStore.getState().clearAllNotifications();
  useUIStore.getState().closeAllModals();
  useUIStore.getState().clearAllLoadingStates();
};

/**
 * 开发环境下的调试工具
 */
export const devTools = {
  // 获取当前所有状态的快照
  getStateSnapshot: () => ({
    search: useSearchStore.getState(),
    ui: useUIStore.getState(),
  }),
  
  // 重置所有状态
  resetAll: resetAllStores,
  
  // 模拟错误状态
  simulateError: (message: string = 'Test error') => {
    useSearchStore.getState().setError({
      type: 'NETWORK_ERROR' as const,
      message,
      timestamp: new Date(),
    });
  },
  
  // 模拟加载状态
  simulateLoading: (duration: number = 2000) => {
    useSearchStore.getState().setLoading(true);
    setTimeout(() => {
      useSearchStore.getState().setLoading(false);
    }, duration);
  },
};

// 只在开发环境下暴露调试工具
if (import.meta.env.DEV) {
  (window as any).storeDevTools = devTools;
}
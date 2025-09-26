import { create } from 'zustand';

/**
 * UI状态接口
 */
interface UIState {
  // 模态框状态
  isVenueDetailModalOpen: boolean;
  isLocationInputModalOpen: boolean;
  isVenueTypeModalOpen: boolean;
  
  // 侧边栏和面板状态
  isSidebarOpen: boolean;
  isMapViewActive: boolean;
  
  // 加载状态细分
  isGeocodingLocation1: boolean;
  isGeocodingLocation2: boolean;
  isCalculatingMidpoint: boolean;
  isSearchingVenues: boolean;
  isLoadingVenueDetails: boolean;
  
  // 通知状态
  notifications: Notification[];
  
  // 主题设置
  isDarkMode: boolean;
  
  // 移动端适配
  isMobileView: boolean;
}

/**
 * 通知接口
 */
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number; // 自动消失时间，毫秒
  persistent?: boolean; // 是否持久显示
}

/**
 * UI Actions接口
 */
interface UIActions {
  // 模态框控制
  openVenueDetailModal: () => void;
  closeVenueDetailModal: () => void;
  openLocationInputModal: () => void;
  closeLocationInputModal: () => void;
  openVenueTypeModal: () => void;
  closeVenueTypeModal: () => void;
  closeAllModals: () => void;
  
  // 侧边栏和视图控制
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setMapViewActive: (active: boolean) => void;
  
  // 加载状态控制
  setGeocodingLocation1: (loading: boolean) => void;
  setGeocodingLocation2: (loading: boolean) => void;
  setCalculatingMidpoint: (loading: boolean) => void;
  setSearchingVenues: (loading: boolean) => void;
  setLoadingVenueDetails: (loading: boolean) => void;
  clearAllLoadingStates: () => void;
  
  // 通知管理
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // 主题控制
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
  
  // 移动端适配
  setMobileView: (isMobile: boolean) => void;
}

/**
 * 完整的UI Store接口
 */
type UIStore = UIState & UIActions;

/**
 * 初始UI状态
 */
const initialUIState: UIState = {
  // 模态框状态
  isVenueDetailModalOpen: false,
  isLocationInputModalOpen: false,
  isVenueTypeModalOpen: false,
  
  // 侧边栏和面板状态
  isSidebarOpen: false,
  isMapViewActive: false,
  
  // 加载状态
  isGeocodingLocation1: false,
  isGeocodingLocation2: false,
  isCalculatingMidpoint: false,
  isSearchingVenues: false,
  isLoadingVenueDetails: false,
  
  // 通知状态
  notifications: [],
  
  // 主题设置
  isDarkMode: false,
  
  // 移动端适配
  isMobileView: false,
};

/**
 * UI状态Store
 */
export const useUIStore = create<UIStore>((set, get) => ({
  ...initialUIState,
  
  // 模态框控制Actions
  openVenueDetailModal: () => set({ isVenueDetailModalOpen: true }),
  closeVenueDetailModal: () => set({ isVenueDetailModalOpen: false }),
  openLocationInputModal: () => set({ isLocationInputModalOpen: true }),
  closeLocationInputModal: () => set({ isLocationInputModalOpen: false }),
  openVenueTypeModal: () => set({ isVenueTypeModalOpen: true }),
  closeVenueTypeModal: () => set({ isVenueTypeModalOpen: false }),
  
  closeAllModals: () => set({
    isVenueDetailModalOpen: false,
    isLocationInputModalOpen: false,
    isVenueTypeModalOpen: false,
  }),
  
  // 侧边栏和视图控制Actions
  toggleSidebar: () => {
    const { isSidebarOpen } = get();
    set({ isSidebarOpen: !isSidebarOpen });
  },
  
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  
  setMapViewActive: (active) => set({ isMapViewActive: active }),
  
  // 加载状态控制Actions
  setGeocodingLocation1: (loading) => set({ isGeocodingLocation1: loading }),
  setGeocodingLocation2: (loading) => set({ isGeocodingLocation2: loading }),
  setCalculatingMidpoint: (loading) => set({ isCalculatingMidpoint: loading }),
  setSearchingVenues: (loading) => set({ isSearchingVenues: loading }),
  setLoadingVenueDetails: (loading) => set({ isLoadingVenueDetails: loading }),
  
  clearAllLoadingStates: () => set({
    isGeocodingLocation1: false,
    isGeocodingLocation2: false,
    isCalculatingMidpoint: false,
    isSearchingVenues: false,
    isLoadingVenueDetails: false,
  }),
  
  // 通知管理Actions
  addNotification: (notification) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000, // 默认5秒
    };
    
    const { notifications } = get();
    set({ notifications: [...notifications, newNotification] });
    
    // 如果不是持久通知，设置自动移除
    if (!notification.persistent && newNotification.duration) {
      setTimeout(() => {
        const currentNotifications = get().notifications;
        set({
          notifications: currentNotifications.filter(n => n.id !== id)
        });
      }, newNotification.duration);
    }
  },
  
  removeNotification: (id) => {
    const { notifications } = get();
    set({ notifications: notifications.filter(n => n.id !== id) });
  },
  
  clearAllNotifications: () => set({ notifications: [] }),
  
  // 主题控制Actions
  toggleDarkMode: () => {
    const { isDarkMode } = get();
    const newDarkMode = !isDarkMode;
    set({ isDarkMode: newDarkMode });
    
    // 更新HTML类名以支持Tailwind的dark模式
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // 保存到localStorage
    localStorage.setItem('darkMode', newDarkMode.toString());
  },
  
  setDarkMode: (isDark) => {
    set({ isDarkMode: isDark });
    
    // 更新HTML类名
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // 保存到localStorage
    localStorage.setItem('darkMode', isDark.toString());
  },
  
  // 移动端适配Actions
  setMobileView: (isMobile) => set({ isMobileView: isMobile }),
}));

/**
 * UI选择器函数
 */
export const uiSelectors = {
  // 检查是否有任何模态框打开
  hasOpenModal: (state: UIState) => 
    state.isVenueDetailModalOpen || 
    state.isLocationInputModalOpen || 
    state.isVenueTypeModalOpen,
  
  // 检查是否有任何加载状态
  hasAnyLoading: (state: UIState) =>
    state.isGeocodingLocation1 ||
    state.isGeocodingLocation2 ||
    state.isCalculatingMidpoint ||
    state.isSearchingVenues ||
    state.isLoadingVenueDetails,
  
  // 获取未读通知数量
  getUnreadNotificationCount: (state: UIState) => state.notifications.length,
  
  // 获取错误通知
  getErrorNotifications: (state: UIState) => 
    state.notifications.filter(n => n.type === 'error'),
};

/**
 * Hook用于获取UI状态的计算属性
 */
export const useUISelectors = () => {
  const state = useUIStore();
  
  return {
    hasOpenModal: uiSelectors.hasOpenModal(state),
    hasAnyLoading: uiSelectors.hasAnyLoading(state),
    unreadNotificationCount: uiSelectors.getUnreadNotificationCount(state),
    errorNotifications: uiSelectors.getErrorNotifications(state),
  };
};

/**
 * 初始化UI Store的函数
 * 用于在应用启动时设置初始状态
 */
export const initializeUIStore = () => {
  const { setDarkMode, setMobileView } = useUIStore.getState();
  
  // 从localStorage恢复暗色模式设置
  const savedDarkMode = localStorage.getItem('darkMode');
  if (savedDarkMode !== null) {
    setDarkMode(savedDarkMode === 'true');
  }
  
  // 检测移动端
  const checkMobileView = () => {
    setMobileView(window.innerWidth < 768);
  };
  
  // 初始检测
  checkMobileView();
  
  // 监听窗口大小变化
  window.addEventListener('resize', checkMobileView);
  
  return () => {
    window.removeEventListener('resize', checkMobileView);
  };
};
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useUIStore, uiSelectors } from '../uiStore';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock document.documentElement
Object.defineProperty(document, 'documentElement', {
  value: {
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
    },
  },
});

describe('UIStore', () => {
  beforeEach(() => {
    // 重置store状态
    const store = useUIStore.getState();
    store.closeAllModals();
    store.clearAllNotifications();
    store.clearAllLoadingStates();
    store.setSidebarOpen(false);
    store.setMapViewActive(false);
    store.setDarkMode(false);
    store.setMobileView(false);
    
    // 清除mock调用记录
    vi.clearAllMocks();
  });

  describe('Modal Management', () => {
    it('should open and close venue detail modal', () => {
      const { openVenueDetailModal, closeVenueDetailModal } = useUIStore.getState();
      
      openVenueDetailModal();
      expect(useUIStore.getState().isVenueDetailModalOpen).toBe(true);
      
      closeVenueDetailModal();
      expect(useUIStore.getState().isVenueDetailModalOpen).toBe(false);
    });

    it('should open and close location input modal', () => {
      const { openLocationInputModal, closeLocationInputModal } = useUIStore.getState();
      
      openLocationInputModal();
      expect(useUIStore.getState().isLocationInputModalOpen).toBe(true);
      
      closeLocationInputModal();
      expect(useUIStore.getState().isLocationInputModalOpen).toBe(false);
    });

    it('should close all modals', () => {
      const { 
        openVenueDetailModal, 
        openLocationInputModal, 
        openVenueTypeModal,
        closeAllModals 
      } = useUIStore.getState();
      
      // 打开所有模态框
      openVenueDetailModal();
      openLocationInputModal();
      openVenueTypeModal();
      
      // 关闭所有
      closeAllModals();
      
      const state = useUIStore.getState();
      expect(state.isVenueDetailModalOpen).toBe(false);
      expect(state.isLocationInputModalOpen).toBe(false);
      expect(state.isVenueTypeModalOpen).toBe(false);
    });
  });

  describe('Sidebar and View Management', () => {
    it('should toggle sidebar', () => {
      const { toggleSidebar } = useUIStore.getState();
      
      expect(useUIStore.getState().isSidebarOpen).toBe(false);
      
      toggleSidebar();
      expect(useUIStore.getState().isSidebarOpen).toBe(true);
      
      toggleSidebar();
      expect(useUIStore.getState().isSidebarOpen).toBe(false);
    });

    it('should set sidebar open state', () => {
      const { setSidebarOpen } = useUIStore.getState();
      
      setSidebarOpen(true);
      expect(useUIStore.getState().isSidebarOpen).toBe(true);
      
      setSidebarOpen(false);
      expect(useUIStore.getState().isSidebarOpen).toBe(false);
    });

    it('should set map view active', () => {
      const { setMapViewActive } = useUIStore.getState();
      
      setMapViewActive(true);
      expect(useUIStore.getState().isMapViewActive).toBe(true);
      
      setMapViewActive(false);
      expect(useUIStore.getState().isMapViewActive).toBe(false);
    });
  });

  describe('Loading State Management', () => {
    it('should manage individual loading states', () => {
      const { 
        setGeocodingLocation1,
        setGeocodingLocation2,
        setCalculatingMidpoint,
        setSearchingVenues,
        setLoadingVenueDetails
      } = useUIStore.getState();
      
      setGeocodingLocation1(true);
      expect(useUIStore.getState().isGeocodingLocation1).toBe(true);
      
      setGeocodingLocation2(true);
      expect(useUIStore.getState().isGeocodingLocation2).toBe(true);
      
      setCalculatingMidpoint(true);
      expect(useUIStore.getState().isCalculatingMidpoint).toBe(true);
      
      setSearchingVenues(true);
      expect(useUIStore.getState().isSearchingVenues).toBe(true);
      
      setLoadingVenueDetails(true);
      expect(useUIStore.getState().isLoadingVenueDetails).toBe(true);
    });

    it('should clear all loading states', () => {
      const { 
        setGeocodingLocation1,
        setSearchingVenues,
        clearAllLoadingStates
      } = useUIStore.getState();
      
      // 设置一些加载状态
      setGeocodingLocation1(true);
      setSearchingVenues(true);
      
      // 清除所有
      clearAllLoadingStates();
      
      const state = useUIStore.getState();
      expect(state.isGeocodingLocation1).toBe(false);
      expect(state.isGeocodingLocation2).toBe(false);
      expect(state.isCalculatingMidpoint).toBe(false);
      expect(state.isSearchingVenues).toBe(false);
      expect(state.isLoadingVenueDetails).toBe(false);
    });
  });

  describe('Notification Management', () => {
    it('should add notification', () => {
      const { addNotification } = useUIStore.getState();
      
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Operation completed',
      });
      
      const state = useUIStore.getState();
      expect(state.notifications).toHaveLength(1);
      expect(state.notifications[0].type).toBe('success');
      expect(state.notifications[0].title).toBe('Success');
    });

    it('should remove notification', () => {
      const { addNotification, removeNotification } = useUIStore.getState();
      
      addNotification({
        type: 'info',
        title: 'Info',
        message: 'Information message',
      });
      
      const notificationId = useUIStore.getState().notifications[0].id;
      
      removeNotification(notificationId);
      
      expect(useUIStore.getState().notifications).toHaveLength(0);
    });

    it('should clear all notifications', () => {
      const { addNotification, clearAllNotifications } = useUIStore.getState();
      
      // 添加多个通知
      addNotification({
        type: 'success',
        title: 'Success 1',
        message: 'Message 1',
      });
      addNotification({
        type: 'error',
        title: 'Error 1',
        message: 'Message 2',
      });
      
      expect(useUIStore.getState().notifications).toHaveLength(2);
      
      clearAllNotifications();
      
      expect(useUIStore.getState().notifications).toHaveLength(0);
    });

    it('should auto-remove non-persistent notifications', (done) => {
      const { addNotification } = useUIStore.getState();
      
      addNotification({
        type: 'info',
        title: 'Auto Remove',
        message: 'This should auto remove',
        duration: 100, // 100ms for testing
      });
      
      expect(useUIStore.getState().notifications).toHaveLength(1);
      
      setTimeout(() => {
        expect(useUIStore.getState().notifications).toHaveLength(0);
        done();
      }, 150);
    });
  });

  describe('Theme Management', () => {
    it('should toggle dark mode', () => {
      const { toggleDarkMode } = useUIStore.getState();
      
      expect(useUIStore.getState().isDarkMode).toBe(false);
      
      toggleDarkMode();
      
      expect(useUIStore.getState().isDarkMode).toBe(true);
      expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', 'true');
    });

    it('should set dark mode', () => {
      const { setDarkMode } = useUIStore.getState();
      
      setDarkMode(true);
      
      expect(useUIStore.getState().isDarkMode).toBe(true);
      expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', 'true');
      
      setDarkMode(false);
      
      expect(useUIStore.getState().isDarkMode).toBe(false);
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', 'false');
    });
  });

  describe('Mobile View Management', () => {
    it('should set mobile view', () => {
      const { setMobileView } = useUIStore.getState();
      
      setMobileView(true);
      expect(useUIStore.getState().isMobileView).toBe(true);
      
      setMobileView(false);
      expect(useUIStore.getState().isMobileView).toBe(false);
    });
  });

  describe('Selectors', () => {
    it('should check if has open modal', () => {
      const { openVenueDetailModal } = useUIStore.getState();
      
      expect(uiSelectors.hasOpenModal(useUIStore.getState())).toBe(false);
      
      openVenueDetailModal();
      expect(uiSelectors.hasOpenModal(useUIStore.getState())).toBe(true);
    });

    it('should check if has any loading', () => {
      const { setGeocodingLocation1 } = useUIStore.getState();
      
      expect(uiSelectors.hasAnyLoading(useUIStore.getState())).toBe(false);
      
      setGeocodingLocation1(true);
      expect(uiSelectors.hasAnyLoading(useUIStore.getState())).toBe(true);
    });

    it('should get unread notification count', () => {
      const { addNotification } = useUIStore.getState();
      
      expect(uiSelectors.getUnreadNotificationCount(useUIStore.getState())).toBe(0);
      
      addNotification({
        type: 'info',
        title: 'Test',
        message: 'Test message',
      });
      
      expect(uiSelectors.getUnreadNotificationCount(useUIStore.getState())).toBe(1);
    });

    it('should get error notifications', () => {
      const { addNotification } = useUIStore.getState();
      
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Success message',
      });
      
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Error message',
      });
      
      const errorNotifications = uiSelectors.getErrorNotifications(useUIStore.getState());
      expect(errorNotifications).toHaveLength(1);
      expect(errorNotifications[0].type).toBe('error');
    });
  });
});
/**
 * UI 相关的类型定义
 */

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
}

export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
  onClose?: () => void;
}

/**
 * 组件通用 Props
 */
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * 表单验证状态
 */
export interface ValidationState {
  isValid: boolean;
  errors: string[];
  touched: boolean;
}

/**
 * 地图视图状态
 */
export interface MapViewState {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  markers: MapMarker[];
}

export interface MapMarker {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  title: string;
  type: 'user' | 'midpoint' | 'venue';
  data?: any;
}
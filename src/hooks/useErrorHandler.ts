import React from 'react';
import { useUIStore } from '../stores/uiStore';

/**
 * Hook版本的错误处理器（用于函数组件）
 */
export const useErrorHandler = () => {
  const { addNotification } = useUIStore();

  const handleError = React.useCallback((error: Error, context?: string) => {
    console.error(`Error in ${context || 'component'}:`, error);
    
    addNotification({
      type: 'error',
      title: '操作失败',
      message: error.message || '发生了一个未知错误',
    });
  }, [addNotification]);

  return handleError;
};
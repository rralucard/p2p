import { useState, useEffect, useCallback } from 'react';
import { useUIStore } from '../stores/uiStore';

/**
 * 网络状态接口
 */
interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
}

/**
 * 重试配置接口
 */
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

/**
 * 默认重试配置
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
};

/**
 * 网络状态检测Hook
 */
export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isSlowConnection: false,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
  });

  const { addNotification } = useUIStore();

  // 更新网络状态
  const updateNetworkStatus = useCallback(() => {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    const newStatus: NetworkStatus = {
      isOnline: navigator.onLine,
      isSlowConnection: false,
      connectionType: connection?.type || 'unknown',
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0,
    };

    // 判断是否为慢速连接
    if (connection) {
      newStatus.isSlowConnection = 
        connection.effectiveType === 'slow-2g' || 
        connection.effectiveType === '2g' ||
        connection.downlink < 0.5;
    }

    setNetworkStatus(newStatus);
    return newStatus;
  }, []);

  // 处理在线状态变化
  const handleOnline = useCallback(() => {
    const status = updateNetworkStatus();
    if (status.isOnline) {
      addNotification({
        type: 'success',
        title: '网络已连接',
        message: '网络连接已恢复',
        duration: 3000,
      });
    }
  }, [updateNetworkStatus, addNotification]);

  // 处理离线状态变化
  const handleOffline = useCallback(() => {
    const status = updateNetworkStatus();
    if (!status.isOnline) {
      addNotification({
        type: 'error',
        title: '网络已断开',
        message: '请检查您的网络连接',
        persistent: true,
      });
    }
  }, [updateNetworkStatus, addNotification]);

  // 处理连接变化
  const handleConnectionChange = useCallback(() => {
    const status = updateNetworkStatus();
    
    if (status.isSlowConnection) {
      addNotification({
        type: 'warning',
        title: '网络较慢',
        message: '当前网络连接较慢，可能影响使用体验',
        duration: 5000,
      });
    }
  }, [updateNetworkStatus, addNotification]);

  useEffect(() => {
    // 初始化网络状态
    updateNetworkStatus();

    // 监听网络状态变化
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 监听连接变化
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [handleOnline, handleOffline, handleConnectionChange, updateNetworkStatus]);

  return networkStatus;
};

/**
 * 重试机制Hook
 */
export const useRetry = (config: Partial<RetryConfig> = {}) => {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  const { addNotification } = useUIStore();
  const networkStatus = useNetworkStatus();

  /**
   * 执行带重试的异步操作
   */
  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string = '操作'
  ): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
      try {
        // 检查网络状态
        if (!networkStatus.isOnline) {
          throw new Error('网络连接不可用');
        }

        // 执行操作
        const result = await operation();
        
        // 如果之前有重试，显示成功通知
        if (attempt > 0) {
          addNotification({
            type: 'success',
            title: '重试成功',
            message: `${operationName}已成功完成`,
            duration: 3000,
          });
        }
        
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // 如果是最后一次尝试，抛出错误
        if (attempt === finalConfig.maxRetries) {
          addNotification({
            type: 'error',
            title: `${operationName}失败`,
            message: `已重试 ${finalConfig.maxRetries} 次，仍然失败: ${lastError.message}`,
            persistent: true,
          });
          throw lastError;
        }

        // 计算延迟时间（指数退避）
        const delay = Math.min(
          finalConfig.baseDelay * Math.pow(finalConfig.backoffFactor, attempt),
          finalConfig.maxDelay
        );

        // 显示重试通知
        addNotification({
          type: 'warning',
          title: `${operationName}失败`,
          message: `${delay / 1000}秒后重试 (${attempt + 1}/${finalConfig.maxRetries})`,
          duration: delay,
        });

        // 等待延迟
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }, [finalConfig, networkStatus.isOnline, addNotification]);

  /**
   * 手动重试函数
   */
  const retry = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string = '操作'
  ): Promise<T> => {
    try {
      addNotification({
        type: 'info',
        title: '正在重试',
        message: `正在重新执行${operationName}...`,
        duration: 2000,
      });

      const result = await operation();
      
      addNotification({
        type: 'success',
        title: '重试成功',
        message: `${operationName}已成功完成`,
        duration: 3000,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addNotification({
        type: 'error',
        title: '重试失败',
        message: `${operationName}重试失败: ${errorMessage}`,
      });
      throw error;
    }
  }, [addNotification]);

  return {
    executeWithRetry,
    retry,
    networkStatus,
  };
};



export default useNetworkStatus;
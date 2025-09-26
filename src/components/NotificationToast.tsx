import { useEffect, useState } from 'react';
import { useUIStore } from '../stores/uiStore';

/**
 * 通知Toast组件
 * 显示应用中的各种通知消息
 */
export const NotificationToast = () => {
  const { notifications, removeNotification } = useUIStore();
  const [exitingNotifications, setExitingNotifications] = useState<Set<string>>(new Set());

  // 自动移除过期通知
  useEffect(() => {
    notifications.forEach(notification => {
      if (!notification.persistent && notification.duration) {
        const timer = setTimeout(() => {
          handleRemoveNotification(notification.id);
        }, notification.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, removeNotification]);

  const handleRemoveNotification = (id: string) => {
    setExitingNotifications(prev => new Set(prev).add(id));
    setTimeout(() => {
      removeNotification(id);
      setExitingNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 300);
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {notifications.map((notification) => {
        const isExiting = exitingNotifications.has(notification.id);
        
        return (
          <div
            key={notification.id}
            className={`
              bg-white dark:bg-gray-800 shadow-large rounded-xl pointer-events-auto 
              ring-1 ring-black/5 dark:ring-white/10 overflow-hidden
              transform transition-all duration-300 ease-out
              ${isExiting 
                ? 'translate-x-full opacity-0 scale-95' 
                : 'translate-x-0 opacity-100 scale-100 animate-slide-in-right'
              }
              ${notification.type === 'success' ? 'border-l-4 border-success-500' :
                notification.type === 'error' ? 'border-l-4 border-error-500' :
                notification.type === 'warning' ? 'border-l-4 border-warning-500' :
                'border-l-4 border-primary-500'
              }
              hover:shadow-glow hover:scale-105
            `}
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {notification.type === 'success' && (
                    <div className="w-6 h-6 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                      <svg className="h-4 w-4 text-success-600 dark:text-success-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {notification.type === 'error' && (
                    <div className="w-6 h-6 rounded-full bg-error-100 dark:bg-error-900/30 flex items-center justify-center">
                      <svg className="h-4 w-4 text-error-600 dark:text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                  {notification.type === 'warning' && (
                    <div className="w-6 h-6 rounded-full bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
                      <svg className="h-4 w-4 text-warning-600 dark:text-warning-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                  {notification.type === 'info' && (
                    <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <svg className="h-4 w-4 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {notification.message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className="
                      bg-transparent rounded-md inline-flex text-gray-400 dark:text-gray-500 
                      hover:text-gray-600 dark:hover:text-gray-300 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                      transition-all duration-200 transform hover:scale-110 active:scale-95
                      touch-target
                    "
                    onClick={() => handleRemoveNotification(notification.id)}
                  >
                    <span className="sr-only">关闭</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* 进度条 */}
              {!notification.persistent && notification.duration && (
                <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      notification.type === 'success' ? 'bg-success-500' :
                      notification.type === 'error' ? 'bg-error-500' :
                      notification.type === 'warning' ? 'bg-warning-500' :
                      'bg-primary-500'
                    }`}
                    style={{
                      animation: `shrink ${notification.duration}ms linear forwards`
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
      

    </div>
  );
};

export default NotificationToast;
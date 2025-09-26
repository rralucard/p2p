import React, { useState } from 'react';
import { usePWA } from '../hooks/usePWA';
import { useAccessibility } from './AccessibilityProvider';

export const PWAPrompt: React.FC = () => {
  const { isInstallable, isOffline, installPWA, updateAvailable, updatePWA } = usePWA();
  const { announceToScreenReader } = useAccessibility();
  const [isInstalling, setIsInstalling] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(true);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(true);

  const handleInstall = async () => {
    try {
      setIsInstalling(true);
      await installPWA();
      announceToScreenReader('应用安装成功', 'polite');
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Installation failed:', error);
      announceToScreenReader('应用安装失败', 'assertive');
    } finally {
      setIsInstalling(false);
    }
  };

  const handleUpdate = () => {
    updatePWA();
    announceToScreenReader('应用更新中，页面将重新加载', 'assertive');
    setShowUpdatePrompt(false);
  };

  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
    announceToScreenReader('安装提示已关闭', 'polite');
  };

  const handleDismissUpdate = () => {
    setShowUpdatePrompt(false);
    announceToScreenReader('更新提示已关闭', 'polite');
  };

  return (
    <>
      {/* Offline Indicator */}
      {isOffline && (
        <div
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span>您当前处于离线状态</span>
          </div>
        </div>
      )}

      {/* Install Prompt */}
      {isInstallable && showInstallPrompt && (
        <div
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50"
          role="dialog"
          aria-labelledby="install-prompt-title"
          aria-describedby="install-prompt-description"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3
                id="install-prompt-title"
                className="text-sm font-semibold text-gray-900 dark:text-gray-100"
              >
                安装应用
              </h3>
              <p
                id="install-prompt-description"
                className="text-sm text-gray-600 dark:text-gray-400 mt-1"
              >
                将约会地点推荐添加到主屏幕，获得更好的使用体验
              </p>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={handleInstall}
                  disabled={isInstalling}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-describedby="install-prompt-description"
                >
                  {isInstalling ? '安装中...' : '安装'}
                </button>
                <button
                  onClick={handleDismissInstall}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  稍后
                </button>
              </div>
            </div>
            <button
              onClick={handleDismissInstall}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-md transition-colors"
              aria-label="关闭安装提示"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Update Prompt */}
      {updateAvailable && showUpdatePrompt && (
        <div
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg shadow-lg p-4 z-50"
          role="dialog"
          aria-labelledby="update-prompt-title"
          aria-describedby="update-prompt-description"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3
                id="update-prompt-title"
                className="text-sm font-semibold text-green-900 dark:text-green-100"
              >
                应用更新
              </h3>
              <p
                id="update-prompt-description"
                className="text-sm text-green-700 dark:text-green-300 mt-1"
              >
                新版本已可用，点击更新获得最新功能
              </p>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={handleUpdate}
                  className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                  aria-describedby="update-prompt-description"
                >
                  立即更新
                </button>
                <button
                  onClick={handleDismissUpdate}
                  className="px-3 py-1.5 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 text-sm font-medium rounded-md hover:bg-green-200 dark:hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                  稍后
                </button>
              </div>
            </div>
            <button
              onClick={handleDismissUpdate}
              className="flex-shrink-0 p-1 text-green-400 hover:text-green-600 dark:hover:text-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-md transition-colors"
              aria-label="关闭更新提示"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
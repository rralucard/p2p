import React, { useState, useRef } from 'react';
import { useAccessibility } from './AccessibilityProvider';
import { useKeyboardNavigation, useFocusTrap } from '../hooks/useKeyboardNavigation';

interface AccessibilityMenuProps {
  className?: string;
}

export const AccessibilityMenu: React.FC<AccessibilityMenuProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const {
    isHighContrast,
    isReducedMotion,
    fontSize,
    setHighContrast,
    setReducedMotion,
    setFontSize,
    announceToScreenReader,
  } = useAccessibility();

  // Focus trap for the menu
  useFocusTrap(menuRef, isOpen);

  // Keyboard navigation
  useKeyboardNavigation({
    onEscape: () => {
      if (isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    },
    enabled: isOpen,
  });

  const toggleMenu = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    
    if (newState) {
      announceToScreenReader('辅助功能菜单已打开', 'polite');
    } else {
      announceToScreenReader('辅助功能菜单已关闭', 'polite');
    }
  };

  const handleHighContrastToggle = () => {
    const newValue = !isHighContrast;
    setHighContrast(newValue);
    announceToScreenReader(
      newValue ? '高对比度模式已启用' : '高对比度模式已禁用',
      'polite'
    );
  };

  const handleReducedMotionToggle = () => {
    const newValue = !isReducedMotion;
    setReducedMotion(newValue);
    announceToScreenReader(
      newValue ? '减少动画模式已启用' : '减少动画模式已禁用',
      'polite'
    );
  };

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
    const sizeLabels = {
      small: '小',
      medium: '中',
      large: '大'
    };
    announceToScreenReader(`字体大小已设置为${sizeLabels[size]}`, 'polite');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Accessibility Menu Button */}
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        aria-label="打开辅助功能设置"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg
          className="w-5 h-5 text-gray-600 dark:text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* Accessibility Menu Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Menu Panel */}
          <div
            ref={menuRef}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 p-4"
            role="dialog"
            aria-labelledby="accessibility-menu-title"
            aria-modal="true"
          >
            <div className="space-y-4">
              {/* Title */}
              <h3
                id="accessibility-menu-title"
                className="text-lg font-semibold text-gray-900 dark:text-gray-100"
              >
                辅助功能设置
              </h3>

              {/* High Contrast Toggle */}
              <div className="flex items-center justify-between">
                <label
                  htmlFor="high-contrast-toggle"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  高对比度模式
                </label>
                <button
                  id="high-contrast-toggle"
                  onClick={handleHighContrastToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isHighContrast
                      ? 'bg-blue-600'
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                  role="switch"
                  aria-checked={isHighContrast}
                  aria-describedby="high-contrast-description"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isHighContrast ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p
                id="high-contrast-description"
                className="text-xs text-gray-500 dark:text-gray-400"
              >
                提高颜色对比度以改善可读性
              </p>

              {/* Reduced Motion Toggle */}
              <div className="flex items-center justify-between">
                <label
                  htmlFor="reduced-motion-toggle"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  减少动画
                </label>
                <button
                  id="reduced-motion-toggle"
                  onClick={handleReducedMotionToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isReducedMotion
                      ? 'bg-blue-600'
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                  role="switch"
                  aria-checked={isReducedMotion}
                  aria-describedby="reduced-motion-description"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isReducedMotion ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p
                id="reduced-motion-description"
                className="text-xs text-gray-500 dark:text-gray-400"
              >
                减少页面动画和过渡效果
              </p>

              {/* Font Size Selection */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  字体大小
                </label>
                <div
                  className="grid grid-cols-3 gap-2"
                  role="radiogroup"
                  aria-labelledby="font-size-label"
                >
                  {(['small', 'medium', 'large'] as const).map((size) => {
                    const labels = { small: '小', medium: '中', large: '大' };
                    const isSelected = fontSize === size;
                    
                    return (
                      <button
                        key={size}
                        onClick={() => handleFontSizeChange(size)}
                        className={`px-3 py-2 text-sm rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`字体大小设置为${labels[size]}`}
                      >
                        {labels[size]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
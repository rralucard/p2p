import React, { useState, useRef, useCallback } from 'react';

interface TouchOptimizedProps {
  children: React.ReactNode;
  onTap?: () => void;
  onLongPress?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
  disabled?: boolean;
  hapticFeedback?: boolean;
}

export const TouchOptimized: React.FC<TouchOptimizedProps> = ({
  children,
  onTap,
  onLongPress,
  onSwipeLeft,
  onSwipeRight,
  className = '',
  disabled = false,
  hapticFeedback = true,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimerRef = useRef<number | null>(null);

  const triggerHaptic = useCallback(() => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, [hapticFeedback]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;

    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    setIsPressed(true);

    // 长按检测
    if (onLongPress) {
      longPressTimerRef.current = window.setTimeout(() => {
        triggerHaptic();
        onLongPress();
        setIsPressed(false);
      }, 500);
    }
  }, [disabled, onLongPress, triggerHaptic]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (disabled || !touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    // 清除长按定时器
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    setIsPressed(false);

    // 滑动检测
    const swipeThreshold = 50;
    const maxVerticalMovement = 100;
    
    if (Math.abs(deltaY) < maxVerticalMovement && deltaTime < 300) {
      if (deltaX > swipeThreshold && onSwipeRight) {
        triggerHaptic();
        onSwipeRight();
        return;
      }
      
      if (deltaX < -swipeThreshold && onSwipeLeft) {
        triggerHaptic();
        onSwipeLeft();
        return;
      }
    }

    // 点击检测
    const tapThreshold = 10;
    if (
      Math.abs(deltaX) < tapThreshold &&
      Math.abs(deltaY) < tapThreshold &&
      deltaTime < 300 &&
      onTap
    ) {
      triggerHaptic();
      onTap();
    }

    touchStartRef.current = null;
  }, [disabled, onTap, onSwipeLeft, onSwipeRight, triggerHaptic]);

  const handleTouchCancel = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setIsPressed(false);
    touchStartRef.current = null;
  }, []);

  const containerClasses = [
    className,
    'touch-manipulation select-none',
    isPressed ? 'scale-95 opacity-80' : 'scale-100 opacity-100',
    'transition-all duration-150 ease-out',
    disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={containerClasses}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      style={{
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      {children}
    </div>
  );
};

export default TouchOptimized;
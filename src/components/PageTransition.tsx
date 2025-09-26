import React, { useEffect, useState } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
  type?: 'fade' | 'slide' | 'scale';
  duration?: number;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  isVisible,
  type = 'fade',
  duration = 300,
  className = '',
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // 延迟添加动画类以确保元素已渲染
      setTimeout(() => {
        setAnimationClass(getEnterClass(type));
      }, 10);
    } else {
      setAnimationClass(getExitClass(type));
      // 动画完成后移除元素
      setTimeout(() => {
        setShouldRender(false);
      }, duration);
    }
  }, [isVisible, type, duration]);

  const getEnterClass = (animationType: string): string => {
    switch (animationType) {
      case 'slide':
        return 'translate-x-0 opacity-100';
      case 'scale':
        return 'scale-100 opacity-100';
      case 'fade':
      default:
        return 'opacity-100';
    }
  };

  const getExitClass = (animationType: string): string => {
    switch (animationType) {
      case 'slide':
        return 'translate-x-full opacity-0';
      case 'scale':
        return 'scale-95 opacity-0';
      case 'fade':
      default:
        return 'opacity-0';
    }
  };

  const getInitialClass = (animationType: string): string => {
    switch (animationType) {
      case 'slide':
        return 'translate-x-full opacity-0';
      case 'scale':
        return 'scale-95 opacity-0';
      case 'fade':
      default:
        return 'opacity-0';
    }
  };

  if (!shouldRender) {
    return null;
  }

  const containerClasses = [
    'transition-all ease-in-out',
    getInitialClass(type),
    animationClass,
    className,
  ].filter(Boolean).join(' ');

  const containerStyle = {
    transitionDuration: `${duration}ms`,
  };

  return (
    <div className={containerClasses} style={containerStyle}>
      {children}
    </div>
  );
};

export default PageTransition;
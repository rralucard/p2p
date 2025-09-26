import React, { useEffect, useRef, useState } from 'react';

type AnimationType = 
  | 'fade-in' 
  | 'slide-up' 
  | 'slide-down' 
  | 'slide-in-left' 
  | 'slide-in-right' 
  | 'scale-in' 
  | 'bounce-gentle';

interface AnimatedContainerProps {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  triggerOnScroll?: boolean;
  threshold?: number;
  once?: boolean;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  animation = 'fade-in',
  delay = 0,
  duration = 300,
  className = '',
  triggerOnScroll = false,
  threshold = 0.1,
  once = true,
}) => {
  const [isVisible, setIsVisible] = useState(!triggerOnScroll);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!triggerOnScroll) return;

    // 检查 IntersectionObserver 是否可用（测试环境可能不支持）
    if (typeof IntersectionObserver === 'undefined') {
      // 在测试环境中直接显示动画
      setIsVisible(true);
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!once || !hasAnimated)) {
          setIsVisible(true);
          setHasAnimated(true);
        } else if (!once && !entry.isIntersecting) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    const element = elementRef.current;
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [triggerOnScroll, threshold, once, hasAnimated]);

  const animationClasses = {
    'fade-in': 'animate-fade-in',
    'slide-up': 'animate-slide-up',
    'slide-down': 'animate-slide-down',
    'slide-in-left': 'animate-slide-in-left',
    'slide-in-right': 'animate-slide-in-right',
    'scale-in': 'animate-scale-in',
    'bounce-gentle': 'animate-bounce-gentle',
  };

  const containerClasses = [
    className,
    isVisible ? animationClasses[animation] : 'opacity-0',
    'transition-all',
  ].filter(Boolean).join(' ');

  const containerStyle = {
    animationDelay: `${delay}ms`,
    animationDuration: `${duration}ms`,
  };

  return (
    <div
      ref={elementRef}
      className={containerClasses}
      style={containerStyle}
    >
      {children}
    </div>
  );
};

export default AnimatedContainer;
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('renders the main heading', () => {
    render(<App />);
    
    // 检查主标题是否渲染
    expect(screen.getByText('约会地点推荐')).toBeInTheDocument();
    expect(screen.getByText('找到两个地点之间的完美约会场所')).toBeInTheDocument();
  });

  it('renders location input section', () => {
    render(<App />);
    
    // 检查地点输入区域
    expect(screen.getByText('输入两个地点')).toBeInTheDocument();
    expect(screen.getByText('第一个地点')).toBeInTheDocument();
    expect(screen.getByText('第二个地点')).toBeInTheDocument();
  });

  it('renders with proper responsive classes', () => {
    const { container } = render(<App />);
    
    // 检查响应式设计类名 - 查找最外层容器
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass('min-h-screen');
  });
});
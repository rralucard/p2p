import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ErrorBoundary } from '../ErrorBoundary';
import { useErrorHandler } from '../../hooks/useErrorHandler';

// Mock the UI store
const mockAddNotification = vi.fn();
vi.mock('../../stores/uiStore', () => ({
  useUIStore: Object.assign(
    vi.fn(() => ({
      addNotification: mockAddNotification,
    })),
    {
      getState: vi.fn(() => ({
        addNotification: mockAddNotification,
      })),
    }
  ),
}));

// Test component that throws an error
const ThrowError: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Test component for useErrorHandler hook
const TestErrorHandler: React.FC = () => {
  const handleError = useErrorHandler();
  
  return (
    <button
      onClick={() => handleError(new Error('Hook error'), 'test-component')}
    >
      Trigger Error
    </button>
  );
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error for tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('哎呀，出错了！')).toBeInTheDocument();
    expect(screen.getByText(/应用遇到了一个意外错误/)).toBeInTheDocument();
  });

  it('shows custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('calls onError callback when error occurs', () => {
    const onError = vi.fn();
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('allows retry after error', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('哎呀，出错了！')).toBeInTheDocument();

    // Click retry button
    fireEvent.click(screen.getByText('重试'));

    // Rerender with no error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('allows page refresh', () => {
    // Mock window.location.reload
    const mockReload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText('刷新页面'));
    expect(mockReload).toHaveBeenCalled();
  });

  it('shows error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('错误详情')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });
});

describe('useErrorHandler', () => {
  it('handles errors correctly', () => {
    render(<TestErrorHandler />);
    
    fireEvent.click(screen.getByText('Trigger Error'));
    
    // The hook should call console.error and addNotification
    expect(console.error).toHaveBeenCalledWith(
      'Error in test-component:',
      expect.any(Error)
    );
  });
});
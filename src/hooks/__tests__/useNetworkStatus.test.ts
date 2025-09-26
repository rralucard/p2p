import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useNetworkStatus, useRetry } from '../useNetworkStatus';

// Mock the UI store
vi.mock('../../stores/uiStore', () => ({
  useUIStore: vi.fn(() => ({
    addNotification: vi.fn(),
  })),
}));

describe('useNetworkStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    // Mock connection API
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      value: {
        effectiveType: '4g',
        downlink: 10,
        rtt: 50,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns initial network status', () => {
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.isSlowConnection).toBe(false);
  });

  it('detects slow connection', () => {
    // Mock slow connection
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      value: {
        effectiveType: '2g',
        downlink: 0.3,
        rtt: 2000,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });

    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.isSlowConnection).toBe(true);
  });

  it('handles online/offline events', () => {
    const { result } = renderHook(() => useNetworkStatus());

    // Simulate going offline
    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOnline).toBe(false);

    // Simulate going online
    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.isOnline).toBe(true);
  });
});

describe('useRetry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('executes operation successfully on first try', async () => {
    const { result } = renderHook(() => useRetry());
    const mockOperation = vi.fn().mockResolvedValue('success');

    const promise = result.current.executeWithRetry(mockOperation, 'test operation');
    
    await act(async () => {
      const resultValue = await promise;
      expect(resultValue).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });
  });

  it('retries operation on failure', async () => {
    const { result } = renderHook(() => useRetry({ maxRetries: 2 }));
    const mockOperation = vi.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue('success');

    const promise = result.current.executeWithRetry(mockOperation, 'test operation');
    
    await act(async () => {
      // Fast-forward timers to skip retry delays
      vi.advanceTimersByTime(5000);
      
      const resultValue = await promise;
      expect(resultValue).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });
  });

  it('fails after max retries', async () => {
    const { result } = renderHook(() => useRetry({ maxRetries: 1 }));
    const mockOperation = vi.fn().mockRejectedValue(new Error('Persistent error'));

    await act(async () => {
      try {
        await result.current.executeWithRetry(mockOperation, 'test operation');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(mockOperation).toHaveBeenCalledTimes(2); // Initial + 1 retry
      }
    });
  });

  it('manual retry works', async () => {
    const { result } = renderHook(() => useRetry());
    const mockOperation = vi.fn().mockResolvedValue('retry success');

    await act(async () => {
      const resultValue = await result.current.retry(mockOperation, 'manual test');
      expect(resultValue).toBe('retry success');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });
  });
});
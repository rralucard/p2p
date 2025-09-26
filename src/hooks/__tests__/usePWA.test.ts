import { renderHook, act } from '@testing-library/react';
import { usePWA } from '../usePWA';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock navigator
const mockNavigator = {
  onLine: true,
  serviceWorker: {
    addEventListener: vi.fn(),
    getRegistration: vi.fn(),
  },
};

Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('usePWA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => usePWA());

    expect(result.current.isInstallable).toBe(false);
    expect(result.current.isInstalled).toBe(false);
    expect(result.current.isOffline).toBe(false);
    expect(result.current.updateAvailable).toBe(false);
  });

  it('should detect offline status', () => {
    // Mock navigator.onLine as false
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const { result } = renderHook(() => usePWA());

    expect(result.current.isOffline).toBe(true);
  });

  it('should handle install prompt event', () => {
    const { result } = renderHook(() => usePWA());

    // Simulate beforeinstallprompt event
    const mockEvent = {
      preventDefault: vi.fn(),
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'accepted' }),
    };

    act(() => {
      window.dispatchEvent(
        Object.assign(new Event('beforeinstallprompt'), mockEvent)
      );
    });

    expect(result.current.isInstallable).toBe(true);
  });

  it('should handle app installed event', () => {
    const { result } = renderHook(() => usePWA());

    act(() => {
      window.dispatchEvent(new Event('appinstalled'));
    });

    expect(result.current.isInstalled).toBe(true);
    expect(result.current.isInstallable).toBe(false);
  });

  it('should handle online/offline events', () => {
    const { result } = renderHook(() => usePWA());

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOffline).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.isOffline).toBe(false);
  });

  it('should install PWA when installPWA is called', async () => {
    const { result } = renderHook(() => usePWA());

    const mockEvent = {
      preventDefault: vi.fn(),
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'accepted' }),
    };

    // Set up install prompt
    act(() => {
      window.dispatchEvent(
        Object.assign(new Event('beforeinstallprompt'), mockEvent)
      );
    });

    // Call installPWA
    await act(async () => {
      await result.current.installPWA();
    });

    expect(mockEvent.prompt).toHaveBeenCalled();
    expect(result.current.isInstallable).toBe(false);
  });

  it('should throw error when installPWA is called without prompt', async () => {
    const { result } = renderHook(() => usePWA());

    await expect(result.current.installPWA()).rejects.toThrow(
      'Install prompt not available'
    );
  });
});
import { renderHook } from '@testing-library/react';
import { useKeyboardNavigation, useFocusTrap, useAriaLiveRegion } from '../useKeyboardNavigation';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('useKeyboardNavigation', () => {
  let mockOnEscape: ReturnType<typeof vi.fn>;
  let mockOnEnter: ReturnType<typeof vi.fn>;
  let mockOnArrowUp: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnEscape = vi.fn();
    mockOnEnter = vi.fn();
    mockOnArrowUp = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should handle escape key', () => {
    renderHook(() =>
      useKeyboardNavigation({
        onEscape: mockOnEscape,
        enabled: true,
      })
    );

    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(escapeEvent);

    expect(mockOnEscape).toHaveBeenCalledTimes(1);
  });

  it('should handle enter key', () => {
    renderHook(() =>
      useKeyboardNavigation({
        onEnter: mockOnEnter,
        enabled: true,
      })
    );

    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    document.dispatchEvent(enterEvent);

    expect(mockOnEnter).toHaveBeenCalledTimes(1);
  });

  it('should handle arrow keys', () => {
    renderHook(() =>
      useKeyboardNavigation({
        onArrowUp: mockOnArrowUp,
        enabled: true,
      })
    );

    const arrowUpEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    document.dispatchEvent(arrowUpEvent);

    expect(mockOnArrowUp).toHaveBeenCalledTimes(1);
  });

  it('should not handle keys when disabled', () => {
    renderHook(() =>
      useKeyboardNavigation({
        onEscape: mockOnEscape,
        enabled: false,
      })
    );

    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(escapeEvent);

    expect(mockOnEscape).not.toHaveBeenCalled();
  });
});

describe('useAriaLiveRegion', () => {
  it('should create and remove live region', () => {
    const { result } = renderHook(() => useAriaLiveRegion());

    // Mock document.body methods
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');

    result.current.announce('Test message', 'polite');

    expect(appendChildSpy).toHaveBeenCalled();

    // Wait for timeout
    setTimeout(() => {
      expect(removeChildSpy).toHaveBeenCalled();
    }, 1100);
  });
});
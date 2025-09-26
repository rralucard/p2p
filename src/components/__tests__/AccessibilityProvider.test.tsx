import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AccessibilityProvider, useAccessibility } from '../AccessibilityProvider';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock matchMedia
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

const TestComponent: React.FC = () => {
  const {
    isHighContrast,
    isReducedMotion,
    fontSize,
    setHighContrast,
    setReducedMotion,
    setFontSize,
    announceToScreenReader,
  } = useAccessibility();

  return (
    <div>
      <div data-testid="high-contrast">{isHighContrast.toString()}</div>
      <div data-testid="reduced-motion">{isReducedMotion.toString()}</div>
      <div data-testid="font-size">{fontSize}</div>
      <button onClick={() => setHighContrast(!isHighContrast)}>
        Toggle High Contrast
      </button>
      <button onClick={() => setReducedMotion(!isReducedMotion)}>
        Toggle Reduced Motion
      </button>
      <button onClick={() => setFontSize('large')}>
        Set Large Font
      </button>
      <button onClick={() => announceToScreenReader('Test message')}>
        Announce
      </button>
    </div>
  );
};

describe('AccessibilityProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should provide default accessibility values', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    expect(screen.getByTestId('high-contrast')).toHaveTextContent('false');
    expect(screen.getByTestId('reduced-motion')).toHaveTextContent('false');
    expect(screen.getByTestId('font-size')).toHaveTextContent('medium');
  });

  it('should toggle high contrast mode', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const toggleButton = screen.getByText('Toggle High Contrast');
    fireEvent.click(toggleButton);

    expect(screen.getByTestId('high-contrast')).toHaveTextContent('true');
  });

  it('should toggle reduced motion mode', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const toggleButton = screen.getByText('Toggle Reduced Motion');
    fireEvent.click(toggleButton);

    expect(screen.getByTestId('reduced-motion')).toHaveTextContent('true');
  });

  it('should change font size', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const fontButton = screen.getByText('Set Large Font');
    fireEvent.click(fontButton);

    expect(screen.getByTestId('font-size')).toHaveTextContent('large');
  });

  it('should announce to screen reader', () => {
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const announceButton = screen.getByText('Announce');
    fireEvent.click(announceButton);

    expect(appendChildSpy).toHaveBeenCalled();
  });
});
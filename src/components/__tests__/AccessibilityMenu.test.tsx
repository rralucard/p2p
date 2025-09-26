import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AccessibilityMenu } from '../AccessibilityMenu';
import { AccessibilityProvider } from '../AccessibilityProvider';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <AccessibilityProvider>
      {component}
    </AccessibilityProvider>
  );
};

describe('AccessibilityMenu', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
  });

  it('should render accessibility menu button', () => {
    renderWithProvider(<AccessibilityMenu />);
    
    const button = screen.getByRole('button', { name: /打开辅助功能设置/i });
    expect(button).toBeInTheDocument();
  });

  it('should open menu when button is clicked', async () => {
    renderWithProvider(<AccessibilityMenu />);
    
    const button = screen.getByRole('button', { name: /打开辅助功能设置/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('辅助功能设置')).toBeInTheDocument();
    });
  });

  it('should toggle high contrast mode', async () => {
    renderWithProvider(<AccessibilityMenu />);
    
    const button = screen.getByRole('button', { name: /打开辅助功能设置/i });
    fireEvent.click(button);

    await waitFor(() => {
      const highContrastToggle = screen.getByRole('switch', { name: /高对比度模式/i });
      expect(highContrastToggle).toBeInTheDocument();
      
      fireEvent.click(highContrastToggle);
      expect(highContrastToggle).toHaveAttribute('aria-checked', 'true');
    });
  });

  it('should toggle reduced motion mode', async () => {
    renderWithProvider(<AccessibilityMenu />);
    
    const button = screen.getByRole('button', { name: /打开辅助功能设置/i });
    fireEvent.click(button);

    await waitFor(() => {
      const reducedMotionToggle = screen.getByRole('switch', { name: /减少动画/i });
      expect(reducedMotionToggle).toBeInTheDocument();
      
      fireEvent.click(reducedMotionToggle);
      expect(reducedMotionToggle).toHaveAttribute('aria-checked', 'true');
    });
  });

  it('should change font size', async () => {
    renderWithProvider(<AccessibilityMenu />);
    
    const button = screen.getByRole('button', { name: /打开辅助功能设置/i });
    fireEvent.click(button);

    await waitFor(() => {
      const largeButton = screen.getByRole('radio', { name: /字体大小设置为大/i });
      expect(largeButton).toBeInTheDocument();
      
      fireEvent.click(largeButton);
      expect(largeButton).toHaveAttribute('aria-checked', 'true');
    });
  });

  it('should close menu with escape key', async () => {
    renderWithProvider(<AccessibilityMenu />);
    
    const button = screen.getByRole('button', { name: /打开辅助功能设置/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should close menu when close button is clicked', async () => {
    renderWithProvider(<AccessibilityMenu />);
    
    const button = screen.getByRole('button', { name: /打开辅助功能设置/i });
    fireEvent.click(button);

    await waitFor(() => {
      const closeButton = screen.getByRole('button', { name: /关闭/i });
      fireEvent.click(closeButton);
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
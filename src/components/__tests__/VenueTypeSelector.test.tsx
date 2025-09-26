import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VenueTypeSelector } from '../VenueTypeSelector';
import { VenueType } from '../../types';

describe('VenueTypeSelector', () => {
  const mockOnTypesChange = vi.fn();

  beforeEach(() => {
    mockOnTypesChange.mockClear();
  });

  describe('Rendering', () => {
    it('renders the component with title', () => {
      render(
        <VenueTypeSelector
          selectedTypes={[]}
          onTypesChange={mockOnTypesChange}
        />
      );

      expect(screen.getByText('选择约会场所类型')).toBeInTheDocument();
    });

    it('renders all venue type options', () => {
      render(
        <VenueTypeSelector
          selectedTypes={[]}
          onTypesChange={mockOnTypesChange}
        />
      );

      // 检查所有店铺类型是否都被渲染
      expect(screen.getByText('餐厅')).toBeInTheDocument();
      expect(screen.getByText('咖啡厅')).toBeInTheDocument();
      expect(screen.getByText('电影院')).toBeInTheDocument();
      expect(screen.getByText('购物中心')).toBeInTheDocument();
      expect(screen.getByText('酒吧')).toBeInTheDocument();
      expect(screen.getByText('公园')).toBeInTheDocument();
      expect(screen.getByText('博物馆')).toBeInTheDocument();
      expect(screen.getByText('游乐园')).toBeInTheDocument();
      expect(screen.getByText('保龄球馆')).toBeInTheDocument();
      expect(screen.getByText('健身房')).toBeInTheDocument();
    });

    it('renders control buttons', () => {
      render(
        <VenueTypeSelector
          selectedTypes={[]}
          onTypesChange={mockOnTypesChange}
        />
      );

      expect(screen.getByText('全选')).toBeInTheDocument();
      expect(screen.getByText('清空')).toBeInTheDocument();
    });

    it('shows selection count', () => {
      render(
        <VenueTypeSelector
          selectedTypes={[VenueType.RESTAURANT, VenueType.CAFE]}
          onTypesChange={mockOnTypesChange}
        />
      );

      expect(screen.getByText(/已选择 2 种类型/)).toBeInTheDocument();
      expect(screen.getByText(/餐厅, 咖啡厅/)).toBeInTheDocument();
    });
  });

  describe('Selection Functionality', () => {
    it('calls onTypesChange when a type is selected', () => {
      render(
        <VenueTypeSelector
          selectedTypes={[]}
          onTypesChange={mockOnTypesChange}
        />
      );

      const restaurantButton = screen.getByText('餐厅').closest('button');
      fireEvent.click(restaurantButton!);

      expect(mockOnTypesChange).toHaveBeenCalledWith([VenueType.RESTAURANT]);
    });

    it('calls onTypesChange when a selected type is deselected', () => {
      render(
        <VenueTypeSelector
          selectedTypes={[VenueType.RESTAURANT, VenueType.CAFE]}
          onTypesChange={mockOnTypesChange}
        />
      );

      const restaurantButton = screen.getByText('餐厅').closest('button');
      fireEvent.click(restaurantButton!);

      expect(mockOnTypesChange).toHaveBeenCalledWith([VenueType.CAFE]);
    });

    it('allows multiple selections', () => {
      const { rerender } = render(
        <VenueTypeSelector
          selectedTypes={[]}
          onTypesChange={mockOnTypesChange}
        />
      );

      // 选择第一个类型
      const restaurantButton = screen.getByText('餐厅').closest('button');
      fireEvent.click(restaurantButton!);
      expect(mockOnTypesChange).toHaveBeenCalledWith([VenueType.RESTAURANT]);

      // 重新渲染以模拟状态更新
      rerender(
        <VenueTypeSelector
          selectedTypes={[VenueType.RESTAURANT]}
          onTypesChange={mockOnTypesChange}
        />
      );

      // 选择第二个类型
      const cafeButton = screen.getByText('咖啡厅').closest('button');
      fireEvent.click(cafeButton!);
      expect(mockOnTypesChange).toHaveBeenCalledWith([VenueType.RESTAURANT, VenueType.CAFE]);
    });
  });

  describe('Visual States', () => {
    it('shows selected state for selected types', () => {
      render(
        <VenueTypeSelector
          selectedTypes={[VenueType.RESTAURANT]}
          onTypesChange={mockOnTypesChange}
        />
      );

      const restaurantButton = screen.getByText('餐厅').closest('button');
      expect(restaurantButton).toHaveClass('border-blue-500', 'bg-blue-50', 'text-blue-700');
    });

    it('shows unselected state for unselected types', () => {
      render(
        <VenueTypeSelector
          selectedTypes={[VenueType.RESTAURANT]}
          onTypesChange={mockOnTypesChange}
        />
      );

      const cafeButton = screen.getByText('咖啡厅').closest('button');
      expect(cafeButton).toHaveClass('border-gray-200', 'bg-white', 'text-gray-700');
    });

    it('shows checkmark icon for selected types', () => {
      render(
        <VenueTypeSelector
          selectedTypes={[VenueType.RESTAURANT]}
          onTypesChange={mockOnTypesChange}
        />
      );

      const restaurantButton = screen.getByText('餐厅').closest('button');
      const checkIcon = restaurantButton!.querySelector('svg');
      expect(checkIcon).toBeInTheDocument();
    });
  });

  describe('Control Buttons', () => {
    it('selects all types when "全选" is clicked', () => {
      render(
        <VenueTypeSelector
          selectedTypes={[]}
          onTypesChange={mockOnTypesChange}
        />
      );

      const selectAllButton = screen.getByText('全选');
      fireEvent.click(selectAllButton);

      expect(mockOnTypesChange).toHaveBeenCalledWith(Object.values(VenueType));
    });

    it('clears all selections when "清空" is clicked', () => {
      render(
        <VenueTypeSelector
          selectedTypes={[VenueType.RESTAURANT, VenueType.CAFE]}
          onTypesChange={mockOnTypesChange}
        />
      );

      const clearAllButton = screen.getByText('清空');
      fireEvent.click(clearAllButton);

      expect(mockOnTypesChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Error Handling', () => {
    it('displays error message when error prop is provided', () => {
      const errorMessage = '请至少选择一种类型';
      render(
        <VenueTypeSelector
          selectedTypes={[]}
          onTypesChange={mockOnTypesChange}
          error={errorMessage}
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('shows error icon when error is displayed', () => {
      render(
        <VenueTypeSelector
          selectedTypes={[]}
          onTypesChange={mockOnTypesChange}
          error="Error message"
        />
      );

      const errorContainer = screen.getByText('Error message').closest('div');
      const errorIcon = errorContainer!.querySelector('svg');
      expect(errorIcon).toBeInTheDocument();
    });
  });

  describe('Validation Messages', () => {
    it('shows hint message when no types are selected and no error', () => {
      render(
        <VenueTypeSelector
          selectedTypes={[]}
          onTypesChange={mockOnTypesChange}
        />
      );

      expect(screen.getByText(/请至少选择一种约会场所类型来获取推荐/)).toBeInTheDocument();
    });

    it('does not show hint message when types are selected', () => {
      render(
        <VenueTypeSelector
          selectedTypes={[VenueType.RESTAURANT]}
          onTypesChange={mockOnTypesChange}
        />
      );

      expect(screen.queryByText(/请至少选择一种约会场所类型来获取推荐/)).not.toBeInTheDocument();
    });

    it('does not show hint message when error is present', () => {
      render(
        <VenueTypeSelector
          selectedTypes={[]}
          onTypesChange={mockOnTypesChange}
          error="Error message"
        />
      );

      expect(screen.queryByText(/请至少选择一种约会场所类型来获取推荐/)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper button roles', () => {
      render(
        <VenueTypeSelector
          selectedTypes={[]}
          onTypesChange={mockOnTypesChange}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('supports keyboard navigation', () => {
      render(
        <VenueTypeSelector
          selectedTypes={[]}
          onTypesChange={mockOnTypesChange}
        />
      );

      const restaurantButton = screen.getByText('餐厅').closest('button');
      expect(restaurantButton).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');
    });
  });

  describe('Custom Props', () => {
    it('applies custom className', () => {
      const customClass = 'custom-venue-selector';
      const { container } = render(
        <VenueTypeSelector
          selectedTypes={[]}
          onTypesChange={mockOnTypesChange}
          className={customClass}
        />
      );

      expect(container.firstChild).toHaveClass(customClass);
    });
  });

  describe('Selection Count Display', () => {
    it('shows correct count for empty selection', () => {
      render(
        <VenueTypeSelector
          selectedTypes={[]}
          onTypesChange={mockOnTypesChange}
        />
      );

      expect(screen.getByText('已选择 0 种类型')).toBeInTheDocument();
    });

    it('shows correct count for single selection', () => {
      render(
        <VenueTypeSelector
          selectedTypes={[VenueType.RESTAURANT]}
          onTypesChange={mockOnTypesChange}
        />
      );

      expect(screen.getByText('已选择 1 种类型')).toBeInTheDocument();
    });

    it('shows correct count for multiple selections', () => {
      render(
        <VenueTypeSelector
          selectedTypes={[VenueType.RESTAURANT, VenueType.CAFE, VenueType.PARK]}
          onTypesChange={mockOnTypesChange}
        />
      );

      expect(screen.getByText('已选择 3 种类型')).toBeInTheDocument();
    });
  });
});
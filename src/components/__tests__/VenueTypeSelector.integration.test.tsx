import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { VenueTypeSelector } from '../VenueTypeSelector';
import { VenueType } from '../../types';
import { useSearchStore } from '../../stores/searchStore';

// 创建一个测试组件来集成 VenueTypeSelector 和 searchStore
const TestVenueTypeSelectorWithStore: React.FC<{ showError?: boolean }> = ({ showError = false }) => {
  const { selectedVenueTypes, setSelectedVenueTypes } = useSearchStore();
  
  // 简单的验证逻辑：如果需要显示错误且没有选择类型，则显示错误
  const error = showError && selectedVenueTypes.length === 0 ? '请至少选择一种类型' : undefined;

  return (
    <VenueTypeSelector
      selectedTypes={selectedVenueTypes}
      onTypesChange={setSelectedVenueTypes}
      error={error}
    />
  );
};

describe('VenueTypeSelector Integration', () => {
  beforeEach(() => {
    // 重置 store 状态
    useSearchStore.getState().resetAll();
  });

  it('integrates with search store correctly', () => {
    render(<TestVenueTypeSelectorWithStore />);

    // 初始状态应该没有选择任何类型
    expect(screen.getByText('已选择 0 种类型')).toBeInTheDocument();

    // 选择一个类型
    const restaurantButton = screen.getByText('餐厅').closest('button');
    fireEvent.click(restaurantButton!);

    // 验证状态更新
    expect(screen.getByText('已选择 1 种类型')).toBeInTheDocument();
    expect(useSearchStore.getState().selectedVenueTypes).toEqual([VenueType.RESTAURANT]);
  });

  it('shows validation error when no types are selected and validation is triggered', () => {
    render(<TestVenueTypeSelectorWithStore showError={true} />);

    // 验证错误应该显示
    expect(screen.getByText('请至少选择一种类型')).toBeInTheDocument();
  });

  it('clears validation error when types are selected', () => {
    const { rerender } = render(<TestVenueTypeSelectorWithStore showError={true} />);

    // 初始状态应该显示错误
    expect(screen.getByText('请至少选择一种类型')).toBeInTheDocument();

    // 选择一个类型
    const restaurantButton = screen.getByText('餐厅').closest('button');
    fireEvent.click(restaurantButton!);

    // 重新渲染，错误应该消失
    rerender(<TestVenueTypeSelectorWithStore showError={true} />);
    expect(screen.queryByText('请至少选择一种类型')).not.toBeInTheDocument();
  });

  it('persists selection across component re-renders', () => {
    const { rerender } = render(<TestVenueTypeSelectorWithStore />);

    // 选择多个类型
    fireEvent.click(screen.getByText('餐厅').closest('button')!);
    fireEvent.click(screen.getByText('咖啡厅').closest('button')!);

    // 重新渲染组件
    rerender(<TestVenueTypeSelectorWithStore />);

    // 验证选择状态保持
    expect(screen.getByText('已选择 2 种类型')).toBeInTheDocument();
    expect(useSearchStore.getState().selectedVenueTypes).toEqual([
      VenueType.RESTAURANT,
      VenueType.CAFE
    ]);
  });

  it('handles select all and clear all operations with store', () => {
    render(<TestVenueTypeSelectorWithStore />);

    // 测试全选
    fireEvent.click(screen.getByText('全选'));
    expect(useSearchStore.getState().selectedVenueTypes).toEqual(Object.values(VenueType));

    // 测试清空
    fireEvent.click(screen.getByText('清空'));
    expect(useSearchStore.getState().selectedVenueTypes).toEqual([]);
  });
});
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import LocationInput from '../LocationInput';
import { locationService } from '../../services/LocationService';
import { Location } from '../../types';

// Mock the LocationService
vi.mock('../../services/LocationService', () => ({
  locationService: {
    searchPlaces: vi.fn(),
    geocodeAddress: vi.fn()
  }
}));

const mockLocationService = locationService as any;

describe('LocationInput - Basic Functionality', () => {
  const defaultProps = {
    placeholder: '请输入地点',
    value: '',
    onChange: vi.fn(),
    onLocationSelect: vi.fn()
  };

  const mockLocation: Location = {
    address: '北京市朝阳区三里屯',
    latitude: 39.9042,
    longitude: 116.4074,
    placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4'
  };

  const mockPlaces = [
    {
      placeId: 'place1',
      name: '三里屯太古里',
      address: '北京市朝阳区三里屯路19号',
      location: mockLocation,
      rating: 4.5,
      types: ['shopping_mall']
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocationService.searchPlaces.mockResolvedValue(mockPlaces);
    mockLocationService.geocodeAddress.mockResolvedValue(mockLocation);
  });

  describe('基本渲染', () => {
    it('应该正确渲染输入框', () => {
      render(<LocationInput {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', '请输入地点');
    });

    it('应该显示标签和必填标记', () => {
      render(
        <LocationInput 
          {...defaultProps} 
          label="出发地点" 
          required 
        />
      );
      
      expect(screen.getByText('出发地点')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('应该显示初始值', () => {
      render(
        <LocationInput 
          {...defaultProps} 
          value="北京市" 
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('北京市');
    });

    it('应该在禁用状态下正确显示', () => {
      render(
        <LocationInput 
          {...defaultProps} 
          disabled 
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('bg-gray-100', 'cursor-not-allowed');
    });
  });

  describe('输入处理', () => {
    it('应该在输入时调用onChange', async () => {
      const user = userEvent.setup();
      render(<LocationInput {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'a');
      
      expect(defaultProps.onChange).toHaveBeenCalledWith('a');
    });

    it('应该在输入长度不足时显示验证错误', async () => {
      const user = userEvent.setup();
      const onValidationChange = vi.fn();
      
      render(
        <LocationInput 
          {...defaultProps} 
          onValidationChange={onValidationChange}
        />
      );
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'a');
      await user.tab(); // 触发blur事件
      
      await waitFor(() => {
        expect(onValidationChange).toHaveBeenCalledWith({
          isValid: false,
          errors: ['地点名称至少需要2个字符'],
          touched: true
        });
      });
    });

    it('应该在必填字段为空时显示验证错误', async () => {
      const user = userEvent.setup();
      const onValidationChange = vi.fn();
      
      render(
        <LocationInput 
          {...defaultProps} 
          required
          onValidationChange={onValidationChange}
        />
      );
      
      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.tab(); // 触发blur事件
      
      await waitFor(() => {
        expect(onValidationChange).toHaveBeenCalledWith({
          isValid: false,
          errors: ['请输入地点'],
          touched: true
        });
      });
    });
  });

  describe('清除功能', () => {
    it('应该显示清除按钮', () => {
      render(
        <LocationInput 
          {...defaultProps} 
          value="北京市" 
        />
      );
      
      const clearButton = screen.getByLabelText('清除输入');
      expect(clearButton).toBeInTheDocument();
    });

    it('应该在点击清除按钮时清空输入', async () => {
      const user = userEvent.setup();
      render(
        <LocationInput 
          {...defaultProps} 
          value="北京市" 
        />
      );
      
      const clearButton = screen.getByLabelText('清除输入');
      await user.click(clearButton);
      
      expect(defaultProps.onChange).toHaveBeenCalledWith('');
    });

    it('应该在禁用状态下隐藏清除按钮', () => {
      render(
        <LocationInput 
          {...defaultProps} 
          value="北京市" 
          disabled 
        />
      );
      
      const clearButton = screen.queryByLabelText('清除输入');
      expect(clearButton).not.toBeInTheDocument();
    });
  });

  describe('错误处理', () => {
    it('应该显示外部传入的错误', () => {
      render(
        <LocationInput 
          {...defaultProps} 
          error="网络连接失败" 
        />
      );
      
      expect(screen.getByText('网络连接失败')).toBeInTheDocument();
    });
  });

  describe('可访问性', () => {
    it('应该设置正确的ARIA属性', () => {
      render(<LocationInput {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-expanded', 'false');
      expect(input).toHaveAttribute('aria-haspopup', 'listbox');
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
    });
  });

  describe('自动补全功能 - 基础测试', () => {
    it('应该在输入足够长度时调用搜索服务', async () => {
      const user = userEvent.setup();
      let currentValue = '';
      const onChange = vi.fn((value: string) => {
        currentValue = value;
      });
      
      const { rerender } = render(
        <LocationInput 
          {...defaultProps} 
          value={currentValue}
          onChange={onChange}
        />
      );
      
      const input = screen.getByRole('textbox');
      
      // 模拟逐字符输入
      for (const char of '三里屯') {
        currentValue += char;
        await user.type(input, char);
        rerender(
          <LocationInput 
            {...defaultProps} 
            value={currentValue}
            onChange={onChange}
          />
        );
      }
      
      // 等待防抖延迟
      await waitFor(() => {
        expect(mockLocationService.searchPlaces).toHaveBeenCalledWith('三里屯');
      }, { timeout: 1500 });
    });

    it('应该不在输入长度不足时调用搜索服务', async () => {
      const user = userEvent.setup();
      let currentValue = '';
      const onChange = vi.fn((value: string) => {
        currentValue = value;
      });
      
      const { rerender } = render(
        <LocationInput 
          {...defaultProps} 
          value={currentValue}
          onChange={onChange}
        />
      );
      
      const input = screen.getByRole('textbox');
      currentValue = 'a';
      await user.type(input, 'a');
      rerender(
        <LocationInput 
          {...defaultProps} 
          value={currentValue}
          onChange={onChange}
        />
      );
      
      // 等待防抖延迟后确认没有调用
      await new Promise(resolve => setTimeout(resolve, 400));
      expect(mockLocationService.searchPlaces).not.toHaveBeenCalled();
    });
  });
});
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
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

describe('LocationInput', () => {
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
    },
    {
      placeId: 'place2',
      name: '三里屯酒吧街',
      address: '北京市朝阳区三里屯北路',
      location: mockLocation,
      rating: 4.2,
      types: ['night_club']
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
      await user.type(input, '北京');
      
      expect(defaultProps.onChange).toHaveBeenCalledTimes(2);
      expect(defaultProps.onChange).toHaveBeenNthCalledWith(1, '北');
      expect(defaultProps.onChange).toHaveBeenNthCalledWith(2, '北京');
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

  describe('自动补全功能', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('应该在输入时获取建议', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<LocationInput {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, '三里屯');
      
      // 等待防抖延迟
      act(() => {
        vi.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(mockLocationService.searchPlaces).toHaveBeenCalledWith('三里屯');
      });
    });

    it('应该显示建议列表', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<LocationInput {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, '三里屯');
      
      act(() => {
        vi.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(screen.getByText('三里屯太古里')).toBeInTheDocument();
        expect(screen.getByText('三里屯酒吧街')).toBeInTheDocument();
      });
    });

    it('应该在点击建议时选择地点', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<LocationInput {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, '三里屯');
      
      act(() => {
        vi.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(screen.getByText('三里屯太古里')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('三里屯太古里'));
      
      await waitFor(() => {
        expect(mockLocationService.geocodeAddress).toHaveBeenCalledWith('北京市朝阳区三里屯路19号');
        expect(defaultProps.onLocationSelect).toHaveBeenCalledWith(mockLocation);
      });
    });

    it('应该不在输入长度不足时获取建议', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<LocationInput {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'a');
      
      act(() => {
        vi.advanceTimersByTime(300);
      });
      
      expect(mockLocationService.searchPlaces).not.toHaveBeenCalled();
    });
  });

  describe('键盘导航', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('应该支持方向键导航', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<LocationInput {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, '三里屯');
      
      act(() => {
        vi.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(screen.getByText('三里屯太古里')).toBeInTheDocument();
      });
      
      // 按下箭头键
      await user.keyboard('{ArrowDown}');
      
      // 第一个建议应该被选中
      const firstSuggestion = screen.getByText('三里屯太古里').closest('div');
      expect(firstSuggestion).toHaveClass('bg-blue-50');
    });

    it('应该支持Enter键选择', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<LocationInput {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, '三里屯');
      
      act(() => {
        vi.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(screen.getByText('三里屯太古里')).toBeInTheDocument();
      });
      
      // 选择第一个建议并按Enter
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(defaultProps.onLocationSelect).toHaveBeenCalledWith(mockLocation);
      });
    });

    it('应该支持Escape键关闭建议', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<LocationInput {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, '三里屯');
      
      act(() => {
        vi.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(screen.getByText('三里屯太古里')).toBeInTheDocument();
      });
      
      await user.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(screen.queryByText('三里屯太古里')).not.toBeInTheDocument();
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

  describe('加载状态', () => {
    it('应该在获取建议时显示加载指示器', async () => {
      const user = userEvent.setup();
      
      // 模拟延迟的API调用
      mockLocationService.searchPlaces.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockPlaces), 1000))
      );
      
      render(<LocationInput {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, '三里屯');
      
      // 应该显示加载指示器
      await waitFor(() => {
        expect(screen.getByRole('textbox').parentElement?.querySelector('.animate-spin')).toBeInTheDocument();
      });
    });

    it('应该在选择建议时显示加载指示器', async () => {
      const user = userEvent.setup();
      
      // 模拟延迟的地理编码调用
      mockLocationService.geocodeAddress.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockLocation), 1000))
      );
      
      render(<LocationInput {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, '三里屯');
      
      await waitFor(() => {
        expect(screen.getByText('三里屯太古里')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('三里屯太古里'));
      
      // 应该显示加载指示器
      await waitFor(() => {
        expect(screen.getByRole('textbox').parentElement?.querySelector('.animate-spin')).toBeInTheDocument();
      });
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

    it('应该在API调用失败时处理错误', async () => {
      const user = userEvent.setup();
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockLocationService.searchPlaces.mockRejectedValue(new Error('API Error'));
      
      render(<LocationInput {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, '三里屯');
      
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith('获取地点建议失败:', expect.any(Error));
      });
      
      consoleError.mockRestore();
    });

    it('应该在地理编码失败时显示错误', async () => {
      const user = userEvent.setup();
      const onValidationChange = vi.fn();
      
      mockLocationService.geocodeAddress.mockRejectedValue(new Error('Geocoding failed'));
      
      render(
        <LocationInput 
          {...defaultProps} 
          onValidationChange={onValidationChange}
        />
      );
      
      const input = screen.getByRole('textbox');
      await user.type(input, '三里屯');
      
      await waitFor(() => {
        expect(screen.getByText('三里屯太古里')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('三里屯太古里'));
      
      await waitFor(() => {
        expect(onValidationChange).toHaveBeenCalledWith({
          isValid: false,
          errors: ['无法获取地点信息，请重试'],
          touched: true
        });
      });
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

    it('应该在显示建议时更新ARIA属性', async () => {
      const user = userEvent.setup();
      render(<LocationInput {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, '三里屯');
      
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('应该为建议列表设置正确的role', async () => {
      const user = userEvent.setup();
      render(<LocationInput {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, '三里屯');
      
      await waitFor(() => {
        const listbox = screen.getByRole('listbox');
        expect(listbox).toBeInTheDocument();
      });
    });
  });
});
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Location, ValidationState, BaseComponentProps } from '../types';
import { locationService } from '../services/LocationService';

export interface LocationInputProps extends BaseComponentProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (location: Location) => void;
  onValidationChange?: (validation: ValidationState) => void;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  error?: string;
}

interface AutocompleteSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  placeholder,
  value,
  onChange,
  onLocationSelect,
  onValidationChange,
  disabled = false,
  required = false,
  label,
  error,
  className = '',
  ...props
}) => {
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [validation, setValidation] = useState<ValidationState>({
    isValid: true,
    errors: [],
    touched: false
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // 验证输入
  const validateInput = useCallback((inputValue: string): ValidationState => {
    const errors: string[] = [];
    let isValid = true;

    if (required && (!inputValue || inputValue.trim().length === 0)) {
      errors.push('请输入地点');
      isValid = false;
    }

    if (inputValue && inputValue.trim().length < 2) {
      errors.push('地点名称至少需要2个字符');
      isValid = false;
    }

    return {
      isValid,
      errors,
      touched: validation.touched
    };
  }, [required, validation.touched]);

  // 更新验证状态
  const updateValidation = useCallback((newValidation: ValidationState) => {
    setValidation(newValidation);
    onValidationChange?.(newValidation);
  }, [onValidationChange]);

  // 获取自动补全建议
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      // 使用 searchPlaces 方法获取地点建议
      const places = await locationService.searchPlaces(query.trim());
      
      const suggestions: AutocompleteSuggestion[] = places.map(place => ({
        placeId: place.placeId,
        description: place.address,
        mainText: place.name,
        secondaryText: place.address
      }));

      setSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('获取地点建议失败:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 防抖处理输入
  const debouncedFetchSuggestions = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
  }, [fetchSuggestions]);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // 更新验证状态
    const newValidation = validateInput(newValue);
    newValidation.touched = true;
    updateValidation(newValidation);

    // 获取建议
    debouncedFetchSuggestions(newValue);
  };

  // 处建议选择
  const handleSuggestionSelect = async (suggestion: AutocompleteSuggestion) => {
    try {
      setIsLoading(true);
      
      // 通过地理编码获取完整的位置信息
      const location = await locationService.geocodeAddress(suggestion.description);
      
      onChange(suggestion.description);
      onLocationSelect(location);
      
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);

      // 更新验证状态为有效
      const newValidation: ValidationState = {
        isValid: true,
        errors: [],
        touched: true
      };
      updateValidation(newValidation);

    } catch (error) {
      console.error('选择地点失败:', error);
      const newValidation: ValidationState = {
        isValid: false,
        errors: ['无法获取地点信息，请重试'],
        touched: true
      };
      updateValidation(newValidation);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理键盘导航
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // 处理输入框失焦
  const handleBlur = () => {
    // 延迟隐藏建议，允许点击建议项
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
      
      // 标记为已触摸
      if (!validation.touched) {
        const newValidation = validateInput(value);
        newValidation.touched = true;
        updateValidation(newValidation);
      }
    }, 200);
  };

  // 处理输入框聚焦
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // 清除输入
  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    
    const newValidation: ValidationState = {
      isValid: !required,
      errors: required ? ['请输入地点'] : [],
      touched: true
    };
    updateValidation(newValidation);
    
    inputRef.current?.focus();
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // 计算样式类
  const inputClasses = [
    'w-full px-4 py-3 border rounded-lg transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    'placeholder-gray-400',
    disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
    error || (!validation.isValid && validation.touched)
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-300 hover:border-gray-400',
    className
  ].join(' ');

  const containerClasses = 'relative w-full';

  return (
    <div className={containerClasses} {...props}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClasses}
          autoComplete="off"
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />
        
        {/* 清除按钮 */}
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="清除输入"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* 加载指示器 */}
        {isLoading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* 自动补全建议列表 */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.placeId}
              className={[
                'px-4 py-3 cursor-pointer transition-colors',
                'hover:bg-gray-50',
                selectedIndex === index ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              ].join(' ')}
              onClick={() => handleSuggestionSelect(suggestion)}
              role="option"
              aria-selected={selectedIndex === index}
            >
              <div className="font-medium text-gray-900">{suggestion.mainText}</div>
              <div className="text-sm text-gray-500">{suggestion.secondaryText}</div>
            </div>
          ))}
        </div>
      )}

      {/* 错误信息 */}
      {((error || (!validation.isValid && validation.touched)) && (
        <div className="mt-2 text-sm text-red-600">
          {error || validation.errors[0]}
        </div>
      ))}
    </div>
  );
};

export default LocationInput;
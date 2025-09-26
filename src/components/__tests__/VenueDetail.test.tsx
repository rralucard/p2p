import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VenueDetail } from '../VenueDetail';
import { Venue, Location } from '../../types';

// Mock venue data
const mockVenue: Venue = {
  placeId: 'test-place-id',
  name: '测试餐厅',
  address: '北京市朝阳区测试街道123号',
  location: {
    address: '北京市朝阳区测试街道123号',
    latitude: 39.9042,
    longitude: 116.4074
  },
  rating: 4.5,
  userRatingsTotal: 128,
  priceLevel: 3,
  photos: [
    {
      photoReference: 'https://example.com/photo1.jpg',
      width: 400,
      height: 300
    },
    {
      photoReference: 'https://example.com/photo2.jpg',
      width: 400,
      height: 300
    }
  ],
  openingHours: {
    openNow: true,
    periods: [],
    weekdayText: [
      '周一: 09:00 - 22:00',
      '周二: 09:00 - 22:00',
      '周三: 09:00 - 22:00',
      '周四: 09:00 - 22:00',
      '周五: 09:00 - 22:00',
      '周六: 10:00 - 23:00',
      '周日: 10:00 - 21:00'
    ]
  },
  phoneNumber: '+86-10-12345678',
  website: 'https://example.com',
  types: ['restaurant', 'food'],
  distance: 1500
};

const mockUserLocations: [Location, Location] = [
  {
    address: '北京市海淀区中关村大街1号',
    latitude: 39.9889,
    longitude: 116.3061
  },
  {
    address: '北京市东城区王府井大街138号',
    latitude: 39.9097,
    longitude: 116.4109
  }
];

const mockOnBack = vi.fn();

describe('VenueDetail Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders venue basic information correctly', () => {
    render(
      <VenueDetail
        venue={mockVenue}
        userLocations={mockUserLocations}
        onBack={mockOnBack}
      />
    );

    // 检查店铺名称
    expect(screen.getByText('测试餐厅')).toBeInTheDocument();
    
    // 检查地址
    expect(screen.getByText('北京市朝阳区测试街道123号')).toBeInTheDocument();
    
    // 检查评分
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(128 条评价)')).toBeInTheDocument();
    
    // 检查价格等级
    expect(screen.getByText('¥¥¥')).toBeInTheDocument();
    
    // 检查距离
    expect(screen.getByText('1.5km')).toBeInTheDocument();
    
    // 检查营业状态
    expect(screen.getByText('营业中')).toBeInTheDocument();
  });

  it('renders contact information when available', () => {
    render(
      <VenueDetail
        venue={mockVenue}
        userLocations={mockUserLocations}
        onBack={mockOnBack}
      />
    );

    // 检查电话号码
    expect(screen.getByText('+86-10-12345678')).toBeInTheDocument();
    
    // 检查网站链接
    expect(screen.getByText('访问官网')).toBeInTheDocument();
    const websiteLink = screen.getByRole('link', { name: '访问官网' });
    expect(websiteLink).toHaveAttribute('href', 'https://example.com');
    expect(websiteLink).toHaveAttribute('target', '_blank');
  });

  it('renders opening hours correctly', () => {
    render(
      <VenueDetail
        venue={mockVenue}
        userLocations={mockUserLocations}
        onBack={mockOnBack}
      />
    );

    // 检查营业时间标题
    expect(screen.getByText('营业时间')).toBeInTheDocument();
    
    // 检查具体营业时间
    expect(screen.getByText('周一: 09:00 - 22:00')).toBeInTheDocument();
    expect(screen.getByText('周六: 10:00 - 23:00')).toBeInTheDocument();
  });

  it('handles missing contact information gracefully', () => {
    const venueWithoutContact = {
      ...mockVenue,
      phoneNumber: undefined,
      website: undefined
    };

    render(
      <VenueDetail
        venue={venueWithoutContact}
        userLocations={mockUserLocations}
        onBack={mockOnBack}
      />
    );

    // 联系信息标题应该存在
    expect(screen.getByText('联系信息')).toBeInTheDocument();
    
    // 但是电话和网站链接不应该存在
    expect(screen.queryByText('+86-10-12345678')).not.toBeInTheDocument();
    expect(screen.queryByText('访问官网')).not.toBeInTheDocument();
  });

  it('handles missing opening hours gracefully', () => {
    const venueWithoutHours = {
      ...mockVenue,
      openingHours: {
        openNow: false,
        periods: [],
        weekdayText: []
      }
    };

    render(
      <VenueDetail
        venue={venueWithoutHours}
        userLocations={mockUserLocations}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('营业时间信息暂无')).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    render(
      <VenueDetail
        venue={mockVenue}
        userLocations={mockUserLocations}
        onBack={mockOnBack}
      />
    );

    const backButton = screen.getByRole('button', { name: '返回店铺列表' });
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('renders route information section', async () => {
    render(
      <VenueDetail
        venue={mockVenue}
        userLocations={mockUserLocations}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('路线信息')).toBeInTheDocument();
    
    // Wait for route info to load
    await waitFor(() => {
      expect(screen.getByText('地点A')).toBeInTheDocument();
      expect(screen.getByText('地点B')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('applies custom className', () => {
    const { container } = render(
      <VenueDetail
        venue={mockVenue}
        userLocations={mockUserLocations}
        onBack={mockOnBack}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  describe('PhotoCarousel', () => {
    it('renders photos when available', () => {
      render(
        <VenueDetail
          venue={mockVenue}
          userLocations={mockUserLocations}
          onBack={mockOnBack}
        />
      );

      const firstPhoto = screen.getByAltText('测试餐厅 - 图片 1');
      expect(firstPhoto).toBeInTheDocument();
      expect(firstPhoto).toHaveAttribute('src', 'https://example.com/photo1.jpg');
    });

    it('shows navigation buttons when multiple photos exist', () => {
      render(
        <VenueDetail
          venue={mockVenue}
          userLocations={mockUserLocations}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByLabelText('上一张图片')).toBeInTheDocument();
      expect(screen.getByLabelText('下一张图片')).toBeInTheDocument();
    });

    it('navigates through photos correctly', () => {
      render(
        <VenueDetail
          venue={mockVenue}
          userLocations={mockUserLocations}
          onBack={mockOnBack}
        />
      );

      const nextButton = screen.getByLabelText('下一张图片');
      fireEvent.click(nextButton);

      const secondPhoto = screen.getByAltText('测试餐厅 - 图片 2');
      expect(secondPhoto).toHaveAttribute('src', 'https://example.com/photo2.jpg');
    });

    it('shows placeholder when no photos available', () => {
      const venueWithoutPhotos = {
        ...mockVenue,
        photos: []
      };

      const { container } = render(
        <VenueDetail
          venue={venueWithoutPhotos}
          userLocations={mockUserLocations}
          onBack={mockOnBack}
        />
      );

      // 应该显示占位符容器
      const placeholderContainer = container.querySelector('.bg-gradient-to-br.from-gray-100.to-gray-200');
      expect(placeholderContainer).toBeInTheDocument();
    });
  });

  describe('RouteInfo', () => {
    it('shows loading state initially', () => {
      const { container } = render(
        <VenueDetail
          venue={mockVenue}
          userLocations={mockUserLocations}
          onBack={mockOnBack}
        />
      );

      // 应该显示加载动画
      const loadingElement = container.querySelector('.animate-pulse');
      expect(loadingElement).toBeInTheDocument();
    });

    it('displays route information after loading', async () => {
      render(
        <VenueDetail
          venue={mockVenue}
          userLocations={mockUserLocations}
          onBack={mockOnBack}
        />
      );

      // 等待路线信息加载完成
      await waitFor(() => {
        expect(screen.queryByText('计算中...')).not.toBeInTheDocument();
      }, { timeout: 2000 });

      // 检查是否显示了距离信息
      const distanceElements = screen.getAllByText(/km/);
      expect(distanceElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for interactive elements', () => {
      render(
        <VenueDetail
          venue={mockVenue}
          userLocations={mockUserLocations}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByLabelText('返回店铺列表')).toBeInTheDocument();
      expect(screen.getByLabelText('上一张图片')).toBeInTheDocument();
      expect(screen.getByLabelText('下一张图片')).toBeInTheDocument();
    });

    it('supports keyboard navigation for photo carousel', () => {
      render(
        <VenueDetail
          venue={mockVenue}
          userLocations={mockUserLocations}
          onBack={mockOnBack}
        />
      );

      const indicatorButtons = screen.getAllByLabelText(/查看第 \d+ 张图片/);
      expect(indicatorButtons).toHaveLength(2);
      
      // 测试键盘导航
      fireEvent.click(indicatorButtons[1]);
      const secondPhoto = screen.getByAltText('测试餐厅 - 图片 2');
      expect(secondPhoto).toHaveAttribute('src', 'https://example.com/photo2.jpg');
    });
  });

  describe('Edge Cases', () => {
    it('handles venue with minimal data', () => {
      const minimalVenue: Venue = {
        placeId: 'minimal-id',
        name: '简单店铺',
        address: '简单地址',
        location: {
          address: '简单地址',
          latitude: 0,
          longitude: 0
        },
        rating: 0,
        userRatingsTotal: 0,
        priceLevel: 1,
        photos: [],
        openingHours: {
          openNow: false,
          periods: [],
          weekdayText: []
        },
        types: [],
        distance: 0
      };

      render(
        <VenueDetail
          venue={minimalVenue}
          userLocations={mockUserLocations}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText('简单店铺')).toBeInTheDocument();
      expect(screen.getByText('简单地址')).toBeInTheDocument();
      expect(screen.getByText('已关门')).toBeInTheDocument();
    });

    it('handles very long venue names and addresses', () => {
      const longNameVenue = {
        ...mockVenue,
        name: '这是一个非常非常非常长的店铺名称，用来测试组件是否能够正确处理长文本内容',
        address: '这是一个非常非常非常长的地址，包含了很多详细信息，用来测试组件的文本处理能力和布局适应性'
      };

      render(
        <VenueDetail
          venue={longNameVenue}
          userLocations={mockUserLocations}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText(longNameVenue.name)).toBeInTheDocument();
      expect(screen.getByText(longNameVenue.address)).toBeInTheDocument();
    });
  });
});
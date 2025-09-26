import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VenueList } from '../VenueList';
import { Venue } from '../../types/venue';
import { Location } from '../../types/location';

// Mock venue data for testing
const mockLocation: Location = {
  address: 'Test Address',
  latitude: 40.7128,
  longitude: -74.0060,
  placeId: 'test-place-id'
};

const createMockVenue = (overrides: Partial<Venue> = {}): Venue => ({
  placeId: 'venue-1',
  name: 'Test Restaurant',
  address: '123 Test Street, Test City',
  location: mockLocation,
  rating: 4.5,
  userRatingsTotal: 100,
  priceLevel: 2,
  photos: [
    {
      photoReference: 'test-photo-ref',
      width: 400,
      height: 300
    }
  ],
  openingHours: {
    openNow: true,
    periods: [],
    weekdayText: []
  },
  phoneNumber: '+1234567890',
  website: 'https://test-restaurant.com',
  types: ['restaurant', 'food'],
  distance: 500,
  ...overrides
});

const mockVenues: Venue[] = [
  createMockVenue({
    placeId: 'venue-1',
    name: 'Close Restaurant',
    rating: 4.2,
    distance: 300,
    priceLevel: 2
  }),
  createMockVenue({
    placeId: 'venue-2',
    name: 'Far Restaurant',
    rating: 4.8,
    distance: 1200,
    priceLevel: 3,
    openingHours: {
      openNow: false,
      periods: [],
      weekdayText: []
    }
  }),
  createMockVenue({
    placeId: 'venue-3',
    name: 'Cheap Cafe',
    rating: 4.0,
    distance: 800,
    priceLevel: 1,
    photos: [] // No photos
  })
];

describe('VenueList Component', () => {
  const mockOnVenueSelect = vi.fn();

  beforeEach(() => {
    mockOnVenueSelect.mockClear();
  });

  describe('Rendering', () => {
    it('renders venue list with correct number of venues', () => {
      render(
        <VenueList
          venues={mockVenues}
          onVenueSelect={mockOnVenueSelect}
        />
      );

      expect(screen.getByText('找到 3 个推荐地点')).toBeInTheDocument();
      expect(screen.getByText('Close Restaurant')).toBeInTheDocument();
      expect(screen.getByText('Far Restaurant')).toBeInTheDocument();
      expect(screen.getByText('Cheap Cafe')).toBeInTheDocument();
    });

    it('renders venue cards with correct information', () => {
      render(
        <VenueList
          venues={[mockVenues[0]]}
          onVenueSelect={mockOnVenueSelect}
        />
      );

      // Check venue name
      expect(screen.getByText('Close Restaurant')).toBeInTheDocument();
      
      // Check rating
      expect(screen.getByText('4.2')).toBeInTheDocument();
      expect(screen.getByText('(100)')).toBeInTheDocument();
      
      // Check distance (300m)
      expect(screen.getByText('300m')).toBeInTheDocument();
      
      // Check price level (¥¥)
      expect(screen.getByText('¥¥')).toBeInTheDocument();
      
      // Check address
      expect(screen.getByText('123 Test Street, Test City')).toBeInTheDocument();
      
      // Check open status
      expect(screen.getByText('营业中')).toBeInTheDocument();
    });

    it('displays correct distance formatting', () => {
      const venuesWithDifferentDistances = [
        createMockVenue({ placeId: 'v1', distance: 500, name: 'Close' }),
        createMockVenue({ placeId: 'v2', distance: 1500, name: 'Far' })
      ];

      render(
        <VenueList
          venues={venuesWithDifferentDistances}
          onVenueSelect={mockOnVenueSelect}
        />
      );

      expect(screen.getByText('500m')).toBeInTheDocument();
      expect(screen.getByText('1.5km')).toBeInTheDocument();
    });

    it('displays correct price level formatting', () => {
      const venuesWithDifferentPrices = [
        createMockVenue({ placeId: 'v1', priceLevel: 1, name: 'Cheap' }),
        createMockVenue({ placeId: 'v2', priceLevel: 4, name: 'Expensive' })
      ];

      render(
        <VenueList
          venues={venuesWithDifferentPrices}
          onVenueSelect={mockOnVenueSelect}
        />
      );

      expect(screen.getByText('¥')).toBeInTheDocument();
      expect(screen.getByText('¥¥¥¥')).toBeInTheDocument();
    });

    it('handles venues without photos', () => {
      const venueWithoutPhoto = createMockVenue({
        photos: [],
        name: 'No Photo Venue'
      });

      render(
        <VenueList
          venues={[venueWithoutPhoto]}
          onVenueSelect={mockOnVenueSelect}
        />
      );

      expect(screen.getByText('No Photo Venue')).toBeInTheDocument();
      // Should show placeholder icon instead of image
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('displays correct opening status', () => {
      const venues = [
        createMockVenue({
          placeId: 'open',
          name: 'Open Venue',
          openingHours: { openNow: true, periods: [], weekdayText: [] }
        }),
        createMockVenue({
          placeId: 'closed',
          name: 'Closed Venue',
          openingHours: { openNow: false, periods: [], weekdayText: [] }
        })
      ];

      render(
        <VenueList
          venues={venues}
          onVenueSelect={mockOnVenueSelect}
        />
      );

      expect(screen.getByText('营业中')).toBeInTheDocument();
      expect(screen.getByText('已关门')).toBeInTheDocument();
    });
  });

  describe('Sorting Functionality', () => {
    it('sorts venues by distance by default', () => {
      render(
        <VenueList
          venues={mockVenues}
          onVenueSelect={mockOnVenueSelect}
        />
      );

      const venueCards = screen.getAllByRole('button', { name: /选择店铺/ });
      
      // First venue should be the closest (300m)
      expect(venueCards[0]).toHaveTextContent('Close Restaurant');
      expect(venueCards[0]).toHaveTextContent('300m');
    });

    it('sorts venues by rating when selected', async () => {
      render(
        <VenueList
          venues={mockVenues}
          onVenueSelect={mockOnVenueSelect}
        />
      );

      const sortSelect = screen.getByLabelText('选择排序方式');
      fireEvent.change(sortSelect, { target: { value: 'rating' } });

      await waitFor(() => {
        const venueCards = screen.getAllByRole('button', { name: /选择店铺/ });
        // First venue should be the highest rated (4.8)
        expect(venueCards[0]).toHaveTextContent('Far Restaurant');
        expect(venueCards[0]).toHaveTextContent('4.8');
      });
    });

    it('sorts venues by price when selected', async () => {
      render(
        <VenueList
          venues={mockVenues}
          onVenueSelect={mockOnVenueSelect}
        />
      );

      const sortSelect = screen.getByLabelText('选择排序方式');
      fireEvent.change(sortSelect, { target: { value: 'price' } });

      await waitFor(() => {
        const venueCards = screen.getAllByRole('button', { name: /选择店铺/ });
        // First venue should be the cheapest (price level 1)
        expect(venueCards[0]).toHaveTextContent('Cheap Cafe');
        expect(venueCards[0]).toHaveTextContent('¥');
      });
    });
  });

  describe('Interaction', () => {
    it('calls onVenueSelect when venue card is clicked', () => {
      render(
        <VenueList
          venues={[mockVenues[0]]}
          onVenueSelect={mockOnVenueSelect}
        />
      );

      const venueCard = screen.getByRole('button', { name: /选择店铺 Close Restaurant/ });
      fireEvent.click(venueCard);

      expect(mockOnVenueSelect).toHaveBeenCalledWith(mockVenues[0]);
    });

    it('calls onVenueSelect when "查看详情" button is clicked', () => {
      render(
        <VenueList
          venues={[mockVenues[0]]}
          onVenueSelect={mockOnVenueSelect}
        />
      );

      const detailButton = screen.getByText('查看详情 →');
      fireEvent.click(detailButton);

      expect(mockOnVenueSelect).toHaveBeenCalledWith(mockVenues[0]);
    });

    it('supports keyboard navigation', () => {
      render(
        <VenueList
          venues={[mockVenues[0]]}
          onVenueSelect={mockOnVenueSelect}
        />
      );

      const venueCard = screen.getByRole('button', { name: /选择店铺 Close Restaurant/ });
      
      // Test Enter key
      fireEvent.keyDown(venueCard, { key: 'Enter' });
      expect(mockOnVenueSelect).toHaveBeenCalledWith(mockVenues[0]);

      mockOnVenueSelect.mockClear();

      // Test Space key
      fireEvent.keyDown(venueCard, { key: ' ' });
      expect(mockOnVenueSelect).toHaveBeenCalledWith(mockVenues[0]);
    });
  });

  describe('Loading State', () => {
    it('displays loading state when loading is true', () => {
      render(
        <VenueList
          venues={[]}
          onVenueSelect={mockOnVenueSelect}
          loading={true}
        />
      );

      expect(screen.getByText('搜索中...')).toBeInTheDocument();
      
      // Should show skeleton cards
      const skeletonCards = screen.getAllByRole('generic');
      expect(skeletonCards.length).toBeGreaterThan(0);
    });

    it('does not display venue cards when loading', () => {
      render(
        <VenueList
          venues={mockVenues}
          onVenueSelect={mockOnVenueSelect}
          loading={true}
        />
      );

      expect(screen.queryByText('Close Restaurant')).not.toBeInTheDocument();
      expect(screen.queryByText('Far Restaurant')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('displays empty state when no venues and not loading', () => {
      render(
        <VenueList
          venues={[]}
          onVenueSelect={mockOnVenueSelect}
          loading={false}
        />
      );

      expect(screen.getByText('未找到合适的店铺')).toBeInTheDocument();
      expect(screen.getByText('尝试选择不同的店铺类型或调整搜索条件')).toBeInTheDocument();
    });

    it('does not display empty state when loading', () => {
      render(
        <VenueList
          venues={[]}
          onVenueSelect={mockOnVenueSelect}
          loading={true}
        />
      );

      expect(screen.queryByText('未找到合适的店铺')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(
        <VenueList
          venues={[mockVenues[0]]}
          onVenueSelect={mockOnVenueSelect}
        />
      );

      expect(screen.getByLabelText('选择排序方式')).toBeInTheDocument();
      expect(screen.getByLabelText('选择店铺 Close Restaurant')).toBeInTheDocument();
    });

    it('has proper tabIndex for keyboard navigation', () => {
      render(
        <VenueList
          venues={[mockVenues[0]]}
          onVenueSelect={mockOnVenueSelect}
        />
      );

      const venueCard = screen.getByRole('button', { name: /选择店铺/ });
      expect(venueCard).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Custom className', () => {
    it('applies custom className to container', () => {
      const { container } = render(
        <VenueList
          venues={mockVenues}
          onVenueSelect={mockOnVenueSelect}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VenueList } from '../VenueList';
import { useSearchStore } from '../../stores/searchStore';
import { Venue } from '../../types/venue';
import { Location } from '../../types/location';

// Mock the search store
vi.mock('../../stores/searchStore');

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

describe('VenueList Integration Tests', () => {
  const mockSetSelectedVenue = vi.fn();
  const mockVenues = [
    createMockVenue({
      placeId: 'venue-1',
      name: 'Restaurant A',
      distance: 300,
      rating: 4.2
    }),
    createMockVenue({
      placeId: 'venue-2',
      name: 'Restaurant B',
      distance: 800,
      rating: 4.8
    })
  ];

  beforeEach(() => {
    mockSetSelectedVenue.mockClear();
    
    // Mock the useSearchStore hook
    vi.mocked(useSearchStore).mockReturnValue({
      venues: mockVenues,
      selectedVenue: null,
      loading: false,
      error: null,
      setSelectedVenue: mockSetSelectedVenue,
      // Add other required store properties with default values
      location1: null,
      location2: null,
      midpoint: null,
      selectedVenueTypes: [],
      searchHistory: [],
      setLocation1: vi.fn(),
      setLocation2: vi.fn(),
      setMidpoint: vi.fn(),
      clearLocations: vi.fn(),
      setSelectedVenueTypes: vi.fn(),
      addVenueType: vi.fn(),
      removeVenueType: vi.fn(),
      clearVenueTypes: vi.fn(),
      setVenues: vi.fn(),
      clearSearchResults: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clearError: vi.fn(),
      setFilters: vi.fn(),
      resetAll: vi.fn(),
      addToHistory: vi.fn(),
      clearHistory: vi.fn(),
    });
  });

  it('integrates with search store to handle venue selection', () => {
    const TestComponent = () => {
      const { venues, setSelectedVenue } = useSearchStore();
      
      return (
        <VenueList
          venues={venues}
          onVenueSelect={setSelectedVenue}
        />
      );
    };

    render(<TestComponent />);

    // Click on the first venue
    const firstVenueCard = screen.getByRole('button', { name: /选择店铺 Restaurant A/ });
    fireEvent.click(firstVenueCard);

    // Verify that setSelectedVenue was called with the correct venue
    expect(mockSetSelectedVenue).toHaveBeenCalledWith(mockVenues[0]);
  });

  it('displays venues from the store correctly', () => {
    const TestComponent = () => {
      const { venues, setSelectedVenue } = useSearchStore();
      
      return (
        <VenueList
          venues={venues}
          onVenueSelect={setSelectedVenue}
        />
      );
    };

    render(<TestComponent />);

    // Check that both venues are displayed
    expect(screen.getByText('Restaurant A')).toBeInTheDocument();
    expect(screen.getByText('Restaurant B')).toBeInTheDocument();
    expect(screen.getByText('找到 2 个推荐地点')).toBeInTheDocument();
  });

  it('handles loading state from store', () => {
    // Mock loading state
    vi.mocked(useSearchStore).mockReturnValue({
      venues: [],
      selectedVenue: null,
      loading: true,
      error: null,
      setSelectedVenue: mockSetSelectedVenue,
      // Add other required store properties
      location1: null,
      location2: null,
      midpoint: null,
      selectedVenueTypes: [],
      searchHistory: [],
      setLocation1: vi.fn(),
      setLocation2: vi.fn(),
      setMidpoint: vi.fn(),
      clearLocations: vi.fn(),
      setSelectedVenueTypes: vi.fn(),
      addVenueType: vi.fn(),
      removeVenueType: vi.fn(),
      clearVenueTypes: vi.fn(),
      setVenues: vi.fn(),
      clearSearchResults: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clearError: vi.fn(),
      setFilters: vi.fn(),
      resetAll: vi.fn(),
      addToHistory: vi.fn(),
      clearHistory: vi.fn(),
    });

    const TestComponent = () => {
      const { venues, loading, setSelectedVenue } = useSearchStore();
      
      return (
        <VenueList
          venues={venues}
          onVenueSelect={setSelectedVenue}
          loading={loading}
        />
      );
    };

    render(<TestComponent />);

    expect(screen.getByText('搜索中...')).toBeInTheDocument();
  });

  it('handles empty state when no venues in store', () => {
    // Mock empty state
    vi.mocked(useSearchStore).mockReturnValue({
      venues: [],
      selectedVenue: null,
      loading: false,
      error: null,
      setSelectedVenue: mockSetSelectedVenue,
      // Add other required store properties
      location1: null,
      location2: null,
      midpoint: null,
      selectedVenueTypes: [],
      searchHistory: [],
      setLocation1: vi.fn(),
      setLocation2: vi.fn(),
      setMidpoint: vi.fn(),
      clearLocations: vi.fn(),
      setSelectedVenueTypes: vi.fn(),
      addVenueType: vi.fn(),
      removeVenueType: vi.fn(),
      clearVenueTypes: vi.fn(),
      setVenues: vi.fn(),
      clearSearchResults: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clearError: vi.fn(),
      setFilters: vi.fn(),
      resetAll: vi.fn(),
      addToHistory: vi.fn(),
      clearHistory: vi.fn(),
    });

    const TestComponent = () => {
      const { venues, loading, setSelectedVenue } = useSearchStore();
      
      return (
        <VenueList
          venues={venues}
          onVenueSelect={setSelectedVenue}
          loading={loading}
        />
      );
    };

    render(<TestComponent />);

    expect(screen.getByText('未找到合适的店铺')).toBeInTheDocument();
  });
});
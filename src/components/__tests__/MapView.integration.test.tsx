import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import MapView from '../MapView';
import { Location, Venue } from '../../types';

// Mock Google Maps API
const mockMap = {
  setCenter: vi.fn(),
  setZoom: vi.fn(),
  fitBounds: vi.fn(),
  getZoom: vi.fn().mockReturnValue(13),
  addListener: vi.fn(),
  removeListener: vi.fn()
};

const mockMarker = {
  setMap: vi.fn(),
  getPosition: vi.fn().mockReturnValue({ lat: () => 40.7128, lng: () => -74.0060 }),
  addListener: vi.fn()
};

const mockInfoWindow = {
  setContent: vi.fn(),
  open: vi.fn(),
  close: vi.fn(),
  getContent: vi.fn()
};

const mockBounds = {
  extend: vi.fn()
};

global.google = {
  maps: {
    Map: vi.fn().mockImplementation(() => mockMap),
    Marker: vi.fn().mockImplementation(() => mockMarker),
    InfoWindow: vi.fn().mockImplementation(() => mockInfoWindow),
    LatLngBounds: vi.fn().mockImplementation(() => mockBounds),
    Size: vi.fn().mockImplementation((width, height) => ({ width, height })),
    event: {
      addListener: vi.fn(),
      removeListener: vi.fn()
    }
  }
} as any;

// Mock @googlemaps/react-wrapper
vi.mock('@googlemaps/react-wrapper', () => ({
  Wrapper: ({ children }: any) => children,
  Status: {
    LOADING: 'LOADING',
    SUCCESS: 'SUCCESS',
    FAILURE: 'FAILURE'
  }
}));

describe('MapView Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.REACT_APP_GOOGLE_MAPS_API_KEY = 'test-api-key';
  });

  it('integrates with real-world data structure', () => {
    const center: Location = {
      address: '北京市朝阳区国贸中心',
      latitude: 39.9088,
      longitude: 116.4123
    };

    const userLocations: Location[] = [
      {
        address: '北京市朝阳区三里屯',
        latitude: 39.9368,
        longitude: 116.4472,
        placeId: 'sanlitun'
      },
      {
        address: '北京市朝阳区望京',
        latitude: 39.9965,
        longitude: 116.4706,
        placeId: 'wangjing'
      }
    ];

    const venues: Venue[] = [
      {
        placeId: 'venue1',
        name: '北京饭店',
        address: '北京市东城区王府井大街33号',
        location: {
          address: '北京市东城区王府井大街33号',
          latitude: 39.9139,
          longitude: 116.4074
        },
        rating: 4.5,
        userRatingsTotal: 1250,
        priceLevel: 4,
        photos: [],
        openingHours: {
          openNow: true,
          periods: [],
          weekdayText: []
        },
        phoneNumber: '+86 10 6513 7766',
        website: 'https://www.beijinghotel.com.cn',
        types: ['restaurant', 'lodging'],
        distance: 850
      }
    ];

    const mockOnVenueClick = vi.fn();

    const { container } = render(
      <MapView
        center={center}
        userLocations={userLocations}
        venues={venues}
        onVenueClick={mockOnVenueClick}
      />
    );

    // Should render without errors
    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    const center: Location = {
      address: '默认中心点',
      latitude: 0,
      longitude: 0
    };

    const mockOnVenueClick = vi.fn();

    const { container } = render(
      <MapView
        center={center}
        userLocations={[]}
        venues={[]}
        onVenueClick={mockOnVenueClick}
      />
    );

    // Should render without errors even with empty data
    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles venue click callback correctly', () => {
    const center: Location = {
      address: '测试中心点',
      latitude: 40.7128,
      longitude: -74.0060
    };

    const venue: Venue = {
      placeId: 'test-venue',
      name: '测试店铺',
      address: '测试地址',
      location: {
        address: '测试地址',
        latitude: 40.7500,
        longitude: -73.9800
      },
      rating: 4.0,
      userRatingsTotal: 100,
      priceLevel: 2,
      photos: [],
      openingHours: {
        openNow: true,
        periods: [],
        weekdayText: []
      },
      types: ['restaurant'],
      distance: 500
    };

    const mockOnVenueClick = vi.fn();

    const { container } = render(
      <MapView
        center={center}
        userLocations={[]}
        venues={[venue]}
        onVenueClick={mockOnVenueClick}
      />
    );

    // Verify the component renders and callback is properly passed
    expect(mockOnVenueClick).not.toHaveBeenCalled();
    expect(container.firstChild).toBeInTheDocument();
  });
});
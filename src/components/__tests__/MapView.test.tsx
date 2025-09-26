import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
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

// Mock Google Maps classes
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
  Wrapper: ({ children }: any) => {
    // Simulate successful loading
    return children;
  },
  Status: {
    LOADING: 'LOADING',
    SUCCESS: 'SUCCESS',
    FAILURE: 'FAILURE'
  }
}));

describe('MapView', () => {
  const mockCenter: Location = {
    address: '中心点',
    latitude: 40.7128,
    longitude: -74.0060
  };

  const mockUserLocations: Location[] = [
    {
      address: '纽约时代广场',
      latitude: 40.7580,
      longitude: -73.9855,
      placeId: 'place1'
    },
    {
      address: '中央公园',
      latitude: 40.7829,
      longitude: -73.9654,
      placeId: 'place2'
    }
  ];

  const mockVenues: Venue[] = [
    {
      placeId: 'venue1',
      name: '测试餐厅',
      address: '123 Test St',
      location: {
        address: '123 Test St',
        latitude: 40.7500,
        longitude: -73.9800
      },
      rating: 4.5,
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
    }
  ];

  const mockOnVenueClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock environment variable
    process.env.REACT_APP_GOOGLE_MAPS_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  });

  it('renders without crashing', () => {
    const { container } = render(
      <MapView
        center={mockCenter}
        userLocations={mockUserLocations}
        venues={mockVenues}
        onVenueClick={mockOnVenueClick}
      />
    );
    
    expect(container.firstChild).toBeInTheDocument();
  });

  it('shows API key warning when no API key is provided', () => {
    delete process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    
    render(
      <MapView
        center={mockCenter}
        userLocations={mockUserLocations}
        venues={mockVenues}
        onVenueClick={mockOnVenueClick}
      />
    );
    
    expect(screen.getByText('需要配置 Google Maps API Key')).toBeInTheDocument();
    expect(screen.getByText('请在环境变量中设置 REACT_APP_GOOGLE_MAPS_API_KEY')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <MapView
        center={mockCenter}
        userLocations={mockUserLocations}
        venues={mockVenues}
        onVenueClick={mockOnVenueClick}
        className="custom-map-class"
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-map-class');
  });

  it('creates map with correct initial configuration', async () => {
    render(
      <MapView
        center={mockCenter}
        userLocations={mockUserLocations}
        venues={mockVenues}
        onVenueClick={mockOnVenueClick}
      />
    );

    await waitFor(() => {
      expect(global.google.maps.Map).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          center: { lat: mockCenter.latitude, lng: mockCenter.longitude },
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        })
      );
    });
  });

  it('creates markers for all locations and venues', async () => {
    render(
      <MapView
        center={mockCenter}
        userLocations={mockUserLocations}
        venues={mockVenues}
        onVenueClick={mockOnVenueClick}
      />
    );

    await waitFor(() => {
      // Should create markers for: 2 user locations + 1 midpoint + 1 venue = 4 markers
      expect(global.google.maps.Marker).toHaveBeenCalledTimes(4);
    });
  });

  it('creates user location markers with correct configuration', async () => {
    render(
      <MapView
        center={mockCenter}
        userLocations={mockUserLocations}
        venues={mockVenues}
        onVenueClick={mockOnVenueClick}
      />
    );

    await waitFor(() => {
      expect(global.google.maps.Marker).toHaveBeenCalledWith(
        expect.objectContaining({
          position: { lat: mockUserLocations[0].latitude, lng: mockUserLocations[0].longitude },
          title: mockUserLocations[0].address,
          icon: expect.objectContaining({
            scaledSize: expect.any(Object)
          })
        })
      );
    });
  });

  it('creates midpoint marker with correct configuration', async () => {
    render(
      <MapView
        center={mockCenter}
        userLocations={mockUserLocations}
        venues={mockVenues}
        onVenueClick={mockOnVenueClick}
      />
    );

    await waitFor(() => {
      expect(global.google.maps.Marker).toHaveBeenCalledWith(
        expect.objectContaining({
          position: { lat: mockCenter.latitude, lng: mockCenter.longitude },
          title: mockCenter.address,
          icon: expect.objectContaining({
            scaledSize: expect.any(Object)
          })
        })
      );
    });
  });

  it('creates venue markers with correct configuration', async () => {
    render(
      <MapView
        center={mockCenter}
        userLocations={mockUserLocations}
        venues={mockVenues}
        onVenueClick={mockOnVenueClick}
      />
    );

    await waitFor(() => {
      expect(global.google.maps.Marker).toHaveBeenCalledWith(
        expect.objectContaining({
          position: { 
            lat: mockVenues[0].location.latitude, 
            lng: mockVenues[0].location.longitude 
          },
          title: mockVenues[0].name,
          icon: expect.objectContaining({
            scaledSize: expect.any(Object)
          })
        })
      );
    });
  });

  it('fits bounds to show all markers', async () => {
    render(
      <MapView
        center={mockCenter}
        userLocations={mockUserLocations}
        venues={mockVenues}
        onVenueClick={mockOnVenueClick}
      />
    );

    await waitFor(() => {
      expect(mockBounds.extend).toHaveBeenCalled();
      expect(mockMap.fitBounds).toHaveBeenCalledWith(mockBounds, 50);
    });
  });

  it('handles empty venues array', () => {
    const { container } = render(
      <MapView
        center={mockCenter}
        userLocations={mockUserLocations}
        venues={[]}
        onVenueClick={mockOnVenueClick}
      />
    );

    // Should still render without errors
    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles empty user locations array', () => {
    const { container } = render(
      <MapView
        center={mockCenter}
        userLocations={[]}
        venues={mockVenues}
        onVenueClick={mockOnVenueClick}
      />
    );

    // Should still render without errors
    expect(container.firstChild).toBeInTheDocument();
  });

  it('updates markers when props change', async () => {
    const { rerender } = render(
      <MapView
        center={mockCenter}
        userLocations={mockUserLocations}
        venues={mockVenues}
        onVenueClick={mockOnVenueClick}
      />
    );

    const newVenues = [
      ...mockVenues,
      {
        placeId: 'venue2',
        name: '新餐厅',
        address: '456 New St',
        location: {
          address: '456 New St',
          latitude: 40.7600,
          longitude: -73.9700
        },
        rating: 4.0,
        userRatingsTotal: 50,
        priceLevel: 3,
        photos: [],
        openingHours: {
          openNow: true,
          periods: [],
          weekdayText: []
        },
        types: ['restaurant'],
        distance: 300
      }
    ];

    // Clear previous calls
    vi.clearAllMocks();

    rerender(
      <MapView
        center={mockCenter}
        userLocations={mockUserLocations}
        venues={newVenues}
        onVenueClick={mockOnVenueClick}
      />
    );

    await waitFor(() => {
      // Should clear old markers and create new ones
      expect(mockMarker.setMap).toHaveBeenCalledWith(null);
      // Should create markers for: 2 user locations + 1 midpoint + 2 venues = 5 markers
      expect(global.google.maps.Marker).toHaveBeenCalledTimes(5);
    });
  });

  it('creates info window on marker click', async () => {
    // Mock the marker click listener
    let clickHandler: () => void = () => {};
    mockMarker.addListener.mockImplementation((event: string, handler: () => void) => {
      if (event === 'click') {
        clickHandler = handler;
      }
    });

    render(
      <MapView
        center={mockCenter}
        userLocations={mockUserLocations}
        venues={mockVenues}
        onVenueClick={mockOnVenueClick}
      />
    );

    await waitFor(() => {
      expect(mockMarker.addListener).toHaveBeenCalledWith('click', expect.any(Function));
    });

    // Simulate marker click
    clickHandler();

    expect(mockInfoWindow.setContent).toHaveBeenCalled();
    expect(mockInfoWindow.open).toHaveBeenCalledWith(mockMap, mockMarker);
  });

  it('cleans up markers on unmount', async () => {
    const { unmount } = render(
      <MapView
        center={mockCenter}
        userLocations={mockUserLocations}
        venues={mockVenues}
        onVenueClick={mockOnVenueClick}
      />
    );

    await waitFor(() => {
      expect(global.google.maps.Marker).toHaveBeenCalled();
    });

    unmount();

    expect(mockMarker.setMap).toHaveBeenCalledWith(null);
    expect(mockInfoWindow.close).toHaveBeenCalled();
  });
});
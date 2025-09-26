import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { Location, Venue } from '../types';

interface MapViewProps {
  center: Location;
  userLocations: Location[];
  venues: Venue[];
  onVenueClick: (venue: Venue) => void;
  className?: string;
}

interface GoogleMapProps {
  center: Location;
  userLocations: Location[];
  venues: Venue[];
  onVenueClick: (venue: Venue) => void;
}

// Google Maps component that handles the actual map rendering
const GoogleMapComponent: React.FC<GoogleMapProps> = ({
  center,
  userLocations,
  venues,
  onVenueClick
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      center: { lat: center.latitude, lng: center.longitude },
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    infoWindowRef.current = new google.maps.InfoWindow();
  }, [center]);

  // Clear all markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  }, []);

  // Create marker with custom icon and info window
  const createMarker = useCallback((
    position: { lat: number; lng: number },
    title: string,
    type: 'user' | 'midpoint' | 'venue',
    data?: any
  ) => {
    if (!mapInstanceRef.current) return null;

    const iconConfig = {
      user: {
        url: 'data:image/svg+xml;base64,' + btoa(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" fill="white"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(24, 24)
      },
      midpoint: {
        url: 'data:image/svg+xml;base64,' + btoa(`
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#10B981" stroke="white" stroke-width="3"/>
            <circle cx="16" cy="16" r="4" fill="white"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(32, 32)
      },
      venue: {
        url: 'data:image/svg+xml;base64=' + btoa(`
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="14" cy="14" r="10" fill="#EF4444" stroke="white" stroke-width="2"/>
            <circle cx="14" cy="14" r="3" fill="white"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(28, 28)
      }
    };

    const marker = new google.maps.Marker({
      position,
      map: mapInstanceRef.current,
      title,
      icon: iconConfig[type]
    });

    // Add click listener
    marker.addListener('click', () => {
      if (!infoWindowRef.current) return;

      let content = '';
      if (type === 'user') {
        content = `
          <div class="p-2">
            <h3 class="font-semibold text-blue-600">用户地点</h3>
            <p class="text-sm text-gray-600">${title}</p>
          </div>
        `;
      } else if (type === 'midpoint') {
        content = `
          <div class="p-2">
            <h3 class="font-semibold text-green-600">中心点</h3>
            <p class="text-sm text-gray-600">${title}</p>
          </div>
        `;
      } else if (type === 'venue' && data) {
        const venue = data as Venue;
        content = `
          <div class="p-3 max-w-xs">
            <h3 class="font-semibold text-red-600 mb-1">${venue.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${venue.address}</p>
            <div class="flex items-center gap-2 text-sm">
              <span class="text-yellow-500">★ ${venue.rating.toFixed(1)}</span>
              <span class="text-gray-500">•</span>
              <span class="text-gray-600">${venue.distance}m</span>
            </div>
            <button class="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors">
              查看详情
            </button>
          </div>
        `;
      }

      infoWindowRef.current.setContent(content);
      infoWindowRef.current.open(mapInstanceRef.current, marker);

      // Handle venue click
      if (type === 'venue' && data) {
        // Add event listener to the button in info window
        setTimeout(() => {
          const content = infoWindowRef.current?.getContent();
          const button = content && typeof content !== 'string' && 'querySelector' in content 
            ? (content as Element).querySelector('button') 
            : null;
          if (button) {
            button.addEventListener('click', () => {
              onVenueClick(data as Venue);
              infoWindowRef.current?.close();
            });
          }
        }, 100);
      }
    });

    return marker;
  }, [onVenueClick]);

  // Update markers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    clearMarkers();

    const newMarkers: google.maps.Marker[] = [];

    // Add user location markers
    userLocations.forEach((location) => {
      const marker = createMarker(
        { lat: location.latitude, lng: location.longitude },
        location.address,
        'user'
      );
      if (marker) newMarkers.push(marker);
    });

    // Add midpoint marker
    const midpointMarker = createMarker(
      { lat: center.latitude, lng: center.longitude },
      center.address || '中心点',
      'midpoint'
    );
    if (midpointMarker) newMarkers.push(midpointMarker);

    // Add venue markers
    venues.forEach(venue => {
      const marker = createMarker(
        { lat: venue.location.latitude, lng: venue.location.longitude },
        venue.name,
        'venue',
        venue
      );
      if (marker) newMarkers.push(marker);
    });

    markersRef.current = newMarkers;

    // Auto-fit bounds to show all markers
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        const position = marker.getPosition();
        if (position) bounds.extend(position);
      });
      
      // Add some padding to the bounds
      mapInstanceRef.current.fitBounds(bounds, 50);
      
      // Ensure minimum zoom level
      const listener = google.maps.event.addListener(mapInstanceRef.current, 'bounds_changed', () => {
        const zoom = mapInstanceRef.current?.getZoom();
        if (zoom && zoom > 16) {
          mapInstanceRef.current?.setZoom(16);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [center, userLocations, venues, createMarker, clearMarkers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearMarkers();
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, [clearMarkers]);

  return <div ref={mapRef} className="w-full h-full" />;
};

// Loading component
const MapLoadingComponent: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
      <p className="text-gray-600">加载地图中...</p>
    </div>
  </div>
);

// Error component
const MapErrorComponent: React.FC<{ status: Status }> = ({ status }) => (
  <div className="w-full h-full flex items-center justify-center bg-red-50">
    <div className="text-center">
      <div className="text-red-500 mb-2">
        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <p className="text-red-600 font-medium">地图加载失败</p>
      <p className="text-red-500 text-sm mt-1">错误: {status}</p>
    </div>
  </div>
);

// Render function for the wrapper
const render = (status: Status): React.ReactElement => {
  switch (status) {
    case Status.LOADING:
      return <MapLoadingComponent />;
    case Status.FAILURE:
      return <MapErrorComponent status={status} />;
    case Status.SUCCESS:
      return <div>地图已准备就绪</div>;
    default:
      return <MapLoadingComponent />;
  }
};

// Main MapView component
const MapView: React.FC<MapViewProps> = ({
  center,
  userLocations,
  venues,
  onVenueClick,
  className = ''
}) => {
  const [apiKey] = useState(() => {
    // In a real app, this should come from environment variables
    // For demo purposes, we'll use a placeholder
    return (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';
  });

  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-yellow-50 ${className}`}>
        <div className="text-center">
          <div className="text-yellow-600 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-yellow-700 font-medium">需要配置 Google Maps API Key</p>
          <p className="text-yellow-600 text-sm mt-1">请在环境变量中设置 REACT_APP_GOOGLE_MAPS_API_KEY</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <Wrapper apiKey={apiKey} render={render} libraries={['places']}>
        <GoogleMapComponent
          center={center}
          userLocations={userLocations}
          venues={venues}
          onVenueClick={onVenueClick}
        />
      </Wrapper>
    </div>
  );
};

export default MapView;
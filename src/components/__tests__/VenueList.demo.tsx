import React, { useState } from 'react';
import { VenueList } from '../VenueList';
import { Venue } from '../../types/venue';
import { Location } from '../../types/location';

/**
 * Demo component showing VenueList usage
 * This is for development/testing purposes only
 */

const mockLocation: Location = {
  address: 'Test Address',
  latitude: 40.7128,
  longitude: -74.0060,
  placeId: 'test-place-id'
};

const demoVenues: Venue[] = [
  {
    placeId: 'venue-1',
    name: '星巴克咖啡',
    address: '北京市朝阳区建国门外大街1号国贸商城',
    location: mockLocation,
    rating: 4.3,
    userRatingsTotal: 256,
    priceLevel: 2,
    photos: [
      {
        photoReference: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
        width: 400,
        height: 300
      }
    ],
    openingHours: {
      openNow: true,
      periods: [],
      weekdayText: ['周一: 07:00-22:00', '周二: 07:00-22:00']
    },
    phoneNumber: '+86-10-65052288',
    website: 'https://www.starbucks.com.cn',
    types: ['cafe', 'food'],
    distance: 350
  },
  {
    placeId: 'venue-2',
    name: '海底捞火锅',
    address: '北京市朝阳区三里屯太古里南区',
    location: mockLocation,
    rating: 4.6,
    userRatingsTotal: 1024,
    priceLevel: 3,
    photos: [
      {
        photoReference: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400',
        width: 400,
        height: 300
      }
    ],
    openingHours: {
      openNow: true,
      periods: [],
      weekdayText: ['周一: 11:00-02:00', '周二: 11:00-02:00']
    },
    phoneNumber: '+86-10-64161234',
    website: 'https://www.haidilao.com',
    types: ['restaurant', 'food'],
    distance: 1200
  },
  {
    placeId: 'venue-3',
    name: 'UME国际影城',
    address: '北京市朝阳区朝阳北路101号朝阳大悦城',
    location: mockLocation,
    rating: 4.1,
    userRatingsTotal: 512,
    priceLevel: 2,
    photos: [],
    openingHours: {
      openNow: false,
      periods: [],
      weekdayText: ['周一: 09:00-24:00', '周二: 09:00-24:00']
    },
    phoneNumber: '+86-10-85528888',
    website: 'https://www.umecinemas.com',
    types: ['movie_theater', 'entertainment'],
    distance: 800
  },
  {
    placeId: 'venue-4',
    name: '中央公园',
    address: '北京市朝阳区朝阳公园南路1号',
    location: mockLocation,
    rating: 4.4,
    userRatingsTotal: 2048,
    priceLevel: 1,
    photos: [
      {
        photoReference: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
        width: 400,
        height: 300
      }
    ],
    openingHours: {
      openNow: true,
      periods: [],
      weekdayText: ['周一: 06:00-22:00', '周二: 06:00-22:00']
    },
    types: ['park', 'tourist_attraction'],
    distance: 600
  }
];

export const VenueListDemo: React.FC = () => {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(false);
  const [venues, setVenues] = useState<Venue[]>(demoVenues);

  const handleVenueSelect = (venue: Venue) => {
    setSelectedVenue(venue);
    console.log('Selected venue:', venue);
  };

  const handleLoadingToggle = () => {
    setLoading(!loading);
  };

  const handleClearVenues = () => {
    setVenues([]);
  };

  const handleRestoreVenues = () => {
    setVenues(demoVenues);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">VenueList Component Demo</h1>
      
      {/* Demo Controls */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Demo Controls</h2>
        <div className="flex gap-4">
          <button
            onClick={handleLoadingToggle}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {loading ? 'Stop Loading' : 'Show Loading'}
          </button>
          <button
            onClick={handleClearVenues}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear Venues
          </button>
          <button
            onClick={handleRestoreVenues}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Restore Venues
          </button>
        </div>
      </div>

      {/* Selected Venue Info */}
      {selectedVenue && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900">Selected Venue:</h3>
          <p className="text-blue-800">{selectedVenue.name}</p>
          <p className="text-blue-600 text-sm">{selectedVenue.address}</p>
        </div>
      )}

      {/* VenueList Component */}
      <VenueList
        venues={venues}
        onVenueSelect={handleVenueSelect}
        loading={loading}
        className="bg-gray-50 p-6 rounded-lg"
      />
    </div>
  );
};

export default VenueListDemo;
import { Location, OpeningHours, Photo } from './location';

/**
 * 店铺类型枚举
 */
export enum VenueType {
  RESTAURANT = 'restaurant',
  CAFE = 'cafe',
  MOVIE_THEATER = 'movie_theater',
  SHOPPING_MALL = 'shopping_mall',
  BAR = 'bar',
  PARK = 'park',
  MUSEUM = 'museum',
  AMUSEMENT_PARK = 'amusement_park',
  BOWLING_ALLEY = 'bowling_alley',
  GYM = 'gym'
}

/**
 * 店铺信息接口
 */
export interface Venue {
  placeId: string;
  name: string;
  address: string;
  location: Location;
  rating: number;
  userRatingsTotal: number;
  priceLevel: number; // 1-4 scale
  photos: Photo[];
  openingHours: OpeningHours;
  phoneNumber?: string;
  website?: string;
  types: string[];
  distance: number; // distance from midpoint in meters
}

/**
 * Google Places API 搜索结果
 */
export interface Place {
  placeId: string;
  name: string;
  address: string;
  location: Location;
  rating?: number;
  types: string[];
}
/**
 * 地点相关的类型定义
 */

export interface Location {
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
}

export interface TimeOfDay {
  day: number; // 0-6 (Sunday-Saturday)
  time: string; // HHMM format
}

export interface Period {
  open: TimeOfDay;
  close?: TimeOfDay;
}

export interface OpeningHours {
  openNow: boolean;
  periods: Period[];
  weekdayText: string[];
}

export interface Photo {
  photoReference: string;
  width: number;
  height: number;
}

export interface DirectionsResult {
  distance: {
    text: string;
    value: number; // in meters
  };
  duration: {
    text: string;
    value: number; // in seconds
  };
  routes: any[]; // Google Maps routes data
}
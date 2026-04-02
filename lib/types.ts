export type WheelchairAccess = 'yes' | 'limited' | 'no' | 'unknown';
export type DataSource = 'osm' | 'user' | 'official';
export type LocationType =
  | 'subway'
  | 'building'
  | 'restaurant'
  | 'cafe'
  | 'hospital'
  | 'shopping'
  | 'public'
  | 'cultural';

export interface AccessibilityLocation {
  id: string;
  name: string;
  type: LocationType;
  lat: number;
  lng: number;
  address: string;
  accessibility: {
    elevator: {
      available: boolean;
      floors?: string;
      note?: string;
    };
    kiosk: {
      available: boolean;
      voiceSupport: boolean;
      largeFontSupport?: boolean;
      note?: string;
    };
    steps: {
      hasSteps: boolean;
      maxHeightCm?: number;
      ramp: boolean;
      note?: string;
    };
    wheelchair: {
      accessible: WheelchairAccess;
      note?: string;
    };
    toilet: {
      available: boolean;
      accessible: boolean;
    };
  };
  lastUpdated: string;
  source: DataSource;
}

export type FilterKey = 'elevator' | 'voiceKiosk' | 'noSteps' | 'wheelchair' | 'accessibleToilet';

export interface Filters {
  elevator: boolean;
  voiceKiosk: boolean;
  noSteps: boolean;
  wheelchair: boolean;
  accessibleToilet: boolean;
}

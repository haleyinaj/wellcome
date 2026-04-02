import { AccessibilityLocation, LocationType } from './types';

interface KakaoPlace {
  id: string;
  place_name: string;
  category_group_code: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string; // longitude
  y: string; // latitude
  place_url: string;
}

const KAKAO_CODE_TO_TYPE: Record<string, LocationType> = {
  FD6: 'restaurant',
  CE7: 'cafe',
  MT1: 'shopping',
  CS2: 'shopping',
  HP8: 'hospital',
  SW8: 'subway',
  CT1: 'cultural',
  PO3: 'public',
};

const EMPTY_ACCESSIBILITY: AccessibilityLocation['accessibility'] = {
  elevator: { available: false },
  kiosk: { available: false, voiceSupport: false },
  steps: { hasSteps: false, ramp: false },
  wheelchair: { accessible: 'unknown' },
  toilet: { available: false, accessible: false },
};

export function kakaoToLocation(place: KakaoPlace, fallbackType: LocationType = 'restaurant'): AccessibilityLocation {
  const type = KAKAO_CODE_TO_TYPE[place.category_group_code] ?? fallbackType;
  return {
    id: `kakao-${place.id}`,
    name: place.place_name,
    type,
    lat: parseFloat(place.y),
    lng: parseFloat(place.x),
    address: place.road_address_name || place.address_name,
    accessibility: EMPTY_ACCESSIBILITY,
    lastUpdated: new Date().toISOString().split('T')[0],
    source: 'kakao',
    hasAccessibilityData: false,
    phone: place.phone || undefined,
    placeUrl: place.place_url || undefined,
  };
}

export async function fetchKakaoPlaces(
  type: LocationType,
  lat: number,
  lng: number,
  radius = 1000
): Promise<AccessibilityLocation[]> {
  const res = await fetch(
    `/api/places?type=${type}&lat=${lat}&lng=${lng}&radius=${radius}`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.documents ?? []).map((p: KakaoPlace) => kakaoToLocation(p, type));
}

export async function fetchKakaoByQuery(
  query: string,
  lat: number,
  lng: number
): Promise<AccessibilityLocation[]> {
  const res = await fetch(
    `/api/places?query=${encodeURIComponent(query)}&lat=${lat}&lng=${lng}&radius=5000`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.documents ?? []).map((p: KakaoPlace) => kakaoToLocation(p));
}

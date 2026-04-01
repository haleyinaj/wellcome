import { AccessibilityLocation } from './types';

const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

export async function fetchElevatorsFromOSM(
  south: number,
  west: number,
  north: number,
  east: number
): Promise<AccessibilityLocation[]> {
  const query = `
    [out:json][timeout:15];
    (
      node["highway"="elevator"](${south},${west},${north},${east});
    );
    out body;
  `;

  try {
    const res = await fetch(OVERPASS_API, {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const data = await res.json();

    return data.elements
      .filter((el: OSMElement) => el.lat && el.lon)
      .slice(0, 30)
      .map((el: OSMElement): AccessibilityLocation => ({
        id: `osm-elevator-${el.id}`,
        name: el.tags?.name || el.tags?.['name:ko'] || '엘리베이터',
        type: 'public',
        lat: el.lat!,
        lng: el.lon!,
        address: el.tags?.['addr:full'] || el.tags?.['addr:street'] || 'OSM 데이터',
        accessibility: {
          elevator: {
            available: true,
            floors: el.tags?.['level'] || undefined,
            note: 'OpenStreetMap 데이터',
          },
          kiosk: { available: false, voiceSupport: false },
          steps: { hasSteps: false, ramp: false },
          wheelchair: {
            accessible: el.tags?.wheelchair === 'yes' ? 'yes'
              : el.tags?.wheelchair === 'limited' ? 'limited'
              : el.tags?.wheelchair === 'no' ? 'no'
              : 'unknown',
          },
          toilet: { available: false, accessible: false },
        },
        lastUpdated: '(OSM 실시간)',
        source: 'osm',
      }));
  } catch {
    return [];
  }
}

interface OSMElement {
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
}

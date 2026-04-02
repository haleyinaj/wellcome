'use client';

import { useEffect, useRef, useState } from 'react';
import { AccessibilityLocation, Filters } from '@/lib/types';

// Leaflet은 브라우저 전용이므로 dynamic import
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let L: any;

interface Props {
  locations: AccessibilityLocation[];
  filters: Filters;
  selectedId: string | null;
  onSelect: (location: AccessibilityLocation) => void;
  onMapMove?: (center: { lat: number; lng: number }) => void;
}

function getMarkerColor(loc: AccessibilityLocation): string {
  const a = loc.accessibility;
  const score =
    (a.elevator.available ? 2 : 0) +
    (a.kiosk.voiceSupport ? 2 : 0) +
    (!a.steps.hasSteps ? 2 : a.steps.ramp ? 1 : 0) +
    (a.wheelchair.accessible === 'yes' ? 2 : a.wheelchair.accessible === 'limited' ? 1 : 0);

  if (score >= 7) return '#16a34a';
  if (score >= 4) return '#d97706';
  return '#dc2626';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createMarkerIcon(color: string, isSelected: boolean): any {
  const size = isSelected ? 36 : 28;
  const ring = isSelected ? `box-shadow: 0 0 0 3px white, 0 0 0 5px ${color};` : '';
  return new L.DivIcon({
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;
      background:${color};transform:rotate(-45deg);
      border:2px solid white;${ring}
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

export default function Map({ locations, filters, selectedId, onSelect, onMapMove }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<globalThis.Map<string, any>>(new globalThis.Map<string, any>());
  const [ready, setReady] = useState(false);

  // Leaflet 초기화 (SSR 방지)
  useEffect(() => {
    import('leaflet').then((leaflet) => {
      L = leaflet.default;
      delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      setReady(true);
    });
  }, []);

  // 지도 생성
  useEffect(() => {
    if (!ready || !mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [37.5665, 126.978],
      zoom: 13,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    map.on('moveend', () => {
      const center = map.getCenter();
      onMapMove?.({ lat: center.lat, lng: center.lng });
    });

    mapInstanceRef.current = map;
  }, [ready, onMapMove]);

  // 마커 업데이트
  useEffect(() => {
    if (!ready || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    locations.forEach((loc) => {
      const isSelected = loc.id === selectedId;
      const color = getMarkerColor(loc);
      const icon = createMarkerIcon(color, isSelected);

      const marker = L.marker([loc.lat, loc.lng], { icon })
        .addTo(map)
        .on('click', () => onSelect(loc));

      markersRef.current.set(loc.id, marker);
    });
  }, [ready, locations, selectedId, onSelect]);

  // 선택된 마커로 지도 이동
  useEffect(() => {
    if (!ready || !mapInstanceRef.current || !selectedId) return;
    const loc = locations.find((l) => l.id === selectedId);
    if (loc) {
      mapInstanceRef.current.flyTo([loc.lat, loc.lng], 16, { duration: 0.8 });
    }
  }, [ready, selectedId, locations]);

  return (
    <div className="relative w-full h-full">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div ref={mapRef} className="w-full h-full" />

      {/* 범례 */}
      <div className="absolute bottom-10 left-3 z-[999] bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-lg px-3 py-2 text-xs space-y-1">
        <div className="font-semibold text-gray-700 mb-1">접근성 지수</div>
        {[
          { color: '#16a34a', label: '양호' },
          { color: '#d97706', label: '보통' },
          { color: '#dc2626', label: '미흡' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: color }}
            />
            <span className="text-gray-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

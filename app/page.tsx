'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { AccessibilityLocation, Filters, FilterKey, LocationType } from '@/lib/types';
import { sampleLocations } from '@/lib/sampleData';
import { fetchKakaoPlaces } from '@/lib/kakao';
import FilterBar from '@/components/FilterBar';
import LocationPanel from '@/components/LocationPanel';
import { Search, X, MapPin } from 'lucide-react';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="text-gray-400 text-sm animate-pulse">지도 불러오는 중...</div>
    </div>
  ),
});

const KAKAO_TYPES: LocationType[] = ['restaurant', 'cafe', 'shopping'];

const DEFAULT_FILTERS: Filters = {
  elevator: false,
  voiceKiosk: false,
  noSteps: false,
  wheelchair: false,
  accessibleToilet: false,
};

function applyFilters(
  locations: AccessibilityLocation[],
  filters: Filters,
  search: string,
  typeFilter: LocationType | null
): AccessibilityLocation[] {
  return locations.filter((loc) => {
    if (typeFilter && loc.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!loc.name.toLowerCase().includes(q) && !loc.address.toLowerCase().includes(q)) return false;
    }
    if (loc.hasAccessibilityData === false) return true; // 카카오 데이터는 접근성 필터 미적용
    const a = loc.accessibility;
    if (filters.elevator && !a.elevator.available) return false;
    if (filters.voiceKiosk && !(a.kiosk.available && a.kiosk.voiceSupport)) return false;
    if (filters.noSteps && a.steps.hasSteps) return false;
    if (filters.wheelchair && a.wheelchair.accessible !== 'yes') return false;
    if (filters.accessibleToilet && !(a.toilet.available && a.toilet.accessible)) return false;
    return true;
  });
}

export default function Home() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showList, setShowList] = useState(false);
  const [typeFilter, setTypeFilter] = useState<LocationType | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 37.5665, lng: 126.978 });
  const [kakaoPlaces, setKakaoPlaces] = useState<AccessibilityLocation[]>([]);
  const [kakaoLoading, setKakaoLoading] = useState(false);

  // 카카오 타입 선택 시 주변 장소 fetch
  useEffect(() => {
    if (!typeFilter || !KAKAO_TYPES.includes(typeFilter)) {
      setKakaoPlaces([]);
      return;
    }
    let cancelled = false;
    setKakaoLoading(true);
    fetchKakaoPlaces(typeFilter, mapCenter.lat, mapCenter.lng, 1000).then((places) => {
      if (!cancelled) {
        setKakaoPlaces(places);
        setKakaoLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [typeFilter, mapCenter]);

  const allLocations = useMemo(() => {
    if (typeFilter && KAKAO_TYPES.includes(typeFilter)) return kakaoPlaces;
    return sampleLocations;
  }, [typeFilter, kakaoPlaces]);

  const filteredLocations = useMemo(
    () => applyFilters(allLocations, filters, search, typeFilter),
    [allLocations, filters, search, typeFilter]
  );

  const selectedLocation = useMemo(
    () => [...sampleLocations, ...kakaoPlaces].find((l) => l.id === selectedId) ?? null,
    [kakaoPlaces, selectedId]
  );

  const handleFilterChange = useCallback((key: FilterKey) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSelect = useCallback((loc: AccessibilityLocation) => {
    setSelectedId(loc.id);
    setShowList(false);
  }, []);

  const handleMapMove = useCallback((center: { lat: number; lng: number }) => {
    setMapCenter(center);
  }, []);

  const hasActiveFilters = Object.values(filters).some(Boolean) || search.length > 0;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm z-10">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="웰컴맵 로고" width={32} height={32} className="rounded-lg flex-shrink-0" />
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-none">웰컴맵</h1>
            <p className="text-xs text-gray-400 leading-none mt-0.5">모두를 위한 접근성 지도</p>
          </div>
        </div>

        {/* 검색창 */}
        <div className="flex-1 max-w-sm ml-2 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="장소명 또는 주소 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={13} className="text-gray-400" />
            </button>
          )}
        </div>

        {/* 목록 토글 버튼 */}
        <button
          onClick={() => setShowList(!showList)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <MapPin size={13} />
          <span className="hidden sm:inline">목록 보기</span>
          <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full ml-1">
            {filteredLocations.length}
          </span>
        </button>
      </header>

      {/* 필터 바 */}
      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        resultCount={filteredLocations.length}
        typeFilter={typeFilter}
        onTypeFilter={setTypeFilter}
        kakaoLoading={kakaoLoading}
      />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 relative overflow-hidden">
        {/* 지도 */}
        <Map
          locations={filteredLocations}
          filters={filters}
          selectedId={selectedId}
          onSelect={handleSelect}
          onMapMove={handleMapMove}
        />

        {/* 장소 목록 패널 */}
        {showList && (
          <div className="absolute inset-0 z-[1000] bg-white overflow-y-auto shadow-xl md:absolute md:inset-auto md:top-0 md:left-0 md:w-80 md:h-full">
            <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-800">장소 목록</span>
              <button onClick={() => setShowList(false)}>
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            {filteredLocations.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                <div className="text-2xl mb-2">🔍</div>
                {hasActiveFilters ? '조건에 맞는 장소가 없습니다' : '장소가 없습니다'}
              </div>
            ) : (
              filteredLocations.map((loc) => {
                const a = loc.accessibility;
                return (
                  <button
                    key={loc.id}
                    onClick={() => handleSelect(loc)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-blue-50 transition-colors
                      ${selectedId === loc.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{loc.name}</div>
                        <div className="text-xs text-gray-400 truncate mt-0.5">{loc.address}</div>
                      </div>
                    </div>
                    {loc.hasAccessibilityData === false ? (
                      <span className="text-xs text-gray-400 mt-1 inline-block">접근성 정보 없음</span>
                    ) : (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {a.elevator.available && (
                          <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md">🛗 엘리베이터</span>
                        )}
                        {a.kiosk.voiceSupport && (
                          <span className="text-xs bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded-md">🔊 음성키오스크</span>
                        )}
                        {!a.steps.hasSteps && (
                          <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded-md">✅ 무단차</span>
                        )}
                        {a.wheelchair.accessible === 'yes' && (
                          <span className="text-xs bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded-md">♿ 휠체어</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* 선택된 장소 상세 패널 */}
        {selectedLocation && (
          <LocationPanel location={selectedLocation} onClose={() => setSelectedId(null)} />
        )}
      </div>
    </div>
  );
}

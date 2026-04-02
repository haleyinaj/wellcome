'use client';

import { Filters, FilterKey, LocationType } from '@/lib/types';

interface Props {
  filters: Filters;
  onChange: (key: FilterKey) => void;
  resultCount: number;
  typeFilter: LocationType | null;
  onTypeFilter: (type: LocationType | null) => void;
}

const TYPE_OPTIONS: { type: LocationType; label: string; icon: string }[] = [
  { type: 'restaurant', label: '식당', icon: '🍽️' },
  { type: 'cafe', label: '카페', icon: '☕' },
  { type: 'shopping', label: '쇼핑', icon: '🛍️' },
  { type: 'subway', label: '지하철', icon: '🚇' },
  { type: 'hospital', label: '병원', icon: '🏥' },
  { type: 'public', label: '공공시설', icon: '🏛️' },
  { type: 'cultural', label: '문화시설', icon: '🎭' },
  { type: 'building', label: '건물', icon: '🏢' },
];

const FILTER_OPTIONS: { key: FilterKey; label: string; icon: string; activeColor: string }[] = [
  { key: 'elevator', label: '엘리베이터', icon: '🛗', activeColor: 'bg-blue-500 text-white border-blue-500' },
  { key: 'voiceKiosk', label: '음성 키오스크', icon: '🔊', activeColor: 'bg-purple-500 text-white border-purple-500' },
  { key: 'noSteps', label: '계단 없음', icon: '✅', activeColor: 'bg-green-500 text-white border-green-500' },
  { key: 'wheelchair', label: '휠체어 가능', icon: '♿', activeColor: 'bg-teal-500 text-white border-teal-500' },
  { key: 'accessibleToilet', label: '장애인 화장실', icon: '🚻', activeColor: 'bg-orange-500 text-white border-orange-500' },
];

export default function FilterBar({ filters, onChange, resultCount, typeFilter, onTypeFilter }: Props) {
  return (
    <div className="bg-white border-b border-gray-100 px-4 pt-2 pb-3">
      {/* 카테고리 탭 */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => onTypeFilter(null)}
          className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium transition-all
            ${typeFilter === null ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
        >
          전체
        </button>
        {TYPE_OPTIONS.map(({ type, label, icon }) => (
          <button
            key={type}
            onClick={() => onTypeFilter(typeFilter === type ? null : type)}
            className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium transition-all
              ${typeFilter === type ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* 접근성 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FILTER_OPTIONS.map(({ key, label, icon, activeColor }) => {
          const isActive = filters[key];
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all
                ${isActive ? activeColor : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          );
        })}
        <span className="ml-auto flex-shrink-0 self-center text-xs text-gray-400 pl-2">{resultCount}개</span>
      </div>
    </div>
  );
}

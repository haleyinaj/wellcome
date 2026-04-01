'use client';

import { Filters, FilterKey } from '@/lib/types';

interface Props {
  filters: Filters;
  onChange: (key: FilterKey) => void;
  resultCount: number;
}

const FILTER_OPTIONS: { key: FilterKey; label: string; icon: string; activeColor: string }[] = [
  { key: 'elevator', label: '엘리베이터', icon: '🛗', activeColor: 'bg-blue-500 text-white border-blue-500' },
  { key: 'voiceKiosk', label: '음성 키오스크', icon: '🔊', activeColor: 'bg-purple-500 text-white border-purple-500' },
  { key: 'noSteps', label: '계단 없음', icon: '✅', activeColor: 'bg-green-500 text-white border-green-500' },
  { key: 'wheelchair', label: '휠체어 가능', icon: '♿', activeColor: 'bg-teal-500 text-white border-teal-500' },
  { key: 'accessibleToilet', label: '장애인 화장실', icon: '🚻', activeColor: 'bg-orange-500 text-white border-orange-500' },
];

export default function FilterBar({ filters, onChange, resultCount }: Props) {
  return (
    <div className="bg-white border-b border-gray-100 px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">필터</span>
        <span className="ml-auto text-xs text-gray-400">{resultCount}개 장소</span>
      </div>
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
      </div>
    </div>
  );
}

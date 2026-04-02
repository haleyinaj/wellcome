'use client';

import { AccessibilityLocation } from '@/lib/types';
import AccessibilityBadge from './AccessibilityBadge';
import { X, MapPin, Clock, Database } from 'lucide-react';

interface Props {
  location: AccessibilityLocation | null;
  onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  subway: '지하철역',
  building: '건물',
  restaurant: '음식점',
  cafe: '카페',
  hospital: '병원',
  shopping: '쇼핑',
  public: '공공시설',
  cultural: '문화시설',
};

const SOURCE_LABELS: Record<string, string> = {
  osm: 'OpenStreetMap',
  user: '사용자 제보',
  official: '공식 데이터',
};

export default function LocationPanel({ location, onClose }: Props) {
  if (!location) return null;

  const { accessibility: a } = location;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-2xl shadow-2xl max-h-[75vh] overflow-y-auto md:absolute md:top-4 md:left-auto md:right-4 md:bottom-auto md:w-80 md:rounded-2xl md:max-h-[calc(100vh-2rem)]">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span className="inline-block text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-1">
              {TYPE_LABELS[location.type] || location.type}
            </span>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">{location.name}</h2>
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
              <MapPin size={11} />
              <span className="truncate">{location.address}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="닫기"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* 접근성 정보 */}
      <div className="px-5 py-4 space-y-3">
        {/* 엘리베이터 */}
        <AccessibilityBadge
          label="엘리베이터"
          value={a.elevator.available}
          icon="🛗"
          detail={
            a.elevator.available
              ? [a.elevator.floors && `운행 층수: ${a.elevator.floors}`, a.elevator.note].filter(Boolean).join(' · ') || undefined
              : a.elevator.note
          }
        />

        {/* 키오스크 음성 */}
        <AccessibilityBadge
          label="키오스크 음성 안내"
          value={a.kiosk.available ? a.kiosk.voiceSupport : false}
          icon="🔊"
          detail={
            !a.kiosk.available
              ? '키오스크 없음'
              : a.kiosk.voiceSupport
              ? [
                  '음성 안내 지원',
                  a.kiosk.largeFontSupport && '큰 글씨 지원',
                  a.kiosk.note,
                ].filter(Boolean).join(' · ')
              : a.kiosk.note || '음성 안내 미지원'
          }
        />

        {/* 계단 단차 */}
        <AccessibilityBadge
          label="계단 단차"
          value={!a.steps.hasSteps}
          icon="🪜"
          detail={
            !a.steps.hasSteps
              ? a.steps.ramp ? '단차 없음 · 경사로 완비' : '단차 없음'
              : [
                  a.steps.maxHeightCm != null && `최대 단차 ${a.steps.maxHeightCm}cm`,
                  a.steps.ramp ? '경사로 있음' : '경사로 없음',
                  a.steps.note,
                ].filter(Boolean).join(' · ')
          }
        />

        {/* 휠체어 */}
        <AccessibilityBadge
          label="휠체어 접근"
          value={a.wheelchair.accessible}
          icon="♿"
          detail={a.wheelchair.note}
        />

        {/* 장애인 화장실 */}
        <AccessibilityBadge
          label="장애인 화장실"
          value={a.toilet.available ? a.toilet.accessible : false}
          icon="🚻"
          detail={
            !a.toilet.available ? '화장실 정보 없음'
            : a.toilet.accessible ? '장애인 화장실 있음'
            : '장애인 화장실 없음'
          }
        />
      </div>

      {/* 범례 */}
      <div className="mx-5 mb-2 p-3 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"/> 가능</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"/> 부분</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"/> 불가</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400 inline-block"/> 미확인</div>
        </div>
      </div>

      {/* 메타 정보 */}
      <div className="px-5 pb-5 flex items-center gap-3 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Clock size={11} />
          <span>최종 업데이트: {location.lastUpdated}</span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <Database size={11} />
          <span>{SOURCE_LABELS[location.source]}</span>
        </div>
      </div>
    </div>
  );
}

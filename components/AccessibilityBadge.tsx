'use client';

import { WheelchairAccess } from '@/lib/types';

interface Props {
  label: string;
  value: boolean | 'yes' | 'limited' | 'no' | 'unknown';
  icon: string;
  detail?: string;
}

export default function AccessibilityBadge({ label, value, icon, detail }: Props) {
  const isPositive = value === true || value === 'yes';
  const isLimited = value === 'limited';
  const isNegative = value === false || value === 'no';

  const colorClass = isPositive
    ? 'bg-green-50 border-green-200 text-green-800'
    : isLimited
    ? 'bg-amber-50 border-amber-200 text-amber-800'
    : isNegative
    ? 'bg-red-50 border-red-200 text-red-800'
    : 'bg-gray-50 border-gray-200 text-gray-500';

  const dotColor = isPositive
    ? 'bg-green-500'
    : isLimited
    ? 'bg-amber-500'
    : isNegative
    ? 'bg-red-500'
    : 'bg-gray-400';

  const statusText = isPositive ? '가능' : isLimited ? '부분' : isNegative ? '불가' : '미확인';

  return (
    <div className={`border rounded-xl p-3 ${colorClass}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{icon}</span>
        <span className="text-xs font-semibold">{label}</span>
        <div className="ml-auto flex items-center gap-1">
          <span className={`inline-block w-2 h-2 rounded-full ${dotColor}`} />
          <span className="text-xs font-bold">{statusText}</span>
        </div>
      </div>
      {detail && <p className="text-xs mt-1 opacity-80 leading-relaxed">{detail}</p>}
    </div>
  );
}

export function WheelchairBadge({ value }: { value: WheelchairAccess }) {
  return (
    <AccessibilityBadge
      label="휠체어 접근"
      value={value}
      icon="♿"
    />
  );
}

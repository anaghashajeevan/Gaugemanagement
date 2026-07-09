// src/components/dashboard/KpiCard.tsx
// Unified KPI card used for all 8 dashboard status cards so every card shares
// the same size, padding, radius, and interaction — no more large/small split.

import type { ComponentType } from 'react';

interface Props {
  label: string;
  value: number;
  sub: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  accent: string; // Tailwind gradient stops, e.g. "from-indigo-500 to-violet-500"
  cardBg: string; // Tailwind gradient wash, e.g. "bg-gradient-to-br from-indigo-50/70 to-white"
  cardBorder: string; // e.g. "border-indigo-100/70"
  hoverBorder: string; // e.g. "hover:border-indigo-200"
  onClick?: () => void;
}

export default function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  cardBg,
  cardBorder,
  hoverBorder,
  onClick,
}: Props) {
  const clickable = !!onClick;

  return (
    <div
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') onClick?.();
            }
          : undefined
      }
      className={`${cardBg} rounded-2xl p-5 h-full shadow-sm border ${cardBorder} hover:shadow-md hover:-translate-y-0.5 ${hoverBorder} transition group relative overflow-hidden ${
        clickable ? 'cursor-pointer' : ''
      }`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${accent}`} />

      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold truncate">
            {label}
          </p>
          <p className="text-[32px] leading-tight font-bold text-gray-800 mt-2">{value}</p>
          <p className="text-xs text-gray-400 mt-1 truncate">{sub}</p>
        </div>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${accent} text-white shadow-md ring-4 ring-white/60 group-hover:scale-110 transition flex-shrink-0`}
        >
          <Icon className="w-6 h-6" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

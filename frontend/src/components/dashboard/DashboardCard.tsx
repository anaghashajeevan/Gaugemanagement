// src/components/dashboard/DashboardCard.tsx
// Shared card shell for dashboard sections (analytics charts, action center,
// recent calibrations) so every card uses the same radius, border, shadow,
// and header rhythm — fixes the "mismatched card heights" and "flat white
// cards everywhere" issues without touching any underlying data or logic.

import type { ComponentType, ReactNode } from 'react';

interface Props {
  title?: string;
  subtitle?: string;
  icon?: ComponentType<{ className?: string; strokeWidth?: number }>;
  tintBg?: string;
  tintText?: string;
  headerRight?: ReactNode;
  accentBar?: string; // optional Tailwind gradient stops for a thin top accent
  noPadding?: boolean;
  className?: string;
  children: ReactNode;
}

export default function DashboardCard({
  title,
  subtitle,
  icon: Icon,
  tintBg = 'bg-indigo-50',
  tintText = 'text-indigo-600',
  headerRight,
  accentBar,
  noPadding = false,
  className = '',
  children,
}: Props) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden ${className}`}
    >
      {accentBar && <div className={`h-1 bg-gradient-to-r ${accentBar} flex-shrink-0`} />}

      {title && (
        <div className={`flex-shrink-0 ${noPadding ? 'px-6 pt-5 pb-3' : 'px-6 pt-6'}`}>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 min-w-0">
              {Icon && (
                <span
                  className={`w-7 h-7 rounded-lg ${tintBg} ${tintText} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className="w-4 h-4" strokeWidth={2} />
                </span>
              )}
              <span className="truncate">{title}</span>
            </h3>
            {headerRight && <div className="flex-shrink-0">{headerRight}</div>}
          </div>
          {subtitle && (
            <p className={`text-xs text-gray-400 mt-1 ${Icon ? 'ml-9' : ''}`}>{subtitle}</p>
          )}
        </div>
      )}

      <div className={`flex-1 min-h-0 ${noPadding ? '' : 'p-6'} ${title && !noPadding ? 'pt-3' : ''}`}>
        {children}
      </div>
    </div>
  );
}

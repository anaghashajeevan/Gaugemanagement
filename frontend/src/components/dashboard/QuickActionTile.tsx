// src/components/dashboard/QuickActionTile.tsx

import type { ComponentType } from 'react';

interface Props {
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  tintBg: string;
  tintText: string;
  onClick: () => void;
}

export default function QuickActionTile({ label, icon: Icon, tintBg, tintText, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3.5 rounded-xl border border-gray-100 ${tintBg} hover:shadow-md hover:-translate-y-0.5 hover:border-gray-200 transition text-left group`}
    >
      <div
        className={`w-9 h-9 rounded-lg bg-white flex items-center justify-center mb-2 ${tintText} shadow-sm group-hover:scale-110 transition`}
      >
        <Icon className="w-4 h-4" strokeWidth={2} />
      </div>
      <p className="text-xs font-semibold text-gray-800">{label}</p>
    </button>
  );
}

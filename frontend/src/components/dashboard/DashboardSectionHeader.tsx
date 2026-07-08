// src/components/dashboard/DashboardSectionHeader.tsx

interface Props {
  title: string;
  subtitle?: string;
}

export default function DashboardSectionHeader({ title, subtitle }: Props) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span
        className="inline-block w-1 h-7 rounded-full flex-shrink-0"
        style={{ background: 'linear-gradient(180deg, #6366f1 0%, #a855f7 100%)' }}
      />
      <div>
        <h2 className="text-lg font-bold text-gray-800 leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

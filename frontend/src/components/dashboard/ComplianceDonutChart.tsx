// src/components/dashboard/ComplianceDonutChart.tsx

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldCheck } from 'lucide-react';
import type { ComplianceSummary } from '../../utils/dashboardAnalytics';

interface Props {
  summary: ComplianceSummary;
}

const SEGMENTS: { key: keyof ComplianceSummary; label: string; color: string }[] = [
  { key: 'upToDate', label: 'Up to Date', color: '#10b981' },
  { key: 'dueSoon', label: 'Due Soon', color: '#f59e0b' },
  { key: 'dueThisWeek', label: 'Due This Week', color: '#f97316' },
  { key: 'overdue', label: 'Overdue', color: '#ef4444' },
  { key: 'unknown', label: 'Unscheduled', color: '#9ca3af' },
];

export default function ComplianceDonutChart({ summary }: Props) {
  const data = SEGMENTS
    .map((s) => ({ name: s.label, value: summary[s.key] as number, color: s.color }))
    .filter((d) => d.value > 0);

  if (summary.totalActive === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[220px] text-center">
        <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-3">
          <ShieldCheck className="w-7 h-7 text-gray-300" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-semibold text-gray-500">No active gauges yet</p>
        <p className="text-xs text-gray-400 mt-1">Compliance data will appear once gauges are added.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="66%"
              outerRadius="92%"
              paddingAngle={data.length > 1 ? 2 : 0}
              stroke="none"
              isAnimationActive
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} gauge${value === 1 ? '' : 's'}`, name]}
              contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[28px] leading-none font-bold text-gray-800">
            {summary.compliancePct !== null ? `${summary.compliancePct}%` : '—'}
          </span>
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-1">
            Compliant
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center mt-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
            {d.name} <span className="font-semibold text-gray-700">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

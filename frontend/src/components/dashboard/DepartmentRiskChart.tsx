// src/components/dashboard/DepartmentRiskChart.tsx

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Building2 } from 'lucide-react';
import type { DepartmentRiskRow } from '../../utils/dashboardAnalytics';

interface Props {
  rows: DepartmentRiskRow[];
}

const SERIES: { key: keyof DepartmentRiskRow; name: string; color: string }[] = [
  { key: 'overdue', name: 'Overdue', color: '#ef4444' },
  { key: 'dueThisWeek', name: 'Due This Week', color: '#f97316' },
  { key: 'dueSoon', name: 'Due Soon', color: '#f59e0b' },
  { key: 'upToDate', name: 'Up to Date', color: '#10b981' },
];

export default function DepartmentRiskChart({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[260px] text-center">
        <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-3">
          <Building2 className="w-7 h-7 text-gray-300" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-semibold text-gray-500">No department data yet</p>
        <p className="text-xs text-gray-400 mt-1">Assign gauges to departments to see risk by area.</p>
      </div>
    );
  }

  const height = Math.max(200, rows.length * 56);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={rows}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
        barCategoryGap={12}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="department"
          width={116}
          tick={{ fontSize: 12, fill: '#374151' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: '#f5f3ff' }}
          contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
        />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" iconSize={8} />
        {SERIES.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.name} stackId="risk" fill={s.color} maxBarSize={16} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

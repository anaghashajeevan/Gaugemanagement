// src/components/dashboard/WorkloadBarChart.tsx

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CalendarClock } from 'lucide-react';
import type { WorkloadBucket } from '../../utils/dashboardAnalytics';

interface Props {
  buckets: WorkloadBucket[];
}

export default function WorkloadBarChart({ buckets }: Props) {
  const total = buckets.reduce((sum, b) => sum + b.count, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[260px] text-center">
        <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-3">
          <CalendarClock className="w-7 h-7 text-gray-300" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-semibold text-gray-500">No upcoming calibrations scheduled</p>
        <p className="text-xs text-gray-400 mt-1">Workload will appear once gauges have due dates.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={buckets} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          axisLine={{ stroke: '#e5e7eb' }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip
          cursor={{ fill: '#f5f3ff' }}
          formatter={(value) => [`${value} gauge${value === 1 ? '' : 's'}`, 'Due']}
          contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
        />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={44}>
          {buckets.map((b) => (
            <Cell key={b.key} fill={b.key === 'overdue' ? '#ef4444' : '#6366f1'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

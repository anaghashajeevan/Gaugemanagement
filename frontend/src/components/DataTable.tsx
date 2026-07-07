// src/components/DataTable.tsx

import { type ReactNode } from 'react';
import { Inbox } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  cell?: (row: T) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptySubtitle?: string;
  emptyIcon?: ReactNode;
  loading?: boolean;
  compact?: boolean;
}

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyTitle = 'No records found',
  emptySubtitle = 'Data will appear here once added.',
  emptyIcon,
  loading = false,
  compact = false,
}: Props<T>) {
  const cellPad = compact ? 'px-4 py-2.5' : 'px-4 py-3.5';

  const alignClass = (align?: string) => {
    if (align === 'center') return 'text-center';
    if (align === 'right') return 'text-right';
    return 'text-left';
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        {/* Head */}
        <thead>
          <tr
            style={{
              background:
                'linear-gradient(90deg, #f8f7ff 0%, #f5f3ff 100%)',
            }}
          >
            {columns.map((col, i) => (
              <th
                key={i}
                className={`${cellPad} text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 ${alignClass(col.align)}`}
                style={col.width ? { width: col.width } : {}}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-gray-50">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                  <span className="text-sm text-gray-400">Loading...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-14 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                    {emptyIcon ?? (
                      <Inbox className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500">{emptyTitle}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{emptySubtitle}</p>
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className={`transition bg-white ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-indigo-50/40'
                    : 'hover:bg-gray-50/60'
                }`}
              >
                {columns.map((col, i) => (
                  <td
                    key={i}
                    className={`${cellPad} text-gray-700 ${alignClass(col.align)}`}
                  >
                    {col.cell
                      ? col.cell(row)
                      : col.accessor
                      ? String(row[col.accessor] ?? '—')
                      : '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
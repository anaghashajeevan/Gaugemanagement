// // src/components/StatusBadge.tsx

// interface Props {
//   status: string;
//   size?: 'sm' | 'md';
// }

// const statusConfig: Record<
//   string,
//   { bg: string; text: string; dot: string; label?: string }
// > = {
//   // Gauge Status
//   Available:          { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
//   Issued:             { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500' },
//   'Under Calibration':{ bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500' },
//   Scrapped:           { bg: 'bg-gray-100',   text: 'text-gray-500',    dot: 'bg-gray-400' },

//   // Calibration / MSA Result
//   Pass:               { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
//   Fail:               { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-500' },
//   Borderline:         { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500' },

//   // CAPA / Issue
//   Open:               { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500' },
//   Closed:             { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
//   Returned:           { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },

//   // Due status
//   Overdue:            { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-500' },
//   'Due Soon':         { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500' },
//   'Up to Date':       { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },

//   // Types
//   Internal:           { bg: 'bg-indigo-50',  text: 'text-indigo-700',  dot: 'bg-indigo-500' },
//   External:           { bg: 'bg-purple-50',  text: 'text-purple-700',  dot: 'bg-purple-500' },
//   GRR:                { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500' },
//   Linearity:          { bg: 'bg-cyan-50',    text: 'text-cyan-700',    dot: 'bg-cyan-500' },
//   Bias:               { bg: 'bg-violet-50',  text: 'text-violet-700',  dot: 'bg-violet-500' },
//   Uncertainty:        { bg: 'bg-pink-50',    text: 'text-pink-700',    dot: 'bg-pink-500' },
// };

// const fallback = { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };

// export default function StatusBadge({ status, size = 'sm' }: Props) {
//   const config = statusConfig[status] ?? fallback;

//   const padding = size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-0.5 text-xs';

//   return (
//     <span
//       className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${padding} ${config.bg} ${config.text}`}
//     >
//       <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
//       {status}
//     </span>
//   );
// }

// src/components/StatusBadge.tsx

interface Props {
  status: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  // Gauge Status
  Available:            { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  Issued:               { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500' },
  'Under Calibration':  { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500' },
  'Under MSA Study':    { bg: 'bg-purple-50',  text: 'text-purple-700',  dot: 'bg-purple-500' },
  'Under Review':       { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-500' },
  Scrapped:             { bg: 'bg-gray-100',   text: 'text-gray-500',    dot: 'bg-gray-400' },

  // Calibration / MSA Result
  Pass:                 { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  Fail:                 { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-500' },
  Borderline:           { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500' },
  Failed:               { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-500' },

  // CAPA / Issue
  Open:                 { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500' },
  Closed:               { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  Returned:             { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },

  // Due status
  Overdue:              { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-500' },
  'Due Soon':           { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500' },
  'Up to Date':         { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },

  // Types
  Internal:             { bg: 'bg-indigo-50',  text: 'text-indigo-700',  dot: 'bg-indigo-500' },
  External:             { bg: 'bg-purple-50',  text: 'text-purple-700',  dot: 'bg-purple-500' },
  Calibration:          { bg: 'bg-indigo-50',  text: 'text-indigo-700',  dot: 'bg-indigo-500' },
  MSA:                  { bg: 'bg-purple-50',  text: 'text-purple-700',  dot: 'bg-purple-500' },
  GRR:                  { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500' },
  Linearity:            { bg: 'bg-cyan-50',    text: 'text-cyan-700',    dot: 'bg-cyan-500' },
  Bias:                 { bg: 'bg-violet-50',  text: 'text-violet-700',  dot: 'bg-violet-500' },
  Uncertainty:          { bg: 'bg-pink-50',    text: 'text-pink-700',    dot: 'bg-pink-500' },

  // MSA Study Status
  'Pending Measurements': { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500' },
  'In Progress':          { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500' },
  Completed:              { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  Pending:                { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500' },
};

const fallback = { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };

export default function StatusBadge({ status, size = 'sm' }: Props) {
  const config = statusConfig[status] ?? fallback;
  const padding = size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${padding} ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
      {status}
    </span>
  );
}
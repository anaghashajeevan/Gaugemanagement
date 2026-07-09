// // src/pages/GaugeHistory.tsx

// import { useState, useMemo } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import Layout from '../components/Layout';
// import DataTable, { type Column } from '../components/DataTable';
// import StatusBadge from '../components/StatusBadge';
// import {
//   gaugeStorage,
//   calibrationStorage,
//   msaStorage,
//   capaStorage,
//   issueReturnStorage,
//   standardStorage,
//   vendorStorage,
//   type Gauge,
//   type CalibrationRecord,
//   type MSAStudy,
//   type CAPA,
//   type IssueReturnLog,
// } from '../utils/storage';
// import {
//   ArrowLeft,
//   Gauge as GaugeIcon,
//   MapPin,
//   Ruler,
//   Calendar,
//   ClipboardCheck,
//   BarChart3,
//   AlertTriangle,
//   ArrowLeftRight,
//   Clock,
// } from 'lucide-react';

// type TabKey = 'calibration' | 'msa' | 'capa' | 'issueReturn';

// export default function GaugeHistory() {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();

//   const gauge = gaugeStorage.getById(id || '');
//   const [activeTab, setActiveTab] = useState<TabKey>('calibration');

//   const calibrations = useMemo(
//     () => (id ? calibrationStorage.getByGaugeId(id) : []),
//     [id]
//   );
//   const msaStudies = useMemo(
//     () => (id ? msaStorage.getByGaugeId(id) : []),
//     [id]
//   );
//   const capas = useMemo(
//     () => (id ? capaStorage.getByGaugeId(id) : []),
//     [id]
//   );
//   const issueLogs = useMemo(
//     () => (id ? issueReturnStorage.getByGaugeId(id) : []),
//     [id]
//   );

//   const standards = standardStorage.getAll();
//   const vendors = vendorStorage.getAll();

//   if (!gauge) {
//     return (
//       <Layout pageTitle="Gauge Not Found">
//         <div className="flex flex-col items-center justify-center py-20">
//           <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
//             <GaugeIcon className="w-10 h-10 text-gray-300" strokeWidth={1.5} />
//           </div>
//           <h3 className="text-lg font-semibold text-gray-600 mb-2">
//             Gauge not found
//           </h3>
//           <p className="text-sm text-gray-400 mb-6">
//             The gauge you're looking for doesn't exist.
//           </p>
//           <button
//             onClick={() => navigate('/gauges')}
//             className="px-5 py-2.5 text-white font-semibold rounded-xl shadow-md transition text-sm"
//             style={{
//               background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
//             }}
//           >
//             Back to Gauges
//           </button>
//         </div>
//       </Layout>
//     );
//   }

//   const getDueStatus = (dateStr: string) => {
//     if (!dateStr) return '';
//     const diff =
//       (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
//     if (diff < 0) return 'Overdue';
//     if (diff <= 30) return 'Due Soon';
//     return 'Up to Date';
//   };

//   const tabs: { key: TabKey; label: string; icon: typeof ClipboardCheck; count: number }[] = [
//     { key: 'calibration', label: 'Calibration History', icon: ClipboardCheck, count: calibrations.length },
//     { key: 'msa', label: 'MSA Studies', icon: BarChart3, count: msaStudies.length },
//     { key: 'capa', label: 'CAPA Records', icon: AlertTriangle, count: capas.length },
//     { key: 'issueReturn', label: 'Issue / Return', icon: ArrowLeftRight, count: issueLogs.length },
//   ];

//   // ─── Calibration Columns ──────────────────────────────────────────
//   const calCols: Column<CalibrationRecord>[] = [
//     { header: 'Date', accessor: 'date' },
//     {
//       header: 'Type',
//       cell: (row) => <StatusBadge status={row.type} />,
//     },
//     {
//       header: 'Standard / Vendor',
//       cell: (row) => {
//         if (row.type === 'Internal') {
//           const std = standards.find((s) => s.id === row.standardId);
//           return <span>{std?.standardCode || '—'}</span>;
//         }
//         const vendor = vendors.find((v) => v.id === row.vendorId);
//         return <span>{vendor?.name || '—'}</span>;
//       },
//     },
//     {
//       header: 'Result',
//       cell: (row) => <StatusBadge status={row.result} />,
//     },
//     { header: 'Technician', accessor: 'technician' },
//     { header: 'Next Due', accessor: 'nextDueDate' },
//   ];

//   // ─── MSA Columns ──────────────────────────────────────────────────
//   const msaCols: Column<MSAStudy>[] = [
//     { header: 'Date', accessor: 'date' },
//     {
//       header: 'Study Type',
//       cell: (row) => <StatusBadge status={row.studyType} />,
//     },
//     {
//       header: 'Operators',
//       cell: (row) => (
//         <span className="text-sm">{row.operators.join(', ')}</span>
//       ),
//     },
//     {
//       header: 'Result Value',
//       cell: (row) => (
//         <span className="font-semibold">{row.resultValue}%</span>
//       ),
//     },
//     {
//       header: 'Pass/Fail',
//       cell: (row) => <StatusBadge status={row.passFail} />,
//     },
//   ];

//   // ─── CAPA Columns ─────────────────────────────────────────────────
//   const capaCols: Column<CAPA>[] = [
//     {
//       header: 'Source',
//       cell: (row) => <StatusBadge status={row.sourceType} />,
//     },
//     { header: 'Root Cause', cell: (row) => (
//       <span className="truncate max-w-[200px] block">{row.rootCause}</span>
//     )},
//     { header: 'Responsible', accessor: 'responsiblePerson' },
//     { header: 'Target Date', accessor: 'targetDate' },
//     {
//       header: 'Status',
//       cell: (row) => <StatusBadge status={row.status} />,
//     },
//   ];

//   // ─── Issue/Return Columns ─────────────────────────────────────────
//   const irCols: Column<IssueReturnLog>[] = [
//     { header: 'Issued To', accessor: 'issuedTo' },
//     {
//       header: 'Issue Time',
//       cell: (row) =>
//         new Date(row.issueTimestamp).toLocaleString('en-IN'),
//     },
//     {
//       header: 'Return Time',
//       cell: (row) =>
//         row.returnTimestamp
//           ? new Date(row.returnTimestamp).toLocaleString('en-IN')
//           : '—',
//     },
//     {
//       header: 'Status',
//       cell: (row) => <StatusBadge status={row.status} />,
//     },
//   ];

//   // ─── Detail Items ─────────────────────────────────────────────────
//   const details = [
//     { label: 'Type', value: gauge.type, icon: GaugeIcon },
//     { label: 'Range', value: gauge.range, icon: Ruler },
//     { label: 'Least Count', value: gauge.leastCount, icon: Ruler },
//     { label: 'Department', value: gauge.department, icon: MapPin },
//     { label: 'Location', value: gauge.location, icon: MapPin },
//     { label: 'Frequency', value: `${gauge.frequencyMonths} months`, icon: Calendar },
//     { label: 'Last Calibration', value: gauge.lastCalibrationDate || '—', icon: ClipboardCheck },
//     { label: 'Next Due', value: gauge.nextDueDate || '—', icon: Clock },
//   ];

//   return (
//     <Layout pageTitle="Gauge History Card">
//       {/* Back Button */}
//       <button
//         onClick={() => navigate('/gauges')}
//         className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition mb-4"
//       >
//         <ArrowLeft className="w-4 h-4" strokeWidth={2} />
//         Back to Gauge Master
//       </button>

//       {/* ─── Gauge Header Card ───────────────────────────────────── */}
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
//         <div
//           className="h-1.5"
//           style={{
//             background:
//               'linear-gradient(90deg, #4338ca 0%, #7c3aed 25%, #a855f7 45%, #10b981 70%, #eab308 100%)',
//           }}
//         />
//         <div className="p-6">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
//             <div className="flex items-center gap-4">
//               <div
//                 className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md"
//                 style={{
//                   background:
//                     'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
//                 }}
//               >
//                 <GaugeIcon className="w-7 h-7" strokeWidth={2} />
//               </div>
//               <div>
//                 <div className="flex items-center gap-3">
//                   <h2 className="text-xl font-bold text-gray-900">
//                     {gauge.gaugeCode}
//                   </h2>
//                   <StatusBadge status={gauge.status} size="md" />
//                   {gauge.nextDueDate && (
//                     <StatusBadge
//                       status={getDueStatus(gauge.nextDueDate)}
//                       size="md"
//                     />
//                   )}
//                 </div>
//                 <p className="text-sm text-gray-500 mt-0.5">{gauge.name}</p>
//               </div>
//             </div>

//             <div className="flex gap-2">
//               <button
//                 onClick={() => navigate('/calibration')}
//                 className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl shadow-sm transition text-white hover:scale-105"
//                 style={{
//                   background:
//                     'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
//                 }}
//               >
//                 <ClipboardCheck className="w-4 h-4" strokeWidth={2} />
//                 Add Calibration
//               </button>
//               <button
//                 onClick={() => navigate('/msa')}
//                 className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition"
//               >
//                 <BarChart3 className="w-4 h-4" strokeWidth={2} />
//                 Add MSA Study
//               </button>
//             </div>
//           </div>

//           {/* Detail Grid */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             {details.map((d) => {
//               const Icon = d.icon;
//               return (
//                 <div
//                   key={d.label}
//                   className="bg-gray-50 rounded-xl p-3 flex items-start gap-3"
//                 >
//                   <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
//                     <Icon
//                       className="w-4 h-4 text-indigo-500"
//                       strokeWidth={2}
//                     />
//                   </div>
//                   <div className="min-w-0">
//                     <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
//                       {d.label}
//                     </p>
//                     <p className="text-sm font-semibold text-gray-800 truncate">
//                       {d.value}
//                     </p>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>

//       {/* ─── Tabs ─────────────────────────────────────────────────── */}
//       <div className="flex gap-1 mb-4 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100 w-fit">
//         {tabs.map((tab) => {
//           const Icon = tab.icon;
//           const active = activeTab === tab.key;
//           return (
//             <button
//               key={tab.key}
//               onClick={() => setActiveTab(tab.key)}
//               className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
//                 active
//                   ? 'text-white shadow-md'
//                   : 'text-gray-600 hover:bg-gray-50'
//               }`}
//               style={
//                 active
//                   ? {
//                       background:
//                         'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
//                     }
//                   : {}
//               }
//             >
//               <Icon className="w-4 h-4" strokeWidth={2} />
//               {tab.label}
//               <span
//                 className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
//                   active
//                     ? 'bg-white/20 text-white'
//                     : 'bg-gray-100 text-gray-500'
//                 }`}
//               >
//                 {tab.count}
//               </span>
//             </button>
//           );
//         })}
//       </div>

//       {/* ─── Tab Content ──────────────────────────────────────────── */}
//       {activeTab === 'calibration' && (
//         <DataTable
//           columns={calCols}
//           data={calibrations}
//           keyExtractor={(r) => r.id}
//           emptyTitle="No calibration records"
//           emptySubtitle="Calibration history will appear here."
//           emptyIcon={<ClipboardCheck className="w-8 h-8 text-gray-300" strokeWidth={1.5} />}
//         />
//       )}

//       {activeTab === 'msa' && (
//         <DataTable
//           columns={msaCols}
//           data={msaStudies}
//           keyExtractor={(r) => r.id}
//           emptyTitle="No MSA studies"
//           emptySubtitle="MSA study results will appear here."
//           emptyIcon={<BarChart3 className="w-8 h-8 text-gray-300" strokeWidth={1.5} />}
//         />
//       )}

//       {activeTab === 'capa' && (
//         <DataTable
//           columns={capaCols}
//           data={capas}
//           keyExtractor={(r) => r.id}
//           emptyTitle="No CAPA records"
//           emptySubtitle="Corrective actions for this gauge will appear here."
//           emptyIcon={<AlertTriangle className="w-8 h-8 text-gray-300" strokeWidth={1.5} />}
//         />
//       )}

//       {activeTab === 'issueReturn' && (
//         <DataTable
//           columns={irCols}
//           data={issueLogs}
//           keyExtractor={(r) => r.id}
//           emptyTitle="No issue/return records"
//           emptySubtitle="Issue and return history will appear here."
//           emptyIcon={<ArrowLeftRight className="w-8 h-8 text-gray-300" strokeWidth={1.5} />}
//         />
//       )}
//     </Layout>
//   );
// }


// src/pages/GaugeHistory.tsx

import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import DataTable, { type Column } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import {
  gaugeStorage,
  calibrationStorage,
  msaStorage,
  capaStorage,
  issueReturnStorage,
  standardStorage,
  vendorStorage,
  type CalibrationRecord,
  type MSAStudy,
  type CAPA,
  type IssueReturnLog,
} from '../utils/storage';
import {
  ArrowLeft,
  Gauge as GaugeIcon,
  MapPin,
  Ruler,
  Calendar,
  ClipboardCheck,
  BarChart3,
  AlertTriangle,
  ArrowLeftRight,
  Clock,
} from 'lucide-react';

type TabKey = 'calibration' | 'msa' | 'capa' | 'issueReturn';

export default function GaugeHistory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const gauge = gaugeStorage.getById(id || '');
  const [activeTab, setActiveTab] = useState<TabKey>('calibration');

  const calibrations = useMemo(
    () => (id ? calibrationStorage.getByGaugeId(id) : []),
    [id]
  );
  const msaStudies = useMemo(
    () => (id ? msaStorage.getByGaugeId(id) : []),
    [id]
  );
  const capas = useMemo(
    () => (id ? capaStorage.getByGaugeId(id) : []),
    [id]
  );
  const issueLogs = useMemo(
    () => (id ? issueReturnStorage.getByGaugeId(id) : []),
    [id]
  );

  const standards = standardStorage.getAll();
  const vendors = vendorStorage.getAll();

  if (!gauge) {
    return (
       <Layout pageTitle="Gauge Not Found" pageSubtitle="The requested gauge record could not be located" pageIcon={AlertTriangle}>

        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <GaugeIcon className="w-10 h-10 text-gray-300" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Gauge not found</h3>
          <p className="text-sm text-gray-400 mb-6">
            The gauge you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate('/gauges')}
            className="px-5 py-2.5 text-white font-semibold rounded-xl shadow-md transition text-sm"
            style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }}
          >
            Back to Gauges
          </button>
        </div>
      </Layout>
    );
  }

  const getDueStatus = (dateStr: string) => {
    if (!dateStr) return '';
    const diff =
      (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return 'Overdue';
    if (diff <= 30) return 'Due Soon';
    return 'Up to Date';
  };

  const tabs: {
    key: TabKey;
    label: string;
    icon: typeof ClipboardCheck;
    count: number;
  }[] = [
    { key: 'calibration', label: 'Calibration History', icon: ClipboardCheck, count: calibrations.length },
    { key: 'msa', label: 'MSA Studies', icon: BarChart3, count: msaStudies.length },
    { key: 'capa', label: 'CAPA Records', icon: AlertTriangle, count: capas.length },
    { key: 'issueReturn', label: 'Issue / Return', icon: ArrowLeftRight, count: issueLogs.length },
  ];

  // ─── Calibration Columns ─────────────────────────────────────────
  // Use cell instead of accessor to avoid type errors
  const calCols: Column<CalibrationRecord>[] = [
    {
      header: 'Date',
      cell: (row) => <span>{row.date}</span>,
    },
    {
      header: 'Type',
      cell: (row) => <StatusBadge status={row.type} />,
    },
    {
      header: 'Standard / Vendor',
      cell: (row) => {
        if (row.type === 'Internal') {
          const std = standards.find((s) => s.id === row.standardId);
          return <span>{std?.standardCode || '—'}</span>;
        }
        const vendor = vendors.find((v) => v.id === row.vendorId);
        return <span>{vendor?.name || '—'}</span>;
      },
    },
    {
      header: 'Result',
      cell: (row) => <StatusBadge status={row.result} />,
    },
    {
      header: 'Technician',
      cell: (row) => <span>{row.technician}</span>,
    },
    {
      header: 'Next Due',
      cell: (row) => <span>{row.nextDueDate}</span>,
    },
  ];

  // ─── MSA Columns ─────────────────────────────────────────────────
  // Fixed: use createdDate not date, operatorNames not operators,
  //        handle optional resultValue and passFail
    // ─── MSA Columns (with real result values) ────────────────────────
  const formatMSAResult = (r: MSAStudy) => {
    if (r.resultValue === undefined) return '—';
    if (r.studyType === 'GRR') return `${r.grrPercent?.toFixed(2)}%`;
    if (r.studyType === 'Uncertainty') return `±${r.expandedUncertainty?.toFixed(4)}`;
    if (r.studyType === 'Bias') return r.biasValue?.toFixed(4);
    if (r.studyType === 'Linearity') return `Max: ${r.linearityMaxBias?.toFixed(4)}`;
    return String(r.resultValue);
  };

  const msaCols: Column<MSAStudy>[] = [
    { header: 'Date', cell: (row) => <span>{row.createdDate}</span> },
    { header: 'Study Type', cell: (row) => <StatusBadge status={row.studyType} /> },
    {
      header: 'Operators',
      cell: (row) => (
        <span className="text-sm">{row.operatorNames.join(', ')}</span>
      ),
    },
    {
      header: 'Config',
      cell: (row) => (
        <span className="text-sm text-gray-500">
          {row.parts.length} parts × {row.numberOfTrials} trials
        </span>
      ),
    },
    {
      header: 'Result',
      cell: (row) => (
        <span className="font-semibold font-mono text-sm">{formatMSAResult(row)}</span>
      ),
    },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Pass/Fail',
      cell: (row) => row.passFail ? <StatusBadge status={row.passFail} /> : <span className="text-xs text-gray-400">—</span>,
    },
  ];

  // ─── CAPA Columns ─────────────────────────────────────────────────
  const capaCols: Column<CAPA>[] = [
    {
      header: 'Source',
      cell: (row) => <StatusBadge status={row.sourceType} />,
    },
    {
      header: 'Root Cause',
      cell: (row) => (
        <span className="truncate max-w-[200px] block text-sm">
          {row.rootCause}
        </span>
      ),
    },
    {
      header: 'Responsible',
      cell: (row) => <span>{row.responsiblePerson}</span>,
    },
    {
      header: 'Target Date',
      cell: (row) => <span>{row.targetDate}</span>,
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ];

  // ─── Issue/Return Columns ─────────────────────────────────────────
  const irCols: Column<IssueReturnLog>[] = [
    {
      header: 'Issued To',
      cell: (row) => <span>{row.issuedTo}</span>,
    },
    {
      header: 'Issue Time',
      cell: (row) => (
        <span>{new Date(row.issueTimestamp).toLocaleString('en-IN')}</span>
      ),
    },
    {
      header: 'Return Time',
      cell: (row) => (
        <span>
          {row.returnTimestamp
            ? new Date(row.returnTimestamp).toLocaleString('en-IN')
            : '—'}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ];

  // ─── Detail Items ─────────────────────────────────────────────────
  const details = [
    { label: 'Type', value: gauge.type, icon: GaugeIcon },
    { label: 'Range', value: gauge.range, icon: Ruler },
    { label: 'Least Count', value: gauge.leastCount, icon: Ruler },
    { label: 'Department', value: gauge.department, icon: MapPin },
    { label: 'Location', value: gauge.location, icon: MapPin },
    { label: 'Frequency', value: `${gauge.frequencyMonths} months`, icon: Calendar },
    { label: 'Last Calibration', value: gauge.lastCalibrationDate || '—', icon: ClipboardCheck },
    { label: 'Next Due', value: gauge.nextDueDate || '—', icon: Clock },
  ];

  const dueStatus = gauge.nextDueDate ? getDueStatus(gauge.nextDueDate) : '';

  return (
    <Layout pageTitle="Gauge History Card" pageSubtitle="Complete calibration and usage history for this gauge" pageIcon={Clock}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/gauges')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition mb-4"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        Back to Gauge Master
      </button>

      {/* ─── Gauge Header Card ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div
          className="h-1.5"
          style={{
            background:
              'linear-gradient(90deg, #4338ca 0%, #7c3aed 25%, #a855f7 45%, #10b981 70%, #eab308 100%)',
          }}
        />
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              {gauge.image ? (
                <img
                  src={gauge.image}
                  alt={gauge.name}
                  className="w-14 h-14 rounded-2xl object-contain bg-white shadow-md border border-gray-100"
                />
              ) : (
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  }}
                >
                  <GaugeIcon className="w-7 h-7" strokeWidth={2} />
                </div>
              )}
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl font-bold text-gray-900">
                    {gauge.gaugeCode}
                  </h2>
                  <StatusBadge status={gauge.status} size="md" />
                  {dueStatus && <StatusBadge status={dueStatus} size="md" />}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{gauge.name}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigate('/calibration')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl shadow-sm transition text-white hover:scale-105"
                style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }}
              >
                <ClipboardCheck className="w-4 h-4" strokeWidth={2} />
                Add Calibration
              </button>
              <button
                onClick={() => navigate('/msa')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition"
              >
                <BarChart3 className="w-4 h-4" strokeWidth={2} />
                Add MSA Study
              </button>
            </div>
          </div>

          {/* Detail Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {details.map((d) => {
              const Icon = d.icon;
              return (
                <div
                  key={d.label}
                  className="bg-gray-50 rounded-xl p-3 flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-indigo-500" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                      {d.label}
                    </p>
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {d.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Tabs ─────────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-4 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                active ? 'text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={
                active
                  ? { background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }
                  : {}
              }
            >
              <Icon className="w-4 h-4" strokeWidth={2} />
              {tab.label}
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                  active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── Tab Content ──────────────────────────────────────────── */}
      {activeTab === 'calibration' && (
        <DataTable
          columns={calCols}
          data={calibrations}
          keyExtractor={(r) => r.id}
          emptyTitle="No calibration records"
          emptySubtitle="Calibration history will appear here."
          emptyIcon={
            <ClipboardCheck className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
          }
        />
      )}

      {activeTab === 'msa' && (
        <DataTable
          columns={msaCols}
          data={msaStudies}
          keyExtractor={(r) => r.id}
          emptyTitle="No MSA studies"
          emptySubtitle="MSA study results will appear here."
          emptyIcon={
            <BarChart3 className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
          }
        />
      )}

      {activeTab === 'capa' && (
        <DataTable
          columns={capaCols}
          data={capas}
          keyExtractor={(r) => r.id}
          emptyTitle="No CAPA records"
          emptySubtitle="Corrective actions for this gauge will appear here."
          emptyIcon={
            <AlertTriangle className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
          }
        />
      )}

      {activeTab === 'issueReturn' && (
        <DataTable
          columns={irCols}
          data={issueLogs}
          keyExtractor={(r) => r.id}
          emptyTitle="No issue/return records"
          emptySubtitle="Issue and return history will appear here."
          emptyIcon={
            <ArrowLeftRight className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
          }
        />
      )}
    </Layout>
  );
}
// // src/pages/Reports.tsx

// import { useState, useMemo } from 'react';
// import Layout from '../components/Layout';
// import DataTable, { type Column } from '../components/DataTable';
// import StatusBadge from '../components/StatusBadge';
// import {
//   gaugeStorage,
//   calibrationStorage,
//   msaStorage,
//   capaStorage,
//   issueReturnStorage,
//   type Gauge,
//   type CalibrationRecord,
//   type MSAStudy,
//   type CAPA,
//   type IssueReturnLog,
// } from '../utils/storage';
// import {
//   FileText,
//   Download,
//   Filter,
//   Calendar,
//   BarChart3,
// } from 'lucide-react';

// type ReportType =
//   | 'due_overdue'
//   | 'calibration_history'
//   | 'failed_calibrations'
//   | 'failed_msa'
//   | 'open_capa'
//   | 'issue_log'
//   | 'gauge_status';

// const REPORT_OPTIONS: { value: ReportType; label: string }[] = [
//   { value: 'gauge_status', label: 'Gauge Status Summary' },
//   { value: 'due_overdue', label: 'Due / Overdue Gauges' },
//   { value: 'calibration_history', label: 'Calibration History' },
//   { value: 'failed_calibrations', label: 'Failed Calibrations' },
//   { value: 'failed_msa', label: 'Failed MSA Studies' },
//   { value: 'open_capa', label: 'Open CAPAs' },
//   { value: 'issue_log', label: 'Issue / Return Log' },
// ];

// export default function Reports() {
//   const [reportType, setReportType] = useState<ReportType>('gauge_status');
//   const [filterDept, setFilterDept] = useState('');
//   const [dateFrom, setDateFrom] = useState('');
//   const [dateTo, setDateTo] = useState('');

//   const allGauges = gaugeStorage.getAll();
//   const allCalibrations = calibrationStorage.getAll();
//   const allMSA = msaStorage.getAll();
//   const allCAPAs = capaStorage.getAll();
//   const allIssues = issueReturnStorage.getAll();

//   const departments = [...new Set(allGauges.map((g) => g.department).filter(Boolean))];

//   // ─── Date filter helper ───────────────────────────────────────────
//   const inDateRange = (dateStr: string) => {
//     if (!dateStr) return true;
//     const d = new Date(dateStr).getTime();
//     if (dateFrom && d < new Date(dateFrom).getTime()) return false;
//     if (dateTo && d > new Date(dateTo + 'T23:59:59').getTime()) return false;
//     return true;
//   };

//   const deptFilter = (dept: string) => {
//     if (!filterDept) return true;
//     return dept === filterDept;
//   };

//   // ─── Report Data ──────────────────────────────────────────────────
//   const getDueStatus = (dateStr: string) => {
//     if (!dateStr) return 'Unknown';
//     const diff =
//       (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
//     if (diff < 0) return 'Overdue';
//     if (diff <= 30) return 'Due Soon';
//     return 'Up to Date';
//   };

//   // Gauge Status
//   const gaugeStatusData = useMemo(
//     () => allGauges.filter((g) => deptFilter(g.department)),
//     [allGauges, filterDept]
//   );

//   // Due / Overdue
//   const dueOverdueData = useMemo(
//     () =>
//       allGauges
//         .filter(
//           (g) =>
//             deptFilter(g.department) &&
//             g.status !== 'Scrapped' &&
//             ['Overdue', 'Due Soon'].includes(getDueStatus(g.nextDueDate))
//         )
//         .sort(
//           (a, b) =>
//             new Date(a.nextDueDate).getTime() -
//             new Date(b.nextDueDate).getTime()
//         ),
//     [allGauges, filterDept]
//   );

//   // Calibration History
//   const calHistoryData = useMemo(
//     () =>
//       allCalibrations
//         .filter((c) => {
//           const g = allGauges.find((x) => x.id === c.gaugeId);
//           return inDateRange(c.date) && deptFilter(g?.department || '');
//         })
//         .sort(
//           (a, b) =>
//             new Date(b.date).getTime() - new Date(a.date).getTime()
//         ),
//     [allCalibrations, allGauges, dateFrom, dateTo, filterDept]
//   );

//   // Failed Calibrations
//   const failedCalData = useMemo(
//     () => calHistoryData.filter((c) => c.result === 'Fail'),
//     [calHistoryData]
//   );

//   // Failed MSA
//   const failedMSAData = useMemo(
//     () =>
//       allMSA
//         .filter((m) => {
//           const g = allGauges.find((x) => x.id === m.gaugeId);
//           return (
//             m.passFail === 'Fail' &&
//             inDateRange(m.date) &&
//             deptFilter(g?.department || '')
//           );
//         })
//         .sort(
//           (a, b) =>
//             new Date(b.date).getTime() - new Date(a.date).getTime()
//         ),
//     [allMSA, allGauges, dateFrom, dateTo, filterDept]
//   );

//   // Open CAPAs
//   const openCapaData = useMemo(
//     () =>
//       allCAPAs
//         .filter((c) => {
//           const g = allGauges.find((x) => x.id === c.gaugeId);
//           return c.status === 'Open' && deptFilter(g?.department || '');
//         })
//         .sort(
//           (a, b) =>
//             new Date(a.targetDate).getTime() -
//             new Date(b.targetDate).getTime()
//         ),
//     [allCAPAs, allGauges, filterDept]
//   );

//   // Issue Log
//   const issueLogData = useMemo(
//     () =>
//       allIssues
//         .filter((i) => {
//           const g = allGauges.find((x) => x.id === i.gaugeId);
//           return (
//             inDateRange(i.issueTimestamp.split('T')[0]) &&
//             deptFilter(g?.department || '')
//           );
//         })
//         .sort(
//           (a, b) =>
//             new Date(b.issueTimestamp).getTime() -
//             new Date(a.issueTimestamp).getTime()
//         ),
//     [allIssues, allGauges, dateFrom, dateTo, filterDept]
//   );

//   // ─── CSV Export ───────────────────────────────────────────────────
//   const exportCSV = () => {
//     let headers: string[] = [];
//     let rows: string[][] = [];

//     switch (reportType) {
//       case 'gauge_status':
//         headers = ['Gauge Code', 'Name', 'Type', 'Department', 'Status', 'Next Due'];
//         rows = gaugeStatusData.map((g) => [g.gaugeCode, g.name, g.type, g.department, g.status, g.nextDueDate]);
//         break;
//       case 'due_overdue':
//         headers = ['Gauge Code', 'Name', 'Department', 'Next Due', 'Status'];
//         rows = dueOverdueData.map((g) => [g.gaugeCode, g.name, g.department, g.nextDueDate, getDueStatus(g.nextDueDate)]);
//         break;
//       case 'calibration_history':
//       case 'failed_calibrations':
//         headers = ['Date', 'Gauge Code', 'Type', 'Result', 'Technician', 'Next Due'];
//         const calData = reportType === 'failed_calibrations' ? failedCalData : calHistoryData;
//         rows = calData.map((c) => {
//           const g = allGauges.find((x) => x.id === c.gaugeId);
//           return [c.date, g?.gaugeCode || '', c.type, c.result, c.technician, c.nextDueDate];
//         });
//         break;
//       case 'failed_msa':
//         headers = ['Date', 'Gauge Code', 'Study Type', 'Result Value', 'Pass/Fail'];
//         rows = failedMSAData.map((m) => {
//           const g = allGauges.find((x) => x.id === m.gaugeId);
//           return [m.date, g?.gaugeCode || '', m.studyType, String(m.resultValue), m.passFail];
//         });
//         break;
//       case 'open_capa':
//         headers = ['Gauge Code', 'Source', 'Root Cause', 'Responsible', 'Target Date'];
//         rows = openCapaData.map((c) => {
//           const g = allGauges.find((x) => x.id === c.gaugeId);
//           return [g?.gaugeCode || '', c.sourceType, c.rootCause, c.responsiblePerson, c.targetDate];
//         });
//         break;
//       case 'issue_log':
//         headers = ['Gauge Code', 'Issued To', 'Issue Time', 'Return Time', 'Status'];
//         rows = issueLogData.map((i) => {
//           const g = allGauges.find((x) => x.id === i.gaugeId);
//           return [
//             g?.gaugeCode || '',
//             i.issuedTo,
//             new Date(i.issueTimestamp).toLocaleString('en-IN'),
//             i.returnTimestamp ? new Date(i.returnTimestamp).toLocaleString('en-IN') : '',
//             i.status,
//           ];
//         });
//         break;
//     }

//     const csvContent =
//       [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
//     link.click();
//     URL.revokeObjectURL(url);
//   };

//   // ─── Column Definitions ───────────────────────────────────────────
//   const gaugeStatusCols: Column<Gauge>[] = [
//     { header: 'Gauge Code', cell: (r) => <span className="font-bold text-indigo-600">{r.gaugeCode}</span> },
//     { header: 'Name', accessor: 'name' },
//     { header: 'Type', accessor: 'type' },
//     { header: 'Department', accessor: 'department' },
//     { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
//     {
//       header: 'Due Status',
//       cell: (r) => {
//         const s = getDueStatus(r.nextDueDate);
//         return (
//           <div className="flex items-center gap-2">
//             <span className="text-sm">{r.nextDueDate || '—'}</span>
//             {r.status !== 'Scrapped' && <StatusBadge status={s} />}
//           </div>
//         );
//       },
//     },
//   ];

//   const dueOverdueCols: Column<Gauge>[] = [
//     { header: 'Gauge Code', cell: (r) => <span className="font-bold text-indigo-600">{r.gaugeCode}</span> },
//     { header: 'Name', accessor: 'name' },
//     { header: 'Department', accessor: 'department' },
//     { header: 'Next Due', accessor: 'nextDueDate' },
//     { header: 'Status', cell: (r) => <StatusBadge status={getDueStatus(r.nextDueDate)} /> },
//   ];

//   const calCols: Column<CalibrationRecord>[] = [
//     { header: 'Date', accessor: 'date' },
//     {
//       header: 'Gauge',
//       cell: (r) => {
//         const g = allGauges.find((x) => x.id === r.gaugeId);
//         return <span className="font-bold text-indigo-600">{g?.gaugeCode || '—'}</span>;
//       },
//     },
//     { header: 'Type', cell: (r) => <StatusBadge status={r.type} /> },
//     { header: 'Result', cell: (r) => <StatusBadge status={r.result} /> },
//     { header: 'Technician', accessor: 'technician' },
//     { header: 'Next Due', accessor: 'nextDueDate' },
//   ];

//   const msaCols: Column<MSAStudy>[] = [
//     { header: 'Date', accessor: 'date' },
//     {
//       header: 'Gauge',
//       cell: (r) => {
//         const g = allGauges.find((x) => x.id === r.gaugeId);
//         return <span className="font-bold text-indigo-600">{g?.gaugeCode || '—'}</span>;
//       },
//     },
//     { header: 'Study Type', cell: (r) => <StatusBadge status={r.studyType} /> },
//     { header: 'Result', cell: (r) => <span className="font-mono font-bold">{r.resultValue}</span> },
//     { header: 'Pass/Fail', cell: (r) => <StatusBadge status={r.passFail} /> },
//   ];

//   const capaCols: Column<CAPA>[] = [
//     {
//       header: 'Gauge',
//       cell: (r) => {
//         const g = allGauges.find((x) => x.id === r.gaugeId);
//         return <span className="font-bold text-indigo-600">{g?.gaugeCode || '—'}</span>;
//       },
//     },
//     { header: 'Source', cell: (r) => <StatusBadge status={r.sourceType} /> },
//     { header: 'Root Cause', cell: (r) => <span className="truncate max-w-[200px] block">{r.rootCause}</span> },
//     { header: 'Responsible', accessor: 'responsiblePerson' },
//     {
//       header: 'Target Date',
//       cell: (r) => {
//         const overdue = new Date(r.targetDate) < new Date();
//         return (
//           <div className="flex items-center gap-2">
//             <span>{r.targetDate}</span>
//             {overdue && <StatusBadge status="Overdue" />}
//           </div>
//         );
//       },
//     },
//   ];

//   const issueCols: Column<IssueReturnLog>[] = [
//     {
//       header: 'Gauge',
//       cell: (r) => {
//         const g = allGauges.find((x) => x.id === r.gaugeId);
//         return <span className="font-bold text-indigo-600">{g?.gaugeCode || '—'}</span>;
//       },
//     },
//     { header: 'Issued To', accessor: 'issuedTo' },
//     { header: 'Issued', cell: (r) => new Date(r.issueTimestamp).toLocaleDateString('en-IN') },
//     {
//       header: 'Returned',
//       cell: (r) => (r.returnTimestamp ? new Date(r.returnTimestamp).toLocaleDateString('en-IN') : '—'),
//     },
//     { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
//   ];

//   // ─── Render Table based on type ───────────────────────────────────
//   const renderTable = () => {
//     switch (reportType) {
//       case 'gauge_status':
//         return (
//           <DataTable columns={gaugeStatusCols} data={gaugeStatusData} keyExtractor={(r) => r.id}
//             emptyTitle="No gauges found" emptySubtitle="No data matches the selected filters." />
//         );
//       case 'due_overdue':
//         return (
//           <DataTable columns={dueOverdueCols} data={dueOverdueData} keyExtractor={(r) => r.id}
//             emptyTitle="No overdue or due gauges" emptySubtitle="All gauges are up to date!" />
//         );
//       case 'calibration_history':
//         return (
//           <DataTable columns={calCols} data={calHistoryData} keyExtractor={(r) => r.id}
//             emptyTitle="No calibration records" emptySubtitle="No data matches the selected filters." />
//         );
//       case 'failed_calibrations':
//         return (
//           <DataTable columns={calCols} data={failedCalData} keyExtractor={(r) => r.id}
//             emptyTitle="No failed calibrations" emptySubtitle="Great — all calibrations passed!" />
//         );
//       case 'failed_msa':
//         return (
//           <DataTable columns={msaCols} data={failedMSAData} keyExtractor={(r) => r.id}
//             emptyTitle="No failed MSA studies" emptySubtitle="All MSA studies passed!" />
//         );
//       case 'open_capa':
//         return (
//           <DataTable columns={capaCols} data={openCapaData} keyExtractor={(r) => r.id}
//             emptyTitle="No open CAPAs" emptySubtitle="All CAPAs are closed!" />
//         );
//       case 'issue_log':
//         return (
//           <DataTable columns={issueCols} data={issueLogData} keyExtractor={(r) => r.id}
//             emptyTitle="No issue/return records" emptySubtitle="No data matches the selected filters." />
//         );
//     }
//   };

//   const recordCount = () => {
//     switch (reportType) {
//       case 'gauge_status': return gaugeStatusData.length;
//       case 'due_overdue': return dueOverdueData.length;
//       case 'calibration_history': return calHistoryData.length;
//       case 'failed_calibrations': return failedCalData.length;
//       case 'failed_msa': return failedMSAData.length;
//       case 'open_capa': return openCapaData.length;
//       case 'issue_log': return issueLogData.length;
//     }
//   };

//   return (
//     <Layout pageTitle="Reports">
//       {/* ─── Filter Bar ───────────────────────────────────────────── */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6 overflow-hidden relative">
//         <div
//           className="absolute top-0 left-0 right-0 h-1"
//           style={{
//             background:
//               'linear-gradient(90deg, #4338ca 0%, #7c3aed 25%, #a855f7 45%, #10b981 70%, #eab308 100%)',
//           }}
//         />

//         <div className="flex flex-wrap items-end gap-4">
//           {/* Report Type */}
//           <div className="flex-1 min-w-[200px]">
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Report Type
//             </label>
//             <div className="relative">
//               <BarChart3
//                 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
//                 strokeWidth={2}
//               />
//               <select
//                 value={reportType}
//                 onChange={(e) => setReportType(e.target.value as ReportType)}
//                 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
//               >
//                 {REPORT_OPTIONS.map((o) => (
//                   <option key={o.value} value={o.value}>
//                     {o.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Department */}
//           <div className="min-w-[180px]">
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Department
//             </label>
//             <div className="relative">
//               <Filter
//                 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
//                 strokeWidth={2}
//               />
//               <select
//                 value={filterDept}
//                 onChange={(e) => setFilterDept(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
//               >
//                 <option value="">All Departments</option>
//                 {departments.map((d) => (
//                   <option key={d} value={d}>
//                     {d}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Date From */}
//           <div className="min-w-[150px]">
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Date From
//             </label>
//             <div className="relative">
//               <Calendar
//                 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
//                 strokeWidth={2}
//               />
//               <input
//                 type="date"
//                 value={dateFrom}
//                 onChange={(e) => setDateFrom(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//               />
//             </div>
//           </div>

//           {/* Date To */}
//           <div className="min-w-[150px]">
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Date To
//             </label>
//             <div className="relative">
//               <Calendar
//                 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
//                 strokeWidth={2}
//               />
//               <input
//                 type="date"
//                 value={dateTo}
//                 onChange={(e) => setDateTo(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//               />
//             </div>
//           </div>

//           {/* Export */}
//           <button
//             onClick={exportCSV}
//             className="flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition text-sm"
//             style={{
//               background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
//             }}
//           >
//             <Download className="w-4 h-4" strokeWidth={2.5} />
//             Export CSV
//           </button>
//         </div>
//       </div>

//       {/* ─── Result Header ────────────────────────────────────────── */}
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center gap-2">
//           <span
//             className="inline-block w-1 h-6 rounded-full"
//             style={{
//               background:
//                 'linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%)',
//             }}
//           />
//           <h3 className="text-lg font-bold text-gray-800">
//             {REPORT_OPTIONS.find((o) => o.value === reportType)?.label}
//           </h3>
//           <span className="ml-2 px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full">
//             {recordCount()} records
//           </span>
//         </div>
//       </div>

//       {/* ─── Table ────────────────────────────────────────────────── */}
//       {renderTable()}
//     </Layout>
//   );
// }


// src/pages/Reports.tsx

// import { useState, useMemo } from 'react';
// import Layout from '../components/Layout';
// import DataTable, { type Column } from '../components/DataTable';
// import StatusBadge from '../components/StatusBadge';
// import {
//   gaugeStorage,
//   calibrationStorage,
//   msaStorage,
//   capaStorage,
//   issueReturnStorage,
//   type Gauge,
//   type CalibrationRecord,
//   type MSAStudy,
//   type CAPA,
//   type IssueReturnLog,
// } from '../utils/storage';
// import {
//   Download,
//   Filter,
//   Calendar,
//   BarChart3,
// } from 'lucide-react';

// type ReportType =
//   | 'due_overdue'
//   | 'calibration_history'
//   | 'failed_calibrations'
//   | 'failed_msa'
//   | 'open_capa'
//   | 'issue_log'
//   | 'gauge_status';

// const REPORT_OPTIONS: { value: ReportType; label: string }[] = [
//   { value: 'gauge_status', label: 'Gauge Status Summary' },
//   { value: 'due_overdue', label: 'Due / Overdue Gauges' },
//   { value: 'calibration_history', label: 'Calibration History' },
//   { value: 'failed_calibrations', label: 'Failed Calibrations' },
//   { value: 'failed_msa', label: 'Failed MSA Studies' },
//   { value: 'open_capa', label: 'Open CAPAs' },
//   { value: 'issue_log', label: 'Issue / Return Log' },
// ];

// export default function Reports() {
//   const [reportType, setReportType] = useState<ReportType>('gauge_status');
//   const [filterDept, setFilterDept] = useState('');
//   const [dateFrom, setDateFrom] = useState('');
//   const [dateTo, setDateTo] = useState('');

//   const allGauges = gaugeStorage.getAll();
//   const allCalibrations = calibrationStorage.getAll();
//   const allMSA = msaStorage.getAll();
//   const allCAPAs = capaStorage.getAll();
//   const allIssues = issueReturnStorage.getAll();

//   const departments = [
//     ...new Set(allGauges.map((g) => g.department).filter(Boolean)),
//   ];

//   const inDateRange = (dateStr: string) => {
//     if (!dateStr) return true;
//     const d = new Date(dateStr).getTime();
//     if (dateFrom && d < new Date(dateFrom).getTime()) return false;
//     if (dateTo && d > new Date(dateTo + 'T23:59:59').getTime()) return false;
//     return true;
//   };

//   const deptFilter = (dept: string) => {
//     if (!filterDept) return true;
//     return dept === filterDept;
//   };

//   const getDueStatus = (dateStr: string) => {
//     if (!dateStr) return 'Unknown';
//     const diff =
//       (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
//     if (diff < 0) return 'Overdue';
//     if (diff <= 30) return 'Due Soon';
//     return 'Up to Date';
//   };

//   // ─── Report Data ──────────────────────────────────────────────────

//   const gaugeStatusData = useMemo(
//     () => allGauges.filter((g) => deptFilter(g.department)),
//     [allGauges, filterDept]
//   );

//   const dueOverdueData = useMemo(
//     () =>
//       allGauges
//         .filter(
//           (g) =>
//             deptFilter(g.department) &&
//             g.status !== 'Scrapped' &&
//             ['Overdue', 'Due Soon'].includes(getDueStatus(g.nextDueDate))
//         )
//         .sort(
//           (a, b) =>
//             new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime()
//         ),
//     [allGauges, filterDept]
//   );

//   const calHistoryData = useMemo(
//     () =>
//       allCalibrations
//         .filter((c) => {
//           const g = allGauges.find((x) => x.id === c.gaugeId);
//           return inDateRange(c.date) && deptFilter(g?.department || '');
//         })
//         .sort(
//           (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
//         ),
//     [allCalibrations, allGauges, dateFrom, dateTo, filterDept]
//   );

//   const failedCalData = useMemo(
//     () => calHistoryData.filter((c) => c.result === 'Fail'),
//     [calHistoryData]
//   );

//   // Fixed: use createdDate not date
//   const failedMSAData = useMemo(
//     () =>
//       allMSA
//         .filter((m) => {
//           const g = allGauges.find((x) => x.id === m.gaugeId);
//           return (
//             m.passFail === 'Fail' &&
//             inDateRange(m.createdDate) &&
//             deptFilter(g?.department || '')
//           );
//         })
//         .sort(
//           (a, b) =>
//             new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
//         ),
//     [allMSA, allGauges, dateFrom, dateTo, filterDept]
//   );

//   const openCapaData = useMemo(
//     () =>
//       allCAPAs
//         .filter((c) => {
//           const g = allGauges.find((x) => x.id === c.gaugeId);
//           return c.status === 'Open' && deptFilter(g?.department || '');
//         })
//         .sort(
//           (a, b) =>
//             new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
//         ),
//     [allCAPAs, allGauges, filterDept]
//   );

//   const issueLogData = useMemo(
//     () =>
//       allIssues
//         .filter((i) => {
//           const g = allGauges.find((x) => x.id === i.gaugeId);
//           return (
//             inDateRange(i.issueTimestamp.split('T')[0]) &&
//             deptFilter(g?.department || '')
//           );
//         })
//         .sort(
//           (a, b) =>
//             new Date(b.issueTimestamp).getTime() -
//             new Date(a.issueTimestamp).getTime()
//         ),
//     [allIssues, allGauges, dateFrom, dateTo, filterDept]
//   );

//   // ─── CSV Export ───────────────────────────────────────────────────
//   const exportCSV = () => {
//     let headers: string[] = [];
//     let rows: string[][] = [];

//     switch (reportType) {
//       case 'gauge_status':
//         headers = ['Gauge Code', 'Name', 'Type', 'Department', 'Status', 'Next Due'];
//         rows = gaugeStatusData.map((g) => [
//           g.gaugeCode, g.name, g.type, g.department, g.status, g.nextDueDate,
//         ]);
//         break;

//       case 'due_overdue':
//         headers = ['Gauge Code', 'Name', 'Department', 'Next Due', 'Status'];
//         rows = dueOverdueData.map((g) => [
//           g.gaugeCode, g.name, g.department, g.nextDueDate, getDueStatus(g.nextDueDate),
//         ]);
//         break;

//       case 'calibration_history':
//       case 'failed_calibrations': {
//         headers = ['Date', 'Gauge Code', 'Type', 'Result', 'Technician', 'Next Due'];
//         const calData =
//           reportType === 'failed_calibrations' ? failedCalData : calHistoryData;
//         rows = calData.map((c) => {
//           const g = allGauges.find((x) => x.id === c.gaugeId);
//           return [c.date, g?.gaugeCode || '', c.type, c.result, c.technician, c.nextDueDate];
//         });
//         break;
//       }

//       case 'failed_msa':
//         headers = ['Date', 'Gauge Code', 'Study Type', 'Result Value', 'Pass/Fail'];
//         rows = failedMSAData.map((m) => {
//           const g = allGauges.find((x) => x.id === m.gaugeId);
//           return [
//             m.createdDate,
//             g?.gaugeCode || '',
//             m.studyType,
//             m.resultValue !== undefined ? String(m.resultValue) : '',
//             m.passFail || '',
//           ];
//         });
//         break;

//       case 'open_capa':
//         headers = ['Gauge Code', 'Source', 'Root Cause', 'Responsible', 'Target Date'];
//         rows = openCapaData.map((c) => {
//           const g = allGauges.find((x) => x.id === c.gaugeId);
//           return [
//             g?.gaugeCode || '', c.sourceType, c.rootCause,
//             c.responsiblePerson, c.targetDate,
//           ];
//         });
//         break;

//       case 'issue_log':
//         headers = ['Gauge Code', 'Issued To', 'Issue Time', 'Return Time', 'Status'];
//         rows = issueLogData.map((i) => {
//           const g = allGauges.find((x) => x.id === i.gaugeId);
//           return [
//             g?.gaugeCode || '',
//             i.issuedTo,
//             new Date(i.issueTimestamp).toLocaleString('en-IN'),
//             i.returnTimestamp
//               ? new Date(i.returnTimestamp).toLocaleString('en-IN')
//               : '',
//             i.status,
//           ];
//         });
//         break;
//     }

//     const csvContent = [
//       headers.join(','),
//       ...rows.map((r) => r.map((c) => `"${c}"`).join(',')),
//     ].join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
//     link.click();
//     URL.revokeObjectURL(url);
//   };

//   // ─── Column Definitions ───────────────────────────────────────────
//   // Rule: NEVER use accessor for MSA/optional fields. Always use cell.

//   const gaugeStatusCols: Column<Gauge>[] = [
//     {
//       header: 'Gauge Code',
//       cell: (r) => <span className="font-bold text-indigo-600">{r.gaugeCode}</span>,
//     },
//     { header: 'Name', cell: (r) => <span>{r.name}</span> },
//     { header: 'Type', cell: (r) => <span>{r.type}</span> },
//     { header: 'Department', cell: (r) => <span>{r.department}</span> },
//     { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
//     {
//       header: 'Due Status',
//       cell: (r) => {
//         const s = getDueStatus(r.nextDueDate);
//         return (
//           <div className="flex items-center gap-2">
//             <span className="text-sm">{r.nextDueDate || '—'}</span>
//             {r.status !== 'Scrapped' && s !== 'Unknown' && (
//               <StatusBadge status={s} />
//             )}
//           </div>
//         );
//       },
//     },
//   ];

//   const dueOverdueCols: Column<Gauge>[] = [
//     {
//       header: 'Gauge Code',
//       cell: (r) => <span className="font-bold text-indigo-600">{r.gaugeCode}</span>,
//     },
//     { header: 'Name', cell: (r) => <span>{r.name}</span> },
//     { header: 'Department', cell: (r) => <span>{r.department}</span> },
//     { header: 'Next Due', cell: (r) => <span>{r.nextDueDate}</span> },
//     {
//       header: 'Status',
//       cell: (r) => <StatusBadge status={getDueStatus(r.nextDueDate)} />,
//     },
//   ];

//   const calCols: Column<CalibrationRecord>[] = [
//     { header: 'Date', cell: (r) => <span>{r.date}</span> },
//     {
//       header: 'Gauge',
//       cell: (r) => {
//         const g = allGauges.find((x) => x.id === r.gaugeId);
//         return (
//           <span className="font-bold text-indigo-600">{g?.gaugeCode || '—'}</span>
//         );
//       },
//     },
//     { header: 'Type', cell: (r) => <StatusBadge status={r.type} /> },
//     { header: 'Result', cell: (r) => <StatusBadge status={r.result} /> },
//     { header: 'Technician', cell: (r) => <span>{r.technician}</span> },
//     { header: 'Next Due', cell: (r) => <span>{r.nextDueDate}</span> },
//   ];

//   // Fixed: createdDate, operatorNames, optional resultValue, optional passFail
//   const msaCols: Column<MSAStudy>[] = [
//     {
//       header: 'Date',
//       cell: (r) => <span>{r.createdDate}</span>,
//     },
//     {
//       header: 'Gauge',
//       cell: (r) => {
//         const g = allGauges.find((x) => x.id === r.gaugeId);
//         return (
//           <span className="font-bold text-indigo-600">{g?.gaugeCode || '—'}</span>
//         );
//       },
//     },
//     {
//       header: 'Study Type',
//       cell: (r) => <StatusBadge status={r.studyType} />,
//     },
//     {
//       header: 'Operators',
//       cell: (r) => (
//         <span className="text-sm text-gray-600">
//           {r.operatorNames.join(', ')}
//         </span>
//       ),
//     },
//     {
//       header: 'Result',
//       cell: (r) => (
//         <span className="font-mono font-bold">
//           {r.resultValue !== undefined && r.resultValue !== null
//             ? r.studyType === 'GRR'
//               ? `${r.resultValue}%`
//               : String(r.resultValue)
//             : '—'}
//         </span>
//       ),
//     },
//     {
//       header: 'Pass/Fail',
//       cell: (r) =>
//         r.passFail ? (
//           <StatusBadge status={r.passFail} />
//         ) : (
//           <span className="text-xs text-gray-400">Pending</span>
//         ),
//     },
//   ];

//   const capaCols: Column<CAPA>[] = [
//     {
//       header: 'Gauge',
//       cell: (r) => {
//         const g = allGauges.find((x) => x.id === r.gaugeId);
//         return (
//           <span className="font-bold text-indigo-600">{g?.gaugeCode || '—'}</span>
//         );
//       },
//     },
//     { header: 'Source', cell: (r) => <StatusBadge status={r.sourceType} /> },
//     {
//       header: 'Root Cause',
//       cell: (r) => (
//         <span className="truncate max-w-[200px] block text-sm">{r.rootCause}</span>
//       ),
//     },
//     { header: 'Responsible', cell: (r) => <span>{r.responsiblePerson}</span> },
//     {
//       header: 'Target Date',
//       cell: (r) => {
//         const overdue =
//           r.status === 'Open' && new Date(r.targetDate) < new Date();
//         return (
//           <div className="flex items-center gap-2">
//             <span>{r.targetDate}</span>
//             {overdue && <StatusBadge status="Overdue" />}
//           </div>
//         );
//       },
//     },
//     { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
//   ];

//   const issueCols: Column<IssueReturnLog>[] = [
//     {
//       header: 'Gauge',
//       cell: (r) => {
//         const g = allGauges.find((x) => x.id === r.gaugeId);
//         return (
//           <span className="font-bold text-indigo-600">{g?.gaugeCode || '—'}</span>
//         );
//       },
//     },
//     { header: 'Issued To', cell: (r) => <span>{r.issuedTo}</span> },
//     {
//       header: 'Issued',
//       cell: (r) => (
//         <span>{new Date(r.issueTimestamp).toLocaleDateString('en-IN')}</span>
//       ),
//     },
//     {
//       header: 'Returned',
//       cell: (r) => (
//         <span>
//           {r.returnTimestamp
//             ? new Date(r.returnTimestamp).toLocaleDateString('en-IN')
//             : '—'}
//         </span>
//       ),
//     },
//     { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
//   ];

//   // ─── Render Table ─────────────────────────────────────────────────
//   const renderTable = () => {
//     switch (reportType) {
//       case 'gauge_status':
//         return (
//           <DataTable
//             columns={gaugeStatusCols}
//             data={gaugeStatusData}
//             keyExtractor={(r) => r.id}
//             emptyTitle="No gauges found"
//             emptySubtitle="No data matches the selected filters."
//           />
//         );
//       case 'due_overdue':
//         return (
//           <DataTable
//             columns={dueOverdueCols}
//             data={dueOverdueData}
//             keyExtractor={(r) => r.id}
//             emptyTitle="No overdue or due gauges"
//             emptySubtitle="All gauges are up to date!"
//           />
//         );
//       case 'calibration_history':
//         return (
//           <DataTable
//             columns={calCols}
//             data={calHistoryData}
//             keyExtractor={(r) => r.id}
//             emptyTitle="No calibration records"
//             emptySubtitle="No data matches the selected filters."
//           />
//         );
//       case 'failed_calibrations':
//         return (
//           <DataTable
//             columns={calCols}
//             data={failedCalData}
//             keyExtractor={(r) => r.id}
//             emptyTitle="No failed calibrations"
//             emptySubtitle="All calibrations passed!"
//           />
//         );
//       case 'failed_msa':
//         return (
//           <DataTable
//             columns={msaCols}
//             data={failedMSAData}
//             keyExtractor={(r) => r.id}
//             emptyTitle="No failed MSA studies"
//             emptySubtitle="All MSA studies passed!"
//           />
//         );
//       case 'open_capa':
//         return (
//           <DataTable
//             columns={capaCols}
//             data={openCapaData}
//             keyExtractor={(r) => r.id}
//             emptyTitle="No open CAPAs"
//             emptySubtitle="All CAPAs are closed!"
//           />
//         );
//       case 'issue_log':
//         return (
//           <DataTable
//             columns={issueCols}
//             data={issueLogData}
//             keyExtractor={(r) => r.id}
//             emptyTitle="No issue/return records"
//             emptySubtitle="No data matches the selected filters."
//           />
//         );
//     }
//   };

//   const recordCount = () => {
//     switch (reportType) {
//       case 'gauge_status': return gaugeStatusData.length;
//       case 'due_overdue': return dueOverdueData.length;
//       case 'calibration_history': return calHistoryData.length;
//       case 'failed_calibrations': return failedCalData.length;
//       case 'failed_msa': return failedMSAData.length;
//       case 'open_capa': return openCapaData.length;
//       case 'issue_log': return issueLogData.length;
//     }
//   };

//   return (
//     <Layout pageTitle="Reports">
//       {/* ─── Filter Bar ───────────────────────────────────────────── */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6 overflow-hidden relative">
//         <div
//           className="absolute top-0 left-0 right-0 h-1"
//           style={{
//             background:
//               'linear-gradient(90deg, #4338ca 0%, #7c3aed 25%, #a855f7 45%, #10b981 70%, #eab308 100%)',
//           }}
//         />

//         <div className="flex flex-wrap items-end gap-4">
//           {/* Report Type */}
//           <div className="flex-1 min-w-[200px]">
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Report Type
//             </label>
//             <div className="relative">
//               <BarChart3
//                 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
//                 strokeWidth={2}
//               />
//               <select
//                 value={reportType}
//                 onChange={(e) => setReportType(e.target.value as ReportType)}
//                 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
//               >
//                 {REPORT_OPTIONS.map((o) => (
//                   <option key={o.value} value={o.value}>
//                     {o.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Department */}
//           <div className="min-w-[180px]">
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Department
//             </label>
//             <div className="relative">
//               <Filter
//                 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
//                 strokeWidth={2}
//               />
//               <select
//                 value={filterDept}
//                 onChange={(e) => setFilterDept(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
//               >
//                 <option value="">All Departments</option>
//                 {departments.map((d) => (
//                   <option key={d} value={d}>
//                     {d}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Date From */}
//           <div className="min-w-[150px]">
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Date From
//             </label>
//             <div className="relative">
//               <Calendar
//                 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
//                 strokeWidth={2}
//               />
//               <input
//                 type="date"
//                 value={dateFrom}
//                 onChange={(e) => setDateFrom(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//               />
//             </div>
//           </div>

//           {/* Date To */}
//           <div className="min-w-[150px]">
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Date To
//             </label>
//             <div className="relative">
//               <Calendar
//                 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
//                 strokeWidth={2}
//               />
//               <input
//                 type="date"
//                 value={dateTo}
//                 onChange={(e) => setDateTo(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//               />
//             </div>
//           </div>

//           {/* Export */}
//           <button
//             onClick={exportCSV}
//             className="flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition text-sm"
//             style={{
//               background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
//             }}
//           >
//             <Download className="w-4 h-4" strokeWidth={2.5} />
//             Export CSV
//           </button>
//         </div>
//       </div>

//       {/* ─── Result Header ────────────────────────────────────────── */}
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center gap-2">
//           <span
//             className="inline-block w-1 h-6 rounded-full"
//             style={{
//               background: 'linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%)',
//             }}
//           />
//           <h3 className="text-lg font-bold text-gray-800">
//             {REPORT_OPTIONS.find((o) => o.value === reportType)?.label}
//           </h3>
//           <span className="ml-2 px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full">
//             {recordCount()} records
//           </span>
//         </div>
//       </div>

//       {/* ─── Table ────────────────────────────────────────────────── */}
//       {renderTable()}
//     </Layout>
//   );
// }


// src/pages/Reports.tsx

import { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import DataTable, { type Column } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import {
  gaugeStorage,
  calibrationStorage,
  msaStorage,
  capaStorage,
  issueReturnStorage,
  type Gauge,
  type CalibrationRecord,
  type MSAStudy,
  type CAPA,
  type IssueReturnLog,
} from '../utils/storage';
import { Download, Filter, Calendar, BarChart3, FileText } from 'lucide-react';

type ReportType =
  | 'due_overdue'
  | 'calibration_history'
  | 'failed_calibrations'
  | 'all_msa'
  | 'failed_msa'
  | 'open_capa'
  | 'issue_log'
  | 'gauge_status';

const REPORT_OPTIONS: { value: ReportType; label: string }[] = [
  { value: 'gauge_status', label: 'Gauge Status Summary' },
  { value: 'due_overdue', label: 'Due / Overdue Gauges' },
  { value: 'calibration_history', label: 'Calibration History' },
  { value: 'failed_calibrations', label: 'Failed Calibrations' },
  { value: 'all_msa', label: 'All MSA Studies' },
  { value: 'failed_msa', label: 'Failed MSA Studies' },
  { value: 'open_capa', label: 'Open CAPAs' },
  { value: 'issue_log', label: 'Issue / Return Log' },
];

export default function Reports() {
  const [reportType, setReportType] = useState<ReportType>('gauge_status');
  const [filterDept, setFilterDept] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const allGauges = gaugeStorage.getAll();
  const allCalibrations = calibrationStorage.getAll();
  const allMSA = msaStorage.getAll();
  const allCAPAs = capaStorage.getAll();
  const allIssues = issueReturnStorage.getAll();

  const departments = [...new Set(allGauges.map((g) => g.department).filter(Boolean))];

  const inDateRange = (dateStr: string) => {
    if (!dateStr) return true;
    const d = new Date(dateStr).getTime();
    if (dateFrom && d < new Date(dateFrom).getTime()) return false;
    if (dateTo && d > new Date(dateTo + 'T23:59:59').getTime()) return false;
    return true;
  };

  const deptFilter = (dept: string) => !filterDept || dept === filterDept;

  const getDueStatus = (dateStr: string) => {
    if (!dateStr) return 'Unknown';
    const diff = (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return 'Overdue';
    if (diff <= 30) return 'Due Soon';
    return 'Up to Date';
  };

  const formatMSAResult = (m: MSAStudy) => {
    if (m.resultValue === undefined) return '—';
    if (m.studyType === 'GRR') return `${m.grrPercent?.toFixed(2)}%`;
    if (m.studyType === 'Uncertainty') return `±${m.expandedUncertainty?.toFixed(4)}`;
    if (m.studyType === 'Bias') return m.biasValue?.toFixed(4);
    if (m.studyType === 'Linearity') return `Max: ${m.linearityMaxBias?.toFixed(4)}`;
    return String(m.resultValue);
  };

  // ─── Data ─────────────────────────────────────────────────────────
  const gaugeStatusData = useMemo(() => allGauges.filter((g) => deptFilter(g.department)), [allGauges, filterDept]);
  const dueOverdueData = useMemo(() => allGauges
    .filter((g) => deptFilter(g.department) && g.status !== 'Scrapped' && ['Overdue', 'Due Soon'].includes(getDueStatus(g.nextDueDate)))
    .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime()),
    [allGauges, filterDept]);

  const calHistoryData = useMemo(() => allCalibrations
    .filter((c) => {
      const g = allGauges.find((x) => x.id === c.gaugeId);
      return inDateRange(c.date) && deptFilter(g?.department || '');
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [allCalibrations, allGauges, dateFrom, dateTo, filterDept]);

  const failedCalData = useMemo(() => calHistoryData.filter((c) => c.result === 'Fail'), [calHistoryData]);

  const allMSAData = useMemo(() => allMSA
    .filter((m) => {
      const g = allGauges.find((x) => x.id === m.gaugeId);
      return inDateRange(m.createdDate) && deptFilter(g?.department || '');
    })
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()),
    [allMSA, allGauges, dateFrom, dateTo, filterDept]);

  const failedMSAData = useMemo(() => allMSAData.filter((m) => m.passFail === 'Fail'), [allMSAData]);

  const openCapaData = useMemo(() => allCAPAs
    .filter((c) => {
      const g = allGauges.find((x) => x.id === c.gaugeId);
      return c.status === 'Open' && deptFilter(g?.department || '');
    })
    .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()),
    [allCAPAs, allGauges, filterDept]);

  const issueLogData = useMemo(() => allIssues
    .filter((i) => {
      const g = allGauges.find((x) => x.id === i.gaugeId);
      return inDateRange(i.issueTimestamp.split('T')[0]) && deptFilter(g?.department || '');
    })
    .sort((a, b) => new Date(b.issueTimestamp).getTime() - new Date(a.issueTimestamp).getTime()),
    [allIssues, allGauges, dateFrom, dateTo, filterDept]);

  // ─── CSV Export ───────────────────────────────────────────────────
    // ─── CSV Export ───────────────────────────────────────────────────
  const exportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    // Helper — ensures every cell is always a string
    const str = (v: unknown): string => {
      if (v === null || v === undefined) return '';
      return String(v);
    };

    switch (reportType) {
      case 'gauge_status':
        headers = ['Gauge Code', 'Name', 'Type', 'Department', 'Location', 'Status', 'Next Due'];
        rows = gaugeStatusData.map((g) => [
          str(g.gaugeCode),
          str(g.name),
          str(g.type),
          str(g.department),
          str(g.location),
          str(g.status),
          str(g.nextDueDate),
        ]);
        break;

      case 'due_overdue':
        headers = ['Gauge Code', 'Name', 'Department', 'Next Due', 'Days Overdue'];
        rows = dueOverdueData.map((g) => {
          const daysOver = Math.floor(
            (Date.now() - new Date(g.nextDueDate).getTime()) / (1000 * 60 * 60 * 24)
          );
          return [
            str(g.gaugeCode),
            str(g.name),
            str(g.department),
            str(g.nextDueDate),
            str(daysOver),
          ];
        });
        break;

      case 'calibration_history':
      case 'failed_calibrations': {
        headers = ['Date', 'Gauge Code', 'Type', 'Result', 'Technician', 'Next Due'];
        const data = reportType === 'failed_calibrations' ? failedCalData : calHistoryData;
        rows = data.map((c) => {
          const g = allGauges.find((x) => x.id === c.gaugeId);
          return [
            str(c.date),
            str(g?.gaugeCode),
            str(c.type),
            str(c.result),
            str(c.technician),
            str(c.nextDueDate),
          ];
        });
        break;
      }

      case 'all_msa':
      case 'failed_msa': {
        headers = ['Date', 'Gauge Code', 'Study Type', 'Operators', 'Result Value', 'Pass/Fail', 'Status'];
        const data = reportType === 'failed_msa' ? failedMSAData : allMSAData;
        rows = data.map((m) => {
          const g = allGauges.find((x) => x.id === m.gaugeId);
          return [
            str(m.createdDate),
            str(g?.gaugeCode),
            str(m.studyType),
            str(m.operatorNames.join('; ')),
            str(formatMSAResult(m)),
            str(m.passFail || 'Pending'),
            str(m.status),
          ];
        });
        break;
      }

      case 'open_capa':
        headers = ['Gauge Code', 'Source', 'Root Cause', 'Responsible', 'Target Date', 'Days Overdue'];
        rows = openCapaData.map((c) => {
          const g = allGauges.find((x) => x.id === c.gaugeId);
          const overdueDays = Math.floor(
            (Date.now() - new Date(c.targetDate).getTime()) / (1000 * 60 * 60 * 24)
          );
          return [
            str(g?.gaugeCode),
            str(c.sourceType),
            str(c.rootCause),
            str(c.responsiblePerson),
            str(c.targetDate),
            str(overdueDays > 0 ? overdueDays : 0),
          ];
        });
        break;

      case 'issue_log':
        headers = ['Gauge Code', 'Issued To', 'Issue Time', 'Return Time', 'Status'];
        rows = issueLogData.map((i) => {
          const g = allGauges.find((x) => x.id === i.gaugeId);
          return [
            str(g?.gaugeCode),
            str(i.issuedTo),
            str(new Date(i.issueTimestamp).toLocaleString('en-IN')),
            str(i.returnTimestamp ? new Date(i.returnTimestamp).toLocaleString('en-IN') : ''),
            str(i.status),
          ];
        });
        break;
    }

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ─── Columns ──────────────────────────────────────────────────────
  const gaugeStatusCols: Column<Gauge>[] = [
    { header: 'Gauge Code', cell: (r) => <span className="font-bold text-indigo-600">{r.gaugeCode}</span> },
    { header: 'Name', cell: (r) => <span>{r.name}</span> },
    { header: 'Type', cell: (r) => <span>{r.type}</span> },
    { header: 'Department', cell: (r) => <span>{r.department}</span> },
    { header: 'Location', cell: (r) => <span className="text-sm">{r.location || '—'}</span> },
    { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
    {
      header: 'Due Status',
      cell: (r) => {
        const s = getDueStatus(r.nextDueDate);
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm">{r.nextDueDate || '—'}</span>
            {r.status !== 'Scrapped' && s !== 'Unknown' && <StatusBadge status={s} />}
          </div>
        );
      },
    },
  ];

  const dueOverdueCols: Column<Gauge>[] = [
    { header: 'Gauge Code', cell: (r) => <span className="font-bold text-indigo-600">{r.gaugeCode}</span> },
    { header: 'Name', cell: (r) => <span>{r.name}</span> },
    { header: 'Department', cell: (r) => <span>{r.department}</span> },
    { header: 'Next Due', cell: (r) => <span>{r.nextDueDate}</span> },
    { header: 'Status', cell: (r) => <StatusBadge status={getDueStatus(r.nextDueDate)} /> },
  ];

  const calCols: Column<CalibrationRecord>[] = [
    { header: 'Date', cell: (r) => <span>{r.date}</span> },
    {
      header: 'Gauge',
      cell: (r) => {
        const g = allGauges.find((x) => x.id === r.gaugeId);
        return <span className="font-bold text-indigo-600">{g?.gaugeCode || '—'}</span>;
      },
    },
    { header: 'Type', cell: (r) => <StatusBadge status={r.type} /> },
    { header: 'Result', cell: (r) => <StatusBadge status={r.result} /> },
    { header: 'Technician', cell: (r) => <span>{r.technician}</span> },
    { header: 'Next Due', cell: (r) => <span>{r.nextDueDate}</span> },
  ];

  const msaCols: Column<MSAStudy>[] = [
    { header: 'Date', cell: (r) => <span>{r.createdDate}</span> },
    {
      header: 'Gauge',
      cell: (r) => {
        const g = allGauges.find((x) => x.id === r.gaugeId);
        return <span className="font-bold text-indigo-600">{g?.gaugeCode || '—'}</span>;
      },
    },
    { header: 'Study Type', cell: (r) => <StatusBadge status={r.studyType} /> },
    {
      header: 'Operators',
      cell: (r) => <span className="text-xs text-gray-500">{r.operatorNames.slice(0, 2).join(', ')}{r.operatorNames.length > 2 ? '...' : ''}</span>,
    },
    { header: 'Result', cell: (r) => <span className="font-mono font-bold text-sm">{formatMSAResult(r)}</span> },
    { header: 'Pass/Fail', cell: (r) => r.passFail ? <StatusBadge status={r.passFail} /> : <span className="text-gray-400 text-xs">Pending</span> },
    { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
  ];

  const capaCols: Column<CAPA>[] = [
    {
      header: 'Gauge',
      cell: (r) => {
        const g = allGauges.find((x) => x.id === r.gaugeId);
        return <span className="font-bold text-indigo-600">{g?.gaugeCode || '—'}</span>;
      },
    },
    { header: 'Source', cell: (r) => <StatusBadge status={r.sourceType} /> },
    { header: 'Root Cause', cell: (r) => <span className="truncate max-w-[200px] block">{r.rootCause}</span> },
    { header: 'Responsible', cell: (r) => <span>{r.responsiblePerson}</span> },
    {
      header: 'Target Date',
      cell: (r) => {
        const overdue = r.status === 'Open' && new Date(r.targetDate) < new Date();
        return (
          <div className="flex items-center gap-2">
            <span>{r.targetDate}</span>
            {overdue && <StatusBadge status="Overdue" />}
          </div>
        );
      },
    },
    { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
  ];

  const issueCols: Column<IssueReturnLog>[] = [
    {
      header: 'Gauge',
      cell: (r) => {
        const g = allGauges.find((x) => x.id === r.gaugeId);
        return <span className="font-bold text-indigo-600">{g?.gaugeCode || '—'}</span>;
      },
    },
    { header: 'Issued To', cell: (r) => <span>{r.issuedTo}</span> },
    { header: 'Issued', cell: (r) => <span>{new Date(r.issueTimestamp).toLocaleDateString('en-IN')}</span> },
    { header: 'Returned', cell: (r) => <span>{r.returnTimestamp ? new Date(r.returnTimestamp).toLocaleDateString('en-IN') : '—'}</span> },
    { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
  ];

  const renderTable = () => {
    switch (reportType) {
      case 'gauge_status': return <DataTable columns={gaugeStatusCols} data={gaugeStatusData} keyExtractor={(r) => r.id} emptyTitle="No gauges found" emptySubtitle="No data matches filters." />;
      case 'due_overdue': return <DataTable columns={dueOverdueCols} data={dueOverdueData} keyExtractor={(r) => r.id} emptyTitle="No overdue or due gauges" emptySubtitle="All gauges are up to date!" />;
      case 'calibration_history': return <DataTable columns={calCols} data={calHistoryData} keyExtractor={(r) => r.id} emptyTitle="No calibration records" emptySubtitle="No data matches filters." />;
      case 'failed_calibrations': return <DataTable columns={calCols} data={failedCalData} keyExtractor={(r) => r.id} emptyTitle="No failed calibrations" emptySubtitle="All calibrations passed!" />;
      case 'all_msa': return <DataTable columns={msaCols} data={allMSAData} keyExtractor={(r) => r.id} emptyTitle="No MSA studies" emptySubtitle="No data matches filters." />;
      case 'failed_msa': return <DataTable columns={msaCols} data={failedMSAData} keyExtractor={(r) => r.id} emptyTitle="No failed MSA studies" emptySubtitle="All MSA studies passed!" />;
      case 'open_capa': return <DataTable columns={capaCols} data={openCapaData} keyExtractor={(r) => r.id} emptyTitle="No open CAPAs" emptySubtitle="All CAPAs are closed!" />;
      case 'issue_log': return <DataTable columns={issueCols} data={issueLogData} keyExtractor={(r) => r.id} emptyTitle="No issue/return records" emptySubtitle="No data matches filters." />;
    }
  };

  const recordCount = () => {
    switch (reportType) {
      case 'gauge_status': return gaugeStatusData.length;
      case 'due_overdue': return dueOverdueData.length;
      case 'calibration_history': return calHistoryData.length;
      case 'failed_calibrations': return failedCalData.length;
      case 'all_msa': return allMSAData.length;
      case 'failed_msa': return failedMSAData.length;
      case 'open_capa': return openCapaData.length;
      case 'issue_log': return issueLogData.length;
    }
  };

  return (
   <Layout pageTitle="Reports" pageSubtitle="Generate and export reports across gauges, calibration, and quality data" pageIcon={FileText}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1"
          style={{ background: 'linear-gradient(90deg, #4338ca 0%, #7c3aed 25%, #a855f7 45%, #10b981 70%, #eab308 100%)' }} />
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">Report Type</label>
            <div className="relative">
              <BarChart3 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
              <select value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer">
                {REPORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="min-w-[180px]">
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">Department</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
              <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer">
                <option value="">All Departments</option>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="min-w-[150px]">
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">Date From</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm" />
            </div>
          </div>
          <div className="min-w-[150px]">
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">Date To</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm" />
            </div>
          </div>
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition text-sm"
            style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }}>
            <Download className="w-4 h-4" strokeWidth={2.5} />Export CSV
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-block w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%)' }} />
          <h3 className="text-lg font-bold text-gray-800">
            {REPORT_OPTIONS.find((o) => o.value === reportType)?.label}
          </h3>
          <span className="ml-2 px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full">
            {recordCount()} records
          </span>
        </div>
      </div>

      {renderTable()}
    </Layout>
  );
}
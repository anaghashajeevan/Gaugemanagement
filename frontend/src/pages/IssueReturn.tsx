// // src/pages/IssueReturn.tsx

// import { useState, useMemo } from 'react';
// import Layout from '../components/Layout';
// import DataTable, { type Column } from '../components/DataTable';
// import StatusBadge from '../components/StatusBadge';
// import Modal from '../components/Modal';
// import {
//   issueReturnStorage,
//   gaugeStorage,
//   appUserStorage,
//   auditStorage,
//   type IssueReturnLog,
// } from '../utils/storage';
// import {
//   ArrowLeftRight,
//   Send,
//   CornerDownLeft,
//   Search,
//   AlertCircle,
//   Clock,
//   Package,
//   CheckCircle2,
// } from 'lucide-react';

// export default function IssueReturn() {
//   const [logs, setLogs] = useState<IssueReturnLog[]>(issueReturnStorage.getAll());
//   const [search, setSearch] = useState('');

//   const [issueModalOpen, setIssueModalOpen] = useState(false);
//   const [issueGaugeId, setIssueGaugeId] = useState('');
//   const [issueTo, setIssueTo] = useState('');
//   const [issueError, setIssueError] = useState('');

//   const gauges = gaugeStorage.getAll();
//   const users = appUserStorage.getAll();
//   const reload = () => setLogs(issueReturnStorage.getAll());

//   const currentlyIssued = useMemo(
//     () => logs.filter((l) => l.status === 'Issued'),
//     [logs]
//   );

//   const history = useMemo(() => {
//     let list = logs.filter((l) => l.status === 'Returned');
//     if (search) {
//       const q = search.toLowerCase();
//       list = list.filter((l) => {
//         const g = gauges.find((x) => x.id === l.gaugeId);
//         return (
//           g?.gaugeCode.toLowerCase().includes(q) ||
//           g?.name.toLowerCase().includes(q) ||
//           l.issuedTo.toLowerCase().includes(q)
//         );
//       });
//     }
//     return list.sort(
//       (a, b) =>
//         new Date(b.returnTimestamp || '').getTime() -
//         new Date(a.returnTimestamp || '').getTime()
//     );
//   }, [logs, search, gauges]);

//   const availableGauges = gauges.filter((g) => g.status === 'Available');

//   const getGaugeInfo = (gaugeId: string) => {
//     const g = gauges.find((x) => x.id === gaugeId);
//     return g || null;
//   };

//   // ─── Issue Gauge ──────────────────────────────────────────────────
//   const handleIssue = () => {
//     if (!issueGaugeId || !issueTo.trim()) {
//       setIssueError('Gauge and Issued To are required.');
//       return;
//     }

//     const newLog = issueReturnStorage.add({
//       gaugeId: issueGaugeId,
//       issuedTo: issueTo,
//       issueTimestamp: new Date().toISOString(),
//       status: 'Issued',
//     });

//     gaugeStorage.update(issueGaugeId, { status: 'Issued' });

//     auditStorage.add({
//       action: 'ISSUE',
//       entityType: 'IssueReturnLog',
//       entityId: newLog.id,
//       userId: 'current',
//       timestamp: new Date().toISOString(),
//     });

//     reload();
//     setIssueModalOpen(false);
//     setIssueGaugeId('');
//     setIssueTo('');
//     setIssueError('');
//   };

//   // ─── Mark Returned ────────────────────────────────────────────────
//   const handleReturn = (logId: string, gaugeId: string) => {
//     issueReturnStorage.update(logId, {
//       returnTimestamp: new Date().toISOString(),
//       status: 'Returned',
//     });

//     gaugeStorage.update(gaugeId, { status: 'Available' });

//     auditStorage.add({
//       action: 'RETURN',
//       entityType: 'IssueReturnLog',
//       entityId: logId,
//       userId: 'current',
//       timestamp: new Date().toISOString(),
//     });

//     reload();
//   };

//   // ─── Currently Issued Columns ─────────────────────────────────────
//   const issuedColumns: Column<IssueReturnLog>[] = [
//     {
//       header: 'Gauge',
//       cell: (row) => {
//         const g = getGaugeInfo(row.gaugeId);
//         return (
//           <div>
//             <span className="font-bold text-indigo-600">
//               {g?.gaugeCode || '—'}
//             </span>
//             <p className="text-xs text-gray-400">{g?.name}</p>
//           </div>
//         );
//       },
//     },
//     {
//       header: 'Type',
//       cell: (row) => {
//         const g = getGaugeInfo(row.gaugeId);
//         return <span className="text-sm text-gray-600">{g?.type || '—'}</span>;
//       },
//     },
//     { header: 'Issued To', accessor: 'issuedTo' },
//     {
//       header: 'Issued At',
//       cell: (row) => (
//         <span className="text-sm">
//           {new Date(row.issueTimestamp).toLocaleString('en-IN', {
//             day: '2-digit',
//             month: 'short',
//             year: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit',
//           })}
//         </span>
//       ),
//     },
//     {
//       header: 'Duration',
//       cell: (row) => {
//         const hrs = Math.round(
//           (Date.now() - new Date(row.issueTimestamp).getTime()) /
//             (1000 * 60 * 60)
//         );
//         const days = Math.floor(hrs / 24);
//         const remHrs = hrs % 24;
//         return (
//           <span className="text-sm text-amber-600 font-medium">
//             {days > 0 ? `${days}d ${remHrs}h` : `${hrs}h`}
//           </span>
//         );
//       },
//     },
//     {
//       header: 'Action',
//       width: '140px',
//       align: 'center',
//       cell: (row) => (
//         <button
//           onClick={() => handleReturn(row.id, row.gaugeId)}
//           className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition text-xs font-semibold"
//         >
//           <CornerDownLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
//           Mark Returned
//         </button>
//       ),
//     },
//   ];

//   // ─── History Columns ──────────────────────────────────────────────
//   const historyColumns: Column<IssueReturnLog>[] = [
//     {
//       header: 'Gauge',
//       cell: (row) => {
//         const g = getGaugeInfo(row.gaugeId);
//         return (
//           <div>
//             <span className="font-bold text-indigo-600">
//               {g?.gaugeCode || '—'}
//             </span>
//             <p className="text-xs text-gray-400">{g?.name}</p>
//           </div>
//         );
//       },
//     },
//     { header: 'Issued To', accessor: 'issuedTo' },
//     {
//       header: 'Issued At',
//       cell: (row) =>
//         new Date(row.issueTimestamp).toLocaleString('en-IN', {
//           day: '2-digit',
//           month: 'short',
//           year: 'numeric',
//           hour: '2-digit',
//           minute: '2-digit',
//         }),
//     },
//     {
//       header: 'Returned At',
//       cell: (row) =>
//         row.returnTimestamp
//           ? new Date(row.returnTimestamp).toLocaleString('en-IN', {
//               day: '2-digit',
//               month: 'short',
//               year: 'numeric',
//               hour: '2-digit',
//               minute: '2-digit',
//             })
//           : '—',
//     },
//     {
//       header: 'Duration',
//       cell: (row) => {
//         if (!row.returnTimestamp) return '—';
//         const hrs = Math.round(
//           (new Date(row.returnTimestamp).getTime() -
//             new Date(row.issueTimestamp).getTime()) /
//             (1000 * 60 * 60)
//         );
//         const days = Math.floor(hrs / 24);
//         const remHrs = hrs % 24;
//         return (
//           <span className="text-sm">
//             {days > 0 ? `${days}d ${remHrs}h` : `${hrs}h`}
//           </span>
//         );
//       },
//     },
//     {
//       header: 'Status',
//       cell: (row) => <StatusBadge status={row.status} />,
//     },
//   ];

//   return (
//     <Layout pageTitle="Issue / Return">
//       {/* ─── Top Bar ──────────────────────────────────────────────── */}
//       <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
//         <div />
//         <button
//           onClick={() => {
//             setIssueGaugeId('');
//             setIssueTo('');
//             setIssueError('');
//             setIssueModalOpen(true);
//           }}
//           className="flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition text-sm"
//           style={{
//             background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
//           }}
//         >
//           <Send className="w-4 h-4" strokeWidth={2.5} />
//           Issue a Gauge
//         </button>
//       </div>

//       {/* ─── Stats ────────────────────────────────────────────────── */}
//       <div className="grid grid-cols-3 gap-4 mb-6">
//         {[
//           {
//             label: 'Currently Issued',
//             value: currentlyIssued.length,
//             accent: 'from-blue-500 to-cyan-500',
//             icon: Package,
//             iconBg: 'bg-blue-50',
//             iconColor: 'text-blue-600',
//           },
//           {
//             label: 'Available Gauges',
//             value: availableGauges.length,
//             accent: 'from-emerald-500 to-teal-500',
//             icon: CheckCircle2,
//             iconBg: 'bg-emerald-50',
//             iconColor: 'text-emerald-600',
//           },
//           {
//             label: 'Total Transactions',
//             value: logs.length,
//             accent: 'from-indigo-500 to-purple-500',
//             icon: ArrowLeftRight,
//             iconBg: 'bg-indigo-50',
//             iconColor: 'text-indigo-600',
//           },
//         ].map((s) => {
//           const Icon = s.icon;
//           return (
//             <div
//               key={s.label}
//               className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 relative overflow-hidden"
//             >
//               <div
//                 className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${s.accent}`}
//               />
//               <div className="flex justify-between items-start">
//                 <div>
//                   <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
//                     {s.label}
//                   </p>
//                   <p className="text-2xl font-bold text-gray-800 mt-1">
//                     {s.value}
//                   </p>
//                 </div>
//                 <div
//                   className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.iconBg} ${s.iconColor}`}
//                 >
//                   <Icon className="w-5 h-5" strokeWidth={2} />
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* ─── Currently Issued Section ─────────────────────────────── */}
//       <div className="mb-8">
//         <div className="flex items-center gap-2 mb-4">
//           <span
//             className="inline-block w-1 h-6 rounded-full"
//             style={{
//               background:
//                 'linear-gradient(180deg, #3b82f6 0%, #06b6d4 100%)',
//             }}
//           />
//           <h3 className="text-lg font-bold text-gray-800">
//             Currently Issued
//           </h3>
//           <span className="ml-2 px-2.5 py-0.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
//             {currentlyIssued.length}
//           </span>
//         </div>

//         <DataTable
//           columns={issuedColumns}
//           data={currentlyIssued}
//           keyExtractor={(row) => row.id}
//           emptyTitle="No gauges currently issued"
//           emptySubtitle="Issue a gauge to see it here."
//           emptyIcon={
//             <Send className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
//           }
//         />
//       </div>

//       {/* ─── History Section ──────────────────────────────────────── */}
//       <div>
//         <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
//           <div className="flex items-center gap-2">
//             <span
//               className="inline-block w-1 h-6 rounded-full"
//               style={{
//                 background:
//                   'linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%)',
//               }}
//             />
//             <h3 className="text-lg font-bold text-gray-800">
//               Return History
//             </h3>
//           </div>
//           <div className="relative">
//             <Search
//               className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
//               strokeWidth={2}
//             />
//             <input
//               type="text"
//               placeholder="Search history…"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition w-56"
//             />
//           </div>
//         </div>

//         <DataTable
//           columns={historyColumns}
//           data={history}
//           keyExtractor={(row) => row.id}
//           emptyTitle="No return history"
//           emptySubtitle="Returned gauges will appear here."
//           emptyIcon={
//             <Clock className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
//           }
//         />
//       </div>

//       {/* ─── Issue Modal ──────────────────────────────────────────── */}
//       <Modal
//         open={issueModalOpen}
//         onClose={() => setIssueModalOpen(false)}
//         title="Issue a Gauge"
//         subtitle="Select an available gauge and assign it to a user"
//         maxWidth="md"
//         footer={
//           <>
//             <button
//               onClick={() => setIssueModalOpen(false)}
//               className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleIssue}
//               className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm"
//               style={{
//                 background:
//                   'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
//               }}
//             >
//               <Send className="w-4 h-4 inline mr-1.5" strokeWidth={2} />
//               Issue Gauge
//             </button>
//           </>
//         }
//       >
//         {issueError && (
//           <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
//             <AlertCircle
//               className="w-4 h-4 flex-shrink-0 mt-0.5"
//               strokeWidth={2}
//             />
//             {issueError}
//           </div>
//         )}

//         <div className="space-y-4">
//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Select Gauge <span className="text-red-500">*</span>
//             </label>
//             <select
//               value={issueGaugeId}
//               onChange={(e) => setIssueGaugeId(e.target.value)}
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
//             >
//               <option value="">Select an available gauge</option>
//               {availableGauges.map((g) => (
//                 <option key={g.id} value={g.id}>
//                   {g.gaugeCode} — {g.name} ({g.department})
//                 </option>
//               ))}
//             </select>
//             {availableGauges.length === 0 && (
//               <p className="text-xs text-amber-600 mt-1">
//                 No gauges are currently available for issue.
//               </p>
//             )}
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Issue To <span className="text-red-500">*</span>
//             </label>
//             <select
//               value={issueTo}
//               onChange={(e) => setIssueTo(e.target.value)}
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
//             >
//               <option value="">Select a person</option>
//               {users.map((u) => (
//                 <option key={u.id} value={u.fullName}>
//                   {u.fullName} ({u.role} — {u.department})
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="bg-indigo-50 rounded-xl p-3 text-xs text-indigo-700 flex items-start gap-2">
//             <Clock
//               className="w-4 h-4 flex-shrink-0 mt-0.5"
//               strokeWidth={2}
//             />
//             Issue timestamp will be set automatically to now.
//           </div>
//         </div>
//       </Modal>
//     </Layout>
//   );
// }


// src/pages/IssueReturn.tsx

import { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import DataTable, { type Column } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import {
  issueReturnStorage,
  gaugeStorage,
  appUserStorage,
  auditStorage,
  type IssueReturnLog,
} from '../utils/storage';
import {
  ArrowLeftRight,
  Send,
  CornerDownLeft,
  Search,
  AlertCircle,
  Clock,
  Package,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function IssueReturn() {
  const [logs, setLogs] = useState<IssueReturnLog[]>(issueReturnStorage.getAll());
  const [search, setSearch] = useState('');

  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [issueGaugeId, setIssueGaugeId] = useState('');
  const [issueTo, setIssueTo] = useState('');
  const [issueError, setIssueError] = useState('');

  const gauges = gaugeStorage.getAll();
  const users = appUserStorage.getAll();
  const reload = () => setLogs(issueReturnStorage.getAll());

  const currentlyIssued = useMemo(
    () => logs.filter((l) => l.status === 'Issued'),
    [logs]
  );

  const history = useMemo(() => {
    let list = logs.filter((l) => l.status === 'Returned');
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((l) => {
        const g = gauges.find((x) => x.id === l.gaugeId);
        return (
          g?.gaugeCode.toLowerCase().includes(q) ||
          g?.name.toLowerCase().includes(q) ||
          l.issuedTo.toLowerCase().includes(q)
        );
      });
    }
    return list.sort(
      (a, b) => new Date(b.returnTimestamp || '').getTime() - new Date(a.returnTimestamp || '').getTime()
    );
  }, [logs, search, gauges]);

  // Only gauges with status "Available" can be issued
  // Quarantined (Under Review), Under Calibration, Scrapped, Issued — all blocked
  const availableGauges = gauges.filter((g) => g.status === 'Available');
  const blockedGauges = gauges.filter((g) => g.status === 'Under Review');

  const getGaugeInfo = (gaugeId: string) => gauges.find((x) => x.id === gaugeId) || null;

  const handleIssue = () => {
    if (!issueGaugeId || !issueTo.trim()) {
      setIssueError('Gauge and Issued To are required.');
      return;
    }

    // Double-check gauge is still available
    const gauge = gauges.find((g) => g.id === issueGaugeId);
    if (gauge && gauge.status !== 'Available') {
      setIssueError(`This gauge is currently "${gauge.status}" and cannot be issued.`);
      return;
    }

    const newLog = issueReturnStorage.add({
      gaugeId: issueGaugeId,
      issuedTo: issueTo,
      issueTimestamp: new Date().toISOString(),
      status: 'Issued',
    });

    gaugeStorage.update(issueGaugeId, { status: 'Issued' });

    auditStorage.add({
      action: 'ISSUE', entityType: 'IssueReturnLog', entityId: newLog.id,
      userId: 'current', timestamp: new Date().toISOString(),
    });

    reload();
    setIssueModalOpen(false);
    setIssueGaugeId('');
    setIssueTo('');
    setIssueError('');
  };

  const handleReturn = (logId: string, gaugeId: string) => {
    issueReturnStorage.update(logId, {
      returnTimestamp: new Date().toISOString(),
      status: 'Returned',
    });

    gaugeStorage.update(gaugeId, { status: 'Available' });

    auditStorage.add({
      action: 'RETURN', entityType: 'IssueReturnLog', entityId: logId,
      userId: 'current', timestamp: new Date().toISOString(),
    });

    reload();
  };

  const issuedColumns: Column<IssueReturnLog>[] = [
    {
      header: 'Gauge',
      cell: (row) => {
        const g = getGaugeInfo(row.gaugeId);
        return (
          <div>
            <span className="font-bold text-indigo-600">{g?.gaugeCode || '—'}</span>
            <p className="text-xs text-gray-400">{g?.name}</p>
          </div>
        );
      },
    },
    {
      header: 'Type',
      cell: (row) => {
        const g = getGaugeInfo(row.gaugeId);
        return <span className="text-sm text-gray-600">{g?.type || '—'}</span>;
      },
    },
    { header: 'Issued To', accessor: 'issuedTo' },
    {
      header: 'Issued At',
      cell: (row) => (
        <span className="text-sm">
          {new Date(row.issueTimestamp).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </span>
      ),
    },
    {
      header: 'Duration',
      cell: (row) => {
        const hrs = Math.round((Date.now() - new Date(row.issueTimestamp).getTime()) / (1000 * 60 * 60));
        const days = Math.floor(hrs / 24);
        const remHrs = hrs % 24;
        return (
          <span className="text-sm text-amber-600 font-medium">
            {days > 0 ? `${days}d ${remHrs}h` : `${hrs}h`}
          </span>
        );
      },
    },
    {
      header: 'Action',
      width: '140px',
      align: 'center',
      cell: (row) => (
        <button onClick={() => handleReturn(row.id, row.gaugeId)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition text-xs font-semibold">
          <CornerDownLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
          Mark Returned
        </button>
      ),
    },
  ];

  const historyColumns: Column<IssueReturnLog>[] = [
    {
      header: 'Gauge',
      cell: (row) => {
        const g = getGaugeInfo(row.gaugeId);
        return (
          <div>
            <span className="font-bold text-indigo-600">{g?.gaugeCode || '—'}</span>
            <p className="text-xs text-gray-400">{g?.name}</p>
          </div>
        );
      },
    },
    { header: 'Issued To', accessor: 'issuedTo' },
    {
      header: 'Issued At',
      cell: (row) => new Date(row.issueTimestamp).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      }),
    },
    {
      header: 'Returned At',
      cell: (row) => row.returnTimestamp
        ? new Date(row.returnTimestamp).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
          })
        : '—',
    },
    {
      header: 'Duration',
      cell: (row) => {
        if (!row.returnTimestamp) return '—';
        const hrs = Math.round((new Date(row.returnTimestamp).getTime() - new Date(row.issueTimestamp).getTime()) / (1000 * 60 * 60));
        const days = Math.floor(hrs / 24);
        const remHrs = hrs % 24;
        return <span className="text-sm">{days > 0 ? `${days}d ${remHrs}h` : `${hrs}h`}</span>;
      },
    },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <Layout pageTitle="Issue / Return">
      {/* Quarantine Warning */}
      {blockedGauges.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
          <div>
            <p className="text-sm font-semibold text-red-700">
              {blockedGauges.length} gauge{blockedGauges.length > 1 ? 's are' : ' is'} quarantined (Under Review)
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              {blockedGauges.map((g) => g.gaugeCode).join(', ')} — cannot be issued until CAPA is closed.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div />
        <button
          onClick={() => { setIssueGaugeId(''); setIssueTo(''); setIssueError(''); setIssueModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition text-sm"
          style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }}>
          <Send className="w-4 h-4" strokeWidth={2.5} />
          Issue a Gauge
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Currently Issued', value: currentlyIssued.length, accent: 'from-blue-500 to-cyan-500', icon: Package },
          { label: 'Available to Issue', value: availableGauges.length, accent: 'from-emerald-500 to-teal-500', icon: CheckCircle2 },
          { label: 'Total Transactions', value: logs.length, accent: 'from-indigo-500 to-purple-500', icon: ArrowLeftRight },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${s.accent}`} />
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50"><Icon className="w-5 h-5 text-gray-400" strokeWidth={2} /></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Currently Issued */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-block w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg, #3b82f6 0%, #06b6d4 100%)' }} />
          <h3 className="text-lg font-bold text-gray-800">Currently Issued</h3>
          <span className="ml-2 px-2.5 py-0.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">{currentlyIssued.length}</span>
        </div>
        <DataTable columns={issuedColumns} data={currentlyIssued} keyExtractor={(row) => row.id}
          emptyTitle="No gauges currently issued" emptySubtitle="Issue a gauge to see it here."
          emptyIcon={<Send className="w-8 h-8 text-gray-300" strokeWidth={1.5} />} />
      </div>

      {/* History */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%)' }} />
            <h3 className="text-lg font-bold text-gray-800">Return History</h3>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
            <input type="text" placeholder="Search history…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition w-56" />
          </div>
        </div>
        <DataTable columns={historyColumns} data={history} keyExtractor={(row) => row.id}
          emptyTitle="No return history" emptySubtitle="Returned gauges will appear here."
          emptyIcon={<Clock className="w-8 h-8 text-gray-300" strokeWidth={1.5} />} />
      </div>

      {/* Issue Modal */}
      <Modal open={issueModalOpen} onClose={() => setIssueModalOpen(false)}
        title="Issue a Gauge" subtitle="Only Available gauges can be issued" maxWidth="md"
        footer={
          <>
            <button onClick={() => setIssueModalOpen(false)} className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm">Cancel</button>
            <button onClick={handleIssue} className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm"
              style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }}>
              <Send className="w-4 h-4 inline mr-1.5" strokeWidth={2} />Issue Gauge
            </button>
          </>
        }>
        {issueError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />{issueError}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">Select Gauge <span className="text-red-500">*</span></label>
            <select value={issueGaugeId} onChange={(e) => setIssueGaugeId(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer">
              <option value="">Select an available gauge</option>
              {availableGauges.map((g) => (
                <option key={g.id} value={g.id}>{g.gaugeCode} — {g.name} ({g.department})</option>
              ))}
            </select>
            {availableGauges.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">No gauges are currently available for issue.</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">Issue To <span className="text-red-500">*</span></label>
            <select value={issueTo} onChange={(e) => setIssueTo(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer">
              <option value="">Select a person</option>
              {users.map((u) => (
                <option key={u.id} value={u.fullName}>{u.fullName} ({u.role} — {u.department})</option>
              ))}
            </select>
          </div>
          <div className="bg-indigo-50 rounded-xl p-3 text-xs text-indigo-700 flex items-start gap-2">
            <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
            Issue timestamp will be set automatically to now.
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
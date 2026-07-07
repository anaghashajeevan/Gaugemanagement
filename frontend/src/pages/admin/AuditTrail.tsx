// // src/pages/admin/AuditTrail.tsx

// import { useState, useMemo } from 'react';
// import Layout from '../../components/Layout';
// import DataTable, { type Column } from '../../components/DataTable';
// import { auditStorage, type AuditLog } from '../../utils/storage';
// import {
//   ScrollText,
//   Filter,
//   Calendar,
//   Search,
//   Shield,
//   Plus,
//   Edit3,
//   Trash2,
//   LogIn,
//   LogOut,
//   ClipboardCheck,
//   ArrowLeftRight,
//   CheckCircle2,
//   AlertTriangle,
// } from 'lucide-react';

// const ENTITY_TYPES = [
//   'Gauge',
//   'CalibrationRecord',
//   'MSAStudy',
//   'CAPA',
//   'IssueReturnLog',
//   'User',
//   'Department',
// ];

// export default function AuditTrail() {
//   const [logs] = useState<AuditLog[]>(auditStorage.getAll());
//   const [search, setSearch] = useState('');
//   const [filterEntity, setFilterEntity] = useState('');
//   const [dateFrom, setDateFrom] = useState('');
//   const [dateTo, setDateTo] = useState('');

//   const filtered = useMemo(() => {
//     let list = logs;

//     if (search) {
//       const q = search.toLowerCase();
//       list = list.filter(
//         (l) =>
//           l.action.toLowerCase().includes(q) ||
//           l.entityType.toLowerCase().includes(q) ||
//           l.entityId.toLowerCase().includes(q)
//       );
//     }

//     if (filterEntity) {
//       list = list.filter((l) => l.entityType === filterEntity);
//     }

//     if (dateFrom) {
//       list = list.filter(
//         (l) => new Date(l.timestamp) >= new Date(dateFrom)
//       );
//     }

//     if (dateTo) {
//       list = list.filter(
//         (l) => new Date(l.timestamp) <= new Date(dateTo + 'T23:59:59')
//       );
//     }

//     return list;
//   }, [logs, search, filterEntity, dateFrom, dateTo]);

//   const getActionIcon = (action: string) => {
//     switch (action) {
//       case 'CREATE':
//         return <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />;
//       case 'UPDATE':
//         return <Edit3 className="w-3.5 h-3.5" strokeWidth={2.5} />;
//       case 'DELETE':
//         return <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />;
//       case 'LOGIN':
//         return <LogIn className="w-3.5 h-3.5" strokeWidth={2.5} />;
//       case 'LOGOUT':
//         return <LogOut className="w-3.5 h-3.5" strokeWidth={2.5} />;
//       case 'CALIBRATE':
//         return <ClipboardCheck className="w-3.5 h-3.5" strokeWidth={2.5} />;
//       case 'ISSUE':
//       case 'RETURN':
//         return <ArrowLeftRight className="w-3.5 h-3.5" strokeWidth={2.5} />;
//       case 'CLOSE_CAPA':
//         return <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />;
//       default:
//         return <Shield className="w-3.5 h-3.5" strokeWidth={2.5} />;
//     }
//   };

//   const getActionColor = (action: string) => {
//     switch (action) {
//       case 'CREATE':
//         return 'bg-emerald-50 text-emerald-700';
//       case 'UPDATE':
//         return 'bg-blue-50 text-blue-700';
//       case 'DELETE':
//         return 'bg-red-50 text-red-700';
//       case 'LOGIN':
//         return 'bg-indigo-50 text-indigo-700';
//       case 'LOGOUT':
//         return 'bg-gray-100 text-gray-600';
//       case 'CALIBRATE':
//         return 'bg-purple-50 text-purple-700';
//       case 'ISSUE':
//         return 'bg-amber-50 text-amber-700';
//       case 'RETURN':
//         return 'bg-teal-50 text-teal-700';
//       case 'CLOSE_CAPA':
//         return 'bg-emerald-50 text-emerald-700';
//       default:
//         return 'bg-gray-100 text-gray-600';
//     }
//   };

//   const getEntityColor = (entity: string) => {
//     switch (entity) {
//       case 'Gauge':
//         return 'bg-indigo-50 text-indigo-600';
//       case 'CalibrationRecord':
//         return 'bg-purple-50 text-purple-600';
//       case 'MSAStudy':
//         return 'bg-blue-50 text-blue-600';
//       case 'CAPA':
//         return 'bg-amber-50 text-amber-600';
//       case 'IssueReturnLog':
//         return 'bg-teal-50 text-teal-600';
//       case 'User':
//         return 'bg-pink-50 text-pink-600';
//       case 'Department':
//         return 'bg-emerald-50 text-emerald-600';
//       default:
//         return 'bg-gray-100 text-gray-600';
//     }
//   };

//   const columns: Column<AuditLog>[] = [
//     {
//       header: 'Timestamp',
//       cell: (row) => (
//         <span className="text-sm text-gray-600 whitespace-nowrap">
//           {new Date(row.timestamp).toLocaleString('en-IN', {
//             day: '2-digit',
//             month: 'short',
//             year: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit',
//             second: '2-digit',
//           })}
//         </span>
//       ),
//     },
//     {
//       header: 'Action',
//       cell: (row) => (
//         <span
//           className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${getActionColor(
//             row.action
//           )}`}
//         >
//           {getActionIcon(row.action)}
//           {row.action}
//         </span>
//       ),
//     },
//     {
//       header: 'Entity Type',
//       cell: (row) => (
//         <span
//           className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getEntityColor(
//             row.entityType
//           )}`}
//         >
//           {row.entityType}
//         </span>
//       ),
//     },
//     {
//       header: 'Entity ID',
//       cell: (row) => (
//         <span className="font-mono text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
//           {row.entityId}
//         </span>
//       ),
//     },
//     {
//       header: 'User ID',
//       cell: (row) => (
//         <span className="text-sm text-gray-600">{row.userId}</span>
//       ),
//     },
//   ];

//   // ─── Action type counts ───────────────────────────────────────────
//   const actionCounts = useMemo(() => {
//     const counts: Record<string, number> = {};
//     logs.forEach((l) => {
//       counts[l.action] = (counts[l.action] || 0) + 1;
//     });
//     return counts;
//   }, [logs]);

//   return (
//     <Layout pageTitle="Audit Trail">
//       {/* ─── Header ───────────────────────────────────────────────── */}
//       <div className="flex items-center gap-3 mb-6">
//         <div
//           className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md"
//           style={{
//             background:
//               'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
//           }}
//         >
//           <ScrollText className="w-6 h-6" strokeWidth={2} />
//         </div>
//         <div>
//           <h2 className="text-lg font-bold text-gray-800">
//             System Audit Trail
//           </h2>
//           <p className="text-sm text-gray-500">
//             Read-only log of all system actions, newest first
//           </p>
//         </div>
//       </div>

//       {/* ─── Stats ────────────────────────────────────────────────── */}
//       <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
//         {[
//           { label: 'Total Entries', value: logs.length, accent: 'from-indigo-500 to-purple-500' },
//           { label: 'Creates', value: actionCounts['CREATE'] || 0, accent: 'from-emerald-500 to-teal-500' },
//           { label: 'Updates', value: actionCounts['UPDATE'] || 0, accent: 'from-blue-500 to-cyan-500' },
//           { label: 'Deletes', value: actionCounts['DELETE'] || 0, accent: 'from-red-500 to-rose-500' },
//           {
//             label: 'Other',
//             value:
//               logs.length -
//               (actionCounts['CREATE'] || 0) -
//               (actionCounts['UPDATE'] || 0) -
//               (actionCounts['DELETE'] || 0),
//             accent: 'from-amber-500 to-yellow-500',
//           },
//         ].map((s) => (
//           <div
//             key={s.label}
//             className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 relative overflow-hidden"
//           >
//             <div
//               className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${s.accent}`}
//             />
//             <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
//               {s.label}
//             </p>
//             <p className="text-xl font-bold text-gray-800 mt-0.5">
//               {s.value}
//             </p>
//           </div>
//         ))}
//       </div>

//       {/* ─── Filter Bar ───────────────────────────────────────────── */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
//         <div className="flex flex-wrap items-end gap-3">
//           {/* Search */}
//           <div className="flex-1 min-w-[200px]">
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Search
//             </label>
//             <div className="relative">
//               <Search
//                 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
//                 strokeWidth={2}
//               />
//               <input
//                 type="text"
//                 placeholder="Search action, entity, ID…"
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition"
//               />
//             </div>
//           </div>

//           {/* Entity Type */}
//           <div className="min-w-[180px]">
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Entity Type
//             </label>
//             <div className="relative">
//               <Filter
//                 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
//                 strokeWidth={2}
//               />
//               <select
//                 value={filterEntity}
//                 onChange={(e) => setFilterEntity(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition appearance-none cursor-pointer"
//               >
//                 <option value="">All Types</option>
//                 {ENTITY_TYPES.map((t) => (
//                   <option key={t} value={t}>
//                     {t}
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
//                 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition"
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
//                 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition"
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ─── Results Count ────────────────────────────────────────── */}
//       <div className="flex items-center gap-2 mb-4">
//         <span
//           className="inline-block w-1 h-6 rounded-full"
//           style={{
//             background:
//               'linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%)',
//           }}
//         />
//         <h3 className="text-lg font-bold text-gray-800">
//           Log Entries
//         </h3>
//         <span className="ml-2 px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full">
//           {filtered.length} entries
//         </span>
//       </div>

//       {/* ─── Table ────────────────────────────────────────────────── */}
//       <DataTable
//         columns={columns}
//         data={filtered}
//         keyExtractor={(row) => row.id}
//         emptyTitle="No audit log entries"
//         emptySubtitle="Actions will be recorded as users interact with the system."
//         emptyIcon={
//           <ScrollText
//             className="w-8 h-8 text-gray-300"
//             strokeWidth={1.5}
//           />
//         }
//         compact
//       />
//     </Layout>
//   );
// }


// src/pages/admin/AuditTrail.tsx

import { useState, useEffect, useMemo } from 'react';
import Layout from '../../components/Layout';
import DataTable, { type Column } from '../../components/DataTable';
import { auditAPI, type AuditLogType, type AuditAction } from '../../api/api';
import {
  ScrollText,
  Filter,
  Calendar,
  Search,
  Shield,
  Plus,
  Edit3,
  Trash2,
  LogIn,
  LogOut,
  AlertCircle,
  ClipboardCheck,
  ArrowLeftRight,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

const MODULES = [
  'authentication',
  'user_management',
  'roles',
  'departments',
];

const ACTIONS: AuditAction[] = [
  'LOGIN',
  'LOGOUT',
  'LOGIN_FAILED',
  'CREATE',
  'UPDATE',
  'DELETE',
];

export default function AuditTrail() {
  const [logs, setLogs] = useState<AuditLogType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // ─── Load ─────────────────────────────────────────────────────────
  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await auditAPI.list();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ─── Filtered ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = logs;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) =>
          (l.user_name || '').toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.module.toLowerCase().includes(q) ||
          (l.description || '').toLowerCase().includes(q) ||
          (l.record_id || '').toLowerCase().includes(q)
      );
    }

    if (filterModule) {
      list = list.filter((l) => l.module === filterModule);
    }

    if (filterAction) {
      list = list.filter((l) => l.action === filterAction);
    }

    if (dateFrom) {
      list = list.filter((l) => new Date(l.timestamp) >= new Date(dateFrom));
    }

    if (dateTo) {
      list = list.filter(
        (l) => new Date(l.timestamp) <= new Date(dateTo + 'T23:59:59')
      );
    }

    return list;
  }, [logs, search, filterModule, filterAction, dateFrom, dateTo]);

  // ─── Action styling ───────────────────────────────────────────────
  const getActionColor = (action: AuditAction) => {
    switch (action) {
      case 'LOGIN': return 'bg-indigo-50 text-indigo-700';
      case 'LOGOUT': return 'bg-gray-100 text-gray-600';
      case 'LOGIN_FAILED': return 'bg-red-50 text-red-700';
      case 'CREATE': return 'bg-emerald-50 text-emerald-700';
      case 'UPDATE': return 'bg-blue-50 text-blue-700';
      case 'DELETE': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getActionIcon = (action: AuditAction) => {
    switch (action) {
      case 'LOGIN': return <LogIn className="w-3.5 h-3.5" strokeWidth={2.5} />;
      case 'LOGOUT': return <LogOut className="w-3.5 h-3.5" strokeWidth={2.5} />;
      case 'LOGIN_FAILED': return <AlertCircle className="w-3.5 h-3.5" strokeWidth={2.5} />;
      case 'CREATE': return <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />;
      case 'UPDATE': return <Edit3 className="w-3.5 h-3.5" strokeWidth={2.5} />;
      case 'DELETE': return <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />;
      default: return <Shield className="w-3.5 h-3.5" strokeWidth={2.5} />;
    }
  };

  const getModuleColor = (module: string) => {
    switch (module) {
      case 'authentication': return 'bg-indigo-50 text-indigo-600';
      case 'user_management': return 'bg-purple-50 text-purple-600';
      case 'roles': return 'bg-blue-50 text-blue-600';
      case 'departments': return 'bg-emerald-50 text-emerald-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // ─── Stats ────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: logs.length,
    logins: logs.filter((l) => l.action === 'LOGIN').length,
    failed: logs.filter((l) => l.action === 'LOGIN_FAILED').length,
    creates: logs.filter((l) => l.action === 'CREATE').length,
    updates: logs.filter((l) => l.action === 'UPDATE').length,
    deletes: logs.filter((l) => l.action === 'DELETE').length,
  }), [logs]);

  // ─── Unique modules from actual data ─────────────────────────────
  const availableModules = useMemo(
    () => [...new Set(logs.map((l) => l.module))].sort(),
    [logs]
  );

  // ─── Columns ──────────────────────────────────────────────────────
  const columns: Column<AuditLogType>[] = [
    {
      header: 'Timestamp',
      cell: (row) => (
        <span className="text-sm text-gray-600 whitespace-nowrap">
          {new Date(row.timestamp).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
          })}
        </span>
      ),
    },
    {
      header: 'User',
      cell: (row) => (
        <span className="text-sm font-medium text-gray-700">
          {row.user_name || 'System'}
        </span>
      ),
    },
    {
      header: 'Action',
      cell: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${getActionColor(row.action)}`}
        >
          {getActionIcon(row.action)}
          {row.action}
        </span>
      ),
    },
    {
      header: 'Module',
      cell: (row) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getModuleColor(row.module)}`}>
          {row.module}
        </span>
      ),
    },
    {
      header: 'Description',
      cell: (row) => (
        <span className="text-sm text-gray-600 truncate max-w-[300px] block">
          {row.description || '—'}
        </span>
      ),
    },
    {
      header: 'IP Address',
      cell: (row) => (
        <span className="text-xs text-gray-400 font-mono">
          {row.ip_address || '—'}
        </span>
      ),
    },
  ];

  return (
    <Layout pageTitle="Audit Trail">
      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
          {error}
          <button onClick={loadData} className="ml-auto text-red-600 underline text-xs font-semibold">
            Retry
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
          >
            <ScrollText className="w-6 h-6" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">System Audit Trail</h2>
            <p className="text-sm text-gray-500">
              Read-only log of all backend actions
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold rounded-xl transition text-sm"
        >
          <RefreshCw className="w-4 h-4" strokeWidth={2} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, accent: 'from-indigo-500 to-purple-500' },
          { label: 'Logins', value: stats.logins, accent: 'from-emerald-500 to-teal-500' },
          { label: 'Failed', value: stats.failed, accent: 'from-red-500 to-rose-500' },
          { label: 'Creates', value: stats.creates, accent: 'from-blue-500 to-cyan-500' },
          { label: 'Updates', value: stats.updates, accent: 'from-amber-500 to-yellow-500' },
          { label: 'Deletes', value: stats.deletes, accent: 'from-red-600 to-red-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${s.accent}`} />
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{s.label}</p>
            <p className="text-xl font-bold text-gray-800 mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap items-end gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
              <input
                type="text"
                placeholder="Search user, action, description…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition"
              />
            </div>
          </div>

          {/* Module */}
          <div className="min-w-[160px]">
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">Module</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
              <select
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition appearance-none cursor-pointer"
              >
                <option value="">All Modules</option>
                {availableModules.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action */}
          <div className="min-w-[150px]">
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">Action</label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition appearance-none cursor-pointer"
            >
              <option value="">All Actions</option>
              {ACTIONS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div className="min-w-[150px]">
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">Date From</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition"
              />
            </div>
          </div>

          {/* Date To */}
          <div className="min-w-[150px]">
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">Date To</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className="inline-block w-1 h-6 rounded-full"
          style={{ background: 'linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%)' }}
        />
        <h3 className="text-lg font-bold text-gray-800">Log Entries</h3>
        <span className="ml-2 px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full">
          {filtered.length} of {logs.length}
        </span>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(r) => String(r.id)}
        loading={loading}
        emptyTitle="No audit log entries"
        emptySubtitle="Actions will be recorded as users interact with the system."
        emptyIcon={<ScrollText className="w-8 h-8 text-gray-300" strokeWidth={1.5} />}
        compact
      />
    </Layout>
  );
}
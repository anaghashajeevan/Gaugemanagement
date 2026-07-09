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

import { useState, useEffect, useMemo, useCallback } from 'react';
import Layout from '../../components/Layout';
import DataTable, { type Column } from '../../components/DataTable';
import { auditAPI, type AuditLogType } from '../../api/api';
import { auditStorage, type AuditLog as LocalAuditLog } from '../../utils/storage';
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
  Download,
} from 'lucide-react';

// ─── Module normalization ─────────────────────────────────────────
// Backend AuditLog rows already carry a `module` string (authentication,
// user_management, roles, departments). Local (localStorage) entries only
// carry an `entityType` — map those onto the same module vocabulary so
// both sources can share one filter/badge system.
const MODULE_LABELS: Record<string, string> = {
  authentication: 'Authentication',
  user_management: 'User Management',
  roles: 'Roles',
  departments: 'Departments',
  gauge_master: 'Gauge Master',
  calibration: 'Calibration',
  msa: 'MSA Studies',
  capa: 'CAPA',
  issue_return: 'Issue / Return',
  locations: 'Locations',
  parts: 'Parts Master',
  outside_labs: 'Outside Labs',
  reports: 'Reports',
};

const moduleLabel = (module: string) => MODULE_LABELS[module] || module;

const ENTITY_TYPE_TO_MODULE: Record<string, string> = {
  Gauge: 'gauge_master',
  CalibrationRecord: 'calibration',
  MSAStudy: 'msa',
  CAPA: 'capa',
  IssueReturnLog: 'issue_return',
  Location: 'locations',
  Part: 'parts',
  Vendor: 'outside_labs',
  Report: 'reports',
};

// Every action actually produced by the backend or the local business
// pages — not an aspirational list, just what's really written today.
const KNOWN_ACTIONS = [
  'LOGIN', 'LOGOUT', 'LOGIN_FAILED',
  'CREATE', 'UPDATE', 'DELETE',
  'CALIBRATE', 'ISSUE', 'RETURN', 'CLOSE_CAPA', 'EXPORT',
];

// ─── Unified entry shape merging backend AuditLog + local gm_audit ───
interface UnifiedAuditEntry {
  id: string;
  timestamp: string;
  userName: string;
  action: string;
  module: string;
  description: string;
  recordId?: string;
  entityReference?: string;
  ipAddress?: string;
  source: 'backend' | 'local';
}

function normalizeBackend(log: AuditLogType): UnifiedAuditEntry {
  return {
    id: `backend-${log.id}`,
    timestamp: log.timestamp,
    userName: log.user_name || 'System',
    action: log.action,
    module: log.module,
    description: log.description || '',
    recordId: log.record_id || undefined,
    ipAddress: log.ip_address || undefined,
    source: 'backend',
  };
}

// Legacy gm_audit entries may predate userName/description/entityReference,
// or carry the old placeholder userId 'current'. Never attribute those to
// whoever happens to be logged in right now — label them as a legacy/
// unknown actor instead. Corrupt entries (bad timestamp) are dropped
// rather than allowed to crash the page.
function normalizeLocal(log: LocalAuditLog): UnifiedAuditEntry | null {
  if (!log || !log.timestamp || isNaN(new Date(log.timestamp).getTime())) return null;
  const module = ENTITY_TYPE_TO_MODULE[log.entityType] || 'other';
  const knownActorId = log.userId && log.userId !== 'current' && log.userId !== 'unknown';
  return {
    id: `local-${log.id}`,
    timestamp: log.timestamp,
    userName: log.userName || (knownActorId ? `User ${log.userId}` : 'Legacy User'),
    action: log.action,
    module,
    description: log.description || `${log.action} ${log.entityType} ${log.entityId}`,
    recordId: log.entityId,
    entityReference: log.entityReference,
    ipAddress: undefined,
    source: 'local',
  };
}

export default function AuditTrail() {
  const [backendLogs, setBackendLogs] = useState<AuditLogType[]>([]);
  const [localLogs, setLocalLogs] = useState<LocalAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // ─── Load both sources ────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await auditAPI.list();
      setBackendLogs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
    try {
      setLocalLogs(auditStorage.getAll());
    } catch {
      setLocalLogs([]);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Refresh on tab focus, and on cross-tab localStorage writes — the
    // native 'storage' event never fires in the same tab that called
    // setItem, so same-tab freshness relies on the mount-time load above
    // (this page remounts on every route navigation back to it).
    const onFocus = () => loadData();
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === 'gm_audit') loadData();
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
    };
  }, [loadData]);

  // ─── Merge + normalize ────────────────────────────────────────────
  const merged = useMemo<UnifiedAuditEntry[]>(() => {
    const backend = backendLogs.map(normalizeBackend);
    const local = localLogs
      .map(normalizeLocal)
      .filter((e): e is UnifiedAuditEntry => e !== null);
    return [...backend, ...local].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [backendLogs, localLogs]);

  // ─── Filtered ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = merged;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) =>
          l.userName.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.module.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          (l.recordId || '').toLowerCase().includes(q) ||
          (l.entityReference || '').toLowerCase().includes(q)
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
  }, [merged, search, filterModule, filterAction, dateFrom, dateTo]);

  // ─── Action styling ───────────────────────────────────────────────
  const getActionColor = (action: string) => {
    switch (action) {
      case 'LOGIN': return 'bg-indigo-50 text-indigo-700';
      case 'LOGOUT': return 'bg-gray-100 text-gray-600';
      case 'LOGIN_FAILED': return 'bg-red-50 text-red-700';
      case 'CREATE': return 'bg-blue-50 text-blue-700';
      case 'UPDATE': return 'bg-amber-50 text-amber-700';
      case 'DELETE': return 'bg-red-50 text-red-700';
      case 'CALIBRATE': return 'bg-emerald-50 text-emerald-700';
      case 'ISSUE': return 'bg-violet-50 text-violet-700';
      case 'RETURN': return 'bg-cyan-50 text-cyan-700';
      case 'CLOSE_CAPA': return 'bg-emerald-50 text-emerald-700';
      case 'EXPORT': return 'bg-indigo-50 text-indigo-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN': return <LogIn className="w-3.5 h-3.5" strokeWidth={2.5} />;
      case 'LOGOUT': return <LogOut className="w-3.5 h-3.5" strokeWidth={2.5} />;
      case 'LOGIN_FAILED': return <AlertCircle className="w-3.5 h-3.5" strokeWidth={2.5} />;
      case 'CREATE': return <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />;
      case 'UPDATE': return <Edit3 className="w-3.5 h-3.5" strokeWidth={2.5} />;
      case 'DELETE': return <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />;
      case 'CALIBRATE': return <ClipboardCheck className="w-3.5 h-3.5" strokeWidth={2.5} />;
      case 'ISSUE':
      case 'RETURN': return <ArrowLeftRight className="w-3.5 h-3.5" strokeWidth={2.5} />;
      case 'CLOSE_CAPA': return <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />;
      case 'EXPORT': return <Download className="w-3.5 h-3.5" strokeWidth={2.5} />;
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

  // ─── Stats (computed from the merged backend + local dataset) ────
  const stats = useMemo(() => ({
    total: merged.length,
    logins: merged.filter((l) => l.action === 'LOGIN').length,
    failed: merged.filter((l) => l.action === 'LOGIN_FAILED').length,
    creates: merged.filter((l) => l.action === 'CREATE').length,
    updates: merged.filter((l) => l.action === 'UPDATE').length,
    deletes: merged.filter((l) => l.action === 'DELETE').length,
  }), [merged]);

  // ─── Unique modules/actions from actual merged data ──────────────
  const availableModules = useMemo(
    () => [...new Set(merged.map((l) => l.module))].sort(),
    [merged]
  );

  const availableActions = useMemo(
    () => KNOWN_ACTIONS.filter((a) => merged.some((l) => l.action === a)),
    [merged]
  );

  // ─── Columns ──────────────────────────────────────────────────────
  const columns: Column<UnifiedAuditEntry>[] = [
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
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-gray-700">{row.userName}</span>
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${
              row.source === 'backend' ? 'bg-slate-100 text-slate-500' : 'bg-sky-50 text-sky-500'
            }`}
            title={row.source === 'backend' ? 'Recorded by the server' : 'Recorded locally in this browser'}
          >
            {row.source === 'backend' ? 'Server' : 'Local'}
          </span>
        </div>
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
          {moduleLabel(row.module)}
        </span>
      ),
    },
    {
      header: 'Description',
      cell: (row) => (
        <span className="text-sm text-gray-600 block whitespace-normal break-words min-w-[220px]">
          {row.description || '—'}
        </span>
      ),
    },
    // Entity / Reference column — disabled for now. The Description column
    // already spells out the affected record (gauge code, department name,
    // etc.) in readable form; this column mostly just duplicated that or, for
    // records with no human-readable code (Departments/Roles/Users/Auth),
    // showed a bare database primary key. Keeping the renderer around in
    // case a real business reference column is wanted later.
    // {
    //   header: 'Entity / Reference',
    //   cell: (row) => (
    //     <span className="font-mono text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
    //       {row.entityReference || row.recordId || '—'}
    //     </span>
    //   ),
    // },
    // IP Address column — disabled for now, keeping the cell renderer around
    // in case it's needed again.
    // {
    //   header: 'IP Address',
    //   cell: (row) => (
    //     <span className="text-xs text-gray-400 font-mono">
    //       {row.source === 'local' ? 'Local' : (row.ipAddress || '—')}
    //     </span>
    //   ),
    // },
  ];

  return (
    <Layout pageTitle="Audit Trail" pageSubtitle="Review a complete history of system actions and changes" pageIcon={ScrollText}>
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

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, accent: 'from-indigo-500 to-purple-500', cardBg: 'bg-gradient-to-br from-indigo-100 to-indigo-50/60', cardBorder: 'border-indigo-200' },
          { label: 'Logins', value: stats.logins, accent: 'from-emerald-500 to-teal-500', cardBg: 'bg-gradient-to-br from-emerald-100 to-emerald-50/60', cardBorder: 'border-emerald-200' },
          { label: 'Failed', value: stats.failed, accent: 'from-red-500 to-rose-500', cardBg: 'bg-gradient-to-br from-red-100 to-red-50/60', cardBorder: 'border-red-200' },
          { label: 'Creates', value: stats.creates, accent: 'from-blue-500 to-cyan-500', cardBg: 'bg-gradient-to-br from-blue-100 to-blue-50/60', cardBorder: 'border-blue-200' },
          { label: 'Updates', value: stats.updates, accent: 'from-amber-500 to-yellow-500', cardBg: 'bg-gradient-to-br from-amber-100 to-amber-50/60', cardBorder: 'border-amber-200' },
          { label: 'Deletes', value: stats.deletes, accent: 'from-orange-600 to-orange-500', cardBg: 'bg-gradient-to-br from-orange-100 to-orange-50/60', cardBorder: 'border-orange-200' },
        ].map((s) => (
          <div key={s.label} className={`${s.cardBg} rounded-xl p-3.5 shadow-sm border ${s.cardBorder} relative overflow-hidden`}>
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
                placeholder="Search user, action, description, gauge…"
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
                  <option key={m} value={m}>{moduleLabel(m)}</option>
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
              {availableActions.map((a) => (
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
          {filtered.length} of {merged.length}
        </span>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(r) => r.id}
        loading={loading}
        emptyTitle="No audit log entries"
        emptySubtitle="Actions will be recorded as users interact with the system."
        emptyIcon={<ScrollText className="w-8 h-8 text-gray-300" strokeWidth={1.5} />}
        compact
      />
    </Layout>
  );
}
// // src/pages/GaugeMaster.tsx

// import { useState, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Layout from '../components/Layout';
// import DataTable, { type Column } from '../components/DataTable';
// import StatusBadge from '../components/StatusBadge';
// import Modal from '../components/Modal';
// import {
//   gaugeStorage,
//   departmentStorage,
//   auditStorage,
//   generateId,
//   type Gauge,
// } from '../utils/storage';
// import { GAUGE_TYPES } from '../utils/constants';
// import {
//   Gauge as GaugeIcon,
//   Plus,
//   Search,
//   Filter,
//   Edit3,
//   Trash2,
//   AlertCircle,
// } from 'lucide-react';

// const STATUS_OPTIONS: Gauge['status'][] = [
//   'Available',
//   'Issued',
//   'Under Calibration',
//   'Scrapped',
// ];

// const emptyForm: Omit<Gauge, 'id'> = {
//   gaugeCode: '',
//   name: '',
//   type: '',
//   range: '',
//   leastCount: '',
//   department: '',
//   location: '',
//   frequencyMonths: 6,
//   status: 'Available',
//   lastCalibrationDate: '',
//   nextDueDate: '',
// };

// export default function GaugeMaster() {
//   const navigate = useNavigate();

//   const [gauges, setGauges] = useState<Gauge[]>(gaugeStorage.getAll());
//   const [search, setSearch] = useState('');
//   const [filterDept, setFilterDept] = useState('');
//   const [filterStatus, setFilterStatus] = useState('');

//   const [modalOpen, setModalOpen] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [form, setForm] = useState(emptyForm);
//   const [formError, setFormError] = useState('');

//   const [deleteId, setDeleteId] = useState<string | null>(null);

//   const departments = departmentStorage.getAll();

//   // ─── Filtering ────────────────────────────────────────────────────
//   const filtered = useMemo(() => {
//     let list = gauges;
//     if (search) {
//       const q = search.toLowerCase();
//       list = list.filter(
//         (g) =>
//           g.gaugeCode.toLowerCase().includes(q) ||
//           g.name.toLowerCase().includes(q) ||
//           g.type.toLowerCase().includes(q)
//       );
//     }
//     if (filterDept) list = list.filter((g) => g.department === filterDept);
//     if (filterStatus) list = list.filter((g) => g.status === filterStatus);
//     return list;
//   }, [gauges, search, filterDept, filterStatus]);

//   // ─── Helpers ──────────────────────────────────────────────────────
//   const reload = () => setGauges(gaugeStorage.getAll());

//   const getDueStatus = (dateStr: string) => {
//     if (!dateStr) return '';
//     const diff = (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
//     if (diff < 0) return 'Overdue';
//     if (diff <= 30) return 'Due Soon';
//     return '';
//   };

//   const openAdd = () => {
//     setEditingId(null);
//     setForm(emptyForm);
//     setFormError('');
//     setModalOpen(true);
//   };

//   const openEdit = (g: Gauge) => {
//     setEditingId(g.id);
//     const { id, ...rest } = g;
//     setForm(rest);
//     setFormError('');
//     setModalOpen(true);
//   };

//   const handleSave = () => {
//     if (!form.gaugeCode.trim() || !form.name.trim() || !form.type) {
//       setFormError('Gauge Code, Name, and Type are required.');
//       return;
//     }

//     if (editingId) {
//       gaugeStorage.update(editingId, form);
//       auditStorage.add({
//         action: 'UPDATE',
//         entityType: 'Gauge',
//         entityId: editingId,
//         userId: 'current',
//         timestamp: new Date().toISOString(),
//       });
//     } else {
//       const created = gaugeStorage.add(form);
//       auditStorage.add({
//         action: 'CREATE',
//         entityType: 'Gauge',
//         entityId: created.id,
//         userId: 'current',
//         timestamp: new Date().toISOString(),
//       });
//     }
//     reload();
//     setModalOpen(false);
//   };

//   const handleDelete = () => {
//     if (!deleteId) return;
//     gaugeStorage.delete(deleteId);
//     auditStorage.add({
//       action: 'DELETE',
//       entityType: 'Gauge',
//       entityId: deleteId,
//       userId: 'current',
//       timestamp: new Date().toISOString(),
//     });
//     reload();
//     setDeleteId(null);
//   };

//   const updateField = <K extends keyof Omit<Gauge, 'id'>>(
//     key: K,
//     value: Omit<Gauge, 'id'>[K]
//   ) => setForm((prev) => ({ ...prev, [key]: value }));

//   // ─── Table Columns ────────────────────────────────────────────────
//   const columns: Column<Gauge>[] = [
//     {
//       header: 'Gauge Code',
//       cell: (row) => (
//         <span className="font-bold text-indigo-600">{row.gaugeCode}</span>
//       ),
//     },
//     { header: 'Name', accessor: 'name' },
//     { header: 'Type', accessor: 'type' },
//     { header: 'Department', accessor: 'department' },
//     {
//       header: 'Status',
//       cell: (row) => <StatusBadge status={row.status} />,
//     },
//     {
//       header: 'Next Due',
//       cell: (row) => {
//         const due = getDueStatus(row.nextDueDate);
//         return (
//           <div className="flex items-center gap-2">
//             <span className="text-gray-700">{row.nextDueDate || '—'}</span>
//             {due && <StatusBadge status={due} />}
//           </div>
//         );
//       },
//     },
//     {
//       header: 'Actions',
//       width: '120px',
//       align: 'center',
//       cell: (row) => (
//         <div className="flex items-center justify-center gap-1">
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               openEdit(row);
//             }}
//             className="p-1.5 hover:bg-indigo-50 rounded-lg transition text-indigo-500"
//             title="Edit"
//           >
//             <Edit3 className="w-4 h-4" strokeWidth={2} />
//           </button>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               setDeleteId(row.id);
//             }}
//             className="p-1.5 hover:bg-red-50 rounded-lg transition text-red-500"
//             title="Delete"
//           >
//             <Trash2 className="w-4 h-4" strokeWidth={2} />
//           </button>
//         </div>
//       ),
//     },
//   ];

//   // ─── Render ───────────────────────────────────────────────────────
//   return (
//     <Layout pageTitle="Gauge Master">
//       {/* Stats Row */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//         {[
//           {
//             label: 'Total',
//             value: gauges.length,
//             accent: 'from-indigo-500 to-purple-500',
//             bg: 'bg-indigo-50',
//             text: 'text-indigo-600',
//           },
//           {
//             label: 'Available',
//             value: gauges.filter((g) => g.status === 'Available').length,
//             accent: 'from-emerald-500 to-teal-500',
//             bg: 'bg-emerald-50',
//             text: 'text-emerald-600',
//           },
//           {
//             label: 'Issued',
//             value: gauges.filter((g) => g.status === 'Issued').length,
//             accent: 'from-blue-500 to-cyan-500',
//             bg: 'bg-blue-50',
//             text: 'text-blue-600',
//           },
//           {
//             label: 'Overdue',
//             value: gauges.filter((g) => getDueStatus(g.nextDueDate) === 'Overdue').length,
//             accent: 'from-red-500 to-rose-500',
//             bg: 'bg-red-50',
//             text: 'text-red-600',
//           },
//         ].map((stat) => (
//           <div
//             key={stat.label}
//             className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative overflow-hidden"
//           >
//             <div
//               className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${stat.accent}`}
//             />
//             <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
//               {stat.label}
//             </p>
//             <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
//           </div>
//         ))}
//       </div>

//       {/* Top Bar */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
//         <div className="flex items-center gap-3 flex-1 max-w-xl">
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
//             <input
//               type="text"
//               placeholder="Search gauge code, name, type…"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
//             />
//           </div>

//           <div className="relative">
//             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
//             <select
//               value={filterDept}
//               onChange={(e) => setFilterDept(e.target.value)}
//               className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition appearance-none cursor-pointer"
//             >
//               <option value="">All Departments</option>
//               {departments.map((d) => (
//                 <option key={d.id} value={d.name}>
//                   {d.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <select
//             value={filterStatus}
//             onChange={(e) => setFilterStatus(e.target.value)}
//             className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition appearance-none cursor-pointer"
//           >
//             <option value="">All Status</option>
//             {STATUS_OPTIONS.map((s) => (
//               <option key={s} value={s}>
//                 {s}
//               </option>
//             ))}
//           </select>
//         </div>

//         <button
//           onClick={openAdd}
//           className="flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition text-sm"
//           style={{
//             background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
//           }}
//         >
//           <Plus className="w-4 h-4" strokeWidth={2.5} />
//           Add Gauge
//         </button>
//       </div>

//       {/* Table */}
//       <DataTable
//         columns={columns}
//         data={filtered}
//         keyExtractor={(row) => row.id}
//         onRowClick={(row) => navigate(`/gauges/${row.id}`)}
//         emptyTitle="No gauges found"
//         emptySubtitle="Add your first gauge to get started."
//         emptyIcon={
//           <GaugeIcon className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
//         }
//       />

//       {/* ─── Add / Edit Modal ──────────────────────────────────────── */}
//       <Modal
//         open={modalOpen}
//         onClose={() => setModalOpen(false)}
//         title={editingId ? 'Edit Gauge' : 'Add New Gauge'}
//         subtitle={editingId ? `Editing ${form.gaugeCode}` : 'Fill in the gauge details below'}
//         maxWidth="xl"
//         footer={
//           <>
//             <button
//               onClick={() => setModalOpen(false)}
//               className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSave}
//               className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm"
//               style={{
//                 background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
//               }}
//             >
//               {editingId ? 'Update' : 'Create'} Gauge
//             </button>
//           </>
//         }
//       >
//         {formError && (
//           <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
//             <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
//             {formError}
//           </div>
//         )}

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {/* Gauge Code */}
//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Gauge Code <span className="text-red-500">*</span>
//             </label>
//             <input
//               value={form.gaugeCode}
//               onChange={(e) => updateField('gaugeCode', e.target.value)}
//               placeholder="e.g. VNR-001"
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//             />
//           </div>

//           {/* Name */}
//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Name <span className="text-red-500">*</span>
//             </label>
//             <input
//               value={form.name}
//               onChange={(e) => updateField('name', e.target.value)}
//               placeholder="e.g. Vernier Caliper 150mm"
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//             />
//           </div>

//           {/* Type */}
//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Type <span className="text-red-500">*</span>
//             </label>
//             <select
//               value={form.type}
//               onChange={(e) => updateField('type', e.target.value)}
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
//             >
//               <option value="">Select type</option>
//               {GAUGE_TYPES.map((t) => (
//                 <option key={t} value={t}>
//                   {t}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Range */}
//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Range
//             </label>
//             <input
//               value={form.range}
//               onChange={(e) => updateField('range', e.target.value)}
//               placeholder="e.g. 0–150mm"
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//             />
//           </div>

//           {/* Least Count */}
//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Least Count
//             </label>
//             <input
//               value={form.leastCount}
//               onChange={(e) => updateField('leastCount', e.target.value)}
//               placeholder="e.g. 0.02mm"
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//             />
//           </div>

//           {/* Department */}
//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Department
//             </label>
//             <select
//               value={form.department}
//               onChange={(e) => updateField('department', e.target.value)}
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
//             >
//               <option value="">Select department</option>
//               {departments.map((d) => (
//                 <option key={d.id} value={d.name}>
//                   {d.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Location */}
//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Location
//             </label>
//             <input
//               value={form.location}
//               onChange={(e) => updateField('location', e.target.value)}
//               placeholder="e.g. QC Lab Shelf A1"
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//             />
//           </div>

//           {/* Frequency */}
//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Calibration Frequency (months)
//             </label>
//             <input
//               type="number"
//               min={1}
//               value={form.frequencyMonths}
//               onChange={(e) =>
//                 updateField('frequencyMonths', parseInt(e.target.value) || 6)
//               }
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//             />
//           </div>

//           {/* Status */}
//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Status
//             </label>
//             <select
//               value={form.status}
//               onChange={(e) =>
//                 updateField('status', e.target.value as Gauge['status'])
//               }
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
//             >
//               {STATUS_OPTIONS.map((s) => (
//                 <option key={s} value={s}>
//                   {s}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Last Calibration Date */}
//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Last Calibration Date
//             </label>
//             <input
//               type="date"
//               value={form.lastCalibrationDate}
//               onChange={(e) =>
//                 updateField('lastCalibrationDate', e.target.value)
//               }
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//             />
//           </div>

//           {/* Next Due Date */}
//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Next Due Date
//             </label>
//             <input
//               type="date"
//               value={form.nextDueDate}
//               onChange={(e) => updateField('nextDueDate', e.target.value)}
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//             />
//           </div>
//         </div>
//       </Modal>

//       {/* ─── Delete Confirmation Modal ─────────────────────────────── */}
//       <Modal
//         open={!!deleteId}
//         onClose={() => setDeleteId(null)}
//         title="Delete Gauge"
//         subtitle="This action cannot be undone."
//         maxWidth="sm"
//         footer={
//           <>
//             <button
//               onClick={() => setDeleteId(null)}
//               className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleDelete}
//               className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-md transition text-sm"
//             >
//               Delete
//             </button>
//           </>
//         }
//       >
//         <div className="flex flex-col items-center text-center py-4">
//           <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
//             <Trash2 className="w-7 h-7 text-red-500" strokeWidth={2} />
//           </div>
//           <p className="text-gray-700">
//             Are you sure you want to delete gauge{' '}
//             <span className="font-bold">
//               {gauges.find((g) => g.id === deleteId)?.gaugeCode}
//             </span>
//             ?
//           </p>
//         </div>
//       </Modal>
//     </Layout>
//   );
// }


// src/pages/GaugeMaster.tsx

// src/pages/GaugeMaster.tsx

import { useState, useMemo, useRef, useEffect, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import ExcelJS from 'exceljs';
import Layout from '../components/Layout';
import DataTable, { type Column } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import {
  gaugeStorage,
  locationStorage,
  auditStorage,
  auditActor,
  generateId,
  getQuarantineReason,
  type Gauge,
} from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { departmentsAPI, type DepartmentType } from '../api/api';
import {
  Gauge as GaugeIcon,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  AlertCircle,
  MapPin,
  Package,
  Ruler,
  Building2,
  Calendar,
  Activity,
  ImagePlus,
  X,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

const GAUGE_TYPES = [
  'Vernier Caliper', 'Micrometer', 'Height Gauge', 'Dial Indicator',
  'Feeler Gauge', 'Ring Gauge', 'Plug Gauge', 'Roughness Tester',
  'Torque Wrench', 'Bore Gauge', 'Thread Gauge', 'Other',
];

const STATUS_OPTIONS: Gauge['status'][] = [
  'Available', 'Issued', 'Under Calibration', 'Under MSA Study', 'Under Review', 'Scrapped',
];

// ─── Excel/CSV Import ─────────────────────────────────────────────────
const IMPORT_COLUMNS: { header: string; key: keyof Omit<Gauge, 'id' | 'image'> }[] = [
  { header: 'Gauge Code', key: 'gaugeCode' },
  { header: 'Name', key: 'name' },
  { header: 'Type', key: 'type' },
  { header: 'Range', key: 'range' },
  { header: 'Least Count', key: 'leastCount' },
  { header: 'Department', key: 'department' },
  { header: 'Location', key: 'location' },
  { header: 'Calibration Frequency (Months)', key: 'frequencyMonths' },
  { header: 'Status', key: 'status' },
  { header: 'Last Calibration Date (YYYY-MM-DD)', key: 'lastCalibrationDate' },
  { header: 'Next Due Date (YYYY-MM-DD)', key: 'nextDueDate' },
];

const normalizeHeader = (h: string) => h.toLowerCase().replace(/[^a-z0-9]/g, '');

// Reads any worksheet into a plain string[][] table (dates → YYYY-MM-DD text).
function worksheetToTable(ws: ExcelJS.Worksheet): string[][] {
  const table: string[][] = [];
  ws.eachRow({ includeEmpty: false }, (row) => {
    const cells: string[] = [];
    row.eachCell({ includeEmpty: true }, (cell) => {
      const v = cell.value as unknown;
      if (v instanceof Date) {
        cells.push(v.toISOString().split('T')[0]);
      } else if (v && typeof v === 'object' && 'text' in (v as Record<string, unknown>)) {
        cells.push(String((v as { text?: unknown }).text ?? ''));
      } else if (v === null || v === undefined) {
        cells.push('');
      } else {
        cells.push(String(v));
      }
    });
    table.push(cells);
  });
  return table.filter((r) => r.some((c) => c.trim() !== ''));
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (char === '"' && next === '"') { field += '"'; i++; }
      else if (char === '"') { inQuotes = false; }
      else { field += char; }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field); field = '';
    } else if (char === '\r') {
      // skip
    } else if (char === '\n') {
      row.push(field); rows.push(row); row = []; field = '';
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

const normalizeDate = (raw: string): string => {
  const value = (raw || '').trim();
  if (!value) return '';
  let d = new Date(value);
  if (!isNaN(d.getTime()) && /\d{4}/.test(value)) {
    return d.toISOString().split('T')[0];
  }
  const m = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) {
    const [, dd, mm, yyyy] = m;
    d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  }
  return '';
};

interface ImportRow {
  rowNum: number;
  data: Omit<Gauge, 'id'>;
  errors: string[];
  warnings: string[];
  matchedGaugeId: string | null;
}

const emptyForm: Omit<Gauge, 'id'> = {
  gaugeCode: '', name: '', image: '', type: '', range: '', leastCount: '',
  department: '', location: '', frequencyMonths: 6, status: 'Available',
  lastCalibrationDate: '', nextDueDate: '',
};

export default function GaugeMaster() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gauges, setGauges] = useState<Gauge[]>(gaugeStorage.getAll());
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const [addLocOpen, setAddLocOpen] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocDesc, setNewLocDesc] = useState('');

  const [departments, setDepartments] = useState<DepartmentType[]>([]);

  // ─── Excel/CSV Import ─────────────────────────────────────────────
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'done'>('upload');
  const [importFileName, setImportFileName] = useState('');
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importResult, setImportResult] = useState({ created: 0, updated: 0 });
  const [importParseError, setImportParseError] = useState('');
  const importFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    departmentsAPI
      .list()
      .then((data) => setDepartments(Array.isArray(data) ? data : []))
      .catch(() => setDepartments([]));
  }, []);

  const deptLocations = useMemo(
    () => form.department ? locationStorage.getByDepartment(form.department) : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form.department, addLocOpen]
  );

  const filtered = useMemo(() => {
    let list = gauges;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((g) =>
        g.gaugeCode.toLowerCase().includes(q) ||
        g.name.toLowerCase().includes(q) ||
        g.type.toLowerCase().includes(q)
      );
    }
    if (filterDept) list = list.filter((g) => g.department === filterDept);
    if (filterStatus) list = list.filter((g) => g.status === filterStatus);
    return list;
  }, [gauges, search, filterDept, filterStatus]);

  const reload = () => setGauges(gaugeStorage.getAll());

  const getDueStatus = (dateStr: string) => {
    if (!dateStr) return '';
    const diff = (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return 'Overdue';
    if (diff <= 30) return 'Due Soon';
    return '';
  };

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setFormError(''); setModalOpen(true); };

  const openEdit = (g: Gauge) => {
    setEditingId(g.id);
    const { id, ...rest } = g;
    setForm(rest);
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.gaugeCode.trim() || !form.name.trim() || !form.type) {
      setFormError('Gauge Code, Name, and Type are required.');
      return;
    }
    if (editingId) {
      gaugeStorage.update(editingId, form);
      auditStorage.add({
        action: 'UPDATE', entityType: 'Gauge', entityId: editingId,
        entityReference: form.gaugeCode, description: `Updated gauge ${form.gaugeCode}`,
        ...auditActor(user), timestamp: new Date().toISOString(),
      });
    } else {
      const created = gaugeStorage.add(form);
      auditStorage.add({
        action: 'CREATE', entityType: 'Gauge', entityId: created.id,
        entityReference: created.gaugeCode, description: `Created gauge ${created.gaugeCode}`,
        ...auditActor(user), timestamp: new Date().toISOString(),
      });
    }
    reload(); setModalOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const gaugeToDelete = gauges.find((g) => g.id === deleteId);
    gaugeStorage.delete(deleteId);
    auditStorage.add({
      action: 'DELETE', entityType: 'Gauge', entityId: deleteId,
      entityReference: gaugeToDelete?.gaugeCode,
      description: `Deleted gauge ${gaugeToDelete?.gaugeCode || deleteId}`,
      ...auditActor(user), timestamp: new Date().toISOString(),
    });
    reload(); setDeleteId(null);
  };

  const handleAddLocation = () => {
    if (!newLocName.trim() || !form.department) return;
    const dept = departments.find((d) => d.name === form.department);
    const newLoc = locationStorage.add({
      name: newLocName.trim(),
      departmentId: dept ? String(dept.id) : '',
      departmentName: form.department,
      description: newLocDesc.trim(),
      isActive: true,
    });
    setForm((prev) => ({ ...prev, location: newLoc.name }));
    setNewLocName(''); setNewLocDesc(''); setAddLocOpen(false);
    auditStorage.add({
      action: 'CREATE', entityType: 'Location', entityId: newLoc.id,
      entityReference: newLoc.name, description: `Created location ${newLoc.name}`,
      ...auditActor(user), timestamp: new Date().toISOString(),
    });
  };

  const updateField = <K extends keyof Omit<Gauge, 'id'>>(key: K, value: Omit<Gauge, 'id'>[K]) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === 'department') updated.location = '';
      return updated;
    });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateField('image', reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ─── Auto-calculate Next Due Date from Last Calibration Date + Frequency ───
  const calcNextDue = (lastCalDate: string, months: number): string => {
    if (!lastCalDate) return '';
    const d = new Date(lastCalDate);
    if (isNaN(d.getTime())) return '';
    d.setMonth(d.getMonth() + (months || 0));
    return d.toISOString().split('T')[0];
  };

  // ─── Excel/CSV Import ───────────────────────────────────────────────
  const openImportModal = () => {
    setImportRows([]);
    setImportFileName('');
    setImportParseError('');
    setImportStep('upload');
    setImportModalOpen(true);
  };

  const downloadTemplate = async () => {
    const wb = new ExcelJS.Workbook();

    // ─── Instructions sheet (opens first) ────────────────────────────
    const info = wb.addWorksheet('Instructions');
    info.getColumn(1).width = 100;
    let r = 1;
    const addLine = (text: string, opts: { bold?: boolean; size?: number } = {}) => {
      const cell = info.getRow(r++).getCell(1);
      cell.value = text;
      cell.font = { bold: !!opts.bold, size: opts.size || 11 };
      cell.alignment = { wrapText: true, vertical: 'top' };
    };
    addLine('How to fill this template', { bold: true, size: 14 });
    addLine('');
    addLine('1. Switch to the "Gauge Data" tab below and enter one row per gauge.');
    addLine('2. Required for every row: Gauge Code, Name, Type, Department.');
    addLine('3. Department must exactly match a department already set up in the system (Administration → Departments).');
    addLine('4. Status: leave blank to default to "Available". Otherwise use one of: Available, Issued, Under Calibration, Under MSA Study, Under Review, Scrapped.');
    addLine('5. Calibration Frequency (Months): leave blank to default to 6.');
    addLine('6. Last Calibration Date: enter as YYYY-MM-DD (e.g. 2026-01-15). Leave blank if the gauge has not been calibrated yet.');
    addLine('7. Next Due Date: you do NOT need to fill this in — it is calculated automatically from Last Calibration Date + Calibration Frequency. Only enter a value here if you want to override the automatic calculation.');
    addLine('8. If a Gauge Code you enter already exists in the system, that existing gauge will be UPDATED with your new data instead of creating a duplicate.');
    addLine('9. Save this file and upload it back on the Gauge Master page using "Import Excel".');
    addLine('10. Image (optional): click the "Image" cell in that gauge\'s row, then Insert → Pictures → This Device, choose the photo, and drag/resize it so it fits neatly inside that row without overlapping into the row above or below. Each picture is matched to a gauge by which row it sits in.');
    addLine('Note: Row 2 in "Gauge Data" is an example — replace it with your own data (or delete the row) before importing.');

    // ─── Data sheet — header + one example row ───────────────────────
    const data = wb.addWorksheet('Gauge Data');
    data.properties.defaultRowHeight = 90;
    data.columns = [
      ...IMPORT_COLUMNS.map((c) => ({ header: c.header, key: c.key, width: 22 })),
      { header: 'Image (insert picture here)', key: 'imageCol', width: 20 },
    ];
    data.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    data.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF6366F1' },
    };
    // Force date columns to plain text so Excel never auto-converts them
    // into date serials (avoids the "####" column-width overflow issue
    // and locale-dependent reformatting on save).
    data.getColumn('lastCalibrationDate').numFmt = '@';
    data.getColumn('nextDueDate').numFmt = '@';

    data.addRow({
      gaugeCode: 'VNR-005',
      name: 'Vernier Caliper 200mm',
      type: 'Vernier Caliper',
      range: '0-200mm',
      leastCount: '0.02mm',
      department: 'Quality Control',
      location: 'QC Lab Shelf A2',
      frequencyMonths: 6,
      status: 'Available',
      lastCalibrationDate: '2026-01-15',
      nextDueDate: '',
    });

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gauge_import_template.xlsx';
    link.click();
    URL.revokeObjectURL(url);
  };

  const validateImportRow = (
    raw: Record<string, string>,
    rowNum: number,
    seenCodes: Set<string>,
    rowImage?: string
  ): ImportRow => {
    const errors: string[] = [];
    const warnings: string[] = [];

    const gaugeCode = (raw.gaugeCode || '').trim();
    const name = (raw.name || '').trim();
    const type = (raw.type || '').trim();
    const department = (raw.department || '').trim();

    if (!gaugeCode) errors.push('Gauge Code is required');
    else if (seenCodes.has(gaugeCode.toLowerCase())) errors.push('Duplicate Gauge Code in this file');
    else seenCodes.add(gaugeCode.toLowerCase());

    if (!name) errors.push('Name is required');
    if (!type) errors.push('Type is required');

    if (!department) {
      errors.push('Department is required');
    } else if (!departments.some((d) => d.name.toLowerCase() === department.toLowerCase())) {
      errors.push(`Department "${department}" does not exist — add it under Administration → Departments first`);
    }

    let status = (raw.status || 'Available').trim() as Gauge['status'];
    if (!STATUS_OPTIONS.includes(status)) {
      if (raw.status?.trim()) warnings.push(`Unknown status "${raw.status}" — defaulted to Available`);
      status = 'Available';
    }

    const frequencyMonths = parseInt(raw.frequencyMonths, 10) || 6;
    const lastCalibrationDate = normalizeDate(raw.lastCalibrationDate || '');
    let nextDueDate = normalizeDate(raw.nextDueDate || '');
    if (!nextDueDate && lastCalibrationDate) {
      nextDueDate = calcNextDue(lastCalibrationDate, frequencyMonths);
    }

    const existing = gaugeCode
      ? gauges.find((g) => g.gaugeCode.toLowerCase() === gaugeCode.toLowerCase())
      : undefined;

    return {
      rowNum,
      data: {
        gaugeCode, name, type,
        range: (raw.range || '').trim(),
        leastCount: (raw.leastCount || '').trim(),
        department,
        location: (raw.location || '').trim(),
        frequencyMonths,
        status,
        lastCalibrationDate,
        nextDueDate,
        image: rowImage || existing?.image || '',
      },
      errors,
      warnings,
      matchedGaugeId: existing?.id || null,
    };
  };

  const buildImportRows = (table: string[][], rowImages: Record<number, string> = {}): ImportRow[] => {
    const headerRow = table[0];
    const keyForCol = headerRow.map((h) => {
      const norm = normalizeHeader(h);
      return IMPORT_COLUMNS.find((c) => normalizeHeader(c.header) === norm)?.key || null;
    });

    const seenCodes = new Set<string>();
    return table.slice(1).map((cells, idx) => {
      const raw: Record<string, string> = {};
      keyForCol.forEach((key, colIdx) => {
        if (key) raw[key] = cells[colIdx] ?? '';
      });
      const rowNum = idx + 2;
      return validateImportRow(raw, rowNum, seenCodes, rowImages[rowNum]);
    });
  };

  // Reads embedded pictures from a worksheet and maps each one to the Excel
  // row it's anchored to (by top-left corner), as a base64 data URL.
  const extractRowImages = (
    wb: ExcelJS.Workbook,
    ws: ExcelJS.Worksheet
  ): Record<number, string> => {
    const map: Record<number, string> = {};
    const bufferToBase64 = (buf: unknown): string => {
      const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf as ArrayBuffer);
      let binary = '';
      const chunkSize = 0x8000;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
      }
      return btoa(binary);
    };
    ws.getImages().forEach((img) => {
      const media = wb.model.media?.[Number(img.imageId)];
      if (!media?.buffer) return;
      const rowNum = Math.round(img.range.tl.nativeRow) + 1;
      const base64 = bufferToBase64(media.buffer);
      map[rowNum] = `data:image/${media.extension};base64,${base64}`;
    });
    return map;
  };

  const handleImportFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    setImportParseError('');
    e.target.value = '';

    try {
      let table: string[][] = [];
      let rowImages: Record<number, string> = {};

      if (/\.csv$/i.test(file.name)) {
        table = parseCSV(await file.text());
      } else {
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(await file.arrayBuffer());
        const ws = wb.getWorksheet('Gauge Data') || wb.worksheets[wb.worksheets.length - 1];
        table = ws ? worksheetToTable(ws) : [];
        if (ws) rowImages = extractRowImages(wb, ws);
      }

      if (table.length < 2) {
        setImportRows([]);
        setImportStep('preview');
        return;
      }
      setImportRows(buildImportRows(table, rowImages));
      setImportStep('preview');
    } catch {
      setImportRows([]);
      setImportParseError('Could not read this file. Please upload the .xlsx template (or a .csv export of it).');
      setImportStep('preview');
    }
  };

  const handleConfirmImport = () => {
    const validRows = importRows.filter((r) => r.errors.length === 0);
    let created = 0;
    let updated = 0;
    validRows.forEach((r) => {
      if (r.matchedGaugeId) {
        gaugeStorage.update(r.matchedGaugeId, r.data);
        updated++;
      } else {
        gaugeStorage.add(r.data);
        created++;
      }
    });
    auditStorage.add({
      action: 'CREATE',
      entityType: 'Gauge',
      entityId: 'bulk-import',
      description: `Bulk imported gauges (${created} created, ${updated} updated)`,
      ...auditActor(user),
      timestamp: new Date().toISOString(),
    });
    reload();
    setImportResult({ created, updated });
    setImportStep('done');
  };

  const columns: Column<Gauge>[] = [
    { header: 'Gauge Code', cell: (r) => <span className="font-bold text-indigo-600">{r.gaugeCode}</span> },
    { header: 'Name', cell: (r) => <span>{r.name}</span> },
    {
      header: 'Image',
      width: '96px',
      align: 'center' as const,
      cell: (r) =>
        r.image ? (
          <img
            src={r.image}
            alt={r.name}
            className="w-16 h-12 object-contain rounded-lg border border-gray-200 bg-white mx-auto"
          />
        ) : (
          <div className="w-16 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto">
            <GaugeIcon className="w-4 h-4 text-gray-300" strokeWidth={1.5} />
          </div>
        ),
    },
    { header: 'Type', cell: (r) => <span>{r.type}</span> },
    { header: 'Department', cell: (r) => <span>{r.department}</span> },
    { header: 'Location', cell: (r) => (
      <div className="flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
        <span className="text-sm">{r.location || '—'}</span>
      </div>
    )},
    // { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
    {
      header: 'Status',
      cell: (row) => (
        <div>
          <StatusBadge status={row.status} />
          {row.status === 'Under Review' && (
            <p className="text-[10px] text-red-500 mt-1">
              {getQuarantineReason(row.id)}
            </p>
          )}
        </div>
      ),
    },
    { header: 'Next Due', cell: (r) => {
      const due = getDueStatus(r.nextDueDate);
      return (
        <div className="flex items-center gap-2">
          <span>{r.nextDueDate || '—'}</span>
          {due && <StatusBadge status={due} />}
        </div>
      );
    }},
    { header: 'Actions', width: '120px', align: 'center' as const, cell: (r) => (
      <div className="flex items-center justify-center gap-1">
        <button onClick={(e) => { e.stopPropagation(); openEdit(r); }} className="p-1.5 hover:bg-indigo-50 rounded-lg transition text-indigo-500" title="Edit">
          <Edit3 className="w-4 h-4" strokeWidth={2} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); setDeleteId(r.id); }} className="p-1.5 hover:bg-red-50 rounded-lg transition text-red-500" title="Delete">
          <Trash2 className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    )},
  ];

  return (
    <Layout pageTitle="Gauge Master" pageSubtitle="Manage your gauge inventory, specifications, and status" pageIcon={GaugeIcon}>

      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
            <input type="text" placeholder="Search gauge code, name, type…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition" />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
            <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition appearance-none cursor-pointer">
              <option value="">All Departments</option>
              {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition appearance-none cursor-pointer">
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openImportModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200 transition text-sm">
            <FileSpreadsheet className="w-4 h-4 text-indigo-500" strokeWidth={2} />Import Excel
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition text-sm"
            style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }}>
            <Plus className="w-4 h-4" strokeWidth={2.5} />Add Gauge
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: gauges.length, accent: 'from-indigo-500 to-purple-500', cardBg: 'bg-gradient-to-br from-indigo-100 to-indigo-50/60', cardBorder: 'border-indigo-200' },
          { label: 'Available', value: gauges.filter((g) => g.status === 'Available').length, accent: 'from-emerald-500 to-teal-500', cardBg: 'bg-gradient-to-br from-emerald-100 to-emerald-50/60', cardBorder: 'border-emerald-200' },
          { label: 'Issued', value: gauges.filter((g) => g.status === 'Issued').length, accent: 'from-blue-500 to-cyan-500', cardBg: 'bg-gradient-to-br from-blue-100 to-blue-50/60', cardBorder: 'border-blue-200' },
          { label: 'Overdue', value: gauges.filter((g) => getDueStatus(g.nextDueDate) === 'Overdue').length, accent: 'from-red-500 to-rose-500', cardBg: 'bg-gradient-to-br from-red-100 to-red-50/60', cardBorder: 'border-red-200' },
        ].map((s) => (
          <div key={s.label} className={`${s.cardBg} rounded-xl p-4 shadow-sm border ${s.cardBorder} relative overflow-hidden`}>
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${s.accent}`} />
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{s.label}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filtered} keyExtractor={(r) => r.id}
        onRowClick={(r) => navigate(`/gauges/${r.id}`)}
        emptyTitle="No gauges found" emptySubtitle="Add your first gauge to get started."
        emptyIcon={<GaugeIcon className="w-8 h-8 text-gray-300" strokeWidth={1.5} />} />

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ADD / EDIT GAUGE MODAL — Redesigned with sections               */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Gauge' : 'Add New Gauge'}
        subtitle={editingId ? `Editing ${form.gaugeCode}` : 'Fill in the gauge details below'}
        maxWidth="2xl"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm">
              Cancel
            </button>
            <button onClick={handleSave} className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm"
              style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }}>
              {editingId ? 'Update' : 'Create'} Gauge
            </button>
          </>
        }
      >
        {formError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
            {formError}
          </div>
        )}

        <div className="space-y-5">
          {/* ─── Section 1: Basic Info ────────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-gray-500" strokeWidth={2} />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Basic Information
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  Gauge Code <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.gaugeCode}
                  onChange={(e) => updateField('gaugeCode', e.target.value)}
                  placeholder="e.g. VNR-001"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g. Vernier Caliper 150mm"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.type}
                  onChange={(e) => updateField('type', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
                >
                  <option value="">Select type</option>
                  {GAUGE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => updateField('status', e.target.value as Gauge['status'])}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ─── Gauge Image ──────────────────────────────────────── */}
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">
              Gauge Image
            </label>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold rounded-xl transition text-sm"
              >
                <ImagePlus className="w-4 h-4" strokeWidth={2} />
                Choose Image
              </button>
              {form.image && (
                <div className="relative">
                  <img
                    src={form.image}
                    alt="Gauge preview"
                    className="w-24 h-16 object-contain rounded-lg border border-gray-200 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => updateField('image', '')}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition"
                    title="Remove image"
                  >
                    <X className="w-3 h-3" strokeWidth={2.5} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ─── Section 2: Technical Specs ───────────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Ruler className="w-4 h-4 text-gray-500" strokeWidth={2} />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Technical Specifications
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">Range</label>
                <input
                  value={form.range}
                  onChange={(e) => updateField('range', e.target.value)}
                  placeholder="e.g. 0–150mm"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">Least Count</label>
                <input
                  value={form.leastCount}
                  onChange={(e) => updateField('leastCount', e.target.value)}
                  placeholder="e.g. 0.02mm"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  Cal. Frequency (months)
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.frequencyMonths}
                  onChange={(e) => {
                    const months = parseInt(e.target.value) || 6;
                    setForm((prev) => ({
                      ...prev,
                      frequencyMonths: months,
                      nextDueDate: prev.lastCalibrationDate
                        ? calcNextDue(prev.lastCalibrationDate, months)
                        : prev.nextDueDate,
                    }));
                  }}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
                />
              </div>
            </div>
          </div>

          {/* ─── Section 3: Department & Location (highlighted) ─── */}
          <div className="bg-indigo-50/50 rounded-xl border border-indigo-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-indigo-600" strokeWidth={2} />
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Department & Location
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">Department</label>
                <select
                  value={form.department}
                  onChange={(e) => updateField('department', e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm appearance-none cursor-pointer"
                >
                  <option value="">Select department</option>
                  {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">Location</label>
                {!form.department ? (
                  <div className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-400">
                    Select a department first
                  </div>
                ) : (
                  <div className="flex gap-2 items-stretch">
                    <select
                      value={form.location}
                      onChange={(e) => updateField('location', e.target.value)}
                      className="flex-1 min-w-0 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm appearance-none cursor-pointer"
                    >
                      <option value="">Select location</option>
                      {deptLocations.map((loc) => (
                        <option key={loc.id} value={loc.name}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => { setNewLocName(''); setNewLocDesc(''); setAddLocOpen(true); }}
                      className="flex-shrink-0 px-3 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition flex items-center gap-1 text-xs font-semibold whitespace-nowrap"
                      title="Add new location"
                    >
                      <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                      New
                    </button>
                  </div>
                )}

                {form.department && deptLocations.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1.5 flex items-start gap-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span>No locations for {form.department}. Click "New" to add one.</span>
                  </p>
                )}

                {form.location && (() => {
                  const sel = deptLocations.find((l) => l.name === form.location);
                  return sel?.description ? (
                    <p className="text-xs text-gray-500 mt-1.5 flex items-start gap-1">
                      <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="truncate">{sel.description}</span>
                    </p>
                  ) : null;
                })()}
              </div>
            </div>
          </div>

          {/* ─── Section 4: Calibration Dates ─────────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-gray-500" strokeWidth={2} />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Calibration Dates
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  Last Calibration Date
                </label>
                <input
                  type="date"
                  value={form.lastCalibrationDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      lastCalibrationDate: value,
                      nextDueDate: calcNextDue(value, prev.frequencyMonths),
                    }));
                  }}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  Next Due Date
                </label>
                <input
                  type="date"
                  value={form.nextDueDate}
                  onChange={(e) => updateField('nextDueDate', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Auto-calculated from Last Calibration Date + Frequency — you can still adjust it manually.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* ─── Add Location Inline Modal ─────────────────────────────── */}
      <Modal open={addLocOpen} onClose={() => setAddLocOpen(false)}
        title="Add New Location" subtitle={`For department: ${form.department}`} maxWidth="sm"
        footer={<>
          <button onClick={() => setAddLocOpen(false)} className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm">Cancel</button>
          <button onClick={handleAddLocation} disabled={!newLocName.trim()}
            className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm disabled:opacity-50"
            style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }}>Add Location</button>
        </>}>
        <div className="space-y-4">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-700">
            <strong>Department:</strong> {form.department}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">Location Name <span className="text-red-500">*</span></label>
            <input value={newLocName} onChange={(e) => setNewLocName(e.target.value)} placeholder="e.g. Shelf A1, Cabinet C2, Station 3"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">Description</label>
            <input value={newLocDesc} onChange={(e) => setNewLocDesc(e.target.value)} placeholder="e.g. Top shelf near lab entry"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm" />
          </div>
          {deptLocations.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Existing in {form.department}:</p>
              <div className="flex flex-wrap gap-1.5">
                {deptLocations.map((l) => (
                  <span key={l.id} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3" strokeWidth={2} />{l.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ─── Delete Modal ──────────────────────────────────────────── */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Gauge" subtitle="This action cannot be undone." maxWidth="sm"
        footer={<>
          <button onClick={() => setDeleteId(null)} className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm">Cancel</button>
          <button onClick={handleDelete} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-md transition text-sm">Delete</button>
        </>}>
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <Trash2 className="w-7 h-7 text-red-500" strokeWidth={2} />
          </div>
          <p className="text-gray-700">Delete gauge <span className="font-bold">{gauges.find((g) => g.id === deleteId)?.gaugeCode}</span>?</p>
        </div>
      </Modal>

      {/* ─── Import Excel Modal ────────────────────────────────────── */}
      <Modal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Import Gauges from Excel"
        subtitle={
          importStep === 'upload'
            ? 'Download the template, fill it in, and upload it back'
            : importStep === 'preview'
            ? `Reviewing ${importFileName}`
            : 'Import complete'
        }
        maxWidth="2xl"
        footer={
          importStep === 'upload' ? (
            <button onClick={() => setImportModalOpen(false)}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm">
              Cancel
            </button>
          ) : importStep === 'preview' ? (
            <>
              <button onClick={() => setImportStep('upload')}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm">
                Back
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={importRows.filter((r) => r.errors.length === 0).length === 0}
                className="flex items-center gap-2 px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm disabled:opacity-50"
                style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }}>
                <Upload className="w-4 h-4" strokeWidth={2} />
                Import {importRows.filter((r) => r.errors.length === 0).length} Gauges
              </button>
            </>
          ) : (
            <button onClick={() => setImportModalOpen(false)}
              className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm"
              style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }}>
              Done
            </button>
          )
        }
      >
        {importStep === 'upload' && (
          <div className="space-y-4">
            <button
              onClick={downloadTemplate}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold rounded-xl transition text-sm"
            >
              <Download className="w-4 h-4" strokeWidth={2} />
              Download Template (.xlsx)
            </button>

            <input
              ref={importFileInputRef}
              type="file"
              accept=".csv,.xlsx"
              onChange={handleImportFileSelect}
              className="hidden"
            />
            <div
              onClick={() => importFileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 hover:border-indigo-300 rounded-xl p-8 text-center cursor-pointer transition"
            >
              <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-sm font-semibold text-gray-600">Click to upload the filled template</p>
              <p className="text-xs text-gray-400 mt-1">.xlsx (or .csv export of it)</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
              <p>Open the downloaded file's <strong>"Instructions"</strong> tab first, then fill in the <strong>"Gauge Data"</strong> tab.</p>
              <p><strong>Gauge Code, Name, Type, Department</strong> are required for every row.</p>
              <p>Department must already exist under Administration → Departments.</p>
              <p>If Gauge Code matches an existing gauge, that gauge will be <strong>updated</strong> instead of duplicated.</p>
              <p>Leave "Next Due Date" blank to auto-calculate it from Last Calibration Date + Frequency.</p>
              <p>Optional: insert a picture directly into the "Image" cell for a row to set that gauge's photo (.xlsx only, not .csv).</p>
            </div>
          </div>
        )}

        {importStep === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                {importRows.filter((r) => r.errors.length === 0).length} valid
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-xs font-semibold">
                <XCircle className="w-3.5 h-3.5" strokeWidth={2} />
                {importRows.filter((r) => r.errors.length > 0).length} with errors
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                {importRows.filter((r) => r.matchedGaugeId && r.errors.length === 0).length} will update existing
              </div>
            </div>

            {importParseError ? (
              <p className="text-sm text-red-600 text-center py-6 flex items-center justify-center gap-2">
                <XCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                {importParseError}
              </p>
            ) : importRows.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                No rows found in this file. Make sure you filled in the "Gauge Data" sheet below the header row.
              </p>
            ) : (
              <div className="border border-gray-100 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
                <table className="min-w-full text-xs">
                  <thead className="sticky top-0">
                    <tr style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }}>
                      <th className="px-3 py-2 text-left text-white font-bold">Row</th>
                      <th className="px-3 py-2 text-left text-white font-bold">Image</th>
                      <th className="px-3 py-2 text-left text-white font-bold">Gauge Code</th>
                      <th className="px-3 py-2 text-left text-white font-bold">Name</th>
                      <th className="px-3 py-2 text-left text-white font-bold">Department</th>
                      <th className="px-3 py-2 text-left text-white font-bold">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {importRows.map((r) => (
                      <tr key={r.rowNum} className={r.errors.length > 0 ? 'bg-red-50/40' : 'bg-white'}>
                        <td className="px-3 py-2 text-gray-500">{r.rowNum}</td>
                        <td className="px-3 py-2">
                          {r.data.image ? (
                            <img src={r.data.image} alt="" className="w-8 h-8 object-contain bg-white rounded border border-gray-200" />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2 font-semibold text-indigo-600">{r.data.gaugeCode || '—'}</td>
                        <td className="px-3 py-2 text-gray-700">{r.data.name || '—'}</td>
                        <td className="px-3 py-2 text-gray-700">{r.data.department || '—'}</td>
                        <td className="px-3 py-2">
                          {r.errors.length > 0 ? (
                            <span className="text-red-600 flex items-start gap-1">
                              <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" strokeWidth={2} />
                              {r.errors.join('; ')}
                            </span>
                          ) : (
                            <span className="text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                              {r.matchedGaugeId ? 'Will update existing gauge' : 'Will create new gauge'}
                              {r.warnings.length > 0 && (
                                <span className="text-amber-600 ml-1">({r.warnings.join('; ')})</span>
                              )}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {importStep === 'done' && (
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" strokeWidth={2} />
            </div>
            <p className="text-gray-800 font-semibold">Import complete</p>
            <p className="text-sm text-gray-500 mt-1">
              {importResult.created} gauge{importResult.created === 1 ? '' : 's'} created,{' '}
              {importResult.updated} gauge{importResult.updated === 1 ? '' : 's'} updated.
            </p>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
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

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import DataTable, { type Column } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import {
  gaugeStorage,
  departmentStorage,
  locationStorage,
  auditStorage,
  generateId,
  getQuarantineReason,
  type Gauge,
} from '../utils/storage';
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
} from 'lucide-react';

const GAUGE_TYPES = [
  'Vernier Caliper', 'Micrometer', 'Height Gauge', 'Dial Indicator',
  'Feeler Gauge', 'Ring Gauge', 'Plug Gauge', 'Roughness Tester',
  'Torque Wrench', 'Bore Gauge', 'Thread Gauge', 'Other',
];

const STATUS_OPTIONS: Gauge['status'][] = [
  'Available', 'Issued', 'Under Calibration', 'Under MSA Study', 'Under Review', 'Scrapped',
];

const emptyForm: Omit<Gauge, 'id'> = {
  gaugeCode: '', name: '', type: '', range: '', leastCount: '',
  department: '', location: '', frequencyMonths: 6, status: 'Available',
  lastCalibrationDate: '', nextDueDate: '',
};

export default function GaugeMaster() {
  const navigate = useNavigate();
  const [gauges, setGauges] = useState<Gauge[]>(gaugeStorage.getAll());
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [addLocOpen, setAddLocOpen] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocDesc, setNewLocDesc] = useState('');

  const departments = departmentStorage.getAll();

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
      auditStorage.add({ action: 'UPDATE', entityType: 'Gauge', entityId: editingId, userId: 'current', timestamp: new Date().toISOString() });
    } else {
      const created = gaugeStorage.add(form);
      auditStorage.add({ action: 'CREATE', entityType: 'Gauge', entityId: created.id, userId: 'current', timestamp: new Date().toISOString() });
    }
    reload(); setModalOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    gaugeStorage.delete(deleteId);
    auditStorage.add({ action: 'DELETE', entityType: 'Gauge', entityId: deleteId, userId: 'current', timestamp: new Date().toISOString() });
    reload(); setDeleteId(null);
  };

  const handleAddLocation = () => {
    if (!newLocName.trim() || !form.department) return;
    const dept = departments.find((d) => d.name === form.department);
    const newLoc = locationStorage.add({
      name: newLocName.trim(),
      departmentId: dept?.id || '',
      departmentName: form.department,
      description: newLocDesc.trim(),
      isActive: true,
    });
    setForm((prev) => ({ ...prev, location: newLoc.name }));
    setNewLocName(''); setNewLocDesc(''); setAddLocOpen(false);
    auditStorage.add({ action: 'CREATE', entityType: 'Location', entityId: newLoc.id, userId: 'current', timestamp: new Date().toISOString() });
  };

  const updateField = <K extends keyof Omit<Gauge, 'id'>>(key: K, value: Omit<Gauge, 'id'>[K]) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === 'department') updated.location = '';
      return updated;
    });
  };

  const columns: Column<Gauge>[] = [
    { header: 'Gauge Code', cell: (r) => <span className="font-bold text-indigo-600">{r.gaugeCode}</span> },
    { header: 'Name', cell: (r) => <span>{r.name}</span> },
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
        <button onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition text-sm"
          style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }}>
          <Plus className="w-4 h-4" strokeWidth={2.5} />Add Gauge
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: gauges.length, accent: 'from-indigo-500 to-purple-500' },
          { label: 'Available', value: gauges.filter((g) => g.status === 'Available').length, accent: 'from-emerald-500 to-teal-500' },
          { label: 'Issued', value: gauges.filter((g) => g.status === 'Issued').length, accent: 'from-blue-500 to-cyan-500' },
          { label: 'Overdue', value: gauges.filter((g) => getDueStatus(g.nextDueDate) === 'Overdue').length, accent: 'from-red-500 to-rose-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative overflow-hidden">
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
                  onChange={(e) => updateField('frequencyMonths', parseInt(e.target.value) || 6)}
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
                  onChange={(e) => updateField('lastCalibrationDate', e.target.value)}
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
    </Layout>
  );
}
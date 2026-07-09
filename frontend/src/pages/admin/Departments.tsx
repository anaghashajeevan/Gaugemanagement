// // src/pages/admin/Departments.tsx

// import { useState, useMemo } from 'react';
// import Layout from '../../components/Layout';
// import DataTable, { type Column } from '../../components/DataTable';
// import Modal from '../../components/Modal';
// import {
//   departmentStorage,
//   auditStorage,
//   type AppDepartment,
// } from '../../utils/storage';
// import {
//   Building2,
//   Plus,
//   Search,
//   Edit3,
//   Trash2,
//   AlertCircle,
// } from 'lucide-react';

// const emptyForm = {
//   name: '',
//   code: '',
// };

// export default function Departments() {
//   const [departments, setDepartments] = useState<AppDepartment[]>(
//     departmentStorage.getAll()
//   );
//   const [search, setSearch] = useState('');

//   const [modalOpen, setModalOpen] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [form, setForm] = useState(emptyForm);
//   const [formError, setFormError] = useState('');

//   const [deleteId, setDeleteId] = useState<string | null>(null);

//   const reload = () => setDepartments(departmentStorage.getAll());

//   const filtered = useMemo(() => {
//     if (!search) return departments;
//     const q = search.toLowerCase();
//     return departments.filter(
//       (d) =>
//         d.name.toLowerCase().includes(q) ||
//         d.code.toLowerCase().includes(q)
//     );
//   }, [departments, search]);

//   const openAdd = () => {
//     setEditingId(null);
//     setForm(emptyForm);
//     setFormError('');
//     setModalOpen(true);
//   };

//   const openEdit = (d: AppDepartment) => {
//     setEditingId(d.id);
//     setForm({ name: d.name, code: d.code });
//     setFormError('');
//     setModalOpen(true);
//   };

//   const handleSave = () => {
//     if (!form.name.trim() || !form.code.trim()) {
//       setFormError('Name and Code are required.');
//       return;
//     }

//     if (editingId) {
//       departmentStorage.update(editingId, form);
//       auditStorage.add({
//         action: 'UPDATE',
//         entityType: 'Department',
//         entityId: editingId,
//         userId: 'current',
//         timestamp: new Date().toISOString(),
//       });
//     } else {
//       const created = departmentStorage.add(form);
//       auditStorage.add({
//         action: 'CREATE',
//         entityType: 'Department',
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
//     departmentStorage.delete(deleteId);
//     auditStorage.add({
//       action: 'DELETE',
//       entityType: 'Department',
//       entityId: deleteId,
//       userId: 'current',
//       timestamp: new Date().toISOString(),
//     });
//     reload();
//     setDeleteId(null);
//   };

//   const columns: Column<AppDepartment>[] = [
//     {
//       header: 'Department Name',
//       cell: (row) => (
//         <div className="flex items-center gap-3">
//           <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
//             <Building2
//               className="w-4 h-4 text-indigo-500"
//               strokeWidth={2}
//             />
//           </div>
//           <span className="font-semibold text-gray-800">{row.name}</span>
//         </div>
//       ),
//     },
//     {
//       header: 'Code',
//       cell: (row) => (
//         <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-mono font-semibold">
//           {row.code}
//         </span>
//       ),
//     },
//     {
//       header: 'Actions',
//       width: '120px',
//       align: 'center',
//       cell: (row) => (
//         <div className="flex items-center justify-center gap-1">
//           <button
//             onClick={() => openEdit(row)}
//             className="p-1.5 hover:bg-indigo-50 rounded-lg transition text-indigo-500"
//             title="Edit"
//           >
//             <Edit3 className="w-4 h-4" strokeWidth={2} />
//           </button>
//           <button
//             onClick={() => setDeleteId(row.id)}
//             className="p-1.5 hover:bg-red-50 rounded-lg transition text-red-500"
//             title="Delete"
//           >
//             <Trash2 className="w-4 h-4" strokeWidth={2} />
//           </button>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <Layout pageTitle="Departments">
//       {/* ─── Top Bar ──────────────────────────────────────────────── */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
//         <div className="relative flex-1 max-w-md">
//           <Search
//             className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
//             strokeWidth={2}
//           />
//           <input
//             type="text"
//             placeholder="Search departments…"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
//           />
//         </div>

//         <button
//           onClick={openAdd}
//           className="flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition text-sm"
//           style={{
//             background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
//           }}
//         >
//           <Plus className="w-4 h-4" strokeWidth={2.5} />
//           Add Department
//         </button>
//       </div>

//       {/* ─── Summary ──────────────────────────────────────────────── */}
//       <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative overflow-hidden mb-6 w-fit">
//         <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500" />
//         <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
//           Total Departments
//         </p>
//         <p className="text-2xl font-bold text-gray-800 mt-1">
//           {departments.length}
//         </p>
//       </div>

//       {/* ─── Table ────────────────────────────────────────────────── */}
//       <DataTable
//         columns={columns}
//         data={filtered}
//         keyExtractor={(row) => row.id}
//         emptyTitle="No departments found"
//         emptySubtitle="Add a department to get started."
//         emptyIcon={
//           <Building2 className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
//         }
//       />

//       {/* ─── Add / Edit Modal ─────────────────────────────────────── */}
//       <Modal
//         open={modalOpen}
//         onClose={() => setModalOpen(false)}
//         title={editingId ? 'Edit Department' : 'Add New Department'}
//         subtitle="Manage department information"
//         maxWidth="sm"
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
//                 background:
//                   'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
//               }}
//             >
//               {editingId ? 'Update' : 'Create'}
//             </button>
//           </>
//         }
//       >
//         {formError && (
//           <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
//             <AlertCircle
//               className="w-4 h-4 flex-shrink-0 mt-0.5"
//               strokeWidth={2}
//             />
//             {formError}
//           </div>
//         )}

//         <div className="space-y-4">
//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Department Name <span className="text-red-500">*</span>
//             </label>
//             <input
//               value={form.name}
//               onChange={(e) =>
//                 setForm({ ...form, name: e.target.value })
//               }
//               placeholder="e.g. Quality Control"
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Code <span className="text-red-500">*</span>
//             </label>
//             <input
//               value={form.code}
//               onChange={(e) =>
//                 setForm({ ...form, code: e.target.value.toUpperCase() })
//               }
//               placeholder="e.g. QC"
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm font-mono"
//             />
//           </div>
//         </div>
//       </Modal>

//       {/* ─── Delete Confirmation ──────────────────────────────────── */}
//       <Modal
//         open={!!deleteId}
//         onClose={() => setDeleteId(null)}
//         title="Delete Department"
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
//             Are you sure you want to delete{' '}
//             <span className="font-bold">
//               {departments.find((d) => d.id === deleteId)?.name}
//             </span>
//             ?
//           </p>
//         </div>
//       </Modal>
//     </Layout>
//   );
// }


// src/pages/admin/Departments.tsx

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import DataTable, { type Column } from '../../components/DataTable';
import Modal from '../../components/Modal';
import {
  departmentsAPI,
  type DepartmentType,
  type DepartmentLocationType,
} from '../../api/api';
import {
  Building2,
  Plus,
  Edit3,
  Trash2,
  AlertCircle,
  Search,
  Loader2,
} from 'lucide-react';

const LOCATION_TYPES: { value: DepartmentLocationType; label: string }[] = [
  { value: 'store', label: 'Store' },
  { value: 'gauge_room', label: 'Gauge Room' },
  { value: 'shop_floor', label: 'Shop Floor' },
  { value: 'other', label: 'Other' },
];

const emptyForm: {
  name: string;
  location_type: DepartmentLocationType;
  is_active: boolean;
} = {
  name: '',
  location_type: 'other',
  is_active: true,
};

export default function Departments() {
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ─── Load ─────────────────────────────────────────────────────────
  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await departmentsAPI.list();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = search
    ? departments.filter(
        (d) =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.location_type.toLowerCase().includes(search.toLowerCase())
      )
    : departments;

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (d: DepartmentType) => {
    setEditingId(d.id);
    setForm({
      name: d.name,
      location_type: d.location_type,
      is_active: d.is_active,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError('Department name is required.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const payload: Partial<DepartmentType> = {
        name: form.name.trim(),
        location_type: form.location_type,
        is_active: form.is_active,
      };

      if (editingId) {
        await departmentsAPI.update(editingId, payload);
      } else {
        await departmentsAPI.create(payload);
      }

      await loadData();
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save department.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await departmentsAPI.delete(deleteId);
      await loadData();
      setDeleteId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete department.');
    } finally {
      setDeleting(false);
    }
  };

  const getLocationBadge = (type: DepartmentLocationType) => {
    switch (type) {
      case 'gauge_room': return 'bg-indigo-50 text-indigo-700';
      case 'shop_floor': return 'bg-blue-50 text-blue-700';
      case 'store': return 'bg-emerald-50 text-emerald-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getLocationLabel = (type: DepartmentLocationType) =>
    LOCATION_TYPES.find((t) => t.value === type)?.label || type;

  const columns: Column<DepartmentType>[] = [
    {
      header: 'Department',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-indigo-500" strokeWidth={2} />
          </div>
          <span className="font-semibold text-gray-800">{row.name}</span>
        </div>
      ),
    },
    {
      header: 'Location Type',
      cell: (row) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getLocationBadge(row.location_type)}`}>
          {getLocationLabel(row.location_type)}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          row.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${row.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Created',
      cell: (row) => (
        <span className="text-sm text-gray-500">
          {new Date(row.created_at).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
          })}
        </span>
      ),
    },
    {
      header: 'Actions',
      width: '120px',
      align: 'center',
      cell: (row) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => openEdit(row)}
            className="p-1.5 hover:bg-indigo-50 rounded-lg transition text-indigo-500"
            title="Edit"
          >
            <Edit3 className="w-4 h-4" strokeWidth={2} />
          </button>
          <button
            onClick={() => setDeleteId(row.id)}
            className="p-1.5 hover:bg-red-50 rounded-lg transition text-red-500"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      ),
    },
  ];

  const deleteDept = departments.find((d) => d.id === deleteId);

  return (
    <Layout pageTitle="Departments" pageSubtitle="Manage organizational departments and locations" pageIcon={Building2}>
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

      {/* Summary stat */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: departments.length, accent: 'from-indigo-500 to-purple-500', cardBg: 'bg-gradient-to-br from-indigo-100 to-indigo-50/60', cardBorder: 'border-indigo-200' },
          { label: 'Active', value: departments.filter((d) => d.is_active).length, accent: 'from-emerald-500 to-teal-500', cardBg: 'bg-gradient-to-br from-emerald-100 to-emerald-50/60', cardBorder: 'border-emerald-200' },
          { label: 'Gauge Rooms', value: departments.filter((d) => d.location_type === 'gauge_room').length, accent: 'from-blue-500 to-cyan-500', cardBg: 'bg-gradient-to-br from-blue-100 to-blue-50/60', cardBorder: 'border-blue-200' },
          { label: 'Shop Floors', value: departments.filter((d) => d.location_type === 'shop_floor').length, accent: 'from-amber-500 to-yellow-500', cardBg: 'bg-gradient-to-br from-amber-100 to-amber-50/60', cardBorder: 'border-amber-200' },
        ].map((s) => (
          <div key={s.label} className={`${s.cardBg} rounded-xl p-4 shadow-sm border ${s.cardBorder} relative overflow-hidden`}>
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${s.accent}`} />
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{s.label}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search departments…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          />
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition text-sm"
          style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }}
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Add Department
        </button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(r) => String(r.id)}
        loading={loading}
        emptyTitle="No departments found"
        emptySubtitle="Add a department to get started."
        emptyIcon={<Building2 className="w-8 h-8 text-gray-300" strokeWidth={1.5} />}
      />

      {/* ─── Add / Edit Modal ─────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Department' : 'Add Department'}
        subtitle="Configure department name and location type"
        maxWidth="sm"
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm disabled:opacity-60 flex items-center gap-2"
              style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }}
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />Saving…</>
              ) : editingId ? 'Update' : 'Create'}
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

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">
              Department Name <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Quality Control"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">
              Location Type
            </label>
            <select
              value={form.location_type}
              onChange={(e) =>
                setForm({ ...form, location_type: e.target.value as DepartmentLocationType })
              }
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
            >
              {LOCATION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700 font-medium">Active</span>
          </label>
        </div>
      </Modal>

      {/* ─── Delete Modal ─────────────────────────────────────────── */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Department"
        subtitle="Users in this department will lose their assignment."
        maxWidth="sm"
        footer={
          <>
            <button
              onClick={() => setDeleteId(null)}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-md transition text-sm disabled:opacity-60 flex items-center gap-2"
            >
              {deleting ? (
                <><Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />Deleting…</>
              ) : 'Delete'}
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <Trash2 className="w-7 h-7 text-red-500" strokeWidth={2} />
          </div>
          <p className="text-gray-700 font-medium">
            Delete <span className="font-bold">{deleteDept?.name}</span>?
          </p>
        </div>
      </Modal>
    </Layout>
  );
}
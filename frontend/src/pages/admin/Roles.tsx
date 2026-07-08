// // src/pages/admin/Roles.tsx

// import Layout from '../../components/Layout';
// import {
//   ShieldCheck,
//   Crown,
//   Microscope,
//   Warehouse,
//   Wrench,
// } from 'lucide-react';

// const roles = [
//   {
//     name: 'Admin',
//     code: 'admin',
//     icon: Crown,
//     color: 'from-purple-500 to-violet-500',
//     bgLight: 'bg-purple-50',
//     textColor: 'text-purple-700',
//     permissions: [
//       'Full system access',
//       'User management (create, edit, deactivate)',
//       'Role & department management',
//       'View audit trail',
//       'All gauge operations',
//       'All calibration & MSA operations',
//       'Generate all reports',
//       'CAPA management',
//     ],
//   },
//   {
//     name: 'Quality Engineer',
//     code: 'quality_engineer',
//     icon: Microscope,
//     color: 'from-indigo-500 to-blue-500',
//     bgLight: 'bg-indigo-50',
//     textColor: 'text-indigo-700',
//     permissions: [
//       'View & manage gauge master',
//       'Perform internal & external calibrations',
//       'Conduct MSA studies (GR&R, Linearity, Bias, Uncertainty)',
//       'Create & manage CAPAs',
//       'Issue & return gauges',
//       'Generate reports',
//     ],
//   },
//   {
//     name: 'Store Keeper',
//     code: 'store_keeper',
//     icon: Warehouse,
//     color: 'from-emerald-500 to-teal-500',
//     bgLight: 'bg-emerald-50',
//     textColor: 'text-emerald-700',
//     permissions: [
//       'View gauge master',
//       'Issue & return gauges',
//       'View calibration status',
//       'View CAPA records',
//       'Generate issue/return reports',
//     ],
//   },
//   {
//     name: 'Shop Floor Operator',
//     code: 'shop_floor_operator',
//     icon: Wrench,
//     color: 'from-blue-500 to-cyan-500',
//     bgLight: 'bg-blue-50',
//     textColor: 'text-blue-700',
//     permissions: [
//       'View gauge master (read-only)',
//       'View gauge status & due dates',
//       'View CAPA records',
//       'View issue/return history',
//       'View reports',
//     ],
//   },
// ];

// export default function Roles() {
//   return (
//     <Layout pageTitle="Roles">
//       {/* ─── Header ───────────────────────────────────────────────── */}
//       <div className="flex items-center gap-3 mb-6">
//         <div
//           className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md"
//           style={{
//             background:
//               'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
//           }}
//         >
//           <ShieldCheck className="w-6 h-6" strokeWidth={2} />
//         </div>
//         <div>
//           <h2 className="text-lg font-bold text-gray-800">
//             Role Definitions
//           </h2>
//           <p className="text-sm text-gray-500">
//             Each role defines what a user can see and do in the system
//           </p>
//         </div>
//       </div>

//       {/* ─── Role Cards ───────────────────────────────────────────── */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {roles.map((role) => {
//           const Icon = role.icon;
//           return (
//             <div
//               key={role.code}
//               className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
//             >
//               {/* Top accent bar */}
//               <div
//                 className={`h-1.5 bg-gradient-to-r ${role.color}`}
//               />

//               <div className="p-6">
//                 {/* Title Row */}
//                 <div className="flex items-center gap-4 mb-4">
//                   <div
//                     className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center text-white shadow-md`}
//                   >
//                     <Icon className="w-6 h-6" strokeWidth={2} />
//                   </div>
//                   <div>
//                     <h3 className="text-lg font-bold text-gray-900">
//                       {role.name}
//                     </h3>
//                     <p className="text-xs text-gray-400 font-mono">
//                       {role.code}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Permissions */}
//                 <div>
//                   <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-3">
//                     Permissions
//                   </p>
//                   <ul className="space-y-2">
//                     {role.permissions.map((perm, i) => (
//                       <li
//                         key={i}
//                         className="flex items-start gap-2 text-sm text-gray-700"
//                       >
//                         <span
//                           className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-gradient-to-br ${role.color}`}
//                         />
//                         {perm}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </Layout>
//   );
// }

// src/pages/admin/Roles.tsx

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import DataTable, { type Column } from '../../components/DataTable';
import Modal from '../../components/Modal';
import { rolesAPI, type RoleType } from '../../api/api';
import {
  ShieldCheck,
  Plus,
  Edit3,
  Trash2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const emptyForm = {
  name: '',
  code: '',
  description: '',
  level: 10,
  is_active: true,
};

export default function Roles() {
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ─── Load ────────────────────────────────────────────────────────
  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await rolesAPI.list();
      setRoles(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load roles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (r: RoleType) => {
    setEditingId(r.id);
    setForm({
      name: r.name,
      code: r.code,
      description: r.description || '',
      level: r.level,
      is_active: r.is_active,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError('Role name is required.');
      return;
    }
    if (!form.code.trim()) {
      setFormError('Role code is required.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const payload: Partial<RoleType> = {
        name: form.name.trim(),
        code: form.code.trim().toLowerCase().replace(/\s+/g, '_'),
        description: form.description,
        level: form.level,
        is_active: form.is_active,
      };

      if (editingId) {
        await rolesAPI.update(editingId, payload);
      } else {
        await rolesAPI.create(payload);
      }

      await loadData();
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save role.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await rolesAPI.delete(deleteId);
      await loadData();
      setDeleteId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete role. It may be assigned to users.');
    } finally {
      setDeleting(false);
    }
  };

  const getLevelBadge = (level: number) => {
    if (level >= 90) return 'bg-purple-50 text-purple-700';
    if (level >= 50) return 'bg-indigo-50 text-indigo-700';
    if (level >= 20) return 'bg-blue-50 text-blue-700';
    return 'bg-gray-100 text-gray-600';
  };

  const columns: Column<RoleType>[] = [
    {
      header: 'Role',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
          >
            <ShieldCheck className="w-4 h-4" strokeWidth={2} />
          </div>
          <div>
            <p className="font-semibold text-gray-800">{row.name}</p>
            <p className="text-xs text-gray-400 font-mono">{row.code}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Description',
      cell: (row) => (
        <span className="text-sm text-gray-600 truncate max-w-[250px] block">
          {row.description || '—'}
        </span>
      ),
    },
    {
      header: 'Level',
      cell: (row) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getLevelBadge(row.level)}`}>
          Level {row.level}
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

  const deleteRole = roles.find((r) => r.id === deleteId);

  return (
    <Layout pageTitle="Roles" pageSubtitle="Configure role-based access levels across the system" pageIcon={ShieldCheck}>
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
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-sm font-bold rounded-full">
          <ShieldCheck className="w-4 h-4" strokeWidth={2} />
          {roles.length} roles configured
        </span>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition text-sm"
          style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }}
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Add Role
        </button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={roles}
        keyExtractor={(r) => String(r.id)}
        loading={loading}
        emptyTitle="No roles found"
        emptySubtitle="Create roles to assign to users."
        emptyIcon={<ShieldCheck className="w-8 h-8 text-gray-300" strokeWidth={1.5} />}
      />

      {/* ─── Add / Edit Modal ─────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Role' : 'Create New Role'}
        subtitle="Define role name, code, and privilege level"
        maxWidth="md"
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
              ) : editingId ? 'Update Role' : 'Create Role'}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                Role Name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Quality Engineer"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                Code <span className="text-red-500">*</span>
              </label>
              <input
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })
                }
                placeholder="e.g. quality_engineer"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm font-mono"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Used internally. Lowercase, underscores only.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="What can this role do?"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                Privilege Level
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={form.level}
                onChange={(e) => setForm({ ...form, level: parseInt(e.target.value) || 10 })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
              />
              <p className="text-[10px] text-gray-400 mt-1">1–100. Higher = more privileges.</p>
            </div>
            <div className="flex items-end pb-2">
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
          </div>
        </div>
      </Modal>

      {/* ─── Delete Modal ─────────────────────────────────────────── */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Role"
        subtitle="This may affect users assigned to this role."
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
              ) : 'Delete Role'}
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <Trash2 className="w-7 h-7 text-red-500" strokeWidth={2} />
          </div>
          <p className="text-gray-700 font-medium">
            Delete role <span className="font-bold">{deleteRole?.name}</span>?
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Users assigned this role will lose their role assignment.
          </p>
        </div>
      </Modal>
    </Layout>
  );
}
// // src/pages/admin/Users.tsx

// import { useState, useMemo } from 'react';
// import Layout from '../../components/Layout';
// import DataTable, { type Column } from '../../components/DataTable';
// import Modal from '../../components/Modal';
// import {
//   appUserStorage,
//   departmentStorage,
//   auditStorage,
//   type AppUser,
// } from '../../utils/storage';
// import {
//   Users as UsersIcon,
//   Plus,
//   Search,
//   Edit3,
//   Trash2,
//   AlertCircle,
// } from 'lucide-react';

// const ROLES = [
//   'Admin',
//   'Quality Engineer',
//   'Store Keeper',
//   'Shop Floor Operator',
// ];

// const emptyForm = {
//   fullName: '',
//   loginId: '',
//   role: '',
//   department: '',
// };

// export default function Users() {
//   const [users, setUsers] = useState<AppUser[]>(appUserStorage.getAll());
//   const [search, setSearch] = useState('');

//   const [modalOpen, setModalOpen] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [form, setForm] = useState(emptyForm);
//   const [formError, setFormError] = useState('');

//   const [deleteId, setDeleteId] = useState<string | null>(null);

//   const departments = departmentStorage.getAll();
//   const reload = () => setUsers(appUserStorage.getAll());

//   const filtered = useMemo(() => {
//     if (!search) return users;
//     const q = search.toLowerCase();
//     return users.filter(
//       (u) =>
//         u.fullName.toLowerCase().includes(q) ||
//         u.loginId.toLowerCase().includes(q) ||
//         u.role.toLowerCase().includes(q) ||
//         u.department.toLowerCase().includes(q)
//     );
//   }, [users, search]);

//   const openAdd = () => {
//     setEditingId(null);
//     setForm(emptyForm);
//     setFormError('');
//     setModalOpen(true);
//   };

//   const openEdit = (u: AppUser) => {
//     setEditingId(u.id);
//     setForm({
//       fullName: u.fullName,
//       loginId: u.loginId,
//       role: u.role,
//       department: u.department,
//     });
//     setFormError('');
//     setModalOpen(true);
//   };

//   const handleSave = () => {
//     if (!form.fullName.trim() || !form.loginId.trim() || !form.role) {
//       setFormError('Full Name, Login ID, and Role are required.');
//       return;
//     }

//     if (editingId) {
//       appUserStorage.update(editingId, form);
//       auditStorage.add({
//         action: 'UPDATE',
//         entityType: 'User',
//         entityId: editingId,
//         userId: 'current',
//         timestamp: new Date().toISOString(),
//       });
//     } else {
//       const created = appUserStorage.add(form);
//       auditStorage.add({
//         action: 'CREATE',
//         entityType: 'User',
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
//     appUserStorage.delete(deleteId);
//     auditStorage.add({
//       action: 'DELETE',
//       entityType: 'User',
//       entityId: deleteId,
//       userId: 'current',
//       timestamp: new Date().toISOString(),
//     });
//     reload();
//     setDeleteId(null);
//   };

//   const getRoleBadgeColor = (role: string) => {
//     switch (role) {
//       case 'Admin':
//         return 'bg-purple-50 text-purple-700';
//       case 'Quality Engineer':
//         return 'bg-indigo-50 text-indigo-700';
//       case 'Store Keeper':
//         return 'bg-emerald-50 text-emerald-700';
//       case 'Shop Floor Operator':
//         return 'bg-blue-50 text-blue-700';
//       default:
//         return 'bg-gray-100 text-gray-600';
//     }
//   };

//   const columns: Column<AppUser>[] = [
//     {
//       header: 'Full Name',
//       cell: (row) => (
//         <div className="flex items-center gap-3">
//           <div
//             className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0"
//             style={{
//               background:
//                 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
//             }}
//           >
//             {row.fullName[0]?.toUpperCase()}
//           </div>
//           <span className="font-semibold text-gray-800">{row.fullName}</span>
//         </div>
//       ),
//     },
//     { header: 'Login ID', accessor: 'loginId' },
//     {
//       header: 'Role',
//       cell: (row) => (
//         <span
//           className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getRoleBadgeColor(
//             row.role
//           )}`}
//         >
//           {row.role}
//         </span>
//       ),
//     },
//     { header: 'Department', accessor: 'department' },
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
//     <Layout pageTitle="User Management">
//       {/* ─── Top Bar ──────────────────────────────────────────────── */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
//         <div className="relative flex-1 max-w-md">
//           <Search
//             className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
//             strokeWidth={2}
//           />
//           <input
//             type="text"
//             placeholder="Search users…"
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
//           Add User
//         </button>
//       </div>

//       {/* ─── Stats ────────────────────────────────────────────────── */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//         {[
//           { label: 'Total Users', value: users.length, accent: 'from-indigo-500 to-purple-500' },
//           {
//             label: 'Admins',
//             value: users.filter((u) => u.role === 'Admin').length,
//             accent: 'from-purple-500 to-violet-500',
//           },
//           {
//             label: 'Quality Engineers',
//             value: users.filter((u) => u.role === 'Quality Engineer').length,
//             accent: 'from-blue-500 to-cyan-500',
//           },
//           {
//             label: 'Operators',
//             value: users.filter(
//               (u) => u.role === 'Shop Floor Operator' || u.role === 'Store Keeper'
//             ).length,
//             accent: 'from-emerald-500 to-teal-500',
//           },
//         ].map((s) => (
//           <div
//             key={s.label}
//             className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative overflow-hidden"
//           >
//             <div
//               className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${s.accent}`}
//             />
//             <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
//               {s.label}
//             </p>
//             <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
//           </div>
//         ))}
//       </div>

//       {/* ─── Table ────────────────────────────────────────────────── */}
//       <DataTable
//         columns={columns}
//         data={filtered}
//         keyExtractor={(row) => row.id}
//         emptyTitle="No users found"
//         emptySubtitle="Add a user to get started."
//         emptyIcon={
//           <UsersIcon className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
//         }
//       />

//       {/* ─── Add / Edit Modal ─────────────────────────────────────── */}
//       <Modal
//         open={modalOpen}
//         onClose={() => setModalOpen(false)}
//         title={editingId ? 'Edit User' : 'Add New User'}
//         subtitle="Manage user information and role assignment"
//         maxWidth="md"
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
//               {editingId ? 'Update' : 'Create'} User
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
//               Full Name <span className="text-red-500">*</span>
//             </label>
//             <input
//               value={form.fullName}
//               onChange={(e) =>
//                 setForm({ ...form, fullName: e.target.value })
//               }
//               placeholder="e.g. Rajesh Kumar"
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Login ID <span className="text-red-500">*</span>
//             </label>
//             <input
//               value={form.loginId}
//               onChange={(e) =>
//                 setForm({ ...form, loginId: e.target.value })
//               }
//               placeholder="e.g. rajesh.kumar"
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Role <span className="text-red-500">*</span>
//             </label>
//             <select
//               value={form.role}
//               onChange={(e) =>
//                 setForm({ ...form, role: e.target.value })
//               }
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
//             >
//               <option value="">Select role</option>
//               {ROLES.map((r) => (
//                 <option key={r} value={r}>
//                   {r}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Department
//             </label>
//             <select
//               value={form.department}
//               onChange={(e) =>
//                 setForm({ ...form, department: e.target.value })
//               }
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
//         </div>
//       </Modal>

//       {/* ─── Delete Confirmation ──────────────────────────────────── */}
//       <Modal
//         open={!!deleteId}
//         onClose={() => setDeleteId(null)}
//         title="Delete User"
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
//             Are you sure you want to delete user{' '}
//             <span className="font-bold">
//               {users.find((u) => u.id === deleteId)?.fullName}
//             </span>
//             ?
//           </p>
//         </div>
//       </Modal>
//     </Layout>
//   );
// }


// src/pages/admin/Users.tsx

// src/pages/admin/Users.tsx

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import DataTable, { type Column } from '../../components/DataTable';
import Modal from '../../components/Modal';
import {
  usersAPI,
  rolesAPI,
  departmentsAPI,
  type GaugeUser,
  type RoleType,
  type DepartmentType,
} from '../../api/api';
import {
  Users as UsersIcon,
  Plus,
  Search,
  Edit3,
  Trash2,
  AlertCircle,
  KeyRound,
  Loader2,
  Mail,
  Phone,
  Shield,
} from 'lucide-react';

const emptyForm = {
  email: '',
  full_name: '',
  phone: '',
  role: '' as string,
  department: '' as string,
  password: '',
  is_active: true,
};

export default function Users() {
  const [users, setUsers] = useState<GaugeUser[]>([]);
  const [roles, setRoles] = useState<RoleType[]>([]);
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

  const [resetUserId, setResetUserId] = useState<number | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');

  // ─── Load Data ────────────────────────────────────────────────────
  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersData, rolesData, deptsData] = await Promise.all([
        usersAPI.list(),
        rolesAPI.list(),
        departmentsAPI.list(),
      ]);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setDepartments(Array.isArray(deptsData) ? deptsData : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ─── Filtering ────────────────────────────────────────────────────
  const filtered = search
    ? users.filter(
        (u) =>
          u.full_name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          (u.role_name || '').toLowerCase().includes(search.toLowerCase()) ||
          (u.department_name || '').toLowerCase().includes(search.toLowerCase())
      )
    : users;

  // ─── Open Add ─────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  // ─── Open Edit ────────────────────────────────────────────────────
  const openEdit = (u: GaugeUser) => {
    setEditingId(u.id);
    setForm({
      email: u.email,
      full_name: u.full_name,
      phone: u.phone || '',
      role: u.role ? String(u.role) : '',
      department: u.department ? String(u.department) : '',
      password: '',
      is_active: u.is_active,
    });
    setFormError('');
    setModalOpen(true);
  };

  // ─── Save ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    // Validation
    if (!form.full_name.trim()) {
      setFormError('Full Name is required.');
      return;
    }
    if (!form.email.trim()) {
      setFormError('Email is required. This is the login ID.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!editingId && !form.password) {
      setFormError('Password is required for new users.');
      return;
    }
    if (!editingId && form.password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    if (form.password && form.password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      if (editingId) {
        // Update — use UpdateUserPayload shape
        const payload: any = {
          email: form.email.toLowerCase().trim(),
          full_name: form.full_name.trim(),
          phone: form.phone || null,
          role: form.role ? parseInt(form.role) : null,
          department: form.department ? parseInt(form.department) : null,
          is_active: form.is_active,
        };
        // Only include password if provided
        if (form.password) {
          payload.password = form.password;
        }
        await usersAPI.update(editingId, payload);
      } else {
        // Create — use CreateUserPayload shape
        const payload: any = {
          email: form.email.toLowerCase().trim(),
          full_name: form.full_name.trim(),
          password: form.password,
          role: form.role ? parseInt(form.role) : null,
          department: form.department ? parseInt(form.department) : null,
        };
        if (form.phone) {
          payload.phone = form.phone;
        }
        await usersAPI.create(payload);
      }

      await loadData();
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save user.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Deactivate ───────────────────────────────────────────────────
  const handleDeactivate = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await usersAPI.deactivate(deleteId);
      await loadData();
      setDeleteId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to deactivate user.');
    } finally {
      setDeleting(false);
    }
  };

  // ─── Reset Password ───────────────────────────────────────────────
  const handleResetPassword = async () => {
    if (!resetUserId) return;
    if (!resetPassword || resetPassword.length < 6) {
      setResetError('Password must be at least 6 characters.');
      return;
    }
    setResetting(true);
    setResetError('');
    try {
      await usersAPI.resetPassword(resetUserId, resetPassword);
      setResetSuccess('Password reset successfully! User must change it on next login.');
      setResetPassword('');
      setTimeout(() => {
        setResetUserId(null);
        setResetSuccess('');
      }, 2000);
    } catch (err: any) {
      setResetError(err.message || 'Failed to reset password.');
    } finally {
      setResetting(false);
    }
  };

  // ─── Role badge color ─────────────────────────────────────────────
  const getRoleBadgeColor = (roleCode: string | null) => {
    switch (roleCode) {
      case 'admin': return 'bg-purple-50 text-purple-700';
      case 'quality_engineer': return 'bg-indigo-50 text-indigo-700';
      case 'store_keeper': return 'bg-emerald-50 text-emerald-700';
      case 'shop_floor_operator': return 'bg-blue-50 text-blue-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // ─── Columns ──────────────────────────────────────────────────────
  const columns: Column<GaugeUser>[] = [
    {
      header: 'User',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
          >
            {row.full_name[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-800">{row.full_name}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Mail className="w-3 h-3" strokeWidth={2} />
              {row.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Phone',
      cell: (row) => (
        <span className="text-sm text-gray-600 flex items-center gap-1">
          {row.phone ? (
            <><Phone className="w-3 h-3 text-gray-400" strokeWidth={2} />{row.phone}</>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </span>
      ),
    },
    {
      header: 'Role',
      cell: (row) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getRoleBadgeColor(row.role_code)}`}>
          {row.role_name || 'No Role'}
        </span>
      ),
    },
    {
      header: 'Department',
      cell: (row) => (
        <span className="text-sm text-gray-600">{row.department_name || '—'}</span>
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
      header: 'Last Login',
      cell: (row) => (
        <span className="text-sm text-gray-500">
          {row.last_login
            ? new Date(row.last_login).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric',
              })
            : 'Never'}
        </span>
      ),
    },
    {
      header: 'Actions',
      width: '150px',
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
            onClick={() => {
              setResetUserId(row.id);
              setResetPassword('');
              setResetError('');
              setResetSuccess('');
            }}
            className="p-1.5 hover:bg-amber-50 rounded-lg transition text-amber-500"
            title="Reset Password"
          >
            <KeyRound className="w-4 h-4" strokeWidth={2} />
          </button>
          <button
            onClick={() => setDeleteId(row.id)}
            className="p-1.5 hover:bg-red-50 rounded-lg transition text-red-500"
            title="Deactivate"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      ),
    },
  ];

  const deleteUser = users.find((u) => u.id === deleteId);
  const resetUser = users.find((u) => u.id === resetUserId);

  return (
    <Layout pageTitle="User Management" pageSubtitle="Manage system users, roles, and department assignments" pageIcon={UsersIcon}>
      {/* Error Banner */}
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users', value: users.length, accent: 'from-indigo-500 to-purple-500' },
          { label: 'Active', value: users.filter((u) => u.is_active).length, accent: 'from-emerald-500 to-teal-500' },
          { label: 'Inactive', value: users.filter((u) => !u.is_active).length, accent: 'from-red-500 to-rose-500' },
          { label: 'No Role', value: users.filter((u) => !u.role).length, accent: 'from-amber-500 to-yellow-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative overflow-hidden">
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
            placeholder="Search by name, email, role, department…"
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
          Add User
        </button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(row) => String(row.id)}
        loading={loading}
        emptyTitle="No users found"
        emptySubtitle="Create a new user to get started."
        emptyIcon={<UsersIcon className="w-8 h-8 text-gray-300" strokeWidth={1.5} />}
      />

      {/* ─── Add / Edit Modal ─────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit User' : 'Create New User'}
        subtitle={editingId ? 'Update user details' : 'Email address is used as the login ID'}
        maxWidth="lg"
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
              ) : editingId ? 'Update User' : 'Create User'}
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
          {/* Login Credentials Section */}
          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-4 h-4 text-indigo-600" strokeWidth={2} />
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Login Credentials
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  Email Address (Login ID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="user@company.com"
                  disabled={!!editingId}
                  className={`w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm ${
                    editingId ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'
                  }`}
                />
                {editingId ? (
                  <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed after creation</p>
                ) : (
                  <p className="text-[10px] text-indigo-600 mt-1">Used to log into the system</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  {editingId ? 'New Password' : 'Password'}{' '}
                  {!editingId && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={editingId ? 'Leave empty to keep current' : 'Min 6 characters'}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                />
                {!editingId && (
                  <p className="text-[10px] text-gray-400 mt-1">User will be asked to change on first login</p>
                )}
              </div>
            </div>
          </div>

          {/* Personal Details Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <UsersIcon className="w-4 h-4 text-gray-500" strokeWidth={2} />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Personal Details
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  Phone Number
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91-9876543210"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
                />
              </div>
            </div>
          </div>

          {/* Role & Department Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-gray-500" strokeWidth={2} />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Role & Department
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
                >
                  <option value="">No Role</option>
                  {roles.filter((r) => r.is_active).map((r) => (
                    <option key={r.id} value={String(r.id)}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">Department</label>
                <select
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
                >
                  <option value="">No Department</option>
                  {departments.filter((d) => d.is_active).map((d) => (
                    <option key={d.id} value={String(d.id)}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Active toggle — edit only */}
          {editingId && (
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 font-medium">Active Account</span>
              </label>
              <span className="text-xs text-gray-400">Inactive users cannot log in</span>
            </div>
          )}
        </div>
      </Modal>

      {/* ─── Deactivate Modal ─────────────────────────────────────── */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Deactivate User"
        subtitle="The user will be marked inactive and cannot log in."
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
              onClick={handleDeactivate}
              disabled={deleting}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-md transition text-sm disabled:opacity-60 flex items-center gap-2"
            >
              {deleting ? (
                <><Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />Deactivating…</>
              ) : 'Deactivate'}
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <Trash2 className="w-7 h-7 text-red-500" strokeWidth={2} />
          </div>
          <p className="text-gray-700 font-medium">
            Deactivate{' '}
            <span className="font-bold">{deleteUser?.full_name}</span>?
          </p>
          <p className="text-sm text-gray-400 mt-1">{deleteUser?.email}</p>
          <p className="text-xs text-gray-400 mt-3">
            They will no longer be able to log into the system.
          </p>
        </div>
      </Modal>

      {/* ─── Reset Password Modal ─────────────────────────────────── */}
      <Modal
        open={!!resetUserId}
        onClose={() => { setResetUserId(null); setResetSuccess(''); setResetError(''); }}
        title="Reset Password"
        subtitle={`${resetUser?.full_name || ''} · ${resetUser?.email || ''}`}
        maxWidth="sm"
        footer={
          <>
            <button
              onClick={() => { setResetUserId(null); setResetSuccess(''); setResetError(''); }}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleResetPassword}
              disabled={resetting || !!resetSuccess}
              className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm bg-amber-500 hover:bg-amber-600 disabled:opacity-60 flex items-center gap-2"
            >
              {resetting ? (
                <><Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />Resetting…</>
              ) : (
                <><KeyRound className="w-4 h-4" strokeWidth={2} />Reset Password</>
              )}
            </button>
          </>
        }
      >
        {resetError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
            {resetError}
          </div>
        )}
        {resetSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
            {resetSuccess}
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-gray-800 mb-1.5">
            New Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
            placeholder="Min 6 characters"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
          />
          <p className="text-xs text-gray-400 mt-1.5">
            User will be forced to change this password on next login.
          </p>
        </div>
      </Modal>
    </Layout>
  );
}
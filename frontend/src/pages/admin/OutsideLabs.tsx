// src/pages/admin/OutsideLabs.tsx

import { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import DataTable, { type Column } from '../../components/DataTable';
import Modal from '../../components/Modal';
import {
  vendorStorage,
  auditStorage,
  auditActor,
  type Vendor,
} from '../../utils/storage';
import { GAUGE_TYPES } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import {
  FlaskConical,
  Plus,
  Search,
  Edit3,
  Trash2,
  AlertCircle,
  ShieldCheck,
  Phone,
} from 'lucide-react';

const emptyForm: Omit<Vendor, 'id'> = {
  name: '',
  accreditationNo: '',
  scope: '',
  contact: '',
};

export default function OutsideLabs() {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>(vendorStorage.getAll());
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const reload = () => setVendors(vendorStorage.getAll());

  const filtered = useMemo(() => {
    if (!search) return vendors;
    const q = search.toLowerCase();
    return vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.accreditationNo.toLowerCase().includes(q) ||
        v.scope.toLowerCase().includes(q)
    );
  }, [vendors, search]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (v: Vendor) => {
    setEditingId(v.id);
    const { id, ...rest } = v;
    setForm(rest);
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.accreditationNo.trim() || !form.scope.trim()) {
      setFormError('Lab Name, Accreditation No., and Scope are required.');
      return;
    }

    if (editingId) {
      vendorStorage.update(editingId, form);
      auditStorage.add({
        action: 'UPDATE',
        entityType: 'Vendor',
        entityId: editingId,
        entityReference: form.name,
        description: `Updated outside lab ${form.name}`,
        ...auditActor(user),
        timestamp: new Date().toISOString(),
      });
    } else {
      const created = vendorStorage.add(form);
      auditStorage.add({
        action: 'CREATE',
        entityType: 'Vendor',
        entityId: created.id,
        entityReference: created.name,
        description: `Created outside lab ${created.name}`,
        ...auditActor(user),
        timestamp: new Date().toISOString(),
      });
    }
    reload();
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const vendorToDelete = vendors.find((v) => v.id === deleteId);
    vendorStorage.delete(deleteId);
    auditStorage.add({
      action: 'DELETE',
      entityType: 'Vendor',
      entityId: deleteId,
      entityReference: vendorToDelete?.name,
      description: `Deleted outside lab ${vendorToDelete?.name || deleteId}`,
      ...auditActor(user),
      timestamp: new Date().toISOString(),
    });
    reload();
    setDeleteId(null);
  };

  const updateField = <K extends keyof Omit<Vendor, 'id'>>(
    key: K,
    value: Omit<Vendor, 'id'>[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  // ─── Scope (gauge types) multi-select ──────────────────────────────
  const selectedScopeTypes = form.scope
    ? form.scope.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const toggleScopeType = (type: string) => {
    const next = selectedScopeTypes.includes(type)
      ? selectedScopeTypes.filter((t) => t !== type)
      : [...selectedScopeTypes, type];
    updateField('scope', next.join(', '));
  };

  // ─── Table Columns ────────────────────────────────────────────────
  const columns: Column<Vendor>[] = [
    {
      header: 'Lab Name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <FlaskConical className="w-4 h-4 text-indigo-500" strokeWidth={2} />
          </div>
          <span className="font-semibold text-gray-800">{row.name}</span>
        </div>
      ),
    },
    {
      header: 'Accreditation No.',
      cell: (row) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-mono font-semibold">
          <ShieldCheck className="w-3 h-3" strokeWidth={2.5} />
          {row.accreditationNo}
        </span>
      ),
    },
    {
      header: 'Approved Scope',
      cell: (row) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {row.scope
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[11px] font-medium"
              >
                {s}
              </span>
            ))}
        </div>
      ),
    },
    {
      header: 'Contact',
      cell: (row) => (
        <span className="flex items-center gap-1.5 text-sm text-gray-600">
          <Phone className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
          {row.contact || '—'}
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

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <Layout
      pageTitle="Outside Labs"
      pageSubtitle="Manage accredited external calibration vendors and their scope"
      pageIcon={FlaskConical}
      headerAction={
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition text-sm"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Add Outside Lab
        </button>
      }
    >
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search lab name, accreditation no., scope…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>
          <span className="text-sm text-gray-500 whitespace-nowrap">
            <span className="font-bold text-gray-800">{vendors.length}</span>{' '}
            {vendors.length === 1 ? 'Lab' : 'Labs'}
          </span>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(row) => row.id}
        emptyTitle="No outside labs found"
        emptySubtitle="Add an accredited outside lab to use during External Calibration."
        emptyIcon={<FlaskConical className="w-8 h-8 text-gray-300" strokeWidth={1.5} />}
      />

      {/* ─── Add / Edit Modal ──────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Outside Lab' : 'Add Outside Lab'}
        subtitle="Record the vendor's accreditation and approved gauge scope"
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
              className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm"
              style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }}
            >
              {editingId ? 'Update' : 'Create'} Lab
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Lab Name */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">
              Lab Name <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="e.g. Precision Cal India"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
            />
          </div>

          {/* Accreditation No. */}
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">
              NABL Accreditation No. <span className="text-red-500">*</span>
            </label>
            <input
              value={form.accreditationNo}
              onChange={(e) => updateField('accreditationNo', e.target.value)}
              placeholder="e.g. NABL-2045"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm font-mono"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">
              Contact Details
            </label>
            <input
              value={form.contact}
              onChange={(e) => updateField('contact', e.target.value)}
              placeholder="e.g. +91-9876543210"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
            />
          </div>

          {/* Scope */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-800 mb-2">
              Approved Scope (gauge types) <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {GAUGE_TYPES.map((type) => {
                const selected = selectedScopeTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleScopeType(type)}
                    className={`p-2 rounded-lg border text-center text-xs transition ${
                      selected
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-700 font-bold'
                        : 'border-gray-200 text-gray-600 hover:border-indigo-200'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              Select every gauge type this lab is accredited to calibrate.
            </p>
          </div>
        </div>
      </Modal>

      {/* ─── Delete Confirmation Modal ─────────────────────────────── */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Outside Lab"
        subtitle="This action cannot be undone."
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
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-md transition text-sm"
            >
              Delete
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <Trash2 className="w-7 h-7 text-red-500" strokeWidth={2} />
          </div>
          <p className="text-gray-700">
            Are you sure you want to delete{' '}
            <span className="font-bold">
              {vendors.find((v) => v.id === deleteId)?.name}
            </span>
            ? Any external calibration records referencing this lab will keep the reference by ID only.
          </p>
        </div>
      </Modal>
    </Layout>
  );
}

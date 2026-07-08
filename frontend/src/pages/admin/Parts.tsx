// src/pages/admin/Parts.tsx

import { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import DataTable, { type Column } from '../../components/DataTable';
import Modal from '../../components/Modal';
import {
  partStorage,
  auditStorage,
  type Part,
} from '../../utils/storage';
import {
  Package,
  Plus,
  Search,
  Edit3,
  Trash2,
  AlertCircle,
  Ruler,
} from 'lucide-react';

const emptyForm: Omit<Part, 'id'> = {
  partName: '',
  partNumber: '',
  description: '',
  specification: '',
  upperSpecLimit: 0,
  lowerSpecLimit: 0,
  tolerance: 0,
  nominalValue: 0,
  trueValue: 0,
  characteristic: '',
  isActive: true,
};

export default function Parts() {
  const [parts, setParts] = useState<Part[]>(partStorage.getAll());
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const reload = () => setParts(partStorage.getAll());

  const filtered = useMemo(() => {
    if (!search) return parts;
    const q = search.toLowerCase();
    return parts.filter(
      (p) =>
        p.partName.toLowerCase().includes(q) ||
        p.partNumber.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.characteristic.toLowerCase().includes(q)
    );
  }, [parts, search]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (p: Part) => {
    setEditingId(p.id);
    const { id, ...rest } = p;
    setForm(rest);
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.partName.trim() || !form.partNumber.trim()) {
      setFormError('Part Name and Part Number are required.');
      return;
    }
    if (form.upperSpecLimit <= form.lowerSpecLimit) {
      setFormError('Upper Spec Limit must be greater than Lower Spec Limit.');
      return;
    }
    if (form.trueValue < form.lowerSpecLimit || form.trueValue > form.upperSpecLimit) {
      setFormError('True Value should typically be within specification limits.');
      // Just warn, don't block
    }

    // Auto-calculate tolerance if not set
    const finalForm = { ...form };
    if (!finalForm.tolerance || finalForm.tolerance === 0) {
      finalForm.tolerance = finalForm.upperSpecLimit - finalForm.lowerSpecLimit;
    }
    if (!finalForm.nominalValue || finalForm.nominalValue === 0) {
      finalForm.nominalValue = (finalForm.upperSpecLimit + finalForm.lowerSpecLimit) / 2;
    }

    if (editingId) {
      partStorage.update(editingId, finalForm);
      auditStorage.add({
        action: 'UPDATE', entityType: 'Part', entityId: editingId,
        userId: 'current', timestamp: new Date().toISOString(),
      });
    } else {
      const created = partStorage.add(finalForm);
      auditStorage.add({
        action: 'CREATE', entityType: 'Part', entityId: created.id,
        userId: 'current', timestamp: new Date().toISOString(),
      });
    }
    reload();
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    partStorage.delete(deleteId);
    auditStorage.add({
      action: 'DELETE', entityType: 'Part', entityId: deleteId,
      userId: 'current', timestamp: new Date().toISOString(),
    });
    reload();
    setDeleteId(null);
  };

  const columns: Column<Part>[] = [
    {
      header: 'Part',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <Package className="w-4 h-4 text-indigo-500" strokeWidth={2} />
          </div>
          <div>
            <p className="font-semibold text-gray-800">{row.partName}</p>
            <p className="text-xs text-gray-400 font-mono">{row.partNumber}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Characteristic',
      cell: (row) => (
        <span className="text-sm text-gray-700">{row.characteristic || '—'}</span>
      ),
    },
    {
      header: 'Specification',
      cell: (row) => (
        <span className="text-sm font-mono text-gray-600">{row.specification || '—'}</span>
      ),
    },
    {
      header: 'True Value',
      cell: (row) => (
        <span className="text-sm font-mono font-bold text-indigo-600">
          {row.trueValue.toFixed(3)}
        </span>
      ),
    },
    {
      header: 'Spec Range',
      cell: (row) => (
        <span className="text-xs font-mono text-gray-500">
          {row.lowerSpecLimit.toFixed(3)} — {row.upperSpecLimit.toFixed(3)}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            row.isActive
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              row.isActive ? 'bg-emerald-500' : 'bg-red-500'
            }`}
          />
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      width: '120px',
      align: 'center' as const,
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

  const deletePart = parts.find((p) => p.id === deleteId);

  return (
    <Layout pageTitle="Parts Master" pageSubtitle="Manage part numbers and their associated gauge requirements" pageIcon={Package}>
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search parts, characteristics…"
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
          Add Part
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Parts', value: parts.length, accent: 'from-indigo-500 to-purple-500' },
          { label: 'Active', value: parts.filter((p) => p.isActive).length, accent: 'from-emerald-500 to-teal-500' },
          { label: 'Inactive', value: parts.filter((p) => !p.isActive).length, accent: 'from-red-500 to-rose-500' },
          { label: 'Characteristics', value: new Set(parts.map((p) => p.characteristic).filter(Boolean)).size, accent: 'from-blue-500 to-cyan-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${s.accent}`} />
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{s.label}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Info box */}
      <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-2">
        <Ruler className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
        <div className="text-xs text-indigo-700">
          <strong>True Value</strong> is the known reference value of a part (from a certified master gauge or calibrated standard).
          It's used for <strong>Bias</strong> and <strong>Linearity</strong> studies to compare measurements against a known truth.
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(row) => row.id}
        emptyTitle="No parts found"
        emptySubtitle="Add parts to use in MSA studies."
        emptyIcon={<Package className="w-8 h-8 text-gray-300" strokeWidth={1.5} />}
      />

      {/* ─── Add / Edit Modal ──────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Part' : 'Add New Part'}
        subtitle="Define part with true value for MSA calculations"
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
              {editingId ? 'Update' : 'Create'} Part
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
                Part Name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.partName}
                onChange={(e) => setForm({ ...form, partName: e.target.value })}
                placeholder="e.g. Part A - Lower Extreme"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                Part Number <span className="text-red-500">*</span>
              </label>
              <input
                value={form.partNumber}
                onChange={(e) => setForm({ ...form, partNumber: e.target.value })}
                placeholder="e.g. P-001"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">
              Description
            </label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Crankshaft Bearing Housing - near lower spec"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                Characteristic Measured
              </label>
              <input
                value={form.characteristic}
                onChange={(e) => setForm({ ...form, characteristic: e.target.value })}
                placeholder="e.g. Shaft Diameter"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                Specification (display)
              </label>
              <input
                value={form.specification}
                onChange={(e) => setForm({ ...form, specification: e.target.value })}
                placeholder="e.g. 25.000 ±0.050 mm"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
              />
            </div>
          </div>

          {/* Tolerance & Spec Limits */}
          <div className="bg-indigo-50/50 rounded-xl border border-indigo-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Ruler className="w-4 h-4 text-indigo-600" strokeWidth={2} />
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Specification Values (for MSA calculations)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  Upper Spec Limit (USL) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={form.upperSpecLimit || ''}
                  onChange={(e) => setForm({ ...form, upperSpecLimit: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g. 25.050"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  Lower Spec Limit (LSL) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={form.lowerSpecLimit || ''}
                  onChange={(e) => setForm({ ...form, lowerSpecLimit: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g. 24.950"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  Nominal Value
                </label>
                <input
                  type="number"
                  step="any"
                  value={form.nominalValue || ''}
                  onChange={(e) => setForm({ ...form, nominalValue: parseFloat(e.target.value) || 0 })}
                  placeholder="Auto = (USL+LSL)/2"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  Tolerance
                </label>
                <input
                  type="number"
                  step="any"
                  value={form.tolerance || ''}
                  onChange={(e) => setForm({ ...form, tolerance: parseFloat(e.target.value) || 0 })}
                  placeholder="Auto = USL−LSL"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* True Value */}
          <div className="bg-purple-50/50 rounded-xl border border-purple-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Ruler className="w-4 h-4 text-purple-600" strokeWidth={2} />
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                True Value (Reference)
              </span>
            </div>

            <label className="block text-xs font-semibold text-gray-800 mb-1.5">
              True Value <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              value={form.trueValue || ''}
              onChange={(e) => setForm({ ...form, trueValue: parseFloat(e.target.value) || 0 })}
              placeholder="e.g. 24.952 (known from certified master)"
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm font-mono"
            />
            <p className="text-[10px] text-purple-600 mt-1.5">
              This is the reference "true" value used for Bias and Linearity calculations.
              Typically obtained from a higher-accuracy master gauge or calibrated standard.
            </p>
          </div>

          {editingId && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 font-medium">Active</span>
            </label>
          )}
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Part"
        subtitle="This may affect existing MSA studies."
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
            Delete part <span className="font-bold">{deletePart?.partName}</span> ({deletePart?.partNumber})?
          </p>
        </div>
      </Modal>
    </Layout>
  );
}
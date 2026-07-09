// src/pages/admin/Methods.tsx

import { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import DataTable, { type Column } from '../../components/DataTable';
import Modal from '../../components/Modal';
import {
  methodStorage,
  auditStorage,
  type CalibrationMethod,
} from '../../utils/storage';
import {
  Settings2,
  Plus,
  Search,
  Edit3,
  Trash2,
  AlertCircle,
  Ruler,
  Hash,
  Target,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

// Must match GAUGE_TYPES in GaugeMaster.tsx
const GAUGE_TYPES = [
  'Vernier Caliper', 'Micrometer', 'Height Gauge', 'Dial Indicator',
  'Feeler Gauge', 'Ring Gauge', 'Plug Gauge', 'Roughness Tester',
  'Torque Wrench', 'Bore Gauge', 'Thread Gauge', 'Other',
];

const UNIT_OPTIONS = ['mm', 'µm', 'inch', 'Nm', 'N', 'kgf', 'psi', 'bar', '°', 'Ra'];

const emptyForm = {
  gaugeType: '',
  numberOfReadings: 5,
  avgDeviationLimit: 0.05,
  unit: 'mm',
  description: '',
  isActive: true,
};

export default function Methods() {
  const [methods, setMethods] = useState<CalibrationMethod[]>(methodStorage.getAll());
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const reload = () => setMethods(methodStorage.getAll());

  // ─── Filtered list ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = methods;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.gaugeType.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
      );
    }
    if (filterActive === 'active') list = list.filter((m) => m.isActive);
    if (filterActive === 'inactive') list = list.filter((m) => !m.isActive);
    return list;
  }, [methods, search, filterActive]);

  // ─── Which gauge types don't have a method yet? ───────────────────
  const coveredTypes = new Set(
    methods.filter((m) => m.isActive).map((m) => m.gaugeType.toLowerCase())
  );
  const uncoveredTypes = GAUGE_TYPES.filter(
    (t) => !coveredTypes.has(t.toLowerCase())
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (m: CalibrationMethod) => {
    setEditingId(m.id);
    setForm({
      gaugeType: m.gaugeType,
      numberOfReadings: m.numberOfReadings,
      avgDeviationLimit: m.avgDeviationLimit,
      unit: m.unit,
      description: m.description,
      isActive: m.isActive,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.gaugeType) {
      setFormError('Gauge Type is required.');
      return;
    }
    if (!form.numberOfReadings || form.numberOfReadings < 1) {
      setFormError('Number of Readings must be at least 1.');
      return;
    }
    if (form.avgDeviationLimit <= 0) {
      setFormError('Average Deviation Limit must be greater than 0.');
      return;
    }

    // Check for duplicate gauge type (unless editing itself)
    const duplicate = methods.find(
      (m) =>
        m.gaugeType.toLowerCase() === form.gaugeType.toLowerCase() &&
        m.id !== editingId
    );
    if (duplicate) {
      setFormError(
        `A method for "${form.gaugeType}" already exists. Edit that method instead.`
      );
      return;
    }

    if (editingId) {
      methodStorage.update(editingId, form);
      auditStorage.add({
        action: 'UPDATE',
        entityType: 'CalibrationMethod',
        entityId: editingId,
        userId: 'current',
        timestamp: new Date().toISOString(),
      });
    } else {
      const created = methodStorage.add(form);
      auditStorage.add({
        action: 'CREATE',
        entityType: 'CalibrationMethod',
        entityId: created.id,
        userId: 'current',
        timestamp: new Date().toISOString(),
      });
    }

    reload();
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    methodStorage.delete(deleteId);
    auditStorage.add({
      action: 'DELETE',
      entityType: 'CalibrationMethod',
      entityId: deleteId,
      userId: 'current',
      timestamp: new Date().toISOString(),
    });
    reload();
    setDeleteId(null);
  };

  const deleteMethod = methods.find((m) => m.id === deleteId);

  // ─── Table Columns ─────────────────────────────────────────────────
  const columns: Column<CalibrationMethod>[] = [
    {
      header: 'Gauge Type',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <Ruler className="w-4 h-4 text-indigo-500" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-800">{row.gaugeType}</p>
            {row.description && (
              <p className="text-xs text-gray-400 truncate max-w-[280px]">
                {row.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Readings',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <Hash className="w-3.5 h-3.5 text-blue-400" strokeWidth={2} />
          <span className="font-bold text-blue-600">{row.numberOfReadings}</span>
          <span className="text-xs text-gray-400">points</span>
        </div>
      ),
    },
    {
      header: 'Deviation Limit',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} />
          <span className="font-mono font-bold text-emerald-600">
            ≤ {row.avgDeviationLimit}
          </span>
          <span className="text-xs text-gray-400">{row.unit}</span>
        </div>
      ),
    },
    {
      header: 'Pass Criteria',
      cell: (row) => (
        <span className="text-xs text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded">
          avg ≤ {row.avgDeviationLimit} {row.unit}
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

  return (
    <Layout
      pageTitle="Calibration Methods"
      pageSubtitle="Configure pass/fail criteria and number of readings for each gauge type"
      pageIcon={Settings2}
    >
      {/* ─── Top Bar ──────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              strokeWidth={2}
            />
            <input
              type="text"
              placeholder="Search methods…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value as typeof filterActive)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition text-sm"
          style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }}
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Add Method
        </button>
      </div>

      {/* ─── Stats ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500" />
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
            Total Methods
          </p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{methods.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-500" />
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
            Active
          </p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {methods.filter((m) => m.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-cyan-500" />
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
            Gauge Types Covered
          </p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {coveredTypes.size} / {GAUGE_TYPES.length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative overflow-hidden">
          <div
            className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${
              uncoveredTypes.length > 0 ? 'from-amber-500 to-orange-500' : 'from-emerald-500 to-green-500'
            }`}
          />
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
            Uncovered Types
          </p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{uncoveredTypes.length}</p>
        </div>
      </div>

      {/* ─── Uncovered types warning ──────────────────────────────── */}
      {uncoveredTypes.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-amber-600" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800">
                {uncoveredTypes.length} gauge type{uncoveredTypes.length === 1 ? '' : 's'} without a calibration method
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Gauges of these types will use the default (5 readings, ≤ 0.05 deviation).
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {uncoveredTypes.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 bg-white text-amber-700 rounded-lg text-xs font-medium border border-amber-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Table ────────────────────────────────────────────────── */}
      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(row) => row.id}
        emptyTitle="No calibration methods"
        emptySubtitle="Add your first method to define pass/fail criteria for a gauge type."
        emptyIcon={<Settings2 className="w-8 h-8 text-gray-300" strokeWidth={1.5} />}
      />

      {/* ─── Add / Edit Modal ─────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Calibration Method' : 'Add Calibration Method'}
        subtitle="Define pass/fail criteria for a gauge type"
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
              {editingId ? 'Update' : 'Create'} Method
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
          {/* Gauge Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">
              Gauge Type <span className="text-red-500">*</span>
            </label>
            <select
              value={form.gaugeType}
              onChange={(e) => setForm({ ...form, gaugeType: e.target.value })}
              disabled={!!editingId}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select gauge type</option>
              {GAUGE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {editingId && (
              <p className="text-[10px] text-gray-400 mt-1">
                Gauge type cannot be changed. Delete and re-create if needed.
              </p>
            )}
          </div>

          {/* Highlighted Criteria Section */}
          <div className="bg-indigo-50/50 rounded-xl border border-indigo-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-indigo-600" strokeWidth={2} />
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Pass/Fail Criteria
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Number of Readings */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  Number of Readings <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={form.numberOfReadings}
                  onChange={(e) =>
                    setForm({ ...form, numberOfReadings: parseInt(e.target.value) || 1 })
                  }
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                />
                <p className="text-[10px] text-gray-400 mt-1">How many readings to take</p>
              </div>

              {/* Deviation Limit */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  Deviation Limit <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min={0}
                  value={form.avgDeviationLimit}
                  onChange={(e) =>
                    setForm({ ...form, avgDeviationLimit: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm font-mono"
                />
                <p className="text-[10px] text-gray-400 mt-1">Max avg deviation allowed</p>
              </div>

              {/* Unit */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  Unit
                </label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm appearance-none cursor-pointer"
                >
                  {UNIT_OPTIONS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">Measurement unit</p>
              </div>
            </div>

            {/* Live preview */}
            <div className="mt-3 p-3 bg-white border border-indigo-200 rounded-lg">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">
                Preview
              </p>
              <div className="flex items-center gap-4 flex-wrap text-sm">
                <span className="text-gray-700">
                  Take <strong className="text-blue-600">{form.numberOfReadings}</strong> readings
                </span>
                <span className="text-gray-400">→</span>
                <span className="flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                  <strong className="font-mono">Pass</strong> if avg ≤ {form.avgDeviationLimit} {form.unit}
                </span>
                <span className="flex items-center gap-1 text-red-700">
                  <XCircle className="w-3.5 h-3.5" strokeWidth={2} />
                  <strong className="font-mono">Fail</strong> if avg &gt; {form.avgDeviationLimit} {form.unit}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">
              Description / Method Notes
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="e.g. Standard 5-point calibration at 0, 25, 50, 75, 100% of range using master ring gauges."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm resize-none"
            />
          </div>

          {/* Active */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700 font-medium">Active</span>
            <span className="text-xs text-gray-400">
              (only active methods are used during calibration)
            </span>
          </label>
        </div>
      </Modal>

      {/* ─── Delete Confirmation ──────────────────────────────────── */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Calibration Method"
        subtitle="Calibrations already recorded will keep their original criteria."
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
            Delete the method for{' '}
            <span className="font-bold">{deleteMethod?.gaugeType}</span>?
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Future calibrations for this gauge type will use defaults (5 readings, ≤ 0.05).
          </p>
        </div>
      </Modal>
    </Layout>
  );
}
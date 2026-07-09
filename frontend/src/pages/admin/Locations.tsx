// src/pages/admin/Locations.tsx

import { useState, useMemo, useEffect } from 'react';
import Layout from '../../components/Layout';
import DataTable, { type Column } from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import {
  locationStorage,
  auditStorage,
  auditActor,
  type Location,
} from '../../utils/storage';
import { departmentsAPI, type DepartmentType } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import {
  MapPin,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  AlertCircle,
  Building2,
} from 'lucide-react';

const emptyForm = {
  name: '',
  departmentId: '',
  departmentName: '',
  description: '',
  isActive: true,
};

export default function Locations() {
  const { user } = useAuth();
  const [locations, setLocations] = useState<Location[]>(locationStorage.getAll());
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [departments, setDepartments] = useState<DepartmentType[]>([]);

  useEffect(() => {
    departmentsAPI
      .list()
      .then((data) => setDepartments(Array.isArray(data) ? data : []))
      .catch(() => setDepartments([]));
  }, []);

  const reload = () => setLocations(locationStorage.getAll());

  // ─── Filtering ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = locations;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.departmentName.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q)
      );
    }
    if (filterDept) {
      list = list.filter((l) => l.departmentName === filterDept);
    }
    return list;
  }, [locations, search, filterDept]);

  // ─── Group by department for stats ─────────────────────────────────
  const deptCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    locations.forEach((l) => {
      if (l.isActive) {
        counts[l.departmentName] = (counts[l.departmentName] || 0) + 1;
      }
    });
    return counts;
  }, [locations]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (loc: Location) => {
    setEditingId(loc.id);
    setForm({
      name: loc.name,
      departmentId: loc.departmentId,
      departmentName: loc.departmentName,
      description: loc.description,
      isActive: loc.isActive,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      setFormError('Location name is required.');
      return;
    }
    if (!form.departmentName) {
      setFormError('Department is required.');
      return;
    }

    // Check for duplicate name in same department
    const duplicate = locations.find(
      (l) =>
        l.name.toLowerCase() === form.name.trim().toLowerCase() &&
        l.departmentName === form.departmentName &&
        l.id !== editingId
    );
    if (duplicate) {
      setFormError(`Location "${form.name}" already exists in ${form.departmentName}.`);
      return;
    }

    if (editingId) {
      locationStorage.update(editingId, form);
      auditStorage.add({
        action: 'UPDATE', entityType: 'Location', entityId: editingId,
        entityReference: form.name, description: `Updated location ${form.name}`,
        ...auditActor(user), timestamp: new Date().toISOString(),
      });
    } else {
      const created = locationStorage.add(form);
      auditStorage.add({
        action: 'CREATE', entityType: 'Location', entityId: created.id,
        entityReference: created.name, description: `Created location ${created.name}`,
        ...auditActor(user), timestamp: new Date().toISOString(),
      });
    }

    reload();
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const locationToDelete = locations.find((l) => l.id === deleteId);
    locationStorage.delete(deleteId);
    auditStorage.add({
      action: 'DELETE', entityType: 'Location', entityId: deleteId,
      entityReference: locationToDelete?.name,
      description: `Deleted location ${locationToDelete?.name || deleteId}`,
      ...auditActor(user), timestamp: new Date().toISOString(),
    });
    reload();
    setDeleteId(null);
  };

  const handleDeptChange = (deptName: string) => {
    const dept = departments.find((d) => d.name === deptName);
    setForm({
      ...form,
      departmentName: deptName,
      departmentId: dept ? String(dept.id) : '',
    });
  };

  // ─── Columns ──────────────────────────────────────────────────────
  const columns: Column<Location>[] = [
    {
      header: 'Location',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-indigo-500" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-800">{row.name}</p>
            {row.description && (
              <p className="text-xs text-gray-400 truncate max-w-[250px]">
                {row.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Department',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
          <span className="text-sm font-medium text-gray-700">
            {row.departmentName}
          </span>
        </div>
      ),
    },
    {
      header: 'Description',
      cell: (row) => (
        <span className="text-sm text-gray-500 truncate max-w-[200px] block">
          {row.description || '—'}
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

  const deleteLoc = locations.find((l) => l.id === deleteId);

  return (
    <Layout pageTitle="Locations" pageSubtitle="Manage storage and calibration locations across departments" pageIcon={MapPin}>
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
              placeholder="Search locations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              strokeWidth={2}
            />
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition appearance-none cursor-pointer"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition text-sm"
          style={{
            background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
          }}
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Add Location
        </button>
      </div>

      {/* ─── Department-wise Stats ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-gradient-to-br from-indigo-100 to-indigo-50/60 rounded-xl p-4 shadow-sm border border-indigo-200 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500" />
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
            Total
          </p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {locations.filter((l) => l.isActive).length}
          </p>
        </div>
        {departments.slice(0, 4).map((dept) => (
          <div
            key={dept.id}
            className="bg-gradient-to-br from-emerald-100 to-emerald-50/60 rounded-xl p-4 shadow-sm border border-emerald-200 relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-500" />
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold truncate">
              {dept.name}
            </p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {deptCounts[dept.name] || 0}
            </p>
          </div>
        ))}
      </div>

      {/* ─── Location Cards grouped by Department ──────────────────── */}
      {!filterDept && !search && (
        <div className="mb-6 space-y-4">
          {departments.map((dept) => {
            const deptLocations = locations.filter(
              (l) => l.departmentName === dept.name && l.isActive
            );
            if (deptLocations.length === 0) return null;
            return (
              <div
                key={dept.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2
                      className="w-4 h-4 text-indigo-500"
                      strokeWidth={2}
                    />
                    <span className="text-sm font-bold text-gray-700">
                      {dept.name}
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full">
                      {deptLocations.length}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {deptLocations.map((loc) => (
                      <div
                        key={loc.id}
                        className="group flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-lg transition cursor-pointer"
                        onClick={() => openEdit(loc)}
                      >
                        <MapPin
                          className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500"
                          strokeWidth={2}
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-700 group-hover:text-indigo-700">
                            {loc.name}
                          </p>
                          {loc.description && (
                            <p className="text-[10px] text-gray-400">
                              {loc.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Table (shown when filtering/searching) ────────────────── */}
      {(filterDept || search) && (
        <DataTable
          columns={columns}
          data={filtered}
          keyExtractor={(row) => row.id}
          emptyTitle="No locations found"
          emptySubtitle="No locations match the selected filters."
          emptyIcon={
            <MapPin className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
          }
        />
      )}

      {/* Show table toggle when not filtering */}
      {!filterDept && !search && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span
              className="inline-block w-1 h-6 rounded-full"
              style={{
                background:
                  'linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%)',
              }}
            />
            <h3 className="text-lg font-bold text-gray-800">All Locations</h3>
            <span className="ml-2 px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full">
              {locations.length}
            </span>
          </div>
          <DataTable
            columns={columns}
            data={locations}
            keyExtractor={(row) => row.id}
            emptyTitle="No locations"
            emptySubtitle="Add your first location."
            emptyIcon={
              <MapPin className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
            }
          />
        </div>
      )}

      {/* ─── Add / Edit Modal ──────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Location' : 'Add New Location'}
        subtitle="Define a physical location within a department"
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
              className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm"
              style={{
                background:
                  'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
              }}
            >
              {editingId ? 'Update' : 'Create'} Location
            </button>
          </>
        }
      >
        {formError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle
              className="w-4 h-4 flex-shrink-0 mt-0.5"
              strokeWidth={2}
            />
            {formError}
          </div>
        )}

        <div className="space-y-4">
          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              value={form.departmentName}
              onChange={(e) => handleDeptChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">
              Location Name <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Shelf A1, Cabinet C2, Station 3, Rack 1"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Examples: Shelf A1, Cabinet C2, Station 3, Rack 1, Workbench 2,
              Bin A1
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">
              Description
            </label>
            <input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="e.g. Top shelf near lab entry, locked cabinet for ring gauges"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
            />
          </div>

          {/* Active */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm({ ...form, isActive: e.target.checked })
              }
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700 font-medium">Active</span>
          </label>

          {/* Show existing locations for selected department */}
          {form.departmentName && (
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-xs font-semibold text-gray-600 mb-2">
                Existing locations in {form.departmentName}:
              </p>
              {(() => {
                const existing = locationStorage.getByDepartment(
                  form.departmentName
                );
                return existing.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {existing.map((loc) => (
                      <span
                        key={loc.id}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
                          loc.id === editingId
                            ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300'
                            : 'bg-white text-gray-600 border border-gray-200'
                        }`}
                      >
                        <MapPin className="w-3 h-3" strokeWidth={2} />
                        {loc.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">
                    No locations yet — this will be the first!
                  </p>
                );
              })()}
            </div>
          )}
        </div>
      </Modal>

      {/* ─── Delete Confirmation ──────────────────────────────────── */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Location"
        subtitle="Gauges using this location will keep their current value."
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
            Delete location{' '}
            <span className="font-bold">
              {deleteLoc?.name}
            </span>{' '}
            from {deleteLoc?.departmentName}?
          </p>
        </div>
      </Modal>
    </Layout>
  );
}
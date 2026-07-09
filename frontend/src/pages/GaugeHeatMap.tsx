import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import {
  gaugeStorage,
  locationStorage,
  type Gauge,
  type Location,
} from '../utils/storage';
import { departmentsAPI, type DepartmentType } from '../api/api';
import {
  Map as MapIcon,
  MapPin,
  Building2,
  Package,
  Search,
  Filter,
  Gauge as GaugeIcon,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  BarChart3,
  Eye,
  XCircle,
  Calendar,
  ArrowRight,
  Layers,
} from 'lucide-react';

// ─── Status → Color mapping ─────────────────────────────────────────
const STATUS_COLORS: Record<Gauge['status'], {
  bg: string;
  border: string;
  text: string;
  dot: string;
  label: string;
  icon: typeof CheckCircle2;
}> = {
  'Available': {
    bg: 'bg-emerald-500',
    border: 'border-emerald-600',
    text: 'text-white',
    dot: 'bg-emerald-500',
    label: 'Available',
    icon: CheckCircle2,
  },
  'Issued': {
    bg: 'bg-amber-500',
    border: 'border-amber-600',
    text: 'text-white',
    dot: 'bg-amber-500',
    label: 'Issued',
    icon: ArrowRight,
  },
  'Under Calibration': {
    bg: 'bg-blue-500',
    border: 'border-blue-600',
    text: 'text-white',
    dot: 'bg-blue-500',
    label: 'Under Calibration',
    icon: Wrench,
  },
  'Under MSA Study': {
    bg: 'bg-purple-500',
    border: 'border-purple-600',
    text: 'text-white',
    dot: 'bg-purple-500',
    label: 'Under MSA Study',
    icon: BarChart3,
  },
  'Under Review': {
    bg: 'bg-orange-500',
    border: 'border-orange-600',
    text: 'text-white',
    dot: 'bg-orange-500',
    label: 'Under Review',
    icon: Eye,
  },
  'Scrapped': {
    bg: 'bg-red-500',
    border: 'border-red-600',
    text: 'text-white',
    dot: 'bg-red-500',
    label: 'Scrapped',
    icon: XCircle,
  },
};

const EMPTY_LOC_STYLE = 'bg-gray-100 border-gray-200 text-gray-400';

// ─── Determine dominant status color for a location ─────────────────
function getLocationColor(gauges: Gauge[]): { bg: string; border: string } {
  if (gauges.length === 0) {
    return { bg: 'bg-gray-100', border: 'border-gray-200' };
  }

  // Priority order (worst first)
  const priority: Gauge['status'][] = [
    'Scrapped',
    'Under Review',
    'Under Calibration',
    'Under MSA Study',
    'Issued',
    'Available',
  ];

  for (const status of priority) {
    if (gauges.some((g) => g.status === status)) {
      return {
        bg: STATUS_COLORS[status].bg,
        border: STATUS_COLORS[status].border,
      };
    }
  }
  return { bg: 'bg-gray-300', border: 'border-gray-400' };
}

const getDueStatus = (dateStr: string) => {
  if (!dateStr) return '';
  const diff = (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (diff < 0) return 'Overdue';
  if (diff <= 30) return 'Due Soon';
  return '';
};

export default function GaugeHeatMap() {
  const navigate = useNavigate();
  const [gauges] = useState<Gauge[]>(gaugeStorage.getAll());
  const [locations] = useState<Location[]>(locationStorage.getAll());
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [selectedLoc, setSelectedLoc] = useState<Location | null>(null);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState<Gauge['status'] | ''>('');
  const detailsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    departmentsAPI
      .list()
      .then((data) => setDepartments(Array.isArray(data) ? data : []))
      .catch(() => setDepartments([]));
  }, []);
  // Auto-scroll to details panel when a location is selected
useEffect(() => {
  if (selectedLoc && detailsRef.current) {
    // Small delay so React finishes rendering the panel first
    setTimeout(() => {
      detailsRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  }
}, [selectedLoc]);
  // ─── Group locations by department ────────────────────────────────
  const deptMap = useMemo(() => {
    const map = new Map<string, Location[]>();
    departments.forEach((d) => map.set(d.name, []));
    locations
      .filter((l) => l.isActive)
      .forEach((l) => {
        if (!map.has(l.departmentName)) map.set(l.departmentName, []);
        map.get(l.departmentName)!.push(l);
      });
    return map;
  }, [departments, locations]);

  // ─── Get gauges for a specific location ───────────────────────────
  const getGaugesForLocation = (deptName: string, locName: string): Gauge[] => {
    return gauges.filter(
      (g) =>
        g.department === deptName &&
        g.location === locName &&
        (!filterStatus || g.status === filterStatus)
    );
  };

  // ─── Gauges in the selected location (for detail panel) ───────────
  const selectedGauges = useMemo(() => {
    if (!selectedLoc) return [];
    let list = gauges.filter(
      (g) =>
        g.department === selectedLoc.departmentName &&
        g.location === selectedLoc.name
    );
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (g) =>
          g.gaugeCode.toLowerCase().includes(q) ||
          g.name.toLowerCase().includes(q) ||
          g.type.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedLoc, gauges, search]);

  // ─── Overall stats ────────────────────────────────────────────────
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (Object.keys(STATUS_COLORS) as Gauge['status'][]).forEach((s) => {
      counts[s] = gauges.filter((g) => g.status === s).length;
    });
    return counts;
  }, [gauges]);

  const visibleDepartments = filterDept
    ? departments.filter((d) => d.name === filterDept)
    : departments;

  return (
    <Layout
      pageTitle="Gauge Heat Map"
      pageSubtitle="Visual overview of gauge locations and statuses across departments"
      pageIcon={MapIcon}
    >
      {/* ─── Top Filters ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-1 max-w-2xl">
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              strokeWidth={2}
            />
            <select
              value={filterDept}
              onChange={(e) => {
                setFilterDept(e.target.value);
                setSelectedLoc(null);
              }}
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
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as Gauge['status'] | '')}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition appearance-none cursor-pointer"
          >
            <option value="">All Status</option>
            {(Object.keys(STATUS_COLORS) as Gauge['status'][]).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── Status Legend / Stats ───────────────────────────────── */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-indigo-500" strokeWidth={2} />
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
            Status Legend
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          {(Object.keys(STATUS_COLORS) as Gauge['status'][]).map((status) => {
            const cfg = STATUS_COLORS[status];
            const Icon = cfg.icon;
            const isActive = filterStatus === status;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(isActive ? '' : status)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition ${
                  isActive
                    ? `${cfg.bg} ${cfg.border} ${cfg.text} shadow-md`
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isActive ? 'bg-white' : cfg.dot
                  }`}
                />
                <span className="text-xs font-semibold">{status}</span>
                <span
                  className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-white/20' : 'bg-white'
                  }`}
                >
                  {statusCounts[status] || 0}
                </span>
                <Icon className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Heat Map: Departments → Locations grid ──────────────── */}
      <div className="space-y-4 mb-6">
        {visibleDepartments.map((dept) => {
          const deptLocations = deptMap.get(dept.name) || [];
          if (deptLocations.length === 0) return null;

          return (
            <div
              key={dept.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Dept header */}
              <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-500" strokeWidth={2} />
                  <span className="text-sm font-bold text-gray-700">{dept.name}</span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full">
                    {deptLocations.length} location{deptLocations.length === 1 ? '' : 's'}
                  </span>
                </div>
                {(() => {
  const deptGauges = gauges.filter((g) => g.department === dept.name);
  const locNames = new Set(deptLocations.map((l) => l.name));
  const placed = deptGauges.filter((g) => locNames.has(g.location)).length;
  const unplaced = deptGauges.length - placed;
  return (
    <div className="text-xs text-gray-500 flex items-center gap-2">
      <span>
        <span className="font-bold text-gray-700">{placed}</span> in locations
      </span>
      {unplaced > 0 && (
        <span
          className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-semibold"
          title={`${unplaced} gauge(s) in "${dept.name}" have a location value that doesn't match any location tile — fix them in Gauge Master`}
        >
          +{unplaced} unplaced
        </span>
      )}
    </div>
  );
})()}
              </div>

              {/* Location grid */}
              <div className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {deptLocations.map((loc) => {
                    const locGauges = getGaugesForLocation(dept.name, loc.name);
                    const isEmpty = locGauges.length === 0;
                    const isSelected = selectedLoc?.id === loc.id;
                    const { bg, border } = getLocationColor(locGauges);

                    return (
                      <button
                        key={loc.id}
                        onClick={() => setSelectedLoc(isSelected ? null : loc)}
                        className={`relative p-3 rounded-xl border-2 transition-all text-left ${
                          isEmpty
                            ? EMPTY_LOC_STYLE
                            : `${bg} ${border} text-white shadow-md hover:shadow-lg hover:scale-[1.02]`
                        } ${isSelected ? 'ring-4 ring-indigo-300 ring-offset-2 scale-[1.02]' : ''}`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <MapPin
                            className={`w-4 h-4 flex-shrink-0 ${
                              isEmpty ? 'text-gray-400' : 'text-white'
                            }`}
                            strokeWidth={2}
                          />
                          {!isEmpty && (
                            <span className="text-[10px] font-bold bg-white/25 px-1.5 py-0.5 rounded backdrop-blur-sm">
                              {locGauges.length}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs font-bold uppercase tracking-wide truncate ${
                            isEmpty ? 'text-gray-500' : 'text-white'
                          }`}
                        >
                          {loc.name}
                        </p>
                        <p
                          className={`text-[10px] mt-0.5 truncate ${
                            isEmpty ? 'text-gray-400' : 'text-white/80'
                          }`}
                        >
                          {isEmpty ? 'Empty' : `${locGauges.length} gauge${locGauges.length === 1 ? '' : 's'}`}
                        </p>

                        {/* Mini status dots */}
                        {!isEmpty && (
                          <div className="flex gap-0.5 mt-2">
                            {locGauges.slice(0, 8).map((g, i) => (
                              <span
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[g.status].dot} ring-1 ring-white/40`}
                                title={`${g.gaugeCode} - ${g.status}`}
                              />
                            ))}
                            {locGauges.length > 8 && (
                              <span className="text-[9px] text-white/80 ml-1">
                                +{locGauges.length - 8}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {visibleDepartments.every((d) => (deptMap.get(d.name) || []).length === 0) && (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
            <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-gray-500 font-semibold">No locations found</p>
            <p className="text-sm text-gray-400 mt-1">
              Add locations under Administration → Locations to see them here.
            </p>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SELECTED LOCATION DETAILS — Two Panels                     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {selectedLoc && (
  <div
    ref={detailsRef}
    className="grid grid-cols-1 lg:grid-cols-3 gap-4 scroll-mt-24"
  >
          {/* ─── Location Info Panel ─────────────────────────────── */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-lg border-2 border-indigo-300 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
            <div
              className="px-5 py-4 text-white"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-indigo-100 uppercase tracking-wider font-bold">
                    Selected Location
                  </p>
                  <h3 className="text-lg font-bold mt-0.5">{selectedLoc.name}</h3>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <MapPin className="w-5 h-5" strokeWidth={2} />
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">
                  Department
                </p>
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-500" strokeWidth={2} />
                  {selectedLoc.departmentName}
                </p>
              </div>

              {selectedLoc.description && (
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Description
                  </p>
                  <p className="text-sm text-gray-700">{selectedLoc.description}</p>
                </div>
              )}

              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Status Breakdown
                </p>
                <div className="space-y-1.5">
                  {(Object.keys(STATUS_COLORS) as Gauge['status'][]).map((status) => {
                    const count = selectedGauges.filter((g) => g.status === status).length;
                    if (count === 0) return null;
                    const cfg = STATUS_COLORS[status];
                    return (
                      <div
                        key={status}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                          <span className="text-xs font-semibold text-gray-700">{status}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-800">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Total gauges in this location:{' '}
                  <span className="font-bold text-gray-800">{selectedGauges.length}</span>
                </p>
              </div>
            </div>
          </div>

          {/* ─── Gauges in Location Panel ─────────────────────────── */}
         <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border-2 border-indigo-300 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="px-5 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-indigo-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-600" strokeWidth={2} />
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                  Gauges in this Location ({selectedGauges.length})
                </h3>
              </div>

              <div className="relative w-56">
                <Search
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
                  strokeWidth={2}
                />
                <input
                  type="text"
                  placeholder="Search gauges…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            <div className="p-4">
              {selectedGauges.length === 0 ? (
                <div className="py-12 text-center">
                  <GaugeIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" strokeWidth={1.5} />
                  <p className="text-sm text-gray-500 font-semibold">
                    {search ? 'No gauges match your search' : 'No gauges in this location'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                  {selectedGauges.map((g) => {
                    const cfg = STATUS_COLORS[g.status];
                    const dueStatus = getDueStatus(g.nextDueDate);
                    const StatusIcon = cfg.icon;
                    return (
                      <div
                        key={g.id}
                        onClick={() => navigate(`/gauges/${g.id}`)}
                        className="group border border-gray-100 hover:border-indigo-200 rounded-xl p-3 cursor-pointer transition hover:shadow-md bg-white"
                      >
                        {/* Header with status */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-indigo-600 truncate">
                              {g.gaugeCode}
                            </p>
                            <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-indigo-700 transition">
                              {g.name}
                            </p>
                          </div>
                          <span
                            className={`flex items-center gap-1 px-2 py-0.5 ${cfg.bg} ${cfg.text} rounded-full text-[10px] font-bold flex-shrink-0`}
                          >
                            <StatusIcon className="w-2.5 h-2.5" strokeWidth={2.5} />
                            {cfg.label}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                            <GaugeIcon className="w-3 h-3" strokeWidth={2} />
                            <span className="truncate">{g.type}</span>
                            {g.range && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="truncate">{g.range}</span>
                              </>
                            )}
                          </div>

                          {g.nextDueDate && (
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <Calendar className="w-3 h-3 text-gray-400" strokeWidth={2} />
                              <span className="text-gray-600">Due: {g.nextDueDate}</span>
                              {dueStatus && (
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                    dueStatus === 'Overdue'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}
                                >
                                  {dueStatus}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hint when nothing selected */}
      {!selectedLoc && (
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-indigo-600" strokeWidth={2} />
          </div>
          <p className="text-sm text-indigo-700">
            <span className="font-bold">Click any location tile</span> above to see the gauges stored there.
          </p>
        </div>
      )}
    </Layout>
  );
}
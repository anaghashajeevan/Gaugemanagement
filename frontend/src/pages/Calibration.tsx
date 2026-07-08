// src/pages/Calibration.tsx

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import DataTable, { type Column } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import {
  calibrationStorage,
  gaugeStorage,
  standardStorage,
  vendorStorage,
  capaStorage,
  auditStorage,
  type CalibrationRecord,
  type Gauge,
} from '../utils/storage';
import {
  ClipboardCheck,
  Plus,
  Search,
  AlertCircle,
  AlertTriangle,
  FileText,
  Upload,
  ExternalLink,
  X,
} from 'lucide-react';

type TabKey = 'Internal' | 'External';
type ResultFilter = 'all' | 'Pass' | 'Fail';

const emptyInternalForm = {
  gaugeId: '',
  standardId: '',
  readings: '',
  technician: '',
  date: new Date().toISOString().split('T')[0],
};

const emptyExternalForm = {
  gaugeId: '',
  vendorId: '',
  certificateNo: '',
  certificateValidUntil: '',
  technician: '',
  date: new Date().toISOString().split('T')[0],
};

export default function Calibration() {
  const navigate = useNavigate();

  const [records, setRecords] = useState<CalibrationRecord[]>(
    calibrationStorage.getAll()
  );
  const [tab, setTab] = useState<TabKey>('Internal');
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState<ResultFilter>('all');

  // Internal modal
  const [intModalOpen, setIntModalOpen] = useState(false);
  const [intForm, setIntForm] = useState(emptyInternalForm);
  const [intError, setIntError] = useState('');

  // External modal
  const [extModalOpen, setExtModalOpen] = useState(false);
  const [extForm, setExtForm] = useState(emptyExternalForm);
  const [extError, setExtError] = useState('');

  // CAPA prompt
  const [capaPrompt, setCapaPrompt] = useState<CalibrationRecord | null>(null);
  const [capaForm, setCapaForm] = useState({
    rootCause: '',
    correctiveAction: '',
    responsiblePerson: '',
    targetDate: '',
  });

  const gauges = gaugeStorage.getAll();
  const standards = standardStorage.getAll();
  const vendors = vendorStorage.getAll();
  const capas = capaStorage.getAll();

  const capaForRecord = (recordId: string) =>
    capas.find((c) => c.sourceType === 'Calibration' && c.sourceId === recordId);

  const openCapaPrompt = (record: CalibrationRecord) => {
    setCapaForm({
      rootCause: '',
      correctiveAction: '',
      responsiblePerson: '',
      targetDate: '',
    });
    setCapaPrompt(record);
  };

  // ─── Vendors accredited for the selected gauge's type ─────────────
  const selectedExternalGauge = useMemo(
    () => gauges.find((g) => g.id === extForm.gaugeId),
    [gauges, extForm.gaugeId]
  );

  const scopeTypes = (v: (typeof vendors)[number]) =>
    v.scope.split(',').map((s) => s.trim()).filter(Boolean);

  const eligibleVendors = useMemo(() => {
    if (!selectedExternalGauge) return vendors;
    const matches = vendors.filter((v) =>
      scopeTypes(v).includes(selectedExternalGauge.type)
    );
    return matches.length > 0 ? matches : vendors;
  }, [vendors, selectedExternalGauge]);

  const vendorScopeMismatch =
    !!selectedExternalGauge &&
    !vendors.some((v) => scopeTypes(v).includes(selectedExternalGauge.type));

  const reload = () => setRecords(calibrationStorage.getAll());

  const filtered = useMemo(() => {
    let list = records.filter((r) => r.type === tab);
    if (resultFilter !== 'all') {
      list = list.filter((r) => r.result === resultFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) => {
        const gauge = gauges.find((g) => g.id === r.gaugeId);
        return (
          gauge?.gaugeCode.toLowerCase().includes(q) ||
          gauge?.name.toLowerCase().includes(q) ||
          r.technician.toLowerCase().includes(q) ||
          r.certificateNo?.toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [records, tab, resultFilter, search, gauges]);

  const getGaugeLabel = (gaugeId: string) => {
    const g = gauges.find((x) => x.id === gaugeId);
    return g ? `${g.gaugeCode} — ${g.name}` : gaugeId;
  };

  // ─── Internal Calibration Save ────────────────────────────────────
  const saveInternal = () => {
    if (!intForm.gaugeId || !intForm.standardId || !intForm.readings.trim()) {
      setIntError('Gauge, Standard, and Readings are required.');
      return;
    }

    const readings = intForm.readings
      .split(',')
      .map((r) => parseFloat(r.trim()))
      .filter((r) => !isNaN(r));

    if (readings.length === 0) {
      setIntError('Enter valid comma-separated numeric readings.');
      return;
    }

    const gauge = gauges.find((g) => g.id === intForm.gaugeId);
    const avgDeviation =
      readings.reduce((a, b) => a + Math.abs(b), 0) / readings.length;
    const result: 'Pass' | 'Fail' = avgDeviation <= 0.05 ? 'Pass' : 'Fail';

    const nextDueDate = new Date(intForm.date);
    nextDueDate.setMonth(
      nextDueDate.getMonth() + (gauge?.frequencyMonths || 6)
    );

    const newRecord = calibrationStorage.add({
      gaugeId: intForm.gaugeId,
      type: 'Internal',
      standardId: intForm.standardId,
      date: intForm.date,
      readings,
      result,
      technician: intForm.technician || 'System',
      nextDueDate: nextDueDate.toISOString().split('T')[0],
    });

    // Update gauge — quarantine it if the calibration failed
    if (gauge) {
      gaugeStorage.update(gauge.id, {
        lastCalibrationDate: intForm.date,
        nextDueDate: nextDueDate.toISOString().split('T')[0],
        status: result === 'Fail' ? 'Under Review' : 'Available',
      });
    }

    auditStorage.add({
      action: 'CALIBRATE',
      entityType: 'CalibrationRecord',
      entityId: newRecord.id,
      userId: 'current',
      timestamp: new Date().toISOString(),
    });

    reload();
    setIntModalOpen(false);
    setIntForm(emptyInternalForm);
    setIntError('');

    if (result === 'Fail') {
      openCapaPrompt(newRecord);
    }
  };

  // ─── External Calibration Save ────────────────────────────────────
  const saveExternal = () => {
    if (!extForm.gaugeId || !extForm.vendorId || !extForm.certificateNo) {
      setExtError('Gauge, Vendor, and Certificate No. are required.');
      return;
    }

    const gauge = gauges.find((g) => g.id === extForm.gaugeId);

    const nextDueDate = extForm.certificateValidUntil || (() => {
      const d = new Date(extForm.date);
      d.setMonth(d.getMonth() + (gauge?.frequencyMonths || 12));
      return d.toISOString().split('T')[0];
    })();

    const newRecord = calibrationStorage.add({
      gaugeId: extForm.gaugeId,
      type: 'External',
      vendorId: extForm.vendorId,
      date: extForm.date,
      readings: [],
      result: 'Pass',
      certificateNo: extForm.certificateNo,
      certificateValidUntil: extForm.certificateValidUntil,
      technician: extForm.technician || 'Vendor',
      nextDueDate,
    });

    if (gauge) {
      gaugeStorage.update(gauge.id, {
        lastCalibrationDate: extForm.date,
        nextDueDate,
        status: 'Available',
      });
    }

    auditStorage.add({
      action: 'CALIBRATE',
      entityType: 'CalibrationRecord',
      entityId: newRecord.id,
      userId: 'current',
      timestamp: new Date().toISOString(),
    });

    reload();
    setExtModalOpen(false);
    setExtForm(emptyExternalForm);
    setExtError('');
  };

  // ─── Create CAPA from failed calibration ──────────────────────────
  const createCapaFromFail = () => {
    if (!capaPrompt) return;
    if (!capaForm.rootCause || !capaForm.responsiblePerson || !capaForm.targetDate) return;

    capaStorage.add({
      sourceType: 'Calibration',
      sourceId: capaPrompt.id,
      gaugeId: capaPrompt.gaugeId,
      rootCause: capaForm.rootCause,
      correctiveAction: capaForm.correctiveAction,
      responsiblePerson: capaForm.responsiblePerson,
      targetDate: capaForm.targetDate,
      status: 'Open',
    });

    auditStorage.add({
      action: 'CREATE',
      entityType: 'CAPA',
      entityId: capaPrompt.id,
      userId: 'current',
      timestamp: new Date().toISOString(),
    });

    setCapaPrompt(null);
    setCapaForm({ rootCause: '', correctiveAction: '', responsiblePerson: '', targetDate: '' });
    reload();
  };

  // ─── Table Columns ────────────────────────────────────────────────
  const columns: Column<CalibrationRecord>[] = [
    { header: 'Date', accessor: 'date' },
    {
      header: 'Gauge',
      cell: (row) => {
        const g = gauges.find((x) => x.id === row.gaugeId);
        return (
          <div>
            <span className="font-bold text-indigo-600">
              {g?.gaugeCode || '—'}
            </span>
            <p className="text-xs text-gray-400">{g?.name}</p>
          </div>
        );
      },
    },
    ...(tab === 'Internal'
      ? [
          {
            header: 'Standard',
            cell: (row: CalibrationRecord) => {
              const std = standards.find((s) => s.id === row.standardId);
              return <span>{std?.standardCode || '—'}</span>;
            },
          } as Column<CalibrationRecord>,
          {
            header: 'Readings',
            cell: (row: CalibrationRecord) => (
              <span className="text-xs font-mono">
                {row.readings.join(', ')}
              </span>
            ),
          } as Column<CalibrationRecord>,
        ]
      : [
          {
            header: 'Vendor',
            cell: (row: CalibrationRecord) => {
              const v = vendors.find((x) => x.id === row.vendorId);
              return <span>{v?.name || '—'}</span>;
            },
          } as Column<CalibrationRecord>,
          {
            header: 'Certificate',
            cell: (row: CalibrationRecord) => (
              <div>
                <span className="font-medium">{row.certificateNo || '—'}</span>
                {row.certificateValidUntil && (
                  <p className="text-xs text-gray-400">
                    Valid until: {row.certificateValidUntil}
                  </p>
                )}
              </div>
            ),
          } as Column<CalibrationRecord>,
        ]),
    {
      header: 'Result',
      cell: (row) => <StatusBadge status={row.result} />,
    },
    { header: 'Technician', accessor: 'technician' },
    { header: 'Next Due', accessor: 'nextDueDate' },
    {
      header: 'Actions',
      width: '90px',
      align: 'left' as const,
      cell: (row) => {
        if (row.result !== 'Fail') return null;
        const existingCapa = capaForRecord(row.id);
        return existingCapa ? (
          <button
            onClick={() => navigate('/capa')}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400"
            title="View CAPA"
          >
            <ExternalLink className="w-4 h-4" strokeWidth={2} />
          </button>
        ) : (
          <button
            onClick={() => openCapaPrompt(row)}
            className="p-1.5 hover:bg-amber-50 rounded-lg transition text-amber-500"
            title="Create CAPA"
          >
            <AlertTriangle className="w-4 h-4" strokeWidth={2} />
          </button>
        );
      },
    },
  ];

  // ─── Stats ────────────────────────────────────────────────────────
  const tabRecords = records.filter((r) => r.type === tab);
  const passCount = tabRecords.filter((r) => r.result === 'Pass').length;
  const failCount = tabRecords.filter((r) => r.result === 'Fail').length;

  return (
    <Layout pageTitle="Calibration" pageSubtitle="Record and track internal and external gauge calibrations" pageIcon={ClipboardCheck}>
      {/* ─── Tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex gap-1 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100">
          {(['Internal', 'External'] as TabKey[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setResultFilter('all');
              }}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
                tab === t
                  ? 'text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={
                tab === t
                  ? {
                      background:
                        'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                    }
                  : {}
              }
            >
              {t} Calibration
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {resultFilter !== 'all' && (
            <button
              onClick={() => setResultFilter('all')}
              className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold hover:bg-indigo-100 transition"
            >
              {resultFilter}
              <X className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          )}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              strokeWidth={2}
            />
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition w-56"
            />
          </div>

          <button
            onClick={() =>
              tab === 'Internal'
                ? setIntModalOpen(true)
                : setExtModalOpen(true)
            }
            className="flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition text-sm"
            style={{
              background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
            }}
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            New {tab}
          </button>
        </div>
      </div>

      {/* ─── Stats Row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {
            key: 'all' as ResultFilter,
            label: 'Total Records',
            value: tabRecords.length,
            accent: 'from-indigo-500 to-purple-500',
          },
          {
            key: 'Pass' as ResultFilter,
            label: 'Pass',
            value: passCount,
            accent: 'from-emerald-500 to-teal-500',
          },
          {
            key: 'Fail' as ResultFilter,
            label: 'Fail',
            value: failCount,
            accent: 'from-red-500 to-rose-500',
          },
        ].map((s) => {
          const active = resultFilter === s.key;
          return (
            <button
              key={s.label}
              onClick={() => setResultFilter(s.key)}
              className={`w-full text-left bg-white rounded-xl p-4 shadow-sm border relative overflow-hidden transition hover:shadow-md ${
                active
                  ? 'border-indigo-300 ring-2 ring-indigo-100'
                  : 'border-gray-100'
              }`}
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${s.accent}`}
              />
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                {s.label}
              </p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
            </button>
          );
        })}
      </div>

      {/* ─── Table ────────────────────────────────────────────────── */}
      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(row) => row.id}
        emptyTitle={`No ${tab.toLowerCase()} calibration records`}
        emptySubtitle="Records will appear here once calibrations are performed."
        emptyIcon={
          <ClipboardCheck
            className="w-8 h-8 text-gray-300"
            strokeWidth={1.5}
          />
        }
      />

      {/* ─── Internal Calibration Modal ───────────────────────────── */}
      <Modal
        open={intModalOpen}
        onClose={() => {
          setIntModalOpen(false);
          setIntError('');
        }}
        title="New Internal Calibration"
        subtitle="Enter readings to auto-calculate Pass/Fail"
        maxWidth="lg"
        footer={
          <>
            <button
              onClick={() => setIntModalOpen(false)}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm"
            >
              Cancel
            </button>
            <button
              onClick={saveInternal}
              className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm"
              style={{
                background:
                  'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
              }}
            >
              Save Calibration
            </button>
          </>
        }
      >
        {intError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle
              className="w-4 h-4 flex-shrink-0 mt-0.5"
              strokeWidth={2}
            />
            {intError}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">
              Select Gauge <span className="text-red-500">*</span>
            </label>
            <select
              value={intForm.gaugeId}
              onChange={(e) =>
                setIntForm({ ...intForm, gaugeId: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
            >
              <option value="">Select a gauge</option>
              {gauges
                .filter((g) => g.status !== 'Scrapped')
                .map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.gaugeCode} — {g.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">
              Reference Standard <span className="text-red-500">*</span>
            </label>
            <select
              value={intForm.standardId}
              onChange={(e) =>
                setIntForm({ ...intForm, standardId: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
            >
              <option value="">Select a standard</option>
              {standards.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.standardCode} — {s.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">
              Readings (comma-separated deviations){' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              value={intForm.readings}
              onChange={(e) =>
                setIntForm({ ...intForm, readings: e.target.value })
              }
              placeholder="e.g. 0.02, 0.01, 0.03, 0.02, 0.02"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              Pass if average deviation ≤ 0.05 | Fail if &gt; 0.05
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                Technician
              </label>
              <input
                value={intForm.technician}
                onChange={(e) =>
                  setIntForm({ ...intForm, technician: e.target.value })
                }
                placeholder="Name"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={intForm.date}
                onChange={(e) =>
                  setIntForm({ ...intForm, date: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* ─── External Calibration Modal ───────────────────────────── */}
      <Modal
        open={extModalOpen}
        onClose={() => {
          setExtModalOpen(false);
          setExtError('');
        }}
        title="New External Calibration"
        subtitle="Enter certificate details from accredited vendor"
        maxWidth="lg"
        footer={
          <>
            <button
              onClick={() => setExtModalOpen(false)}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm"
            >
              Cancel
            </button>
            <button
              onClick={saveExternal}
              className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm"
              style={{
                background:
                  'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
              }}
            >
              Save Calibration
            </button>
          </>
        }
      >
        {extError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle
              className="w-4 h-4 flex-shrink-0 mt-0.5"
              strokeWidth={2}
            />
            {extError}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">
              Select Gauge <span className="text-red-500">*</span>
            </label>
            <select
              value={extForm.gaugeId}
              onChange={(e) =>
                setExtForm({ ...extForm, gaugeId: e.target.value, vendorId: '' })
              }
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
            >
              <option value="">Select a gauge</option>
              {gauges
                .filter((g) => g.status !== 'Scrapped')
                .map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.gaugeCode} — {g.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">
              Vendor <span className="text-red-500">*</span>
            </label>
            <select
              value={extForm.vendorId}
              onChange={(e) =>
                setExtForm({ ...extForm, vendorId: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
            >
              <option value="">Select a vendor</option>
              {eligibleVendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.accreditationNo})
                </option>
              ))}
            </select>
            {selectedExternalGauge && !vendorScopeMismatch && (
              <p className="text-xs text-emerald-600 mt-1">
                Showing labs accredited for "{selectedExternalGauge.type}".
              </p>
            )}
            {vendorScopeMismatch && (
              <p className="text-xs text-amber-600 mt-1">
                No lab is accredited for "{selectedExternalGauge!.type}" yet — showing all vendors. Add this scope under Outside Labs.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                Certificate No. <span className="text-red-500">*</span>
              </label>
              <input
                value={extForm.certificateNo}
                onChange={(e) =>
                  setExtForm({ ...extForm, certificateNo: e.target.value })
                }
                placeholder="e.g. NABL-1023-C4521"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                Certificate Valid Until
              </label>
              <input
                type="date"
                value={extForm.certificateValidUntil}
                onChange={(e) =>
                  setExtForm({
                    ...extForm,
                    certificateValidUntil: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
              />
            </div>
          </div>

          {/* Upload placeholder */}
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">
              Certificate File (optional)
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-indigo-300 transition cursor-pointer">
              <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-sm text-gray-500">
                Drag & drop or click to upload
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PDF, JPG, PNG (Demo — no actual upload)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                Technician / Contact
              </label>
              <input
                value={extForm.technician}
                onChange={(e) =>
                  setExtForm({ ...extForm, technician: e.target.value })
                }
                placeholder="Vendor representative"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={extForm.date}
                onChange={(e) =>
                  setExtForm({ ...extForm, date: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* ─── CAPA Prompt Modal ────────────────────────────────────── */}
      <Modal
        open={!!capaPrompt}
        onClose={() => setCapaPrompt(null)}
        title="Calibration Failed — Create CAPA"
        subtitle={`Gauge: ${
          capaPrompt ? getGaugeLabel(capaPrompt.gaugeId) : ''
        }`}
        maxWidth="lg"
        footer={
          <>
            <button
              onClick={() => setCapaPrompt(null)}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm"
            >
              Skip
            </button>
            <button
              onClick={createCapaFromFail}
              className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm bg-amber-500 hover:bg-amber-600"
            >
              <AlertTriangle
                className="w-4 h-4 inline mr-1"
                strokeWidth={2}
              />
              Create CAPA
            </button>
          </>
        }
      >
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
          <AlertTriangle
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            strokeWidth={2}
          />
          <span>
            This calibration <strong>FAILED</strong>. It is recommended to create a
            CAPA (Corrective & Preventive Action).
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">
              Root Cause <span className="text-red-500">*</span>
            </label>
            <textarea
              value={capaForm.rootCause}
              onChange={(e) =>
                setCapaForm({ ...capaForm, rootCause: e.target.value })
              }
              rows={2}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm resize-none"
              placeholder="Describe the root cause…"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">
              Corrective Action
            </label>
            <textarea
              value={capaForm.correctiveAction}
              onChange={(e) =>
                setCapaForm({
                  ...capaForm,
                  correctiveAction: e.target.value,
                })
              }
              rows={2}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm resize-none"
              placeholder="What corrective action will be taken?"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                Responsible Person <span className="text-red-500">*</span>
              </label>
              <input
                value={capaForm.responsiblePerson}
                onChange={(e) =>
                  setCapaForm({
                    ...capaForm,
                    responsiblePerson: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                Target Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={capaForm.targetDate}
                onChange={(e) =>
                  setCapaForm({ ...capaForm, targetDate: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
              />
            </div>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
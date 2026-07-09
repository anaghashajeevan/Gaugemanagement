// // src/pages/Calibration.tsx

// import { useState, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Layout from '../components/Layout';
// import DataTable, { type Column } from '../components/DataTable';
// import StatusBadge from '../components/StatusBadge';
// import Modal from '../components/Modal';
// import {
//   calibrationStorage,
//   gaugeStorage,
//   standardStorage,
//   vendorStorage,
//   capaStorage,
//   auditStorage,
//   type CalibrationRecord,
//   type Gauge,
// } from '../utils/storage';
// import {
//   ClipboardCheck,
//   Plus,
//   Search,
//   AlertCircle,
//   AlertTriangle,
//   FileText,
//   Upload,
// } from 'lucide-react';

// type TabKey = 'Internal' | 'External';

// const emptyInternalForm = {
//   gaugeId: '',
//   standardId: '',
//   readings: '',
//   technician: '',
//   date: new Date().toISOString().split('T')[0],
// };

// const emptyExternalForm = {
//   gaugeId: '',
//   vendorId: '',
//   certificateNo: '',
//   certificateValidUntil: '',
//   certificateFile: '',        // ← Add this (base64 data)
//   certificateFileName: '', 
//   technician: '',
//   date: new Date().toISOString().split('T')[0],
// };

// export default function Calibration() {
//   const navigate = useNavigate();

//   const [records, setRecords] = useState<CalibrationRecord[]>(
//     calibrationStorage.getAll()
//   );
//   const [tab, setTab] = useState<TabKey>('Internal');
//   const [search, setSearch] = useState('');

//   // Internal modal
//   const [intModalOpen, setIntModalOpen] = useState(false);
//   const [intForm, setIntForm] = useState(emptyInternalForm);
//   const [intError, setIntError] = useState('');

//   // External modal
//   const [extModalOpen, setExtModalOpen] = useState(false);
//   const [extForm, setExtForm] = useState(emptyExternalForm);
//   const [extError, setExtError] = useState('');

//   // CAPA prompt
//   const [capaPrompt, setCapaPrompt] = useState<CalibrationRecord | null>(null);
//   const [capaForm, setCapaForm] = useState({
//     rootCause: '',
//     correctiveAction: '',
//     responsiblePerson: '',
//     targetDate: '',
//   });

//   const gauges = gaugeStorage.getAll();
//   const standards = standardStorage.getAll();
//   const vendors = vendorStorage.getAll();

//   // ─── Vendors accredited for the selected gauge's type ─────────────
//   const selectedExternalGauge = useMemo(
//     () => gauges.find((g) => g.id === extForm.gaugeId),
//     [gauges, extForm.gaugeId]
//   );

//   const scopeTypes = (v: (typeof vendors)[number]) =>
//     v.scope.split(',').map((s) => s.trim()).filter(Boolean);

//   const eligibleVendors = useMemo(() => {
//     if (!selectedExternalGauge) return vendors;
//     const matches = vendors.filter((v) =>
//       scopeTypes(v).includes(selectedExternalGauge.type)
//     );
//     return matches.length > 0 ? matches : vendors;
//   }, [vendors, selectedExternalGauge]);

//   const vendorScopeMismatch =
//     !!selectedExternalGauge &&
//     !vendors.some((v) => scopeTypes(v).includes(selectedExternalGauge.type));

//   const reload = () => setRecords(calibrationStorage.getAll());

//   const filtered = useMemo(() => {
//     let list = records.filter((r) => r.type === tab);
//     if (search) {
//       const q = search.toLowerCase();
//       list = list.filter((r) => {
//         const gauge = gauges.find((g) => g.id === r.gaugeId);
//         return (
//           gauge?.gaugeCode.toLowerCase().includes(q) ||
//           gauge?.name.toLowerCase().includes(q) ||
//           r.technician.toLowerCase().includes(q) ||
//           r.certificateNo?.toLowerCase().includes(q)
//         );
//       });
//     }
//     return list;
//   }, [records, tab, search, gauges]);

//   const getGaugeLabel = (gaugeId: string) => {
//     const g = gauges.find((x) => x.id === gaugeId);
//     return g ? `${g.gaugeCode} — ${g.name}` : gaugeId;
//   };

//   // ─── Internal Calibration Save ────────────────────────────────────
//   const saveInternal = () => {
//     if (!intForm.gaugeId || !intForm.standardId || !intForm.readings.trim()) {
//       setIntError('Gauge, Standard, and Readings are required.');
//       return;
//     }

//     const readings = intForm.readings
//       .split(',')
//       .map((r) => parseFloat(r.trim()))
//       .filter((r) => !isNaN(r));

//     if (readings.length === 0) {
//       setIntError('Enter valid comma-separated numeric readings.');
//       return;
//     }

//     const gauge = gauges.find((g) => g.id === intForm.gaugeId);
//     const avgDeviation =
//       readings.reduce((a, b) => a + Math.abs(b), 0) / readings.length;
//     const result: 'Pass' | 'Fail' = avgDeviation <= 0.05 ? 'Pass' : 'Fail';

//     const nextDueDate = new Date(intForm.date);
//     nextDueDate.setMonth(
//       nextDueDate.getMonth() + (gauge?.frequencyMonths || 6)
//     );

//     const newRecord = calibrationStorage.add({
//       gaugeId: intForm.gaugeId,
//       type: 'Internal',
//       standardId: intForm.standardId,
//       date: intForm.date,
//       readings,
//       result,
//       technician: intForm.technician || 'System',
//       nextDueDate: nextDueDate.toISOString().split('T')[0],
//     });

//     // Update gauge
//     if (gauge) {
//       gaugeStorage.update(gauge.id, {
//         lastCalibrationDate: intForm.date,
//         nextDueDate: nextDueDate.toISOString().split('T')[0],
//         status: 'Available',
//       });
//     }

//     auditStorage.add({
//       action: 'CALIBRATE',
//       entityType: 'CalibrationRecord',
//       entityId: newRecord.id,
//       userId: 'current',
//       timestamp: new Date().toISOString(),
//     });

//     reload();
//     setIntModalOpen(false);
//     setIntForm(emptyInternalForm);
//     setIntError('');

//     if (result === 'Fail') {
//       setCapaPrompt(newRecord);
//     }
//   };

//   // ─── External Calibration Save ────────────────────────────────────
//   const saveExternal = () => {
//     if (!extForm.gaugeId || !extForm.vendorId || !extForm.certificateNo) {
//       setExtError('Gauge, Vendor, and Certificate No. are required.');
//       return;
//     }

//     const gauge = gauges.find((g) => g.id === extForm.gaugeId);

//     const nextDueDate = extForm.certificateValidUntil || (() => {
//       const d = new Date(extForm.date);
//       d.setMonth(d.getMonth() + (gauge?.frequencyMonths || 12));
//       return d.toISOString().split('T')[0];
//     })();

//     const newRecord = calibrationStorage.add({
//       gaugeId: extForm.gaugeId,
//       type: 'External',
//       vendorId: extForm.vendorId,
//       date: extForm.date,
//       readings: [],
//       result: 'Pass',
//       certificateNo: extForm.certificateNo,
//       certificateValidUntil: extForm.certificateValidUntil,
//       certificateFile: extForm.certificateFile,       // ← Add
//       certificateFileName: extForm.certificateFileName, // ← Add
//       technician: extForm.technician || 'Vendor',
//       nextDueDate,
//     });

//     if (gauge) {
//       gaugeStorage.update(gauge.id, {
//         lastCalibrationDate: extForm.date,
//         nextDueDate,
//         status: 'Available',
//       });
//     }

//     auditStorage.add({
//       action: 'CALIBRATE',
//       entityType: 'CalibrationRecord',
//       entityId: newRecord.id,
//       userId: 'current',
//       timestamp: new Date().toISOString(),
//     });

//     reload();
//     setExtModalOpen(false);
//     setExtForm(emptyExternalForm);
//     setExtError('');
//   };
//    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//   const file = e.target.files?.[0];
//   if (!file) return;

//   // Limit to 5MB for localStorage
//   if (file.size > 5 * 1024 * 1024) {
//     setExtError('File size must be less than 5MB');
//     return;
//   }

//   const reader = new FileReader();
//   reader.onload = (event) => {
//     setExtForm({
//       ...extForm,
//       certificateFile: event.target?.result as string,
//       certificateFileName: file.name,
//     });
//   };
//   reader.readAsDataURL(file);
// };
//   // ─── Create CAPA from failed calibration ──────────────────────────
//   const createCapaFromFail = () => {
//     if (!capaPrompt) return;
//     if (!capaForm.rootCause || !capaForm.responsiblePerson || !capaForm.targetDate) return;

//     capaStorage.add({
//       sourceType: 'Calibration',
//       sourceId: capaPrompt.id,
//       gaugeId: capaPrompt.gaugeId,
//       rootCause: capaForm.rootCause,
//       correctiveAction: capaForm.correctiveAction,
//       responsiblePerson: capaForm.responsiblePerson,
//       targetDate: capaForm.targetDate,
//       status: 'Open',
//     });

//     auditStorage.add({
//       action: 'CREATE',
//       entityType: 'CAPA',
//       entityId: capaPrompt.id,
//       userId: 'current',
//       timestamp: new Date().toISOString(),
//     });

//     setCapaPrompt(null);
//     setCapaForm({ rootCause: '', correctiveAction: '', responsiblePerson: '', targetDate: '' });
//   };

//   // ─── Table Columns ────────────────────────────────────────────────
//   const columns: Column<CalibrationRecord>[] = [
//     { header: 'Date', accessor: 'date' },
//     {
//       header: 'Gauge',
//       cell: (row) => {
//         const g = gauges.find((x) => x.id === row.gaugeId);
//         return (
//           <div>
//             <span className="font-bold text-indigo-600">
//               {g?.gaugeCode || '—'}
//             </span>
//             <p className="text-xs text-gray-400">{g?.name}</p>
//           </div>
//         );
//       },
//     },
//     ...(tab === 'Internal'
//       ? [
//           {
//             header: 'Standard',
//             cell: (row: CalibrationRecord) => {
//               const std = standards.find((s) => s.id === row.standardId);
//               return <span>{std?.standardCode || '—'}</span>;
//             },
//           } as Column<CalibrationRecord>,
//           {
//             header: 'Readings',
//             cell: (row: CalibrationRecord) => (
//               <span className="text-xs font-mono">
//                 {row.readings.join(', ')}
//               </span>
//             ),
//           } as Column<CalibrationRecord>,
//         ]
//       : [
//           {
//             header: 'Vendor',
//             cell: (row: CalibrationRecord) => {
//               const v = vendors.find((x) => x.id === row.vendorId);
//               return <span>{v?.name || '—'}</span>;
//             },
//           } as Column<CalibrationRecord>,
//           {
//             header: 'Certificate',
//             cell: (row: CalibrationRecord) => (
//               <div>
//                 <span className="font-medium">{row.certificateNo || '—'}</span>
//                 {row.certificateValidUntil && (
//                   <p className="text-xs text-gray-400">
//                     Valid until: {row.certificateValidUntil}
//                   </p>
//                 )}
//               </div>
//             ),
//           } as Column<CalibrationRecord>,
//         ]),
//     {
//       header: 'Result',
//       cell: (row) => <StatusBadge status={row.result} />,
//     },
//     { header: 'Technician', accessor: 'technician' },
//     { header: 'Next Due', accessor: 'nextDueDate' },
//   ];

//   // ─── Stats ────────────────────────────────────────────────────────
//   const tabRecords = records.filter((r) => r.type === tab);
//   const passCount = tabRecords.filter((r) => r.result === 'Pass').length;
//   const failCount = tabRecords.filter((r) => r.result === 'Fail').length;

//   return (
//     <Layout pageTitle="Calibration">
//       {/* ─── Tabs ─────────────────────────────────────────────────── */}
//       <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
//         <div className="flex gap-1 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100">
//           {(['Internal', 'External'] as TabKey[]).map((t) => (
//             <button
//               key={t}
//               onClick={() => setTab(t)}
//               className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
//                 tab === t
//                   ? 'text-white shadow-md'
//                   : 'text-gray-600 hover:bg-gray-50'
//               }`}
//               style={
//                 tab === t
//                   ? {
//                       background:
//                         'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
//                     }
//                   : {}
//               }
//             >
//               {t} Calibration
//             </button>
//           ))}
//         </div>

//         <div className="flex items-center gap-3">
//           <div className="relative">
//             <Search
//               className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
//               strokeWidth={2}
//             />
//             <input
//               type="text"
//               placeholder="Search…"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition w-56"
//             />
//           </div>

//           <button
//             onClick={() =>
//               tab === 'Internal'
//                 ? setIntModalOpen(true)
//                 : setExtModalOpen(true)
//             }
//             className="flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition text-sm"
//             style={{
//               background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
//             }}
//           >
//             <Plus className="w-4 h-4" strokeWidth={2.5} />
//             New {tab}
//           </button>
//         </div>
//       </div>

//       {/* ─── Stats Row ────────────────────────────────────────────── */}
//       <div className="grid grid-cols-3 gap-4 mb-6">
//         {[
//           {
//             label: 'Total Records',
//             value: tabRecords.length,
//             accent: 'from-indigo-500 to-purple-500',
//           },
//           {
//             label: 'Pass',
//             value: passCount,
//             accent: 'from-emerald-500 to-teal-500',
//           },
//           {
//             label: 'Fail',
//             value: failCount,
//             accent: 'from-red-500 to-rose-500',
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
//         emptyTitle={`No ${tab.toLowerCase()} calibration records`}
//         emptySubtitle="Records will appear here once calibrations are performed."
//         emptyIcon={
//           <ClipboardCheck
//             className="w-8 h-8 text-gray-300"
//             strokeWidth={1.5}
//           />
//         }
//       />

//       {/* ─── Internal Calibration Modal ───────────────────────────── */}
//       <Modal
//         open={intModalOpen}
//         onClose={() => {
//           setIntModalOpen(false);
//           setIntError('');
//         }}
//         title="New Internal Calibration"
//         subtitle="Enter readings to auto-calculate Pass/Fail"
//         maxWidth="lg"
//         footer={
//           <>
//             <button
//               onClick={() => setIntModalOpen(false)}
//               className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={saveInternal}
//               className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm"
//               style={{
//                 background:
//                   'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
//               }}
//             >
//               Save Calibration
//             </button>
//           </>
//         }
//       >
//         {intError && (
//           <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
//             <AlertCircle
//               className="w-4 h-4 flex-shrink-0 mt-0.5"
//               strokeWidth={2}
//             />
//             {intError}
//           </div>
//         )}

//         <div className="space-y-4">
//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Select Gauge <span className="text-red-500">*</span>
//             </label>
//             <select
//               value={intForm.gaugeId}
//               onChange={(e) =>
//                 setIntForm({ ...intForm, gaugeId: e.target.value })
//               }
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
//             >
//               <option value="">Select a gauge</option>
//               {gauges
//                 .filter((g) => g.status !== 'Scrapped')
//                 .map((g) => (
//                   <option key={g.id} value={g.id}>
//                     {g.gaugeCode} — {g.name}
//                   </option>
//                 ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Reference Standard <span className="text-red-500">*</span>
//             </label>
//             <select
//               value={intForm.standardId}
//               onChange={(e) =>
//                 setIntForm({ ...intForm, standardId: e.target.value })
//               }
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
//             >
//               <option value="">Select a standard</option>
//               {standards.map((s) => (
//                 <option key={s.id} value={s.id}>
//                   {s.standardCode} — {s.description}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Readings (comma-separated deviations){' '}
//               <span className="text-red-500">*</span>
//             </label>
//             <input
//               value={intForm.readings}
//               onChange={(e) =>
//                 setIntForm({ ...intForm, readings: e.target.value })
//               }
//               placeholder="e.g. 0.02, 0.01, 0.03, 0.02, 0.02"
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//             />
//             <p className="text-xs text-gray-400 mt-1">
//               Pass if average deviation ≤ 0.05 | Fail if &gt; 0.05
//             </p>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//                 Technician
//               </label>
//               <input
//                 value={intForm.technician}
//                 onChange={(e) =>
//                   setIntForm({ ...intForm, technician: e.target.value })
//                 }
//                 placeholder="Name"
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//                 Date
//               </label>
//               <input
//                 type="date"
//                 value={intForm.date}
//                 onChange={(e) =>
//                   setIntForm({ ...intForm, date: e.target.value })
//                 }
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//               />
//             </div>
//           </div>
//         </div>
//       </Modal>

//       {/* ─── External Calibration Modal ───────────────────────────── */}
//       <Modal
//         open={extModalOpen}
//         onClose={() => {
//           setExtModalOpen(false);
//           setExtError('');
//         }}
//         title="New External Calibration"
//         subtitle="Enter certificate details from accredited vendor"
//         maxWidth="lg"
//         footer={
//           <>
//             <button
//               onClick={() => setExtModalOpen(false)}
//               className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={saveExternal}
//               className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm"
//               style={{
//                 background:
//                   'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
//               }}
//             >
//               Save Calibration
//             </button>
//           </>
//         }
//       >
//         {extError && (
//           <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
//             <AlertCircle
//               className="w-4 h-4 flex-shrink-0 mt-0.5"
//               strokeWidth={2}
//             />
//             {extError}
//           </div>
//         )}

//         <div className="space-y-4">
//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Select Gauge <span className="text-red-500">*</span>
//             </label>
//             <select
//               value={extForm.gaugeId}
//               onChange={(e) =>
//                 setExtForm({ ...extForm, gaugeId: e.target.value, vendorId: '' })
//               }
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
//             >
//               <option value="">Select a gauge</option>
//               {gauges
//                 .filter((g) => g.status !== 'Scrapped')
//                 .map((g) => (
//                   <option key={g.id} value={g.id}>
//                     {g.gaugeCode} — {g.name}
//                   </option>
//                 ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Vendor <span className="text-red-500">*</span>
//             </label>
//             <select
//               value={extForm.vendorId}
//               onChange={(e) =>
//                 setExtForm({ ...extForm, vendorId: e.target.value })
//               }
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
//             >
//               <option value="">Select a vendor</option>
//               {eligibleVendors.map((v) => (
//                 <option key={v.id} value={v.id}>
//                   {v.name} ({v.accreditationNo})
//                 </option>
//               ))}
//             </select>
//             {selectedExternalGauge && !vendorScopeMismatch && (
//               <p className="text-xs text-emerald-600 mt-1">
//                 Showing labs accredited for "{selectedExternalGauge.type}".
//               </p>
//             )}
//             {vendorScopeMismatch && (
//               <p className="text-xs text-amber-600 mt-1">
//                 No lab is accredited for "{selectedExternalGauge!.type}" yet — showing all vendors. Add this scope under Outside Labs.
//               </p>
//             )}
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//                 Certificate No. <span className="text-red-500">*</span>
//               </label>
//               <input
//                 value={extForm.certificateNo}
//                 onChange={(e) =>
//                   setExtForm({ ...extForm, certificateNo: e.target.value })
//                 }
//                 placeholder="e.g. NABL-1023-C4521"
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//                 Certificate Valid Until
//               </label>
//               <input
//                 type="date"
//                 value={extForm.certificateValidUntil}
//                 onChange={(e) =>
//                   setExtForm({
//                     ...extForm,
//                     certificateValidUntil: e.target.value,
//                   })
//                 }
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//               />
//             </div>
//           </div>

//           {/* Upload placeholder */}
//           <div>
//   <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//     Certificate File (optional, max 5MB)
//   </label>

//   {extForm.certificateFileName ? (
//     // Show uploaded file
//     <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
//       <div className="flex items-center gap-2 min-w-0">
//         <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" strokeWidth={2} />
//         <div className="min-w-0">
//           <p className="text-sm font-semibold text-emerald-800 truncate">
//             {extForm.certificateFileName}
//           </p>
//           <p className="text-xs text-emerald-600">Ready to save</p>
//         </div>
//       </div>
//       <button
//         onClick={() => setExtForm({ ...extForm, certificateFile: '', certificateFileName: '' })}
//         className="text-red-500 hover:text-red-700 text-xs font-semibold ml-3"
//       >
//         Remove
//       </button>
//     </div>
//   ) : (
//     // Show upload area
//     <label className="block border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-indigo-300 transition cursor-pointer">
//       <input
//         type="file"
//         accept=".pdf,.jpg,.jpeg,.png"
//         onChange={handleFileUpload}
//         className="hidden"
//       />
//       <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" strokeWidth={1.5} />
//       <p className="text-sm text-gray-500">Click to upload certificate</p>
//       <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (max 5MB)</p>
//     </label>
//   )}
// </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//                 Technician / Contact
//               </label>
//               <input
//                 value={extForm.technician}
//                 onChange={(e) =>
//                   setExtForm({ ...extForm, technician: e.target.value })
//                 }
//                 placeholder="Vendor representative"
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//                 Date
//               </label>
//               <input
//                 type="date"
//                 value={extForm.date}
//                 onChange={(e) =>
//                   setExtForm({ ...extForm, date: e.target.value })
//                 }
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//               />
//             </div>
//           </div>
//         </div>
//       </Modal>

//       {/* ─── CAPA Prompt Modal ────────────────────────────────────── */}
//       <Modal
//         open={!!capaPrompt}
//         onClose={() => setCapaPrompt(null)}
//         title="Calibration Failed — Create CAPA"
//         subtitle={`Gauge: ${
//           capaPrompt ? getGaugeLabel(capaPrompt.gaugeId) : ''
//         }`}
//         maxWidth="lg"
//         footer={
//           <>
//             <button
//               onClick={() => setCapaPrompt(null)}
//               className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm"
//             >
//               Skip
//             </button>
//             <button
//               onClick={createCapaFromFail}
//               className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm bg-amber-500 hover:bg-amber-600"
//             >
//               <AlertTriangle
//                 className="w-4 h-4 inline mr-1"
//                 strokeWidth={2}
//               />
//               Create CAPA
//             </button>
//           </>
//         }
//       >
//         <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
//           <AlertTriangle
//             className="w-5 h-5 flex-shrink-0 mt-0.5"
//             strokeWidth={2}
//           />
//           This calibration <strong>FAILED</strong>. It is recommended to create a
//           CAPA (Corrective & Preventive Action).
//         </div>

//         <div className="space-y-4">
//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Root Cause <span className="text-red-500">*</span>
//             </label>
//             <textarea
//               value={capaForm.rootCause}
//               onChange={(e) =>
//                 setCapaForm({ ...capaForm, rootCause: e.target.value })
//               }
//               rows={2}
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm resize-none"
//               placeholder="Describe the root cause…"
//             />
//           </div>
//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Corrective Action
//             </label>
//             <textarea
//               value={capaForm.correctiveAction}
//               onChange={(e) =>
//                 setCapaForm({
//                   ...capaForm,
//                   correctiveAction: e.target.value,
//                 })
//               }
//               rows={2}
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm resize-none"
//               placeholder="What corrective action will be taken?"
//             />
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//                 Responsible Person <span className="text-red-500">*</span>
//               </label>
//               <input
//                 value={capaForm.responsiblePerson}
//                 onChange={(e) =>
//                   setCapaForm({
//                     ...capaForm,
//                     responsiblePerson: e.target.value,
//                   })
//                 }
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//                 Target Date <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="date"
//                 value={capaForm.targetDate}
//                 onChange={(e) =>
//                   setCapaForm({ ...capaForm, targetDate: e.target.value })
//                 }
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//               />
//             </div>
//           </div>
//         </div>
//       </Modal>
//     </Layout>
//   );
// }


// src/pages/Calibration.tsx

// import { useState, useMemo, type ChangeEvent } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Layout from '../components/Layout';
// import DataTable, { type Column } from '../components/DataTable';
// import StatusBadge from '../components/StatusBadge';
// import Modal from '../components/Modal';
// import {
//   calibrationStorage,
//   gaugeStorage,
//   standardStorage,
//   vendorStorage,
//   capaStorage,
//   auditStorage,
//   type CalibrationRecord,
// } from '../utils/storage';
// import {
//   ClipboardCheck,
//   Plus,
//   Search,
//   AlertCircle,
//   AlertTriangle,
//   FileText,
//   Upload,
//   ExternalLink,
//   X,
//   Download,
// } from 'lucide-react';

// type TabKey = 'Internal' | 'External';
// type ResultFilter = 'all' | 'Pass' | 'Fail';

// const emptyInternalForm = {
//   gaugeId: '',
//   standardId: '',
//   readings: '',
//   technician: '',
//   date: new Date().toISOString().split('T')[0],
// };

// const emptyExternalForm = {
//   gaugeId: '',
//   vendorId: '',
//   certificateNo: '',
//   certificateValidUntil: '',
//   certificateFile: '',           // ← NEW
//   certificateFileName: '',       // ← NEW
//   technician: '',
//   date: new Date().toISOString().split('T')[0],
// };

// export default function Calibration() {
//   const navigate = useNavigate();

//   const [records, setRecords] = useState<CalibrationRecord[]>(
//     calibrationStorage.getAll()
//   );
//   const [tab, setTab] = useState<TabKey>('Internal');
//   const [search, setSearch] = useState('');
//   const [resultFilter, setResultFilter] = useState<ResultFilter>('all');

//   const [intModalOpen, setIntModalOpen] = useState(false);
//   const [intForm, setIntForm] = useState(emptyInternalForm);
//   const [intError, setIntError] = useState('');

//   const [extModalOpen, setExtModalOpen] = useState(false);
//   const [extForm, setExtForm] = useState(emptyExternalForm);
//   const [extError, setExtError] = useState('');

//   const [capaPrompt, setCapaPrompt] = useState<CalibrationRecord | null>(null);
//   const [capaForm, setCapaForm] = useState({
//     rootCause: '',
//     correctiveAction: '',
//     responsiblePerson: '',
//     targetDate: '',
//   });

//   const gauges = gaugeStorage.getAll();
//   const standards = standardStorage.getAll();
//   const vendors = vendorStorage.getAll();
//   const capas = capaStorage.getAll();

//   const capaForRecord = (recordId: string) =>
//     capas.find((c) => c.sourceType === 'Calibration' && c.sourceId === recordId);

//   const openCapaPrompt = (record: CalibrationRecord) => {
//     setCapaForm({
//       rootCause: '',
//       correctiveAction: '',
//       responsiblePerson: '',
//       targetDate: '',
//     });
//     setCapaPrompt(record);
//   };

//   // ─── Vendors accredited for the selected gauge's type ─────────────
//   const selectedExternalGauge = useMemo(
//     () => gauges.find((g) => g.id === extForm.gaugeId),
//     [gauges, extForm.gaugeId]
//   );

//   const scopeTypes = (v: (typeof vendors)[number]) =>
//     v.scope.split(',').map((s) => s.trim()).filter(Boolean);

//   const eligibleVendors = useMemo(() => {
//     if (!selectedExternalGauge) return vendors;
//     const matches = vendors.filter((v) =>
//       scopeTypes(v).includes(selectedExternalGauge.type)
//     );
//     return matches.length > 0 ? matches : vendors;
//   }, [vendors, selectedExternalGauge]);

//   const vendorScopeMismatch =
//     !!selectedExternalGauge &&
//     !vendors.some((v) => scopeTypes(v).includes(selectedExternalGauge.type));

//   const reload = () => setRecords(calibrationStorage.getAll());

//   const filtered = useMemo(() => {
//     let list = records.filter((r) => r.type === tab);
//     if (resultFilter !== 'all') {
//       list = list.filter((r) => r.result === resultFilter);
//     }
//     if (search) {
//       const q = search.toLowerCase();
//       list = list.filter((r) => {
//         const gauge = gauges.find((g) => g.id === r.gaugeId);
//         return (
//           gauge?.gaugeCode.toLowerCase().includes(q) ||
//           gauge?.name.toLowerCase().includes(q) ||
//           r.technician.toLowerCase().includes(q) ||
//           r.certificateNo?.toLowerCase().includes(q)
//         );
//       });
//     }
//     return list;
//   }, [records, tab, resultFilter, search, gauges]);

//   const getGaugeLabel = (gaugeId: string) => {
//     const g = gauges.find((x) => x.id === gaugeId);
//     return g ? `${g.gaugeCode} — ${g.name}` : gaugeId;
//   };

//   // ─── File Upload Handler ──────────────────────────────────────────
//   const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     // Validate file size (max 5MB)
//     if (file.size > 5 * 1024 * 1024) {
//       setExtError('File size must be less than 5MB.');
//       return;
//     }

//     // Validate file type
//     const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
//     if (!allowedTypes.includes(file.type)) {
//       setExtError('Only PDF, JPG, or PNG files are allowed.');
//       return;
//     }

//     setExtError('');
//     const reader = new FileReader();
//     reader.onload = (event) => {
//       setExtForm((prev) => ({
//         ...prev,
//         certificateFile: event.target?.result as string,
//         certificateFileName: file.name,
//       }));
//     };
//     reader.onerror = () => {
//       setExtError('Failed to read file.');
//     };
//     reader.readAsDataURL(file);
//   };

//   const removeUploadedFile = () => {
//     setExtForm({
//       ...extForm,
//       certificateFile: '',
//       certificateFileName: '',
//     });
//   };

//   // ─── Internal Calibration Save ────────────────────────────────────
//   const saveInternal = () => {
//     if (!intForm.gaugeId || !intForm.standardId || !intForm.readings.trim()) {
//       setIntError('Gauge, Standard, and Readings are required.');
//       return;
//     }

//     const readings = intForm.readings
//       .split(',')
//       .map((r) => parseFloat(r.trim()))
//       .filter((r) => !isNaN(r));

//     if (readings.length === 0) {
//       setIntError('Enter valid comma-separated numeric readings.');
//       return;
//     }

//     const gauge = gauges.find((g) => g.id === intForm.gaugeId);
//     const avgDeviation =
//       readings.reduce((a, b) => a + Math.abs(b), 0) / readings.length;
//     const result: 'Pass' | 'Fail' = avgDeviation <= 0.05 ? 'Pass' : 'Fail';

//     const nextDueDate = new Date(intForm.date);
//     nextDueDate.setMonth(nextDueDate.getMonth() + (gauge?.frequencyMonths || 6));

//     const newRecord = calibrationStorage.add({
//       gaugeId: intForm.gaugeId,
//       type: 'Internal',
//       standardId: intForm.standardId,
//       date: intForm.date,
//       readings,
//       result,
//       technician: intForm.technician || 'System',
//       nextDueDate: nextDueDate.toISOString().split('T')[0],
//     });

//     // Update gauge — quarantine it if the calibration failed
//     if (gauge) {
//       gaugeStorage.update(gauge.id, {
//         lastCalibrationDate: intForm.date,
//         nextDueDate: nextDueDate.toISOString().split('T')[0],
//         status: result === 'Fail' ? 'Under Review' : 'Available',
//       });
//     }

//     auditStorage.add({
//       action: 'CALIBRATE',
//       entityType: 'CalibrationRecord',
//       entityId: newRecord.id,
//       userId: 'current',
//       timestamp: new Date().toISOString(),
//     });

//     reload();
//     setIntModalOpen(false);
//     setIntForm(emptyInternalForm);
//     setIntError('');

//     if (result === 'Fail') {
//       openCapaPrompt(newRecord);
//     }
//   };

//   // ─── External Calibration Save ────────────────────────────────────
//   const saveExternal = () => {
//     if (!extForm.gaugeId || !extForm.vendorId || !extForm.certificateNo) {
//       setExtError('Gauge, Vendor, and Certificate No. are required.');
//       return;
//     }

//     const gauge = gauges.find((g) => g.id === extForm.gaugeId);

//     const nextDueDate =
//       extForm.certificateValidUntil ||
//       (() => {
//         const d = new Date(extForm.date);
//         d.setMonth(d.getMonth() + (gauge?.frequencyMonths || 12));
//         return d.toISOString().split('T')[0];
//       })();

//     const newRecord = calibrationStorage.add({
//       gaugeId: extForm.gaugeId,
//       type: 'External',
//       vendorId: extForm.vendorId,
//       date: extForm.date,
//       readings: [],
//       result: 'Pass',
//       certificateNo: extForm.certificateNo,
//       certificateValidUntil: extForm.certificateValidUntil,
//       certificateFile: extForm.certificateFile,           // ← NEW
//       certificateFileName: extForm.certificateFileName,   // ← NEW
//       technician: extForm.technician || 'Vendor',
//       nextDueDate,
//     });

//     if (gauge) {
//       gaugeStorage.update(gauge.id, {
//         lastCalibrationDate: extForm.date,
//         nextDueDate,
//         status: 'Available',
//       });
//     }

//     auditStorage.add({
//       action: 'CALIBRATE',
//       entityType: 'CalibrationRecord',
//       entityId: newRecord.id,
//       userId: 'current',
//       timestamp: new Date().toISOString(),
//     });

//     reload();
//     setExtModalOpen(false);
//     setExtForm(emptyExternalForm);
//     setExtError('');
//   };

//   // ─── Create CAPA from failed calibration ──────────────────────────
//   const createCapaFromFail = () => {
//     if (!capaPrompt) return;
//     if (!capaForm.rootCause || !capaForm.responsiblePerson || !capaForm.targetDate)
//       return;

//     capaStorage.add({
//       sourceType: 'Calibration',
//       sourceId: capaPrompt.id,
//       gaugeId: capaPrompt.gaugeId,
//       rootCause: capaForm.rootCause,
//       correctiveAction: capaForm.correctiveAction,
//       responsiblePerson: capaForm.responsiblePerson,
//       targetDate: capaForm.targetDate,
//       status: 'Open',
//     });

//     auditStorage.add({
//       action: 'CREATE',
//       entityType: 'CAPA',
//       entityId: capaPrompt.id,
//       userId: 'current',
//       timestamp: new Date().toISOString(),
//     });

//     setCapaPrompt(null);
//     setCapaForm({ rootCause: '', correctiveAction: '', responsiblePerson: '', targetDate: '' });
//     reload();
//   };

//   // ─── Certificate download handler ─────────────────────────────────
//   const downloadCertificate = (record: CalibrationRecord) => {
//     if (!record.certificateFile || !record.certificateFileName) return;
//     const link = document.createElement('a');
//     link.href = record.certificateFile;
//     link.download = record.certificateFileName;
//     link.click();
//   };

//   // ─── Table Columns ────────────────────────────────────────────────
//   const columns: Column<CalibrationRecord>[] = [
//     { header: 'Date', accessor: 'date' },
//     {
//       header: 'Gauge',
//       cell: (row) => {
//         const g = gauges.find((x) => x.id === row.gaugeId);
//         return (
//           <div>
//             <span className="font-bold text-indigo-600">{g?.gaugeCode || '—'}</span>
//             <p className="text-xs text-gray-400">{g?.name}</p>
//           </div>
//         );
//       },
//     },
//     ...(tab === 'Internal'
//       ? [
//           {
//             header: 'Standard',
//             cell: (row: CalibrationRecord) => {
//               const std = standards.find((s) => s.id === row.standardId);
//               return <span>{std?.standardCode || '—'}</span>;
//             },
//           } as Column<CalibrationRecord>,
//           {
//             header: 'Readings',
//             cell: (row: CalibrationRecord) => (
//               <span className="text-xs font-mono">{row.readings.join(', ')}</span>
//             ),
//           } as Column<CalibrationRecord>,
//         ]
//       : [
//           {
//             header: 'Vendor',
//             cell: (row: CalibrationRecord) => {
//               const v = vendors.find((x) => x.id === row.vendorId);
//               return <span>{v?.name || '—'}</span>;
//             },
//           } as Column<CalibrationRecord>,
//           {
//             // ═══════════════════════════════════════════════════════════
//             // ← UPDATED "Certificate" column with Download button
//             // ═══════════════════════════════════════════════════════════
//             header: 'Certificate',
//             cell: (row: CalibrationRecord) => (
//               <div>
//                 <div className="flex items-center gap-2">
//                   <span className="font-medium">{row.certificateNo || '—'}</span>
//                   {row.certificateFile && (
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         downloadCertificate(row);
//                       }}
//                       className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold inline-flex items-center gap-1 hover:bg-indigo-50 px-2 py-0.5 rounded transition"
//                       title={`Download ${row.certificateFileName}`}
//                     >
//                       <Download className="w-3 h-3" strokeWidth={2} />
//                       Download
//                     </button>
//                   )}
//                 </div>
//                 {row.certificateValidUntil && (
//                   <p className="text-xs text-gray-400 mt-0.5">
//                     Valid until: {row.certificateValidUntil}
//                   </p>
//                 )}
//                 {row.certificateFileName && (
//                   <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
//                     <FileText className="w-2.5 h-2.5" strokeWidth={2} />
//                     {row.certificateFileName}
//                   </p>
//                 )}
//               </div>
//             ),
//           } as Column<CalibrationRecord>,
//         ]),
//     {
//       header: 'Result',
//       cell: (row) => <StatusBadge status={row.result} />,
//     },
//     { header: 'Technician', accessor: 'technician' },
//     { header: 'Next Due', accessor: 'nextDueDate' },
//     {
//       header: 'Actions',
//       width: '90px',
//       align: 'left' as const,
//       cell: (row) => {
//         if (row.result !== 'Fail') return null;
//         const existingCapa = capaForRecord(row.id);
//         return existingCapa ? (
//           <button
//             onClick={() => navigate('/capa')}
//             className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400"
//             title="View CAPA"
//           >
//             <ExternalLink className="w-4 h-4" strokeWidth={2} />
//           </button>
//         ) : (
//           <button
//             onClick={() => openCapaPrompt(row)}
//             className="p-1.5 hover:bg-amber-50 rounded-lg transition text-amber-500"
//             title="Create CAPA"
//           >
//             <AlertTriangle className="w-4 h-4" strokeWidth={2} />
//           </button>
//         );
//       },
//     },
//   ];

//   // ─── Stats ────────────────────────────────────────────────────────
//   const tabRecords = records.filter((r) => r.type === tab);
//   const passCount = tabRecords.filter((r) => r.result === 'Pass').length;
//   const failCount = tabRecords.filter((r) => r.result === 'Fail').length;

//   return (
//     <Layout pageTitle="Calibration" pageSubtitle="Record and track internal and external gauge calibrations" pageIcon={ClipboardCheck}>
//       {/* ─── Tabs ─────────────────────────────────────────────────── */}
//       <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
//         <div className="flex gap-1 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100">
//           {(['Internal', 'External'] as TabKey[]).map((t) => (
//             <button
//               key={t}
//               onClick={() => {
//                 setTab(t);
//                 setResultFilter('all');
//               }}
//               className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
//                 tab === t ? 'text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
//               }`}
//               style={
//                 tab === t
//                   ? { background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }
//                   : {}
//               }
//             >
//               {t} Calibration
//             </button>
//           ))}
//         </div>

//         <div className="flex items-center gap-3">
//           {resultFilter !== 'all' && (
//             <button
//               onClick={() => setResultFilter('all')}
//               className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold hover:bg-indigo-100 transition"
//             >
//               {resultFilter}
//               <X className="w-3.5 h-3.5" strokeWidth={2.5} />
//             </button>
//           )}
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
//             <input
//               type="text"
//               placeholder="Search…"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition w-56"
//             />
//           </div>

//           <button
//             onClick={() =>
//               tab === 'Internal' ? setIntModalOpen(true) : setExtModalOpen(true)
//             }
//             className="flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition text-sm"
//             style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }}
//           >
//             <Plus className="w-4 h-4" strokeWidth={2.5} />
//             New {tab}
//           </button>
//         </div>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-3 gap-4 mb-6">
//         {[
//           {
//             key: 'all' as ResultFilter,
//             label: 'Total Records',
//             value: tabRecords.length,
//             accent: 'from-indigo-500 to-purple-500',
//           },
//           {
//             key: 'Pass' as ResultFilter,
//             label: 'Pass',
//             value: passCount,
//             accent: 'from-emerald-500 to-teal-500',
//           },
//           {
//             key: 'Fail' as ResultFilter,
//             label: 'Fail',
//             value: failCount,
//             accent: 'from-red-500 to-rose-500',
//           },
//         ].map((s) => {
//           const active = resultFilter === s.key;
//           return (
//             <button
//               key={s.label}
//               onClick={() => setResultFilter(s.key)}
//               className={`w-full text-left bg-white rounded-xl p-4 shadow-sm border relative overflow-hidden transition hover:shadow-md ${
//                 active
//                   ? 'border-indigo-300 ring-2 ring-indigo-100'
//                   : 'border-gray-100'
//               }`}
//             >
//               <div
//                 className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${s.accent}`}
//               />
//               <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
//                 {s.label}
//               </p>
//               <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
//             </button>
//           );
//         })}
//       </div>

//       {/* Table */}
//       <DataTable
//         columns={columns}
//         data={filtered}
//         keyExtractor={(row) => row.id}
//         emptyTitle={`No ${tab.toLowerCase()} calibration records`}
//         emptySubtitle="Records will appear here once calibrations are performed."
//         emptyIcon={<ClipboardCheck className="w-8 h-8 text-gray-300" strokeWidth={1.5} />}
//       />

//       {/* Internal Calibration Modal — unchanged */}
//       <Modal
//         open={intModalOpen}
//         onClose={() => { setIntModalOpen(false); setIntError(''); }}
//         title="New Internal Calibration"
//         subtitle="Enter readings to auto-calculate Pass/Fail"
//         maxWidth="lg"
//         footer={
//           <>
//             <button onClick={() => setIntModalOpen(false)} className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm">
//               Cancel
//             </button>
//             <button onClick={saveInternal} className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm"
//               style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }}>
//               Save Calibration
//             </button>
//           </>
//         }
//       >
//         {intError && (
//           <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
//             <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />{intError}
//           </div>
//         )}
//         <div className="space-y-4">
//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">Select Gauge <span className="text-red-500">*</span></label>
//             <select value={intForm.gaugeId} onChange={(e) => setIntForm({ ...intForm, gaugeId: e.target.value })}
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer">
//               <option value="">Select a gauge</option>
//               {gauges.filter((g) => g.status !== 'Scrapped').map((g) => (
//                 <option key={g.id} value={g.id}>{g.gaugeCode} — {g.name}</option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">Reference Standard <span className="text-red-500">*</span></label>
//             <select value={intForm.standardId} onChange={(e) => setIntForm({ ...intForm, standardId: e.target.value })}
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer">
//               <option value="">Select a standard</option>
//               {standards.map((s) => (
//                 <option key={s.id} value={s.id}>{s.standardCode} — {s.description}</option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">Readings (comma-separated deviations) <span className="text-red-500">*</span></label>
//             <input value={intForm.readings} onChange={(e) => setIntForm({ ...intForm, readings: e.target.value })}
//               placeholder="e.g. 0.02, 0.01, 0.03, 0.02, 0.02"
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm" />
//             <p className="text-xs text-gray-400 mt-1">Pass if average deviation ≤ 0.05 | Fail if &gt; 0.05</p>
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs font-semibold text-gray-800 mb-1.5">Technician</label>
//               <input value={intForm.technician} onChange={(e) => setIntForm({ ...intForm, technician: e.target.value })}
//                 placeholder="Name"
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm" />
//             </div>
//             <div>
//               <label className="block text-xs font-semibold text-gray-800 mb-1.5">Date</label>
//               <input type="date" value={intForm.date} onChange={(e) => setIntForm({ ...intForm, date: e.target.value })}
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm" />
//             </div>
//           </div>
//         </div>
//       </Modal>

//       {/* External Calibration Modal — WITH FILE UPLOAD */}
//       <Modal
//         open={extModalOpen}
//         onClose={() => { setExtModalOpen(false); setExtError(''); }}
//         title="New External Calibration"
//         subtitle="Enter certificate details from accredited vendor"
//         maxWidth="lg"
//         footer={
//           <>
//             <button onClick={() => setExtModalOpen(false)} className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm">
//               Cancel
//             </button>
//             <button onClick={saveExternal} className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm"
//               style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }}>
//               Save Calibration
//             </button>
//           </>
//         }
//       >
//         {extError && (
//           <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
//             <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />{extError}
//           </div>
//         )}

//         <div className="space-y-4">
//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">Select Gauge <span className="text-red-500">*</span></label>
//             <select value={extForm.gaugeId}
//               onChange={(e) => setExtForm({ ...extForm, gaugeId: e.target.value, vendorId: '' })}
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer">
//               <option value="">Select a gauge</option>
//               {gauges.filter((g) => g.status !== 'Scrapped').map((g) => (
//                 <option key={g.id} value={g.id}>{g.gaugeCode} — {g.name}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">Vendor <span className="text-red-500">*</span></label>
//             <select value={extForm.vendorId} onChange={(e) => setExtForm({ ...extForm, vendorId: e.target.value })}
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer">
//               <option value="">Select a vendor</option>
//               {eligibleVendors.map((v) => (
//                 <option key={v.id} value={v.id}>{v.name} ({v.accreditationNo})</option>
//               ))}
//             </select>
//             {selectedExternalGauge && !vendorScopeMismatch && (
//               <p className="text-xs text-emerald-600 mt-1">
//                 Showing labs accredited for "{selectedExternalGauge.type}".
//               </p>
//             )}
//             {vendorScopeMismatch && (
//               <p className="text-xs text-amber-600 mt-1">
//                 No lab is accredited for "{selectedExternalGauge!.type}" yet — showing all vendors.
//               </p>
//             )}
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs font-semibold text-gray-800 mb-1.5">Certificate No. <span className="text-red-500">*</span></label>
//               <input value={extForm.certificateNo} onChange={(e) => setExtForm({ ...extForm, certificateNo: e.target.value })}
//                 placeholder="e.g. NABL-1023-C4521"
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm" />
//             </div>
//             <div>
//               <label className="block text-xs font-semibold text-gray-800 mb-1.5">Certificate Valid Until</label>
//               <input type="date" value={extForm.certificateValidUntil}
//                 onChange={(e) => setExtForm({ ...extForm, certificateValidUntil: e.target.value })}
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm" />
//             </div>
//           </div>

//           {/* ═══════════════════════════════════════════════════════════ */}
//           {/* WORKING FILE UPLOAD                                          */}
//           {/* ═══════════════════════════════════════════════════════════ */}
//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Certificate File (optional, max 5MB)
//             </label>

//             {extForm.certificateFileName ? (
//               <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
//                 <div className="flex items-center gap-2 min-w-0">
//                   <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                     <FileText className="w-4 h-4 text-emerald-600" strokeWidth={2} />
//                   </div>
//                   <div className="min-w-0">
//                     <p className="text-sm font-semibold text-emerald-800 truncate">
//                       {extForm.certificateFileName}
//                     </p>
//                     <p className="text-xs text-emerald-600">Ready to save with calibration</p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={removeUploadedFile}
//                   className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition flex-shrink-0 ml-3"
//                   title="Remove file"
//                 >
//                   <X className="w-4 h-4" strokeWidth={2} />
//                 </button>
//               </div>
//             ) : (
//               <label className="block border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition cursor-pointer">
//                 <input
//                   type="file"
//                   accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/*"
//                   onChange={handleFileUpload}
//                   className="hidden"
//                 />
//                 <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" strokeWidth={1.5} />
//                 <p className="text-sm text-gray-500">
//                   <span className="text-indigo-600 font-semibold">Click to upload</span> certificate
//                 </p>
//                 <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (max 5MB)</p>
//               </label>
//             )}
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs font-semibold text-gray-800 mb-1.5">Technician / Contact</label>
//               <input value={extForm.technician} onChange={(e) => setExtForm({ ...extForm, technician: e.target.value })}
//                 placeholder="Vendor representative"
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm" />
//             </div>
//             <div>
//               <label className="block text-xs font-semibold text-gray-800 mb-1.5">Date</label>
//               <input type="date" value={extForm.date} onChange={(e) => setExtForm({ ...extForm, date: e.target.value })}
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm" />
//             </div>
//           </div>
//         </div>
//       </Modal>

//       {/* CAPA Prompt Modal — unchanged */}
//       <Modal
//         open={!!capaPrompt}
//         onClose={() => setCapaPrompt(null)}
//         title="Calibration Failed — Create CAPA"
//         subtitle={`Gauge: ${capaPrompt ? getGaugeLabel(capaPrompt.gaugeId) : ''}`}
//         maxWidth="lg"
//         footer={
//           <>
//             <button onClick={() => setCapaPrompt(null)} className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm">
//               Skip
//             </button>
//             <button onClick={createCapaFromFail}
//               className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm bg-amber-500 hover:bg-amber-600">
//               <AlertTriangle className="w-4 h-4 inline mr-1" strokeWidth={2} />
//               Create CAPA
//             </button>
//           </>
//         }
//       >
//         <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
//           <AlertTriangle
//             className="w-5 h-5 flex-shrink-0 mt-0.5"
//             strokeWidth={2}
//           />
//           <span>
//             This calibration <strong>FAILED</strong>. It is recommended to create a
//             CAPA (Corrective & Preventive Action).
//           </span>
//         </div>
//         <div className="space-y-4">
//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">Root Cause <span className="text-red-500">*</span></label>
//             <textarea value={capaForm.rootCause} onChange={(e) => setCapaForm({ ...capaForm, rootCause: e.target.value })} rows={2}
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm resize-none"
//               placeholder="Describe the root cause…" />
//           </div>
//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">Corrective Action</label>
//             <textarea value={capaForm.correctiveAction} onChange={(e) => setCapaForm({ ...capaForm, correctiveAction: e.target.value })} rows={2}
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm resize-none"
//               placeholder="What corrective action will be taken?" />
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs font-semibold text-gray-800 mb-1.5">Responsible Person <span className="text-red-500">*</span></label>
//               <input value={capaForm.responsiblePerson} onChange={(e) => setCapaForm({ ...capaForm, responsiblePerson: e.target.value })}
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm" />
//             </div>
//             <div>
//               <label className="block text-xs font-semibold text-gray-800 mb-1.5">Target Date <span className="text-red-500">*</span></label>
//               <input type="date" value={capaForm.targetDate} onChange={(e) => setCapaForm({ ...capaForm, targetDate: e.target.value })}
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm" />
//             </div>
//           </div>
//         </div>
//       </Modal>
//     </Layout>
//   );
// }


// src/pages/Calibration.tsx

import { useState, useMemo, useEffect, type ChangeEvent } from 'react';
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
  methodStorage,
  type CalibrationRecord,
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
  Download,
  Send,
  Clock,
  Bell,
  Settings2,
  Target,
  Hash,
  CheckCircle2,
  XCircle,
  Ruler,
  ArrowRight,
} from 'lucide-react';

type TabKey = 'Internal' | 'External';
type ResultFilter = 'all' | 'Pass' | 'Fail';

interface ReadingRow {
  referenceValue: string;
  measuredValue: string;
}

const emptyInternalForm = {
  gaugeId: '',
  standardId: '',
  readingRows: [] as ReadingRow[],
  technician: '',
  date: new Date().toISOString().split('T')[0],
};

const emptyExternalForm = {
  gaugeId: '',
  vendorId: '',
  certificateNo: '',
  certificateValidUntil: '',
  certificateFile: '',
  certificateFileName: '',
  technician: '',
  date: new Date().toISOString().split('T')[0],
};

const PENDING_KEY = 'gm_pending_cal_types';
type PendingMap = Record<string, 'Internal' | 'External'>;

const getPendingTypes = (): PendingMap => {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const setPendingType = (gaugeId: string, type: 'Internal' | 'External') => {
  const map = getPendingTypes();
  map[gaugeId] = type;
  localStorage.setItem(PENDING_KEY, JSON.stringify(map));
};

const clearPendingType = (gaugeId: string) => {
  const map = getPendingTypes();
  delete map[gaugeId];
  localStorage.setItem(PENDING_KEY, JSON.stringify(map));
};

const DEFAULT_READINGS = 5;
const DEFAULT_DEVIATION = 0.05;

function buildDefaultReadingRows(count: number, refValue: number | null): ReadingRow[] {
  return Array.from({ length: count }, () => ({
    referenceValue: refValue !== null ? String(refValue) : '',
    measuredValue: '',
  }));
}

export default function Calibration() {
  const navigate = useNavigate();

  const [records, setRecords] = useState<CalibrationRecord[]>(calibrationStorage.getAll());
  const [allGauges, setAllGauges] = useState(gaugeStorage.getAll());
  const [pendingTypes, setPendingTypes] = useState<PendingMap>(getPendingTypes());
  const [methods, setMethods] = useState(methodStorage.getAll());

  const [tab, setTab] = useState<TabKey>('Internal');
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState<ResultFilter>('all');

  const [pendingDrawerOpen, setPendingDrawerOpen] = useState(false);

  const [intModalOpen, setIntModalOpen] = useState(false);
  const [intForm, setIntForm] = useState(emptyInternalForm);
  const [intError, setIntError] = useState('');

  const [extModalOpen, setExtModalOpen] = useState(false);
  const [extForm, setExtForm] = useState(emptyExternalForm);
  const [extError, setExtError] = useState('');

  const [sendToCalOpen, setSendToCalOpen] = useState(false);
  const [selectedGaugeForCal, setSelectedGaugeForCal] = useState('');
  const [calType, setCalType] = useState<'Internal' | 'External'>('Internal');

  const [capaPrompt, setCapaPrompt] = useState<CalibrationRecord | null>(null);
  const [capaForm, setCapaForm] = useState({
    rootCause: '',
    correctiveAction: '',
    responsiblePerson: '',
    targetDate: '',
  });

  const standards = standardStorage.getAll();
  const vendors = vendorStorage.getAll();
  const capas = capaStorage.getAll();

  const capaForRecord = (recordId: string) =>
    capas.find((c) => c.sourceType === 'Calibration' && c.sourceId === recordId);

  const openCapaPrompt = (record: CalibrationRecord) => {
    setCapaForm({ rootCause: '', correctiveAction: '', responsiblePerson: '', targetDate: '' });
    setCapaPrompt(record);
  };

  const currentMethod = useMemo(() => {
    if (!intForm.gaugeId) return null;
    const gauge = allGauges.find((g) => g.id === intForm.gaugeId);
    if (!gauge) return null;
    return methodStorage.getByGaugeType(gauge.type) || null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intForm.gaugeId, allGauges, methods]);

  const selectedStandard = useMemo(
    () => standards.find((s) => s.id === intForm.standardId),
    [standards, intForm.standardId]
  );

  const requiredReadings = currentMethod?.numberOfReadings ?? DEFAULT_READINGS;
  const deviationLimit = currentMethod?.avgDeviationLimit ?? DEFAULT_DEVIATION;
  const unit = currentMethod?.unit || selectedStandard?.unit || '';

  // Auto-generate reading rows when gauge or standard changes
  useEffect(() => {
    if (!intModalOpen || !intForm.gaugeId) return;

    const refValue = selectedStandard ? selectedStandard.certifiedValue : null;

    const needsReset =
      intForm.readingRows.length !== requiredReadings ||
      intForm.readingRows.every((r) => !r.measuredValue);

    if (needsReset) {
      setIntForm((prev) => ({
        ...prev,
        readingRows: buildDefaultReadingRows(requiredReadings, refValue),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intForm.gaugeId, intForm.standardId, requiredReadings, intModalOpen]);

  const updateReadingRow = (index: number, field: keyof ReadingRow, value: string) => {
    setIntForm((prev) => {
      const rows = [...prev.readingRows];
      rows[index] = { ...rows[index], [field]: value };
      return { ...prev, readingRows: rows };
    });
  };

  const parsedRows = useMemo(() => {
    return intForm.readingRows.map((row) => {
      const ref = parseFloat(row.referenceValue);
      const meas = parseFloat(row.measuredValue);
      const hasBoth = !isNaN(ref) && !isNaN(meas);
      const deviation = hasBoth ? meas - ref : null;
      return { ref, meas, deviation, hasBoth };
    });
  }, [intForm.readingRows]);

  const filledCount = parsedRows.filter((r) => r.hasBoth).length;
  const avgAbsDeviation =
    filledCount > 0
      ? parsedRows.filter((r) => r.deviation !== null)
          .reduce((a, r) => a + Math.abs(r.deviation!), 0) / filledCount
      : 0;
  const willPass = avgAbsDeviation <= deviationLimit;

  const selectedExternalGauge = useMemo(
    () => allGauges.find((g) => g.id === extForm.gaugeId),
    [allGauges, extForm.gaugeId]
  );

  const scopeTypes = (v: (typeof vendors)[number]) =>
    v.scope.split(',').map((s) => s.trim()).filter(Boolean);

  const eligibleVendors = useMemo(() => {
    if (!selectedExternalGauge) return vendors;
    const matches = vendors.filter((v) => scopeTypes(v).includes(selectedExternalGauge.type));
    return matches.length > 0 ? matches : vendors;
  }, [vendors, selectedExternalGauge]);

  const vendorScopeMismatch =
    !!selectedExternalGauge &&
    !vendors.some((v) => scopeTypes(v).includes(selectedExternalGauge.type));

  const reload = () => {
    setRecords(calibrationStorage.getAll());
    setAllGauges(gaugeStorage.getAll());
    setPendingTypes(getPendingTypes());
    setMethods(methodStorage.getAll());
  };

  const filtered = useMemo(() => {
    let list = records.filter((r) => r.type === tab);
    if (resultFilter !== 'all') list = list.filter((r) => r.result === resultFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) => {
        const gauge = allGauges.find((g) => g.id === r.gaugeId);
        return (
          gauge?.gaugeCode.toLowerCase().includes(q) ||
          gauge?.name.toLowerCase().includes(q) ||
          r.technician.toLowerCase().includes(q) ||
          r.certificateNo?.toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [records, tab, resultFilter, search, allGauges]);

  const getGaugeLabel = (gaugeId: string) => {
    const g = allGauges.find((x) => x.id === gaugeId);
    return g ? `${g.gaugeCode} — ${g.name}` : gaugeId;
  };

  const sendToCalibration = () => {
    if (!selectedGaugeForCal) return;
    gaugeStorage.update(selectedGaugeForCal, { status: 'Under Calibration' });
    setPendingType(selectedGaugeForCal, calType);
    auditStorage.add({
      action: 'UPDATE', entityType: 'Gauge', entityId: selectedGaugeForCal,
      userId: 'current', timestamp: new Date().toISOString(),
    });
    const gaugeId = selectedGaugeForCal;
    setSendToCalOpen(false);
    setSelectedGaugeForCal('');
    reload();
    if (calType === 'Internal') {
      setIntForm({ ...emptyInternalForm, gaugeId });
      setIntModalOpen(true);
    } else {
      setExtForm({ ...emptyExternalForm, gaugeId });
      setExtModalOpen(true);
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setExtError('File size must be less than 5MB.'); return; }
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) { setExtError('Only PDF, JPG, or PNG files are allowed.'); return; }
    setExtError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      setExtForm((prev) => ({
        ...prev,
        certificateFile: event.target?.result as string,
        certificateFileName: file.name,
      }));
    };
    reader.onerror = () => setExtError('Failed to read file.');
    reader.readAsDataURL(file);
  };

  const removeUploadedFile = () => {
    setExtForm({ ...extForm, certificateFile: '', certificateFileName: '' });
  };

  const saveInternal = () => {
    if (!intForm.gaugeId || !intForm.standardId) {
      setIntError('Gauge and Reference Standard are required.');
      return;
    }

    const gauge = allGauges.find((g) => g.id === intForm.gaugeId);
    const method = gauge ? methodStorage.getByGaugeType(gauge.type) : null;
    const reqReadings = method?.numberOfReadings ?? DEFAULT_READINGS;
    const devLimit = method?.avgDeviationLimit ?? DEFAULT_DEVIATION;

    const incompleteRow = intForm.readingRows.findIndex(
      (r) => !r.referenceValue.trim() || !r.measuredValue.trim()
    );
    if (incompleteRow !== -1) {
      setIntError(
        `❌ Row ${incompleteRow + 1} is incomplete. Please enter both the reference value and the measured value for all ${reqReadings} readings.`
      );
      return;
    }

    const parsedReadings = intForm.readingRows.map((r) => ({
      ref: parseFloat(r.referenceValue),
      meas: parseFloat(r.measuredValue),
    }));

    if (parsedReadings.some((r) => isNaN(r.ref) || isNaN(r.meas))) {
      setIntError('❌ All reference and measured values must be valid numbers.');
      return;
    }

    if (parsedReadings.length !== reqReadings) {
      setIntError(
        `❌ Wrong number of readings! This ${gauge?.type || 'gauge'} requires exactly ${reqReadings} reading${reqReadings === 1 ? '' : 's'}.`
      );
      return;
    }

    const deviations = parsedReadings.map((r) =>
  Number((r.meas - r.ref).toFixed(4))
);
    const avgDev = deviations.reduce((a, b) => a + Math.abs(b), 0) / deviations.length;
    const result: 'Pass' | 'Fail' = avgDev <= devLimit ? 'Pass' : 'Fail';

    const nextDueDate = new Date(intForm.date);
    nextDueDate.setMonth(nextDueDate.getMonth() + (gauge?.frequencyMonths || 6));

    const newRecord = calibrationStorage.add({
      gaugeId: intForm.gaugeId,
      type: 'Internal',
      standardId: intForm.standardId,
      date: intForm.date,
      readings: deviations,
      result,
      technician: intForm.technician || 'System',
      nextDueDate: nextDueDate.toISOString().split('T')[0],
    });

    if (gauge) {
      gaugeStorage.update(gauge.id, {
        lastCalibrationDate: intForm.date,
        nextDueDate: nextDueDate.toISOString().split('T')[0],
        status: result === 'Fail' ? 'Under Review' : 'Available',
      });
      clearPendingType(gauge.id);
    }

    auditStorage.add({
      action: 'CALIBRATE', entityType: 'CalibrationRecord', entityId: newRecord.id,
      userId: 'current', timestamp: new Date().toISOString(),
    });

    reload();
    setIntModalOpen(false);
    setIntForm(emptyInternalForm);
    setIntError('');

    if (result === 'Fail') openCapaPrompt(newRecord);
  };

  const saveExternal = () => {
    if (!extForm.gaugeId || !extForm.vendorId || !extForm.certificateNo) {
      setExtError('Gauge, Vendor, and Certificate No. are required.');
      return;
    }

    const gauge = allGauges.find((g) => g.id === extForm.gaugeId);

    const nextDueDate =
      extForm.certificateValidUntil ||
      (() => {
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
      certificateFile: extForm.certificateFile,
      certificateFileName: extForm.certificateFileName,
      technician: extForm.technician || 'Vendor',
      nextDueDate,
    });

    if (gauge) {
      gaugeStorage.update(gauge.id, {
        lastCalibrationDate: extForm.date,
        nextDueDate,
        status: 'Available',
      });
      clearPendingType(gauge.id);
    }

    auditStorage.add({
      action: 'CALIBRATE', entityType: 'CalibrationRecord', entityId: newRecord.id,
      userId: 'current', timestamp: new Date().toISOString(),
    });

    reload();
    setExtModalOpen(false);
    setExtForm(emptyExternalForm);
    setExtError('');
  };

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
      action: 'CREATE', entityType: 'CAPA', entityId: capaPrompt.id,
      userId: 'current', timestamp: new Date().toISOString(),
    });

    setCapaPrompt(null);
    setCapaForm({ rootCause: '', correctiveAction: '', responsiblePerson: '', targetDate: '' });
    reload();
  };

  const downloadCertificate = (record: CalibrationRecord) => {
    if (!record.certificateFile || !record.certificateFileName) return;
    const link = document.createElement('a');
    link.href = record.certificateFile;
    link.download = record.certificateFileName;
    link.click();
  };

  // Helper to format standard for display
  const formatStandardValue = (s: { certifiedValue: number; unit: string; uncertainty: number }) =>
    `${s.certifiedValue} ${s.unit} ± ${s.uncertainty} ${s.unit}`;

  const columns: Column<CalibrationRecord>[] = [
    { header: 'Date', accessor: 'date' },
    {
      header: 'Gauge',
      cell: (row) => {
        const g = allGauges.find((x) => x.id === row.gaugeId);
        return (
          <div>
            <span className="font-bold text-indigo-600">{g?.gaugeCode || '—'}</span>
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
              return (
                <div>
                  <span className="font-medium">{std?.standardCode || '—'}</span>
                  {std && (
                    <p className="text-xs text-gray-400 font-mono">
                      {std.certifiedValue} {std.unit}
                    </p>
                  )}
                </div>
              );
            },
          } as Column<CalibrationRecord>,
          {
  header: 'Deviations',
  cell: (row: CalibrationRecord) => (
    <span className="text-xs font-mono text-gray-700">
      {row.readings
        .map((r) => {
          const rounded = Number(r.toFixed(4));
          return rounded >= 0 ? `+${rounded}` : String(rounded);
        })
        .join(', ')}
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
                <div className="flex items-center gap-2">
                  <span className="font-medium">{row.certificateNo || '—'}</span>
                  {row.certificateFile && (
                    <button
                      onClick={(e) => { e.stopPropagation(); downloadCertificate(row); }}
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold inline-flex items-center gap-1 hover:bg-indigo-50 px-2 py-0.5 rounded transition"
                      title={`Download ${row.certificateFileName}`}
                    >
                      <Download className="w-3 h-3" strokeWidth={2} />
                      Download
                    </button>
                  )}
                </div>
                {row.certificateValidUntil && (
                  <p className="text-xs text-gray-400 mt-0.5">Valid until: {row.certificateValidUntil}</p>
                )}
                {row.certificateFileName && (
                  <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                    <FileText className="w-2.5 h-2.5" strokeWidth={2} />
                    {row.certificateFileName}
                  </p>
                )}
              </div>
            ),
          } as Column<CalibrationRecord>,
        ]),
    { header: 'Result', cell: (row) => <StatusBadge status={row.result} /> },
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
          <button onClick={() => navigate('/capa')} className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400" title="View CAPA">
            <ExternalLink className="w-4 h-4" strokeWidth={2} />
          </button>
        ) : (
          <button onClick={() => openCapaPrompt(row)} className="p-1.5 hover:bg-amber-50 rounded-lg transition text-amber-500" title="Create CAPA">
            <AlertTriangle className="w-4 h-4" strokeWidth={2} />
          </button>
        );
      },
    },
  ];

  const tabRecords = records.filter((r) => r.type === tab);
  const passCount = tabRecords.filter((r) => r.result === 'Pass').length;
  const failCount = tabRecords.filter((r) => r.result === 'Fail').length;
  const underCalibrationGauges = allGauges.filter((g) => g.status === 'Under Calibration');
  const pendingCount = underCalibrationGauges.length;

  return (
    <Layout pageTitle="Calibration" pageSubtitle="Record and track internal and external gauge calibrations" pageIcon={ClipboardCheck}>
      {/* Tabs & Actions */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex gap-1 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100">
          {(['Internal', 'External'] as TabKey[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setResultFilter('all'); }}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
                tab === t ? 'text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={tab === t ? { background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' } : {}}
            >
              {t} Calibration
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {resultFilter !== 'all' && (
            <button onClick={() => setResultFilter('all')} className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold hover:bg-indigo-100 transition">
              {resultFilter}
              <X className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition w-56"
            />
          </div>

          <button
            onClick={() => setPendingDrawerOpen(true)}
            className={`relative flex items-center gap-2 px-4 py-2.5 font-semibold rounded-xl transition text-sm border ${
              pendingCount > 0
                ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500 shadow-md'
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
            title={pendingCount > 0 ? `${pendingCount} gauge(s) awaiting result entry` : 'No pending calibrations'}
          >
            <div className="relative">
              <Bell className="w-4 h-4" strokeWidth={2} />
              {pendingCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[9px] font-bold items-center justify-center">
                    {pendingCount}
                  </span>
                </span>
              )}
            </div>
            <span>Pending</span>
          </button>

          <button
            onClick={() => { setCalType(tab); setSelectedGaugeForCal(''); setSendToCalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl transition text-sm border border-blue-200"
          >
            <Send className="w-4 h-4" strokeWidth={2} />
            Send to Calibration
          </button>

          <button
            onClick={() => tab === 'Internal' ? setIntModalOpen(true) : setExtModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition text-sm"
            style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }}
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Record {tab} Result
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { key: 'all' as ResultFilter, label: 'Total Records', value: tabRecords.length, accent: 'from-indigo-500 to-purple-500' },
          { key: 'Pass' as ResultFilter, label: 'Pass', value: passCount, accent: 'from-emerald-500 to-teal-500' },
          { key: 'Fail' as ResultFilter, label: 'Fail', value: failCount, accent: 'from-red-500 to-rose-500' },
        ].map((s) => {
          const active = resultFilter === s.key;
          return (
            <button
              key={s.label}
              onClick={() => setResultFilter(s.key)}
              className={`w-full text-left bg-white rounded-xl p-4 shadow-sm border relative overflow-hidden transition hover:shadow-md ${active ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-gray-100'}`}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${s.accent}`} />
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{s.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
            </button>
          );
        })}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(row) => row.id}
        emptyTitle={`No ${tab.toLowerCase()} calibration records`}
        emptySubtitle="Records will appear here once calibrations are performed."
        emptyIcon={<ClipboardCheck className="w-8 h-8 text-gray-300" strokeWidth={1.5} />}
      />

      {/* Pending Drawer */}
      {pendingDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50 transition-opacity" onClick={() => setPendingDrawerOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="px-5 py-4 text-white flex items-center justify-between flex-shrink-0" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Clock className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Pending Calibrations</h3>
                  <p className="text-xs text-blue-100">
                    {pendingCount} gauge{pendingCount === 1 ? '' : 's'} awaiting result entry
                  </p>
                </div>
              </div>
              <button onClick={() => setPendingDrawerOpen(false)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {pendingCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                    <ClipboardCheck className="w-8 h-8 text-emerald-500" strokeWidth={2} />
                  </div>
                  <p className="text-gray-800 font-semibold">All caught up!</p>
                  <p className="text-sm text-gray-500 mt-1">No gauges are currently under calibration.</p>
                  <button
                    onClick={() => { setPendingDrawerOpen(false); setCalType(tab); setSelectedGaugeForCal(''); setSendToCalOpen(true); }}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg transition text-sm"
                  >
                    <Send className="w-4 h-4" strokeWidth={2} />
                    Send a gauge to calibration
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {underCalibrationGauges.map((g) => {
                    const pendingType = pendingTypes[g.id] || 'Internal';
                    return (
                      <div key={g.id} className="bg-white border border-gray-200 hover:border-blue-300 rounded-xl p-4 transition hover:shadow-md">
                        <div className="flex items-start justify-between mb-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-indigo-600 text-sm">{g.gaugeCode}</p>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${pendingType === 'Internal' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'}`}>
                                {pendingType}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-gray-800 truncate">{g.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{g.type} · {g.department} · {g.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {pendingType === 'Internal' ? (
                            <button
                              onClick={() => { setPendingDrawerOpen(false); setIntForm({ ...emptyInternalForm, gaugeId: g.id }); setIntModalOpen(true); }}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition"
                            >
                              <ClipboardCheck className="w-3.5 h-3.5" strokeWidth={2} />
                              Record Internal Result
                            </button>
                          ) : (
                            <button
                              onClick={() => { setPendingDrawerOpen(false); setExtForm({ ...emptyExternalForm, gaugeId: g.id }); setExtModalOpen(true); }}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold rounded-lg transition"
                            >
                              <ClipboardCheck className="w-3.5 h-3.5" strokeWidth={2} />
                              Record External Result
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {pendingCount > 0 && (
              <div className="border-t border-gray-100 p-4 flex-shrink-0 bg-gray-50">
                <p className="text-xs text-gray-500 text-center">Click "Record Result" to finish the calibration and update the gauge status.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Send to Calibration Modal */}
      <Modal
        open={sendToCalOpen}
        onClose={() => { setSendToCalOpen(false); setSelectedGaugeForCal(''); }}
        title="Send Gauge to Calibration"
        subtitle="Mark a gauge as being calibrated"
        maxWidth="md"
        footer={
          <>
            <button onClick={() => { setSendToCalOpen(false); setSelectedGaugeForCal(''); }} className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm">
              Cancel
            </button>
            <button
              onClick={sendToCalibration}
              disabled={!selectedGaugeForCal}
              className="flex items-center gap-2 px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)' }}
            >
              <Send className="w-4 h-4" strokeWidth={2} />
              Send to Calibration
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
            <span>This will mark the gauge as <strong>Under Calibration</strong> (blue on Heat Map). After you record the result, its status will update to <strong>Available</strong> (Pass) or <strong>Under Review</strong> (Fail).</span>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">Calibration Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(['Internal', 'External'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setCalType(t)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition border ${calType === t ? 'bg-indigo-500 text-white border-indigo-500 shadow-md' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">After clicking "Send to Calibration", the {calType.toLowerCase()} result-entry form will open automatically.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">Select Available Gauge <span className="text-red-500">*</span></label>
            <select
              value={selectedGaugeForCal}
              onChange={(e) => setSelectedGaugeForCal(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
            >
              <option value="">Select an available gauge…</option>
              {allGauges.filter((g) => g.status === 'Available').map((g) => (
                <option key={g.id} value={g.id}>{g.gaugeCode} — {g.name} ({g.department})</option>
              ))}
            </select>
            {allGauges.filter((g) => g.status === 'Available').length === 0 && (
              <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" strokeWidth={2} />
                No available gauges. Only "Available" gauges can be sent to calibration.
              </p>
            )}
          </div>
        </div>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* Internal Calibration Modal — MODERATE size (2xl)            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Modal
        open={intModalOpen}
        onClose={() => { setIntModalOpen(false); setIntError(''); }}
        title="Record Internal Calibration Result"
        subtitle="Enter what the gauge shows — deviations & result are auto-calculated"
        maxWidth="2xl"
        footer={
          <>
            <button onClick={() => setIntModalOpen(false)} className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm">
              Cancel
            </button>
            <button onClick={saveInternal} className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm" style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }}>
              Save Calibration
            </button>
          </>
        }
      >
        {intError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />{intError}
          </div>
        )}

        <div className="space-y-4">
          {/* Gauge + Standard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                Select Gauge <span className="text-red-500">*</span>
              </label>
              <select
                value={intForm.gaugeId}
                onChange={(e) => setIntForm({ ...intForm, gaugeId: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
              >
                <option value="">Select a gauge</option>
                {allGauges.filter((g) => g.status !== 'Scrapped').map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.gaugeCode} — {g.name} {g.status === 'Under Calibration' ? '🔵' : ''}
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
                onChange={(e) => setIntForm({ ...intForm, standardId: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
              >
                <option value="">Select a standard</option>
                {standards.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.standardCode} — {s.certifiedValue} {s.unit} ± {s.uncertainty}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Standard info banner */}
          {selectedStandard && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Ruler className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2} />
                <span className="text-gray-700">
                  <strong>{selectedStandard.standardCode}:</strong> {selectedStandard.description}
                </span>
              </div>
              <div className="flex items-center gap-3 text-emerald-700">
                <span className="font-mono font-bold">
                  {selectedStandard.certifiedValue} {selectedStandard.unit} ± {selectedStandard.uncertainty}
                </span>
                <span className="text-gray-500">Valid until {selectedStandard.validUntil}</span>
              </div>
            </div>
          )}

          {/* Method Info Box */}
          {intForm.gaugeId && (
            <div className={`p-2.5 rounded-lg border ${currentMethod ? 'bg-indigo-50 border-indigo-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className="flex items-start gap-2">
                <Settings2 className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${currentMethod ? 'text-indigo-600' : 'text-amber-600'}`} strokeWidth={2} />
                <div className="flex-1 min-w-0 text-xs">
                  {currentMethod ? (
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-indigo-800">Method: {currentMethod.gaugeType}</span>
                      <span className="flex items-center gap-1 text-gray-700">
                        <Hash className="w-3 h-3 text-blue-500" strokeWidth={2} />
                        <strong className="text-blue-600">{currentMethod.numberOfReadings}</strong> readings
                      </span>
                      <span className="flex items-center gap-1 text-gray-700">
                        <Target className="w-3 h-3 text-emerald-500" strokeWidth={2} />
                        avg ≤ <strong className="font-mono text-emerald-600">{currentMethod.avgDeviationLimit} {currentMethod.unit}</strong>
                      </span>
                    </div>
                  ) : (
                    <span className="text-amber-800">
                      <strong>No method set</strong> — using defaults ({DEFAULT_READINGS} readings, ≤ {DEFAULT_DEVIATION}). Configure in <strong>Administration → Calibration Methods</strong>.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Readings Table */}
          {intForm.gaugeId && intForm.readingRows.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5" strokeWidth={2} />
                  <span className="text-xs font-bold uppercase tracking-wider">Readings</span>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                  {filledCount} / {requiredReadings}
                </span>
              </div>

              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-2 py-1.5 text-left text-[9px] font-bold uppercase tracking-wider text-gray-500 w-10">#</th>
                    <th className="px-2 py-1.5 text-left text-[9px] font-bold uppercase tracking-wider text-gray-500">
                      Reference {unit && `(${unit})`}
                    </th>
                    <th className="px-1 py-1.5 w-6"></th>
                    <th className="px-2 py-1.5 text-left text-[9px] font-bold uppercase tracking-wider text-gray-500">
                      Gauge Shows {unit && `(${unit})`}
                    </th>
                    <th className="px-2 py-1.5 text-right text-[9px] font-bold uppercase tracking-wider text-gray-500 w-24">
                      Deviation
                    </th>
                    <th className="px-2 py-1.5 text-center text-[9px] font-bold uppercase tracking-wider text-gray-500 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {intForm.readingRows.map((row, idx) => {
                    const parsed = parsedRows[idx];
                    const dev = parsed?.deviation;
                    const absDev = dev !== null && dev !== undefined ? Math.abs(dev) : null;
                    const rowPass = absDev !== null && absDev <= deviationLimit;

                    return (
                      <tr key={idx} className="hover:bg-gray-50/50 transition">
                        <td className="px-2 py-1.5 text-xs font-bold text-gray-400">{idx + 1}</td>
                        <td className="px-2 py-1.5">
                          <input
                            type="number"
                            step="any"
                            value={row.referenceValue}
                            onChange={(e) => updateReadingRow(idx, 'referenceValue', e.target.value)}
                            placeholder="25.000"
                            className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-xs font-mono"
                          />
                        </td>
                        <td className="px-1 py-1.5 text-center">
                          <ArrowRight className="w-3 h-3 text-gray-300 mx-auto" strokeWidth={2} />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="number"
                            step="any"
                            value={row.measuredValue}
                            onChange={(e) => updateReadingRow(idx, 'measuredValue', e.target.value)}
                            placeholder="what gauge reads"
                            className="w-full px-2 py-1 bg-indigo-50 border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-xs font-mono font-semibold"
                          />
                        </td>
                        <td className="px-2 py-1.5 text-right">
                          {dev !== null && dev !== undefined ? (
                            <span className={`font-mono font-bold text-xs ${rowPass ? 'text-emerald-600' : 'text-red-600'}`}>
                              {dev >= 0 ? '+' : ''}{dev.toFixed(4)}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          {absDev !== null ? (
                            rowPass ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mx-auto" strokeWidth={2.5} />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-red-500 mx-auto" strokeWidth={2.5} />
                            )
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Summary Footer */}
              <div className={`px-3 py-2.5 border-t-2 ${
                filledCount === requiredReadings
                  ? willPass
                    ? 'bg-emerald-50 border-emerald-300'
                    : 'bg-red-50 border-red-300'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3 text-xs">
                    <div>
                      <span className="text-[9px] text-gray-500 uppercase tracking-wider font-bold block">
                        Avg |Deviation|
                      </span>
                      <span className="font-mono font-bold text-sm text-gray-800">
                        {filledCount > 0 ? avgAbsDeviation.toFixed(4) : '—'} {unit}
                      </span>
                    </div>
                    <div className="text-gray-400">vs</div>
                    <div>
                      <span className="text-[9px] text-gray-500 uppercase tracking-wider font-bold block">
                        Limit
                      </span>
                      <span className="font-mono font-bold text-sm text-gray-800">
                        {deviationLimit} {unit}
                      </span>
                    </div>
                  </div>

                  {filledCount === requiredReadings ? (
                    willPass ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg font-bold shadow-sm text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                        WILL PASS
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-lg font-bold shadow-sm text-xs">
                        <XCircle className="w-3.5 h-3.5" strokeWidth={2.5} />
                        WILL FAIL
                      </div>
                    )
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg font-bold text-xs">
                      <Clock className="w-3 h-3" strokeWidth={2.5} />
                      {requiredReadings - filledCount} more needed
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Technician + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">Technician</label>
              <input
                value={intForm.technician}
                onChange={(e) => setIntForm({ ...intForm, technician: e.target.value })}
                placeholder="Name"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">Date</label>
              <input
                type="date"
                value={intForm.date}
                onChange={(e) => setIntForm({ ...intForm, date: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* External Calibration Modal */}
      <Modal
        open={extModalOpen}
        onClose={() => { setExtModalOpen(false); setExtError(''); }}
        title="Record External Calibration Result"
        subtitle="Enter certificate details from accredited vendor"
        maxWidth="lg"
        footer={
          <>
            <button onClick={() => setExtModalOpen(false)} className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm">Cancel</button>
            <button onClick={saveExternal} className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm" style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }}>
              Save Calibration
            </button>
          </>
        }
      >
        {extError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />{extError}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">Select Gauge <span className="text-red-500">*</span></label>
            <select
              value={extForm.gaugeId}
              onChange={(e) => setExtForm({ ...extForm, gaugeId: e.target.value, vendorId: '' })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
            >
              <option value="">Select a gauge</option>
              {allGauges.filter((g) => g.status !== 'Scrapped').map((g) => (
                <option key={g.id} value={g.id}>
                  {g.gaugeCode} — {g.name} {g.status === 'Under Calibration' ? '🔵' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">Vendor <span className="text-red-500">*</span></label>
            <select
              value={extForm.vendorId}
              onChange={(e) => setExtForm({ ...extForm, vendorId: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
            >
              <option value="">Select a vendor</option>
              {eligibleVendors.map((v) => (
                <option key={v.id} value={v.id}>{v.name} ({v.accreditationNo})</option>
              ))}
            </select>
            {selectedExternalGauge && !vendorScopeMismatch && (
              <p className="text-xs text-emerald-600 mt-1">Showing labs accredited for "{selectedExternalGauge.type}".</p>
            )}
            {vendorScopeMismatch && (
              <p className="text-xs text-amber-600 mt-1">No lab is accredited for "{selectedExternalGauge!.type}" yet — showing all vendors.</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">Certificate No. <span className="text-red-500">*</span></label>
              <input
                value={extForm.certificateNo}
                onChange={(e) => setExtForm({ ...extForm, certificateNo: e.target.value })}
                placeholder="e.g. NABL-1023-C4521"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">Certificate Valid Until</label>
              <input
                type="date"
                value={extForm.certificateValidUntil}
                onChange={(e) => setExtForm({ ...extForm, certificateValidUntil: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">Certificate File (optional, max 5MB)</label>
            {extForm.certificateFileName ? (
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-emerald-800 truncate">{extForm.certificateFileName}</p>
                    <p className="text-xs text-emerald-600">Ready to save with calibration</p>
                  </div>
                </div>
                <button onClick={removeUploadedFile} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition flex-shrink-0 ml-3" title="Remove file">
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            ) : (
              <label className="block border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition cursor-pointer">
                <input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/*" onChange={handleFileUpload} className="hidden" />
                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-sm text-gray-500"><span className="text-indigo-600 font-semibold">Click to upload</span> certificate</p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (max 5MB)</p>
              </label>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">Technician / Contact</label>
              <input
                value={extForm.technician}
                onChange={(e) => setExtForm({ ...extForm, technician: e.target.value })}
                placeholder="Vendor representative"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">Date</label>
              <input
                type="date"
                value={extForm.date}
                onChange={(e) => setExtForm({ ...extForm, date: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* CAPA Prompt Modal */}
      <Modal
        open={!!capaPrompt}
        onClose={() => setCapaPrompt(null)}
        title="Calibration Failed — Create CAPA"
        subtitle={`Gauge: ${capaPrompt ? getGaugeLabel(capaPrompt.gaugeId) : ''}`}
        maxWidth="lg"
        footer={
          <>
            <button onClick={() => setCapaPrompt(null)} className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm">Skip</button>
            <button onClick={createCapaFromFail} className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm bg-amber-500 hover:bg-amber-600">
              <AlertTriangle className="w-4 h-4 inline mr-1" strokeWidth={2} />
              Create CAPA
            </button>
          </>
        }
      >
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2} />
          <span>This calibration <strong>FAILED</strong>. It is recommended to create a CAPA (Corrective & Preventive Action).</span>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">Root Cause <span className="text-red-500">*</span></label>
            <textarea value={capaForm.rootCause} onChange={(e) => setCapaForm({ ...capaForm, rootCause: e.target.value })} rows={2}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm resize-none"
              placeholder="Describe the root cause…" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">Corrective Action</label>
            <textarea value={capaForm.correctiveAction} onChange={(e) => setCapaForm({ ...capaForm, correctiveAction: e.target.value })} rows={2}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm resize-none"
              placeholder="What corrective action will be taken?" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">Responsible Person <span className="text-red-500">*</span></label>
              <input value={capaForm.responsiblePerson} onChange={(e) => setCapaForm({ ...capaForm, responsiblePerson: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">Target Date <span className="text-red-500">*</span></label>
              <input type="date" value={capaForm.targetDate} onChange={(e) => setCapaForm({ ...capaForm, targetDate: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm" />
            </div>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
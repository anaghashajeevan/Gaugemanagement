// // src/pages/MSA.tsx

// import { useState, useMemo } from 'react';
// import Layout from '../components/Layout';
// import DataTable, { type Column } from '../components/DataTable';
// import StatusBadge from '../components/StatusBadge';
// import Modal from '../components/Modal';
// import {
//   msaStorage,
//   gaugeStorage,
//   capaStorage,
//   auditStorage,
//   type MSAStudy,
// } from '../utils/storage';
// import {
//   BarChart3,
//   Plus,
//   AlertCircle,
//   AlertTriangle,
//   TrendingUp,
//   Target,
//   Activity,
// } from 'lucide-react';

// type StudyTab = 'GRR' | 'Linearity' | 'Bias' | 'Uncertainty';

// export default function MSA() {
//   const [studies, setStudies] = useState<MSAStudy[]>(msaStorage.getAll());
//   const [tab, setTab] = useState<StudyTab>('GRR');
//   const [modalOpen, setModalOpen] = useState(false);
//   const [formError, setFormError] = useState('');

//   // GRR Form state
//   const [grrGaugeId, setGrrGaugeId] = useState('');
//   const [grrOperators, setGrrOperators] = useState('');
//   const [grrParts, setGrrParts] = useState('');
//   const [grrGrid, setGrrGrid] = useState('');

//   // Linearity Form state
//   const [linGaugeId, setLinGaugeId] = useState('');
//   const [linRefValues, setLinRefValues] = useState('');
//   const [linObsValues, setLinObsValues] = useState('');

//   // Bias Form state
//   const [biasGaugeId, setBiasGaugeId] = useState('');
//   const [biasRefValue, setBiasRefValue] = useState('');
//   const [biasReadings, setBiasReadings] = useState('');

//   // Uncertainty Form
//   const [uncGaugeId, setUncGaugeId] = useState('');
//   const [uncGrrValue, setUncGrrValue] = useState('');
//   const [uncStdUncertainty, setUncStdUncertainty] = useState('');

//   // CAPA prompt
//   const [capaPrompt, setCapaPrompt] = useState<MSAStudy | null>(null);
//   const [capaForm, setCapaForm] = useState({
//     rootCause: '',
//     correctiveAction: '',
//     responsiblePerson: '',
//     targetDate: '',
//   });

//   const gauges = gaugeStorage.getAll();
//   const reload = () => setStudies(msaStorage.getAll());

//   const filtered = useMemo(
//     () => studies.filter((s) => s.studyType === tab),
//     [studies, tab]
//   );

//   const getGaugeLabel = (gaugeId: string) => {
//     const g = gauges.find((x) => x.id === gaugeId);
//     return g ? `${g.gaugeCode} — ${g.name}` : gaugeId;
//   };

//   const tabIcons: Record<StudyTab, typeof BarChart3> = {
//     GRR: BarChart3,
//     Linearity: TrendingUp,
//     Bias: Target,
//     Uncertainty: Activity,
//   };

//   // ─── Save Handlers ────────────────────────────────────────────────

//   const saveGRR = () => {
//     if (!grrGaugeId || !grrOperators.trim() || !grrParts.trim() || !grrGrid.trim()) {
//       setFormError('All fields are required for GR&R.');
//       return;
//     }

//     const operators = grrOperators.split(',').map((o) => o.trim()).filter(Boolean);
//     const sampleParts = grrParts.split(',').map((p) => p.trim()).filter(Boolean);

//     // Parse grid: rows separated by ';', values by ','
//     const trialData = grrGrid.split(';').map((row) =>
//       row.split(',').map((v) => parseFloat(v.trim())).filter((v) => !isNaN(v))
//     );

//     // Simple mock %GRR calculation
//     const allValues = trialData.flat();
//     const mean = allValues.reduce((a, b) => a + b, 0) / allValues.length;
//     const variance =
//       allValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
//       allValues.length;
//     const stdDev = Math.sqrt(variance);
//     const grrPercent = parseFloat(((stdDev / mean) * 100 * 10).toFixed(1));

//     const passFail: MSAStudy['passFail'] =
//       grrPercent < 10 ? 'Pass' : grrPercent <= 30 ? 'Borderline' : 'Fail';

//     const newStudy = msaStorage.add({
//       gaugeId: grrGaugeId,
//       studyType: 'GRR',
//       operators,
//       sampleParts,
//       trialData,
//       resultValue: grrPercent,
//       passFail,
//       date: new Date().toISOString().split('T')[0],
//     });

//     auditStorage.add({
//       action: 'CREATE',
//       entityType: 'MSAStudy',
//       entityId: newStudy.id,
//       userId: 'current',
//       timestamp: new Date().toISOString(),
//     });

//     reload();
//     closeModal();

//     if (passFail === 'Fail') setCapaPrompt(newStudy);
//   };

//   const saveLinearity = () => {
//     if (!linGaugeId || !linRefValues.trim() || !linObsValues.trim()) {
//       setFormError('All fields are required for Linearity.');
//       return;
//     }

//     const refs = linRefValues.split(',').map((v) => parseFloat(v.trim())).filter((v) => !isNaN(v));
//     const obs = linObsValues.split(',').map((v) => parseFloat(v.trim())).filter((v) => !isNaN(v));

//     if (refs.length !== obs.length || refs.length === 0) {
//       setFormError('Reference and observed values must have the same count.');
//       return;
//     }

//     const deviations = refs.map((r, i) => Math.abs(r - obs[i]));
//     const maxDev = Math.max(...deviations);
//     const resultValue = parseFloat(maxDev.toFixed(4));

//     const passFail: MSAStudy['passFail'] =
//       maxDev <= 0.01 ? 'Pass' : maxDev <= 0.03 ? 'Borderline' : 'Fail';

//     const newStudy = msaStorage.add({
//       gaugeId: linGaugeId,
//       studyType: 'Linearity',
//       operators: ['Analyst'],
//       sampleParts: refs.map((_, i) => `L${i + 1}`),
//       trialData: [obs],
//       resultValue,
//       passFail,
//       date: new Date().toISOString().split('T')[0],
//     });

//     auditStorage.add({
//       action: 'CREATE',
//       entityType: 'MSAStudy',
//       entityId: newStudy.id,
//       userId: 'current',
//       timestamp: new Date().toISOString(),
//     });

//     reload();
//     closeModal();
//     if (passFail === 'Fail') setCapaPrompt(newStudy);
//   };

//   const saveBias = () => {
//     if (!biasGaugeId || !biasRefValue.trim() || !biasReadings.trim()) {
//       setFormError('All fields are required for Bias.');
//       return;
//     }

//     const ref = parseFloat(biasRefValue);
//     const readings = biasReadings
//       .split(',')
//       .map((v) => parseFloat(v.trim()))
//       .filter((v) => !isNaN(v));

//     if (isNaN(ref) || readings.length === 0) {
//       setFormError('Enter valid numeric reference value and readings.');
//       return;
//     }

//     const avgReading = readings.reduce((a, b) => a + b, 0) / readings.length;
//     const bias = parseFloat(Math.abs(avgReading - ref).toFixed(4));

//     const passFail: MSAStudy['passFail'] =
//       bias <= 0.002 ? 'Pass' : bias <= 0.005 ? 'Borderline' : 'Fail';

//     const newStudy = msaStorage.add({
//       gaugeId: biasGaugeId,
//       studyType: 'Bias',
//       operators: ['Analyst'],
//       sampleParts: ['REF'],
//       trialData: [readings],
//       resultValue: bias,
//       passFail,
//       date: new Date().toISOString().split('T')[0],
//     });

//     auditStorage.add({
//       action: 'CREATE',
//       entityType: 'MSAStudy',
//       entityId: newStudy.id,
//       userId: 'current',
//       timestamp: new Date().toISOString(),
//     });

//     reload();
//     closeModal();
//     if (passFail === 'Fail') setCapaPrompt(newStudy);
//   };

//   const saveUncertainty = () => {
//     if (!uncGaugeId || !uncGrrValue.trim() || !uncStdUncertainty.trim()) {
//       setFormError('All fields are required for Uncertainty.');
//       return;
//     }

//     const grr = parseFloat(uncGrrValue);
//     const stdUnc = parseFloat(uncStdUncertainty);

//     if (isNaN(grr) || isNaN(stdUnc)) {
//       setFormError('Enter valid numeric values.');
//       return;
//     }

//     const combined = parseFloat(Math.sqrt(grr ** 2 + stdUnc ** 2).toFixed(4));
//     const passFail: MSAStudy['passFail'] =
//       combined <= 0.05 ? 'Pass' : combined <= 0.1 ? 'Borderline' : 'Fail';

//     const newStudy = msaStorage.add({
//       gaugeId: uncGaugeId,
//       studyType: 'Uncertainty',
//       operators: ['Analyst'],
//       sampleParts: ['Combined'],
//       trialData: [[grr, stdUnc, combined]],
//       resultValue: combined,
//       passFail,
//       date: new Date().toISOString().split('T')[0],
//     });

//     auditStorage.add({
//       action: 'CREATE',
//       entityType: 'MSAStudy',
//       entityId: newStudy.id,
//       userId: 'current',
//       timestamp: new Date().toISOString(),
//     });

//     reload();
//     closeModal();
//     if (passFail === 'Fail') setCapaPrompt(newStudy);
//   };

//   const handleSave = () => {
//     setFormError('');
//     switch (tab) {
//       case 'GRR': saveGRR(); break;
//       case 'Linearity': saveLinearity(); break;
//       case 'Bias': saveBias(); break;
//       case 'Uncertainty': saveUncertainty(); break;
//     }
//   };

//   const closeModal = () => {
//     setModalOpen(false);
//     setFormError('');
//     setGrrGaugeId(''); setGrrOperators(''); setGrrParts(''); setGrrGrid('');
//     setLinGaugeId(''); setLinRefValues(''); setLinObsValues('');
//     setBiasGaugeId(''); setBiasRefValue(''); setBiasReadings('');
//     setUncGaugeId(''); setUncGrrValue(''); setUncStdUncertainty('');
//   };

//   const createCapaFromMSA = () => {
//     if (!capaPrompt) return;
//     if (!capaForm.rootCause || !capaForm.responsiblePerson || !capaForm.targetDate) return;

//     capaStorage.add({
//       sourceType: 'MSA',
//       sourceId: capaPrompt.id,
//       gaugeId: capaPrompt.gaugeId,
//       rootCause: capaForm.rootCause,
//       correctiveAction: capaForm.correctiveAction,
//       responsiblePerson: capaForm.responsiblePerson,
//       targetDate: capaForm.targetDate,
//       status: 'Open',
//     });

//     setCapaPrompt(null);
//     setCapaForm({ rootCause: '', correctiveAction: '', responsiblePerson: '', targetDate: '' });
//   };

//   // ─── Table Columns ────────────────────────────────────────────────
//   const columns: Column<MSAStudy>[] = [
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
//     {
//       header: 'Operators',
//       cell: (row) => <span className="text-sm">{row.operators.join(', ')}</span>,
//     },
//     {
//       header: 'Result Value',
//       cell: (row) => (
//         <span className="font-bold font-mono">
//           {tab === 'GRR' ? `${row.resultValue}%` : row.resultValue}
//         </span>
//       ),
//     },
//     {
//       header: 'Pass/Fail',
//       cell: (row) => <StatusBadge status={row.passFail} />,
//     },
//   ];

//   // ─── Form Content by Tab ──────────────────────────────────────────
//   const renderForm = () => {
//     const gaugeSelect = (value: string, onChange: (v: string) => void) => (
//       <div>
//         <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//           Select Gauge <span className="text-red-500">*</span>
//         </label>
//         <select
//           value={value}
//           onChange={(e) => onChange(e.target.value)}
//           className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
//         >
//           <option value="">Select a gauge</option>
//           {gauges.filter((g) => g.status !== 'Scrapped').map((g) => (
//             <option key={g.id} value={g.id}>
//               {g.gaugeCode} — {g.name}
//             </option>
//           ))}
//         </select>
//       </div>
//     );

//     switch (tab) {
//       case 'GRR':
//         return (
//           <div className="space-y-4">
//             {gaugeSelect(grrGaugeId, setGrrGaugeId)}
//             <div>
//               <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//                 Operators (comma-separated) <span className="text-red-500">*</span>
//               </label>
//               <input
//                 value={grrOperators}
//                 onChange={(e) => setGrrOperators(e.target.value)}
//                 placeholder="e.g. Rajesh Kumar, Sunita Rao, Priya Sharma"
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//                 Sample Parts (comma-separated) <span className="text-red-500">*</span>
//               </label>
//               <input
//                 value={grrParts}
//                 onChange={(e) => setGrrParts(e.target.value)}
//                 placeholder="e.g. P1, P2, P3, P4, P5"
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//                 Trial Data Grid <span className="text-red-500">*</span>
//               </label>
//               <textarea
//                 value={grrGrid}
//                 onChange={(e) => setGrrGrid(e.target.value)}
//                 rows={4}
//                 placeholder={`Each operator's readings on one row, values comma-separated, rows separated by semicolons.\ne.g. 10.02,10.01,10.02,10.03,10.02; 10.01,10.02,10.01,10.02,10.01`}
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm resize-none font-mono text-xs"
//               />
//               <p className="text-xs text-gray-400 mt-1">
//                 &lt;10% = Pass | 10–30% = Borderline | &gt;30% = Fail
//               </p>
//             </div>
//           </div>
//         );

//       case 'Linearity':
//         return (
//           <div className="space-y-4">
//             {gaugeSelect(linGaugeId, setLinGaugeId)}
//             <div>
//               <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//                 Reference Values (comma-separated) <span className="text-red-500">*</span>
//               </label>
//               <input
//                 value={linRefValues}
//                 onChange={(e) => setLinRefValues(e.target.value)}
//                 placeholder="e.g. 50, 100, 150, 200, 250"
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//                 Observed Readings (comma-separated) <span className="text-red-500">*</span>
//               </label>
//               <input
//                 value={linObsValues}
//                 onChange={(e) => setLinObsValues(e.target.value)}
//                 placeholder="e.g. 50.01, 100.02, 150.01, 200.03, 250.02"
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//               />
//             </div>
//             <div className="bg-indigo-50 rounded-xl p-3 text-xs text-indigo-700">
//               ≤0.01 = Pass | 0.01–0.03 = Borderline | &gt;0.03 = Fail
//             </div>
//           </div>
//         );

//       case 'Bias':
//         return (
//           <div className="space-y-4">
//             {gaugeSelect(biasGaugeId, setBiasGaugeId)}
//             <div>
//               <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//                 Reference Value <span className="text-red-500">*</span>
//               </label>
//               <input
//                 value={biasRefValue}
//                 onChange={(e) => setBiasRefValue(e.target.value)}
//                 placeholder="e.g. 10.000"
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//                 Repeated Readings (comma-separated) <span className="text-red-500">*</span>
//               </label>
//               <input
//                 value={biasReadings}
//                 onChange={(e) => setBiasReadings(e.target.value)}
//                 placeholder="e.g. 10.003, 10.004, 10.003, 10.004, 10.003"
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//               />
//             </div>
//             <div className="bg-indigo-50 rounded-xl p-3 text-xs text-indigo-700">
//               Bias = |Average − Reference|. ≤0.002 = Pass | 0.002–0.005 = Borderline | &gt;0.005 = Fail
//             </div>
//           </div>
//         );

//       case 'Uncertainty':
//         return (
//           <div className="space-y-4">
//             {gaugeSelect(uncGaugeId, setUncGaugeId)}
//             <div>
//               <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//                 GR&R Uncertainty Component <span className="text-red-500">*</span>
//               </label>
//               <input
//                 value={uncGrrValue}
//                 onChange={(e) => setUncGrrValue(e.target.value)}
//                 placeholder="e.g. 0.03"
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//                 Standard Uncertainty <span className="text-red-500">*</span>
//               </label>
//               <input
//                 value={uncStdUncertainty}
//                 onChange={(e) => setUncStdUncertainty(e.target.value)}
//                 placeholder="e.g. 0.02"
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//               />
//             </div>
//             <div className="bg-indigo-50 rounded-xl p-3 text-xs text-indigo-700">
//               Combined = √(GRR² + StdUnc²). ≤0.05 = Pass | 0.05–0.1 = Borderline | &gt;0.1 = Fail
//             </div>
//           </div>
//         );
//     }
//   };

//   return (
//     <Layout pageTitle="MSA Studies">
//       {/* ─── Tabs ─────────────────────────────────────────────────── */}
//       <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
//         <div className="flex gap-1 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100">
//           {(['GRR', 'Linearity', 'Bias', 'Uncertainty'] as StudyTab[]).map((t) => {
//             const Icon = tabIcons[t];
//             return (
//               <button
//                 key={t}
//                 onClick={() => setTab(t)}
//                 className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
//                   tab === t
//                     ? 'text-white shadow-md'
//                     : 'text-gray-600 hover:bg-gray-50'
//                 }`}
//                 style={
//                   tab === t
//                     ? {
//                         background:
//                           'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
//                       }
//                     : {}
//                 }
//               >
//                 <Icon className="w-4 h-4" strokeWidth={2} />
//                 {t}
//               </button>
//             );
//           })}
//         </div>

//         <button
//           onClick={() => { closeModal(); setModalOpen(true); }}
//           className="flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition text-sm"
//           style={{
//             background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
//           }}
//         >
//           <Plus className="w-4 h-4" strokeWidth={2.5} />
//           New {tab} Study
//         </button>
//       </div>

//       {/* ─── Stats ────────────────────────────────────────────────── */}
//       <div className="grid grid-cols-3 gap-4 mb-6">
//         {[
//           { label: 'Total Studies', value: filtered.length, accent: 'from-indigo-500 to-purple-500' },
//           { label: 'Pass', value: filtered.filter((s) => s.passFail === 'Pass').length, accent: 'from-emerald-500 to-teal-500' },
//           { label: 'Fail', value: filtered.filter((s) => s.passFail === 'Fail').length, accent: 'from-red-500 to-rose-500' },
//         ].map((s) => (
//           <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative overflow-hidden">
//             <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${s.accent}`} />
//             <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{s.label}</p>
//             <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
//           </div>
//         ))}
//       </div>

//       {/* ─── Table ────────────────────────────────────────────────── */}
//       <DataTable
//         columns={columns}
//         data={filtered}
//         keyExtractor={(r) => r.id}
//         emptyTitle={`No ${tab} studies found`}
//         emptySubtitle="Create a new study to get started."
//         emptyIcon={<BarChart3 className="w-8 h-8 text-gray-300" strokeWidth={1.5} />}
//       />

//       {/* ─── New Study Modal ──────────────────────────────────────── */}
//       <Modal
//         open={modalOpen}
//         onClose={closeModal}
//         title={`New ${tab} Study`}
//         subtitle={
//           tab === 'GRR'
//             ? 'Enter operator/part trial data to calculate %GR&R'
//             : tab === 'Linearity'
//             ? 'Compare reference vs observed values across the range'
//             : tab === 'Bias'
//             ? 'Calculate average offset from reference value'
//             : 'Calculate combined measurement uncertainty'
//         }
//         maxWidth="lg"
//         footer={
//           <>
//             <button
//               onClick={closeModal}
//               className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSave}
//               className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm"
//               style={{
//                 background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
//               }}
//             >
//               Calculate & Save
//             </button>
//           </>
//         }
//       >
//         {formError && (
//           <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
//             <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
//             {formError}
//           </div>
//         )}
//         {renderForm()}
//       </Modal>

//       {/* ─── CAPA Prompt Modal ────────────────────────────────────── */}
//       <Modal
//         open={!!capaPrompt}
//         onClose={() => setCapaPrompt(null)}
//         title="MSA Study Failed — Create CAPA"
//         subtitle={capaPrompt ? `Gauge: ${getGaugeLabel(capaPrompt.gaugeId)}` : ''}
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
//               onClick={createCapaFromMSA}
//               className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm bg-amber-500 hover:bg-amber-600"
//             >
//               <AlertTriangle className="w-4 h-4 inline mr-1" strokeWidth={2} />
//               Create CAPA
//             </button>
//           </>
//         }
//       >
//         <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
//           <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2} />
//           This {tab} study <strong>FAILED</strong>. It is recommended to create a CAPA.
//         </div>

//         <div className="space-y-4">
//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Root Cause <span className="text-red-500">*</span>
//             </label>
//             <textarea
//               value={capaForm.rootCause}
//               onChange={(e) => setCapaForm({ ...capaForm, rootCause: e.target.value })}
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
//               onChange={(e) => setCapaForm({ ...capaForm, correctiveAction: e.target.value })}
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
//                 onChange={(e) => setCapaForm({ ...capaForm, responsiblePerson: e.target.value })}
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
//                 onChange={(e) => setCapaForm({ ...capaForm, targetDate: e.target.value })}
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//               />
//             </div>
//           </div>
//         </div>
//       </Modal>
//     </Layout>
//   );
// }


// src/pages/MSA.tsx

// src/pages/MSA.tsx

// import { useState, useMemo, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Layout from '../components/Layout';
// import DataTable, { type Column } from '../components/DataTable';
// import StatusBadge from '../components/StatusBadge';
// import Modal from '../components/Modal';
// import { useAuth } from '../context/AuthContext';
// import { operatorsAPI, type GaugeUser } from '../api/api';
// import {
//   msaStorage,
//   gaugeStorage,
//   partStorage,
//   capaStorage,
//   auditStorage,
//   type MSAStudy,
//   type MSAOperatorMeasurement,
// } from '../utils/storage';
// import {
//   BarChart3,
//   Plus,
//   AlertCircle,
//   AlertTriangle,
//   ClipboardCheck,
//   Users,
//   Eye,
//   Calculator,
//   CheckCircle2,
//   Clock,
//   TrendingUp,
//   Target,
//   Activity,
//   ChevronRight,
//   Mail,
//   Loader2,
//   ExternalLink,
//   X,
// } from 'lucide-react';

// type MainTab = 'studies' | 'measurements' | 'results' | 'my_tasks';
// type StudyTypeFilter = 'all' | 'GRR' | 'Linearity' | 'Bias' | 'Uncertainty';
// type StatCardFilter = 'all' | 'pending' | 'passed' | 'failed';

// export default function MSA() {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [studies, setStudies] = useState<MSAStudy[]>(msaStorage.getAll());
//   const [mainTab, setMainTab] = useState<MainTab>(
//     user?.role_code === 'shop_floor_operator' ? 'my_tasks' : 'studies'
//   );
//   const [studyTypeFilter, setStudyTypeFilter] = useState<StudyTypeFilter>('all');
//   const [statusFilter, setStatusFilter] = useState<StatCardFilter>('all');

//   // Backend operators (real users)
//   const [backendOperators, setBackendOperators] = useState<GaugeUser[]>([]);
//   const [loadingOperators, setLoadingOperators] = useState(false);

//   // Create Study Modal
//   const [createOpen, setCreateOpen] = useState(false);
//   const [createType, setCreateType] = useState<MSAStudy['studyType']>('GRR');
//   const [createGaugeId, setCreateGaugeId] = useState('');
//   const [selectedOperatorIds, setSelectedOperatorIds] = useState<string[]>([]);
//   const [selectedPartIds, setSelectedPartIds] = useState<string[]>([]);
//   const [numberOfTrials, setNumberOfTrials] = useState(3);
//   const [createError, setCreateError] = useState('');

//   // Linearity specific
//   const [linRefValues, setLinRefValues] = useState<string[]>(['']);

//   // Bias specific
//   const [biasRef, setBiasRef] = useState('');
//   const [biasReadingsCount, setBiasReadingsCount] = useState(10);

//   // Uncertainty specific
//   const [uncGrrComp, setUncGrrComp] = useState('');
//   const [uncStdUnc, setUncStdUnc] = useState('');

//   // Measurements tab
//   const [selectedStudyId, setSelectedStudyId] = useState<string | null>(null);

//   // Measurement entry modal
//   const [measureModalOpen, setMeasureModalOpen] = useState(false);
//   const [measureOperatorId, setMeasureOperatorId] = useState('');
//   const [measureGrid, setMeasureGrid] = useState<number[][]>([]);

//   // CAPA prompt
//   const [capaPrompt, setCapaPrompt] = useState<MSAStudy | null>(null);
//   const [capaForm, setCapaForm] = useState({
//     rootCause: '',
//     correctiveAction: '',
//     responsiblePerson: '',
//     targetDate: '',
//   });

//   // View result modal
//   const [viewResultStudy, setViewResultStudy] = useState<MSAStudy | null>(null);

//   const gauges = gaugeStorage.getAll();
//   const parts = partStorage.getAll();
//   const capas = capaStorage.getAll();
//   const reload = () => setStudies(msaStorage.getAll());

//   const capaForStudy = (studyId: string) =>
//     capas.find((c) => c.sourceType === 'MSA' && c.sourceId === studyId);

//   const openCapaPrompt = (study: MSAStudy) => {
//     setCapaForm({
//       rootCause: '',
//       correctiveAction: '',
//       responsiblePerson: '',
//       targetDate: '',
//     });
//     setCapaPrompt(study);
//   };

//   const isAdmin = user?.role_code === 'admin';
//   const isQE = user?.role_code === 'quality_engineer';
//   const isOperator = user?.role_code === 'shop_floor_operator' || user?.role_code === 'store_keeper';
//   const canCreate = isAdmin || isQE;
//   const currentUserId = user?.id ? String(user.id) : '';

//   // ─── Load Backend Operators ───────────────────────────────────────
//   useEffect(() => {
//     const loadOperators = async () => {
//       setLoadingOperators(true);
//       try {
//         const ops = await operatorsAPI.list();
//         setBackendOperators(ops);
//       } catch (err) {
//         console.error('Failed to load operators:', err);
//       } finally {
//         setLoadingOperators(false);
//       }
//     };
//     loadOperators();
//   }, []);

//   const getGaugeLabel = (gaugeId: string) => {
//     const g = gauges.find((x) => x.id === gaugeId);
//     return g ? `${g.gaugeCode} — ${g.name}` : '—';
//   };

//   // ─── Filtered Studies ─────────────────────────────────────────────
//   const filteredStudies = useMemo(() => {
//     let list = studies;
//     if (studyTypeFilter !== 'all') {
//       list = list.filter((s) => s.studyType === studyTypeFilter);
//     }
//     if (statusFilter === 'pending') {
//       list = list.filter((s) => s.status === 'Pending Measurements');
//     } else if (statusFilter === 'passed') {
//       list = list.filter((s) => s.passFail === 'Pass');
//     } else if (statusFilter === 'failed') {
//       list = list.filter((s) => s.passFail === 'Fail');
//     }
//     return list.sort(
//       (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
//     );
//   }, [studies, studyTypeFilter, statusFilter]);

//   const pendingStudies = useMemo(
//     () => studies.filter((s) => ['Pending Measurements', 'In Progress'].includes(s.status)),
//     [studies]
//   );

//   const completedStudies = useMemo(
//     () => studies.filter((s) => ['Completed', 'Failed'].includes(s.status)),
//     [studies]
//   );

//   // My assigned tasks (for operators)
//   const myTasks = useMemo(
//     () =>
//       studies.filter(
//         (s) =>
//           s.operatorIds.includes(currentUserId) &&
//           ['Pending Measurements', 'In Progress'].includes(s.status)
//       ),
//     [studies, currentUserId]
//   );

//   const selectedStudy = selectedStudyId ? msaStorage.getById(selectedStudyId) : null;

//   // ─── Stats ────────────────────────────────────────────────────────
//   const stats: {
//     key: StatCardFilter;
//     label: string;
//     value: number;
//     accent: string;
//     icon: typeof BarChart3;
//   }[] = [
//     { key: 'all', label: 'Total Studies', value: studies.length, accent: 'from-indigo-500 to-purple-500', icon: BarChart3 },
//     { key: 'pending', label: 'Pending', value: studies.filter((s) => s.status === 'Pending Measurements').length, accent: 'from-amber-500 to-yellow-500', icon: Clock },
//     { key: 'passed', label: 'Passed', value: studies.filter((s) => s.passFail === 'Pass').length, accent: 'from-emerald-500 to-teal-500', icon: CheckCircle2 },
//     { key: 'failed', label: 'Failed', value: studies.filter((s) => s.passFail === 'Fail').length, accent: 'from-red-500 to-rose-500', icon: AlertTriangle },
//   ];

//   // ═══════════════════════════════════════════════════════════════════
//   // CREATE STUDY
//   // ═══════════════════════════════════════════════════════════════════

//   const resetCreateForm = () => {
//     setCreateType('GRR');
//     setCreateGaugeId('');
//     setSelectedOperatorIds([]);
//     setSelectedPartIds([]);
//     setNumberOfTrials(3);
//     setLinRefValues(['']);
//     setBiasRef('');
//     setBiasReadingsCount(10);
//     setUncGrrComp('');
//     setUncStdUnc('');
//     setCreateError('');
//   };

//   const handleCreateStudy = () => {
//     if (!createGaugeId) {
//       setCreateError('Select a gauge.');
//       return;
//     }

//     if (createType === 'GRR') {
//       if (selectedOperatorIds.length < 2) {
//         setCreateError('Select at least 2 operators for GR&R.');
//         return;
//       }
//       if (selectedPartIds.length < 5) {
//         setCreateError('Select at least 5 parts for GR&R.');
//         return;
//       }
//     }

//     if (createType === 'Linearity') {
//       if (selectedOperatorIds.length < 1) {
//         setCreateError('Select at least 1 operator.');
//         return;
//       }
//       const refs = linRefValues.filter((v) => v.trim() !== '').map(Number);
//       if (refs.length < 3 || refs.some(isNaN)) {
//         setCreateError('Enter at least 3 valid reference values.');
//         return;
//       }
//     }

//     if (createType === 'Bias') {
//       if (selectedOperatorIds.length < 1) {
//         setCreateError('Select at least 1 operator.');
//         return;
//       }
//       if (!biasRef || isNaN(Number(biasRef))) {
//         setCreateError('Enter a valid reference value.');
//         return;
//       }
//     }

//     if (createType === 'Uncertainty') {
//       if (!uncGrrComp || !uncStdUnc || isNaN(Number(uncGrrComp)) || isNaN(Number(uncStdUnc))) {
//         setCreateError('Enter valid GR&R and Standard Uncertainty values.');
//         return;
//       }
//     }

//     // Build operator names from backend users
//     const operatorNames = selectedOperatorIds.map((id) => {
//       const op = backendOperators.find((o) => String(o.id) === id);
//       return op?.full_name || `User ${id}`;
//     });

//     const measurements: MSAOperatorMeasurement[] = selectedOperatorIds.map((id) => ({
//       operatorId: id,
//       operatorName:
//         backendOperators.find((o) => String(o.id) === id)?.full_name || `User ${id}`,
//       status: 'Pending' as const,
//       data: [],
//     }));

//     const partNames =
//       createType === 'GRR'
//         ? selectedPartIds.map(
//             (id) => parts.find((p) => p.id === id)?.partName || id
//           )
//         : createType === 'Linearity'
//         ? linRefValues.filter((v) => v.trim()).map((_, i) => `Ref ${i + 1}`)
//         : ['REF'];

//     const newStudy = msaStorage.add({
//       gaugeId: createGaugeId,
//       studyType: createType,
//       operatorIds: selectedOperatorIds,
//       operatorNames,
//       parts: partNames,
//       numberOfTrials: createType === 'Uncertainty' ? 1 : numberOfTrials,
//       referenceValues:
//         createType === 'Linearity'
//           ? linRefValues.filter((v) => v.trim()).map(Number)
//           : undefined,
//       biasReferenceValue: createType === 'Bias' ? Number(biasRef) : undefined,
//       biasNumberOfReadings: createType === 'Bias' ? biasReadingsCount : undefined,
//       grrComponent: createType === 'Uncertainty' ? Number(uncGrrComp) : undefined,
//       stdUncertainty: createType === 'Uncertainty' ? Number(uncStdUnc) : undefined,
//       status: createType === 'Uncertainty' ? 'Completed' : 'Pending Measurements',
//       measurements: createType === 'Uncertainty' ? [] : measurements,
//       createdBy: user?.full_name || 'Admin',
//       createdDate: new Date().toISOString().split('T')[0],
//       ...(createType === 'Uncertainty'
//         ? (() => {
//             const grr = Number(uncGrrComp);
//             const std = Number(uncStdUnc);
//             const combined = parseFloat(
//               Math.sqrt(grr ** 2 + std ** 2).toFixed(4)
//             );
//             const pf =
//               combined <= 0.05
//                 ? 'Pass'
//                 : combined <= 0.1
//                 ? 'Borderline'
//                 : 'Fail';
//             return {
//               resultValue: combined,
//               passFail: pf as 'Pass' | 'Borderline' | 'Fail',
//               completedDate: new Date().toISOString().split('T')[0],
//             };
//           })()
//         : {}),
//     });

//     if (createType !== 'Uncertainty') {
//       gaugeStorage.update(createGaugeId, { status: 'Under MSA Study' });
//     }

//     auditStorage.add({
//       action: 'CREATE',
//       entityType: 'MSAStudy',
//       entityId: newStudy.id,
//       userId: currentUserId,
//       timestamp: new Date().toISOString(),
//     });

//     reload();
//     setCreateOpen(false);
//     resetCreateForm();

//     if (createType === 'Uncertainty' && newStudy.passFail === 'Fail') {
//       setCapaPrompt(newStudy);
//     }
//   };

//   const toggleOperator = (id: string) => {
//     setSelectedOperatorIds((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
//     );
//   };

//   const togglePart = (id: string) => {
//     setSelectedPartIds((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
//     );
//   };

//   // ═══════════════════════════════════════════════════════════════════
//   // MEASUREMENT ENTRY
//   // ═══════════════════════════════════════════════════════════════════

//   const openMeasurementEntry = (study: MSAStudy, operatorId: string) => {
//     const numParts =
//       study.studyType === 'Bias'
//         ? study.biasNumberOfReadings || 10
//         : study.parts.length;
//     const numTrials = study.numberOfTrials;

//     const existing = study.measurements.find((m) => m.operatorId === operatorId);
//     if (existing && existing.data.length > 0) {
//       setMeasureGrid(existing.data);
//     } else {
//       setMeasureGrid(
//         Array.from({ length: numParts }, () =>
//           Array.from({ length: numTrials }, () => 0)
//         )
//       );
//     }

//     setMeasureOperatorId(operatorId);
//     setSelectedStudyId(study.id);
//     setMeasureModalOpen(true);
//   };

//   const updateMeasureCell = (partIdx: number, trialIdx: number, value: string) => {
//     const newGrid = measureGrid.map((row) => [...row]);
//     newGrid[partIdx][trialIdx] = parseFloat(value) || 0;
//     setMeasureGrid(newGrid);
//   };

//   const submitMeasurements = () => {
//     if (!selectedStudyId || !measureOperatorId) return;
//     const study = msaStorage.getById(selectedStudyId);
//     if (!study) return;

//     const updatedMeasurements = study.measurements.map((m) =>
//       m.operatorId === measureOperatorId
//         ? {
//             ...m,
//             status: 'Completed' as const,
//             data: measureGrid,
//             submittedAt: new Date().toISOString(),
//           }
//         : m
//     );

//     const allCompleted = updatedMeasurements.every(
//       (m) => m.status === 'Completed'
//     );
//     const newStatus = allCompleted ? 'In Progress' : 'Pending Measurements';

//     msaStorage.update(selectedStudyId, {
//       measurements: updatedMeasurements,
//       status: newStatus as MSAStudy['status'],
//     });

//     auditStorage.add({
//       action: 'UPDATE',
//       entityType: 'MSAStudy',
//       entityId: selectedStudyId,
//       userId: measureOperatorId,
//       timestamp: new Date().toISOString(),
//     });

//     reload();
//     setMeasureModalOpen(false);
//   };

//   // ═══════════════════════════════════════════════════════════════════
//   // CALCULATE RESULTS
//   // ═══════════════════════════════════════════════════════════════════

//   const calculateResult = (studyId: string) => {
//     const study = msaStorage.getById(studyId);
//     if (!study) return;

//     let resultValue = 0;
//     let passFail: 'Pass' | 'Borderline' | 'Fail' = 'Pass';

//     if (study.studyType === 'GRR') {
//       const allValues = study.measurements.flatMap((m) => m.data.flat());
//       const mean = allValues.reduce((a, b) => a + b, 0) / allValues.length;
//       const variance =
//         allValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
//         allValues.length;
//       const stdDev = Math.sqrt(variance);
//       const range = Math.max(...allValues) - Math.min(...allValues);
//       const grrPercent =
//         range > 0
//           ? parseFloat(((stdDev / range) * 100 * 5.15).toFixed(1))
//           : 0;
//       resultValue = grrPercent;
//       passFail =
//         grrPercent < 10 ? 'Pass' : grrPercent <= 30 ? 'Borderline' : 'Fail';
//     }

//     if (study.studyType === 'Linearity') {
//       const refs = study.referenceValues || [];
//       const observations = study.measurements[0]?.data || [];
//       const deviations = refs.map((ref, i) => {
//         const obsAvg = observations[i]
//           ? observations[i].reduce((a: number, b: number) => a + b, 0) /
//             observations[i].length
//           : 0;
//         return Math.abs(ref - obsAvg);
//       });
//       resultValue = parseFloat(Math.max(...deviations).toFixed(4));
//       passFail =
//         resultValue <= 0.01
//           ? 'Pass'
//           : resultValue <= 0.03
//           ? 'Borderline'
//           : 'Fail';
//     }

//     if (study.studyType === 'Bias') {
//       const ref = study.biasReferenceValue || 0;
//       const readings = study.measurements[0]?.data.flat() || [];
//       const avgReading =
//         readings.reduce((a, b) => a + b, 0) / readings.length;
//       resultValue = parseFloat(Math.abs(avgReading - ref).toFixed(4));
//       passFail =
//         resultValue <= 0.002
//           ? 'Pass'
//           : resultValue <= 0.005
//           ? 'Borderline'
//           : 'Fail';
//     }

//     const finalStatus = passFail === 'Fail' ? 'Failed' : 'Completed';

//     msaStorage.update(studyId, {
//       resultValue,
//       passFail,
//       status: finalStatus,
//       completedDate: new Date().toISOString().split('T')[0],
//     });

//     const gauge = gauges.find((g) => g.id === study.gaugeId);
//     if (gauge) {
//       if (passFail === 'Fail') {
//         gaugeStorage.update(gauge.id, { status: 'Under Review' });
//       } else {
//         gaugeStorage.update(gauge.id, { status: 'Available' });
//       }
//     }

//     auditStorage.add({
//       action: 'UPDATE',
//       entityType: 'MSAStudy',
//       entityId: studyId,
//       userId: currentUserId,
//       timestamp: new Date().toISOString(),
//     });

//     reload();
//     const updatedStudy = msaStorage.getById(studyId);
//     if (updatedStudy && passFail === 'Fail') {
//       openCapaPrompt(updatedStudy);
//     }
//   };

//   // ═══════════════════════════════════════════════════════════════════
//   // CREATE CAPA
//   // ═══════════════════════════════════════════════════════════════════

//   const createCapaFromMSA = () => {
//     if (!capaPrompt) return;
//     if (
//       !capaForm.rootCause ||
//       !capaForm.responsiblePerson ||
//       !capaForm.targetDate
//     )
//       return;

//     capaStorage.add({
//       sourceType: 'MSA',
//       sourceId: capaPrompt.id,
//       gaugeId: capaPrompt.gaugeId,
//       rootCause: capaForm.rootCause,
//       correctiveAction: capaForm.correctiveAction,
//       responsiblePerson: capaForm.responsiblePerson,
//       targetDate: capaForm.targetDate,
//       status: 'Open',
//     });

//     gaugeStorage.update(capaPrompt.gaugeId, { status: 'Under Review' });

//     setCapaPrompt(null);
//     setCapaForm({
//       rootCause: '',
//       correctiveAction: '',
//       responsiblePerson: '',
//       targetDate: '',
//     });
//     reload();
//   };

//   // ═══════════════════════════════════════════════════════════════════
//   // TABLE COLUMNS
//   // ═══════════════════════════════════════════════════════════════════

//   const studyColumns: Column<MSAStudy>[] = [
//     {
//       header: 'Date',
//       cell: (r) => <span className="text-sm">{r.createdDate}</span>,
//     },
//     {
//       header: 'Gauge',
//       cell: (r) => {
//         const g = gauges.find((x) => x.id === r.gaugeId);
//         return (
//           <div>
//             <span className="font-bold text-indigo-600">{g?.gaugeCode || '—'}</span>
//             <p className="text-xs text-gray-400">{g?.name}</p>
//           </div>
//         );
//       },
//     },
//     { header: 'Type', cell: (r) => <StatusBadge status={r.studyType} /> },
//     {
//       header: 'Operators',
//       cell: (r) => (
//         <div className="flex items-center gap-1">
//           <Users className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
//           <span className="text-sm">{r.operatorNames.length}</span>
//         </div>
//       ),
//     },
//     {
//       header: 'Config',
//       cell: (r) => (
//         <span className="text-sm text-gray-500">
//           {r.parts.length} parts × {r.numberOfTrials} trials
//         </span>
//       ),
//     },
//     {
//       header: 'Progress',
//       cell: (r) => {
//         if (r.studyType === 'Uncertainty')
//           return <span className="text-xs text-gray-400">N/A</span>;
//         const completed = r.measurements.filter(
//           (m) => m.status === 'Completed'
//         ).length;
//         const total = r.measurements.length;
//         const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
//         return (
//           <div className="flex items-center gap-2">
//             <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
//               <div
//                 className={`h-full rounded-full transition-all ${
//                   pct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
//                 }`}
//                 style={{ width: `${pct}%` }}
//               />
//             </div>
//             <span className="text-xs text-gray-500 font-medium">
//               {completed}/{total}
//             </span>
//           </div>
//         );
//       },
//     },
//     { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
//     {
//       header: 'Result',
//       cell: (r) =>
//         r.passFail ? (
//           <StatusBadge status={r.passFail} />
//         ) : (
//           <span className="text-xs text-gray-400">—</span>
//         ),
//     },
//     {
//       header: 'Actions',
//       width: '140px',
//       align: 'left' as const,
//       cell: (r) => (
//         <div className="flex items-center justify-start gap-1">
//           {['Completed', 'Failed'].includes(r.status) && (
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setViewResultStudy(r);
//               }}
//               className="p-1.5 hover:bg-indigo-50 rounded-lg transition text-indigo-500"
//               title="View Results"
//             >
//               <Eye className="w-4 h-4" strokeWidth={2} />
//             </button>
//           )}
//           {r.status === 'In Progress' && canCreate && (
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 calculateResult(r.id);
//               }}
//               className="p-1.5 hover:bg-emerald-50 rounded-lg transition text-emerald-500"
//               title="Calculate Result"
//             >
//               <Calculator className="w-4 h-4" strokeWidth={2} />
//             </button>
//           )}
//           {r.passFail === 'Fail' && canCreate && !capaForStudy(r.id) && (
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 openCapaPrompt(r);
//               }}
//               className="p-1.5 hover:bg-amber-50 rounded-lg transition text-amber-500"
//               title="Create CAPA"
//             >
//               <AlertTriangle className="w-4 h-4" strokeWidth={2} />
//             </button>
//           )}
//           {r.passFail === 'Fail' && capaForStudy(r.id) && (
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 navigate('/capa');
//               }}
//               className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400"
//               title="View CAPA"
//             >
//               <ExternalLink className="w-4 h-4" strokeWidth={2} />
//             </button>
//           )}
//         </div>
//       ),
//     },
//   ];

//   // ═══════════════════════════════════════════════════════════════════
//   // RENDER
//   // ═══════════════════════════════════════════════════════════════════

//   const allTabs: { key: MainTab; label: string; icon: typeof BarChart3; badge?: number }[] = [
//     ...(canCreate
//       ? [
//           { key: 'studies' as MainTab, label: 'Studies', icon: BarChart3 },
//           {
//             key: 'measurements' as MainTab,
//             label: 'Measurements',
//             icon: ClipboardCheck,
//             badge: pendingStudies.length,
//           },
//           { key: 'results' as MainTab, label: 'Results', icon: CheckCircle2 },
//         ]
//       : []),
//     ...(isOperator || canCreate
//       ? [
//           {
//             key: 'my_tasks' as MainTab,
//             label: isOperator ? 'My Tasks' : 'Operator Tasks',
//             icon: ClipboardCheck,
//             badge: isOperator ? myTasks.length : undefined,
//           },
//         ]
//       : []),
//   ];

//   return (
//     <Layout pageTitle="MSA Studies">
//       {/* ─── Operator Welcome Banner ──────────────────────────────── */}
//       {isOperator && myTasks.length > 0 && (
//         <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-start gap-3">
//           <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
//             <ClipboardCheck className="w-5 h-5" strokeWidth={2} />
//           </div>
//           <div>
//             <p className="text-sm font-bold text-indigo-800">
//               You have {myTasks.length} MSA{' '}
//               {myTasks.length === 1 ? 'study' : 'studies'} assigned to you
//             </p>
//             <p className="text-xs text-indigo-600 mt-0.5">
//               Please enter your measurements for the gauges listed below.
//             </p>
//           </div>
//         </div>
//       )}

//       {/* ─── Stats Row ────────────────────────────────────────────── */}
//       {canCreate && (
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//           {stats.map((s) => {
//             const Icon = s.icon;
//             const active = statusFilter === s.key;
//             return (
//               <button
//                 key={s.label}
//                 onClick={() => {
//                   setStatusFilter(s.key);
//                   setMainTab('studies');
//                 }}
//                 className={`w-full bg-white rounded-xl p-4 shadow-sm border relative overflow-hidden text-left transition hover:shadow-md ${
//                   active
//                     ? 'border-indigo-300 ring-2 ring-indigo-100'
//                     : 'border-gray-100'
//                 }`}
//               >
//                 <div
//                   className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${s.accent}`}
//                 />
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
//                       {s.label}
//                     </p>
//                     <p className="text-2xl font-bold text-gray-800 mt-1">
//                       {s.value}
//                     </p>
//                   </div>
//                   <Icon className="w-5 h-5 text-gray-300" strokeWidth={2} />
//                 </div>
//               </button>
//             );
//           })}
//         </div>
//       )}

//       {/* ─── Main Tabs ────────────────────────────────────────────── */}
//       <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
//         <div className="flex gap-1 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100">
//           {allTabs.map((t) => {
//             const Icon = t.icon;
//             return (
//               <button
//                 key={t.key}
//                 onClick={() => setMainTab(t.key)}
//                 className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
//                   mainTab === t.key
//                     ? 'text-white shadow-md'
//                     : 'text-gray-600 hover:bg-gray-50'
//                 }`}
//                 style={
//                   mainTab === t.key
//                     ? {
//                         background:
//                           'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
//                       }
//                     : {}
//                 }
//               >
//                 <Icon className="w-4 h-4" strokeWidth={2} />
//                 {t.label}
//                 {t.badge !== undefined && t.badge > 0 && (
//                   <span
//                     className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
//                       mainTab === t.key
//                         ? 'bg-white/20 text-white'
//                         : 'bg-amber-100 text-amber-700'
//                     }`}
//                   >
//                     {t.badge}
//                   </span>
//                 )}
//               </button>
//             );
//           })}
//         </div>

//         {mainTab === 'studies' && canCreate && (
//           <div className="flex items-center gap-3">
//             {statusFilter !== 'all' && (
//               <button
//                 onClick={() => setStatusFilter('all')}
//                 className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold hover:bg-indigo-100 transition"
//               >
//                 {stats.find((s) => s.key === statusFilter)?.label}
//                 <X className="w-3.5 h-3.5" strokeWidth={2.5} />
//               </button>
//             )}
//             <select
//               value={studyTypeFilter}
//               onChange={(e) =>
//                 setStudyTypeFilter(e.target.value as StudyTypeFilter)
//               }
//               className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition appearance-none cursor-pointer"
//             >
//               <option value="all">All Types</option>
//               <option value="GRR">GR&R</option>
//               <option value="Linearity">Linearity</option>
//               <option value="Bias">Bias</option>
//               <option value="Uncertainty">Uncertainty</option>
//             </select>

//             <button
//               onClick={() => {
//                 resetCreateForm();
//                 setCreateOpen(true);
//               }}
//               className="flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition text-sm"
//               style={{
//                 background:
//                   'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
//               }}
//             >
//               <Plus className="w-4 h-4" strokeWidth={2.5} />
//               Create Study
//             </button>
//           </div>
//         )}
//       </div>

//       {/* ═══ TAB: STUDIES ═══════════════════════════════════════════ */}
//       {mainTab === 'studies' && (
//         <DataTable
//           columns={studyColumns}
//           data={filteredStudies}
//           keyExtractor={(r) => r.id}
//           onRowClick={(r) => {
//             if (
//               ['Pending Measurements', 'In Progress'].includes(r.status)
//             ) {
//               setSelectedStudyId(r.id);
//               setMainTab('measurements');
//             } else {
//               setViewResultStudy(r);
//             }
//           }}
//           emptyTitle="No MSA studies found"
//           emptySubtitle="Create a new study to get started."
//           emptyIcon={
//             <BarChart3 className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
//           }
//         />
//       )}

//       {/* ═══ TAB: MY TASKS (Operator View) ═════════════════════════ */}
//       {mainTab === 'my_tasks' && (
//         <div className="space-y-4">
//           {(isOperator ? myTasks : pendingStudies).length === 0 ? (
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
//               <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-full flex items-center justify-center mb-3">
//                 <CheckCircle2
//                   className="w-8 h-8 text-emerald-400"
//                   strokeWidth={1.5}
//                 />
//               </div>
//               <p className="text-sm font-semibold text-emerald-600">
//                 No pending tasks
//               </p>
//               <p className="text-xs text-gray-400 mt-1">
//                 {isOperator
//                   ? "You don't have any MSA studies assigned right now."
//                   : 'No studies are waiting for measurements.'}
//               </p>
//             </div>
//           ) : (
//             (isOperator ? myTasks : pendingStudies).map((study) => {
//               const gauge = gauges.find((g) => g.id === study.gaugeId);
//               const myMeasurement = study.measurements.find(
//                 (m) => m.operatorId === currentUserId
//               );
//               const myStatus = myMeasurement?.status || 'Pending';

//               return (
//                 <div
//                   key={study.id}
//                   className={`bg-white rounded-xl shadow-sm border p-5 transition ${
//                     myStatus === 'Completed'
//                       ? 'border-emerald-200'
//                       : 'border-amber-200 hover:shadow-md'
//                   }`}
//                 >
//                   <div className="flex items-center justify-between flex-wrap gap-4">
//                     <div className="flex items-center gap-4">
//                       <div
//                         className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${
//                           myStatus === 'Completed'
//                             ? 'bg-emerald-500'
//                             : 'bg-gradient-to-br from-indigo-500 to-purple-500'
//                         }`}
//                       >
//                         {myStatus === 'Completed' ? (
//                           <CheckCircle2 className="w-6 h-6" strokeWidth={2} />
//                         ) : (
//                           <BarChart3 className="w-6 h-6" strokeWidth={2} />
//                         )}
//                       </div>
//                       <div>
//                         <div className="flex items-center gap-2 flex-wrap">
//                           <span className="font-bold text-gray-800">
//                             {gauge?.gaugeCode} — {gauge?.name}
//                           </span>
//                           <StatusBadge status={study.studyType} />
//                         </div>
//                         <p className="text-sm text-gray-500 mt-0.5">
//                           {study.parts.length} parts × {study.numberOfTrials}{' '}
//                           trials
//                         </p>
//                         <p className="text-xs text-gray-400 mt-1">
//                           Created: {study.createdDate} by {study.createdBy}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-3">
//                       <StatusBadge status={myStatus} size="md" />
//                       {myStatus === 'Pending' && (
//                         <button
//                           onClick={() =>
//                             openMeasurementEntry(study, currentUserId)
//                           }
//                           className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl shadow-sm transition text-white hover:scale-105"
//                           style={{
//                             background:
//                               'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
//                           }}
//                         >
//                           <ClipboardCheck
//                             className="w-4 h-4"
//                             strokeWidth={2}
//                           />
//                           Enter Measurements
//                         </button>
//                       )}
//                       {myStatus === 'Completed' && (
//                         <button
//                           onClick={() =>
//                             openMeasurementEntry(study, currentUserId)
//                           }
//                           className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
//                         >
//                           <Eye className="w-4 h-4" strokeWidth={2} />
//                           View
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               );
//             })
//           )}
//         </div>
//       )}

//       {/* ═══ TAB: MEASUREMENTS (Admin View) ════════════════════════ */}
//       {mainTab === 'measurements' && (
//         <div>
//           {!selectedStudyId ? (
//             <div className="space-y-3">
//               <p className="text-sm text-gray-500 mb-4">
//                 Select a study to view/enter measurements:
//               </p>
//               {pendingStudies.length === 0 ? (
//                 <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
//                   <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-3">
//                     <ClipboardCheck
//                       className="w-8 h-8 text-gray-300"
//                       strokeWidth={1.5}
//                     />
//                   </div>
//                   <p className="text-sm font-semibold text-gray-500">
//                     No studies awaiting measurements
//                   </p>
//                 </div>
//               ) : (
//                 pendingStudies.map((study) => {
//                   const gauge = gauges.find((g) => g.id === study.gaugeId);
//                   const completed = study.measurements.filter(
//                     (m) => m.status === 'Completed'
//                   ).length;
//                   const total = study.measurements.length;
//                   return (
//                     <div
//                       key={study.id}
//                       onClick={() => setSelectedStudyId(study.id)}
//                       className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-indigo-200 transition cursor-pointer"
//                     >
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-4">
//                           <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md">
//                             <BarChart3 className="w-6 h-6" strokeWidth={2} />
//                           </div>
//                           <div>
//                             <div className="flex items-center gap-2">
//                               <span className="font-bold text-gray-800">
//                                 {gauge?.gaugeCode}
//                               </span>
//                               <StatusBadge status={study.studyType} />
//                               <StatusBadge status={study.status} />
//                             </div>
//                             <p className="text-sm text-gray-500 mt-0.5">
//                               {gauge?.name}
//                             </p>
//                             <p className="text-xs text-gray-400 mt-1">
//                               {study.operatorNames.length} operators ·{' '}
//                               {study.parts.length} parts · {study.numberOfTrials}{' '}
//                               trials
//                             </p>
//                           </div>
//                         </div>
//                         <div className="flex items-center gap-4">
//                           <div className="text-right">
//                             <p className="text-sm font-semibold text-gray-800">
//                               {completed}/{total}
//                             </p>
//                             <p className="text-xs text-gray-400">
//                               operators done
//                             </p>
//                           </div>
//                           <ChevronRight
//                             className="w-5 h-5 text-gray-300"
//                             strokeWidth={2}
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })
//               )}
//             </div>
//           ) : selectedStudy ? (
//             <div>
//               <button
//                 onClick={() => setSelectedStudyId(null)}
//                 className="text-sm text-gray-500 hover:text-indigo-600 transition mb-4 flex items-center gap-1"
//               >
//                 ← Back to study list
//               </button>

//               {/* Study Header */}
//               <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
//                 <div className="flex items-center justify-between flex-wrap gap-4">
//                   <div className="flex items-center gap-4">
//                     <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md">
//                       <BarChart3 className="w-6 h-6" strokeWidth={2} />
//                     </div>
//                     <div>
//                       <div className="flex items-center gap-2">
//                         <span className="font-bold text-gray-800">
//                           {getGaugeLabel(selectedStudy.gaugeId)}
//                         </span>
//                         <StatusBadge status={selectedStudy.studyType} />
//                       </div>
//                       <p className="text-xs text-gray-400 mt-1">
//                         {selectedStudy.parts.length} parts ×{' '}
//                         {selectedStudy.numberOfTrials} trials per operator
//                       </p>
//                     </div>
//                   </div>

//                   {selectedStudy.status === 'In Progress' && canCreate && (
//                     <button
//                       onClick={() => calculateResult(selectedStudy.id)}
//                       className="flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition text-sm bg-emerald-500 hover:bg-emerald-600"
//                     >
//                       <Calculator className="w-4 h-4" strokeWidth={2.5} />
//                       Calculate Result
//                     </button>
//                   )}
//                 </div>
//               </div>

//               {/* Operator Cards */}
//               <div className="space-y-3">
//                 {selectedStudy.measurements.map((m) => (
//                   <div
//                     key={m.operatorId}
//                     className={`bg-white rounded-xl shadow-sm border p-5 transition ${
//                       m.status === 'Completed'
//                         ? 'border-emerald-200'
//                         : 'border-amber-200'
//                     }`}
//                   >
//                     <div className="flex items-center justify-between mb-3">
//                       <div className="flex items-center gap-3">
//                         <div
//                           className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${
//                             m.status === 'Completed'
//                               ? 'bg-emerald-500'
//                               : 'bg-amber-500'
//                           }`}
//                         >
//                           {m.operatorName[0]?.toUpperCase()}
//                         </div>
//                         <div>
//                           <p className="font-semibold text-gray-800">
//                             {m.operatorName}
//                           </p>
//                           <p className="text-xs text-gray-400">
//                             {m.status === 'Completed'
//                               ? `Submitted ${
//                                   m.submittedAt
//                                     ? new Date(m.submittedAt).toLocaleString(
//                                         'en-IN',
//                                         {
//                                           day: '2-digit',
//                                           month: 'short',
//                                           hour: '2-digit',
//                                           minute: '2-digit',
//                                         }
//                                       )
//                                     : ''
//                                 }`
//                               : 'Awaiting measurements'}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <StatusBadge status={m.status} />
//                         <button
//                           onClick={() =>
//                             openMeasurementEntry(selectedStudy, m.operatorId)
//                           }
//                           className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
//                             m.status === 'Completed'
//                               ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                               : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
//                           }`}
//                         >
//                           {m.status === 'Completed' ? (
//                             <>
//                               <Eye className="w-3.5 h-3.5" strokeWidth={2} />
//                               View
//                             </>
//                           ) : (
//                             <>
//                               <ClipboardCheck
//                                 className="w-3.5 h-3.5"
//                                 strokeWidth={2}
//                               />
//                               Enter
//                             </>
//                           )}
//                         </button>
//                       </div>
//                     </div>

//                     {/* Show data grid if completed */}
//                     {m.status === 'Completed' && m.data.length > 0 && (
//                       <div className="overflow-x-auto mt-3 border border-gray-100 rounded-lg">
//                         <table className="min-w-full text-xs">
//                           <thead>
//                             <tr className="bg-gray-50">
//                               <th className="px-3 py-2 text-left font-bold text-gray-500 uppercase tracking-wider">
//                                 Part
//                               </th>
//                               {Array.from({
//                                 length: selectedStudy.numberOfTrials,
//                               }).map((_, i) => (
//                                 <th
//                                   key={i}
//                                   className="px-3 py-2 text-center font-bold text-gray-500 uppercase tracking-wider"
//                                 >
//                                   Trial {i + 1}
//                                 </th>
//                               ))}
//                             </tr>
//                           </thead>
//                           <tbody className="divide-y divide-gray-50">
//                             {m.data.map((row, pIdx) => (
//                               <tr key={pIdx} className="hover:bg-gray-50">
//                                 <td className="px-3 py-2 font-semibold text-gray-700">
//                                   {selectedStudy.parts[pIdx] ||
//                                     `Part ${pIdx + 1}`}
//                                 </td>
//                                 {row.map((val, tIdx) => (
//                                   <td
//                                     key={tIdx}
//                                     className="px-3 py-2 text-center font-mono text-gray-600"
//                                   >
//                                     {val.toFixed(3)}
//                                   </td>
//                                 ))}
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ) : null}
//         </div>
//       )}

//       {/* ═══ TAB: RESULTS ══════════════════════════════════════════ */}
//       {mainTab === 'results' && (
//         <div className="space-y-4">
//           {completedStudies.length === 0 ? (
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
//               <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-3">
//                 <CheckCircle2
//                   className="w-8 h-8 text-gray-300"
//                   strokeWidth={1.5}
//                 />
//               </div>
//               <p className="text-sm font-semibold text-gray-500">
//                 No results yet
//               </p>
//             </div>
//           ) : (
//             completedStudies.map((study) => {
//               const gauge = gauges.find((g) => g.id === study.gaugeId);
//               return (
//                 <div
//                   key={study.id}
//                   onClick={() => setViewResultStudy(study)}
//                   className={`bg-white rounded-xl shadow-sm border p-5 cursor-pointer hover:shadow-md transition overflow-hidden relative ${
//                     study.passFail === 'Fail'
//                       ? 'border-red-200'
//                       : study.passFail === 'Borderline'
//                       ? 'border-amber-200'
//                       : 'border-emerald-200'
//                   }`}
//                 >
//                   <div
//                     className={`absolute left-0 top-0 bottom-0 w-1 ${
//                       study.passFail === 'Fail'
//                         ? 'bg-red-500'
//                         : study.passFail === 'Borderline'
//                         ? 'bg-amber-500'
//                         : 'bg-emerald-500'
//                     }`}
//                   />
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-4">
//                       <div
//                         className={`w-14 h-14 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md ${
//                           study.passFail === 'Fail'
//                             ? 'bg-red-500'
//                             : study.passFail === 'Borderline'
//                             ? 'bg-amber-500'
//                             : 'bg-emerald-500'
//                         }`}
//                       >
//                         {study.studyType === 'GRR'
//                           ? `${study.resultValue}%`
//                           : study.resultValue}
//                       </div>
//                       <div>
//                         <div className="flex items-center gap-2">
//                           <span className="font-bold text-indigo-600">
//                             {gauge?.gaugeCode}
//                           </span>
//                           <StatusBadge status={study.studyType} />
//                           {study.passFail && (
//                             <StatusBadge status={study.passFail} />
//                           )}
//                         </div>
//                         <p className="text-sm text-gray-500">{gauge?.name}</p>
//                         <p className="text-xs text-gray-400 mt-0.5">
//                           Completed: {study.completedDate} ·{' '}
//                           {study.operatorNames.join(', ')}
//                         </p>
//                       </div>
//                     </div>
//                     <ChevronRight
//                       className="w-5 h-5 text-gray-300"
//                       strokeWidth={2}
//                     />
//                   </div>
//                 </div>
//               );
//             })
//           )}
//         </div>
//       )}

//       {/* ═══ CREATE STUDY MODAL ════════════════════════════════════ */}
//       <Modal
//         open={createOpen}
//         onClose={() => setCreateOpen(false)}
//         title="Create New MSA Study"
//         subtitle="Select gauge, operators (from registered users), parts, and trials"
//         maxWidth="xl"
//         footer={
//           <>
//             <button
//               onClick={() => setCreateOpen(false)}
//               className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleCreateStudy}
//               className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm"
//               style={{
//                 background:
//                   'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
//               }}
//             >
//               Create Study
//             </button>
//           </>
//         }
//       >
//         {createError && (
//           <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
//             <AlertCircle
//               className="w-4 h-4 flex-shrink-0 mt-0.5"
//               strokeWidth={2}
//             />
//             {createError}
//           </div>
//         )}

//         <div className="space-y-5">
//           {/* Study Type */}
//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-2">
//               Study Type
//             </label>
//             <div className="grid grid-cols-4 gap-2">
//               {(
//                 [
//                   {
//                     type: 'GRR' as const,
//                     label: 'GR&R',
//                     icon: BarChart3,
//                     desc: 'Repeatability & Reproducibility',
//                   },
//                   {
//                     type: 'Linearity' as const,
//                     label: 'Linearity',
//                     icon: TrendingUp,
//                     desc: 'Accuracy across range',
//                   },
//                   {
//                     type: 'Bias' as const,
//                     label: 'Bias',
//                     icon: Target,
//                     desc: 'Systematic offset',
//                   },
//                   {
//                     type: 'Uncertainty' as const,
//                     label: 'Uncertainty',
//                     icon: Activity,
//                     desc: 'Combined uncertainty',
//                   },
//                 ] as const
//               ).map((st) => {
//                 const Icon = st.icon;
//                 const selected = createType === st.type;
//                 return (
//                   <button
//                     key={st.type}
//                     onClick={() => setCreateType(st.type)}
//                     className={`p-3 rounded-xl border text-left transition ${
//                       selected
//                         ? 'border-indigo-300 bg-indigo-50 ring-2 ring-indigo-200'
//                         : 'border-gray-200 hover:border-indigo-200'
//                     }`}
//                   >
//                     <Icon
//                       className={`w-5 h-5 mb-1 ${
//                         selected ? 'text-indigo-600' : 'text-gray-400'
//                       }`}
//                       strokeWidth={2}
//                     />
//                     <p
//                       className={`text-sm font-semibold ${
//                         selected ? 'text-indigo-700' : 'text-gray-700'
//                       }`}
//                     >
//                       {st.label}
//                     </p>
//                     <p className="text-[10px] text-gray-400 mt-0.5">
//                       {st.desc}
//                     </p>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Gauge Selection */}
//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Select Gauge <span className="text-red-500">*</span>
//             </label>
//             <select
//               value={createGaugeId}
//               onChange={(e) => setCreateGaugeId(e.target.value)}
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
//             >
//               <option value="">Select a gauge</option>
//               {gauges
//                 .filter((g) => g.status === 'Available')
//                 .map((g) => (
//                   <option key={g.id} value={g.id}>
//                     {g.gaugeCode} — {g.name} ({g.type})
//                   </option>
//                 ))}
//             </select>
//           </div>

//           {/* ─── OPERATORS FROM BACKEND ──────────────────────────── */}
//           {createType !== 'Uncertainty' && (
//             <div>
//               <label className="block text-xs font-semibold text-gray-800 mb-2">
//                 Select Operators{' '}
//                 {createType === 'GRR' ? '(min 2)' : '(min 1)'}{' '}
//                 <span className="text-red-500">*</span>
//               </label>

//               {loadingOperators ? (
//                 <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
//                   <Loader2
//                     className="w-4 h-4 animate-spin"
//                     strokeWidth={2}
//                   />
//                   Loading operators from user database…
//                 </div>
//               ) : backendOperators.length === 0 ? (
//                 <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
//                   <AlertCircle
//                     className="w-4 h-4 inline mr-1"
//                     strokeWidth={2}
//                   />
//                   No operators found. Create users with{' '}
//                   <strong>Shop Floor Operator</strong>,{' '}
//                   <strong>Quality Engineer</strong>, or{' '}
//                   <strong>Store Keeper</strong> role in User Management first.
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//                   {backendOperators.map((op) => {
//                     const opId = String(op.id);
//                     const selected = selectedOperatorIds.includes(opId);
//                     return (
//                       <button
//                         key={op.id}
//                         onClick={() =>
//                           createType === 'GRR'
//                             ? toggleOperator(opId)
//                             : setSelectedOperatorIds(
//                                 selected ? [] : [opId]
//                               )
//                         }
//                         className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition text-left ${
//                           selected
//                             ? 'border-indigo-300 bg-indigo-50 ring-1 ring-indigo-200'
//                             : 'border-gray-200 hover:border-indigo-200'
//                         }`}
//                       >
//                         <div
//                           className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
//                             selected
//                               ? 'bg-indigo-500 text-white'
//                               : 'bg-gray-100 text-gray-500'
//                           }`}
//                         >
//                           {selected
//                             ? '✓'
//                             : op.full_name[0]?.toUpperCase()}
//                         </div>
//                         <div className="min-w-0">
//                           <p
//                             className={`text-xs font-semibold truncate ${
//                               selected
//                                 ? 'text-indigo-700'
//                                 : 'text-gray-700'
//                             }`}
//                           >
//                             {op.full_name}
//                           </p>
//                           <p className="text-[10px] text-gray-400 flex items-center gap-1 truncate">
//                             <Mail className="w-3 h-3" strokeWidth={2} />
//                             {op.email}
//                           </p>
//                           <p className="text-[10px] text-gray-400">
//                             {op.role_name} · {op.department_name || '—'}
//                           </p>
//                         </div>
//                       </button>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Parts — GRR only */}
//           {createType === 'GRR' && (
//             <>
//               <div>
//                 <label className="block text-xs font-semibold text-gray-800 mb-2">
//                   Select Parts (min 5){' '}
//                   <span className="text-red-500">*</span>
//                 </label>
//                 <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
//                   {parts.map((pt) => {
//                     const selected = selectedPartIds.includes(pt.id);
//                     return (
//                       <button
//                         key={pt.id}
//                         onClick={() => togglePart(pt.id)}
//                         className={`p-2 rounded-lg border text-center text-xs transition ${
//                           selected
//                             ? 'border-indigo-300 bg-indigo-50 text-indigo-700 font-bold'
//                             : 'border-gray-200 text-gray-600 hover:border-indigo-200'
//                         }`}
//                       >
//                         {pt.partName}
//                         <p className="text-[10px] text-gray-400 truncate">
//                           {pt.description}
//                         </p>
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//                   Number of Trials
//                 </label>
//                 <div className="flex gap-2">
//                   {[2, 3].map((n) => (
//                     <button
//                       key={n}
//                       onClick={() => setNumberOfTrials(n)}
//                       className={`px-6 py-2.5 rounded-lg border font-semibold text-sm transition ${
//                         numberOfTrials === n
//                           ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
//                           : 'border-gray-200 text-gray-600'
//                       }`}
//                     >
//                       {n} Trials
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </>
//           )}

//           {/* Linearity Fields */}
//           {createType === 'Linearity' && (
//             <>
//               <div>
//                 <label className="block text-xs font-semibold text-gray-800 mb-2">
//                   Reference Values (min 3){' '}
//                   <span className="text-red-500">*</span>
//                 </label>
//                 <div className="space-y-2">
//                   {linRefValues.map((val, i) => (
//                     <div key={i} className="flex items-center gap-2">
//                       <span className="text-xs text-gray-400 w-12">
//                         Ref {i + 1}
//                       </span>
//                       <input
//                         type="number"
//                         step="any"
//                         value={val}
//                         onChange={(e) => {
//                           const newVals = [...linRefValues];
//                           newVals[i] = e.target.value;
//                           setLinRefValues(newVals);
//                         }}
//                         className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//                         placeholder="e.g. 50.000"
//                       />
//                       {linRefValues.length > 1 && (
//                         <button
//                           onClick={() =>
//                             setLinRefValues(
//                               linRefValues.filter((_, j) => j !== i)
//                             )
//                           }
//                           className="text-red-400 hover:text-red-600 text-xs"
//                         >
//                           ✕
//                         </button>
//                       )}
//                     </div>
//                   ))}
//                   <button
//                     onClick={() => setLinRefValues([...linRefValues, ''])}
//                     className="text-xs text-indigo-600 font-semibold hover:text-indigo-700"
//                   >
//                     + Add reference point
//                   </button>
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//                   Number of Trials per point
//                 </label>
//                 <div className="flex gap-2">
//                   {[2, 3].map((n) => (
//                     <button
//                       key={n}
//                       onClick={() => setNumberOfTrials(n)}
//                       className={`px-6 py-2.5 rounded-lg border font-semibold text-sm transition ${
//                         numberOfTrials === n
//                           ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
//                           : 'border-gray-200 text-gray-600'
//                       }`}
//                     >
//                       {n} Trials
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </>
//           )}

//           {/* Bias Fields */}
//           {createType === 'Bias' && (
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//                   Reference Value <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="number"
//                   step="any"
//                   value={biasRef}
//                   onChange={(e) => setBiasRef(e.target.value)}
//                   placeholder="e.g. 25.000"
//                   className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//                   Number of Readings
//                 </label>
//                 <input
//                   type="number"
//                   min={5}
//                   max={30}
//                   value={biasReadingsCount}
//                   onChange={(e) =>
//                     setBiasReadingsCount(parseInt(e.target.value) || 10)
//                   }
//                   className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//                 />
//               </div>
//             </div>
//           )}

//           {/* Uncertainty Fields */}
//           {createType === 'Uncertainty' && (
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//                   GR&R Component <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="number"
//                   step="any"
//                   value={uncGrrComp}
//                   onChange={(e) => setUncGrrComp(e.target.value)}
//                   placeholder="e.g. 0.03"
//                   className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//                   Standard Uncertainty{' '}
//                   <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="number"
//                   step="any"
//                   value={uncStdUnc}
//                   onChange={(e) => setUncStdUnc(e.target.value)}
//                   placeholder="e.g. 0.02"
//                   className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//                 />
//               </div>
//               <div className="col-span-2 bg-indigo-50 rounded-xl p-3 text-xs text-indigo-700">
//                 Combined = √(GRR² + StdUnc²). Result calculated
//                 immediately.
//               </div>
//             </div>
//           )}
//         </div>
//       </Modal>

//       {/* ═══ MEASUREMENT ENTRY MODAL ═══════════════════════════════ */}
//       <Modal
//         open={measureModalOpen}
//         onClose={() => setMeasureModalOpen(false)}
//         title="Enter Measurements"
//         subtitle={`Operator: ${
//           selectedStudy?.measurements.find(
//             (m) => m.operatorId === measureOperatorId
//           )?.operatorName || ''
//         }`}
//         maxWidth="2xl"
//         footer={
//           <>
//             <button
//               onClick={() => setMeasureModalOpen(false)}
//               className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={submitMeasurements}
//               className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm"
//               style={{
//                 background:
//                   'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
//               }}
//             >
//               Submit Measurements
//             </button>
//           </>
//         }
//       >
//         {selectedStudy && (
//           <div className="overflow-x-auto">
//             <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
//               <thead>
//                 <tr
//                   style={{
//                     background:
//                       'linear-gradient(90deg, #f8f7ff 0%, #f5f3ff 100%)',
//                   }}
//                 >
//                   <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 border-b">
//                     {selectedStudy.studyType === 'Bias'
//                       ? 'Reading #'
//                       : 'Part'}
//                   </th>
//                   {Array.from({
//                     length: selectedStudy.numberOfTrials,
//                   }).map((_, i) => (
//                     <th
//                       key={i}
//                       className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-500 border-b"
//                     >
//                       Trial {i + 1}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {measureGrid.map((row, pIdx) => (
//                   <tr key={pIdx} className="hover:bg-gray-50">
//                     <td className="px-4 py-2 font-semibold text-gray-700 text-xs">
//                       {selectedStudy.studyType === 'Bias'
//                         ? `Reading ${pIdx + 1}`
//                         : selectedStudy.parts[pIdx] || `Part ${pIdx + 1}`}
//                     </td>
//                     {row.map((val, tIdx) => (
//                       <td key={tIdx} className="px-2 py-2">
//                         <input
//                           type="number"
//                           step="any"
//                           value={val || ''}
//                           onChange={(e) =>
//                             updateMeasureCell(
//                               pIdx,
//                               tIdx,
//                               e.target.value
//                             )
//                           }
//                           className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm text-center font-mono"
//                           placeholder="0.000"
//                         />
//                       </td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {selectedStudy.studyType === 'Linearity' &&
//               selectedStudy.referenceValues && (
//                 <div className="mt-3 bg-indigo-50 rounded-lg p-3 text-xs text-indigo-700">
//                   <strong>Reference values:</strong>{' '}
//                   {selectedStudy.referenceValues
//                     .map((v, i) => `Ref ${i + 1} = ${v}`)
//                     .join(', ')}
//                 </div>
//               )}

//             {selectedStudy.studyType === 'Bias' &&
//               selectedStudy.biasReferenceValue !== undefined && (
//                 <div className="mt-3 bg-indigo-50 rounded-lg p-3 text-xs text-indigo-700">
//                   <strong>Reference value:</strong>{' '}
//                   {selectedStudy.biasReferenceValue}
//                 </div>
//               )}
//           </div>
//         )}
//       </Modal>

//       {/* ═══ VIEW RESULT MODAL ═════════════════════════════════════ */}
//       <Modal
//         open={!!viewResultStudy}
//         onClose={() => setViewResultStudy(null)}
//         title="Study Result"
//         subtitle={
//           viewResultStudy
//             ? getGaugeLabel(viewResultStudy.gaugeId)
//             : ''
//         }
//         maxWidth="lg"
//         footer={
//           <>
//             {viewResultStudy?.passFail === 'Fail' &&
//               canCreate &&
//               !capaForStudy(viewResultStudy.id) && (
//                 <button
//                   onClick={() => {
//                     const study = viewResultStudy;
//                     setViewResultStudy(null);
//                     if (study) openCapaPrompt(study);
//                   }}
//                   className="mr-auto px-4 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm bg-amber-500 hover:bg-amber-600 flex items-center gap-2"
//                 >
//                   <AlertTriangle className="w-4 h-4" strokeWidth={2} />
//                   Create CAPA
//                 </button>
//               )}
//             {viewResultStudy?.passFail === 'Fail' &&
//               capaForStudy(viewResultStudy.id) && (
//                 <button
//                   onClick={() => navigate('/capa')}
//                   className="mr-auto px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm flex items-center gap-2"
//                 >
//                   <ExternalLink className="w-4 h-4" strokeWidth={2} />
//                   View CAPA
//                 </button>
//               )}
//             <button
//               onClick={() => setViewResultStudy(null)}
//               className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm"
//             >
//               Close
//             </button>
//           </>
//         }
//       >
//         {viewResultStudy && (
//           <div className="space-y-4">
//             <div className="flex items-center gap-3">
//               <StatusBadge status={viewResultStudy.studyType} size="md" />
//               {viewResultStudy.passFail && (
//                 <StatusBadge
//                   status={viewResultStudy.passFail}
//                   size="md"
//                 />
//               )}
//               <StatusBadge status={viewResultStudy.status} size="md" />
//             </div>

//             <div
//               className={`rounded-xl p-6 text-center ${
//                 viewResultStudy.passFail === 'Fail'
//                   ? 'bg-red-50'
//                   : viewResultStudy.passFail === 'Borderline'
//                   ? 'bg-amber-50'
//                   : 'bg-emerald-50'
//               }`}
//             >
//               <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">
//                 {viewResultStudy.studyType === 'GRR'
//                   ? '%GR&R'
//                   : 'Result Value'}
//               </p>
//               <p
//                 className={`text-5xl font-bold ${
//                   viewResultStudy.passFail === 'Fail'
//                     ? 'text-red-600'
//                     : viewResultStudy.passFail === 'Borderline'
//                     ? 'text-amber-600'
//                     : 'text-emerald-600'
//                 }`}
//               >
//                 {viewResultStudy.resultValue !== undefined
//                   ? viewResultStudy.studyType === 'GRR'
//                     ? `${viewResultStudy.resultValue}%`
//                     : viewResultStudy.resultValue
//                   : '—'}
//               </p>
//             </div>

//             <div className="grid grid-cols-2 gap-3">
//               <div className="bg-gray-50 rounded-xl p-3">
//                 <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
//                   Operators
//                 </p>
//                 <p className="text-sm font-semibold text-gray-800 mt-1">
//                   {viewResultStudy.operatorNames.join(', ')}
//                 </p>
//               </div>
//               <div className="bg-gray-50 rounded-xl p-3">
//                 <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
//                   Config
//                 </p>
//                 <p className="text-sm font-semibold text-gray-800 mt-1">
//                   {viewResultStudy.parts.length} parts ×{' '}
//                   {viewResultStudy.numberOfTrials} trials
//                 </p>
//               </div>
//               <div className="bg-gray-50 rounded-xl p-3">
//                 <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
//                   Created
//                 </p>
//                 <p className="text-sm font-semibold text-gray-800 mt-1">
//                   {viewResultStudy.createdDate}
//                 </p>
//               </div>
//               <div className="bg-gray-50 rounded-xl p-3">
//                 <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
//                   Completed
//                 </p>
//                 <p className="text-sm font-semibold text-gray-800 mt-1">
//                   {viewResultStudy.completedDate || '—'}
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}
//       </Modal>

//       {/* ═══ CAPA PROMPT ═══════════════════════════════════════════ */}
//       <Modal
//         open={!!capaPrompt}
//         onClose={() => setCapaPrompt(null)}
//         title="MSA Study Failed — Create CAPA"
//         subtitle={
//           capaPrompt
//             ? `Gauge: ${getGaugeLabel(capaPrompt.gaugeId)}`
//             : ''
//         }
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
//               onClick={createCapaFromMSA}
//               className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md transition text-sm bg-amber-500 hover:bg-amber-600 flex items-center gap-2"
//             >
//               <AlertTriangle className="w-4 h-4" strokeWidth={2} />
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
//           This MSA study <strong>FAILED</strong>. The gauge has been{' '}
//           <strong>quarantined</strong>.
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
//             />
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//                 Responsible Person{' '}
//                 <span className="text-red-500">*</span>
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
//                   setCapaForm({
//                     ...capaForm,
//                     targetDate: e.target.value,
//                   })
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


// src/pages/MSA.tsx

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import DataTable, { type Column } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { operatorsAPI, type GaugeUser } from '../api/api';
import {
  msaStorage,
  gaugeStorage,
  partStorage,
  capaStorage,
  auditStorage,
  type MSAStudy,
  type MSAOperatorMeasurement,
  type Part,
} from '../utils/storage';
import {
  calculateGRR,
  calculateBias,
  calculateLinearity,
  calculateUncertainty,
} from '../utils/msaCalculations';
import {
  BarChart3,
  Plus,
  AlertCircle,
  AlertTriangle,
  ClipboardCheck,
  Users,
  Eye,
  Calculator,
  CheckCircle2,
  Clock,
  TrendingUp,
  Target,
  Activity,
  ChevronRight,
  Mail,
  Loader2,
  ExternalLink,
  X,
  Package,
  Ruler,
  Info,
} from 'lucide-react';

type MainTab = 'studies' | 'measurements' | 'results' | 'my_tasks';
type StudyTypeFilter = 'all' | 'GRR' | 'Linearity' | 'Bias' | 'Uncertainty';
type StatCardFilter = 'all' | 'pending' | 'passed' | 'failed';

export default function MSA() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [studies, setStudies] = useState<MSAStudy[]>(msaStorage.getAll());
  const [mainTab, setMainTab] = useState<MainTab>(
    user?.role_code === 'shop_floor_operator' ? 'my_tasks' : 'studies'
  );
  const [studyTypeFilter, setStudyTypeFilter] = useState<StudyTypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatCardFilter>('all');

  // Backend operators
  const [backendOperators, setBackendOperators] = useState<GaugeUser[]>([]);
  const [loadingOperators, setLoadingOperators] = useState(false);

  // Create Study Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createType, setCreateType] = useState<MSAStudy['studyType']>('GRR');
  const [createGaugeId, setCreateGaugeId] = useState('');
  const [selectedOperatorIds, setSelectedOperatorIds] = useState<string[]>([]);
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>([]);
  const [numberOfTrials, setNumberOfTrials] = useState(3);
  const [createError, setCreateError] = useState('');

  // Bias-specific
  const [biasPartId, setBiasPartId] = useState('');
  const [biasReadingsCount, setBiasReadingsCount] = useState(10);

  // Uncertainty-specific — link to GRR study
  const [uncLinkedGrrId, setUncLinkedGrrId] = useState('');
  const [uncStdUnc, setUncStdUnc] = useState('');
  const [uncResolution, setUncResolution] = useState('');
  const [uncCoverageFactor, setUncCoverageFactor] = useState(2);

  // Measurements tab
  const [selectedStudyId, setSelectedStudyId] = useState<string | null>(null);

  // Measurement entry modal
  const [measureModalOpen, setMeasureModalOpen] = useState(false);
  const [measureOperatorId, setMeasureOperatorId] = useState('');
  const [measureGrid, setMeasureGrid] = useState<number[][]>([]);

  // CAPA prompt
  const [capaPrompt, setCapaPrompt] = useState<MSAStudy | null>(null);
  const [capaForm, setCapaForm] = useState({
    rootCause: '',
    correctiveAction: '',
    responsiblePerson: '',
    targetDate: '',
  });

  // View result modal
  const [viewResultStudy, setViewResultStudy] = useState<MSAStudy | null>(null);

  const gauges = gaugeStorage.getAll();
  const parts = partStorage.getAll().filter((p) => p.isActive);
  const capas = capaStorage.getAll();
  const reload = () => setStudies(msaStorage.getAll());

  const capaForStudy = (studyId: string) =>
    capas.find((c) => c.sourceType === 'MSA' && c.sourceId === studyId);

  const openCapaPrompt = (study: MSAStudy) => {
    setCapaForm({
      rootCause: '',
      correctiveAction: '',
      responsiblePerson: '',
      targetDate: '',
    });
    setCapaPrompt(study);
  };

  const isAdmin = user?.role_code === 'admin';
  const isQE = user?.role_code === 'quality_engineer';
  const isOperator = user?.role_code === 'shop_floor_operator' || user?.role_code === 'store_keeper';
  const canCreate = isAdmin || isQE;
  const currentUserId = user?.id ? String(user.id) : '';

  // ─── Load Backend Operators ───────────────────────────────────────
  useEffect(() => {
    const loadOperators = async () => {
      setLoadingOperators(true);
      try {
        const ops = await operatorsAPI.list();
        setBackendOperators(ops);
      } catch (err) {
        console.error('Failed to load operators:', err);
      } finally {
        setLoadingOperators(false);
      }
    };
    loadOperators();
  }, []);

  const getGaugeLabel = (gaugeId: string) => {
    const g = gauges.find((x) => x.id === gaugeId);
    return g ? `${g.gaugeCode} — ${g.name}` : '—';
  };

  // Completed GRR studies (for linking to Uncertainty)
  const completedGrrStudies = useMemo(
    () =>
      studies.filter(
        (s) =>
          s.studyType === 'GRR' &&
          s.status === 'Completed' &&
          s.passFail !== 'Fail' &&
          s.ev !== undefined &&
          s.av !== undefined
      ),
    [studies]
  );

  // ─── Filtered Studies ─────────────────────────────────────────────
  const filteredStudies = useMemo(() => {
    let list = studies;
    if (studyTypeFilter !== 'all') {
      list = list.filter((s) => s.studyType === studyTypeFilter);
    }
    if (statusFilter === 'pending') {
      list = list.filter((s) => s.status === 'Pending Measurements');
    } else if (statusFilter === 'passed') {
      list = list.filter((s) => s.passFail === 'Pass');
    } else if (statusFilter === 'failed') {
      list = list.filter((s) => s.passFail === 'Fail');
    }
    return list.sort(
      (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    );
  }, [studies, studyTypeFilter, statusFilter]);

  const pendingStudies = useMemo(
    () => studies.filter((s) => ['Pending Measurements', 'In Progress'].includes(s.status)),
    [studies]
  );

  const completedStudies = useMemo(
    () => studies.filter((s) => ['Completed', 'Failed'].includes(s.status)),
    [studies]
  );

  const myTasks = useMemo(
    () =>
      studies.filter(
        (s) =>
          s.operatorIds.includes(currentUserId) &&
          ['Pending Measurements', 'In Progress'].includes(s.status)
      ),
    [studies, currentUserId]
  );

  const selectedStudy = selectedStudyId ? msaStorage.getById(selectedStudyId) : null;

  // ─── Stats ────────────────────────────────────────────────────────
  const stats: {
    key: StatCardFilter;
    label: string;
    value: number;
    accent: string;
    icon: typeof BarChart3;
  }[] = [
    { key: 'all', label: 'Total Studies', value: studies.length, accent: 'from-indigo-500 to-purple-500', icon: BarChart3 },
    { key: 'pending', label: 'Pending', value: studies.filter((s) => s.status === 'Pending Measurements').length, accent: 'from-amber-500 to-yellow-500', icon: Clock },
    { key: 'passed', label: 'Passed', value: studies.filter((s) => s.passFail === 'Pass').length, accent: 'from-emerald-500 to-teal-500', icon: CheckCircle2 },
    { key: 'failed', label: 'Failed', value: studies.filter((s) => s.passFail === 'Fail').length, accent: 'from-red-500 to-rose-500', icon: AlertTriangle },
  ];

  // ═══════════════════════════════════════════════════════════════════
  // CREATE STUDY
  // ═══════════════════════════════════════════════════════════════════

  const resetCreateForm = () => {
    setCreateType('GRR');
    setCreateGaugeId('');
    setSelectedOperatorIds([]);
    setSelectedPartIds([]);
    setNumberOfTrials(3);
    setBiasPartId('');
    setBiasReadingsCount(10);
    setUncLinkedGrrId('');
    setUncStdUnc('');
    setUncResolution('');
    setUncCoverageFactor(2);
    setCreateError('');
  };

  const handleCreateStudy = () => {
    if (!createGaugeId) {
      setCreateError('Select a gauge.');
      return;
    }

    if (createType === 'GRR') {
      if (selectedOperatorIds.length < 2) {
        setCreateError('Select at least 2 operators for GR&R.');
        return;
      }
      if (selectedPartIds.length < 5) {
        setCreateError('Select at least 5 parts for GR&R.');
        return;
      }
    }

    if (createType === 'Linearity') {
      if (selectedOperatorIds.length < 1) {
        setCreateError('Select at least 1 operator.');
        return;
      }
      if (selectedPartIds.length < 3) {
        setCreateError('Select at least 3 reference parts spanning the range.');
        return;
      }
    }

    if (createType === 'Bias') {
      if (selectedOperatorIds.length < 1) {
        setCreateError('Select at least 1 operator.');
        return;
      }
      if (!biasPartId) {
        setCreateError('Select a reference part with known true value.');
        return;
      }
    }

    if (createType === 'Uncertainty') {
      if (!uncLinkedGrrId) {
        setCreateError('Select a completed GR&R study to pull EV/AV from.');
        return;
      }
      if (!uncStdUnc || isNaN(Number(uncStdUnc))) {
        setCreateError('Enter valid standard uncertainty from calibration cert.');
        return;
      }
      if (!uncResolution || isNaN(Number(uncResolution))) {
        setCreateError('Enter valid gauge resolution.');
        return;
      }
    }

    // Build operator names
    const operatorNames = selectedOperatorIds.map((id) => {
      const op = backendOperators.find((o) => String(o.id) === id);
      return op?.full_name || `User ${id}`;
    });

    const measurements: MSAOperatorMeasurement[] = selectedOperatorIds.map((id) => ({
      operatorId: id,
      operatorName:
        backendOperators.find((o) => String(o.id) === id)?.full_name || `User ${id}`,
      status: 'Pending' as const,
      data: [],
    }));

    // Build part IDs and names based on study type
    let partIds: string[] = [];
    let partNames: string[] = [];
    let referenceValues: number[] | undefined = undefined;
    let biasRefValue: number | undefined = undefined;

    if (createType === 'GRR') {
      partIds = selectedPartIds;
      partNames = selectedPartIds.map(
        (id) => parts.find((p) => p.id === id)?.partName || id
      );
    } else if (createType === 'Linearity') {
      partIds = selectedPartIds;
      partNames = selectedPartIds.map(
        (id) => parts.find((p) => p.id === id)?.partName || id
      );
      referenceValues = selectedPartIds.map(
        (id) => parts.find((p) => p.id === id)?.trueValue || 0
      );
    } else if (createType === 'Bias') {
      const biasPart = parts.find((p) => p.id === biasPartId);
      partIds = [biasPartId];
      partNames = [biasPart?.partName || 'Reference Part'];
      biasRefValue = biasPart?.trueValue;
    } else if (createType === 'Uncertainty') {
      // Uncertainty uses linked GRR data, no measurements needed
      partIds = [];
      partNames = ['(from linked GR&R)'];
    }

    // Handle Uncertainty — calculate immediately using linked GRR
    let uncertaintyResults = {};
    if (createType === 'Uncertainty') {
      const linkedGrr = studies.find((s) => s.id === uncLinkedGrrId);
      if (linkedGrr && linkedGrr.ev !== undefined && linkedGrr.av !== undefined) {
        const result = calculateUncertainty(
          linkedGrr.ev,
          linkedGrr.av,
          Number(uncStdUnc),
          Number(uncResolution),
          uncCoverageFactor
        );
        uncertaintyResults = {
          resultValue: result.expandedUncertainty,
          passFail: result.passFail,
          uRepeatability: result.uRepeatability,
          uReproducibility: result.uReproducibility,
          uReference: result.uReference,
          uResolution: result.uResolution,
          combinedUncertainty: result.combinedUncertainty,
          expandedUncertainty: result.expandedUncertainty,
          coverageFactor: result.coverageFactor,
          completedDate: new Date().toISOString().split('T')[0],
        };
      }
    }

    const newStudy = msaStorage.add({
      gaugeId: createGaugeId,
      studyType: createType,
      operatorIds: selectedOperatorIds,
      operatorNames,
      partIds,
      parts: partNames,
      numberOfTrials: createType === 'Uncertainty' ? 1 : numberOfTrials,
      referenceValues,
      biasReferenceValue: biasRefValue,
      biasNumberOfReadings:
        createType === 'Bias' ? biasReadingsCount : undefined,
      linkedGrrStudyId:
        createType === 'Uncertainty' ? uncLinkedGrrId : undefined,
      standardUncertainty:
        createType === 'Uncertainty' ? Number(uncStdUnc) : undefined,
      resolution:
        createType === 'Uncertainty' ? Number(uncResolution) : undefined,
      status:
        createType === 'Uncertainty' ? 'Completed' : 'Pending Measurements',
      measurements: createType === 'Uncertainty' ? [] : measurements,
      createdBy: user?.full_name || 'Admin',
      createdDate: new Date().toISOString().split('T')[0],
      ...uncertaintyResults,
    });

    if (createType !== 'Uncertainty') {
      gaugeStorage.update(createGaugeId, { status: 'Under MSA Study' });
    }

    auditStorage.add({
      action: 'CREATE',
      entityType: 'MSAStudy',
      entityId: newStudy.id,
      userId: currentUserId,
      timestamp: new Date().toISOString(),
    });

    reload();
    setCreateOpen(false);
    resetCreateForm();

    if (createType === 'Uncertainty' && newStudy.passFail === 'Fail') {
      openCapaPrompt(newStudy);
    }
  };

  const toggleOperator = (id: string) => {
    setSelectedOperatorIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const togglePart = (id: string) => {
    setSelectedPartIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ═══════════════════════════════════════════════════════════════════
  // MEASUREMENT ENTRY
  // ═══════════════════════════════════════════════════════════════════

  const openMeasurementEntry = (study: MSAStudy, operatorId: string) => {
    const numParts =
      study.studyType === 'Bias'
        ? study.biasNumberOfReadings || 10
        : study.parts.length;
    const numTrials = study.numberOfTrials;

    const existing = study.measurements.find((m) => m.operatorId === operatorId);
    if (existing && existing.data.length > 0) {
      setMeasureGrid(existing.data);
    } else {
      setMeasureGrid(
        Array.from({ length: numParts }, () =>
          Array.from({ length: numTrials }, () => 0)
        )
      );
    }

    setMeasureOperatorId(operatorId);
    setSelectedStudyId(study.id);
    setMeasureModalOpen(true);
  };

  const updateMeasureCell = (partIdx: number, trialIdx: number, value: string) => {
    const newGrid = measureGrid.map((row) => [...row]);
    newGrid[partIdx][trialIdx] = parseFloat(value) || 0;
    setMeasureGrid(newGrid);
  };

  const submitMeasurements = () => {
    if (!selectedStudyId || !measureOperatorId) return;
    const study = msaStorage.getById(selectedStudyId);
    if (!study) return;

    const updatedMeasurements = study.measurements.map((m) =>
      m.operatorId === measureOperatorId
        ? {
            ...m,
            status: 'Completed' as const,
            data: measureGrid,
            submittedAt: new Date().toISOString(),
          }
        : m
    );

    const allCompleted = updatedMeasurements.every(
      (m) => m.status === 'Completed'
    );
    const newStatus = allCompleted ? 'In Progress' : 'Pending Measurements';

    msaStorage.update(selectedStudyId, {
      measurements: updatedMeasurements,
      status: newStatus as MSAStudy['status'],
    });

    auditStorage.add({
      action: 'UPDATE',
      entityType: 'MSAStudy',
      entityId: selectedStudyId,
      userId: measureOperatorId,
      timestamp: new Date().toISOString(),
    });

    reload();
    setMeasureModalOpen(false);
  };

  // ═══════════════════════════════════════════════════════════════════
  // CALCULATE RESULTS — Uses real AIAG formulas
  // ═══════════════════════════════════════════════════════════════════

  const calculateResult = (studyId: string) => {
    const study = msaStorage.getById(studyId);
    if (!study) return;

    let updates: Partial<MSAStudy> = {};

    // ─── GR&R Calculation ─────────────────────────────────────────
    if (study.studyType === 'GRR') {
      // Build 3D data array: data[appraiser][part][trial]
      const data: number[][][] = study.measurements.map((m) => m.data);

      const result = calculateGRR(
        data,
        study.numberOfTrials,
        study.parts.length,
        study.measurements.length
      );

      updates = {
        resultValue: result.grrPercent,
        passFail: result.passFail,
        ev: result.ev,
        av: result.av,
        grr: result.grr,
        pv: result.pv,
        tv: result.tv,
        evPercent: result.evPercent,
        avPercent: result.avPercent,
        grrPercent: result.grrPercent,
        pvPercent: result.pvPercent,
        ndc: result.ndc,
      };
    }

    // ─── Bias Calculation ─────────────────────────────────────────
    if (study.studyType === 'Bias') {
      const readings = study.measurements[0]?.data.flat() || [];
      const refValue = study.biasReferenceValue || 0;

      if (readings.length === 0 || refValue === 0) return;

      const result = calculateBias(readings, refValue);

      updates = {
        resultValue: result.bias,
        passFail: result.passFail,
        biasValue: result.bias,
        biasTStatistic: result.tStatistic,
        biasSignificant: result.significant,
        biasStdDev: result.stdDev,
      };
    }

    // ─── Linearity Calculation ────────────────────────────────────
    if (study.studyType === 'Linearity') {
      const refs = study.referenceValues || [];
      const measurements = study.measurements[0]?.data || [];

      if (refs.length === 0 || measurements.length === 0) return;

      const result = calculateLinearity(refs, measurements);

      updates = {
        resultValue: result.maxBias,
        passFail: result.passFail,
        linearitySlope: result.slope,
        linearityIntercept: result.intercept,
        linearityRSquared: result.rSquared,
        linearityMaxBias: result.maxBias,
        linearityPointResults: result.pointResults,
      };
    }

    updates.status = updates.passFail === 'Fail' ? 'Failed' : 'Completed';
    updates.completedDate = new Date().toISOString().split('T')[0];

    msaStorage.update(studyId, updates);

    // Update gauge status
    const gauge = gauges.find((g) => g.id === study.gaugeId);
    if (gauge) {
      if (updates.passFail === 'Fail') {
        gaugeStorage.update(gauge.id, { status: 'Under Review' });
      } else {
        gaugeStorage.update(gauge.id, { status: 'Available' });
      }
    }

    auditStorage.add({
      action: 'UPDATE',
      entityType: 'MSAStudy',
      entityId: studyId,
      userId: currentUserId,
      timestamp: new Date().toISOString(),
    });

    reload();

    const updatedStudy = msaStorage.getById(studyId);
    if (updatedStudy && updates.passFail === 'Fail') {
      openCapaPrompt(updatedStudy);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // CREATE CAPA
  // ═══════════════════════════════════════════════════════════════════

  const createCapaFromMSA = () => {
    if (!capaPrompt) return;
    if (
      !capaForm.rootCause ||
      !capaForm.responsiblePerson ||
      !capaForm.targetDate
    )
      return;

    capaStorage.add({
      sourceType: 'MSA',
      sourceId: capaPrompt.id,
      gaugeId: capaPrompt.gaugeId,
      rootCause: capaForm.rootCause,
      correctiveAction: capaForm.correctiveAction,
      responsiblePerson: capaForm.responsiblePerson,
      targetDate: capaForm.targetDate,
      status: 'Open',
    });

    gaugeStorage.update(capaPrompt.gaugeId, { status: 'Under Review' });

    setCapaPrompt(null);
    setCapaForm({
      rootCause: '',
      correctiveAction: '',
      responsiblePerson: '',
      targetDate: '',
    });
    reload();
  };

  // ═══════════════════════════════════════════════════════════════════
  // TABLE COLUMNS
  // ═══════════════════════════════════════════════════════════════════

  const studyColumns: Column<MSAStudy>[] = [
    { header: 'Date', cell: (r) => <span className="text-sm">{r.createdDate}</span> },
    {
      header: 'Gauge',
      cell: (r) => {
        const g = gauges.find((x) => x.id === r.gaugeId);
        return (
          <div>
            <span className="font-bold text-indigo-600">{g?.gaugeCode || '—'}</span>
            <p className="text-xs text-gray-400">{g?.name}</p>
          </div>
        );
      },
    },
    { header: 'Type', cell: (r) => <StatusBadge status={r.studyType} /> },
    {
      header: 'Operators',
      cell: (r) => (
        <div className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
          <span className="text-sm">{r.operatorNames.length}</span>
        </div>
      ),
    },
    {
      header: 'Config',
      cell: (r) => (
        <span className="text-sm text-gray-500">
          {r.studyType === 'Uncertainty'
            ? '(linked GR&R)'
            : `${r.parts.length} parts × ${r.numberOfTrials} trials`}
        </span>
      ),
    },
    {
      header: 'Progress',
      cell: (r) => {
        if (r.studyType === 'Uncertainty')
          return <span className="text-xs text-gray-400">N/A</span>;
        const completed = r.measurements.filter((m) => m.status === 'Completed').length;
        const total = r.measurements.length;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        return (
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  pct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {completed}/{total}
            </span>
          </div>
        );
      },
    },
    { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
    {
      header: 'Result',
      cell: (r) => {
        if (!r.passFail) return <span className="text-xs text-gray-400">—</span>;
        const label =
          r.studyType === 'GRR'
            ? `${r.grrPercent?.toFixed(1)}%`
            : r.studyType === 'Uncertainty'
            ? `±${r.expandedUncertainty?.toFixed(4)}`
            : r.resultValue?.toFixed(4);
        return (
          <div className="flex items-center gap-2">
            <StatusBadge status={r.passFail} />
            <span className="text-xs font-mono text-gray-500">{label}</span>
          </div>
        );
      },
    },
    {
      header: 'Actions',
      width: '140px',
      align: 'left' as const,
      cell: (r) => (
        <div className="flex items-center justify-start gap-1">
          {['Completed', 'Failed'].includes(r.status) && (
            <button
              onClick={(e) => { e.stopPropagation(); setViewResultStudy(r); }}
              className="p-1.5 hover:bg-indigo-50 rounded-lg transition text-indigo-500"
              title="View Results"
            >
              <Eye className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
          {r.status === 'In Progress' && canCreate && (
            <button
              onClick={(e) => { e.stopPropagation(); calculateResult(r.id); }}
              className="p-1.5 hover:bg-emerald-50 rounded-lg transition text-emerald-500"
              title="Calculate Result"
            >
              <Calculator className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
          {r.passFail === 'Fail' && canCreate && !capaForStudy(r.id) && (
            <button
              onClick={(e) => { e.stopPropagation(); openCapaPrompt(r); }}
              className="p-1.5 hover:bg-amber-50 rounded-lg transition text-amber-500"
              title="Create CAPA"
            >
              <AlertTriangle className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
          {r.passFail === 'Fail' && capaForStudy(r.id) && (
            <button
              onClick={(e) => { e.stopPropagation(); navigate('/capa'); }}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400"
              title="View CAPA"
            >
              <ExternalLink className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
        </div>
      ),
    },
  ];

  // ═══════════════════════════════════════════════════════════════════
  // TABS
  // ═══════════════════════════════════════════════════════════════════

  const allTabs: { key: MainTab; label: string; icon: typeof BarChart3; badge?: number }[] = [
    ...(canCreate
      ? [
          { key: 'studies' as MainTab, label: 'Studies', icon: BarChart3 },
          { key: 'measurements' as MainTab, label: 'Measurements', icon: ClipboardCheck, badge: pendingStudies.length },
          { key: 'results' as MainTab, label: 'Results', icon: CheckCircle2 },
        ]
      : []),
    ...(isOperator || canCreate
      ? [
          {
            key: 'my_tasks' as MainTab,
            label: isOperator ? 'My Tasks' : 'Operator Tasks',
            icon: ClipboardCheck,
            badge: isOperator ? myTasks.length : undefined,
          },
        ]
      : []),
  ];

  // ═══════════════════════════════════════════════════════════════════
  // HELPER: Get part details for display in measurement grid
  // ═══════════════════════════════════════════════════════════════════

  const getPartDetails = (study: MSAStudy, partIdx: number): Part | undefined => {
    if (!study.partIds || !study.partIds[partIdx]) return undefined;
    return parts.find((p) => p.id === study.partIds[partIdx]);
  };

  return (
    <Layout pageTitle="MSA Studies">
      {/* ─── Operator Welcome Banner ──────────────────────────────── */}
      {isOperator && myTasks.length > 0 && (
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-start gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
            <ClipboardCheck className="w-5 h-5" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-bold text-indigo-800">
              You have {myTasks.length} MSA {myTasks.length === 1 ? 'study' : 'studies'} assigned
            </p>
            <p className="text-xs text-indigo-600 mt-0.5">
              Please enter your measurements below.
            </p>
          </div>
        </div>
      )}

      {/* ─── Stats Row ────────────────────────────────────────────── */}
      {canCreate && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((s) => {
            const Icon = s.icon;
            const active = statusFilter === s.key;
            return (
              <button
                key={s.label}
                onClick={() => { setStatusFilter(s.key); setMainTab('studies'); }}
                className={`w-full bg-white rounded-xl p-4 shadow-sm border relative overflow-hidden text-left transition hover:shadow-md ${
                  active ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-gray-100'
                }`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${s.accent}`} />
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{s.label}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
                  </div>
                  <Icon className="w-5 h-5 text-gray-300" strokeWidth={2} />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ─── Main Tabs ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex gap-1 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100 overflow-x-auto">
          {allTabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setMainTab(t.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                  mainTab === t.key ? 'text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
                }`}
                style={mainTab === t.key ? { background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' } : {}}
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
                {t.label}
                {t.badge !== undefined && t.badge > 0 && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                    mainTab === t.key ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {mainTab === 'studies' && canCreate && (
          <div className="flex items-center gap-3">
            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold hover:bg-indigo-100 transition"
              >
                {stats.find((s) => s.key === statusFilter)?.label}
                <X className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
            )}
            <select
              value={studyTypeFilter}
              onChange={(e) => setStudyTypeFilter(e.target.value as StudyTypeFilter)}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition appearance-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="GRR">GR&R</option>
              <option value="Linearity">Linearity</option>
              <option value="Bias">Bias</option>
              <option value="Uncertainty">Uncertainty</option>
            </select>
            <button
              onClick={() => { resetCreateForm(); setCreateOpen(true); }}
              className="flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition text-sm"
              style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }}
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Create Study
            </button>
          </div>
        )}
      </div>

      {/* ═══ TAB: STUDIES ═══════════════════════════════════════════ */}
      {mainTab === 'studies' && (
        <DataTable
          columns={studyColumns}
          data={filteredStudies}
          keyExtractor={(r) => r.id}
          onRowClick={(r) => {
            if (['Pending Measurements', 'In Progress'].includes(r.status)) {
              setSelectedStudyId(r.id);
              setMainTab('measurements');
            } else {
              setViewResultStudy(r);
            }
          }}
          emptyTitle="No MSA studies found"
          emptySubtitle="Create a new study to get started."
          emptyIcon={<BarChart3 className="w-8 h-8 text-gray-300" strokeWidth={1.5} />}
        />
      )}

      {/* ═══ TAB: MY TASKS ═════════════════════════════════════════ */}
      {mainTab === 'my_tasks' && (
        <div className="space-y-4">
          {(isOperator ? myTasks : pendingStudies).length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-semibold text-emerald-600">No pending tasks</p>
              <p className="text-xs text-gray-400 mt-1">
                {isOperator ? "You don't have any MSA studies assigned right now." : 'No studies awaiting measurements.'}
              </p>
            </div>
          ) : (
            (isOperator ? myTasks : pendingStudies).map((study) => {
              const gauge = gauges.find((g) => g.id === study.gaugeId);
              const myMeasurement = study.measurements.find((m) => m.operatorId === currentUserId);
              const myStatus = myMeasurement?.status || 'Pending';

              return (
                <div
                  key={study.id}
                  className={`bg-white rounded-xl shadow-sm border p-5 transition ${
                    myStatus === 'Completed' ? 'border-emerald-200' : 'border-amber-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${
                        myStatus === 'Completed' ? 'bg-emerald-500' : 'bg-gradient-to-br from-indigo-500 to-purple-500'
                      }`}>
                        {myStatus === 'Completed' ? <CheckCircle2 className="w-6 h-6" strokeWidth={2} /> : <BarChart3 className="w-6 h-6" strokeWidth={2} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-800">{gauge?.gaugeCode} — {gauge?.name}</span>
                          <StatusBadge status={study.studyType} />
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {study.parts.length} {study.studyType === 'Bias' ? 'reference' : 'parts'} × {study.numberOfTrials} trials
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Created: {study.createdDate} by {study.createdBy}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={myStatus} size="md" />
                      {myStatus === 'Pending' && (
                        <button
                          onClick={() => openMeasurementEntry(study, currentUserId)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl shadow-sm transition text-white hover:scale-105"
                          style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }}
                        >
                          <ClipboardCheck className="w-4 h-4" strokeWidth={2} />
                          Enter Measurements
                        </button>
                      )}
                      {myStatus === 'Completed' && (
                        <button
                          onClick={() => openMeasurementEntry(study, currentUserId)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                        >
                          <Eye className="w-4 h-4" strokeWidth={2} />
                          View
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══ TAB: MEASUREMENTS ═════════════════════════════════════ */}
      {mainTab === 'measurements' && (
        <div>
          {!selectedStudyId ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 mb-4">Select a study to view/enter measurements:</p>
              {pendingStudies.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <ClipboardCheck className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-semibold text-gray-500">No studies awaiting measurements</p>
                </div>
              ) : (
                pendingStudies.map((study) => {
                  const gauge = gauges.find((g) => g.id === study.gaugeId);
                  const completed = study.measurements.filter((m) => m.status === 'Completed').length;
                  const total = study.measurements.length;
                  return (
                    <div
                      key={study.id}
                      onClick={() => setSelectedStudyId(study.id)}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-indigo-200 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md">
                            <BarChart3 className="w-6 h-6" strokeWidth={2} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-800">{gauge?.gaugeCode}</span>
                              <StatusBadge status={study.studyType} />
                              <StatusBadge status={study.status} />
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">{gauge?.name}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {study.operatorNames.length} operators · {study.parts.length} parts · {study.numberOfTrials} trials
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-800">{completed}/{total}</p>
                            <p className="text-xs text-gray-400">operators done</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-300" strokeWidth={2} />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : selectedStudy ? (
            <div>
              <button
                onClick={() => setSelectedStudyId(null)}
                className="text-sm text-gray-500 hover:text-indigo-600 transition mb-4 flex items-center gap-1"
              >
                ← Back to study list
              </button>

              {/* Study Header */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md">
                      <BarChart3 className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{getGaugeLabel(selectedStudy.gaugeId)}</span>
                        <StatusBadge status={selectedStudy.studyType} />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {selectedStudy.parts.length} parts × {selectedStudy.numberOfTrials} trials per operator
                      </p>
                    </div>
                  </div>

                  {selectedStudy.status === 'In Progress' && canCreate && (
                    <button
                      onClick={() => calculateResult(selectedStudy.id)}
                      className="flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition text-sm bg-emerald-500 hover:bg-emerald-600"
                    >
                      <Calculator className="w-4 h-4" strokeWidth={2.5} />
                      Calculate Result
                    </button>
                  )}
                </div>
              </div>

              {/* Operator Cards */}
              <div className="space-y-3">
                {selectedStudy.measurements.map((m) => (
                  <div
                    key={m.operatorId}
                    className={`bg-white rounded-xl shadow-sm border p-5 transition ${
                      m.status === 'Completed' ? 'border-emerald-200' : 'border-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${
                          m.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}>
                          {m.operatorName[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{m.operatorName}</p>
                          <p className="text-xs text-gray-400">
                            {m.status === 'Completed'
                              ? `Submitted ${m.submittedAt ? new Date(m.submittedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}`
                              : 'Awaiting measurements'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={m.status} />
                        <button
                          onClick={() => openMeasurementEntry(selectedStudy, m.operatorId)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                            m.status === 'Completed'
                              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                          }`}
                        >
                          {m.status === 'Completed' ? <><Eye className="w-3.5 h-3.5" strokeWidth={2} />View</> : <><ClipboardCheck className="w-3.5 h-3.5" strokeWidth={2} />Enter</>}
                        </button>
                      </div>
                    </div>

                    {m.status === 'Completed' && m.data.length > 0 && (
                      <div className="overflow-x-auto mt-3 border border-gray-100 rounded-lg">
                        <table className="min-w-full text-xs">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-3 py-2 text-left font-bold text-gray-500 uppercase tracking-wider">Part</th>
                              {selectedStudy.studyType !== 'Bias' && (
                                <th className="px-3 py-2 text-left font-bold text-gray-500 uppercase tracking-wider">True Value</th>
                              )}
                              {Array.from({ length: selectedStudy.numberOfTrials }).map((_, i) => (
                                <th key={i} className="px-3 py-2 text-center font-bold text-gray-500 uppercase tracking-wider">
                                  Trial {i + 1}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {m.data.map((row, pIdx) => {
                              const partDetails = getPartDetails(selectedStudy, pIdx);
                              return (
                                <tr key={pIdx} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 font-semibold text-gray-700">
                                    {selectedStudy.parts[pIdx] || `Part ${pIdx + 1}`}
                                  </td>
                                  {selectedStudy.studyType !== 'Bias' && (
                                    <td className="px-3 py-2 font-mono text-indigo-600 font-semibold">
                                      {partDetails ? partDetails.trueValue.toFixed(3) : '—'}
                                    </td>
                                  )}
                                  {row.map((val, tIdx) => (
                                    <td key={tIdx} className="px-3 py-2 text-center font-mono text-gray-600">
                                      {val.toFixed(3)}
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ═══ TAB: RESULTS ══════════════════════════════════════════ */}
      {mainTab === 'results' && (
        <div className="space-y-4">
          {completedStudies.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-semibold text-gray-500">No results yet</p>
            </div>
          ) : (
            completedStudies.map((study) => {
              const gauge = gauges.find((g) => g.id === study.gaugeId);
              const resultDisplay =
                study.studyType === 'GRR'
                  ? `${study.grrPercent?.toFixed(1)}%`
                  : study.studyType === 'Uncertainty'
                  ? `±${study.expandedUncertainty?.toFixed(4)}`
                  : study.resultValue?.toFixed(4);
              return (
                <div
                  key={study.id}
                  onClick={() => setViewResultStudy(study)}
                  className={`bg-white rounded-xl shadow-sm border p-5 cursor-pointer hover:shadow-md transition overflow-hidden relative ${
                    study.passFail === 'Fail' ? 'border-red-200' :
                    study.passFail === 'Borderline' ? 'border-amber-200' : 'border-emerald-200'
                  }`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    study.passFail === 'Fail' ? 'bg-red-500' :
                    study.passFail === 'Borderline' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md ${
                        study.passFail === 'Fail' ? 'bg-red-500' :
                        study.passFail === 'Borderline' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}>
                        {resultDisplay}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-indigo-600">{gauge?.gaugeCode}</span>
                          <StatusBadge status={study.studyType} />
                          {study.passFail && <StatusBadge status={study.passFail} />}
                        </div>
                        <p className="text-sm text-gray-500">{gauge?.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Completed: {study.completedDate} · {study.operatorNames.join(', ')}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300" strokeWidth={2} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══ CREATE STUDY MODAL ════════════════════════════════════ */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create New MSA Study"
        subtitle="Uses real AIAG MSA-4 calculations with part true values"
        maxWidth="xl"
        footer={
          <>
            <button
              onClick={() => setCreateOpen(false)}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateStudy}
              className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm"
              style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }}
            >
              Create Study
            </button>
          </>
        }
      >
        {createError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
            {createError}
          </div>
        )}

        <div className="space-y-5">
          {/* Study Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-2">Study Type</label>
            <div className="grid grid-cols-4 gap-2">
              {([
                { type: 'GRR' as const, label: 'GR&R', icon: BarChart3, desc: 'Repeatability & Reproducibility' },
                { type: 'Linearity' as const, label: 'Linearity', icon: TrendingUp, desc: 'Accuracy across range' },
                { type: 'Bias' as const, label: 'Bias', icon: Target, desc: 'Systematic offset' },
                { type: 'Uncertainty' as const, label: 'Uncertainty', icon: Activity, desc: 'Combined uncertainty' },
              ] as const).map((st) => {
                const Icon = st.icon;
                const selected = createType === st.type;
                return (
                  <button
                    key={st.type}
                    onClick={() => setCreateType(st.type)}
                    className={`p-3 rounded-xl border text-left transition ${
                      selected ? 'border-indigo-300 bg-indigo-50 ring-2 ring-indigo-200' : 'border-gray-200 hover:border-indigo-200'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1 ${selected ? 'text-indigo-600' : 'text-gray-400'}`} strokeWidth={2} />
                    <p className={`text-sm font-semibold ${selected ? 'text-indigo-700' : 'text-gray-700'}`}>{st.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{st.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gauge */}
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">
              Select Gauge <span className="text-red-500">*</span>
            </label>
            <select
              value={createGaugeId}
              onChange={(e) => setCreateGaugeId(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
            >
              <option value="">Select a gauge</option>
              {gauges.filter((g) => g.status === 'Available').map((g) => (
                <option key={g.id} value={g.id}>{g.gaugeCode} — {g.name} ({g.type})</option>
              ))}
            </select>
          </div>

          {/* Operators */}
          {createType !== 'Uncertainty' && (
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-2">
                Select Operators {createType === 'GRR' ? '(min 2)' : '(min 1)'} <span className="text-red-500">*</span>
              </label>
              {loadingOperators ? (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                  Loading operators…
                </div>
              ) : backendOperators.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                  <AlertCircle className="w-4 h-4 inline mr-1" strokeWidth={2} />
                  No operators found. Create users in User Management first.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {backendOperators.map((op) => {
                    const opId = String(op.id);
                    const selected = selectedOperatorIds.includes(opId);
                    return (
                      <button
                        key={op.id}
                        onClick={() => createType === 'GRR' ? toggleOperator(opId) : setSelectedOperatorIds(selected ? [] : [opId])}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition text-left ${
                          selected ? 'border-indigo-300 bg-indigo-50 ring-1 ring-indigo-200' : 'border-gray-200 hover:border-indigo-200'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          selected ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {selected ? '✓' : op.full_name[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold truncate ${selected ? 'text-indigo-700' : 'text-gray-700'}`}>
                            {op.full_name}
                          </p>
                          <p className="text-[10px] text-gray-400 flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3" strokeWidth={2} />
                            {op.email}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* GRR — Select Parts */}
          {createType === 'GRR' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-2">
                  Select Parts (min 5) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {parts.map((pt) => {
                    const selected = selectedPartIds.includes(pt.id);
                    return (
                      <button
                        key={pt.id}
                        onClick={() => togglePart(pt.id)}
                        className={`flex items-start gap-2 p-3 rounded-lg border text-left text-xs transition ${
                          selected ? 'border-indigo-300 bg-indigo-50 ring-1 ring-indigo-200' : 'border-gray-200 hover:border-indigo-200'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          selected ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {selected ? '✓' : <Package className="w-4 h-4" strokeWidth={2} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`font-semibold truncate ${selected ? 'text-indigo-700' : 'text-gray-700'}`}>
                            {pt.partName}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono">{pt.partNumber}</p>
                          <p className="text-[10px] text-indigo-500 font-mono mt-0.5">
                            True: {pt.trueValue.toFixed(3)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">Number of Trials</label>
                <div className="flex gap-2">
                  {[2, 3].map((n) => (
                    <button
                      key={n}
                      onClick={() => setNumberOfTrials(n)}
                      className={`px-6 py-2.5 rounded-lg border font-semibold text-sm transition ${
                        numberOfTrials === n ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {n} Trials
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Linearity — Select reference parts spanning the range */}
          {createType === 'Linearity' && (
            <>
              <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-3 flex items-start gap-2">
                <Info className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div className="text-xs text-cyan-700">
                  <strong>Linearity Study:</strong> Select at least 3 parts with different true values spanning the measurement range.
                  Each part's <strong>trueValue</strong> from Parts master will be used as the reference.
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-2">
                  Select Reference Parts (min 3, spanning range) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {parts.sort((a, b) => a.trueValue - b.trueValue).map((pt) => {
                    const selected = selectedPartIds.includes(pt.id);
                    return (
                      <button
                        key={pt.id}
                        onClick={() => togglePart(pt.id)}
                        className={`flex items-start gap-2 p-3 rounded-lg border text-left text-xs transition ${
                          selected ? 'border-indigo-300 bg-indigo-50 ring-1 ring-indigo-200' : 'border-gray-200 hover:border-indigo-200'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          selected ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {selected ? '✓' : <Ruler className="w-4 h-4" strokeWidth={2} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`font-semibold truncate ${selected ? 'text-indigo-700' : 'text-gray-700'}`}>
                            {pt.partName}
                          </p>
                          <p className="text-[10px] text-indigo-600 font-mono font-bold mt-0.5">
                            Ref: {pt.trueValue.toFixed(3)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">Trials per Reference Point</label>
                <div className="flex gap-2">
                  {[2, 3].map((n) => (
                    <button
                      key={n}
                      onClick={() => setNumberOfTrials(n)}
                      className={`px-6 py-2.5 rounded-lg border font-semibold text-sm transition ${
                        numberOfTrials === n ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {n} Trials
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Bias — Select single reference part */}
          {createType === 'Bias' && (
            <>
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 flex items-start gap-2">
                <Info className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div className="text-xs text-violet-700">
                  <strong>Bias Study:</strong> Select ONE reference part with a known true value.
                  Operator takes multiple readings, and system calculates bias with t-statistic for significance.
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-2">
                  Select Reference Part <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {parts.map((pt) => {
                    const selected = biasPartId === pt.id;
                    return (
                      <button
                        key={pt.id}
                        onClick={() => setBiasPartId(pt.id)}
                        className={`flex items-start gap-2 p-3 rounded-lg border text-left text-xs transition ${
                          selected ? 'border-violet-300 bg-violet-50 ring-1 ring-violet-200' : 'border-gray-200 hover:border-violet-200'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          selected ? 'bg-violet-500 text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {selected ? '✓' : <Target className="w-4 h-4" strokeWidth={2} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`font-semibold truncate ${selected ? 'text-violet-700' : 'text-gray-700'}`}>
                            {pt.partName}
                          </p>
                          <p className="text-[10px] text-violet-600 font-mono font-bold mt-0.5">
                            Reference Value: {pt.trueValue.toFixed(4)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  Number of Readings
                </label>
                <input
                  type="number"
                  min={5}
                  max={30}
                  value={biasReadingsCount}
                  onChange={(e) => setBiasReadingsCount(parseInt(e.target.value) || 10)}
                  className="w-32 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
                />
                <p className="text-[10px] text-gray-400 mt-1">Minimum 5, typically 10+</p>
              </div>
            </>
          )}

          {/* Uncertainty — Link to GRR + additional components */}
          {createType === 'Uncertainty' && (
            <>
              <div className="bg-pink-50 border border-pink-100 rounded-xl p-3 flex items-start gap-2">
                <Info className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div className="text-xs text-pink-700">
                  <strong>Uncertainty (ISO GUM):</strong> Links to a completed GR&R study to auto-pull repeatability (EV) and reproducibility (AV).
                  Combined with standard uncertainty and resolution using RSS method.
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-2">
                  Link to Completed GR&R Study <span className="text-red-500">*</span>
                </label>
                {completedGrrStudies.length === 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                    <AlertCircle className="w-4 h-4 inline mr-1" strokeWidth={2} />
                    No completed GR&R studies available. Complete a GR&R study first before running Uncertainty analysis.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {completedGrrStudies.map((grr) => {
                      const g = gauges.find((x) => x.id === grr.gaugeId);
                      const selected = uncLinkedGrrId === grr.id;
                      return (
                        <button
                          key={grr.id}
                          onClick={() => setUncLinkedGrrId(grr.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition ${
                            selected ? 'border-pink-300 bg-pink-50 ring-1 ring-pink-200' : 'border-gray-200 hover:border-pink-200'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            selected ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {selected ? '✓' : <BarChart3 className="w-4 h-4" strokeWidth={2} />}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-semibold ${selected ? 'text-pink-700' : 'text-gray-700'}`}>
                              {g?.gaugeCode} — {g?.name}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Completed {grr.completedDate} · %GRR: <strong>{grr.grrPercent?.toFixed(1)}%</strong> · EV: {grr.ev?.toFixed(4)} · AV: {grr.av?.toFixed(4)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                    Standard Uncertainty <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={uncStdUnc}
                    onChange={(e) => setUncStdUnc(e.target.value)}
                    placeholder="e.g. 0.001"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm font-mono"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">From calibration cert (u_ref)</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                    Gauge Resolution <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={uncResolution}
                    onChange={(e) => setUncResolution(e.target.value)}
                    placeholder="e.g. 0.001"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm font-mono"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Smallest scale division</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1.5">Coverage Factor (k)</label>
                  <select
                    value={uncCoverageFactor}
                    onChange={(e) => setUncCoverageFactor(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
                  >
                    <option value={2}>k = 2 (~95% confidence)</option>
                    <option value={3}>k = 3 (~99% confidence)</option>
                    <option value={1}>k = 1 (~68% confidence)</option>
                  </select>
                </div>
              </div>

              <div className="bg-indigo-50 rounded-xl p-3 text-xs text-indigo-700 font-mono">
                U = k × √(u_repeat² + u_reprod² + u_ref² + u_res²)
                <br />
                Result will be calculated immediately upon creation.
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* ═══ MEASUREMENT ENTRY MODAL ═══════════════════════════════ */}
      <Modal
        open={measureModalOpen}
        onClose={() => setMeasureModalOpen(false)}
        title="Enter Measurements"
        subtitle={`Operator: ${selectedStudy?.measurements.find((m) => m.operatorId === measureOperatorId)?.operatorName || ''}`}
        maxWidth="2xl"
        footer={
          <>
            <button
              onClick={() => setMeasureModalOpen(false)}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm"
            >
              Cancel
            </button>
            <button
              onClick={submitMeasurements}
              className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm"
              style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }}
            >
              Submit Measurements
            </button>
          </>
        }
      >
        {selectedStudy && (
          <div className="overflow-x-auto">
            {selectedStudy.studyType === 'Bias' && selectedStudy.biasReferenceValue !== undefined && (
              <div className="mb-3 bg-violet-50 border border-violet-200 rounded-lg p-3 text-xs text-violet-700 flex items-start gap-2">
                <Target className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <strong>Reference Value:</strong> <span className="font-mono font-bold">{selectedStudy.biasReferenceValue.toFixed(4)}</span>
                  <br />
                  <span className="text-[10px]">Take {selectedStudy.biasNumberOfReadings || 10} independent readings of this reference part.</span>
                </div>
              </div>
            )}

            <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr style={{ background: 'linear-gradient(90deg, #f8f7ff 0%, #f5f3ff 100%)' }}>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 border-b">
                    {selectedStudy.studyType === 'Bias' ? 'Reading #' : 'Part'}
                  </th>
                  {selectedStudy.studyType !== 'Bias' && (
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 border-b">
                      True Value
                    </th>
                  )}
                  {Array.from({ length: selectedStudy.numberOfTrials }).map((_, i) => (
                    <th key={i} className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-500 border-b">
                      Trial {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {measureGrid.map((row, pIdx) => {
                  const partDetails = getPartDetails(selectedStudy, pIdx);
                  return (
                    <tr key={pIdx} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-semibold text-gray-700 text-xs">
                        {selectedStudy.studyType === 'Bias'
                          ? `Reading ${pIdx + 1}`
                          : selectedStudy.parts[pIdx] || `Part ${pIdx + 1}`}
                      </td>
                      {selectedStudy.studyType !== 'Bias' && (
                        <td className="px-4 py-2 font-mono text-xs font-bold text-indigo-600">
                          {partDetails ? partDetails.trueValue.toFixed(4) : '—'}
                        </td>
                      )}
                      {row.map((val, tIdx) => (
                        <td key={tIdx} className="px-2 py-2">
                          <input
                            type="number"
                            step="any"
                            value={val || ''}
                            onChange={(e) => updateMeasureCell(pIdx, tIdx, e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm text-center font-mono"
                            placeholder="0.000"
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* ═══ VIEW RESULT MODAL — DETAILED ══════════════════════════ */}
            {/* ═══ VIEW RESULT MODAL — DETAILED WITH MEASUREMENTS ═══════ */}
      <Modal
        open={!!viewResultStudy}
        onClose={() => setViewResultStudy(null)}
        title="MSA Study — Detailed Results"
        subtitle={viewResultStudy ? getGaugeLabel(viewResultStudy.gaugeId) : ''}
        maxWidth="2xl"
        footer={
          <>
            {viewResultStudy?.passFail === 'Fail' && canCreate && !capaForStudy(viewResultStudy.id) && (
              <button
                onClick={() => { const study = viewResultStudy; setViewResultStudy(null); if (study) openCapaPrompt(study); }}
                className="mr-auto px-4 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm bg-amber-500 hover:bg-amber-600 flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" strokeWidth={2} />
                Create CAPA
              </button>
            )}
            {viewResultStudy?.passFail === 'Fail' && capaForStudy(viewResultStudy.id) && (
              <button
                onClick={() => navigate('/capa')}
                className="mr-auto px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" strokeWidth={2} />
                View CAPA
              </button>
            )}
            <button
              onClick={() => setViewResultStudy(null)}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm"
            >
              Close
            </button>
          </>
        }
      >
        {viewResultStudy && (
          <div className="space-y-4">
            {/* Status Badges */}
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge status={viewResultStudy.studyType} size="md" />
              {viewResultStudy.passFail && <StatusBadge status={viewResultStudy.passFail} size="md" />}
              <StatusBadge status={viewResultStudy.status} size="md" />
            </div>

            {/* ─── GR&R RESULTS ────────────────────────────────────── */}
            {viewResultStudy.studyType === 'GRR' && (
              <>
                <div className={`rounded-xl p-6 text-center ${
                  viewResultStudy.passFail === 'Fail' ? 'bg-red-50' :
                  viewResultStudy.passFail === 'Borderline' ? 'bg-amber-50' : 'bg-emerald-50'
                }`}>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">%GR&R (AIAG)</p>
                  <p className={`text-5xl font-bold ${
                    viewResultStudy.passFail === 'Fail' ? 'text-red-600' :
                    viewResultStudy.passFail === 'Borderline' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {viewResultStudy.grrPercent?.toFixed(2)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    &lt;10% Acceptable · 10–30% Marginal · &gt;30% Not Acceptable
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">%EV (Repeatability)</p>
                    <p className="text-lg font-bold text-gray-800 mt-1 font-mono">{viewResultStudy.evPercent?.toFixed(2)}%</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">EV = {viewResultStudy.ev?.toFixed(6)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">%AV (Reproducibility)</p>
                    <p className="text-lg font-bold text-gray-800 mt-1 font-mono">{viewResultStudy.avPercent?.toFixed(2)}%</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">AV = {viewResultStudy.av?.toFixed(6)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">%PV (Part Variation)</p>
                    <p className="text-lg font-bold text-gray-800 mt-1 font-mono">{viewResultStudy.pvPercent?.toFixed(2)}%</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">PV = {viewResultStudy.pv?.toFixed(6)}</p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-3">
                    <p className="text-xs text-indigo-500 uppercase tracking-wider font-semibold">GRR (Raw)</p>
                    <p className="text-lg font-bold text-indigo-700 mt-1 font-mono">{viewResultStudy.grr?.toFixed(6)}</p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-3">
                    <p className="text-xs text-indigo-500 uppercase tracking-wider font-semibold">Total Variation</p>
                    <p className="text-lg font-bold text-indigo-700 mt-1 font-mono">{viewResultStudy.tv?.toFixed(6)}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${(viewResultStudy.ndc || 0) >= 5 ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                    <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">NDC</p>
                    <p className={`text-lg font-bold mt-1 ${(viewResultStudy.ndc || 0) >= 5 ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {viewResultStudy.ndc}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Should be ≥ 5</p>
                  </div>
                </div>
              </>
            )}

            {/* ─── BIAS RESULTS ────────────────────────────────────── */}
            {viewResultStudy.studyType === 'Bias' && (
              <>
                <div className={`rounded-xl p-6 text-center ${
                  viewResultStudy.passFail === 'Fail' ? 'bg-red-50' :
                  viewResultStudy.passFail === 'Borderline' ? 'bg-amber-50' : 'bg-emerald-50'
                }`}>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">Bias</p>
                  <p className={`text-5xl font-bold font-mono ${
                    viewResultStudy.passFail === 'Fail' ? 'text-red-600' :
                    viewResultStudy.passFail === 'Borderline' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {viewResultStudy.biasValue !== undefined && viewResultStudy.biasValue >= 0 ? '+' : ''}
                    {viewResultStudy.biasValue?.toFixed(4)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Average − Reference Value</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Reference Value</p>
                    <p className="text-lg font-bold text-gray-800 mt-1 font-mono">{viewResultStudy.biasReferenceValue?.toFixed(4)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Std Deviation</p>
                    <p className="text-lg font-bold text-gray-800 mt-1 font-mono">{viewResultStudy.biasStdDev?.toFixed(6)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">t-Statistic</p>
                    <p className="text-lg font-bold text-gray-800 mt-1 font-mono">{viewResultStudy.biasTStatistic?.toFixed(3)}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${viewResultStudy.biasSignificant ? 'bg-red-50' : 'bg-emerald-50'}`}>
                    <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">Significance</p>
                    <p className={`text-sm font-bold mt-1 ${viewResultStudy.biasSignificant ? 'text-red-700' : 'text-emerald-700'}`}>
                      {viewResultStudy.biasSignificant ? '⚠ Statistically Significant' : '✓ Not Significant'}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* ─── LINEARITY RESULTS ───────────────────────────────── */}
            {viewResultStudy.studyType === 'Linearity' && (
              <>
                <div className={`rounded-xl p-6 text-center ${
                  viewResultStudy.passFail === 'Fail' ? 'bg-red-50' :
                  viewResultStudy.passFail === 'Borderline' ? 'bg-amber-50' : 'bg-emerald-50'
                }`}>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">Max |Bias| Across Range</p>
                  <p className={`text-5xl font-bold font-mono ${
                    viewResultStudy.passFail === 'Fail' ? 'text-red-600' :
                    viewResultStudy.passFail === 'Borderline' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {viewResultStudy.linearityMaxBias?.toFixed(4)}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Slope</p>
                    <p className="text-lg font-bold text-gray-800 mt-1 font-mono">{viewResultStudy.linearitySlope?.toFixed(6)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Intercept</p>
                    <p className="text-lg font-bold text-gray-800 mt-1 font-mono">{viewResultStudy.linearityIntercept?.toFixed(6)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">R²</p>
                    <p className="text-lg font-bold text-gray-800 mt-1 font-mono">{viewResultStudy.linearityRSquared?.toFixed(4)}</p>
                  </div>
                </div>

                {viewResultStudy.linearityPointResults && viewResultStudy.linearityPointResults.length > 0 && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-3 py-2 text-left font-bold text-gray-500">Reference</th>
                          <th className="px-3 py-2 text-right font-bold text-gray-500">Avg Measured</th>
                          <th className="px-3 py-2 text-right font-bold text-gray-500">Bias</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {viewResultStudy.linearityPointResults.map((p, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2 font-mono">{p.referenceValue.toFixed(4)}</td>
                            <td className="px-3 py-2 font-mono text-right">{p.avgMeasured.toFixed(4)}</td>
                            <td className={`px-3 py-2 font-mono text-right font-bold ${
                              Math.abs(p.bias) > 0.01 ? 'text-red-600' : 'text-emerald-600'
                            }`}>
                              {p.bias >= 0 ? '+' : ''}{p.bias.toFixed(4)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* ─── UNCERTAINTY RESULTS ─────────────────────────────── */}
            {viewResultStudy.studyType === 'Uncertainty' && (
              <>
                <div className={`rounded-xl p-6 text-center ${
                  viewResultStudy.passFail === 'Fail' ? 'bg-red-50' :
                  viewResultStudy.passFail === 'Borderline' ? 'bg-amber-50' : 'bg-emerald-50'
                }`}>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">
                    Expanded Uncertainty (k={viewResultStudy.coverageFactor || 2})
                  </p>
                  <p className={`text-4xl font-bold font-mono ${
                    viewResultStudy.passFail === 'Fail' ? 'text-red-600' :
                    viewResultStudy.passFail === 'Borderline' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    U = ±{viewResultStudy.expandedUncertainty?.toFixed(6)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">u (Repeatability)</p>
                    <p className="text-sm font-bold text-gray-800 mt-1 font-mono">{viewResultStudy.uRepeatability?.toFixed(6)}</p>
                    <p className="text-[10px] text-gray-400">From GRR EV</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">u (Reproducibility)</p>
                    <p className="text-sm font-bold text-gray-800 mt-1 font-mono">{viewResultStudy.uReproducibility?.toFixed(6)}</p>
                    <p className="text-[10px] text-gray-400">From GRR AV</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">u (Reference)</p>
                    <p className="text-sm font-bold text-gray-800 mt-1 font-mono">{viewResultStudy.uReference?.toFixed(6)}</p>
                    <p className="text-[10px] text-gray-400">From calibration cert</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">u (Resolution)</p>
                    <p className="text-sm font-bold text-gray-800 mt-1 font-mono">{viewResultStudy.uResolution?.toFixed(6)}</p>
                    <p className="text-[10px] text-gray-400">res/(2√3)</p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-3 col-span-2">
                    <p className="text-xs text-indigo-500 uppercase tracking-wider font-semibold">u_c (Combined Std Uncertainty)</p>
                    <p className="text-lg font-bold text-indigo-700 mt-1 font-mono">{viewResultStudy.combinedUncertainty?.toFixed(6)}</p>
                  </div>
                </div>
              </>
            )}

            {/* ─── STUDY INFO ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Operators</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">{viewResultStudy.operatorNames.join(', ')}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Completed</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">{viewResultStudy.completedDate || '—'}</p>
              </div>
            </div>

            {/* ─── MEASUREMENT DATA — EACH OPERATOR'S GRID ────────── */}
            {viewResultStudy.measurements && viewResultStudy.measurements.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 mt-2">
                  <span
                    className="inline-block w-1 h-5 rounded-full"
                    style={{ background: 'linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%)' }}
                  />
                  <h4 className="text-sm font-bold text-gray-800">
                    Measurement Data by Operator
                  </h4>
                </div>

                <div className="space-y-3">
                  {viewResultStudy.measurements
                    .filter((m) => m.status === 'Completed' && m.data.length > 0)
                    .map((m) => (
                      <div
                        key={m.operatorId}
                        className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                      >
                        {/* Operator Header */}
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">
                              {m.operatorName[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{m.operatorName}</p>
                              {m.submittedAt && (
                                <p className="text-[10px] text-gray-400">
                                  Submitted: {new Date(m.submittedAt).toLocaleString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              )}
                            </div>
                          </div>
                          <StatusBadge status="Completed" />
                        </div>

                        {/* Data Grid */}
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-xs">
                            <thead>
                              <tr className="bg-gray-50/50">
                                <th className="px-3 py-2 text-left font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                  {viewResultStudy.studyType === 'Bias' ? 'Reading #' : 'Part'}
                                </th>
                                {viewResultStudy.studyType !== 'Bias' && (
                                  <th className="px-3 py-2 text-right font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    True Value
                                  </th>
                                )}
                                {Array.from({ length: viewResultStudy.numberOfTrials }).map((_, i) => (
                                  <th key={i} className="px-3 py-2 text-center font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Trial {i + 1}
                                  </th>
                                ))}
                                <th className="px-3 py-2 text-center font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                  Average
                                </th>
                                <th className="px-3 py-2 text-center font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                  Range
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {m.data.map((row, pIdx) => {
                                const partDetail = getPartDetails(viewResultStudy, pIdx);
                                const avg = row.length > 0
                                  ? row.reduce((s, v) => s + v, 0) / row.length
                                  : 0;
                                const range = row.length > 0
                                  ? Math.max(...row) - Math.min(...row)
                                  : 0;

                                return (
                                  <tr key={pIdx} className="hover:bg-gray-50/50">
                                    <td className="px-3 py-2 font-semibold text-gray-700 whitespace-nowrap">
                                      {viewResultStudy.studyType === 'Bias'
                                        ? `Reading ${pIdx + 1}`
                                        : viewResultStudy.parts[pIdx] || `Part ${pIdx + 1}`}
                                    </td>
                                    {viewResultStudy.studyType !== 'Bias' && (
                                      <td className="px-3 py-2 text-right font-mono text-indigo-600 font-semibold">
                                        {partDetail ? partDetail.trueValue.toFixed(3) : '—'}
                                      </td>
                                    )}
                                    {row.map((val, tIdx) => (
                                      <td key={tIdx} className="px-3 py-2 text-center font-mono text-gray-600">
                                        {val.toFixed(3)}
                                      </td>
                                    ))}
                                    <td className="px-3 py-2 text-center font-mono font-bold text-gray-800">
                                      {avg.toFixed(3)}
                                    </td>
                                    <td className="px-3 py-2 text-center font-mono text-gray-500">
                                      {range.toFixed(4)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Bias reference info */}
            {viewResultStudy.studyType === 'Bias' && viewResultStudy.biasReferenceValue !== undefined && (
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-xs text-violet-700 flex items-start gap-2">
                <Target className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <strong>Reference Value:</strong>{' '}
                  <span className="font-mono font-bold">{viewResultStudy.biasReferenceValue.toFixed(4)}</span>
                  {' · '}
                  <strong>Number of Readings:</strong>{' '}
                  <span className="font-mono">{viewResultStudy.biasNumberOfReadings || '—'}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ═══ CAPA PROMPT ═══════════════════════════════════════════ */}
      <Modal
        open={!!capaPrompt}
        onClose={() => setCapaPrompt(null)}
        title="MSA Study Failed — Create CAPA"
        subtitle={capaPrompt ? `Gauge: ${getGaugeLabel(capaPrompt.gaugeId)}` : ''}
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
              onClick={createCapaFromMSA}
              className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md transition text-sm bg-amber-500 hover:bg-amber-600 flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" strokeWidth={2} />
              Create CAPA
            </button>
          </>
        }
      >
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2} />
          This MSA study <strong>FAILED</strong>. The gauge has been <strong>quarantined</strong>.
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">
              Root Cause <span className="text-red-500">*</span>
            </label>
            <textarea
              value={capaForm.rootCause}
              onChange={(e) => setCapaForm({ ...capaForm, rootCause: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">Corrective Action</label>
            <textarea
              value={capaForm.correctiveAction}
              onChange={(e) => setCapaForm({ ...capaForm, correctiveAction: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                Responsible Person <span className="text-red-500">*</span>
              </label>
              <input
                value={capaForm.responsiblePerson}
                onChange={(e) => setCapaForm({ ...capaForm, responsiblePerson: e.target.value })}
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
                onChange={(e) => setCapaForm({ ...capaForm, targetDate: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
              />
            </div>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
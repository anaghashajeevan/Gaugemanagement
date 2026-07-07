// // src/pages/CAPA.tsx

// import { useState, useMemo } from 'react';
// import Layout from '../components/Layout';
// import DataTable, { type Column } from '../components/DataTable';
// import StatusBadge from '../components/StatusBadge';
// import Modal from '../components/Modal';
// import {
//   capaStorage,
//   gaugeStorage,
//   auditStorage,
//   type CAPA as CAPAType,
// } from '../utils/storage';
// import {
//   AlertTriangle,
//   Plus,
//   Search,
//   Filter,
//   AlertCircle,
//   CheckCircle2,
//   Edit3,
//   Eye,
// } from 'lucide-react';

// const emptyForm = {
//   sourceType: 'Calibration' as CAPAType['sourceType'],
//   sourceId: '',
//   gaugeId: '',
//   rootCause: '',
//   correctiveAction: '',
//   responsiblePerson: '',
//   targetDate: '',
//   status: 'Open' as CAPAType['status'],
//   closedDate: undefined as string | undefined,
// };

// export default function CAPAPage() {
//   const [capas, setCapas] = useState<CAPAType[]>(capaStorage.getAll());
//   const [search, setSearch] = useState('');
//   const [filterStatus, setFilterStatus] = useState('');

//   const [modalOpen, setModalOpen] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [form, setForm] = useState(emptyForm);
//   const [formError, setFormError] = useState('');

//   const [detailId, setDetailId] = useState<string | null>(null);

//   const gauges = gaugeStorage.getAll();
//   const reload = () => setCapas(capaStorage.getAll());

//   const filtered = useMemo(() => {
//     let list = capas;
//     if (search) {
//       const q = search.toLowerCase();
//       list = list.filter(
//         (c) =>
//           c.rootCause.toLowerCase().includes(q) ||
//           c.responsiblePerson.toLowerCase().includes(q) ||
//           c.correctiveAction.toLowerCase().includes(q) ||
//           gauges
//             .find((g) => g.id === c.gaugeId)
//             ?.gaugeCode.toLowerCase()
//             .includes(q)
//       );
//     }
//     if (filterStatus) list = list.filter((c) => c.status === filterStatus);
//     return list;
//   }, [capas, search, filterStatus, gauges]);

//   const getGaugeLabel = (gaugeId: string) => {
//     const g = gauges.find((x) => x.id === gaugeId);
//     return g ? `${g.gaugeCode} — ${g.name}` : '—';
//   };

//   const openAdd = () => {
//     setEditingId(null);
//     setForm(emptyForm);
//     setFormError('');
//     setModalOpen(true);
//   };

//   const openEdit = (capa: CAPAType) => {
//     setEditingId(capa.id);
//     setForm({
//       sourceType: capa.sourceType,
//       sourceId: capa.sourceId,
//       gaugeId: capa.gaugeId,
//       rootCause: capa.rootCause,
//       correctiveAction: capa.correctiveAction,
//       responsiblePerson: capa.responsiblePerson,
//       targetDate: capa.targetDate,
//       status: capa.status,
//       closedDate: capa.closedDate,
//     });
//     setFormError('');
//     setModalOpen(true);
//   };

//   const handleSave = () => {
//     if (!form.gaugeId || !form.rootCause.trim() || !form.responsiblePerson.trim() || !form.targetDate) {
//       setFormError('Gauge, Root Cause, Responsible Person, and Target Date are required.');
//       return;
//     }

//     if (editingId) {
//       capaStorage.update(editingId, form);
//       auditStorage.add({
//         action: 'UPDATE',
//         entityType: 'CAPA',
//         entityId: editingId,
//         userId: 'current',
//         timestamp: new Date().toISOString(),
//       });
//     } else {
//       const created = capaStorage.add(form);
//       auditStorage.add({
//         action: 'CREATE',
//         entityType: 'CAPA',
//         entityId: created.id,
//         userId: 'current',
//         timestamp: new Date().toISOString(),
//       });
//     }

//     reload();
//     setModalOpen(false);
//   };

//   const handleClose = (capaId: string) => {
//     capaStorage.update(capaId, {
//       status: 'Closed',
//       closedDate: new Date().toISOString().split('T')[0],
//     });
//     auditStorage.add({
//       action: 'CLOSE_CAPA',
//       entityType: 'CAPA',
//       entityId: capaId,
//       userId: 'current',
//       timestamp: new Date().toISOString(),
//     });
//     reload();
//     setDetailId(null);
//   };

//   const detailCapa = capas.find((c) => c.id === detailId);

//   // ─── Stats ────────────────────────────────────────────────────────
//   const openCount = capas.filter((c) => c.status === 'Open').length;
//   const closedCount = capas.filter((c) => c.status === 'Closed').length;
//   const overdueCount = capas.filter(
//     (c) => c.status === 'Open' && new Date(c.targetDate) < new Date()
//   ).length;

//   // ─── Columns ──────────────────────────────────────────────────────
//   const columns: Column<CAPAType>[] = [
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
//       header: 'Source',
//       cell: (row) => <StatusBadge status={row.sourceType} />,
//     },
//     {
//       header: 'Root Cause',
//       cell: (row) => (
//         <span className="truncate max-w-[220px] block text-sm">{row.rootCause}</span>
//       ),
//     },
//     { header: 'Responsible', accessor: 'responsiblePerson' },
//     {
//       header: 'Target Date',
//       cell: (row) => {
//         const overdue =
//           row.status === 'Open' && new Date(row.targetDate) < new Date();
//         return (
//           <div className="flex items-center gap-2">
//             <span>{row.targetDate}</span>
//             {overdue && <StatusBadge status="Overdue" />}
//           </div>
//         );
//       },
//     },
//     {
//       header: 'Status',
//       cell: (row) => <StatusBadge status={row.status} />,
//     },
//     {
//       header: 'Actions',
//       width: '120px',
//       align: 'center',
//       cell: (row) => (
//         <div className="flex items-center justify-center gap-1">
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               setDetailId(row.id);
//             }}
//             className="p-1.5 hover:bg-indigo-50 rounded-lg transition text-indigo-500"
//             title="View"
//           >
//             <Eye className="w-4 h-4" strokeWidth={2} />
//           </button>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               openEdit(row);
//             }}
//             className="p-1.5 hover:bg-indigo-50 rounded-lg transition text-indigo-500"
//             title="Edit"
//           >
//             <Edit3 className="w-4 h-4" strokeWidth={2} />
//           </button>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <Layout pageTitle="CAPA">
//       {/* ─── Top Bar ──────────────────────────────────────────────── */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
//         <div className="flex items-center gap-3 flex-1 max-w-lg">
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
//             <input
//               type="text"
//               placeholder="Search CAPA…"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
//             />
//           </div>
//           <select
//             value={filterStatus}
//             onChange={(e) => setFilterStatus(e.target.value)}
//             className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition appearance-none cursor-pointer"
//           >
//             <option value="">All Status</option>
//             <option value="Open">Open</option>
//             <option value="Closed">Closed</option>
//           </select>
//         </div>

//         <button
//           onClick={openAdd}
//           className="flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition text-sm"
//           style={{
//             background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
//           }}
//         >
//           <Plus className="w-4 h-4" strokeWidth={2.5} />
//           New CAPA
//         </button>
//       </div>

//       {/* ─── Stats ────────────────────────────────────────────────── */}
//       <div className="grid grid-cols-3 gap-4 mb-6">
//         {[
//           { label: 'Total', value: capas.length, accent: 'from-indigo-500 to-purple-500' },
//           { label: 'Open', value: openCount, accent: 'from-amber-500 to-yellow-500' },
//           { label: 'Overdue', value: overdueCount, accent: 'from-red-500 to-rose-500' },
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
//         keyExtractor={(row) => row.id}
//         emptyTitle="No CAPA records found"
//         emptySubtitle="CAPA records will appear here."
//         emptyIcon={<AlertTriangle className="w-8 h-8 text-gray-300" strokeWidth={1.5} />}
//       />

//       {/* ─── Add / Edit Modal ─────────────────────────────────────── */}
//       <Modal
//         open={modalOpen}
//         onClose={() => setModalOpen(false)}
//         title={editingId ? 'Edit CAPA' : 'New CAPA'}
//         subtitle="Corrective & Preventive Action"
//         maxWidth="lg"
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
//                 background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
//               }}
//             >
//               {editingId ? 'Update' : 'Create'} CAPA
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

//         <div className="space-y-4">
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//                 Source Type
//               </label>
//               <select
//                 value={form.sourceType}
//                 onChange={(e) =>
//                   setForm({ ...form, sourceType: e.target.value as CAPAType['sourceType'] })
//                 }
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
//               >
//                 <option value="Calibration">Calibration</option>
//                 <option value="MSA">MSA</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//                 Gauge <span className="text-red-500">*</span>
//               </label>
//               <select
//                 value={form.gaugeId}
//                 onChange={(e) => setForm({ ...form, gaugeId: e.target.value })}
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer"
//               >
//                 <option value="">Select a gauge</option>
//                 {gauges.map((g) => (
//                   <option key={g.id} value={g.id}>
//                     {g.gaugeCode} — {g.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Root Cause <span className="text-red-500">*</span>
//             </label>
//             <textarea
//               value={form.rootCause}
//               onChange={(e) => setForm({ ...form, rootCause: e.target.value })}
//               rows={3}
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm resize-none"
//               placeholder="Describe the root cause analysis…"
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//               Corrective Action
//             </label>
//             <textarea
//               value={form.correctiveAction}
//               onChange={(e) =>
//                 setForm({ ...form, correctiveAction: e.target.value })
//               }
//               rows={3}
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm resize-none"
//               placeholder="What corrective and preventive actions will be taken?"
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//                 Responsible Person <span className="text-red-500">*</span>
//               </label>
//               <input
//                 value={form.responsiblePerson}
//                 onChange={(e) =>
//                   setForm({ ...form, responsiblePerson: e.target.value })
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
//                 value={form.targetDate}
//                 onChange={(e) =>
//                   setForm({ ...form, targetDate: e.target.value })
//                 }
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
//               />
//             </div>
//           </div>
//         </div>
//       </Modal>

//       {/* ─── Detail / Close Modal ─────────────────────────────────── */}
//       <Modal
//         open={!!detailCapa}
//         onClose={() => setDetailId(null)}
//         title="CAPA Details"
//         subtitle={detailCapa ? getGaugeLabel(detailCapa.gaugeId) : ''}
//         maxWidth="lg"
//         footer={
//           <>
//             <button
//               onClick={() => setDetailId(null)}
//               className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm"
//             >
//               Close
//             </button>
//             {detailCapa?.status === 'Open' && (
//               <button
//                 onClick={() => detailCapa && handleClose(detailCapa.id)}
//                 className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm bg-emerald-500 hover:bg-emerald-600 flex items-center gap-2"
//               >
//                 <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
//                 Close CAPA
//               </button>
//             )}
//           </>
//         }
//       >
//         {detailCapa && (
//           <div className="space-y-4">
//             <div className="flex gap-3">
//               <StatusBadge status={detailCapa.status} size="md" />
//               <StatusBadge status={detailCapa.sourceType} size="md" />
//               {detailCapa.status === 'Open' &&
//                 new Date(detailCapa.targetDate) < new Date() && (
//                   <StatusBadge status="Overdue" size="md" />
//                 )}
//             </div>

//             <div className="bg-gray-50 rounded-xl p-4 space-y-3">
//               <div>
//                 <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
//                   Root Cause
//                 </p>
//                 <p className="text-sm text-gray-800">{detailCapa.rootCause}</p>
//               </div>
//               <div>
//                 <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
//                   Corrective Action
//                 </p>
//                 <p className="text-sm text-gray-800">
//                   {detailCapa.correctiveAction || '—'}
//                 </p>
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div className="bg-gray-50 rounded-xl p-3">
//                 <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
//                   Responsible Person
//                 </p>
//                 <p className="text-sm font-semibold text-gray-800 mt-1">
//                   {detailCapa.responsiblePerson}
//                 </p>
//               </div>
//               <div className="bg-gray-50 rounded-xl p-3">
//                 <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
//                   Target Date
//                 </p>
//                 <p className="text-sm font-semibold text-gray-800 mt-1">
//                   {detailCapa.targetDate}
//                 </p>
//               </div>
//               {detailCapa.closedDate && (
//                 <div className="bg-emerald-50 rounded-xl p-3 col-span-2">
//                   <p className="text-xs text-emerald-600 uppercase tracking-wider font-semibold">
//                     Closed Date
//                   </p>
//                   <p className="text-sm font-semibold text-emerald-800 mt-1">
//                     {detailCapa.closedDate}
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </Modal>
//     </Layout>
//   );
// }


// src/pages/CAPA.tsx

import { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import DataTable, { type Column } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import {
  capaStorage,
  gaugeStorage,
  auditStorage,
  type CAPA as CAPAType,
} from '../utils/storage';
import {
  AlertTriangle,
  Plus,
  Search,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Eye,
  XCircle,
  Gauge,
} from 'lucide-react';

const CLOSE_ACTIONS = [
  { value: 'available', label: 'Gauge OK — Mark Available', description: 'Gauge has been fixed/recalibrated and is ready for use' },
  { value: 'scrapped', label: 'Gauge Not Fixable — Scrap', description: 'Gauge cannot be repaired and will be permanently removed' },
  { value: 'recalibrate', label: 'Needs Recalibration', description: 'Gauge needs to be sent for calibration before use' },
];

const emptyForm = {
  sourceType: 'Calibration' as CAPAType['sourceType'],
  sourceId: '',
  gaugeId: '',
  rootCause: '',
  correctiveAction: '',
  responsiblePerson: '',
  targetDate: '',
  status: 'Open' as CAPAType['status'],
  closedDate: undefined as string | undefined,
};

export default function CAPAPage() {
  const [capas, setCapas] = useState<CAPAType[]>(capaStorage.getAll());
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const [detailId, setDetailId] = useState<string | null>(null);

  // Close CAPA modal
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [closeCapaId, setCloseCapaId] = useState<string | null>(null);
  const [closeAction, setCloseAction] = useState('available');
  const [closeNotes, setCloseNotes] = useState('');
  const [verificationResult, setVerificationResult] = useState('');

  const gauges = gaugeStorage.getAll();
  const reload = () => setCapas(capaStorage.getAll());

  const filtered = useMemo(() => {
    let list = capas;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.rootCause.toLowerCase().includes(q) ||
          c.responsiblePerson.toLowerCase().includes(q) ||
          c.correctiveAction.toLowerCase().includes(q) ||
          gauges.find((g) => g.id === c.gaugeId)?.gaugeCode.toLowerCase().includes(q)
      );
    }
    if (filterStatus) list = list.filter((c) => c.status === filterStatus);
    return list;
  }, [capas, search, filterStatus, gauges]);

  const getGaugeLabel = (gaugeId: string) => {
    const g = gauges.find((x) => x.id === gaugeId);
    return g ? `${g.gaugeCode} — ${g.name}` : '—';
  };

  const getGaugeStatus = (gaugeId: string) => {
    const g = gauges.find((x) => x.id === gaugeId);
    return g?.status || '';
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (capa: CAPAType) => {
    setEditingId(capa.id);
    setForm({
      sourceType: capa.sourceType,
      sourceId: capa.sourceId,
      gaugeId: capa.gaugeId,
      rootCause: capa.rootCause,
      correctiveAction: capa.correctiveAction,
      responsiblePerson: capa.responsiblePerson,
      targetDate: capa.targetDate,
      status: capa.status,
      closedDate: capa.closedDate,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.gaugeId || !form.rootCause.trim() || !form.responsiblePerson.trim() || !form.targetDate) {
      setFormError('Gauge, Root Cause, Responsible Person, and Target Date are required.');
      return;
    }

    if (editingId) {
      capaStorage.update(editingId, form);
      auditStorage.add({
        action: 'UPDATE', entityType: 'CAPA', entityId: editingId,
        userId: 'current', timestamp: new Date().toISOString(),
      });
    } else {
      // When creating a new CAPA, quarantine the gauge
      gaugeStorage.update(form.gaugeId, { status: 'Under Review' });

      const created = capaStorage.add(form);
      auditStorage.add({
        action: 'CREATE', entityType: 'CAPA', entityId: created.id,
        userId: 'current', timestamp: new Date().toISOString(),
      });
    }

    reload();
    setModalOpen(false);
  };

  // ─── Open Close CAPA Flow ────────────────────────────────────────
  const openCloseModal = (capaId: string) => {
    setCloseCapaId(capaId);
    setCloseAction('available');
    setCloseNotes('');
    setVerificationResult('');
    setCloseModalOpen(true);
  };

  // ─── Close CAPA with Gauge Status Update ─────────────────────────
  const handleCloseCapa = () => {
    if (!closeCapaId) return;

    const capa = capas.find((c) => c.id === closeCapaId);
    if (!capa) return;

    // Update CAPA status
    const updatedCorrectiveAction = capa.correctiveAction +
      (closeNotes ? `\n\n--- Closure Notes ---\n${closeNotes}` : '') +
      (verificationResult ? `\n\nVerification: ${verificationResult}` : '');

    capaStorage.update(closeCapaId, {
      status: 'Closed',
      closedDate: new Date().toISOString().split('T')[0],
      correctiveAction: updatedCorrectiveAction,
    });

    // Update gauge status based on close action
    let newGaugeStatus: string;
    switch (closeAction) {
      case 'available':
        newGaugeStatus = 'Available';
        break;
      case 'scrapped':
        newGaugeStatus = 'Scrapped';
        break;
      case 'recalibrate':
        newGaugeStatus = 'Under Calibration';
        break;
      default:
        newGaugeStatus = 'Available';
    }

    gaugeStorage.update(capa.gaugeId, { status: newGaugeStatus as any });

    auditStorage.add({
      action: 'CLOSE_CAPA', entityType: 'CAPA', entityId: closeCapaId,
      userId: 'current', timestamp: new Date().toISOString(),
    });

    auditStorage.add({
      action: 'UPDATE', entityType: 'Gauge', entityId: capa.gaugeId,
      userId: 'current', timestamp: new Date().toISOString(),
    });

    reload();
    setCloseModalOpen(false);
    setDetailId(null);
  };

  const detailCapa = capas.find((c) => c.id === detailId);

  // ─── Stats ────────────────────────────────────────────────────────
  const openCount = capas.filter((c) => c.status === 'Open').length;
  const closedCount = capas.filter((c) => c.status === 'Closed').length;
  const overdueCount = capas.filter(
    (c) => c.status === 'Open' && new Date(c.targetDate) < new Date()
  ).length;
  const quarantinedGauges = gauges.filter((g) => g.status === 'Under Review').length;

  // ─── Columns ──────────────────────────────────────────────────────
  const columns: Column<CAPAType>[] = [
    {
      header: 'Gauge',
      cell: (row) => {
        const g = gauges.find((x) => x.id === row.gaugeId);
        return (
          <div>
            <span className="font-bold text-indigo-600">{g?.gaugeCode || '—'}</span>
            <p className="text-xs text-gray-400">{g?.name}</p>
          </div>
        );
      },
    },
    { header: 'Source', cell: (row) => <StatusBadge status={row.sourceType} /> },
    {
      header: 'Gauge Status',
      cell: (row) => <StatusBadge status={getGaugeStatus(row.gaugeId)} />,
    },
    {
      header: 'Root Cause',
      cell: (row) => (
        <span className="truncate max-w-[180px] block text-sm">{row.rootCause}</span>
      ),
    },
    { header: 'Responsible', accessor: 'responsiblePerson' },
    {
      header: 'Target Date',
      cell: (row) => {
        const overdue = row.status === 'Open' && new Date(row.targetDate) < new Date();
        return (
          <div className="flex items-center gap-2">
            <span>{row.targetDate}</span>
            {overdue && <StatusBadge status="Overdue" />}
          </div>
        );
      },
    },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Actions',
      width: '120px',
      align: 'center',
      cell: (row) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setDetailId(row.id); }}
            className="p-1.5 hover:bg-indigo-50 rounded-lg transition text-indigo-500" title="View"
          >
            <Eye className="w-4 h-4" strokeWidth={2} />
          </button>
          {row.status === 'Open' && (
            <button
              onClick={(e) => { e.stopPropagation(); openEdit(row); }}
              className="p-1.5 hover:bg-indigo-50 rounded-lg transition text-indigo-500" title="Edit"
            >
              <Edit3 className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Layout pageTitle="CAPA">
      {/* ─── Quarantine Banner ────────────────────────────────────── */}
      {quarantinedGauges > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <XCircle className="w-5 h-5 text-red-600" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-bold text-red-800">
              {quarantinedGauges} gauge{quarantinedGauges > 1 ? 's' : ''} quarantined (Under Review)
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              These gauges cannot be issued until their CAPA is closed. Close the CAPA to release the gauge.
            </p>
          </div>
        </div>
      )}

      {/* ─── Top Bar ──────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
            <input
              type="text" placeholder="Search CAPA…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition appearance-none cursor-pointer">
            <option value="">All Status</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <button onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition text-sm"
          style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }}>
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          New CAPA
        </button>
      </div>

      {/* ─── Stats ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: capas.length, accent: 'from-indigo-500 to-purple-500' },
          { label: 'Open', value: openCount, accent: 'from-amber-500 to-yellow-500' },
          { label: 'Overdue', value: overdueCount, accent: 'from-red-500 to-rose-500' },
          { label: 'Quarantined Gauges', value: quarantinedGauges, accent: 'from-red-600 to-red-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${s.accent}`} />
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{s.label}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ─── Table ────────────────────────────────────────────────── */}
      <DataTable columns={columns} data={filtered} keyExtractor={(row) => row.id}
        emptyTitle="No CAPA records found" emptySubtitle="CAPA records will appear here."
        emptyIcon={<AlertTriangle className="w-8 h-8 text-gray-300" strokeWidth={1.5} />} />

      {/* ─── Add / Edit Modal ─────────────────────────────────────── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit CAPA' : 'New CAPA'} subtitle="Corrective & Preventive Action" maxWidth="lg"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm">Cancel</button>
            <button onClick={handleSave} className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm"
              style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }}>
              {editingId ? 'Update' : 'Create'} CAPA
            </button>
          </>
        }>
        {formError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />{formError}
          </div>
        )}
        <div className="space-y-4">
          {!editingId && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
              Creating a CAPA will <strong>quarantine</strong> the selected gauge (status → Under Review). The gauge cannot be issued until this CAPA is closed.
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">Source Type</label>
              <select value={form.sourceType} onChange={(e) => setForm({ ...form, sourceType: e.target.value as CAPAType['sourceType'] })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer">
                <option value="Calibration">Calibration</option>
                <option value="MSA">MSA</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">Gauge <span className="text-red-500">*</span></label>
              <select value={form.gaugeId} onChange={(e) => setForm({ ...form, gaugeId: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm appearance-none cursor-pointer">
                <option value="">Select a gauge</option>
                {gauges.map((g) => (
                  <option key={g.id} value={g.id}>{g.gaugeCode} — {g.name} ({g.status})</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">Root Cause <span className="text-red-500">*</span></label>
            <textarea value={form.rootCause} onChange={(e) => setForm({ ...form, rootCause: e.target.value })} rows={3}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm resize-none" placeholder="Describe the root cause analysis…" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">Corrective Action</label>
            <textarea value={form.correctiveAction} onChange={(e) => setForm({ ...form, correctiveAction: e.target.value })} rows={3}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm resize-none" placeholder="What corrective and preventive actions will be taken?" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">Responsible Person <span className="text-red-500">*</span></label>
              <input value={form.responsiblePerson} onChange={(e) => setForm({ ...form, responsiblePerson: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">Target Date <span className="text-red-500">*</span></label>
              <input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm" />
            </div>
          </div>
        </div>
      </Modal>

      {/* ─── Detail Modal ─────────────────────────────────────────── */}
      <Modal open={!!detailCapa} onClose={() => setDetailId(null)}
        title="CAPA Details" subtitle={detailCapa ? getGaugeLabel(detailCapa.gaugeId) : ''} maxWidth="lg"
        footer={
          <>
            <button onClick={() => setDetailId(null)} className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm">Close</button>
            {detailCapa?.status === 'Open' && (
              <button onClick={() => { setDetailId(null); openCloseModal(detailCapa.id); }}
                className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm bg-emerald-500 hover:bg-emerald-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                Close CAPA
              </button>
            )}
          </>
        }>
        {detailCapa && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={detailCapa.status} size="md" />
              <StatusBadge status={detailCapa.sourceType} size="md" />
              <StatusBadge status={getGaugeStatus(detailCapa.gaugeId)} size="md" />
              {detailCapa.status === 'Open' && new Date(detailCapa.targetDate) < new Date() && (
                <StatusBadge status="Overdue" size="md" />
              )}
            </div>

            {detailCapa.status === 'Open' && getGaugeStatus(detailCapa.gaugeId) === 'Under Review' && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
                <Gauge className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <strong>Gauge is quarantined.</strong> It cannot be issued to anyone until this CAPA is closed and gauge status is updated.
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Root Cause</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{detailCapa.rootCause}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Corrective Action</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{detailCapa.correctiveAction || '—'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Responsible Person</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">{detailCapa.responsiblePerson}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Target Date</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">{detailCapa.targetDate}</p>
              </div>
              {detailCapa.closedDate && (
                <div className="bg-emerald-50 rounded-xl p-3 col-span-2">
                  <p className="text-xs text-emerald-600 uppercase tracking-wider font-semibold">Closed Date</p>
                  <p className="text-sm font-semibold text-emerald-800 mt-1">{detailCapa.closedDate}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ─── Close CAPA Modal (with gauge decision) ───────────────── */}
      <Modal
        open={closeModalOpen}
        onClose={() => setCloseModalOpen(false)}
        title="Close CAPA — Gauge Decision"
        subtitle={closeCapaId ? getGaugeLabel(capas.find((c) => c.id === closeCapaId)?.gaugeId || '') : ''}
        maxWidth="lg"
        footer={
          <>
            <button onClick={() => setCloseModalOpen(false)} className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition text-sm">Cancel</button>
            <button onClick={handleCloseCapa}
              className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition text-sm bg-emerald-500 hover:bg-emerald-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
              Close CAPA & Update Gauge
            </button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Gauge Action Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-2">
              What should happen to the gauge? <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {CLOSE_ACTIONS.map((action) => (
                <button
                  key={action.value}
                  onClick={() => setCloseAction(action.value)}
                  className={`w-full text-left p-4 rounded-xl border transition ${
                    closeAction === action.value
                      ? 'border-indigo-300 bg-indigo-50 ring-2 ring-indigo-200'
                      : 'border-gray-200 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      closeAction === action.value ? 'border-indigo-500' : 'border-gray-300'
                    }`}>
                      {closeAction === action.value && (
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${closeAction === action.value ? 'text-indigo-700' : 'text-gray-700'}`}>
                        {action.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{action.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Verification Result */}
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">
              Effectiveness Verification
            </label>
            <textarea
              value={verificationResult}
              onChange={(e) => setVerificationResult(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm resize-none"
              placeholder="Was the corrective action effective? Any re-test results?"
            />
          </div>

          {/* Closure Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">Closure Notes</label>
            <textarea
              value={closeNotes}
              onChange={(e) => setCloseNotes(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm resize-none"
              placeholder="Any additional notes on closure…"
            />
          </div>

          {/* Preview */}
          <div className={`rounded-xl p-4 ${
            closeAction === 'available' ? 'bg-emerald-50 border border-emerald-200' :
            closeAction === 'scrapped' ? 'bg-red-50 border border-red-200' :
            'bg-amber-50 border border-amber-200'
          }`}>
            <p className={`text-sm font-semibold ${
              closeAction === 'available' ? 'text-emerald-700' :
              closeAction === 'scrapped' ? 'text-red-700' : 'text-amber-700'
            }`}>
              {closeAction === 'available' && '✅ Gauge will be marked Available and can be issued again.'}
              {closeAction === 'scrapped' && '❌ Gauge will be permanently Scrapped and removed from active use.'}
              {closeAction === 'recalibrate' && '🔧 Gauge will be marked Under Calibration. It needs to be calibrated before use.'}
            </p>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
// // src/utils/storage.ts

// // ─── Interfaces ───────────────────────────────────────────────────────────────

// export interface Gauge {
//   id: string;
//   gaugeCode: string;
//   name: string;
//   type: string;
//   range: string;
//   leastCount: string;
//   department: string;
//   location: string;
//   frequencyMonths: number;
//   status: 'Available' | 'Issued' | 'Under Calibration' | 'Under MSA Study' | 'Under Review' | 'Scrapped';
//   lastCalibrationDate: string;
//   nextDueDate: string;
// }

// export interface Standard {
//   id: string;
//   standardCode: string;
//   description: string;
//   certifiedValue: string;
//   validUntil: string;
// }

// export interface Vendor {
//   id: string;
//   name: string;
//   accreditationNo: string;
//   scope: string;
//   contact: string;
// }

// export interface CalibrationRecord {
//   id: string;
//   gaugeId: string;
//   type: 'Internal' | 'External';
//   standardId?: string;
//   vendorId?: string;
//   date: string;
//   readings: number[];
//   result: 'Pass' | 'Fail';
//   certificateNo?: string;
//   certificateValidUntil?: string;
//   technician: string;
//   nextDueDate: string;
// }

// export interface MSAStudy {
//   id: string;
//   gaugeId: string;
//   studyType: 'GRR' | 'Linearity' | 'Bias' | 'Uncertainty';
//   operators: string[];
//   sampleParts: string[];
//   trialData: number[][];
//   resultValue: number;
//   passFail: 'Pass' | 'Borderline' | 'Fail';
//   date: string;
// }

// export interface CAPA {
//   id: string;
//   sourceType: 'Calibration' | 'MSA';
//   sourceId: string;
//   gaugeId: string;
//   rootCause: string;
//   correctiveAction: string;
//   responsiblePerson: string;
//   targetDate: string;
//   status: 'Open' | 'Closed';
//   closedDate?: string;
// }

// export interface IssueReturnLog {
//   id: string;
//   gaugeId: string;
//   issuedTo: string;
//   issueTimestamp: string;
//   returnTimestamp?: string;
//   status: 'Issued' | 'Returned';
// }

// export interface AppUser {
//   id: string;
//   fullName: string;
//   loginId: string;
//   role: string;
//   department: string;
// }

// export interface AppDepartment {
//   id: string;
//   name: string;
//   code: string;
// }

// export interface AuditLog {
//   id: string;
//   action: string;
//   entityType: string;
//   entityId: string;
//   userId: string;
//   timestamp: string;
// }

// // ─── Keys ─────────────────────────────────────────────────────────────────────

// const KEYS = {
//   gauges: 'gm_gauges',
//   standards: 'gm_standards',
//   vendors: 'gm_vendors',
//   calibrations: 'gm_calibrations',
//   msa: 'gm_msa',
//   capa: 'gm_capa',
//   issueReturn: 'gm_issue_return',
//   users: 'gm_users',
//   departments: 'gm_departments',
//   audit: 'gm_audit',
// };

// // ─── Generic Helpers ──────────────────────────────────────────────────────────

// function getAll<T>(key: string): T[] {
//   try {
//     const raw = localStorage.getItem(key);
//     return raw ? JSON.parse(raw) : [];
//   } catch {
//     return [];
//   }
// }

// function setAll<T>(key: string, data: T[]): void {
//   localStorage.setItem(key, JSON.stringify(data));
// }

// export function generateId(): string {
//   return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
// }

// // ─── Seed Data ────────────────────────────────────────────────────────────────

// const seedDepartments: AppDepartment[] = [
//   { id: 'd1', name: 'Quality Control', code: 'QC' },
//   { id: 'd2', name: 'Production', code: 'PROD' },
//   { id: 'd3', name: 'Gauge Room', code: 'GR' },
//   { id: 'd4', name: 'Maintenance', code: 'MAINT' },
//   { id: 'd5', name: 'Stores', code: 'STORE' },
// ];

// const seedUsers: AppUser[] = [
//   { id: 'u1', fullName: 'Rajesh Kumar', loginId: 'rajesh.kumar', role: 'Quality Engineer', department: 'Quality Control' },
//   { id: 'u2', fullName: 'Priya Sharma', loginId: 'priya.sharma', role: 'Shop Floor Operator', department: 'Production' },
//   { id: 'u3', fullName: 'Anil Mehta', loginId: 'anil.mehta', role: 'Store Keeper', department: 'Stores' },
//   { id: 'u4', fullName: 'Sunita Rao', loginId: 'sunita.rao', role: 'Quality Engineer', department: 'Quality Control' },
//   { id: 'u5', fullName: 'Vikram Singh', loginId: 'vikram.singh', role: 'Shop Floor Operator', department: 'Production' },
// ];

// const seedStandards: Standard[] = [
//   { id: 's1', standardCode: 'STD-001', description: 'Gauge Block Set Grade 1', certifiedValue: '0–100mm ±0.001mm', validUntil: '2025-12-31' },
//   { id: 's2', standardCode: 'STD-002', description: 'Ring Gauge Master Ø25mm', certifiedValue: '25.000mm ±0.0005mm', validUntil: '2025-09-30' },
//   { id: 's3', standardCode: 'STD-003', description: 'Surface Plate Grade A', certifiedValue: 'Flatness 0.003mm', validUntil: '2026-03-15' },
//   { id: 's4', standardCode: 'STD-004', description: 'Load Cell 500N NABL', certifiedValue: '500N ±0.1N', validUntil: '2025-11-20' },
// ];

// const seedVendors: Vendor[] = [
//   { id: 'v1', name: 'Metrology Solutions Pvt Ltd', accreditationNo: 'NABL-1023', scope: 'Dimensional, Pressure', contact: '+91-9876543210' },
//   { id: 'v2', name: 'Precision Cal India', accreditationNo: 'NABL-2045', scope: 'Electrical, Temperature, Dimensional', contact: '+91-9123456780' },
//   { id: 'v3', name: 'TechCal Services', accreditationNo: 'NABL-3067', scope: 'Torque, Force, Mass', contact: '+91-9988776655' },
// ];

// const seedGauges: Gauge[] = [
//   {
//     id: 'g1', gaugeCode: 'VNR-001', name: 'Vernier Caliper 150mm',
//     type: 'Vernier Caliper', range: '0–150mm', leastCount: '0.02mm',
//     department: 'Quality Control', location: 'QC Lab Shelf A1',
//     frequencyMonths: 6, status: 'Available',
//     lastCalibrationDate: '2024-07-15', nextDueDate: '2025-01-15',
//   },
//   {
//     id: 'g2', gaugeCode: 'MIC-001', name: 'Outside Micrometer 0-25mm',
//     type: 'Micrometer', range: '0–25mm', leastCount: '0.001mm',
//     department: 'Quality Control', location: 'QC Lab Shelf A2',
//     frequencyMonths: 6, status: 'Under Calibration',
//     lastCalibrationDate: '2024-06-10', nextDueDate: '2024-12-10',
//   },
//   {
//     id: 'g3', gaugeCode: 'DIG-001', name: 'Digital Height Gauge 300mm',
//     type: 'Height Gauge', range: '0–300mm', leastCount: '0.01mm',
//     department: 'Production', location: 'Shop Floor Station 3',
//     frequencyMonths: 12, status: 'Available',
//     lastCalibrationDate: '2024-03-20', nextDueDate: '2025-03-20',
//   },
//   {
//     id: 'g4', gaugeCode: 'DTI-001', name: 'Dial Test Indicator',
//     type: 'Dial Indicator', range: '0–10mm', leastCount: '0.01mm',
//     department: 'Production', location: 'Shop Floor Station 1',
//     frequencyMonths: 6, status: 'Issued',
//     lastCalibrationDate: '2024-08-01', nextDueDate: '2025-02-01',
//   },
//   {
//     id: 'g5', gaugeCode: 'THK-001', name: 'Feeler Gauge Set',
//     type: 'Feeler Gauge', range: '0.05–1.0mm', leastCount: '0.05mm',
//     department: 'Maintenance', location: 'Maint. Cabinet B3',
//     frequencyMonths: 12, status: 'Available',
//     lastCalibrationDate: '2024-01-10', nextDueDate: '2025-01-10',
//   },
//   {
//     id: 'g6', gaugeCode: 'RNG-001', name: 'Plain Ring Gauge Ø25mm',
//     type: 'Ring Gauge', range: 'Ø25mm', leastCount: '0.001mm',
//     department: 'Quality Control', location: 'QC Lab Cabinet C1',
//     frequencyMonths: 12, status: 'Available',
//     lastCalibrationDate: '2024-05-05', nextDueDate: '2025-05-05',
//   },
//   {
//     id: 'g7', gaugeCode: 'PLG-001', name: 'Go/No-Go Plug Gauge Ø10mm',
//     type: 'Plug Gauge', range: 'Ø10mm', leastCount: '0.001mm',
//     department: 'Quality Control', location: 'QC Lab Cabinet C2',
//     frequencyMonths: 12, status: 'Available',
//     lastCalibrationDate: '2023-12-15', nextDueDate: '2024-12-15',
//   },
//   {
//     id: 'g8', gaugeCode: 'PRF-001', name: 'Surface Roughness Tester',
//     type: 'Roughness Tester', range: 'Ra 0.05–10µm', leastCount: '0.001µm',
//     department: 'Quality Control', location: 'QC Lab Shelf B1',
//     frequencyMonths: 12, status: 'Available',
//     lastCalibrationDate: '2024-04-18', nextDueDate: '2025-04-18',
//   },
//   {
//     id: 'g9', gaugeCode: 'TRQ-001', name: 'Torque Wrench 20–100Nm',
//     type: 'Torque Wrench', range: '20–100Nm', leastCount: '1Nm',
//     department: 'Maintenance', location: 'Maint. Cabinet A1',
//     frequencyMonths: 6, status: 'Scrapped',
//     lastCalibrationDate: '2023-06-01', nextDueDate: '2023-12-01',
//   },
//   {
//     id: 'g10', gaugeCode: 'VNR-002', name: 'Vernier Caliper 300mm',
//     type: 'Vernier Caliper', range: '0–300mm', leastCount: '0.02mm',
//     department: 'Production', location: 'Shop Floor Station 2',
//     frequencyMonths: 6, status: 'Available',
//     lastCalibrationDate: '2024-09-01', nextDueDate: '2025-03-01',
//   },
// ];

// const seedCalibrations: CalibrationRecord[] = [
//   {
//     id: 'c1', gaugeId: 'g1', type: 'Internal', standardId: 's1',
//     date: '2024-07-15', readings: [0.02, 0.02, 0.01, 0.02, 0.02],
//     result: 'Pass', technician: 'Rajesh Kumar', nextDueDate: '2025-01-15',
//   },
//   {
//     id: 'c2', gaugeId: 'g2', type: 'External', vendorId: 'v1',
//     date: '2024-06-10', readings: [0.001, 0.001, 0.002, 0.001],
//     result: 'Pass', certificateNo: 'NABL-1023-C4521',
//     certificateValidUntil: '2024-12-10', technician: 'Metrology Solutions',
//     nextDueDate: '2024-12-10',
//   },
//   {
//     id: 'c3', gaugeId: 'g3', type: 'Internal', standardId: 's3',
//     date: '2024-03-20', readings: [0.01, 0.01, 0.02, 0.01, 0.01],
//     result: 'Pass', technician: 'Sunita Rao', nextDueDate: '2025-03-20',
//   },
//   {
//     id: 'c4', gaugeId: 'g7', type: 'Internal', standardId: 's2',
//     date: '2023-12-15', readings: [0.002, 0.003, 0.002, 0.002],
//     result: 'Fail', technician: 'Rajesh Kumar', nextDueDate: '2024-06-15',
//   },
//   {
//     id: 'c5', gaugeId: 'g6', type: 'External', vendorId: 'v2',
//     date: '2024-05-05', readings: [0.001, 0.001, 0.001, 0.001],
//     result: 'Pass', certificateNo: 'NABL-2045-C1234',
//     certificateValidUntil: '2025-05-05', technician: 'Precision Cal India',
//     nextDueDate: '2025-05-05',
//   },
//   {
//     id: 'c6', gaugeId: 'g10', type: 'Internal', standardId: 's1',
//     date: '2024-09-01', readings: [0.02, 0.02, 0.03, 0.02, 0.02],
//     result: 'Pass', technician: 'Sunita Rao', nextDueDate: '2025-03-01',
//   },
// ];

// const seedMSA: MSAStudy[] = [
//   {
//     id: 'm1', gaugeId: 'g1', studyType: 'GRR',
//     operators: ['Rajesh Kumar', 'Sunita Rao', 'Priya Sharma'],
//     sampleParts: ['P1', 'P2', 'P3', 'P4', 'P5'],
//     trialData: [
//       [10.02, 10.01, 10.02, 10.03, 10.02],
//       [10.01, 10.02, 10.01, 10.02, 10.01],
//       [10.02, 10.01, 10.03, 10.02, 10.02],
//     ],
//     resultValue: 8.5, passFail: 'Pass', date: '2024-07-20',
//   },
//   {
//     id: 'm2', gaugeId: 'g3', studyType: 'Linearity',
//     operators: ['Rajesh Kumar'],
//     sampleParts: ['L1', 'L2', 'L3', 'L4', 'L5'],
//     trialData: [[50.01, 100.02, 150.01, 200.03, 250.02]],
//     resultValue: 0.02, passFail: 'Pass', date: '2024-04-10',
//   },
//   {
//     id: 'm3', gaugeId: 'g7', studyType: 'Bias',
//     operators: ['Sunita Rao'],
//     sampleParts: ['REF'],
//     trialData: [[10.003, 10.004, 10.003, 10.004, 10.003]],
//     resultValue: 0.0035, passFail: 'Borderline', date: '2024-01-05',
//   },
//   {
//     id: 'm4', gaugeId: 'g2', studyType: 'GRR',
//     operators: ['Rajesh Kumar', 'Sunita Rao'],
//     sampleParts: ['P1', 'P2', 'P3', 'P4', 'P5'],
//     trialData: [
//       [25.001, 25.002, 25.001, 25.003, 25.002],
//       [25.002, 25.001, 25.002, 25.002, 25.001],
//     ],
//     resultValue: 35.2, passFail: 'Fail', date: '2024-06-15',
//   },
// ];

// const seedCAPAs: CAPA[] = [
//   {
//     id: 'ca1', sourceType: 'Calibration', sourceId: 'c4', gaugeId: 'g7',
//     rootCause: 'Gauge worn beyond tolerance due to frequent use without periodic inspection.',
//     correctiveAction: 'Replace gauge insert and re-verify. Introduce bi-annual visual inspection.',
//     responsiblePerson: 'Rajesh Kumar', targetDate: '2024-07-15',
//     status: 'Closed', closedDate: '2024-07-10',
//   },
//   {
//     id: 'ca2', sourceType: 'MSA', sourceId: 'm4', gaugeId: 'g2',
//     rootCause: 'Inconsistent operator technique and worn micrometer thimble.',
//     correctiveAction: 'Operator retraining, micrometer sent for repair and external re-calibration.',
//     responsiblePerson: 'Sunita Rao', targetDate: '2025-02-28',
//     status: 'Open',
//   },
//   {
//     id: 'ca3', sourceType: 'MSA', sourceId: 'm3', gaugeId: 'g7',
//     rootCause: 'Systematic bias detected possibly due to reference standard drift.',
//     correctiveAction: 'Replace reference standard and repeat bias study.',
//     responsiblePerson: 'Rajesh Kumar', targetDate: '2025-03-15',
//     status: 'Open',
//   },
// ];

// const seedIssueReturn: IssueReturnLog[] = [
//   {
//     id: 'ir1', gaugeId: 'g4', issuedTo: 'Vikram Singh',
//     issueTimestamp: '2025-01-10T09:00:00', status: 'Issued',
//   },
//   {
//     id: 'ir2', gaugeId: 'g1', issuedTo: 'Priya Sharma',
//     issueTimestamp: '2025-01-05T10:30:00',
//     returnTimestamp: '2025-01-06T16:00:00', status: 'Returned',
//   },
//   {
//     id: 'ir3', gaugeId: 'g10', issuedTo: 'Vikram Singh',
//     issueTimestamp: '2025-01-08T08:00:00',
//     returnTimestamp: '2025-01-09T17:00:00', status: 'Returned',
//   },
//   {
//     id: 'ir4', gaugeId: 'g3', issuedTo: 'Priya Sharma',
//     issueTimestamp: '2025-01-12T11:00:00',
//     returnTimestamp: '2025-01-12T15:30:00', status: 'Returned',
//   },
// ];

// const seedAudit: AuditLog[] = [
//   { id: 'al1', action: 'CREATE', entityType: 'Gauge', entityId: 'g1', userId: 'u1', timestamp: '2024-07-01T10:00:00' },
//   { id: 'al2', action: 'CALIBRATE', entityType: 'CalibrationRecord', entityId: 'c1', userId: 'u1', timestamp: '2024-07-15T11:30:00' },
//   { id: 'al3', action: 'ISSUE', entityType: 'IssueReturnLog', entityId: 'ir1', userId: 'u3', timestamp: '2025-01-10T09:00:00' },
//   { id: 'al4', action: 'CLOSE_CAPA', entityType: 'CAPA', entityId: 'ca1', userId: 'u1', timestamp: '2024-07-10T14:00:00' },
//   { id: 'al5', action: 'CREATE', entityType: 'MSAStudy', entityId: 'm1', userId: 'u1', timestamp: '2024-07-20T09:00:00' },
// ];

// // ─── Seeder ───────────────────────────────────────────────────────────────────

// export function seedIfEmpty(): void {
//   if (!localStorage.getItem(KEYS.departments)) setAll(KEYS.departments, seedDepartments);
//   if (!localStorage.getItem(KEYS.users)) setAll(KEYS.users, seedUsers);
//   if (!localStorage.getItem(KEYS.standards)) setAll(KEYS.standards, seedStandards);
//   if (!localStorage.getItem(KEYS.vendors)) setAll(KEYS.vendors, seedVendors);
//   if (!localStorage.getItem(KEYS.gauges)) setAll(KEYS.gauges, seedGauges);
//   if (!localStorage.getItem(KEYS.calibrations)) setAll(KEYS.calibrations, seedCalibrations);
//   if (!localStorage.getItem(KEYS.msa)) setAll(KEYS.msa, seedMSA);
//   if (!localStorage.getItem(KEYS.capa)) setAll(KEYS.capa, seedCAPAs);
//   if (!localStorage.getItem(KEYS.issueReturn)) setAll(KEYS.issueReturn, seedIssueReturn);
//   if (!localStorage.getItem(KEYS.audit)) setAll(KEYS.audit, seedAudit);
// }

// // ─── Gauge CRUD ───────────────────────────────────────────────────────────────

// export const gaugeStorage = {
//   getAll: () => getAll<Gauge>(KEYS.gauges),
//   getById: (id: string) => getAll<Gauge>(KEYS.gauges).find((g) => g.id === id),
//   add: (item: Omit<Gauge, 'id'>) => {
//     const all = getAll<Gauge>(KEYS.gauges);
//     const newItem = { ...item, id: generateId() };
//     setAll(KEYS.gauges, [...all, newItem]);
//     return newItem;
//   },
//   update: (id: string, updates: Partial<Gauge>) => {
//     const all = getAll<Gauge>(KEYS.gauges).map((g) =>
//       g.id === id ? { ...g, ...updates } : g
//     );
//     setAll(KEYS.gauges, all);
//   },
//   delete: (id: string) => {
//     setAll(KEYS.gauges, getAll<Gauge>(KEYS.gauges).filter((g) => g.id !== id));
//   },
// };

// // ─── Standard CRUD ────────────────────────────────────────────────────────────

// export const standardStorage = {
//   getAll: () => getAll<Standard>(KEYS.standards),
//   getById: (id: string) => getAll<Standard>(KEYS.standards).find((s) => s.id === id),
//   add: (item: Omit<Standard, 'id'>) => {
//     const all = getAll<Standard>(KEYS.standards);
//     const newItem = { ...item, id: generateId() };
//     setAll(KEYS.standards, [...all, newItem]);
//     return newItem;
//   },
//   update: (id: string, updates: Partial<Standard>) => {
//     const all = getAll<Standard>(KEYS.standards).map((s) =>
//       s.id === id ? { ...s, ...updates } : s
//     );
//     setAll(KEYS.standards, all);
//   },
//   delete: (id: string) => {
//     setAll(KEYS.standards, getAll<Standard>(KEYS.standards).filter((s) => s.id !== id));
//   },
// };

// // ─── Vendor CRUD ──────────────────────────────────────────────────────────────

// export const vendorStorage = {
//   getAll: () => getAll<Vendor>(KEYS.vendors),
//   getById: (id: string) => getAll<Vendor>(KEYS.vendors).find((v) => v.id === id),
//   add: (item: Omit<Vendor, 'id'>) => {
//     const all = getAll<Vendor>(KEYS.vendors);
//     const newItem = { ...item, id: generateId() };
//     setAll(KEYS.vendors, [...all, newItem]);
//     return newItem;
//   },
//   update: (id: string, updates: Partial<Vendor>) => {
//     const all = getAll<Vendor>(KEYS.vendors).map((v) =>
//       v.id === id ? { ...v, ...updates } : v
//     );
//     setAll(KEYS.vendors, all);
//   },
//   delete: (id: string) => {
//     setAll(KEYS.vendors, getAll<Vendor>(KEYS.vendors).filter((v) => v.id !== id));
//   },
// };

// // ─── Calibration CRUD ─────────────────────────────────────────────────────────

// export const calibrationStorage = {
//   getAll: () => getAll<CalibrationRecord>(KEYS.calibrations),
//   getById: (id: string) =>
//     getAll<CalibrationRecord>(KEYS.calibrations).find((c) => c.id === id),
//   getByGaugeId: (gaugeId: string) =>
//     getAll<CalibrationRecord>(KEYS.calibrations).filter((c) => c.gaugeId === gaugeId),
//   add: (item: Omit<CalibrationRecord, 'id'>) => {
//     const all = getAll<CalibrationRecord>(KEYS.calibrations);
//     const newItem = { ...item, id: generateId() };
//     setAll(KEYS.calibrations, [...all, newItem]);
//     return newItem;
//   },
//   update: (id: string, updates: Partial<CalibrationRecord>) => {
//     const all = getAll<CalibrationRecord>(KEYS.calibrations).map((c) =>
//       c.id === id ? { ...c, ...updates } : c
//     );
//     setAll(KEYS.calibrations, all);
//   },
//   delete: (id: string) => {
//     setAll(
//       KEYS.calibrations,
//       getAll<CalibrationRecord>(KEYS.calibrations).filter((c) => c.id !== id)
//     );
//   },
// };

// // ─── MSA CRUD ─────────────────────────────────────────────────────────────────

// export const msaStorage = {
//   getAll: () => getAll<MSAStudy>(KEYS.msa),
//   getById: (id: string) => getAll<MSAStudy>(KEYS.msa).find((m) => m.id === id),
//   getByGaugeId: (gaugeId: string) =>
//     getAll<MSAStudy>(KEYS.msa).filter((m) => m.gaugeId === gaugeId),
//   add: (item: Omit<MSAStudy, 'id'>) => {
//     const all = getAll<MSAStudy>(KEYS.msa);
//     const newItem = { ...item, id: generateId() };
//     setAll(KEYS.msa, [...all, newItem]);
//     return newItem;
//   },
//   update: (id: string, updates: Partial<MSAStudy>) => {
//     const all = getAll<MSAStudy>(KEYS.msa).map((m) =>
//       m.id === id ? { ...m, ...updates } : m
//     );
//     setAll(KEYS.msa, all);
//   },
//   delete: (id: string) => {
//     setAll(KEYS.msa, getAll<MSAStudy>(KEYS.msa).filter((m) => m.id !== id));
//   },
// };

// // ─── CAPA CRUD ────────────────────────────────────────────────────────────────

// export const capaStorage = {
//   getAll: () => getAll<CAPA>(KEYS.capa),
//   getById: (id: string) => getAll<CAPA>(KEYS.capa).find((c) => c.id === id),
//   getByGaugeId: (gaugeId: string) =>
//     getAll<CAPA>(KEYS.capa).filter((c) => c.gaugeId === gaugeId),
//   add: (item: Omit<CAPA, 'id'>) => {
//     const all = getAll<CAPA>(KEYS.capa);
//     const newItem = { ...item, id: generateId() };
//     setAll(KEYS.capa, [...all, newItem]);
//     return newItem;
//   },
//   update: (id: string, updates: Partial<CAPA>) => {
//     const all = getAll<CAPA>(KEYS.capa).map((c) =>
//       c.id === id ? { ...c, ...updates } : c
//     );
//     setAll(KEYS.capa, all);
//   },
//   delete: (id: string) => {
//     setAll(KEYS.capa, getAll<CAPA>(KEYS.capa).filter((c) => c.id !== id));
//   },
// };

// // ─── Issue/Return CRUD ────────────────────────────────────────────────────────

// export const issueReturnStorage = {
//   getAll: () => getAll<IssueReturnLog>(KEYS.issueReturn),
//   getById: (id: string) =>
//     getAll<IssueReturnLog>(KEYS.issueReturn).find((i) => i.id === id),
//   getByGaugeId: (gaugeId: string) =>
//     getAll<IssueReturnLog>(KEYS.issueReturn).filter((i) => i.gaugeId === gaugeId),
//   add: (item: Omit<IssueReturnLog, 'id'>) => {
//     const all = getAll<IssueReturnLog>(KEYS.issueReturn);
//     const newItem = { ...item, id: generateId() };
//     setAll(KEYS.issueReturn, [...all, newItem]);
//     return newItem;
//   },
//   update: (id: string, updates: Partial<IssueReturnLog>) => {
//     const all = getAll<IssueReturnLog>(KEYS.issueReturn).map((i) =>
//       i.id === id ? { ...i, ...updates } : i
//     );
//     setAll(KEYS.issueReturn, all);
//   },
// };

// // ─── App User CRUD ────────────────────────────────────────────────────────────

// export const appUserStorage = {
//   getAll: () => getAll<AppUser>(KEYS.users),
//   getById: (id: string) => getAll<AppUser>(KEYS.users).find((u) => u.id === id),
//   add: (item: Omit<AppUser, 'id'>) => {
//     const all = getAll<AppUser>(KEYS.users);
//     const newItem = { ...item, id: generateId() };
//     setAll(KEYS.users, [...all, newItem]);
//     return newItem;
//   },
//   update: (id: string, updates: Partial<AppUser>) => {
//     const all = getAll<AppUser>(KEYS.users).map((u) =>
//       u.id === id ? { ...u, ...updates } : u
//     );
//     setAll(KEYS.users, all);
//   },
//   delete: (id: string) => {
//     setAll(KEYS.users, getAll<AppUser>(KEYS.users).filter((u) => u.id !== id));
//   },
// };

// // ─── Department CRUD ──────────────────────────────────────────────────────────

// export const departmentStorage = {
//   getAll: () => getAll<AppDepartment>(KEYS.departments),
//   getById: (id: string) =>
//     getAll<AppDepartment>(KEYS.departments).find((d) => d.id === id),
//   add: (item: Omit<AppDepartment, 'id'>) => {
//     const all = getAll<AppDepartment>(KEYS.departments);
//     const newItem = { ...item, id: generateId() };
//     setAll(KEYS.departments, [...all, newItem]);
//     return newItem;
//   },
//   update: (id: string, updates: Partial<AppDepartment>) => {
//     const all = getAll<AppDepartment>(KEYS.departments).map((d) =>
//       d.id === id ? { ...d, ...updates } : d
//     );
//     setAll(KEYS.departments, all);
//   },
//   delete: (id: string) => {
//     setAll(
//       KEYS.departments,
//       getAll<AppDepartment>(KEYS.departments).filter((d) => d.id !== id)
//     );
//   },
// };

// // ─── Audit Log ────────────────────────────────────────────────────────────────

// export const auditStorage = {
//   getAll: () => getAll<AuditLog>(KEYS.audit).sort(
//     (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
//   ),
//   add: (item: Omit<AuditLog, 'id'>) => {
//     const all = getAll<AuditLog>(KEYS.audit);
//     const newItem = { ...item, id: generateId() };
//     setAll(KEYS.audit, [...all, newItem]);
//     return newItem;
//   },
// };


// src/utils/storage.ts

// ═══════════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════════

export interface Gauge {
  id: string;
  gaugeCode: string;
  name: string;
  type: string;
  range: string;
  leastCount: string;
  department: string;
  location: string;
  frequencyMonths: number;
  status: 'Available' | 'Issued' | 'Under Calibration' | 'Under MSA Study' | 'Under Review' | 'Scrapped';
  lastCalibrationDate: string;
  nextDueDate: string;
}

export interface Standard {
  id: string;
  standardCode: string;
  description: string;
  certifiedValue: string;
  validUntil: string;
}

export interface Vendor {
  id: string;
  name: string;
  accreditationNo: string;
  scope: string;
  contact: string;
}

export interface CalibrationRecord {
  id: string;
  gaugeId: string;
  type: 'Internal' | 'External';
  standardId?: string;
  vendorId?: string;
  date: string;
  readings: number[];
  result: 'Pass' | 'Fail';
  certificateNo?: string;
  certificateValidUntil?: string;
  technician: string;
  nextDueDate: string;
}

export interface MSAOperatorMeasurement {
  operatorId: string;
  operatorName: string;
  status: 'Pending' | 'Completed';
  data: number[][]; // [partIndex][trialIndex]
  submittedAt?: string;
}
export interface MSAStudy {
  id: string;
  gaugeId: string;
  studyType: 'GRR' | 'Linearity' | 'Bias' | 'Uncertainty';

  // Setup
  operatorIds: string[];
  operatorNames: string[];
  partIds: string[];             // NEW — Part IDs from Part master
  parts: string[];               // Part names (for display/backward compat)
  numberOfTrials: number;

  // Linearity/Bias — auto-pulled from selected Parts (their trueValues)
  referenceValues?: number[];

  // For Bias specifically (single reference)
  biasReferenceValue?: number;
  biasNumberOfReadings?: number;

  // For Uncertainty — link to source GRR study + additional components
  linkedGrrStudyId?: string;
  standardUncertainty?: number;  // From calibration cert
  resolution?: number;           // Gauge resolution

  // Status & Measurements
  status: 'Pending Measurements' | 'In Progress' | 'Completed' | 'Failed';
  measurements: MSAOperatorMeasurement[];

  // ─── DETAILED CALCULATION RESULTS ─────────────────────────────
  resultValue?: number;          // Primary result (%GRR / bias / linearity max dev / U)
  passFail?: 'Pass' | 'Borderline' | 'Fail';

  // GRR specific
  ev?: number;                   // Equipment Variation (raw)
  av?: number;                   // Appraiser Variation (raw)
  grr?: number;                  // GRR (raw)
  pv?: number;                   // Part Variation (raw)
  tv?: number;                   // Total Variation (raw)
  evPercent?: number;            // %EV
  avPercent?: number;            // %AV
  grrPercent?: number;           // %GRR
  pvPercent?: number;            // %PV
  ndc?: number;                  // Number of Distinct Categories

  // Bias specific
  biasValue?: number;            // The calculated bias
  biasTStatistic?: number;       // t-statistic
  biasSignificant?: boolean;     // Is bias statistically significant?
  biasStdDev?: number;

  // Linearity specific
  linearitySlope?: number;
  linearityIntercept?: number;
  linearityRSquared?: number;
  linearityMaxBias?: number;
  linearityPointResults?: {
    referenceValue: number;
    avgMeasured: number;
    bias: number;
  }[];

  // Uncertainty specific
  uRepeatability?: number;       // u from EV
  uReproducibility?: number;     // u from AV
  uReference?: number;           // u from standard
  uResolution?: number;          // u from resolution
  combinedUncertainty?: number;  // u_c
  expandedUncertainty?: number;  // U = k × u_c
  coverageFactor?: number;       // k (usually 2)

  createdBy: string;
  createdDate: string;
  completedDate?: string;
}
export interface CAPA {
  id: string;
  sourceType: 'Calibration' | 'MSA';
  sourceId: string;
  gaugeId: string;
  rootCause: string;
  correctiveAction: string;
  responsiblePerson: string;
  targetDate: string;
  status: 'Open' | 'Closed';
  closedDate?: string;
}

export interface IssueReturnLog {
  id: string;
  gaugeId: string;
  issuedTo: string;
  issueTimestamp: string;
  returnTimestamp?: string;
  status: 'Issued' | 'Returned';
}

export interface AppUser {
  id: string;
  fullName: string;
  loginId: string;
  role: string;
  department: string;
}

export interface AppDepartment {
  id: string;
  name: string;
  code: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  timestamp: string;
}

export interface Operator {
  id: string;
  name: string;
  employeeCode: string;
  department: string;
}

export interface Part {
  id: string;
  partName: string;              // "Part A - Lower Extreme"
  partNumber: string;            // "P-001"
  description: string;
  specification: string;         // "25.000 ±0.050 mm"
  upperSpecLimit: number;        // 25.050
  lowerSpecLimit: number;        // 24.950
  tolerance: number;             // 0.100
  nominalValue: number;          // 25.000
  trueValue: number;             // 24.952 (known reference value)
  characteristic: string;        // "Shaft Diameter"
  isActive: boolean;
}

export interface Location {
  id: string;
  name: string;
  departmentId: string;
  departmentName: string;
  description: string;
  isActive: boolean;
}
// ═══════════════════════════════════════════════════════════════════
// STORAGE KEYS
// ═══════════════════════════════════════════════════════════════════

const KEYS = {
  gauges: 'gm_gauges',
  standards: 'gm_standards',
  vendors: 'gm_vendors',
  calibrations: 'gm_calibrations',
  msa: 'gm_msa_v3',
  capa: 'gm_capa',
  issueReturn: 'gm_issue_return',
  users: 'gm_users',
  departments: 'gm_departments',
  audit: 'gm_audit',
  operators: 'gm_operators',
  parts: 'gm_parts_v2', 
  locations: 'gm_locations',
};

// ═══════════════════════════════════════════════════════════════════
// GENERIC HELPERS
// ═══════════════════════════════════════════════════════════════════

function getAll<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setAll<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ═══════════════════════════════════════════════════════════════════
// SEED DATA
// ═══════════════════════════════════════════════════════════════════

// ─── Departments ────────────────────────────────────────────────────
const seedDepartments: AppDepartment[] = [
  { id: 'd1', name: 'Quality Control', code: 'QC' },
  { id: 'd2', name: 'Production', code: 'PROD' },
  { id: 'd3', name: 'Gauge Room', code: 'GR' },
  { id: 'd4', name: 'Maintenance', code: 'MAINT' },
  { id: 'd5', name: 'Stores', code: 'STORE' },
];

// ─── Users ──────────────────────────────────────────────────────────
const seedUsers: AppUser[] = [
  { id: 'u1', fullName: 'Rajesh Kumar', loginId: 'rajesh.kumar', role: 'Quality Engineer', department: 'Quality Control' },
  { id: 'u2', fullName: 'Priya Sharma', loginId: 'priya.sharma', role: 'Shop Floor Operator', department: 'Production' },
  { id: 'u3', fullName: 'Anil Mehta', loginId: 'anil.mehta', role: 'Store Keeper', department: 'Stores' },
  { id: 'u4', fullName: 'Sunita Rao', loginId: 'sunita.rao', role: 'Quality Engineer', department: 'Quality Control' },
  { id: 'u5', fullName: 'Vikram Singh', loginId: 'vikram.singh', role: 'Shop Floor Operator', department: 'Production' },
];

// ─── Operators ──────────────────────────────────────────────────────
const seedOperators: Operator[] = [
  { id: 'op1', name: 'Rajesh Kumar', employeeCode: 'EMP-001', department: 'Quality Control' },
  { id: 'op2', name: 'Priya Sharma', employeeCode: 'EMP-002', department: 'Production' },
  { id: 'op3', name: 'Sunita Rao', employeeCode: 'EMP-003', department: 'Quality Control' },
  { id: 'op4', name: 'Vikram Singh', employeeCode: 'EMP-004', department: 'Production' },
  { id: 'op5', name: 'Anil Mehta', employeeCode: 'EMP-005', department: 'Stores' },
  { id: 'op6', name: 'Deepa Nair', employeeCode: 'EMP-006', department: 'Quality Control' },
];

// ─── Parts ──────────────────────────────────────────────────────────
// ─── Seed Parts (with real true values for MSA calculations) ────────
const seedParts: Part[] = [
  {
    id: 'pt1', partName: 'Part A - Lower Extreme', partNumber: 'P-001',
    description: 'Crankshaft Bearing Housing - near lower spec',
    specification: '25.000 ±0.050 mm',
    upperSpecLimit: 25.050, lowerSpecLimit: 24.950, tolerance: 0.100,
    nominalValue: 25.000, trueValue: 24.952,
    characteristic: 'Shaft Diameter', isActive: true,
  },
  {
    id: 'pt2', partName: 'Part B - Low', partNumber: 'P-002',
    description: 'Cylinder Head Bore - below nominal',
    specification: '25.000 ±0.050 mm',
    upperSpecLimit: 25.050, lowerSpecLimit: 24.950, tolerance: 0.100,
    nominalValue: 25.000, trueValue: 24.965,
    characteristic: 'Shaft Diameter', isActive: true,
  },
  {
    id: 'pt3', partName: 'Part C - Low Mid', partNumber: 'P-003',
    description: 'Piston Pin Hole - slightly below nominal',
    specification: '25.000 ±0.050 mm',
    upperSpecLimit: 25.050, lowerSpecLimit: 24.950, tolerance: 0.100,
    nominalValue: 25.000, trueValue: 24.978,
    characteristic: 'Shaft Diameter', isActive: true,
  },
  {
    id: 'pt4', partName: 'Part D - Nominal Low', partNumber: 'P-004',
    description: 'Connecting Rod Small End - just below nominal',
    specification: '25.000 ±0.050 mm',
    upperSpecLimit: 25.050, lowerSpecLimit: 24.950, tolerance: 0.100,
    nominalValue: 25.000, trueValue: 24.991,
    characteristic: 'Shaft Diameter', isActive: true,
  },
  {
    id: 'pt5', partName: 'Part E - Nominal', partNumber: 'P-005',
    description: 'Valve Guide ID - exactly at nominal',
    specification: '25.000 ±0.050 mm',
    upperSpecLimit: 25.050, lowerSpecLimit: 24.950, tolerance: 0.100,
    nominalValue: 25.000, trueValue: 25.000,
    characteristic: 'Shaft Diameter', isActive: true,
  },
  {
    id: 'pt6', partName: 'Part F - Nominal High', partNumber: 'P-006',
    description: 'Cam Bore Diameter - just above nominal',
    specification: '25.000 ±0.050 mm',
    upperSpecLimit: 25.050, lowerSpecLimit: 24.950, tolerance: 0.100,
    nominalValue: 25.000, trueValue: 25.013,
    characteristic: 'Shaft Diameter', isActive: true,
  },
  {
    id: 'pt7', partName: 'Part G - High', partNumber: 'P-007',
    description: 'Flywheel Face Runout - above nominal',
    specification: '25.000 ±0.050 mm',
    upperSpecLimit: 25.050, lowerSpecLimit: 24.950, tolerance: 0.100,
    nominalValue: 25.000, trueValue: 25.027,
    characteristic: 'Shaft Diameter', isActive: true,
  },
  {
    id: 'pt8', partName: 'Part H - Upper Extreme', partNumber: 'P-008',
    description: 'Main Journal Diameter - near upper spec',
    specification: '25.000 ±0.050 mm',
    upperSpecLimit: 25.050, lowerSpecLimit: 24.950, tolerance: 0.100,
    nominalValue: 25.000, trueValue: 25.041,
    characteristic: 'Shaft Diameter', isActive: true,
  },
  {
    id: 'pt9', partName: 'Part I - Reference', partNumber: 'P-009',
    description: 'Master Reference Part for Bias studies',
    specification: '10.000 ±0.010 mm',
    upperSpecLimit: 10.010, lowerSpecLimit: 9.990, tolerance: 0.020,
    nominalValue: 10.000, trueValue: 10.000,
    characteristic: 'Reference Diameter', isActive: true,
  },
  {
    id: 'pt10', partName: 'Part J - Reference', partNumber: 'P-010',
    description: 'Secondary Master Reference',
    specification: '50.000 ±0.010 mm',
    upperSpecLimit: 50.010, lowerSpecLimit: 49.990, tolerance: 0.020,
    nominalValue: 50.000, trueValue: 50.000,
    characteristic: 'Reference Diameter', isActive: true,
  },
];

// ─── Seed Locations ─────────────────────────────────────────────────
// ─── Seed Locations (matches backend department names) ──────────────
const seedLocations: Location[] = [
  // Quality Control locations
  { id: 'loc1',  name: 'Shelf A1',          departmentId: '1', departmentName: 'Quality Control', description: 'Top shelf, QC Lab entrance side', isActive: true },
  { id: 'loc2',  name: 'Shelf A2',          departmentId: '1', departmentName: 'Quality Control', description: 'Second shelf, QC Lab entrance side', isActive: true },
  { id: 'loc3',  name: 'Shelf B1',          departmentId: '1', departmentName: 'Quality Control', description: 'Top shelf, QC Lab window side', isActive: true },
  { id: 'loc4',  name: 'Cabinet C1',        departmentId: '1', departmentName: 'Quality Control', description: 'Locked cabinet for ring gauges', isActive: true },
  { id: 'loc5',  name: 'Cabinet C2',        departmentId: '1', departmentName: 'Quality Control', description: 'Locked cabinet for plug gauges', isActive: true },

  // Production locations
  { id: 'loc6',  name: 'Station 1',         departmentId: '2', departmentName: 'Production',      description: 'CNC Machine 1 area', isActive: true },
  { id: 'loc7',  name: 'Station 2',         departmentId: '2', departmentName: 'Production',      description: 'CNC Machine 2 area', isActive: true },
  { id: 'loc8',  name: 'Station 3',         departmentId: '2', departmentName: 'Production',      description: 'Assembly line inspection point', isActive: true },
  { id: 'loc9',  name: 'Inspection Table',  departmentId: '2', departmentName: 'Production',      description: 'Final inspection area', isActive: true },

  // Gauge Room locations
  { id: 'loc10', name: 'Rack 1',            departmentId: '3', departmentName: 'Gauge Room',      description: 'Main storage rack, temperature controlled', isActive: true },
  { id: 'loc11', name: 'Rack 2',            departmentId: '3', departmentName: 'Gauge Room',      description: 'Secondary rack near calibration bench', isActive: true },
  { id: 'loc12', name: 'Calibration Bench', departmentId: '3', departmentName: 'Gauge Room',      description: 'Calibration workbench area', isActive: true },

  // Maintenance locations
  { id: 'loc13', name: 'Cabinet A1',        departmentId: '4', departmentName: 'Maintenance',     description: 'Torque tools cabinet', isActive: true },
  { id: 'loc14', name: 'Cabinet B3',        departmentId: '4', departmentName: 'Maintenance',     description: 'Feeler gauge and gap tools', isActive: true },
  { id: 'loc15', name: 'Workbench 1',       departmentId: '4', departmentName: 'Maintenance',     description: 'Main maintenance workbench', isActive: true },

  // Stores locations
  { id: 'loc16', name: 'Bin A1',            departmentId: '5', departmentName: 'Stores',          description: 'Incoming gauge storage', isActive: true },
  { id: 'loc17', name: 'Bin A2',            departmentId: '5', departmentName: 'Stores',          description: 'Outgoing gauge staging', isActive: true },
  { id: 'loc18', name: 'Returns Shelf',     departmentId: '5', departmentName: 'Stores',          description: 'Returned gauges awaiting inspection', isActive: true },
];
// ─── Standards ───────────────────────────────────────────────────────
const seedStandards: Standard[] = [
  { id: 's1', standardCode: 'STD-001', description: 'Gauge Block Set Grade 1', certifiedValue: '0–100mm ±0.001mm', validUntil: '2025-12-31' },
  { id: 's2', standardCode: 'STD-002', description: 'Ring Gauge Master Ø25mm', certifiedValue: '25.000mm ±0.0005mm', validUntil: '2025-09-30' },
  { id: 's3', standardCode: 'STD-003', description: 'Surface Plate Grade A', certifiedValue: 'Flatness 0.003mm', validUntil: '2026-03-15' },
  { id: 's4', standardCode: 'STD-004', description: 'Load Cell 500N NABL', certifiedValue: '500N ±0.1N', validUntil: '2025-11-20' },
];

// ─── Vendors ────────────────────────────────────────────────────────
const seedVendors: Vendor[] = [
  { id: 'v1', name: 'Metrology Solutions Pvt Ltd', accreditationNo: 'NABL-1023', scope: 'Vernier Caliper, Ring Gauge, Plug Gauge', contact: '+91-9876543210' },
  { id: 'v2', name: 'Precision Cal India', accreditationNo: 'NABL-2045', scope: 'Micrometer, Height Gauge, Dial Indicator', contact: '+91-9123456780' },
  { id: 'v3', name: 'TechCal Services', accreditationNo: 'NABL-3067', scope: 'Torque Wrench, Bore Gauge, Thread Gauge', contact: '+91-9988776655' },
];

// ─── Gauges ─────────────────────────────────────────────────────────
const seedGauges: Gauge[] = [
  {
    id: 'g1', gaugeCode: 'VNR-001', name: 'Vernier Caliper 150mm',
    type: 'Vernier Caliper', range: '0–150mm', leastCount: '0.02mm',
    department: 'Quality Control', location: 'QC Lab Shelf A1',
    frequencyMonths: 6, status: 'Available',
    lastCalibrationDate: '2024-07-15', nextDueDate: '2025-01-15',
  },
  {
    id: 'g2', gaugeCode: 'MIC-001', name: 'Outside Micrometer 0-25mm',
    type: 'Micrometer', range: '0–25mm', leastCount: '0.001mm',
    department: 'Quality Control', location: 'QC Lab Shelf A2',
    frequencyMonths: 6, status: 'Under Calibration',
    lastCalibrationDate: '2024-06-10', nextDueDate: '2024-12-10',
  },
  {
    id: 'g3', gaugeCode: 'DIG-001', name: 'Digital Height Gauge 300mm',
    type: 'Height Gauge', range: '0–300mm', leastCount: '0.01mm',
    department: 'Production', location: 'Shop Floor Station 3',
    frequencyMonths: 12, status: 'Available',
    lastCalibrationDate: '2024-03-20', nextDueDate: '2025-03-20',
  },
  {
    id: 'g4', gaugeCode: 'DTI-001', name: 'Dial Test Indicator',
    type: 'Dial Indicator', range: '0–10mm', leastCount: '0.01mm',
    department: 'Production', location: 'Shop Floor Station 1',
    frequencyMonths: 6, status: 'Issued',
    lastCalibrationDate: '2024-08-01', nextDueDate: '2025-02-01',
  },
  {
    id: 'g5', gaugeCode: 'THK-001', name: 'Feeler Gauge Set',
    type: 'Feeler Gauge', range: '0.05–1.0mm', leastCount: '0.05mm',
    department: 'Maintenance', location: 'Maint. Cabinet B3',
    frequencyMonths: 12, status: 'Available',
    lastCalibrationDate: '2024-01-10', nextDueDate: '2025-01-10',
  },
  {
    id: 'g6', gaugeCode: 'RNG-001', name: 'Plain Ring Gauge Ø25mm',
    type: 'Ring Gauge', range: 'Ø25mm', leastCount: '0.001mm',
    department: 'Quality Control', location: 'QC Lab Cabinet C1',
    frequencyMonths: 12, status: 'Available',
    lastCalibrationDate: '2024-05-05', nextDueDate: '2025-05-05',
  },
  {
    id: 'g7', gaugeCode: 'PLG-001', name: 'Go/No-Go Plug Gauge Ø10mm',
    type: 'Plug Gauge', range: 'Ø10mm', leastCount: '0.001mm',
    department: 'Quality Control', location: 'QC Lab Cabinet C2',
    frequencyMonths: 12, status: 'Available',
    lastCalibrationDate: '2023-12-15', nextDueDate: '2024-12-15',
  },
  {
    id: 'g8', gaugeCode: 'PRF-001', name: 'Surface Roughness Tester',
    type: 'Roughness Tester', range: 'Ra 0.05–10µm', leastCount: '0.001µm',
    department: 'Quality Control', location: 'QC Lab Shelf B1',
    frequencyMonths: 12, status: 'Available',
    lastCalibrationDate: '2024-04-18', nextDueDate: '2025-04-18',
  },
  {
    id: 'g9', gaugeCode: 'TRQ-001', name: 'Torque Wrench 20–100Nm',
    type: 'Torque Wrench', range: '20–100Nm', leastCount: '1Nm',
    department: 'Maintenance', location: 'Maint. Cabinet A1',
    frequencyMonths: 6, status: 'Scrapped',
    lastCalibrationDate: '2023-06-01', nextDueDate: '2023-12-01',
  },
  {
    id: 'g10', gaugeCode: 'VNR-002', name: 'Vernier Caliper 300mm',
    type: 'Vernier Caliper', range: '0–300mm', leastCount: '0.02mm',
    department: 'Production', location: 'Shop Floor Station 2',
    frequencyMonths: 6, status: 'Available',
    lastCalibrationDate: '2024-09-01', nextDueDate: '2025-03-01',
  },
];

// ─── Calibrations ───────────────────────────────────────────────────
const seedCalibrations: CalibrationRecord[] = [
  {
    id: 'c1', gaugeId: 'g1', type: 'Internal', standardId: 's1',
    date: '2024-07-15', readings: [0.02, 0.02, 0.01, 0.02, 0.02],
    result: 'Pass', technician: 'Rajesh Kumar', nextDueDate: '2025-01-15',
  },
  {
    id: 'c2', gaugeId: 'g2', type: 'External', vendorId: 'v1',
    date: '2024-06-10', readings: [0.001, 0.001, 0.002, 0.001],
    result: 'Pass', certificateNo: 'NABL-1023-C4521',
    certificateValidUntil: '2024-12-10', technician: 'Metrology Solutions',
    nextDueDate: '2024-12-10',
  },
  {
    id: 'c3', gaugeId: 'g3', type: 'Internal', standardId: 's3',
    date: '2024-03-20', readings: [0.01, 0.01, 0.02, 0.01, 0.01],
    result: 'Pass', technician: 'Sunita Rao', nextDueDate: '2025-03-20',
  },
  {
    id: 'c4', gaugeId: 'g7', type: 'Internal', standardId: 's2',
    date: '2023-12-15', readings: [0.002, 0.003, 0.002, 0.002],
    result: 'Fail', technician: 'Rajesh Kumar', nextDueDate: '2024-06-15',
  },
  {
    id: 'c5', gaugeId: 'g6', type: 'External', vendorId: 'v2',
    date: '2024-05-05', readings: [0.001, 0.001, 0.001, 0.001],
    result: 'Pass', certificateNo: 'NABL-2045-C1234',
    certificateValidUntil: '2025-05-05', technician: 'Precision Cal India',
    nextDueDate: '2025-05-05',
  },
  {
    id: 'c6', gaugeId: 'g10', type: 'Internal', standardId: 's1',
    date: '2024-09-01', readings: [0.02, 0.02, 0.03, 0.02, 0.02],
    result: 'Pass', technician: 'Sunita Rao', nextDueDate: '2025-03-01',
  },
];

// ─── MSA Studies (new format) ───────────────────────────────────────
// const seedMSA: MSAStudy[] = [
//   {
//     id: 'm1',
//     gaugeId: 'g1',
//     studyType: 'GRR',
//     operatorIds: ['op1', 'op3', 'op2'],
//     operatorNames: ['Rajesh Kumar', 'Sunita Rao', 'Priya Sharma'],
//     parts: ['P1', 'P2', 'P3', 'P4', 'P5'],
//     numberOfTrials: 3,
//     status: 'Completed',
//     measurements: [
//       {
//         operatorId: 'op1', operatorName: 'Rajesh Kumar', status: 'Completed',
//         data: [
//           [10.02, 10.01, 10.02], [10.01, 10.02, 10.01], [10.02, 10.01, 10.03],
//           [10.03, 10.02, 10.02], [10.02, 10.02, 10.01],
//         ],
//         submittedAt: '2024-07-21T10:30:00',
//       },
//       {
//         operatorId: 'op3', operatorName: 'Sunita Rao', status: 'Completed',
//         data: [
//           [10.01, 10.02, 10.01], [10.02, 10.01, 10.02], [10.01, 10.02, 10.02],
//           [10.02, 10.02, 10.01], [10.01, 10.01, 10.02],
//         ],
//         submittedAt: '2024-07-21T14:15:00',
//       },
//       {
//         operatorId: 'op2', operatorName: 'Priya Sharma', status: 'Completed',
//         data: [
//           [10.02, 10.01, 10.02], [10.01, 10.02, 10.01], [10.03, 10.02, 10.02],
//           [10.02, 10.01, 10.02], [10.02, 10.02, 10.01],
//         ],
//         submittedAt: '2024-07-22T09:00:00',
//       },
//     ],
//     resultValue: 8.5,
//     passFail: 'Pass',
//     createdBy: 'Admin',
//     createdDate: '2024-07-20',
//     completedDate: '2024-07-22',
//   },
//   {
//     id: 'm2',
//     gaugeId: 'g3',
//     studyType: 'GRR',
//     operatorIds: ['op1', 'op4'],
//     operatorNames: ['Rajesh Kumar', 'Vikram Singh'],
//     parts: ['P1', 'P2', 'P3', 'P4', 'P5'],
//     numberOfTrials: 2,
//     status: 'Pending Measurements',
//     measurements: [
//       { operatorId: 'op1', operatorName: 'Rajesh Kumar', status: 'Pending', data: [] },
//       { operatorId: 'op4', operatorName: 'Vikram Singh', status: 'Pending', data: [] },
//     ],
//     createdBy: 'Admin',
//     createdDate: '2025-01-15',
//   },
//   {
//     id: 'm3',
//     gaugeId: 'g2',
//     studyType: 'GRR',
//     operatorIds: ['op1', 'op3'],
//     operatorNames: ['Rajesh Kumar', 'Sunita Rao'],
//     parts: ['P1', 'P2', 'P3', 'P4', 'P5'],
//     numberOfTrials: 3,
//     status: 'Failed',
//     measurements: [
//       {
//         operatorId: 'op1', operatorName: 'Rajesh Kumar', status: 'Completed',
//         data: [
//           [25.001, 25.002, 25.003], [25.002, 25.001, 25.004], [25.001, 25.003, 25.002],
//           [25.003, 25.002, 25.001], [25.002, 25.001, 25.002],
//         ],
//         submittedAt: '2024-06-16T11:00:00',
//       },
//       {
//         operatorId: 'op3', operatorName: 'Sunita Rao', status: 'Completed',
//         data: [
//           [25.005, 25.001, 25.006], [25.001, 25.004, 25.002], [25.006, 25.002, 25.005],
//           [25.002, 25.005, 25.001], [25.004, 25.001, 25.006],
//         ],
//         submittedAt: '2024-06-16T15:00:00',
//       },
//     ],
//     resultValue: 35.2,
//     passFail: 'Fail',
//     createdBy: 'Admin',
//     createdDate: '2024-06-15',
//     completedDate: '2024-06-16',
//   },
//   {
//     id: 'm4',
//     gaugeId: 'g6',
//     studyType: 'Linearity',
//     operatorIds: ['op1'],
//     operatorNames: ['Rajesh Kumar'],
//     parts: ['Ref 1', 'Ref 2', 'Ref 3', 'Ref 4', 'Ref 5'],
//     numberOfTrials: 3,
//     referenceValues: [50, 100, 150, 200, 250],
//     status: 'Completed',
//     measurements: [
//       {
//         operatorId: 'op1', operatorName: 'Rajesh Kumar', status: 'Completed',
//         data: [
//           [50.01, 50.00, 50.01], [100.02, 100.01, 100.02], [150.01, 150.02, 150.01],
//           [200.03, 200.02, 200.03], [250.02, 250.01, 250.02],
//         ],
//         submittedAt: '2024-04-11T10:00:00',
//       },
//     ],
//     resultValue: 0.02,
//     passFail: 'Pass',
//     createdBy: 'Admin',
//     createdDate: '2024-04-10',
//     completedDate: '2024-04-11',
//   },
//   {
//     id: 'm5',
//     gaugeId: 'g7',
//     studyType: 'Bias',
//     operatorIds: ['op3'],
//     operatorNames: ['Sunita Rao'],
//     parts: ['REF'],
//     numberOfTrials: 1,
//     biasReferenceValue: 10.000,
//     biasNumberOfReadings: 10,
//     status: 'Completed',
//     measurements: [
//       {
//         operatorId: 'op3', operatorName: 'Sunita Rao', status: 'Completed',
//         data: [
//           [10.003], [10.004], [10.003], [10.004], [10.003],
//           [10.004], [10.003], [10.003], [10.004], [10.003],
//         ],
//         submittedAt: '2024-01-06T14:00:00',
//       },
//     ],
//     resultValue: 0.0034,
//     passFail: 'Borderline',
//     createdBy: 'Admin',
//     createdDate: '2024-01-05',
//     completedDate: '2024-01-06',
//   },
// ];

const seedMSA: MSAStudy[] = [];
// ─── CAPAs ──────────────────────────────────────────────────────────
const seedCAPAs: CAPA[] = [
  {
    id: 'ca1', sourceType: 'Calibration', sourceId: 'c4', gaugeId: 'g7',
    rootCause: 'Gauge worn beyond tolerance due to frequent use without periodic inspection.',
    correctiveAction: 'Replace gauge insert and re-verify. Introduce bi-annual visual inspection.\n\n--- Closure Notes ---\nGauge insert replaced. Re-verified and found within tolerance.\n\nVerification: Re-calibration passed on 2024-07-08.',
    responsiblePerson: 'Rajesh Kumar', targetDate: '2024-07-15',
    status: 'Closed', closedDate: '2024-07-10',
  },
  {
    id: 'ca2', sourceType: 'MSA', sourceId: 'm3', gaugeId: 'g2',
    rootCause: 'Inconsistent operator technique and worn micrometer thimble causing high GR&R.',
    correctiveAction: 'Operator retraining on micrometer use. Micrometer sent for repair and external re-calibration.',
    responsiblePerson: 'Sunita Rao', targetDate: '2025-02-28',
    status: 'Open',
  },
  {
    id: 'ca3', sourceType: 'MSA', sourceId: 'm5', gaugeId: 'g7',
    rootCause: 'Systematic bias detected possibly due to reference standard drift.',
    correctiveAction: 'Replace reference standard and repeat bias study.',
    responsiblePerson: 'Rajesh Kumar', targetDate: '2025-03-15',
    status: 'Open',
  },
];

// ─── Issue/Return Logs ──────────────────────────────────────────────
const seedIssueReturn: IssueReturnLog[] = [
  {
    id: 'ir1', gaugeId: 'g4', issuedTo: 'Vikram Singh',
    issueTimestamp: '2025-01-10T09:00:00', status: 'Issued',
  },
  {
    id: 'ir2', gaugeId: 'g1', issuedTo: 'Priya Sharma',
    issueTimestamp: '2025-01-05T10:30:00',
    returnTimestamp: '2025-01-06T16:00:00', status: 'Returned',
  },
  {
    id: 'ir3', gaugeId: 'g10', issuedTo: 'Vikram Singh',
    issueTimestamp: '2025-01-08T08:00:00',
    returnTimestamp: '2025-01-09T17:00:00', status: 'Returned',
  },
  {
    id: 'ir4', gaugeId: 'g3', issuedTo: 'Priya Sharma',
    issueTimestamp: '2025-01-12T11:00:00',
    returnTimestamp: '2025-01-12T15:30:00', status: 'Returned',
  },
];

// ─── Audit Logs ─────────────────────────────────────────────────────
const seedAudit: AuditLog[] = [
  { id: 'al1', action: 'CREATE', entityType: 'Gauge', entityId: 'g1', userId: 'u1', timestamp: '2024-07-01T10:00:00' },
  { id: 'al2', action: 'CALIBRATE', entityType: 'CalibrationRecord', entityId: 'c1', userId: 'u1', timestamp: '2024-07-15T11:30:00' },
  { id: 'al3', action: 'ISSUE', entityType: 'IssueReturnLog', entityId: 'ir1', userId: 'u3', timestamp: '2025-01-10T09:00:00' },
  { id: 'al4', action: 'CLOSE_CAPA', entityType: 'CAPA', entityId: 'ca1', userId: 'u1', timestamp: '2024-07-10T14:00:00' },
  { id: 'al5', action: 'CREATE', entityType: 'MSAStudy', entityId: 'm1', userId: 'u1', timestamp: '2024-07-20T09:00:00' },
  { id: 'al6', action: 'UPDATE', entityType: 'MSAStudy', entityId: 'm1', userId: 'u1', timestamp: '2024-07-22T10:00:00' },
  { id: 'al7', action: 'CREATE', entityType: 'CAPA', entityId: 'ca2', userId: 'u1', timestamp: '2024-06-17T08:00:00' },
  { id: 'al8', action: 'RETURN', entityType: 'IssueReturnLog', entityId: 'ir2', userId: 'u3', timestamp: '2025-01-06T16:00:00' },
];

// ═══════════════════════════════════════════════════════════════════
// SEEDER
// ═══════════════════════════════════════════════════════════════════

export function seedIfEmpty(): void {
  if (!localStorage.getItem(KEYS.departments)) setAll(KEYS.departments, seedDepartments);
  if (!localStorage.getItem(KEYS.users)) setAll(KEYS.users, seedUsers);
  if (!localStorage.getItem(KEYS.standards)) setAll(KEYS.standards, seedStandards);
  if (!localStorage.getItem(KEYS.vendors)) setAll(KEYS.vendors, seedVendors);
  if (!localStorage.getItem(KEYS.gauges)) setAll(KEYS.gauges, seedGauges);
  if (!localStorage.getItem(KEYS.calibrations)) setAll(KEYS.calibrations, seedCalibrations);
  if (!localStorage.getItem(KEYS.msa)) setAll(KEYS.msa, seedMSA);
  if (!localStorage.getItem(KEYS.capa)) setAll(KEYS.capa, seedCAPAs);
  if (!localStorage.getItem(KEYS.issueReturn)) setAll(KEYS.issueReturn, seedIssueReturn);
  if (!localStorage.getItem(KEYS.audit)) setAll(KEYS.audit, seedAudit);
  if (!localStorage.getItem(KEYS.operators)) setAll(KEYS.operators, seedOperators);
  if (!localStorage.getItem(KEYS.parts)) setAll(KEYS.parts, seedParts);
  if (!localStorage.getItem(KEYS.locations)) setAll(KEYS.locations, seedLocations);
}

// ═══════════════════════════════════════════════════════════════════
// CRUD — GAUGES
// ═══════════════════════════════════════════════════════════════════

export const gaugeStorage = {
  getAll: () => getAll<Gauge>(KEYS.gauges),
  getById: (id: string) => getAll<Gauge>(KEYS.gauges).find((g) => g.id === id),
  add: (item: Omit<Gauge, 'id'>) => {
    const all = getAll<Gauge>(KEYS.gauges);
    const newItem = { ...item, id: generateId() } as Gauge;
    setAll(KEYS.gauges, [...all, newItem]);
    return newItem;
  },
  update: (id: string, updates: Partial<Gauge>) => {
    const all = getAll<Gauge>(KEYS.gauges).map((g) =>
      g.id === id ? { ...g, ...updates } : g
    );
    setAll(KEYS.gauges, all);
  },
  delete: (id: string) => {
    setAll(KEYS.gauges, getAll<Gauge>(KEYS.gauges).filter((g) => g.id !== id));
  },
};

// ═══════════════════════════════════════════════════════════════════
// CRUD — STANDARDS
// ═══════════════════════════════════════════════════════════════════

export const standardStorage = {
  getAll: () => getAll<Standard>(KEYS.standards),
  getById: (id: string) => getAll<Standard>(KEYS.standards).find((s) => s.id === id),
  add: (item: Omit<Standard, 'id'>) => {
    const all = getAll<Standard>(KEYS.standards);
    const newItem = { ...item, id: generateId() } as Standard;
    setAll(KEYS.standards, [...all, newItem]);
    return newItem;
  },
  update: (id: string, updates: Partial<Standard>) => {
    const all = getAll<Standard>(KEYS.standards).map((s) =>
      s.id === id ? { ...s, ...updates } : s
    );
    setAll(KEYS.standards, all);
  },
  delete: (id: string) => {
    setAll(KEYS.standards, getAll<Standard>(KEYS.standards).filter((s) => s.id !== id));
  },
};

// ═══════════════════════════════════════════════════════════════════
// CRUD — VENDORS
// ═══════════════════════════════════════════════════════════════════

export const vendorStorage = {
  getAll: () => getAll<Vendor>(KEYS.vendors),
  getById: (id: string) => getAll<Vendor>(KEYS.vendors).find((v) => v.id === id),
  add: (item: Omit<Vendor, 'id'>) => {
    const all = getAll<Vendor>(KEYS.vendors);
    const newItem = { ...item, id: generateId() } as Vendor;
    setAll(KEYS.vendors, [...all, newItem]);
    return newItem;
  },
  update: (id: string, updates: Partial<Vendor>) => {
    const all = getAll<Vendor>(KEYS.vendors).map((v) =>
      v.id === id ? { ...v, ...updates } : v
    );
    setAll(KEYS.vendors, all);
  },
  delete: (id: string) => {
    setAll(KEYS.vendors, getAll<Vendor>(KEYS.vendors).filter((v) => v.id !== id));
  },
};

// ═══════════════════════════════════════════════════════════════════
// CRUD — CALIBRATIONS
// ═══════════════════════════════════════════════════════════════════

export const calibrationStorage = {
  getAll: () => getAll<CalibrationRecord>(KEYS.calibrations),
  getById: (id: string) => getAll<CalibrationRecord>(KEYS.calibrations).find((c) => c.id === id),
  getByGaugeId: (gaugeId: string) => getAll<CalibrationRecord>(KEYS.calibrations).filter((c) => c.gaugeId === gaugeId),
  add: (item: Omit<CalibrationRecord, 'id'>) => {
    const all = getAll<CalibrationRecord>(KEYS.calibrations);
    const newItem = { ...item, id: generateId() } as CalibrationRecord;
    setAll(KEYS.calibrations, [...all, newItem]);
    return newItem;
  },
  update: (id: string, updates: Partial<CalibrationRecord>) => {
    const all = getAll<CalibrationRecord>(KEYS.calibrations).map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );
    setAll(KEYS.calibrations, all);
  },
  delete: (id: string) => {
    setAll(KEYS.calibrations, getAll<CalibrationRecord>(KEYS.calibrations).filter((c) => c.id !== id));
  },
};

// ═══════════════════════════════════════════════════════════════════
// CRUD — MSA STUDIES
// ═══════════════════════════════════════════════════════════════════

export const msaStorage = {
  getAll: () => getAll<MSAStudy>(KEYS.msa),
  getById: (id: string) => getAll<MSAStudy>(KEYS.msa).find((m) => m.id === id),
  getByGaugeId: (gaugeId: string) => getAll<MSAStudy>(KEYS.msa).filter((m) => m.gaugeId === gaugeId),
  getByOperatorId: (operatorId: string) =>
    getAll<MSAStudy>(KEYS.msa).filter(
      (m) =>
        m.operatorIds.includes(operatorId) &&
        ['Pending Measurements', 'In Progress'].includes(m.status)
    ),
  add: (item: Omit<MSAStudy, 'id'>) => {
    const all = getAll<MSAStudy>(KEYS.msa);
    const newItem = { ...item, id: generateId() } as MSAStudy;
    setAll(KEYS.msa, [...all, newItem]);
    return newItem;
  },
  update: (id: string, updates: Partial<MSAStudy>) => {
    const all = getAll<MSAStudy>(KEYS.msa).map((m) =>
      m.id === id ? { ...m, ...updates } : m
    );
    setAll(KEYS.msa, all);
  },
  delete: (id: string) => {
    setAll(KEYS.msa, getAll<MSAStudy>(KEYS.msa).filter((m) => m.id !== id));
  },
};

// ═══════════════════════════════════════════════════════════════════
// CRUD — CAPA
// ═══════════════════════════════════════════════════════════════════

export const capaStorage = {
  getAll: () => getAll<CAPA>(KEYS.capa),
  getById: (id: string) => getAll<CAPA>(KEYS.capa).find((c) => c.id === id),
  getByGaugeId: (gaugeId: string) => getAll<CAPA>(KEYS.capa).filter((c) => c.gaugeId === gaugeId),
  add: (item: Omit<CAPA, 'id'>) => {
    const all = getAll<CAPA>(KEYS.capa);
    const newItem = { ...item, id: generateId() } as CAPA;
    setAll(KEYS.capa, [...all, newItem]);
    return newItem;
  },
  update: (id: string, updates: Partial<CAPA>) => {
    const all = getAll<CAPA>(KEYS.capa).map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );
    setAll(KEYS.capa, all);
  },
  delete: (id: string) => {
    setAll(KEYS.capa, getAll<CAPA>(KEYS.capa).filter((c) => c.id !== id));
  },
};

// ═══════════════════════════════════════════════════════════════════
// GAUGE QUARANTINE REASON — why is a gauge "Under Review"?
// Not stored on the gauge itself; derived from the open CAPA (if any)
// or the most recent failing Calibration/MSA record for that gauge.
// ═══════════════════════════════════════════════════════════════════

export function getQuarantineReason(gaugeId: string): string | null {
  const openCapa = capaStorage
    .getByGaugeId(gaugeId)
    .find((c) => c.status === 'Open');

  if (openCapa) {
    return openCapa.sourceType === 'MSA'
      ? 'Open CAPA — failed MSA study'
      : 'Open CAPA — failed calibration';
  }

  const lastFailedCal = calibrationStorage
    .getAll()
    .filter((c) => c.gaugeId === gaugeId && c.result === 'Fail')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const lastFailedMsa = msaStorage
    .getAll()
    .filter((m) => m.gaugeId === gaugeId && m.passFail === 'Fail')
    .sort(
      (a, b) =>
        new Date(b.completedDate || b.createdDate).getTime() -
        new Date(a.completedDate || a.createdDate).getTime()
    )[0];

  if (lastFailedCal && lastFailedMsa) {
    const calTime = new Date(lastFailedCal.date).getTime();
    const msaTime = new Date(
      lastFailedMsa.completedDate || lastFailedMsa.createdDate
    ).getTime();
    return calTime >= msaTime
      ? `Failed ${lastFailedCal.type} calibration`
      : `Failed ${lastFailedMsa.studyType} study`;
  }
  if (lastFailedCal) return `Failed ${lastFailedCal.type} calibration`;
  if (lastFailedMsa) return `Failed ${lastFailedMsa.studyType} study`;

  return null;
}

// ═══════════════════════════════════════════════════════════════════
// CRUD — ISSUE/RETURN
// ═══════════════════════════════════════════════════════════════════

export const issueReturnStorage = {
  getAll: () => getAll<IssueReturnLog>(KEYS.issueReturn),
  getById: (id: string) => getAll<IssueReturnLog>(KEYS.issueReturn).find((i) => i.id === id),
  getByGaugeId: (gaugeId: string) => getAll<IssueReturnLog>(KEYS.issueReturn).filter((i) => i.gaugeId === gaugeId),
  add: (item: Omit<IssueReturnLog, 'id'>) => {
    const all = getAll<IssueReturnLog>(KEYS.issueReturn);
    const newItem = { ...item, id: generateId() } as IssueReturnLog;
    setAll(KEYS.issueReturn, [...all, newItem]);
    return newItem;
  },
  update: (id: string, updates: Partial<IssueReturnLog>) => {
    const all = getAll<IssueReturnLog>(KEYS.issueReturn).map((i) =>
      i.id === id ? { ...i, ...updates } : i
    );
    setAll(KEYS.issueReturn, all);
  },
};

// ═══════════════════════════════════════════════════════════════════
// CRUD — APP USERS (localStorage demo users)
// ═══════════════════════════════════════════════════════════════════

export const appUserStorage = {
  getAll: () => getAll<AppUser>(KEYS.users),
  getById: (id: string) => getAll<AppUser>(KEYS.users).find((u) => u.id === id),
  add: (item: Omit<AppUser, 'id'>) => {
    const all = getAll<AppUser>(KEYS.users);
    const newItem = { ...item, id: generateId() } as AppUser;
    setAll(KEYS.users, [...all, newItem]);
    return newItem;
  },
  update: (id: string, updates: Partial<AppUser>) => {
    const all = getAll<AppUser>(KEYS.users).map((u) =>
      u.id === id ? { ...u, ...updates } : u
    );
    setAll(KEYS.users, all);
  },
  delete: (id: string) => {
    setAll(KEYS.users, getAll<AppUser>(KEYS.users).filter((u) => u.id !== id));
  },
};

// ═══════════════════════════════════════════════════════════════════
// CRUD — DEPARTMENTS (localStorage demo)
// ═══════════════════════════════════════════════════════════════════

export const departmentStorage = {
  getAll: () => getAll<AppDepartment>(KEYS.departments),
  getById: (id: string) => getAll<AppDepartment>(KEYS.departments).find((d) => d.id === id),
  add: (item: Omit<AppDepartment, 'id'>) => {
    const all = getAll<AppDepartment>(KEYS.departments);
    const newItem = { ...item, id: generateId() } as AppDepartment;
    setAll(KEYS.departments, [...all, newItem]);
    return newItem;
  },
  update: (id: string, updates: Partial<AppDepartment>) => {
    const all = getAll<AppDepartment>(KEYS.departments).map((d) =>
      d.id === id ? { ...d, ...updates } : d
    );
    setAll(KEYS.departments, all);
  },
  delete: (id: string) => {
    setAll(KEYS.departments, getAll<AppDepartment>(KEYS.departments).filter((d) => d.id !== id));
  },
};

// ═══════════════════════════════════════════════════════════════════
// CRUD — OPERATORS
// ═══════════════════════════════════════════════════════════════════

export const operatorStorage = {
  getAll: () => getAll<Operator>(KEYS.operators),
  getById: (id: string) => getAll<Operator>(KEYS.operators).find((o) => o.id === id),
  add: (item: Omit<Operator, 'id'>) => {
    const all = getAll<Operator>(KEYS.operators);
    const newItem = { ...item, id: generateId() } as Operator;
    setAll(KEYS.operators, [...all, newItem]);
    return newItem;
  },
  update: (id: string, updates: Partial<Operator>) => {
    const all = getAll<Operator>(KEYS.operators).map((o) =>
      o.id === id ? { ...o, ...updates } : o
    );
    setAll(KEYS.operators, all);
  },
  delete: (id: string) => {
    setAll(KEYS.operators, getAll<Operator>(KEYS.operators).filter((o) => o.id !== id));
  },
};

// ═══════════════════════════════════════════════════════════════════
// CRUD — PARTS
// ═══════════════════════════════════════════════════════════════════

export const partStorage = {
  getAll: () => getAll<Part>(KEYS.parts),
  getById: (id: string) => getAll<Part>(KEYS.parts).find((p) => p.id === id),
  add: (item: Omit<Part, 'id'>) => {
    const all = getAll<Part>(KEYS.parts);
    const newItem = { ...item, id: generateId() } as Part;
    setAll(KEYS.parts, [...all, newItem]);
    return newItem;
  },
  update: (id: string, updates: Partial<Part>) => {
    const all = getAll<Part>(KEYS.parts).map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    setAll(KEYS.parts, all);
  },
  delete: (id: string) => {
    setAll(KEYS.parts, getAll<Part>(KEYS.parts).filter((p) => p.id !== id));
  },
};

// ═══════════════════════════════════════════════════════════════════
// CRUD — LOCATIONS
// ═══════════════════════════════════════════════════════════════════

export const locationStorage = {
  getAll: () => getAll<Location>(KEYS.locations),
  getById: (id: string) => getAll<Location>(KEYS.locations).find((l) => l.id === id),
  getByDepartment: (departmentName: string) =>
    getAll<Location>(KEYS.locations).filter(
      (l) => l.departmentName === departmentName && l.isActive
    ),
  add: (item: Omit<Location, 'id'>) => {
    const all = getAll<Location>(KEYS.locations);
    const newItem = { ...item, id: generateId() } as Location;
    setAll(KEYS.locations, [...all, newItem]);
    return newItem;
  },
  update: (id: string, updates: Partial<Location>) => {
    const all = getAll<Location>(KEYS.locations).map((l) =>
      l.id === id ? { ...l, ...updates } : l
    );
    setAll(KEYS.locations, all);
  },
  delete: (id: string) => {
    setAll(KEYS.locations, getAll<Location>(KEYS.locations).filter((l) => l.id !== id));
  },
};
// ═══════════════════════════════════════════════════════════════════
// CRUD — AUDIT LOG
// ═══════════════════════════════════════════════════════════════════

export const auditStorage = {
  getAll: () =>
    getAll<AuditLog>(KEYS.audit).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ),
  add: (item: Omit<AuditLog, 'id'>) => {
    const all = getAll<AuditLog>(KEYS.audit);
    const newItem = { ...item, id: generateId() } as AuditLog;
    setAll(KEYS.audit, [...all, newItem]);
    return newItem;
  },
};
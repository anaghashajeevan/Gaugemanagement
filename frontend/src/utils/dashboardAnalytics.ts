// src/utils/dashboardAnalytics.ts
// Shared date-classification logic for Dashboard analytics charts, so the
// donut / bar / risk visualizations all agree with each other (and with the
// existing "Due This Week" / "Overdue" KPI cards) on what each bucket means.

import type { Gauge, CAPA } from './storage';

export type DueBucket = 'Overdue' | 'Due This Week' | 'Due Soon' | 'Up to Date' | 'Unknown';

function parseDate(dateStr: string | undefined | null): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function dateOnly(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function isActiveGauge(g: Gauge): boolean {
  return g.status !== 'Scrapped';
}

export function classifyDueDate(dateStr: string | undefined | null, now: Date = new Date()): DueBucket {
  const d = parseDate(dateStr);
  if (!d) return 'Unknown';
  const diffDays = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return 'Overdue';
  if (diffDays <= 7) return 'Due This Week';
  if (diffDays <= 30) return 'Due Soon';
  return 'Up to Date';
}

// ─── Calibration Compliance Overview ────────────────────────────────

export interface ComplianceSummary {
  upToDate: number;
  dueSoon: number;
  dueThisWeek: number;
  overdue: number;
  unknown: number;
  totalActive: number;
  scheduledActive: number;
  compliancePct: number | null;
}

export function computeComplianceSummary(gauges: Gauge[], now: Date = new Date()): ComplianceSummary {
  const active = gauges.filter(isActiveGauge);
  let upToDate = 0, dueSoon = 0, dueThisWeek = 0, overdue = 0, unknown = 0;

  for (const g of active) {
    switch (classifyDueDate(g.nextDueDate, now)) {
      case 'Up to Date': upToDate++; break;
      case 'Due Soon': dueSoon++; break;
      case 'Due This Week': dueThisWeek++; break;
      case 'Overdue': overdue++; break;
      default: unknown++;
    }
  }

  const scheduledActive = active.length - unknown;
  // Schedule-compliant = not yet past its nextDueDate (Up to Date / Due Soon / Due This Week).
  // Only "Overdue" counts against compliance — the gauge's valid calibration window has lapsed.
  const compliantCount = upToDate + dueSoon + dueThisWeek;
  const compliancePct = scheduledActive > 0 ? Math.round((compliantCount / scheduledActive) * 100) : null;

  return { upToDate, dueSoon, dueThisWeek, overdue, unknown, totalActive: active.length, scheduledActive, compliancePct };
}

// ─── Upcoming Calibration Workload ──────────────────────────────────

export interface WorkloadBucket {
  key: string;
  label: string;
  count: number;
}

export function computeWorkloadBuckets(
  gauges: Gauge[],
  now: Date = new Date(),
  monthsAhead = 6
): WorkloadBucket[] {
  const active = gauges.filter(isActiveGauge);
  const startYear = now.getFullYear();
  const startMonth = now.getMonth();

  const buckets: WorkloadBucket[] = [{ key: 'overdue', label: 'Overdue', count: 0 }];
  for (let i = 0; i < monthsAhead; i++) {
    const y = startYear + Math.floor((startMonth + i) / 12);
    const m = (startMonth + i) % 12;
    buckets.push({
      key: `${y}-${String(m + 1).padStart(2, '0')}`,
      label: new Date(y, m, 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      count: 0,
    });
  }
  const indexByKey = new Map(buckets.map((b, i) => [b.key, i]));

  for (const g of active) {
    const d = parseDate(g.nextDueDate);
    if (!d) continue;
    if (d.getTime() < now.getTime()) {
      buckets[0].count++;
      continue;
    }
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const idx = indexByKey.get(key);
    if (idx !== undefined) buckets[idx].count++;
  }

  return buckets;
}

// ─── Department Risk Distribution ───────────────────────────────────

export interface DepartmentRiskRow {
  department: string;
  upToDate: number;
  dueSoon: number;
  dueThisWeek: number;
  overdue: number;
  unknown: number;
  total: number;
}

export function computeDepartmentRisk(gauges: Gauge[], now: Date = new Date()): DepartmentRiskRow[] {
  const active = gauges.filter(isActiveGauge);
  const map = new Map<string, DepartmentRiskRow>();

  for (const g of active) {
    const dept = g.department && g.department.trim() ? g.department : 'Unassigned';
    if (!map.has(dept)) {
      map.set(dept, { department: dept, upToDate: 0, dueSoon: 0, dueThisWeek: 0, overdue: 0, unknown: 0, total: 0 });
    }
    const row = map.get(dept)!;
    switch (classifyDueDate(g.nextDueDate, now)) {
      case 'Up to Date': row.upToDate++; break;
      case 'Due Soon': row.dueSoon++; break;
      case 'Due This Week': row.dueThisWeek++; break;
      case 'Overdue': row.overdue++; break;
      default: row.unknown++;
    }
    row.total++;
  }

  return Array.from(map.values()).sort((a, b) => {
    if (b.overdue !== a.overdue) return b.overdue - a.overdue;
    if (b.dueThisWeek !== a.dueThisWeek) return b.dueThisWeek - a.dueThisWeek;
    if (b.dueSoon !== a.dueSoon) return b.dueSoon - a.dueSoon;
    return b.total - a.total;
  });
}

// ─── CAPA Status Overview ───────────────────────────────────────────

export type CapaBucket = 'Closed' | 'Open' | 'Overdue';

export function classifyCapa(capa: CAPA, now: Date = new Date()): CapaBucket {
  if (capa.status === 'Closed') return 'Closed';
  const d = parseDate(capa.targetDate);
  if (!d) return 'Open';
  return dateOnly(d).getTime() < dateOnly(now).getTime() ? 'Overdue' : 'Open';
}

export interface CapaSummary {
  closed: number;
  open: number;
  overdue: number;
  total: number;
}

export function computeCapaSummary(capas: CAPA[], now: Date = new Date()): CapaSummary {
  let closed = 0, open = 0, overdue = 0;
  for (const c of capas) {
    switch (classifyCapa(c, now)) {
      case 'Closed': closed++; break;
      case 'Overdue': overdue++; break;
      default: open++;
    }
  }
  return { closed, open, overdue, total: capas.length };
}

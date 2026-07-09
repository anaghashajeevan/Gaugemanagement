// src/pages/Dashboard.tsx

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import {
  gaugeStorage,
  calibrationStorage,
  msaStorage,
  capaStorage,
  issueReturnStorage,
  auditStorage,
} from '../utils/storage';
import {
  classifyDueDate,
  computeComplianceSummary,
  computeWorkloadBuckets,
  computeDepartmentRisk,
  computeCapaSummary,
} from '../utils/dashboardAnalytics';
import DashboardSectionHeader from '../components/dashboard/DashboardSectionHeader';
import DashboardCard from '../components/dashboard/DashboardCard';
import KpiCard from '../components/dashboard/KpiCard';
import QuickActionTile from '../components/dashboard/QuickActionTile';
import ComplianceDonutChart from '../components/dashboard/ComplianceDonutChart';
import WorkloadBarChart from '../components/dashboard/WorkloadBarChart';
import DepartmentRiskChart from '../components/dashboard/DepartmentRiskChart';
import CapaStatusChart from '../components/dashboard/CapaStatusChart';
import {
  Gauge,
  Clock,
  AlertTriangle,
  Flag,
  ClipboardCheck,
  Send,
  BarChart3,
  AlertOctagon,
  FileText,
  Plus,
  CheckCircle2,
  Sparkles,
  Calendar,
  Activity,
  ArrowLeftRight,
  Package,
  ShieldCheck,
  CalendarClock,
  Building2,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ─── Pull Live Data ───────────────────────────────────────────────
  const gauges = gaugeStorage.getAll();
  const calibrations = calibrationStorage.getAll();
  const msaStudies = msaStorage.getAll();
  const capas = capaStorage.getAll();
  const issueLogs = issueReturnStorage.getAll();
  const auditLogs = auditStorage.getAll();

  // ─── Computed Stats ───────────────────────────────────────────────
  // Due-date classification is shared with the analytics charts via
  // classifyDueDate() so KPI cards, Attention Required, and the charts can
  // never disagree — and invalid/unparsable dates safely fall into 'Unknown'
  // instead of silently defaulting to 'Up to Date'.
  const totalGauges = gauges.length;
  const dueThisWeek = gauges.filter(
    (g) => g.status !== 'Scrapped' && classifyDueDate(g.nextDueDate) === 'Due This Week'
  ).length;
  const overdue = gauges.filter(
    (g) => g.status !== 'Scrapped' && classifyDueDate(g.nextDueDate) === 'Overdue'
  ).length;
  const openCAPAs = capas.filter((c) => c.status === 'Open').length;
  const currentlyIssued = issueLogs.filter((l) => l.status === 'Issued').length;
  const failedCalibrations = calibrations.filter((c) => c.result === 'Fail').length;
  const failedMSA = msaStudies.filter((m) => m.passFail === 'Fail').length;
  const availableGauges = gauges.filter((g) => g.status === 'Available').length;

  const departmentCount = useMemo(
    () => new Set(gauges.map((g) => g.department).filter(Boolean)).size,
    [gauges]
  );

  // ─── Analytics Chart Datasets ───────────────────────────────────────
  const complianceSummary = useMemo(() => computeComplianceSummary(gauges), [gauges]);
  const workloadBuckets = useMemo(() => computeWorkloadBuckets(gauges), [gauges]);
  const departmentRisk = useMemo(() => computeDepartmentRisk(gauges), [gauges]);
  const capaSummary = useMemo(() => computeCapaSummary(capas), [capas]);

  // ─── Unified KPI Cards (all 8 share one card system/grid) ─────────
  const kpis = [
    {
      label: 'Total Gauges',
      value: totalGauges,
      sub: departmentCount > 0
        ? `Across ${departmentCount} department${departmentCount === 1 ? '' : 's'}`
        : 'No departments assigned',
      icon: Gauge,
      tintBg: 'bg-indigo-50',
      tintText: 'text-indigo-600',
      accent: 'from-indigo-500 to-violet-500',
      cardBg: 'bg-gradient-to-br from-indigo-100 to-indigo-50/60',
      cardBorder: 'border-indigo-200',
      hoverBorder: 'hover:border-indigo-300',
      path: '/gauges',
    },
    {
      label: 'Due This Week',
      value: dueThisWeek,
      sub: 'Within the next 7 days',
      icon: Clock,
      tintBg: 'bg-amber-50',
      tintText: 'text-amber-600',
      accent: 'from-amber-500 to-yellow-500',
      cardBg: 'bg-gradient-to-br from-amber-100 to-amber-50/60',
      cardBorder: 'border-amber-200',
      hoverBorder: 'hover:border-amber-300',
      path: '/reports',
    },
    {
      label: 'Overdue',
      value: overdue,
      sub: overdue > 0 ? 'Immediate action required' : 'All caught up',
      icon: AlertTriangle,
      tintBg: 'bg-rose-50',
      tintText: 'text-rose-600',
      accent: 'from-rose-500 to-red-500',
      cardBg: 'bg-gradient-to-br from-rose-200 to-rose-50/70',
      cardBorder: 'border-rose-300',
      hoverBorder: 'hover:border-rose-400',
      path: '/reports',
    },
    {
      label: 'Open CAPAs',
      value: openCAPAs,
      sub: capaSummary.overdue > 0 ? `${capaSummary.overdue} overdue` : 'No overdue actions',
      icon: Flag,
      tintBg: 'bg-emerald-50',
      tintText: 'text-emerald-600',
      accent: 'from-emerald-500 to-teal-500',
      cardBg: 'bg-gradient-to-br from-emerald-100 to-emerald-50/60',
      cardBorder: 'border-emerald-200',
      hoverBorder: 'hover:border-emerald-300',
      path: '/capa',
    },
    {
      label: 'Available',
      value: availableGauges,
      sub: 'Ready for use',
      icon: CheckCircle2,
      tintBg: 'bg-teal-50',
      tintText: 'text-teal-600',
      accent: 'from-teal-500 to-emerald-500',
      cardBg: 'bg-gradient-to-br from-teal-100 to-teal-50/60',
      cardBorder: 'border-teal-200',
      hoverBorder: 'hover:border-teal-300',
      path: '/gauges',
    },
    {
      label: 'Issued',
      value: currentlyIssued,
      sub: 'Currently in use',
      icon: Package,
      tintBg: 'bg-blue-50',
      tintText: 'text-blue-600',
      accent: 'from-blue-500 to-cyan-500',
      cardBg: 'bg-gradient-to-br from-blue-100 to-blue-50/60',
      cardBorder: 'border-blue-200',
      hoverBorder: 'hover:border-blue-300',
      path: '/issue-return',
    },
    {
      label: 'Failed Calibrations',
      value: failedCalibrations,
      sub: 'Requires review',
      icon: AlertOctagon,
      tintBg: 'bg-red-50',
      tintText: 'text-red-600',
      accent: 'from-red-500 to-rose-500',
      cardBg: 'bg-gradient-to-br from-red-100 to-red-50/60',
      cardBorder: 'border-red-200',
      hoverBorder: 'hover:border-red-300',
      path: '/calibration',
    },
    {
      label: 'Failed MSA',
      value: failedMSA,
      sub: 'Study failures',
      icon: BarChart3,
      tintBg: 'bg-orange-50',
      tintText: 'text-orange-600',
      accent: 'from-orange-500 to-amber-500',
      cardBg: 'bg-gradient-to-br from-orange-100 to-orange-50/60',
      cardBorder: 'border-orange-200',
      hoverBorder: 'hover:border-orange-300',
      path: '/msa',
    },
  ];

  // ─── Quick Actions ────────────────────────────────────────────────
  const quickActions = [
    { label: 'New Calibration', icon: ClipboardCheck, tintBg: 'bg-indigo-50', tintText: 'text-indigo-600', path: '/calibration' },
    { label: 'Issue Gauge', icon: Send, tintBg: 'bg-emerald-50', tintText: 'text-emerald-600', path: '/issue-return' },
    { label: 'Start MSA Study', icon: BarChart3, tintBg: 'bg-blue-50', tintText: 'text-blue-600', path: '/msa' },
    { label: 'Open CAPA', icon: AlertOctagon, tintBg: 'bg-amber-50', tintText: 'text-amber-600', path: '/capa' },
    { label: 'View Reports', icon: FileText, tintBg: 'bg-rose-50', tintText: 'text-rose-600', path: '/reports' },
    { label: 'Add Gauge', icon: Plus, tintBg: 'bg-violet-50', tintText: 'text-violet-600', path: '/gauges' },
  ];

  // ─── Overdue Gauges List ──────────────────────────────────────────
  const overdueGauges = useMemo(
    () =>
      gauges
        .filter((g) => g.status !== 'Scrapped' && classifyDueDate(g.nextDueDate) === 'Overdue')
        .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
        .slice(0, 5),
    [gauges]
  );

  // ─── Due Soon Gauges ──────────────────────────────────────────────
  const dueSoonGauges = useMemo(
    () =>
      gauges
        .filter(
          (g) =>
            g.status !== 'Scrapped' &&
            ['Due This Week', 'Due Soon'].includes(classifyDueDate(g.nextDueDate))
        )
        .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
        .slice(0, 5),
    [gauges]
  );

  // ─── Recent Calibrations ─────────────────────────────────────────
  const recentCalibrations = useMemo(
    () =>
      [...calibrations]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    [calibrations]
  );

  // ─── Recent Activity (from audit logs) ────────────────────────────
  const recentActivity = useMemo(
    () => auditLogs.slice(0, 8),
    [auditLogs]
  );

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />;
      case 'UPDATE': return <ClipboardCheck className="w-3.5 h-3.5" strokeWidth={2.5} />;
      case 'DELETE': return <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2.5} />;
      case 'CALIBRATE': return <ClipboardCheck className="w-3.5 h-3.5" strokeWidth={2.5} />;
      case 'ISSUE': return <Send className="w-3.5 h-3.5" strokeWidth={2.5} />;
      case 'RETURN': return <ArrowLeftRight className="w-3.5 h-3.5" strokeWidth={2.5} />;
      case 'CLOSE_CAPA': return <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />;
      default: return <Activity className="w-3.5 h-3.5" strokeWidth={2.5} />;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-emerald-100 text-emerald-600';
      case 'UPDATE': return 'bg-blue-100 text-blue-600';
      case 'DELETE': return 'bg-red-100 text-red-600';
      case 'CALIBRATE': return 'bg-purple-100 text-purple-600';
      case 'ISSUE': return 'bg-amber-100 text-amber-600';
      case 'RETURN': return 'bg-teal-100 text-teal-600';
      case 'CLOSE_CAPA': return 'bg-emerald-100 text-emerald-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <Layout pageTitle="Dashboard">
      {/* ─── Welcome Banner ────────────────────────────────────────── */}
      <div
        className="relative rounded-2xl p-6 mb-6 shadow-lg overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #3730A3 0%, #4F46E5 30%, #6D28D9 65%, #0891B2 100%)',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background:
              'linear-gradient(90deg, #4338ca 0%, #7c3aed 25%, #a855f7 45%, #10b981 70%, #eab308 100%)',
          }}
        />

        {/* Decorative layers — purely visual, matching the login page's motif */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
          <div className="absolute -right-10 -top-16 w-72 h-72 bg-cyan-300/10 rounded-full blur-3xl" />
          <div className="absolute -left-10 -bottom-16 w-64 h-64 bg-violet-300/10 rounded-full blur-3xl" />
          <div className="absolute right-24 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-white/10 hidden lg:block" />
          <div className="absolute right-32 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-white/10 hidden lg:block" />
        </div>

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-yellow-300" strokeWidth={2} />
              <span className="text-xs text-white/90 uppercase tracking-widest font-semibold">
                Welcome back
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
              {user?.full_name}
            </h2>
            <p className="text-indigo-100 text-sm">
              {user?.role_name} · {user?.department_name || 'No department assigned'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white/15 backdrop-blur-sm border border-white/10 text-white text-xs rounded-full font-medium flex items-center gap-1.5">
                <Activity className="w-3 h-3" strokeWidth={2.5} />
                {totalGauges} Gauges Managed
              </span>
              <span className="px-3 py-1 bg-white/15 backdrop-blur-sm border border-white/10 text-white text-xs rounded-full font-medium flex items-center gap-1.5">
                <Calendar className="w-3 h-3" strokeWidth={2.5} />
                {new Date().toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              {overdue > 0 && (
                <span className="px-3 py-1 bg-rose-500/30 backdrop-blur-sm border border-rose-300/20 text-white text-xs rounded-full font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3" strokeWidth={2.5} />
                  {overdue} Overdue
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate('/calibration')}
            className="relative z-10 bg-white text-indigo-600 font-semibold px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition flex items-center gap-2 hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            New Calibration
          </button>
        </div>
      </div>

      {/* ─── Operational Snapshot — 8 unified KPI cards ─────────────── */}
      <DashboardSectionHeader
        title="Operational Snapshot"
        subtitle="Live gauge, calibration, and CAPA status across your fleet"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            sub={kpi.sub}
            icon={kpi.icon}
            accent={kpi.accent}
            cardBg={kpi.cardBg}
            cardBorder={kpi.cardBorder}
            hoverBorder={kpi.hoverBorder}
            onClick={() => navigate(kpi.path)}
          />
        ))}
      </div>

      {/* ─── Analytics Overview ─────────────────────────────────────── */}
      <DashboardSectionHeader
        title="Analytics Overview"
        subtitle="Calibration health, upcoming workload, and quality risk at a glance"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-stretch">
        <DashboardCard
          className="lg:col-span-1"
          title="Calibration Schedule Compliance"
          subtitle="Active gauge schedule validity"
          icon={ShieldCheck}
          tintBg="bg-emerald-50"
          tintText="text-emerald-600"
          accentBar="from-emerald-400 to-teal-500"
        >
          <ComplianceDonutChart summary={complianceSummary} />
        </DashboardCard>

        <DashboardCard
          className="lg:col-span-2"
          title="Upcoming Calibration Workload"
          subtitle="By calibration due date"
          icon={CalendarClock}
          tintBg="bg-indigo-50"
          tintText="text-indigo-600"
          accentBar="from-indigo-400 to-blue-500"
          headerRight={<span className="text-xs text-gray-400">Next 6 months</span>}
        >
          <WorkloadBarChart buckets={workloadBuckets} />
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-stretch">
        <DashboardCard
          className="lg:col-span-2"
          title="Calibration Risk by Department"
          subtitle="Schedule exposure across departments"
          icon={Building2}
          tintBg="bg-violet-50"
          tintText="text-violet-600"
          accentBar="from-violet-400 to-purple-500"
          headerRight={
            departmentRisk.length > 0 ? (
              <span className="text-xs text-gray-400">{departmentRisk.length} departments</span>
            ) : undefined
          }
        >
          <DepartmentRiskChart rows={departmentRisk} />
        </DashboardCard>

        <DashboardCard
          className="lg:col-span-1"
          title="CAPA Status"
          subtitle="Corrective & preventive actions"
          icon={ShieldAlert}
          tintBg="bg-amber-50"
          tintText="text-amber-600"
          accentBar="from-amber-400 to-orange-500"
        >
          <CapaStatusChart summary={capaSummary} />
        </DashboardCard>
      </div>

      {/* ─── Action Center ──────────────────────────────────────────── */}
      <DashboardSectionHeader
        title="Action Center"
        subtitle="Shortcuts, urgent items, and the latest system activity"
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-stretch">
        {/* Quick Actions */}
        <DashboardCard title="Quick Actions" icon={Sparkles} tintBg="bg-indigo-50" tintText="text-indigo-600">
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <QuickActionTile
                key={action.label}
                label={action.label}
                icon={action.icon}
                tintBg={action.tintBg}
                tintText={action.tintText}
                onClick={() => navigate(action.path)}
              />
            ))}
          </div>
        </DashboardCard>

        {/* Overdue / Due Soon Gauges */}
        <DashboardCard
          title="Attention Required"
          icon={AlertTriangle}
          tintBg="bg-rose-50"
          tintText="text-rose-600"
          headerRight={
            (overdue + dueThisWeek) > 0 ? (
              <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-full">
                {overdue + dueThisWeek}
              </span>
            ) : undefined
          }
        >
          {overdueGauges.length === 0 && dueSoonGauges.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-semibold text-emerald-600">All clear!</p>
              <p className="text-xs text-gray-400 mt-1">No overdue or due gauges</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-0.5">
              {overdueGauges.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500 px-0.5">
                    Overdue
                  </p>
                  {overdueGauges.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => navigate(`/gauges/${g.id}`)}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/60 border border-rose-100 hover:bg-rose-50 hover:border-rose-200 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" strokeWidth={2} />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">{g.gaugeCode}</p>
                          <p className="text-xs text-gray-500 truncate">{g.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-rose-600 font-medium">{g.nextDueDate}</span>
                        <StatusBadge status="Overdue" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {dueSoonGauges.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500 px-0.5">
                    Due Soon
                  </p>
                  {dueSoonGauges.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => navigate(`/gauges/${g.id}`)}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 hover:bg-amber-50 hover:border-amber-200 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" strokeWidth={2} />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">{g.gaugeCode}</p>
                          <p className="text-xs text-gray-500 truncate">{g.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-amber-600 font-medium">{g.nextDueDate}</span>
                        <StatusBadge status="Due Soon" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DashboardCard>

        {/* Recent Activity */}
        <DashboardCard title="Recent Activity" icon={Activity} tintBg="bg-teal-50" tintText="text-teal-600">
          {recentActivity.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <Clock className="w-7 h-7 text-gray-300" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-gray-500">No recent activity yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Activity will appear as you use the system
              </p>
            </div>
          ) : (
            <div className="relative max-h-[280px] overflow-y-auto pr-0.5">
              <div className="absolute left-[17px] top-2 bottom-2 w-px bg-gray-100" aria-hidden="true" />
              <div className="space-y-1">
                {recentActivity.map((log) => (
                  <div
                    key={log.id}
                    className="relative flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div
                      className={`relative z-10 w-[26px] h-[26px] rounded-full flex items-center justify-center flex-shrink-0 ring-4 ring-white ${getActivityColor(log.action)}`}
                    >
                      {getActivityIcon(log.action)}
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-700">{log.action}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{log.entityType}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {new Date(log.timestamp).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DashboardCard>
      </div>

      {/* ─── Recent Calibrations Table ─────────────────────────────── */}
      <DashboardCard
        noPadding
        accentBar="from-indigo-500 via-violet-500 to-cyan-500"
        title="Recent Calibrations"
        icon={ClipboardCheck}
        tintBg="bg-indigo-50"
        tintText="text-indigo-600"
        headerRight={
          <div className="flex items-center gap-3">
            {recentCalibrations.length > 0 && (
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full">
                {recentCalibrations.length}
              </span>
            )}
            <button
              onClick={() => navigate('/calibration')}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 transition"
            >
              View All
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          </div>
        }
      >
        <div className="px-6 pb-6">
          {recentCalibrations.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <ClipboardCheck className="w-7 h-7 text-gray-300" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-gray-500">No calibrations performed yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'linear-gradient(90deg, #f8f7ff 0%, #f5f3ff 100%)' }}>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                      Gauge
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                      Result
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                      Technician
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentCalibrations.map((cal) => {
                    const gauge = gauges.find((g) => g.id === cal.gaugeId);
                    return (
                      <tr
                        key={cal.id}
                        onClick={() => gauge && navigate(`/gauges/${gauge.id}`)}
                        className="hover:bg-indigo-50/40 cursor-pointer transition"
                      >
                        <td className="px-4 py-3 text-gray-600">{cal.date}</td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-indigo-600">
                            {gauge?.gaugeCode || '—'}
                          </span>
                          <p className="text-xs text-gray-400">{gauge?.name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={cal.type} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={cal.result} />
                        </td>
                        <td className="px-4 py-3 text-gray-600">{cal.technician}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DashboardCard>
    </Layout>
  );
}

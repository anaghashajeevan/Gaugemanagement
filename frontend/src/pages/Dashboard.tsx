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
import ComplianceDonutChart from '../components/dashboard/ComplianceDonutChart';
import WorkloadBarChart from '../components/dashboard/WorkloadBarChart';
import DepartmentRiskChart from '../components/dashboard/DepartmentRiskChart';
import CapaStatusChart from '../components/dashboard/CapaStatusChart';
import {
  Gauge,
  Clock,
  AlertTriangle,
  Flag,
  ArrowUpRight,
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

  const stats = [
    {
      label: 'Total Gauges',
      value: totalGauges,
      sub: departmentCount > 0 ? `Across ${departmentCount} department${departmentCount === 1 ? '' : 's'}` : 'No departments assigned',
      accent: 'from-indigo-500 to-purple-500',
      bgLight: 'bg-indigo-50',
      textAccent: 'text-indigo-600',
      icon: Gauge,
      path: '/gauges',
    },
    {
      label: 'Due This Week',
      value: dueThisWeek,
      sub: 'Within the next 7 days',
      accent: 'from-amber-500 to-yellow-500',
      bgLight: 'bg-amber-50',
      textAccent: 'text-amber-600',
      icon: Clock,
      path: '/reports',
    },
    {
      label: 'Overdue',
      value: overdue,
      sub: overdue > 0 ? 'Immediate action required' : 'All caught up',
      accent: 'from-red-500 to-rose-500',
      bgLight: 'bg-red-50',
      textAccent: 'text-red-600',
      icon: AlertTriangle,
      path: '/reports',
    },
    {
      label: 'Open CAPAs',
      value: openCAPAs,
      sub: capaSummary.overdue > 0 ? `${capaSummary.overdue} overdue` : 'No overdue actions',
      accent: 'from-emerald-500 to-teal-500',
      bgLight: 'bg-emerald-50',
      textAccent: 'text-emerald-600',
      icon: Flag,
      path: '/capa',
    },
  ];

  // ─── Secondary Stats ─────────────────────────────────────────────
  const secondaryStats = [
    {
      label: 'Available',
      value: availableGauges,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-l-emerald-300',
    },
    {
      label: 'Issued',
      value: currentlyIssued,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-l-blue-300',
    },
    {
      label: 'Failed Cal.',
      value: failedCalibrations,
      icon: AlertOctagon,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-l-red-300',
    },
    {
      label: 'Failed MSA',
      value: failedMSA,
      icon: BarChart3,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-l-amber-300',
    },
  ];

  // ─── Quick Actions ────────────────────────────────────────────────
  const quickActions = [
    { label: 'New Calibration', icon: ClipboardCheck, tint: 'bg-indigo-50 text-indigo-600', path: '/calibration' },
    { label: 'Issue Gauge', icon: Send, tint: 'bg-emerald-50 text-emerald-600', path: '/issue-return' },
    { label: 'Start MSA Study', icon: BarChart3, tint: 'bg-blue-50 text-blue-600', path: '/msa' },
    { label: 'Open CAPA', icon: AlertOctagon, tint: 'bg-amber-50 text-amber-600', path: '/capa' },
    { label: 'View Reports', icon: FileText, tint: 'bg-rose-50 text-rose-600', path: '/reports' },
    { label: 'Add Gauge', icon: Plus, tint: 'bg-violet-50 text-violet-600', path: '/gauges' },
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
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background:
              'linear-gradient(90deg, #4338ca 0%, #7c3aed 25%, #a855f7 45%, #10b981 70%, #eab308 100%)',
          }}
        />

        {/* Subtle dot-grid texture for a premium, non-decorative feel */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="absolute -right-10 -top-10 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />

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
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full font-medium flex items-center gap-1.5">
                <Activity className="w-3 h-3" strokeWidth={2.5} />
                {totalGauges} Gauges Managed
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full font-medium flex items-center gap-1.5">
                <Calendar className="w-3 h-3" strokeWidth={2.5} />
                {new Date().toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              {overdue > 0 && (
                <span className="px-3 py-1 bg-red-500/30 backdrop-blur-sm text-white text-xs rounded-full font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3" strokeWidth={2.5} />
                  {overdue} Overdue
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate('/calibration')}
            className="bg-white text-indigo-600 font-semibold px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition flex items-center gap-2 hover:scale-105"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            New Calibration
          </button>
        </div>
      </div>

      {/* ─── Primary Stats Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              onClick={() => navigate(stat.path)}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition group relative overflow-hidden cursor-pointer"
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${stat.accent}`}
              />

              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    {stat.label}
                  </p>
                  <p className="text-[32px] leading-tight font-bold text-gray-800 mt-2">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 truncate">{stat.sub}</p>
                </div>
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.bgLight} ${stat.textAccent} group-hover:scale-110 transition flex-shrink-0`}
                >
                  <Icon className="w-6 h-6" strokeWidth={2} />
                </div>
              </div>

              <div
                className={`flex items-center gap-1 mt-3 ${stat.textAccent} text-xs font-medium opacity-0 group-hover:opacity-100 transition`}
              >
                View details
                <ArrowUpRight className="w-3 h-3" strokeWidth={2.5} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Secondary Stats Row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {secondaryStats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 border-l-2 ${s.border} flex items-center gap-3 hover:shadow-md transition`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.bg} ${s.color} flex-shrink-0`}>
                <Icon className="w-4 h-4" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-semibold truncate">{s.label}</p>
                <p className="text-xl font-bold text-gray-800">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Analytics Overview ─────────────────────────────────────── */}
      <DashboardSectionHeader
        title="Analytics Overview"
        subtitle="Calibration health, upcoming workload, and quality risk at a glance"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Calibration Compliance Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4" strokeWidth={2} />
              </span>
              Calibration Schedule Compliance
            </h3>
          </div>
          <p className="text-xs text-gray-400 mb-3 ml-9">Active gauge schedule validity</p>
          <ComplianceDonutChart summary={complianceSummary} />
        </div>

        {/* Upcoming Calibration Workload */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <CalendarClock className="w-4 h-4" strokeWidth={2} />
              </span>
              Upcoming Calibration Workload
            </h3>
            <span className="text-xs text-gray-400">Next 6 months</span>
          </div>
          <p className="text-xs text-gray-400 mb-2 ml-9">By calibration due date</p>
          <WorkloadBarChart buckets={workloadBuckets} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Department Risk Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4" strokeWidth={2} />
              </span>
              Calibration Risk by Department
            </h3>
            {departmentRisk.length > 0 && (
              <span className="text-xs text-gray-400">{departmentRisk.length} departments</span>
            )}
          </div>
          <p className="text-xs text-gray-400 mb-2 ml-9">Schedule exposure across departments</p>
          <DepartmentRiskChart rows={departmentRisk} />
        </div>

        {/* CAPA Status Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-4 h-4" strokeWidth={2} />
              </span>
              CAPA Status
            </h3>
          </div>
          <p className="text-xs text-gray-400 mb-3 ml-9">Corrective &amp; preventive actions</p>
          <CapaStatusChart summary={capaSummary} />
        </div>
      </div>

      {/* ─── Three Column Layout ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span
                className="inline-block w-1 h-6 rounded-full"
                style={{
                  background: 'linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%)',
                }}
              />
              Quick Actions
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="p-3 rounded-lg border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition text-left group"
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${action.tint} group-hover:scale-105 transition`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <p className="text-xs font-semibold text-gray-800">
                    {action.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Overdue / Due Soon Gauges */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            <span
              className="inline-block w-1 h-6 rounded-full"
              style={{
                background: 'linear-gradient(180deg, #ef4444 0%, #f59e0b 100%)',
              }}
            />
            Attention Required
            {(overdue + dueThisWeek) > 0 && (
              <span className="ml-auto px-2 py-0.5 bg-red-50 text-red-600 text-xs font-bold rounded-full">
                {overdue + dueThisWeek}
              </span>
            )}
          </h3>

          {overdueGauges.length === 0 && dueSoonGauges.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-semibold text-emerald-600">All clear!</p>
              <p className="text-xs text-gray-400 mt-1">No overdue or due gauges</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {overdueGauges.map((g) => (
                <div
                  key={g.id}
                  onClick={() => navigate(`/gauges/${g.id}`)}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-red-50/50 border border-red-100 hover:bg-red-50 cursor-pointer transition"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" strokeWidth={2} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{g.gaugeCode}</p>
                      <p className="text-xs text-gray-500 truncate">{g.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-red-600 font-medium">{g.nextDueDate}</span>
                    <StatusBadge status="Overdue" />
                  </div>
                </div>
              ))}

              {dueSoonGauges.map((g) => (
                <div
                  key={g.id}
                  onClick={() => navigate(`/gauges/${g.id}`)}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/50 border border-amber-100 hover:bg-amber-50 cursor-pointer transition"
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

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            <span
              className="inline-block w-1 h-6 rounded-full"
              style={{
                background: 'linear-gradient(180deg, #10b981 0%, #14b8a6 100%)',
              }}
            />
            Recent Activity
          </h3>

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
            <div className="space-y-1 max-h-[280px] overflow-y-auto">
              {recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${getActivityColor(log.action)}`}>
                    {getActivityIcon(log.action)}
                  </div>
                  <div className="min-w-0 flex-1">
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
          )}
        </div>
      </div>

      {/* ─── Recent Calibrations Table ─────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div
          className="h-1"
          style={{
            background:
              'linear-gradient(90deg, #4338ca 0%, #7c3aed 25%, #a855f7 45%, #10b981 70%, #eab308 100%)',
          }}
        />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-indigo-500" strokeWidth={2} />
              Recent Calibrations
              {recentCalibrations.length > 0 && (
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full">
                  {recentCalibrations.length}
                </span>
              )}
            </h3>
            <button
              onClick={() => navigate('/calibration')}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 transition"
            >
              View All
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          </div>

          {recentCalibrations.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <ClipboardCheck className="w-7 h-7 text-gray-300" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-gray-500">No calibrations performed yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
      </div>
    </Layout>
  );
}

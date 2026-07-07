// import Layout from '../components/Layout';
// import { useAuth } from '../context/AuthContext';

// export default function Dashboard() {
//   const { user } = useAuth();

//   const stats = [
//     { label: 'Total Gauges', value: '—', color: 'bg-blue-100 text-blue-600', icon: '🔧' },
//     { label: 'Due This Week', value: '—', color: 'bg-yellow-100 text-yellow-600', icon: '⏰' },
//     { label: 'Overdue', value: '—', color: 'bg-red-100 text-red-600', icon: '⚠️' },
//     { label: 'Open CAPAs', value: '—', color: 'bg-purple-100 text-purple-600', icon: '🚩' },
//   ];

//   return (
//     <Layout pageTitle="Dashboard">
//       {/* Welcome Banner */}
//       <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 mb-6 shadow">
//         <h2 className="text-2xl font-bold">Welcome back, {user?.full_name}! 👋</h2>
//         <p className="text-blue-100 mt-1">
//           {user?.role_name} · {user?.department_name || 'No department assigned'}
//         </p>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//         {stats.map((stat) => (
//           <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
//             <div className="flex justify-between items-start">
//               <div>
//                 <p className="text-sm text-gray-500">{stat.label}</p>
//                 <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
//               </div>
//               <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${stat.color}`}>
//                 {stat.icon}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Roadmap Card */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//         <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Module Implementation Roadmap</h3>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div>
//             <h4 className="font-semibold text-green-600 mb-2">✅ Complete</h4>
//             <ul className="text-sm text-gray-600 space-y-1">
//               <li>• Authentication & Login</li>
//               <li>• JWT Token Refresh</li>
//               <li>• Role-based Access</li>
//               <li>• Change Password</li>
//             </ul>
//           </div>
//           <div>
//             <h4 className="font-semibold text-yellow-600 mb-2">⏳ Next Up</h4>
//             <ul className="text-sm text-gray-600 space-y-1">
//               <li>• Department Master</li>
//               <li>• Gauge Master</li>
//               <li>• Reference Standard</li>
//               <li>• User Management UI</li>
//             </ul>
//           </div>
//           <div>
//             <h4 className="font-semibold text-gray-500 mb-2">📅 Planned</h4>
//             <ul className="text-sm text-gray-600 space-y-1">
//               <li>• Internal / External Calibration</li>
//               <li>• MSA Studies (GR&R, Linearity)</li>
//               <li>• CAPA Module</li>
//               <li>• Issue / Return Tracker</li>
//               <li>• Auto Emailer</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// }


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
  Circle,
  Loader2,
  Sparkles,
  Calendar,
  Activity,
  ArrowLeftRight,
  Package,
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
  const getDueStatus = (dateStr: string) => {
    if (!dateStr) return 'Unknown';
    const diff = (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return 'Overdue';
    if (diff <= 7) return 'Due This Week';
    if (diff <= 30) return 'Due Soon';
    return 'Up to Date';
  };

  const totalGauges = gauges.length;
  const dueThisWeek = gauges.filter(
    (g) => g.status !== 'Scrapped' && getDueStatus(g.nextDueDate) === 'Due This Week'
  ).length;
  const overdue = gauges.filter(
    (g) => g.status !== 'Scrapped' && getDueStatus(g.nextDueDate) === 'Overdue'
  ).length;
  const openCAPAs = capas.filter((c) => c.status === 'Open').length;
  const currentlyIssued = issueLogs.filter((l) => l.status === 'Issued').length;
  const failedCalibrations = calibrations.filter((c) => c.result === 'Fail').length;
  const failedMSA = msaStudies.filter((m) => m.passFail === 'Fail').length;
  const availableGauges = gauges.filter((g) => g.status === 'Available').length;

  const stats = [
    {
      label: 'Total Gauges',
      value: totalGauges,
      accent: 'from-indigo-500 to-purple-500',
      bgLight: 'bg-indigo-50',
      textAccent: 'text-indigo-600',
      icon: Gauge,
      path: '/gauges',
    },
    {
      label: 'Due This Week',
      value: dueThisWeek,
      accent: 'from-amber-500 to-yellow-500',
      bgLight: 'bg-amber-50',
      textAccent: 'text-amber-600',
      icon: Clock,
      path: '/reports',
    },
    {
      label: 'Overdue',
      value: overdue,
      accent: 'from-red-500 to-rose-500',
      bgLight: 'bg-red-50',
      textAccent: 'text-red-600',
      icon: AlertTriangle,
      path: '/reports',
    },
    {
      label: 'Open CAPAs',
      value: openCAPAs,
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
    },
    {
      label: 'Issued',
      value: currentlyIssued,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Failed Cal.',
      value: failedCalibrations,
      icon: AlertOctagon,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Failed MSA',
      value: failedMSA,
      icon: BarChart3,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  // ─── Quick Actions ────────────────────────────────────────────────
  const quickActions = [
    { label: 'New Calibration', color: 'from-indigo-500 to-purple-500', icon: ClipboardCheck, path: '/calibration' },
    { label: 'Issue Gauge', color: 'from-emerald-500 to-teal-500', icon: Send, path: '/issue-return' },
    { label: 'Start MSA Study', color: 'from-blue-500 to-cyan-500', icon: BarChart3, path: '/msa' },
    { label: 'Open CAPA', color: 'from-amber-500 to-yellow-500', icon: AlertOctagon, path: '/capa' },
    { label: 'View Reports', color: 'from-pink-500 to-rose-500', icon: FileText, path: '/reports' },
    { label: 'Add Gauge', color: 'from-violet-500 to-purple-500', icon: Plus, path: '/gauges' },
  ];

  // ─── Overdue Gauges List ──────────────────────────────────────────
  const overdueGauges = useMemo(
    () =>
      gauges
        .filter((g) => g.status !== 'Scrapped' && getDueStatus(g.nextDueDate) === 'Overdue')
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
            ['Due This Week', 'Due Soon'].includes(getDueStatus(g.nextDueDate))
        )
        .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
        .slice(0, 5),
    [gauges]
  );

  // ─── Recent Calibrations ─────────────────────────────────────────
  const recentCalibrations = useMemo(
    () =>
      calibrations
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
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background:
              'linear-gradient(90deg, #4338ca 0%, #7c3aed 25%, #a855f7 45%, #10b981 70%, #eab308 100%)',
          }}
        />

        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-white/5 rounded-full" />

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-yellow-300" strokeWidth={2} />
              <span className="text-xs text-white/90 uppercase tracking-widest font-semibold">
                Welcome back
              </span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-1">
              {user?.full_name}
            </h2>
            <p className="text-indigo-100 text-sm">
              {user?.role_name} · {user?.department_name || 'No department assigned'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
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
            className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition flex items-center gap-2 hover:scale-105"
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
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition group relative overflow-hidden cursor-pointer"
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${stat.accent}`}
              />

              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {stat.value}
                  </p>
                  <div className={`flex items-center gap-1 mt-1 ${stat.textAccent} text-xs font-medium`}>
                    View details
                    <ArrowUpRight className="w-3 h-3" strokeWidth={2.5} />
                  </div>
                </div>
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.bgLight} ${stat.textAccent} group-hover:scale-110 transition`}
                >
                  <Icon className="w-6 h-6" strokeWidth={2} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Secondary Stats Row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {secondaryStats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.bg} ${s.color}`}>
                <Icon className="w-4 h-4" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">{s.label}</p>
                <p className="text-xl font-bold text-gray-800">{s.value}</p>
              </div>
            </div>
          );
        })}
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
                  className="p-3 rounded-lg border border-gray-200 hover:shadow-md transition text-left group hover:border-indigo-200"
                >
                  <div
                    className={`w-9 h-9 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-2 shadow-sm group-hover:scale-110 transition`}
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
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{g.gaugeCode}</p>
                    <p className="text-xs text-gray-500 truncate">{g.name}</p>
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
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{g.gaugeCode}</p>
                    <p className="text-xs text-gray-500 truncate">{g.name}</p>
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
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
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

      {/* ─── Module Roadmap ─────────────────────────────────
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
              Module Implementation Roadmap
            </h3>
            <span className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} />
              Demo Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                  <CheckCircle2 className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <h4 className="font-bold text-emerald-700">Complete</h4>
              </div>
              <ul className="text-sm text-gray-700 space-y-2">
                {[
                  'Authentication & Login',
                  'Role-based Access Control',
                  'Gauge Master (CRUD)',
                  'Internal Calibration',
                  'External Calibration',
                  'MSA Studies (4 types)',
                  'CAPA Module',
                  'Issue / Return Tracker',
                  'Reports & CSV Export',
                  'Admin: Users, Roles, Depts',
                  'Audit Trail',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white">
                  <Clock className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <h4 className="font-bold text-amber-700">Next Up</h4>
              </div>
              <ul className="text-sm text-gray-700 space-y-2">
                {[
                  'Dashboard Charts & Graphs',
                  'Email Notifications',
                  'Certificate File Upload',
                  'Bulk Import/Export',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <ArrowUpRight className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
                  <Calendar className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <h4 className="font-bold text-indigo-700">Planned</h4>
              </div>
              <ul className="text-sm text-gray-700 space-y-2">
                {[
                  'Mobile Responsive Layout',
                  'PDF Report Generation',
                  'Barcode/QR Scanning',
                  'Auto-reminder Scheduler',
                  'Multi-plant Support',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Circle className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      ──────────────────────────────────────────────────────────────── */}
    </Layout>
  );
}
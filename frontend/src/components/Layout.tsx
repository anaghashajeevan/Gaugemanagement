// import { type MouseEvent, type ReactNode, useRef, useState } from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import logo from '../images/logo.png';
// import {
//   LayoutDashboard,
//   Gauge,
//   ClipboardCheck,
//   BarChart3,
//   AlertTriangle,
//   ArrowLeftRight,
//   FileText,
//   Users,
//   ShieldCheck,
//   Building2,
//   FlaskConical,
//   ScrollText,
//   KeyRound,
//   LogOut,
//   Bell,
//   ChevronDown,
//   MapPin, 
// } from 'lucide-react';

// interface Props {
//   children: ReactNode;
//   pageTitle?: string;
//   headerAction?: ReactNode;
// }

// export default function Layout({ children, pageTitle = 'Dashboard', headerAction }: Props) {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [dropdownOpen, setDropdownOpen] = useState(false);

//   const navRef = useRef<HTMLElement | null>(null);
//   const dragState = useRef({ dragging: false, startY: 0, startScrollTop: 0 });

//   const handleDragStart = (e: MouseEvent) => {
//     if (!navRef.current) return;
//     dragState.current = {
//       dragging: true,
//       startY: e.clientY,
//       startScrollTop: navRef.current.scrollTop,
//     };
//   };

//   const handleDragMove = (e: MouseEvent) => {
//     if (!dragState.current.dragging || !navRef.current) return;
//     const delta = e.clientY - dragState.current.startY;
//     navRef.current.scrollTop = dragState.current.startScrollTop - delta;
//   };

//   const stopDrag = () => {
//     dragState.current.dragging = false;
//   };

//   const handleLogout = async () => {
//     await logout();
//     navigate('/login');
//   };

//   const showPageHeading = pageTitle !== 'Dashboard';

//   const isAdmin = user?.role_code === 'admin';
//   const isQualityEng = user?.role_code === 'quality_engineer';
//   const isOperator = user?.role_code === 'shop_floor_operator';

//   const menuItems = [
//     { label: 'Dashboard', path: '/dashboard', show: true, icon: LayoutDashboard },
//     { label: 'Gauge Master', path: '/gauges', show: true, icon: Gauge },
//     { label: 'Calibration', path: '/calibration', show: !isOperator, icon: ClipboardCheck },
//    { label: 'MSA Studies', path: '/msa', show: true, icon: BarChart3 },
//     { label: 'CAPA', path: '/capa', show: true, icon: AlertTriangle },
//     { label: 'Issue / Return', path: '/issue-return', show: true, icon: ArrowLeftRight },
//     { label: 'Reports', path: '/reports', show: true, icon: FileText },
//   ];

//   const adminItems = [
//     { label: 'User Management', path: '/admin/users', icon: Users },
//     { label: 'Roles', path: '/admin/roles', icon: ShieldCheck },
//     { label: 'Departments', path: '/admin/departments', icon: Building2 },
//     { label: 'Locations', path: '/admin/locations', icon: MapPin },    
//     { label: 'Outside Labs', path: '/admin/outside-labs', icon: FlaskConical },
//     { label: 'Audit Trail', path: '/admin/audit', icon: ScrollText },
//   ];

//   return (
//     <div
//       className="min-h-screen"
//       style={{
//         background: 'linear-gradient(180deg, #f7f5fb 0%, #eef4f5 100%)',
//         fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
//       }}
//     >
//       {/* ─── Sidebar ─────────────────────────────────────────────────── */}
//       <aside className="fixed top-20 left-0 h-[calc(100vh-5rem)] w-64 bg-white border-r border-gray-200 z-40 shadow-sm flex flex-col">
//         {/* Menu */}
//         <nav
//           ref={navRef}
//           onMouseDown={handleDragStart}
//           onMouseMove={handleDragMove}
//           onMouseUp={stopDrag}
//           onMouseLeave={stopDrag}
//           className="flex-1 p-3 space-y-1 overflow-y-auto cursor-grab active:cursor-grabbing select-none [&::-webkit-scrollbar]:hidden"
//           style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
//         >
//           <p className="px-3 py-2 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
//             Main
//           </p>
//           {menuItems.filter((m) => m.show).map((item) => {
//             const isActive = location.pathname.startsWith(item.path);
//             const Icon = item.icon;
//             return (
//               <Link
//                 key={item.path}
//                 to={item.path}
//                 className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
//                   isActive
//                     ? 'text-white shadow-md'
//                     : 'text-gray-700 hover:bg-gray-100'
//                 }`}
//                 style={
//                   isActive
//                     ? {
//                         background:
//                           'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
//                       }
//                     : {}
//                 }
//               >
//                 <Icon
//                   className={`w-5 h-5 ${
//                     isActive ? 'text-white' : 'text-indigo-500'
//                   }`}
//                   strokeWidth={2}
//                 />
//                 <span className="font-medium">{item.label}</span>
//               </Link>
//             );
//           })}

//           {isAdmin && (
//             <>
//               <p className="px-3 py-2 mt-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
//                 Administration
//               </p>
//               {adminItems.map((item) => {
//                 const isActive = location.pathname.startsWith(item.path);
//                 const Icon = item.icon;
//                 return (
//                   <Link
//                     key={item.path}
//                     to={item.path}
//                     className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
//                       isActive
//                         ? 'text-white shadow-md'
//                         : 'text-gray-700 hover:bg-gray-100'
//                     }`}
//                     style={
//                       isActive
//                         ? {
//                             background:
//                               'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
//                           }
//                         : {}
//                     }
//                   >
//                     <Icon
//                       className={`w-5 h-5 ${
//                         isActive ? 'text-white' : 'text-indigo-500'
//                       }`}
//                       strokeWidth={2}
//                     />
//                     <span className="font-medium">{item.label}</span>
//                   </Link>
//                 );
//               })}
//             </>
//           )}
//         </nav>

//         {/* Footer inside sidebar */}
//         <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-100 bg-white">
//           <p className="text-[10px] text-gray-400 text-center">
//             © 2026 NL Technologies Pvt Ltd
//           </p>
//         </div>
//       </aside>

//       {/* ─── Top Header ──────────────────────────────────────────────── */}
//       <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 z-40">
//         <div className="flex items-center gap-3 w-64 shrink-0">
//           <img
//             src={logo}
//             alt="NL Technologies"
//             className="h-12 w-auto object-contain"
//           />
//         </div>

//         <div className="absolute left-1/2 -translate-x-1/2 text-center">
//           <h1 className="text-lg font-bold text-gray-800 leading-tight">
//             Gauge Calibration Management System
//           </h1>
//         </div>

//         <div className="flex items-center gap-3">
//           {/* Notifications */}
//           <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
//             <Bell className="w-5 h-5 text-gray-600" strokeWidth={2} />
//             <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
//           </button>

//           {/* User Info */}
//           <div className="text-right hidden md:block">
//             <p className="text-sm font-semibold text-gray-800">
//               {user?.full_name}
//             </p>
//             <p className="text-xs text-gray-500">
//               {user?.role_name} · {user?.department_name || 'N/A'}
//             </p>
//           </div>

//           {/* Avatar Dropdown */}
//           <div className="relative">
//             <button
//               onClick={() => setDropdownOpen(!dropdownOpen)}
//               className="flex items-center gap-2 p-1 pr-2 hover:bg-gray-50 rounded-lg transition"
//             >
//               <div
//                 className="w-10 h-10 text-white rounded-full font-bold flex items-center justify-center shadow-md"
//                 style={{
//                   background:
//                     'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
//                 }}
//               >
//                 {user?.full_name?.[0]?.toUpperCase()}
//               </div>
//               <ChevronDown
//                 className={`w-4 h-4 text-gray-500 transition ${
//                   dropdownOpen ? 'rotate-180' : ''
//                 }`}
//                 strokeWidth={2}
//               />
//             </button>

//             {dropdownOpen && (
//               <>
//                 <div
//                   className="fixed inset-0 z-40"
//                   onClick={() => setDropdownOpen(false)}
//                 />

//                 <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 overflow-hidden">
//                   <div
//                     className="h-1 -mt-2 mb-2"
//                     style={{
//                       background:
//                         'linear-gradient(90deg, #4338ca 0%, #7c3aed 25%, #a855f7 45%, #10b981 70%, #eab308 100%)',
//                     }}
//                   />

//                   <div className="px-4 py-3 border-b border-gray-100">
//                     <div className="flex items-center gap-3">
//                       <div
//                         className="w-10 h-10 text-white rounded-full font-bold flex items-center justify-center shadow-md"
//                         style={{
//                           background:
//                             'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
//                         }}
//                       >
//                         {user?.full_name?.[0]?.toUpperCase()}
//                       </div>
//                       <div className="min-w-0">
//                         <p className="text-sm font-semibold text-gray-800 truncate">
//                           {user?.full_name}
//                         </p>
//                         <p className="text-xs text-gray-500 truncate">
//                           {user?.email}
//                         </p>
//                       </div>
//                     </div>
//                   </div>

//                   <Link
//                     to="/change-password"
//                     onClick={() => setDropdownOpen(false)}
//                     className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
//                   >
//                     <KeyRound className="w-4 h-4 text-indigo-500" strokeWidth={2} />
//                     Change Password
//                   </Link>

//                   <div className="border-t border-gray-100 mt-1">
//                     <button
//                       onClick={handleLogout}
//                       className="w-full flex items-center gap-3 text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
//                     >
//                       <LogOut className="w-4 h-4" strokeWidth={2} />
//                       Sign Out
//                     </button>
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </header>

//       {/* ─── Main Content ─────────────────────────────────────────────── */}
//       <main className="ml-64 mt-20 p-6">
//         {showPageHeading && (
//           <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
//             <div>
//               <h2 className="text-2xl font-bold text-gray-800">{pageTitle}</h2>
//               <p className="text-sm text-gray-500">
//                 {new Date().toLocaleDateString('en-IN', {
//                   weekday: 'long',
//                   day: 'numeric',
//                   month: 'short',
//                   year: 'numeric',
//                 })}
//               </p>
//             </div>
//             {headerAction}
//           </div>
//         )}
//         {children}
//       </main>
//     </div>
//   );
// }


import { type ComponentType, type MouseEvent, type ReactNode, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../images/logo.png';
import {
  LayoutDashboard,
  Gauge,
  ClipboardCheck,
  BarChart3,
  AlertTriangle,
  ArrowLeftRight,
  FileText,
  Users,
  ShieldCheck,
  Building2,
  FlaskConical,
  MapPin,
  ScrollText,
  KeyRound,
  LogOut,
  Bell,Map as MapIcon, 
  ChevronDown,Package, 
} from 'lucide-react';

type PageIconType = ComponentType<{ className?: string; strokeWidth?: number }>;

interface Props {
  children: ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
  pageIcon?: PageIconType;
  headerAction?: ReactNode;
}

export default function Layout({ children, pageTitle = 'Dashboard', pageSubtitle, pageIcon: PageIcon, headerAction }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navRef = useRef<HTMLElement | null>(null);
  const dragState = useRef({ dragging: false, startY: 0, startScrollTop: 0 });

  const handleDragStart = (e: MouseEvent) => {
    if (!navRef.current) return;
    dragState.current = {
      dragging: true,
      startY: e.clientY,
      startScrollTop: navRef.current.scrollTop,
    };
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!dragState.current.dragging || !navRef.current) return;
    const delta = e.clientY - dragState.current.startY;
    navRef.current.scrollTop = dragState.current.startScrollTop - delta;
  };

  const stopDrag = () => {
    dragState.current.dragging = false;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const showPageHeading = pageTitle !== 'Dashboard';

  const isAdmin = user?.role_code === 'admin';
  const isOperator = user?.role_code === 'shop_floor_operator';

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', show: true, icon: LayoutDashboard },
    { label: 'Gauge Master', path: '/gauges', show: true, icon: Gauge },
    { label: 'Calibration', path: '/calibration', show: !isOperator, icon: ClipboardCheck },
    { label: 'MSA Studies', path: '/msa', show: true, icon: BarChart3 },
    { label: 'CAPA', path: '/capa', show: true, icon: AlertTriangle },
    { label: 'Issue / Return', path: '/issue-return', show: true, icon: ArrowLeftRight },
    { label: 'Heat Map', path: '/heat-map', show: true, icon: MapIcon },
    { label: 'Reports', path: '/reports', show: true, icon: FileText },
  ];

  const adminItems = [
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'Roles', path: '/admin/roles', icon: ShieldCheck },
    { label: 'Departments', path: '/admin/departments', icon: Building2 },
    { label: 'Locations', path: '/admin/locations', icon: MapPin },
    { label: 'Parts Master', path: '/admin/parts', icon: Package }, 
    { label: 'Outside Labs', path: '/admin/outside-labs', icon: FlaskConical },
    { label: 'Audit Trail', path: '/admin/audit', icon: ScrollText },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #F8FAFF 0%, #F6F7FF 40%, #F8FBFC 100%)',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* ─── Top Header ──────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 h-20 bg-white border-b flex items-center justify-between px-6 z-40"
        style={{
          borderColor: '#E7ECF3',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(79, 70, 229, 0.05)',
        }}
      >
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 35%, #2563EB 65%, #10B981 100%)' }}
        />
        <div className="flex items-center gap-3 w-64 shrink-0">
          <div className="rounded-xl px-2 py-1 bg-gradient-to-r from-indigo-50/60 to-blue-50/30">
            <img
              src={logo}
              alt="NL Technologies"
              className="h-12 w-auto object-contain"
            />
          </div>
        </div>

        {/* <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <h1 className="text-lg font-bold text-[#172033] leading-tight tracking-[-0.01em]">
            Gauge Calibration Management System
          </h1>
        </div> */}

          <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <h1
            className="text-xl font-extrabold leading-tight tracking-[-0.02em] bg-clip-text text-transparent"
            style={{
              fontFamily: "'Poppins', 'Inter', 'Segoe UI', system-ui, sans-serif",
              backgroundImage: 'linear-gradient(90deg, #4338CA 0%, #4F46E5 25%, #7C3AED 50%, #2563EB 75%, #4338CA 100%)',
              backgroundSize: '200% auto',
              animation: 'headerGradientShift 6s ease-in-out infinite',
            }}
          >
            Gauge Calibration Management System
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2.5 rounded-xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 hover:shadow-sm transition-all duration-200">
            <Bell className="w-5 h-5" strokeWidth={2} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 pr-2 hover:bg-gray-50 rounded-lg transition"
            >
              <div
                className="w-10 h-10 text-white rounded-full font-bold flex items-center justify-center shadow-sm ring-4 ring-indigo-50 hover:scale-[1.03] transition-transform duration-200"
                style={{
                  background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 45%, #7C3AED 100%)',
                }}
              >
                {user?.full_name?.[0]?.toUpperCase()}
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
                strokeWidth={2}
              />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div
                  className="absolute right-0 mt-2 w-64 bg-white border border-slate-200/70 rounded-2xl py-2 z-50 overflow-hidden"
                  style={{ boxShadow: '0 20px 50px rgba(15, 23, 42, 0.12)' }}
                >
                  <div className="h-1 -mt-2 mb-2"
                    style={{
                      background: 'linear-gradient(90deg, #4F46E5, #7C3AED, #2563EB)',
                    }} />
                  <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-indigo-50/70 to-violet-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 text-white rounded-full font-bold flex items-center justify-center shadow-sm ring-4 ring-white"
                        style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 45%, #7C3AED 100%)' }}>
                        {user?.full_name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{user?.full_name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        <p className="text-xs text-indigo-600 truncate mt-0.5">
                          {user?.role_name} · {user?.department_name || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Link to="/change-password" onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200">
                    <KeyRound className="w-4 h-4 text-indigo-500" strokeWidth={2} />
                    Change Password
                  </Link>
                  <div className="border-t border-slate-100 mt-1">
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-all duration-200">
                      <LogOut className="w-4 h-4" strokeWidth={2} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── Sidebar ─────────────────────────────────────────────────── */}
      <aside
        className="fixed top-20 left-0 bottom-0 w-64 border-r z-40 flex flex-col"
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FCFCFF 55%, #F8FAFF 100%)',
          borderColor: '#E7ECF3',
          boxShadow: '4px 0 20px rgba(79, 70, 229, 0.035)',
        }}
      >
        <nav
          ref={navRef}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          className="flex-1 p-3 space-y-1 overflow-y-auto cursor-grab active:cursor-grabbing select-none [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <p className="px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-slate-400 font-bold flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-indigo-400"></span>
            Main
          </p>
          {menuItems.filter((m) => m.show).map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  isActive ? 'text-white shadow-md' : 'text-slate-600 hover:bg-indigo-50/80 hover:text-indigo-700 hover:translate-x-0.5'
                }`}
                style={
                  isActive
                    ? {
                        background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 55%, #7C3AED 100%)',
                        boxShadow: '0 6px 16px rgba(79, 70, 229, 0.20)',
                      }
                    : {}
                }>
                <Icon className={`w-5 h-5 transition-all duration-200 ${isActive ? 'text-white' : `${item.iconClass} ${item.hoverClass}`}`} strokeWidth={2} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <p className="px-3 py-2 mt-4 text-[10px] uppercase tracking-[0.14em] text-slate-400 font-bold flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-indigo-400"></span>
                Administration
              </p>
              {adminItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                const Icon = item.icon;
                return (
                  <Link key={item.path} to={item.path}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                      isActive ? 'text-white shadow-md' : 'text-slate-600 hover:bg-indigo-50/80 hover:text-indigo-700 hover:translate-x-0.5'
                    }`}
                    style={
                      isActive
                        ? {
                            background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 55%, #7C3AED 100%)',
                            boxShadow: '0 6px 16px rgba(79, 70, 229, 0.20)',
                          }
                        : {}
                    }>
                    <Icon className={`w-5 h-5 transition-all duration-200 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-600'}`} strokeWidth={2} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Footer inside sidebar */}
        <div className="flex-shrink-0 p-3 border-t border-indigo-100/60 bg-indigo-50/30">
          <p className="text-[10px] text-slate-400 text-center">
            © 2026 NL Technologies Pvt Ltd
          </p>
        </div>
      </aside>

      {/* ─── Main Content — SCROLLABLE ──────────────────────────────── */}
      <main className="ml-64 pt-20 min-h-screen">
        <div className="p-6">
          {showPageHeading && (
            <div
            className="relative rounded-2xl px-6 py-5 mb-6 shadow-md overflow-hidden flex items-center justify-between gap-4 flex-wrap"
            style={{ background: 'linear-gradient(135deg, #4338CA 0%, #4F46E5 35%, #6D5DFB 65%, #7C3AED 100%)' }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{
                background:
                  'linear-gradient(90deg, #60A5FA 0%, #818CF8 35%, #A78BFA 65%, #34D399 100%)',
              }}
            />
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-violet-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex items-center gap-3">
              {PageIcon && (
                <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <PageIcon className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-white">{pageTitle}</h2>
                {pageSubtitle && (
                  <p className="text-sm text-indigo-100 mt-1">{pageSubtitle}</p>
                )}
              </div>
            </div>
            {headerAction && <div className="relative z-10">{headerAction}</div>}
          </div>
          )}
          {children}
        </div>
      </main>

       <style>{`
        @keyframes headerGradientShift {
          0%   { background-position: 0% center; }
          50%  { background-position: 100% center; }
          100% { background-position: 0% center; }
        }
      `}</style>
    </div>
  );
}
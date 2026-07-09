// import { useState, type FormEvent } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// export default function Login() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [rememberMe, setRememberMe] = useState(false);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const from = (location.state as any)?.from?.pathname || '/dashboard';

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       await login(email, password);    // ← changed
//       navigate(from, { replace: true });
//     } catch (err: any) {
//       setError(err.message || 'Invalid email or password.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fillCredentials = (emailVal: string, pwd: string) => {
//     setEmail(emailVal);
//     setPassword(pwd);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4"
//          style={{ background: 'linear-gradient(135deg, #1a1d29 0%, #2d3142 50%, #3d63dd 100%)' }}>
//       <div className="w-full max-w-md">
//         <div className="bg-white rounded-2xl shadow-2xl p-8">
//           {/* Brand */}
//           <div className="text-center mb-6">
//             <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-3">
//               <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                       d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//               </svg>
//             </div>
//             <h1 className="text-2xl font-bold text-gray-800">Gauge Management</h1>
//             <p className="text-sm text-gray-500 mt-1">Calibration Management System</p>
//           </div>

//           {/* Error */}
//           {error && (
//             <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start">
//               <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//               </svg>
//               {error}
//             </div>
//           )}

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
//               <div className="relative">
//                 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                           d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                   </svg>
//                 </div>
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                   autoFocus
//                   autoComplete="email"
//                   className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
//                   placeholder="you@company.com"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
//               <div className="relative">
//                 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                           d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                   </svg>
//                 </div>
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                   autoComplete="current-password"
//                   className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
//                   placeholder="Enter your password"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
//                 >
//                   {showPassword ? (
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                             d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
//                     </svg>
//                   ) : (
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                             d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                             d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                     </svg>
//                   )}
//                 </button>
//               </div>
//             </div>

//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <input
//                   type="checkbox"
//                   id="remember"
//                   checked={rememberMe}
//                   onChange={(e) => setRememberMe(e.target.checked)}
//                   className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                 />
//                 <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
//                   Remember me
//                 </label>
//               </div>
//               <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
//                 Forgot password?
//               </a>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
//             >
//               {loading ? (
//                 <>
//                   <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Signing in...
//                 </>
//               ) : (
//                 <>
//                   <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                           d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
//                   </svg>
//                   Sign In
//                 </>
//               )}
//             </button>
//           </form>

//           {/* Demo Credentials */}
//           <div className="mt-6 p-3 bg-gray-50 rounded-lg">
//             <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center">
//               <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
//               </svg>
//               Demo Credentials (click to fill)
//             </p>
//             <div className="grid grid-cols-1 gap-1.5 text-xs">
//               {[
//                 { role: 'Admin', email: 'admin@company.com', pwd: 'admin123' },
//                 { role: 'Quality Engineer', email: 'priya@company.com', pwd: 'quality123' },
//                 { role: 'Store Keeper', email: 'suresh@company.com', pwd: 'store123' },
//                 { role: 'Shop Floor Operator', email: 'ramesh@company.com', pwd: 'operator123' },
//               ].map((cred) => (
//                 <button
//                   key={cred.email}
//                   type="button"
//                   onClick={() => fillCredentials(cred.email, cred.pwd)}
//                   className="text-left p-2 hover:bg-white rounded border border-transparent hover:border-gray-200 transition flex justify-between items-center"
//                 >
//                   <div>
//                     <div className="font-semibold text-gray-700">{cred.role}</div>
//                     <div className="text-gray-500 font-mono text-[11px]">{cred.email}</div>
//                   </div>
//                   <div className="text-gray-400 font-mono text-[11px]">{cred.pwd}</div>
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         <p className="text-center text-white/70 text-xs mt-4">
//           © 2026 Gauge Calibration Management System
//         </p>
//       </div>
//     </div>
//   );
// }



// import { useState, type FormEvent } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import logo from '../images/logo.png';
// import heroImage from '../images/hero.png';
// import {
//   Mail,
//   Lock,
//   Eye,
//   EyeOff,
//   LogIn,
//   Loader2,
//   AlertCircle,
//   Info,
//   KeyRound,
//   ClipboardCheck,
//   BarChart3,
//   AlertTriangle,
// } from 'lucide-react';

// export default function Login() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const from = (location.state as any)?.from?.pathname || '/dashboard';

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       await login(email, password);
//       navigate(from, { replace: true });
//     } catch (err: any) {
//       setError(err.message || 'Invalid email or password.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className="h-screen flex flex-col overflow-hidden"
//       style={{
//         background: 'linear-gradient(180deg, #f7f5fb 0%, #eef4f5 100%)',
//         fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
//       }}
//     >
//       {/* Top Bar with Logo */}
//       <div className="px-6 py-2 flex-shrink-0">
//         <img
//           src={logo}
//           alt="NL Technologies Pvt. Ltd."
//           className="h-12 w-auto object-contain"
//         />
//       </div>

//       {/* Main Content: Two Columns */}
//       <div className="flex-1 flex gap-4 px-6 pb-3 min-h-0">
//         {/* LEFT SIDE: Showcase Panel */}
//         <div className="flex-1 flex flex-col min-h-0">
//           <div
//             className="h-8 rounded-t-lg flex-shrink-0"
//             style={{
//               background:
//                 'linear-gradient(90deg, #4338ca 0%, #7c3aed 25%, #a855f7 45%, #10b981 70%, #eab308 100%)',
//             }}
//           />

//           <div className="bg-white/30 backdrop-blur-sm py-3 text-center border-x border-white/50 flex-shrink-0">
//             <h1 className="text-xl font-semibold text-gray-800">
//               Gauge Calibration Suite
//             </h1>
//             <p className="text-xs text-gray-500">NL Technologies Pvt. Ltd.</p>
//           </div>

//           <div className="grid grid-cols-3 gap-3 px-3 py-3 bg-white/30 backdrop-blur-sm border-x border-white/50 flex-shrink-0">
//             {/* Calibration */}
//             <div className="bg-indigo-50/70 border border-indigo-100 rounded-lg p-3 text-center hover:shadow-md transition">
//               <div className="inline-flex items-center justify-center w-9 h-9 bg-indigo-500 rounded-lg mb-1.5 shadow-sm">
//                 <ClipboardCheck className="w-5 h-5 text-white" strokeWidth={2.5} />
//               </div>
//               <h3 className="font-bold text-gray-800 text-sm">Calibration</h3>
//               <p className="text-[10px] text-gray-600">Internal & External</p>
//             </div>

//             {/* MSA */}
//             <div className="bg-emerald-50/70 border border-emerald-100 rounded-lg p-3 text-center hover:shadow-md transition">
//               <div className="inline-flex items-center justify-center w-9 h-9 bg-emerald-500 rounded-lg mb-1.5 shadow-sm">
//                 <BarChart3 className="w-5 h-5 text-white" strokeWidth={2.5} />
//               </div>
//               <h3 className="font-bold text-gray-800 text-sm">MSA</h3>
//               <p className="text-[10px] text-gray-600">GR&R · Linearity · Bias</p>
//             </div>

//             {/* CAPA */}
//             <div className="bg-amber-50/70 border border-amber-100 rounded-lg p-3 text-center hover:shadow-md transition">
//               <div className="inline-flex items-center justify-center w-9 h-9 bg-amber-500 rounded-lg mb-1.5 shadow-sm">
//                 <AlertTriangle className="w-5 h-5 text-white" strokeWidth={2.5} />
//               </div>
//               <h3 className="font-bold text-gray-800 text-sm">CAPA</h3>
//               <p className="text-[10px] text-gray-600">Track & Close Issues</p>
//             </div>
//           </div>

//           <div className="bg-indigo-50/50 border border-white/50 py-2 px-4 text-center flex-shrink-0">
//             <p className="text-xs text-gray-700">
//               One platform to manage{' '}
//               <span className="font-semibold text-indigo-600">gauges</span>,{' '}
//               <span className="font-semibold text-emerald-600">quality</span>,
//               and{' '}
//               <span className="font-semibold text-amber-600">compliance</span>{' '}
//               across your operations.
//             </p>
//           </div>

//           <div className="flex-1 mt-2 rounded-lg overflow-hidden shadow-md min-h-0">
//             <img
//               src={heroImage}
//               alt="Manufacturing Floor"
//               className="w-full h-full object-cover"
//             />
//           </div>

//           <p className="text-center text-[10px] text-gray-500 mt-1 flex-shrink-0">
//             © 2026 NL Technologies Pvt Ltd
//           </p>
//         </div>

//         {/* RIGHT SIDE: Login Panel */}
//         <div className="w-[400px] flex flex-col min-h-0">
//           <div className="bg-white rounded-xl shadow-xl overflow-hidden flex flex-col h-full">
//             <div
//               className="h-1.5 flex-shrink-0"
//               style={{
//                 background:
//                   'linear-gradient(90deg, #4338ca 0%, #7c3aed 25%, #a855f7 45%, #10b981 70%, #eab308 100%)',
//               }}
//             />

//             <div className="p-6 flex-1 flex flex-col justify-center overflow-y-auto">
//               {/* Logo Bubble */}
//               <div className="mb-3">
//                 <div
//                   className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
//                   style={{
//                     background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
//                   }}
//                 >
//                   <KeyRound className="w-6 h-6 text-white" strokeWidth={2} />
//                 </div>
//               </div>

//               <h2 className="text-3xl font-bold text-gray-900 mb-1">
//                 Welcome back!
//               </h2>
//               <p className="text-sm text-gray-500 mb-4">
//                 Sign in to access your dashboard
//               </p>

//               {error && (
//                 <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-start gap-2">
//                   <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
//                   {error}
//                 </div>
//               )}

//               <form onSubmit={handleSubmit} className="space-y-3">
//                 {/* Email */}
//                 <div>
//                   <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//                     Email address
//                   </label>
//                   <div className="relative">
//                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
//                     <input
//                       type="email"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       required
//                       autoFocus
//                       autoComplete="email"
//                       className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm text-gray-800"
//                       placeholder="you@company.com"
//                     />
//                   </div>
//                 </div>

//                 {/* Password */}
//                 <div>
//                   <label className="block text-xs font-semibold text-gray-800 mb-1.5">
//                     Password
//                   </label>
//                   <div className="relative">
//                     <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
//                     <input
//                       type={showPassword ? 'text' : 'password'}
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       required
//                       autoComplete="current-password"
//                       className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm text-gray-800"
//                       placeholder="Enter your password"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                     >
//                       {showPassword ? (
//                         <EyeOff className="w-4 h-4" strokeWidth={2} />
//                       ) : (
//                         <Eye className="w-4 h-4" strokeWidth={2} />
//                       )}
//                     </button>
//                   </div>
//                 </div>

//                 {/* Sign In */}
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="w-full py-2.5 text-white font-semibold rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg mt-2"
//                   style={{
//                     background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
//                   }}
//                 >
//                   {loading ? (
//                     <>
//                       <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />
//                       Signing in...
//                     </>
//                   ) : (
//                     <>
//                       <LogIn className="w-4 h-4" strokeWidth={2.5} />
//                       Sign In
//                     </>
//                   )}
//                 </button>
//               </form>

//               {/* Info Notice */}
//               <div className="mt-3 p-2 bg-amber-50 border border-amber-100 rounded-lg">
//                 <p className="text-xs text-amber-800 text-center flex items-center justify-center gap-1.5">
//                   <Info className="w-3.5 h-3.5" strokeWidth={2} />
//                   Your dashboard will load after login
//                 </p>
//               </div>

//               <p className="text-center text-xs text-gray-500 mt-2">
//                 Contact your administrator for access.
//               </p>

//               {/* Demo Credentials */}
//               <details className="mt-2">
//                 <summary className="text-[11px] text-gray-500 cursor-pointer hover:text-indigo-600 text-center flex items-center justify-center gap-1">
//                   <KeyRound className="w-3 h-3" strokeWidth={2} />
//                   Show demo credentials
//                 </summary>
//                 <div className="mt-2 p-2 bg-gray-50 rounded-lg space-y-1">
//                   {[
//                     { role: 'Admin', email: 'admin@company.com', pwd: 'admin123' },
//                     { role: 'Quality Eng.', email: 'priya@company.com', pwd: 'quality123' },
//                     { role: 'Store Keeper', email: 'suresh@company.com', pwd: 'store123' },
//                     { role: 'Operator', email: 'ramesh@company.com', pwd: 'operator123' },
//                   ].map((cred) => (
//                     <button
//                       key={cred.email}
//                       type="button"
//                       onClick={() => {
//                         setEmail(cred.email);
//                         setPassword(cred.pwd);
//                       }}
//                       className="w-full text-left p-1.5 hover:bg-white rounded transition flex justify-between items-center"
//                     >
//                       <div>
//                         <div className="font-semibold text-gray-700 text-[11px]">
//                           {cred.role}
//                         </div>
//                         <div className="text-gray-500 font-mono text-[10px]">
//                           {cred.email}
//                         </div>
//                       </div>
//                       <div className="text-gray-400 font-mono text-[10px]">
//                         {cred.pwd}
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               </details>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/pages/Login.tsx — Premium "Quality Command Center" redesign


import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../images/logo.png';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  AlertCircle,
  KeyRound,
  ClipboardCheck,
  BarChart3,
  AlertTriangle,
  Activity,
  ShieldCheck,
  Target,
  ChevronDown,
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row"
      style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
    >
      {/* ══════════════════════ LEFT — Visual Command Center ══════════════════════ */}
      <div
        className="hidden lg:flex relative w-[60%] flex-col justify-between overflow-hidden p-10"
        style={{
          background:
            'linear-gradient(135deg, #312E81 0%, #4338CA 28%, #5B4CF0 52%, #2563EB 78%, #0891B2 100%)',
        }}
      >
        {/* technical grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* radial glows */}
        <div className="absolute -top-24 -left-16 w-96 h-96 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute top-1/3 -right-20 w-[28rem] h-[28rem] rounded-full bg-violet-400/10 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute -bottom-24 left-1/4 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" aria-hidden="true" />
        {/* dot matrix accent */}
        <div
          className="absolute bottom-24 right-10 w-40 h-28 pointer-events-none opacity-30"
          aria-hidden="true"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '10px 10px',
          }}
        />

        {/* top brand area */}
        <div className="relative z-10">
          <div className="bg-white/95 rounded-2xl px-4 py-2.5 shadow-lg inline-flex">
            <img src={logo} alt="NL Technologies Pvt. Ltd." className="h-9 w-auto object-contain" />
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/60">
            Quality · Calibration · Traceability
          </p>
        </div>

        {/* hero content + dial cluster */}
        <div className="relative z-10 flex items-center  gap-10 flex-1 pb-6">
          <div className="max-w-[380px]">
            <h1 className="text-4xl xl:text-4xl font-bold text-white tracking-[-0.02em]">
              <span className="block -mt-2">Gauge Calibration</span>
              <span className="block mt-2">Management System</span>
            </h1>
            <p className="mt-6 text-[15px] text-indigo-100/90 leading-loose">
              Precision, traceability, and quality control across every measurement workflow.
            </p>
            <p className="mt-4 text-sm text-indigo-100/70 leading-loose">
              Manage gauges, calibration schedules, MSA studies, CAPA actions, and audit-ready
              activity from one connected workspace.
            </p>

            {/* mini control chart */}
            {/* <div className="mt-8 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 max-w-[280px] shadow-xl">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70 mb-2">
                Process Stability
              </p>
              <svg viewBox="0 0 220 70" className="w-full h-16" aria-hidden="true">
                <line x1="0" y1="12" x2="220" y2="12" stroke="rgba(255,255,255,0.25)" strokeDasharray="4 4" />
                <line x1="0" y1="35" x2="220" y2="35" stroke="rgba(255,255,255,0.35)" />
                <line x1="0" y1="58" x2="220" y2="58" stroke="rgba(255,255,255,0.25)" strokeDasharray="4 4" />
                <polyline
                  points="0,40 35,28 70,44 105,30 140,38 175,24 220,32"
                  fill="none"
                  stroke="#34D399"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {[[0, 40], [35, 28], [70, 44], [105, 30], [140, 38], [175, 24], [220, 32]].map(
                  ([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="2.5" fill="#34D399" />
                  )
                )}
              </svg>
              <p className="text-[10px] text-white/50 mt-1">Quality monitoring</p>
            </div> */}
          </div>

          {/* calibration dial cluster */}
          <div className="relative hidden xl:block w-[420px] h-[420px] flex-shrink-0" aria-hidden="true">
            <div className="absolute inset-0 rounded-full border border-white/10" />
            <div className="absolute inset-10 rounded-full border border-white/10" />
            <div className="absolute inset-20 rounded-full border border-white/15" />

            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 w-px h-3 bg-white/25"
                style={{ transform: `rotate(${i * 15}deg) translateY(-190px)`, transformOrigin: 'center' }}
              />
            ))}

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-36 h-36 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl flex flex-col items-center justify-center gap-1.5">
                <Target className="w-7 h-7 text-white/90" strokeWidth={1.75} />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/80 text-center leading-tight">
                  Precision<br />Control
                </span>
              </div>
            </div>

            <div className="absolute top-[70px] left-[70px] w-[130px] h-px bg-white/15" style={{ transform: 'rotate(45deg)', transformOrigin: 'right' }} />
            <div className="absolute top-[70px] right-[70px] w-[130px] h-px bg-white/15" style={{ transform: 'rotate(-45deg)', transformOrigin: 'left' }} />
            <div className="absolute bottom-[70px] left-[70px] w-[130px] h-px bg-white/15" style={{ transform: 'rotate(-45deg)', transformOrigin: 'right' }} />
            <div className="absolute bottom-[70px] right-[70px] w-[130px] h-px bg-white/15" style={{ transform: 'rotate(45deg)', transformOrigin: 'left' }} />

            <div className="absolute top-0 left-0 w-[150px] bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3 shadow-xl">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/80 flex items-center justify-center mb-1.5">
                <ClipboardCheck className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <p className="text-xs font-bold text-white">Calibration</p>
              <p className="text-[10px] text-white/60">Internal &amp; External</p>
            </div>

            <div className="absolute top-0 right-0 w-[150px] bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3 shadow-xl">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/80 flex items-center justify-center mb-1.5">
                <BarChart3 className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <p className="text-xs font-bold text-white">MSA</p>
              <p className="text-[10px] text-white/60">GR&amp;R · Linearity · Bias</p>
            </div>

            <div className="absolute bottom-0 left-0 w-[150px] bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3 shadow-xl">
              <div className="w-8 h-8 rounded-lg bg-amber-500/80 flex items-center justify-center mb-1.5">
                <AlertTriangle className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <p className="text-xs font-bold text-white">CAPA</p>
              <p className="text-[10px] text-white/60">Corrective Actions</p>
            </div>

            <div className="absolute bottom-0 right-0 w-[150px] bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3 shadow-xl">
              <div className="w-8 h-8 rounded-lg bg-violet-500/80 flex items-center justify-center mb-1.5">
                <Activity className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <p className="text-xs font-bold text-white">Traceability</p>
              <p className="text-[10px] text-white/60">Complete History</p>
            </div>
          </div>
        </div>

        {/* bottom capability strip */}
        <div className="relative z-10 flex items-center gap-6 flex-wrap text-white/75">
          <span className="flex items-center gap-1.5 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" strokeWidth={2} /> Calibration Traceability
          </span>
          <span className="flex items-center gap-1.5 text-xs">
            <BarChart3 className="w-3.5 h-3.5 text-cyan-300" strokeWidth={2} /> MSA Analysis
          </span>
          <span className="flex items-center gap-1.5 text-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-300" strokeWidth={2} /> CAPA Control
          </span>
          <span className="flex items-center gap-1.5 text-xs">
            <Activity className="w-3.5 h-3.5 text-violet-300" strokeWidth={2} /> Audit History
          </span>
        </div>
      </div>

      {/* ══════════════════════ RIGHT — Authentication ══════════════════════ */}
      <div
        className="relative flex-1 flex items-center justify-center p-6 lg:p-10"
        style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFF 55%, #F3F7FF 100%)' }}
      >
        <div className="lg:hidden absolute top-6 left-6">
          <img src={logo} alt="NL Technologies Pvt. Ltd." className="h-9 w-auto object-contain" />
        </div>

        <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-indigo-200/25 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-10 left-10 w-56 h-56 rounded-full bg-cyan-200/20 blur-3xl pointer-events-none" aria-hidden="true" />

        <div
          className="relative z-10 w-full max-w-[460px] bg-white/95 rounded-[28px] border border-slate-200/70 overflow-hidden"
          style={{ boxShadow: '0 24px 70px rgba(15,23,42,0.12), 0 8px 24px rgba(79,70,229,0.06)' }}
        >
          <div className="h-1" style={{ background: 'linear-gradient(90deg, #4F46E5, #7C3AED, #2563EB, #10B981)' }} />

          <div className="p-8 sm:p-10">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md mb-5"
              style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' }}
            >
              <KeyRound className="w-5 h-5 text-white" strokeWidth={2} />
            </div>

            <h2 className="text-2xl font-bold text-[#172033] mb-1.5">Welcome back</h2>
            <p className="text-sm text-slate-500 mb-6">Sign in to continue to your quality workspace.</p>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={2} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    autoComplete="email"
                    className="w-full h-[50px] pl-10 pr-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100/70 focus:border-indigo-400 focus:bg-white outline-none transition text-sm text-slate-800"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={2} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full h-[50px] pl-10 pr-10 bg-slate-50/80 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100/70 focus:border-indigo-400 focus:bg-white outline-none transition text-sm text-slate-800"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={2} /> : <Eye className="w-4 h-4" strokeWidth={2} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[50px] text-white font-semibold rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-px mt-2"
                style={{ background: 'linear-gradient(90deg, #4F46E5 0%, #6366F1 45%, #7C3AED 100%)' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" strokeWidth={2.5} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center justify-center gap-4 mt-5 flex-wrap">
              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                <Lock className="w-3 h-3 text-indigo-400" strokeWidth={2} /> Secure access
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                <ShieldCheck className="w-3 h-3 text-emerald-500" strokeWidth={2} /> Role-based permissions
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                <KeyRound className="w-3 h-3 text-violet-400" strokeWidth={2} /> Protected workspace
              </span>
            </div>

            <p className="text-center text-xs text-slate-500 mt-4">Need access? Contact your administrator.</p>

            {/* <details className="mt-4 group">
              <summary className="text-[11px] text-slate-500 cursor-pointer hover:text-indigo-600 text-center flex items-center justify-center gap-1 list-none">
                <KeyRound className="w-3 h-3" strokeWidth={2} />
                Demo access
                <ChevronDown className="w-3 h-3 transition-transform group-open:rotate-180" strokeWidth={2} />
              </summary>
              <div className="mt-2.5 p-2 bg-slate-50 rounded-xl space-y-1">
                {[
                  { role: 'Admin', email: 'admin@company.com', pwd: 'admin123' },
                  { role: 'Quality Eng.', email: 'priya@company.com', pwd: 'quality123' },
                  { role: 'Store Keeper', email: 'suresh@company.com', pwd: 'store123' },
                  { role: 'Operator', email: 'ramesh@company.com', pwd: 'operator123' },
                ].map((cred) => (
                  <button
                    key={cred.email}
                    type="button"
                    onClick={() => {
                      setEmail(cred.email);
                      setPassword(cred.pwd);
                    }}
                    className="w-full text-left p-2 hover:bg-white rounded-lg transition flex justify-between items-center"
                  >
                    <div>
                      <div className="font-semibold text-slate-700 text-[11px]">{cred.role}</div>
                      <div className="text-slate-500 font-mono text-[10px]">{cred.email}</div>
                    </div>
                    <div className="text-slate-400 font-mono text-[10px]">{cred.pwd}</div>
                  </button>
                ))}
              </div>
            </details> */}
          </div>
        </div>
      </div>
    </div>
  );
}
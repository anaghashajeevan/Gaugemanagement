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

import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../images/logo.png';
import heroImage from '../images/hero.png';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  AlertCircle,
  Info,
  KeyRound,
  ClipboardCheck,
  BarChart3,
  AlertTriangle,
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
      className="h-screen flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #f7f5fb 0%, #eef4f5 100%)',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Top Bar with Logo */}
      <div className="px-6 py-2 flex-shrink-0">
        <img
          src={logo}
          alt="NL Technologies Pvt. Ltd."
          className="h-12 w-auto object-contain"
        />
      </div>

      {/* Main Content: Two Columns */}
      <div className="flex-1 flex gap-4 px-6 pb-3 min-h-0">
        {/* LEFT SIDE: Showcase Panel */}
        <div className="flex-1 flex flex-col min-h-0">
          <div
            className="h-8 rounded-t-lg flex-shrink-0"
            style={{
              background:
                'linear-gradient(90deg, #4338ca 0%, #7c3aed 25%, #a855f7 45%, #10b981 70%, #eab308 100%)',
            }}
          />

          <div className="bg-white/30 backdrop-blur-sm py-3 text-center border-x border-white/50 flex-shrink-0">
            <h1 className="text-xl font-semibold text-gray-800">
              Gauge Calibration Suite
            </h1>
            <p className="text-xs text-gray-500">NL Technologies Pvt. Ltd.</p>
          </div>

          <div className="grid grid-cols-3 gap-3 px-3 py-3 bg-white/30 backdrop-blur-sm border-x border-white/50 flex-shrink-0">
            {/* Calibration */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-lg p-3 text-center hover:shadow-md transition">
              <div className="inline-flex items-center justify-center w-9 h-9 bg-indigo-500 rounded-lg mb-1.5 shadow-sm">
                <ClipboardCheck className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="font-bold text-gray-800 text-sm">Calibration</h3>
              <p className="text-[10px] text-gray-600">Internal & External</p>
            </div>

            {/* MSA */}
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-lg p-3 text-center hover:shadow-md transition">
              <div className="inline-flex items-center justify-center w-9 h-9 bg-emerald-500 rounded-lg mb-1.5 shadow-sm">
                <BarChart3 className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="font-bold text-gray-800 text-sm">MSA</h3>
              <p className="text-[10px] text-gray-600">GR&R · Linearity · Bias</p>
            </div>

            {/* CAPA */}
            <div className="bg-amber-50/70 border border-amber-100 rounded-lg p-3 text-center hover:shadow-md transition">
              <div className="inline-flex items-center justify-center w-9 h-9 bg-amber-500 rounded-lg mb-1.5 shadow-sm">
                <AlertTriangle className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="font-bold text-gray-800 text-sm">CAPA</h3>
              <p className="text-[10px] text-gray-600">Track & Close Issues</p>
            </div>
          </div>

          <div className="bg-indigo-50/50 border border-white/50 py-2 px-4 text-center flex-shrink-0">
            <p className="text-xs text-gray-700">
              One platform to manage{' '}
              <span className="font-semibold text-indigo-600">gauges</span>,{' '}
              <span className="font-semibold text-emerald-600">quality</span>,
              and{' '}
              <span className="font-semibold text-amber-600">compliance</span>{' '}
              across your operations.
            </p>
          </div>

          <div className="flex-1 mt-2 rounded-lg overflow-hidden shadow-md min-h-0">
            <img
              src={heroImage}
              alt="Manufacturing Floor"
              className="w-full h-full object-cover"
            />
          </div>

          <p className="text-center text-[10px] text-gray-500 mt-1 flex-shrink-0">
            © 2026 NL Technologies Pvt Ltd
          </p>
        </div>

        {/* RIGHT SIDE: Login Panel */}
        <div className="w-[400px] flex flex-col min-h-0">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden flex flex-col h-full">
            <div
              className="h-1.5 flex-shrink-0"
              style={{
                background:
                  'linear-gradient(90deg, #4338ca 0%, #7c3aed 25%, #a855f7 45%, #10b981 70%, #eab308 100%)',
              }}
            />

            <div className="p-6 flex-1 flex flex-col justify-center overflow-y-auto">
              {/* Logo Bubble */}
              <div className="mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  }}
                >
                  <KeyRound className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-1">
                Welcome back!
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Sign in to access your dashboard
              </p>

              {error && (
                <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      autoComplete="email"
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm text-gray-800"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm text-gray-800"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" strokeWidth={2} />
                      ) : (
                        <Eye className="w-4 h-4" strokeWidth={2} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Sign In */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 text-white font-semibold rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg mt-2"
                  style={{
                    background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                  }}
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

              {/* Info Notice */}
              <div className="mt-3 p-2 bg-amber-50 border border-amber-100 rounded-lg">
                <p className="text-xs text-amber-800 text-center flex items-center justify-center gap-1.5">
                  <Info className="w-3.5 h-3.5" strokeWidth={2} />
                  Your dashboard will load after login
                </p>
              </div>

              <p className="text-center text-xs text-gray-500 mt-2">
                Contact your administrator for access.
              </p>

              {/* Demo Credentials */}
              <details className="mt-2">
                <summary className="text-[11px] text-gray-500 cursor-pointer hover:text-indigo-600 text-center flex items-center justify-center gap-1">
                  <KeyRound className="w-3 h-3" strokeWidth={2} />
                  Show demo credentials
                </summary>
                <div className="mt-2 p-2 bg-gray-50 rounded-lg space-y-1">
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
                      className="w-full text-left p-1.5 hover:bg-white rounded transition flex justify-between items-center"
                    >
                      <div>
                        <div className="font-semibold text-gray-700 text-[11px]">
                          {cred.role}
                        </div>
                        <div className="text-gray-500 font-mono text-[10px]">
                          {cred.email}
                        </div>
                      </div>
                      <div className="text-gray-400 font-mono text-[10px]">
                        {cred.pwd}
                      </div>
                    </button>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
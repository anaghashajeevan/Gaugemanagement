// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import ProtectedRoute from './components/ProtectedRoute';
// import Login from './pages/Login';
// import Dashboard from './pages/Dashboard';
// import ChangePassword from './pages/ChangePassword';

// function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<Navigate to="/dashboard" replace />} />
//           <Route path="/login" element={<Login />} />
          
//           <Route
//             path="/dashboard"
//             element={
//               <ProtectedRoute>
//                 <Dashboard />
//               </ProtectedRoute>
//             }
//           />
          
//           <Route
//             path="/change-password"
//             element={
//               <ProtectedRoute>
//                 <ChangePassword />
//               </ProtectedRoute>
//             }
//           />
          
//           <Route path="*" element={<Navigate to="/dashboard" replace />} />
//         </Routes>
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }

// export default App;

// src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { useEffect } from 'react';
import { seedIfEmpty } from './utils/storage';

// Auth Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ChangePassword from './pages/ChangePassword';

// Main Pages
import GaugeMaster from './pages/GaugeMaster';
import GaugeHistory from './pages/GaugeHistory';
import Calibration from './pages/Calibration';
import MSA from './pages/MSA';
import CAPA from './pages/CAPA';
import IssueReturn from './pages/IssueReturn';
import Reports from './pages/Reports';

// Admin Pages
import Users from './pages/admin/Users';
import Roles from './pages/admin/Roles';
import Departments from './pages/admin/Departments';
import OutsideLabs from './pages/admin/OutsideLabs';
import AuditTrail from './pages/admin/AuditTrail';

function AppRoutes() {
  useEffect(() => {
    seedIfEmpty();
  }, []);

  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected — All roles */}
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/change-password" element={
        <ProtectedRoute><ChangePassword /></ProtectedRoute>
      } />
      <Route path="/gauges" element={
        <ProtectedRoute><GaugeMaster /></ProtectedRoute>
      } />
      <Route path="/gauges/:id" element={
        <ProtectedRoute><GaugeHistory /></ProtectedRoute>
      } />
      <Route path="/capa" element={
        <ProtectedRoute><CAPA /></ProtectedRoute>
      } />
      <Route path="/issue-return" element={
        <ProtectedRoute><IssueReturn /></ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute><Reports /></ProtectedRoute>
      } />

      {/* Protected — Non-operator */}
      <Route path="/calibration" element={
        <ProtectedRoute><Calibration /></ProtectedRoute>
      } />

      {/* Protected — Quality Engineer + Admin */}
      <Route path="/msa" element={
        <ProtectedRoute><MSA /></ProtectedRoute>
      } />

      {/* Admin only */}
      <Route path="/admin/users" element={
        <ProtectedRoute requiredRole="admin"><Users /></ProtectedRoute>
      } />
      <Route path="/admin/roles" element={
        <ProtectedRoute requiredRole="admin"><Roles /></ProtectedRoute>
      } />
      <Route path="/admin/departments" element={
        <ProtectedRoute requiredRole="admin"><Departments /></ProtectedRoute>
      } />
      <Route path="/admin/outside-labs" element={
        <ProtectedRoute requiredRole="admin"><OutsideLabs /></ProtectedRoute>
      } />
      <Route path="/admin/audit" element={
        <ProtectedRoute requiredRole="admin"><AuditTrail /></ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
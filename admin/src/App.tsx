import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from '../src/contexts/AuthContext';
import AdminLayout from './components/AdminLayout';
import AdminRoute from './components/AdminRoute';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminCards from './pages/AdminCards';
import AdminStudents from './pages/AdminStudents';
import AdminDepartments from './pages/AdminDepartments';
import AdminPayments from './pages/AdminPayments';
import AdminReports from './pages/AdminReports';
import AdminSettings from './pages/AdminSettings';
import AdminSupport from './pages/AdminSupport';

// Composant pour tracker les changements de route
const RouteTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    console.log('🔄 Route changée:', location.pathname);
  }, [location]);

  return null;
};

function App() {
  console.log('🚀 App.tsx chargé');

  return (
    <AuthProvider>
      <Router>
        <RouteTracker />
        <Routes>
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Page de connexion admin */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Routes protégées */}
          <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<AdminStudents />} />
            <Route path="/admin/cards" element={<AdminCards />} />
            <Route path="/admin/departments" element={<AdminDepartments />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/support" element={<AdminSupport />} />
          </Route>

          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App; 
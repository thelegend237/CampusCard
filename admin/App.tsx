import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from '../src/contexts/AuthContext';
import AdminLayout from './src/components/AdminLayout';
import AdminRoute from './src/components/AdminRoute';
import AdminLogin from './src/pages/AdminLogin';
import AdminDashboard from './src/pages/AdminDashboard';
import AdminCards from './src/pages/AdminCards';
import AdminPrintCards from './src/pages/AdminPrintCards';
import AdminPrintCardView from './src/pages/AdminPrintCardView';
import AdminStudents from './src/pages/AdminStudents';
import AdminDepartments from './src/pages/AdminDepartments';
import AdminPayments from './src/pages/AdminPayments';
import AdminReports from './src/pages/AdminReports';
import AdminSettings from './src/pages/AdminSettings';
import AdminSupport from './src/pages/AdminSupport';

// Composant pour tracer les changements de route
const RouteTracker: React.FC = () => {
  const location = useLocation();
  
  useEffect(() => {
    console.log('📍 Route actuelle:', location.pathname);
  }, [location.pathname]);
  
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
          
          {/* Page d'impression (sans authentification) */}
          <Route path="/admin/print-card" element={<AdminPrintCardView />} />
          
          {/* Routes protégées */}
          <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<AdminStudents />} />
            <Route path="/admin/cards" element={<AdminCards />} />
            <Route path="/admin/print-cards" element={<AdminPrintCards />} />
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
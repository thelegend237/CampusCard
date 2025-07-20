import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/Layout/DashboardLayout';
import Dashboard from './pages/student/Dashboard';
import PaymentStatus from './pages/student/PaymentStatus';
import CardGeneration from './pages/student/CardGeneration';
import History from './pages/student/History';
import Settings from './pages/student/Settings';
import Support from './pages/student/Support';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminCards from './pages/admin/AdminCards';
import AdminPayments from './pages/admin/AdminPayments';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLayout from './components/AdminLayout';
import AdminRoute from './components/AdminRoute';
import StudentCardView from './pages/student/StudentCardView';

const ProtectedRoute: React.FC<{ children: React.ReactNode; requireAdmin?: boolean }> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/student/card-view" element={<StudentCardView />} />
            
            {/* Student Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="payment-status" element={<PaymentStatus />} />
              <Route path="card-generation" element={<CardGeneration />} />
              <Route path="history" element={<History />} />
              <Route path="settings" element={<Settings />} />
              <Route path="support" element={<Support />} />
              <Route path="student/card-view" element={<StudentCardView />} />
            </Route>

            {/* Admin Routes protégées par AdminRoute */}
            <Route path="/admin/*" element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="cards" element={<AdminCards />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="departments" element={<AdminDepartments />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Redirects */}
            <Route path="/payment-status" element={<Navigate to="/dashboard/payment-status" replace />} />
            <Route path="/card-generation" element={<Navigate to="/dashboard/card-generation" replace />} />
            <Route path="/history" element={<Navigate to="/dashboard/history" replace />} />
            <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />
            <Route path="/support" element={<Navigate to="/dashboard/support" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
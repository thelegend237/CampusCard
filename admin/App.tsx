import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './src/components/AdminLayout';
import AdminRoute from './src/components/AdminRoute';
import AdminDashboard from './src/pages/AdminDashboard';
import AdminCards from './src/pages/AdminCards';
import AdminStudents from './src/pages/AdminStudents';
import AdminDepartments from './src/pages/AdminDepartments';
import AdminPayments from './src/pages/AdminPayments';
import AdminReports from './src/pages/AdminReports';
import AdminSettings from './src/pages/AdminSettings';
import AdminSupport from './src/pages/AdminSupport';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/students" element={<AdminStudents />} />
          <Route path="/cards" element={<AdminCards />} />
          <Route path="/departments" element={<AdminDepartments />} />
          <Route path="/payments" element={<AdminPayments />} />
          <Route path="/reports" element={<AdminReports />} />
          <Route path="/settings" element={<AdminSettings />} />
          <Route path="/admin/support" element={<AdminSupport />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App; 
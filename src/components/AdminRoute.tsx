import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  console.log('🔐 AdminRoute - Vérification de l\'authentification:', { 
    user: user ? { id: user.id, email: user.email, role: user.role } : null,
    loading
  });
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user || user.role !== 'admin') {
    console.log('❌ AdminRoute - Accès refusé, redirection vers /admin/login');
    return <Navigate to="/admin/login" replace />;
  }
  
  console.log('✅ AdminRoute - Accès autorisé pour admin');
  return <>{children}</>;
};

export default AdminRoute; 
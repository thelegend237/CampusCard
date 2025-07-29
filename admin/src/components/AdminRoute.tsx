import React from 'react';
import { useAuth } from '../../../src/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  console.log('🔐 AdminRoute - Vérification de l\'authentification:', { 
    user: user ? { id: user.id, email: user.email, role: user.role } : null 
  });
  
  if (!user || user.role !== 'admin') {
    console.log('❌ AdminRoute - Accès refusé, redirection vers /admin/login');
    return <Navigate to="/admin/login" replace />;
  }
  
  console.log('✅ AdminRoute - Accès autorisé pour admin');
  return <>{children}</>;
};

export default AdminRoute; 
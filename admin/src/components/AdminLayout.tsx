import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, DollarSign, Building, FileText, Settings, LogOut, HelpCircle, Printer } from 'lucide-react';
import { useAuth } from '../../../src/contexts/AuthContext';

const adminNavItems = [
  { path: '/admin/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { path: '/admin/students', label: 'Étudiants', icon: Users },
  { path: '/admin/cards', label: 'Cartes', icon: CreditCard },
  { path: '/admin/print-cards', label: 'Impression Cartes', icon: Printer },
  { path: '/admin/payments', label: 'Paiements', icon: DollarSign },
  { path: '/admin/departments', label: 'Départements', icon: Building },
  { path: '/admin/reports', label: 'Rapports', icon: FileText },
  { path: '/admin/support', label: 'Support', icon: HelpCircle },
  { path: '/admin/settings', label: 'Paramètres', icon: Settings },
];

const AdminLayout: React.FC = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-900 via-blue-950 to-purple-900">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col justify-between min-h-screen shadow-xl">
        <div>
          <div className="p-6 flex items-center space-x-2 mb-8">
            <div className="w-12 h-12 flex items-center justify-center">
              <img src="/logo-iut.png" alt="Logo IUT" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold text-white">CampusCard Admin</span>
          </div>
          <nav className="space-y-2">
            {adminNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="p-6 border-t border-gray-800">
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-gray-900 text-white px-8 py-4 flex items-center justify-between shadow">
          <h1 className="text-2xl font-bold">Espace Administrateur</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300">{user?.email}</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 
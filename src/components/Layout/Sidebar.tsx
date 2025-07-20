import React from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  History,
  Settings,
  HelpCircle,
  Play,
  LogOut,
  Users,
  FileText,
  DollarSign,
  Building
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const studentNavItems = [
    { path: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { path: '/payment-status', label: 'État du paiement', icon: DollarSign },
    { path: '/card-generation', label: 'Génération de carte', icon: CreditCard },
    { path: '/history', label: 'Historique', icon: History },
    { path: '/support', label: 'Support', icon: HelpCircle },
    { path: '/settings', label: 'Paramètres', icon: Settings },
  ];

  const adminNavItems = [
    { path: '/admin/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { path: '/admin/students', label: 'Étudiants', icon: Users },
    { path: '/admin/cards', label: 'Cartes', icon: CreditCard },
    { path: '/admin/payments', label: 'Paiements', icon: DollarSign },
    { path: '/admin/departments', label: 'Départements', icon: Building },
    { path: '/admin/reports', label: 'Rapports', icon: FileText },
    { path: '/admin/settings', label: 'Paramètres', icon: Settings },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : studentNavItems;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-12 h-12 flex items-center justify-center">
              <img src="/logo-iut.png" alt="Logo IUT" className="w-full h-full object-contain rounded-full" />
            </div>
            <span className="text-xl font-bold text-white">CampusCard</span>
          </Link>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
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

        <div className="mt-8 pt-8 border-t border-gray-700">
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
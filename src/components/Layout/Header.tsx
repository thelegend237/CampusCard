import React from 'react';
import { Search, Bell, User, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Notification } from '../../types';
import { Loader2 } from 'lucide-react';

const helpContent: Record<string, { title: string; description: string; tips: string[] }> = {
  '/dashboard': {
    title: 'Tableau de bord',
    description: 'Vue d’ensemble de votre compte étudiant, statut de paiement, carte, notifications.',
    tips: [
      'Consultez le statut de votre paiement et de votre carte.',
      'Accédez rapidement à vos paramètres ou à l’historique.',
      'Surveillez les notifications importantes en haut à droite.'
    ]
  },
  '/dashboard/payment-status': {
    title: 'État du paiement',
    description: 'Suivez l’état de vos paiements pour la carte étudiant.',
    tips: [
      'Vérifiez si votre paiement a été validé.',
      'Téléchargez votre reçu si besoin.',
      'Contactez le support en cas de problème.'
    ]
  },
  '/dashboard/card-generation': {
    title: 'Génération de carte',
    description: 'Remplissez le formulaire pour générer votre carte étudiant.',
    tips: [
      'Complétez toutes les informations demandées.',
      'Téléchargez une photo d’identité conforme.',
      'Suivez les étapes jusqu’à la validation.'
    ]
  },
  '/dashboard/history': {
    title: 'Historique',
    description: 'Consultez l’historique de vos paiements, cartes et notifications.',
    tips: [
      'Filtrez par type (paiement, carte, notification).',
      'Téléchargez vos reçus ou cartes passées.',
      'Gardez un œil sur les notifications importantes.'
    ]
  },
  '/dashboard/settings': {
    title: 'Paramètres',
    description: 'Gérez votre profil, sécurité et préférences de notification.',
    tips: [
      'Mettez à jour vos informations personnelles.',
      'Activez la double authentification pour plus de sécurité.',
      'Choisissez vos préférences de notification.'
    ]
  },
  '/dashboard/support': {
    title: 'Support',
    description: 'Obtenez de l’aide ou contactez l’assistance.',
    tips: [
      'Consultez la FAQ pour les questions courantes.',
      'Envoyez un message au support si besoin.',
      'Vérifiez les horaires et moyens de contact.'
    ]
  },
  '/': {
    title: 'Accueil',
    description: 'Bienvenue sur CampusCard, la plateforme de gestion de carte étudiant.',
    tips: [
      'Naviguez dans les sections pour découvrir les fonctionnalités.',
      'Créez un compte ou connectez-vous pour commencer.',
      'Contactez le support pour toute question.'
    ]
  },
};

const Header: React.FC<{ onOpenSidebar?: () => void }> = ({ onOpenSidebar }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const location = useLocation();
  const [helpOpen, setHelpOpen] = React.useState(false);
  const path = location.pathname;
  const help = helpContent[path] || helpContent['/'];
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from('notifications')
      .select('*')
      .eq('userid', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        setNotifications(data || []);
        setLoading(false);
      });
  }, [user, menuOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleBellClick = async () => {
    setMenuOpen((open) => !open);
    // Marquer comme lues si menu s'ouvre et il y a des non lues
    if (!menuOpen && unreadCount > 0 && user) {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      if (unreadIds.length > 0) {
        await supabase
          .from('notifications')
          .update({ read: true })
          .in('id', unreadIds);
        // Rafraîchir après update
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('userid', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        setNotifications(data || []);
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Fermer le menu profil si on clique en dehors
  React.useEffect(() => {
    if (!profileMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[title="Profil utilisateur"]') && !target.closest('.profile-popover')) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [profileMenuOpen]);

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 w-full">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          {onOpenSidebar && (
            <button className="block md:hidden mr-2 p-2 rounded text-gray-700 hover:bg-gray-200" onClick={onOpenSidebar} title="Ouvrir le menu">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          )}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-12 h-12 flex items-center justify-center">
              <img src="/logo-iut.png" alt="Logo IUT" className="w-full h-full object-contain rounded-full" />
            </div>
            <span className="text-xl font-bold text-blue-900">CampusCard</span>
          </Link>
        </div>
        {/* Recherche masquée sur mobile, visible à partir de sm */}
        <div className="relative hidden sm:block ml-4 flex-1">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48 sm:w-64"
          />
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4 relative">
          <div className="relative">
            <Bell className="w-6 h-6 text-gray-600 cursor-pointer" onClick={handleBellClick} />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
            {/* Menu notifications */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-blue-100 z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-100 font-bold text-blue-700 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-500" /> Notifications
                </div>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">Aucune notification</div>
                ) : (
                  <ul className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                    {notifications.map((notif) => (
                      <li key={notif.id} className={`flex items-start gap-3 px-4 py-3 ${notif.read ? 'bg-gray-50' : 'bg-blue-50'}`}>
                        <div className="mt-1">
                          {notif.type === 'success' && <span className="inline-block w-3 h-3 bg-green-500 rounded-full" />}
                          {notif.type === 'error' && <span className="inline-block w-3 h-3 bg-red-500 rounded-full" />}
                          {notif.type === 'warning' && <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full" />}
                          {notif.type === 'info' && <span className="inline-block w-3 h-3 bg-blue-400 rounded-full" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 truncate">{notif.title}</div>
                          <div className="text-sm text-gray-600 truncate">{notif.message}</div>
                          <div className="text-xs text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString('fr-FR')}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-6 h-6 text-gray-600 cursor-pointer" onClick={() => setHelpOpen(true)} title="Aide" />
            {/* Profil : icône seule sur mobile, nom visible à partir de sm */}
            <button
              className="flex items-center space-x-2 cursor-pointer focus:outline-none"
              onClick={() => setProfileMenuOpen((v) => !v)}
              title="Profil utilisateur"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">{user?.firstname}</span>
            </button>
            {/* Déconnexion visible seulement à partir de sm */}
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors hidden sm:block"
              title="Se déconnecter"
            >
              <LogOut className="w-5 h-5" />
            </button>
            {/* Menu profil mobile */}
            {profileMenuOpen && (
              <div className="absolute right-0 top-12 z-50 bg-white rounded-xl shadow-xl border border-gray-200 w-56 p-4 flex flex-col items-center sm:hidden">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="text-center mb-2">
                  <div className="font-semibold text-gray-900">{user?.firstname} {user?.lastname}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full mt-2 bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Modal d'aide contextuelle */}
      {helpOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative">
            <button onClick={() => setHelpOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" title="Fermer">
              <LogOut className="w-5 h-5 rotate-90" />
            </button>
            <h2 className="text-2xl font-bold text-blue-700 mb-2">{help.title}</h2>
            <p className="text-gray-700 mb-4">{help.description}</p>
            <ul className="list-disc pl-6 space-y-2">
              {help.tips.map((tip, i) => (
                <li key={i} className="text-gray-600">{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card, Payment } from '../../types';
import { Bell, Calendar, MapPin, Clock } from 'lucide-react';
import { generateCardPDF } from '../../utils/pdfGenerator';
import StudentCardDisplay from '../../components/StudentCardDisplay';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [card, setCard] = useState<Card | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  type Notification = {
    id: string;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    read: boolean;
    created_at: string;
  };
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        console.log('Aucun utilisateur connecté');
        return;
      }
      try {
        console.log('Utilisateur connecté :', user);
        // Fetch user's card
        const { data: cardDataArr, error: cardError } = await supabase
          .from('cards')
          .select('*')
          .eq('userid', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
        const cardData = Array.isArray(cardDataArr) ? cardDataArr[0] : null;
        if (cardError) {
          console.error('Erreur requête carte :', cardError);
        }
        console.log('Réponse carte (cardData) :', cardData);
        // Fetch user's payments
        const { data: paymentData, error: paymentError } = await supabase
          .from('payments')
          .select('*')
          .eq('userid', user.id)
          .order('created_at', { ascending: false });
        if (paymentError) {
          console.error('Erreur requête paiements :', paymentError);
        }
        console.log('Réponse paiements (paymentData) :', paymentData);
        setCard(cardData);
        setPayments(paymentData || []);
        // Fetch user's notifications
        const { data: notifData } = await supabase
          .from('notifications')
          .select('*')
          .eq('userid', user.id)
          .order('created_at', { ascending: false });
        setNotifications(notifData || []);
        if (paymentData && paymentData.length > 0) {
          console.log('Statut du paiement le plus récent :', paymentData[0].status);
        }
      } catch (err) {
        console.error('Erreur fetchUserData :', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user]);

  const latestPayment = payments[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenue, {user?.firstname } {user?.lastname} !
        </h1>
        <p className="text-gray-600">
          Générez et gérez votre carte d'étudiant facilement
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Payment Status */}
        <div className="bg-gray-800 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Statut de paiement</h3>
              <p className={`text-2xl font-bold ${
                latestPayment?.status === 'approved' 
                  ? 'text-green-400' 
                  : latestPayment?.status === 'pending' 
                  ? 'text-yellow-400' 
                  : 'text-red-400'
              }`}>
                {latestPayment?.status === 'approved' ? 'Validé' : 
                 latestPayment?.status === 'pending' ? 'En attente' : 'Aucun paiement'}
              </p>
            </div>
            <div className="text-3xl">
              {latestPayment?.status === 'approved' ? '✅' : '⏳'}
            </div>
          </div>
          {latestPayment && (
            <p className="text-sm text-gray-300">
              Dernier paiement: {new Date(latestPayment.created_at).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>

        {/* Card Status */}
        <div className="bg-gray-800 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Statut de la carte</h3>
              <p className={`text-2xl font-bold ${
                card?.status === 'approved' 
                  ? 'text-blue-400' 
                  : card?.status === 'pending' 
                  ? 'text-yellow-400' 
                  : 'text-gray-400'
              }`}>
                {card?.status === 'approved' ? 'Prête' : 
                 card?.status === 'pending' ? 'En cours' : 'Non créée'}
              </p>
            </div>
            <div className="text-3xl">
              {card?.status === 'approved' ? '🎫' : '⏳'}
            </div>
          </div>
          {card && (
            <p className="text-sm text-gray-300">
              Expiration: {new Date(card.expirydate).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>

        {/* Notifications en temps réel */}
        <div className="bg-gray-800 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Notifications</h3>
              <p className="text-2xl font-bold text-blue-400">
                {notifications?.filter((n) => !n.read).length} non lue{notifications?.filter((n) => !n.read).length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-3xl">
              <Bell className="w-8 h-8" />
            </div>
          </div>
          <p className="text-sm text-gray-300">
            Consultez le détail de vos notifications dans l'onglet "Notifications" de la page Historique.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Card */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Votre carte d'étudiant</h2>
            <div className="flex space-x-2">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                onClick={() => window.location.href = '/settings'}
                title="Accéder aux paramètres de votre compte"
              >
                Paramètres
              </button>
              <button
                className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                onClick={() => window.location.href = '/history'}
                title="Voir l'historique de vos cartes"
              >
                Historique
              </button>
              <button
                className="bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-800 transition-colors"
                onClick={() => window.location.href = '/student/card-view?mode=pdf'}
                title="Afficher la carte exactement comme dans le PDF"
              >
                Aperçu PDF
              </button>
            </div>
          </div>

          {card ? (
            <div>
              <StudentCardDisplay
                studentid={card.studentid}
                firstname={card.firstname}
                lastname={card.lastname}
                dateofbirth={user?.dateofbirth || ''}
                placeofbirth={user?.placeofbirth || ''}
                program={card.program}
                department={card.department}
                avatar={card.avatar}
                showQr={true}
              />
              <button
                onClick={() => generateCardPDF(card)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors mt-4"
              >
                Télécharger en PDF
              </button>
              <button
                onClick={() => window.location.href = '/student/card-view'}
                className="w-full mt-3 bg-gray-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Voir la carte en détail (recto/verso)
              </button>
            </div>
          ) : (
            <div className="bg-gray-700 rounded-xl p-6 text-white text-center">
              Aucune carte disponible
            </div>
          )}
        </div>

        {/* Card Parameters */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Paramètres de la carte</h2>
          
          <div className="space-y-6">
            {/* Profile Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Photo d'identité
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <div>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">
                    Modifier la photo
                  </button>
                  <p className="text-xs text-gray-400">JPG ou PNG, max 2MB</p>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  value={user?.firstname || ''}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  value={user?.lastname || ''}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Programme d'études
              </label>
              <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Master en Informatique</option>
                <option>Licence en Génie Civil</option>
                <option>DUT Électronique</option>
              </select>
            </div>

            {/* Notifications */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-300">Notifications</h3>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Notifications par email</span>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Notifications par SMS</span>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
                </button>
              </div>
            </div>

            {/* Security */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-300">Sécurité</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-400">Authentification à deux facteurs</span>
                  <p className="text-xs text-gray-500">Protégez votre compte avec une sécurité supplémentaire</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Information */}
      <div className="bg-gray-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Informations de livraison</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Date de disponibilité estimée</h3>
              <p className="text-gray-400">12 juin 2025</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Lieu de retrait</h3>
              <p className="text-gray-400">Bureau des cartes étudiantes</p>
              <p className="text-gray-400">Bâtiment administratif, 1er étage</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Horaires de retrait</h3>
              <p className="text-gray-400">Lundi au vendredi: 9h - 16h</p>
              <p className="text-gray-400">Samedi: 9h - 12h</p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
          <div className="flex items-center space-x-2 text-yellow-400">
            <div className="w-5 h-5">⚠️</div>
            <p className="text-sm">
              N'oubliez pas d'apporter une pièce d'identité valide lors du retrait de votre carte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
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
  
  // États pour les paramètres de la carte
  const [formData, setFormData] = useState({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    program: user?.program || '',
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: true,
  });
  
  const [security, setSecurity] = useState({
    twoFactor: true,
  });
  
  const [saving, setSaving] = useState(false);

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

  // Charger les paramètres sauvegardés au démarrage
  useEffect(() => {
    const savedNotificationSettings = localStorage.getItem('notificationSettings');
    const savedSecuritySettings = localStorage.getItem('securitySettings');
    
    if (savedNotificationSettings) {
      setNotificationSettings(JSON.parse(savedNotificationSettings));
    }
    
    if (savedSecuritySettings) {
      setSecurity(JSON.parse(savedSecuritySettings));
    }
  }, []);

  // Fonctions pour gérer les paramètres
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    if (file.size > 2 * 1024 * 1024) {
      alert("Fichier trop volumineux (max 2MB)");
      return;
    }
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('avatar')
        .upload(fileName, file);
        
      if (error) {
        alert("Erreur lors de l'upload de la photo");
        return;
      }
      
      const { data: publicUrlData } = supabase.storage
        .from('avatar')
        .getPublicUrl(fileName);
        
      // Mettre à jour l'avatar de l'utilisateur
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar: publicUrlData?.publicUrl })
        .eq('id', user.id);
        
      if (updateError) {
        alert("Erreur lors de la mise à jour de la photo");
        return;
      }
      
      // Recharger les données utilisateur
      window.location.reload();
    } catch (error) {
      console.error('Erreur upload photo:', error);
      alert("Erreur lors de l'upload de la photo");
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      // Mettre à jour les informations utilisateur
      const { error } = await supabase
        .from('users')
        .update({
          firstname: formData.firstname,
          lastname: formData.lastname,
          program: formData.program,
        })
        .eq('id', user.id);
        
      if (error) {
        throw error;
      }
      
      // Sauvegarder les paramètres de notifications et sécurité
      // (Ces paramètres pourraient être stockés dans une table séparée)
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
      localStorage.setItem('securitySettings', JSON.stringify(security));
      
      alert('Paramètres sauvegardés avec succès');
    } catch (error) {
      console.error('Erreur sauvegarde paramètres:', error);
      alert('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setSaving(false);
    }
  };

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full max-w-full">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Card */}
        <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 w-full max-w-full overflow-x-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Votre carte d'étudiant</h2>
            <div className="flex space-x-2">
              {/*
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
              */}
              {/* 
              <button
                className="bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-800 transition-colors"
                onClick={() => window.location.href = '/student/card-view?mode=pdf'}
                title="Afficher la carte exactement comme dans le PDF"
              >
                Aperçu PDF
              </button>
              */}
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
              {/*
              <button
                onClick={() => window.location.href = '/student/card-view'}
                className="w-full mt-3 bg-gray-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Voir la carte en détail (recto/verso)
              </button>
              */}
            </div>
          ) : (
            <div className="bg-gray-700 rounded-xl p-6 text-white text-center">
              Aucune carte disponible
            </div>
          )}
        </div>

        {/* Card Parameters */}
        <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 w-full max-w-full overflow-x-auto">
          <h2 className="text-xl font-bold text-white mb-6">Paramètres de la carte</h2>
          
          <div className="space-y-6">
            {/* Profile Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Photo d'identité
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Photo de profil" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">👤</span>
                  )}
                </div>
                <div>
                  <label className="text-blue-400 hover:text-blue-300 text-sm cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    Modifier la photo
                  </label>
                  <p className="text-xs text-gray-400">JPG ou PNG, max 2MB</p>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  value={formData.firstname}
                  onChange={(e) => setFormData({...formData, firstname: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Prénom"
                  title="Prénom"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  value={formData.lastname}
                  onChange={(e) => setFormData({...formData, lastname: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nom"
                  title="Nom"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Programme d'études
              </label>
              <select 
                value={formData.program}
                onChange={(e) => setFormData({...formData, program: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                title="Programme d'études"
              >
                <option value="">Sélectionner un programme</option>
                <option value="Master en Informatique">Master en Informatique</option>
                <option value="Licence en Génie Civil">Licence en Génie Civil</option>
                <option value="DUT Électronique">DUT Électronique</option>
                <option value="Licence en Génie Électrique">Licence en Génie Électrique</option>
                <option value="Master en Génie Civil">Master en Génie Civil</option>
                <option value="DUT Informatique">DUT Informatique</option>
              </select>
            </div>

            {/* Notifications */}
            {/* 
              Notifications
              Cette section permet à l'utilisateur d'activer ou désactiver les notifications par email et SMS.
              Les boutons sont des interrupteurs (switch) qui modifient l'état local notificationSettings.
            */}
            {/* <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-300">Notifications</h3>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Notifications par email</span>
                <button 
                  onClick={() => setNotificationSettings({...notificationSettings, email: !notificationSettings.email})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings.email ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.email ? 'translate-x-6' : 'translate-x-1'
                  }`}></span>
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Notifications par SMS</span>
                <button 
                  onClick={() => setNotificationSettings({...notificationSettings, sms: !notificationSettings.sms})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings.sms ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.sms ? 'translate-x-6' : 'translate-x-1'
                  }`}></span>
                </button>
              </div>
            </div> */}

            {/* Security */}
            {/* 
              Sécurité
              Cette section permet à l'utilisateur d'activer ou désactiver l'authentification à deux facteurs.
              Le bouton est un interrupteur (switch) qui modifie l'état local security.
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-300">Sécurité</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-400">Authentification à deux facteurs</span>
                  <p className="text-xs text-gray-500">Protégez votre compte avec une sécurité supplémentaire</p>
                </div>
                <button 
                  // Active/désactive la 2FA dans l'état local security
                  onClick={() => setSecurity({...security, twoFactor: !security.twoFactor})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    security.twoFactor ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    security.twoFactor ? 'translate-x-6' : 'translate-x-1'
                  }`}></span>
                </button>
              </div>
            </div>
                    */}

            {/* Save Button */}
            <div className="pt-4">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Information */}
      <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 w-full max-w-full overflow-x-auto">
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
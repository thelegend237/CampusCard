import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Upload, Eye, CreditCard } from 'lucide-react';
import PaymentForm from './PaymentForm';

const CardGeneration: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    studentid: user?.studentid || '',
    department: user?.department || '',
    program: user?.program || '',
    avatar: '',
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [showPaymentButton, setShowPaymentButton] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('payments')
        .select('status')
        .eq('userid', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (!error && data) {
        setPaymentStatus(data.status);
      }
    };
    fetchPaymentStatus();
  }, [user]);

  // Ajout de la fonction d'upload de photo
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Fichier trop volumineux (max 5 Mo)");
      return;
    }
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}_${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage
      .from('avatar') // Remplace 'avatars' par le nom de ton bucket si besoin
      .upload(fileName, file);
    if (error) {
      alert("Erreur lors de l'upload de la photo");
      return;
    }
    const { data: publicUrlData } = supabase.storage
      .from('avatar')
      .getPublicUrl(fileName);
    console.log('Avatar URL:', publicUrlData?.publicUrl);
    setFormData(prev => ({
      ...prev,
      avatar: publicUrlData?.publicUrl || ''
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleValidateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('cards')
        .insert([
          {
            userid: user?.id,
            studentid: formData.studentid,
            firstname: formData.firstname,
            lastname: formData.lastname,
            department: formData.department,
            program: formData.program,
            avatar: formData.avatar,
            issueddate: new Date().toISOString(),
            expirydate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
            updated_at: new Date().toISOString(),
          },
        ]);
      if (error) throw error;
      setShowPaymentButton(true);
    } catch (error) {
      console.error('Error creating card:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      // Create payment record
      const { error } = await supabase
        .from('payments')
        .insert([
          {
            userid: user?.id,
            amount: 5000,
            description: 'Frais de carte étudiant',
            status: 'pending',
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;
      
      // Redirect to payment page
      window.location.href = '/payment-status';
    } catch (error) {
      console.error('Error creating payment:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Génération de Carte Étudiant</h1>
            <p className="text-blue-100">Personnalisez et validez votre carte d'étudiant</p>
          </div>
          {paymentStatus === 'approved' ? (
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
            ✓ Paiement validé
          </div>
          ) : paymentStatus === 'pending' ? (
            <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
              ⏳ Paiement en attente
            </div>
          ) : paymentStatus === 'rejected' ? (
            <div className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
              ✗ Paiement refusé
            </div>
          ) : (
            <div className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Statut du paiement inconnu
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Informations personnelles</h2>
          
          <form onSubmit={handleValidateInfo} className="space-y-6">
            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Photo d'identité
              </label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                <div className="w-24 h-24 bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center overflow-hidden">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Avatar" className="w-24 h-24 object-cover" />
                  ) : (
                  <span className="text-4xl">👤</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="avatar-upload"
                />
                <label
                  htmlFor="avatar-upload"
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium cursor-pointer"
                >
                  Cliquez ou glissez pour changer
                </label>
                <p className="text-xs text-gray-400 mt-2">Format JPG, PNG • Max 5 MB</p>
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
                  name="firstName"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="test2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Numéro étudiant
              </label>
              <input
                type="text"
                name="studentId"
                value={formData.studentid}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2101206"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Département
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionnez un département</option>
                <option value="Informatique & Réseaux">Informatique & Réseaux</option>
                <option value="Génie Civil">Génie Civil</option>
                <option value="Électronique">Électronique</option>
                <option value="Maintenance Industrielle">Maintenance Industrielle</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Programme d'études
              </label>
              <select
                name="program"
                value={formData.program}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionnez un programme</option>
                <option value="Master en Informatique">Master en Informatique</option>
                <option value="Licence en Génie Civil">Licence en Génie Civil</option>
                <option value="DUT Électronique">DUT Électronique</option>
                <option value="BTS Maintenance">BTS Maintenance</option>
              </select>
            </div>

            {!showPaymentButton && !showPaymentForm && (
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : 'Valider mes informations'}
              </button>
            )}
          </form>
          {showPaymentButton && !showPaymentForm && (
            <button
              type="button"
              onClick={() => setShowPaymentForm(true)}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors mt-4"
            >
              Procéder au paiement
            </button>
          )}
          {showPaymentForm && (
            <PaymentForm amount={5000} />
          )}
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          {/* Card Preview */}
          <div className="bg-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Aperçu de votre carte</h2>
              <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                🔄 Retourner la carte
              </button>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">IUT</span>
                  </div>
                  <span className="font-bold">CampusCard</span>
                </div>
                <span className="text-sm">2025-2026</span>
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Avatar" className="w-20 h-20 object-cover rounded-lg" />
                  ) : (
                  <span className="text-4xl">👤</span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{formData.firstname} {formData.lastname}</h3>
                  <p className="text-sm opacity-90">{formData.program}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="opacity-75">ID: {formData.studentid}</p>
                  <p className="opacity-75">Date d'émission: {new Date().toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="opacity-75">Date d'expiration: {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <div className="w-12 h-12 bg-white/20 rounded flex items-center justify-center">
                  <div className="w-8 h-8 bg-white/30 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Process Status */}
          <div className="bg-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">État du processus</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <p className="font-medium text-white">Paiement validé</p>
                  <p className="text-sm text-gray-400">09/06/2025 à 10:23</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">2</span>
                </div>
                <div>
                  <p className="font-medium text-white">En cours</p>
                  <p className="text-sm text-gray-400">Génération de la carte</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-400">En attente de validation</p>
                  <p className="text-sm text-gray-500">Prochaine étape</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">4</span>
                </div>
                <div>
                  <p className="font-medium text-gray-400">Prévue le 12/06/2025</p>
                  <p className="text-sm text-gray-500">Finalisation</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Informations de livraison</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white">📅</span>
                </div>
                <div>
                  <p className="font-medium text-white">Date de disponibilité estimée</p>
                  <p className="text-sm text-gray-400">12 juin 2025</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white">📍</span>
                </div>
                <div>
                  <p className="font-medium text-white">Lieu de retrait</p>
                  <p className="text-sm text-gray-400">Bureau des cartes étudiantes</p>
                  <p className="text-sm text-gray-400">Bâtiment administratif, 1er étage</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white">🕒</span>
                </div>
                <div>
                  <p className="font-medium text-white">Horaires de retrait</p>
                  <p className="text-sm text-gray-400">Lundi au vendredi: 9h - 16h</p>
                  <p className="text-sm text-gray-400">Samedi: 9h - 12h</p>
                </div>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Aide et support</h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                <div className="flex items-center space-x-2 text-yellow-400">
                  <span className="text-sm">⚠️</span>
                  <p className="text-sm">
                    N'oubliez pas d'apporter une pièce d'identité valide lors du retrait de votre carte.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span>📞</span>
                  <span>Support: +237 123 456 789</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span>✉️</span>
                  <span>Email: support@iut-douala.edu</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardGeneration;
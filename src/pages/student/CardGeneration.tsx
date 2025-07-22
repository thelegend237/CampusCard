import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
// import { Upload, Eye, CreditCard } from 'lucide-react';
import PaymentForm from './PaymentForm';
import StudentCardDisplay from '../../components/StudentCardDisplay';

const CardGeneration: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    studentid: user?.studentid || '',
    department: user?.department || '',
    program: user?.program || '',
    avatar: '',
    dateofbirth: '',
    placeofbirth: '',
    versoMessage: '',
    emergencyContact: '',
  });
  
  // const [currentStep, setCurrentStep] = useState(1);
  // const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [showPaymentButton, setShowPaymentButton] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isBackPreview, setIsBackPreview] = useState(false);

  // Ajout : États pour vérifier une carte existante
  const [existingCardStatus, setExistingCardStatus] = useState<string | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  // Ajout : Vérification d'une carte existante au chargement
  useEffect(() => {
    const checkExistingCard = async () => {
      if (!user) return;
      setIsLoadingStatus(true);
      const { data } = await supabase
        .from('cards')
        .select('status')
        .eq('userid', user.id)
        .in('status', ['pending', 'approved']) // On cherche une carte active
        .limit(1)
        .single();

      if (data) {
        setExistingCardStatus(data.status);
      }
      setIsLoadingStatus(false);
    };

    checkExistingCard();
  }, [user]);

  // Dynamique : récupération du paiement et de la carte
  // Typage explicite pour éviter never
  interface CardType {
    status?: string;
    created_at?: string;
    issueddate?: string;
  }
  interface PaymentType {
    status?: string;
    updated_at?: string;
  }
  const [card, setCard] = useState<CardType | null>(null);
  const [payment, setPayment] = useState<PaymentType | null>(null);
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      // Paiement
      const { data: paymentData } = await supabase
        .from('payments')
        .select('*')
        .eq('userid', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      setPayment(paymentData);
      // Carte
      const { data: cardData } = await supabase
        .from('cards')
        .select('*')
        .eq('userid', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      setCard(cardData);
    };
    fetchData();
  }, [user]);

  // Construction dynamique des étapes
  const steps = [
    {
      label: 'Paiement',
      status: payment?.status === 'success' || payment?.status === 'approved' ? 'done' : payment?.status === 'pending' ? 'in_progress' : 'pending',
      date: payment?.updated_at,
      description: payment?.status === 'success' || payment?.status === 'approved' ? 'Paiement validé' : 'En attente de paiement',
    },
    {
      label: 'Génération de la carte',
      status: card?.status === 'pending' && (payment?.status === 'success' || payment?.status === 'approved') ? 'in_progress' : card?.status === 'approved' ? 'done' : 'pending',
      date: card?.created_at,
      description: card?.status === 'pending' ? 'En cours' : '',
    },
    {
      label: 'Validation',
      status: card?.status === 'approved' ? 'done' : 'pending',
      date: card?.issueddate,
      description: card?.status === 'approved' ? 'Carte validée' : 'En attente de validation',
    },
    {
      label: 'Finalisation',
      status: card?.status === 'approved' ? 'done' : 'pending',
      date: card?.issueddate,
      description: card?.status === 'approved' ? 'Carte disponible' : 'En attente',
    },
  ];

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
            dateofbirth: formData.dateofbirth,
            placeofbirth: formData.placeofbirth,
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

  // Fonction handlePayment supprimée car inutilisée

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="bg-gray-800 rounded-2xl p-4 sm:p-6">
          {isLoadingStatus ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            </div>
          ) : existingCardStatus ? (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">
                Vous avez déjà une demande de carte en cours
              </h2>
              <p className="text-gray-300">
                Le statut actuel de votre demande est :{' '}
                <span className="font-semibold text-yellow-400">{existingCardStatus}</span>.
              </p>
              <p className="text-gray-400 mt-4">
                Veuillez suivre son avancement dans la section "État du processus" ci-contre.
                Vous pourrez soumettre une nouvelle demande si celle-ci est rejetée ou après sa date d'expiration.
              </p>
            </div>
          ) : (
            <>
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
                      title="Uploader une photo d'identité"
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

                {!isBackPreview ? (
                  <>
                    {/* Formulaire recto (infos classiques) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                          name="firstname"
                      value={formData.firstname}
                      onChange={handleInputChange}
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
                          name="lastname"
                      value={formData.lastname}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Nom"
                      title="Nom"
                        />
                      </div>
                    </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Date de naissance
                        </label>
                        <input
                          type="date"
                          name="dateofbirth"
                          value={formData.dateofbirth}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="JJ/MM/AAAA"
                      title="Date de naissance"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Lieu de naissance
                        </label>
                        <input
                          type="text"
                          name="placeofbirth"
                          value={formData.placeofbirth}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ville, pays..."
                      title="Lieu de naissance"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Numéro étudiant
              </label>
              <input
                type="text"
                    name="studentid"
                value={formData.studentid}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2101206"
                    title="Numéro étudiant"
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
                    title="Département"
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
                    title="Programme d'études"
              >
                <option value="">Sélectionnez un programme</option>
                <option value="Master en Informatique">Master en Informatique</option>
                <option value="Licence en Génie Civil">Licence en Génie Civil</option>
                <option value="DUT Électronique">DUT Électronique</option>
                <option value="BTS Maintenance">BTS Maintenance</option>
              </select>
            </div>
              </>
            ) : (
              <>
                {/* Formulaire verso (personnalisation) */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message personnalisé (ex: instructions en cas de perte)
                  </label>
                  <textarea
                    name="versoMessage"
                    value={formData.versoMessage}
                    onChange={e => setFormData(prev => ({ ...prev, versoMessage: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Si vous trouvez cette carte, merci de contacter le propriétaire ou l'administration de l'IUT de Douala."
                    title="Message personnalisé"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contact d'urgence (optionnel)
                  </label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Téléphone ou email"
                    title="Contact d'urgence"
                  />
                </div>
              </>
            )}
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
            </>
          )}
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          {/* Card Preview */}
          <div className="bg-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Aperçu de votre carte</h2>
              <button
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                onClick={() => setIsBackPreview((prev) => !prev)}
                type="button"
              >
                🔄 {isBackPreview ? 'Voir le recto' : 'Retourner la carte'}
              </button>
            </div>

            <div className="rounded-xl p-6 text-white relative center" style={{ minHeight: 260 }}>
              {!isBackPreview ? (
                <StudentCardDisplay
                  studentid={formData.studentid}
                  firstname={formData.firstname}
                  lastname={formData.lastname}
                  dateofbirth={formData.dateofbirth}
                  placeofbirth={formData.placeofbirth}
                  program={formData.program}
                  department={formData.department}
                  avatar={formData.avatar}
                  showQr={true}
                />
              ) : (
                <div className="w-full h-full flex flex-col justify-between" style={{ minHeight: 260 }}>
                  <div>
                    <h3 className="text-lg font-bold mb-2">En cas de perte</h3>
                    <p className="text-sm">Nom : {formData.lastname}</p>
                    <p className="text-sm">Prénom : {formData.firstname}</p>
                    <p className="text-sm">ID étudiant : {formData.studentid}</p>
                    {formData.department && <p className="text-sm">Département : {formData.department}</p>}
                    {formData.program && <p className="text-sm">Filière : {formData.program}</p>}
                    {formData.emergencyContact && (
                      <p className="text-sm font-semibold mt-2">Contact d'urgence : {formData.emergencyContact}</p>
                    )}
                  </div>
                  <div className="text-xs text-gray-200 mt-4">
                    <p>{formData.versoMessage || "Si vous trouvez cette carte, merci de contacter le propriétaire ou l'administration de l'IUT de Douala."}</p>
                    <p className="mt-2">CampusCard - IUT de Douala</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Process Status dynamique */}
          <div className="bg-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">État du processus</h3>
            <div className="space-y-4">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.status === 'done' ? 'bg-green-500' :
                    step.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-600'
                  }`}>
                    <span className="text-white text-sm">
                      {step.status === 'done' ? '✓' : idx + 1}
                    </span>
                  </div>
                  <div>
                    <p className={`font-medium ${step.status === 'done' || step.status === 'in_progress' ? 'text-white' : 'text-gray-400'}`}>
                      {step.description}
                    </p>
                    {step.date && (
                      <p className="text-sm text-gray-400">{new Date(step.date).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              ))}
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
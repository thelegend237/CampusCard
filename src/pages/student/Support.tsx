import React, { useState } from 'react';
import { Send, Phone, Mail, MapPin, Clock, HelpCircle, MessageCircle, Book, AlertTriangle, CheckCircle, XCircle, Star, Eye, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { SupportMessage } from '../../types';

const Support: React.FC = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ 
    fullname: '', 
    email: '', 
    subject: '',
    category: 'general', 
    priority: 'medium',
    message: '' 
  });
  const [sending, setSending] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [success, setSuccess] = useState(false);
  const [userRequests, setUserRequests] = useState<SupportMessage[]>([]);
  const [evaluationModal, setEvaluationModal] = useState<{ open: boolean; request: SupportMessage | null }>({ open: false, request: null });
  const [rating, setRating] = useState(0);
  const [evaluationComment, setEvaluationComment] = useState('');
  const [evaluating, setEvaluating] = useState(false);

  // Charger les requêtes de l'utilisateur
  React.useEffect(() => {
    if (user) {
      fetchUserRequests();
    }
  }, [user]);

  const fetchUserRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('userid', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des requêtes:', error);
        return;
      }

      setUserRequests(data || []);
    } catch (err) {
      console.error('Erreur inattendue:', err);
    }
  };

  const submitEvaluation = async () => {
    if (!evaluationModal.request || rating === 0) return;

    setEvaluating(true);
    try {
      const { error } = await supabase
        .from('support_messages')
        .update({ 
          satisfaction_rating: rating,
          internal_notes: (evaluationModal.request.internal_notes || '') + 
            `\n\n[ÉVALUATION UTILISATEUR] Note: ${rating}/5 - Commentaire: ${evaluationComment || 'Aucun commentaire'}`
        })
        .eq('id', evaluationModal.request.id);

      if (error) {
        console.error('Erreur lors de l\'évaluation:', error);
        return;
      }

      console.log('✅ Évaluation soumise');
      setEvaluationModal({ open: false, request: null });
      setRating(0);
      setEvaluationComment('');
      fetchUserRequests();
    } catch (err) {
      console.error('Erreur inattendue:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const faqItems = [
    {
      category: 'general',
      question: 'Comment créer ma carte d\'étudiant ?',
      answer: 'Pour créer votre carte d\'étudiant, connectez-vous à votre compte et cliquez sur "Génération de carte" dans le menu. Remplissez vos informations personnelles et suivez les étapes.'
    },
    {
      category: 'payment',
      question: 'Combien coûte la carte d\'étudiant ?',
      answer: 'La carte d\'étudiant coûte 5 000 FCFA, incluant les frais de traitement et d\'impression.'
    },
    {
      category: 'delivery',
      question: 'Où puis-je récupérer ma carte ?',
      answer: 'Vous pouvez récupérer votre carte au Bureau des cartes étudiantes, situé au 1er étage du bâtiment administratif.'
    },
    {
      category: 'general',
      question: 'Combien de temps faut-il pour recevoir ma carte ?',
      answer: 'Le délai de traitement est généralement de 5 à 7 jours ouvrables après validation du paiement.'
    },
    {
      category: 'payment',
      question: 'Quelles sont les méthodes de paiement acceptées ?',
      answer: 'Nous acceptons les paiements par mobile money, virements bancaires et cartes de crédit.'
    },
    {
      category: 'technical',
      question: 'Je ne peux pas me connecter à mon compte',
      answer: 'Vérifiez que vous utilisez le bon matricule et mot de passe. Si le problème persiste, contactez le support technique.'
    },
    {
      category: 'card',
      question: 'Ma carte a été perdue, que faire ?',
      answer: 'Signalez immédiatement la perte au bureau des cartes. Une nouvelle carte pourra être émise moyennant des frais de remplacement.'
    },
    {
      category: 'account',
      question: 'Comment modifier mes informations personnelles ?',
      answer: 'Accédez à vos paramètres de compte pour modifier vos informations. Certaines modifications peuvent nécessiter une validation administrative.'
    }
  ];

  const filteredFAQ = faqItems.filter(item => item.category === selectedCategory);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'critical': return 'Critique';
      case 'high': return 'Élevée';
      case 'medium': return 'Moyenne';
      case 'low': return 'Faible';
      default: return priority;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'technical': return 'Technique';
      case 'payment': return 'Paiement';
      case 'card': return 'Carte';
      case 'account': return 'Compte';
      case 'general': return 'Général';
      case 'urgent': return 'Urgent';
      case 'bug': return 'Bug';
      case 'feature': return 'Fonctionnalité';
      default: return category;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    try {
      const { error } = await supabase.from('support_messages').insert([{
        userid: user?.id,
        fullname: form.fullname,
        email: form.email,
        subject: form.subject,
        category: form.category,
        priority: form.priority,
        message: form.message,
        // status a une valeur par défaut 'pending' dans la base de données
        // created_at est généré automatiquement par la base de données
        // updated_at est généré automatiquement par la base de données
      }]);

      if (error) {
        console.error('Erreur lors de l\'envoi:', error);
        alert('Erreur lors de l\'envoi du message. Veuillez réessayer.');
      } else {
        setSuccess(true);
        setForm({ 
          fullname: '', 
          email: '', 
          subject: '',
          category: 'general', 
          priority: 'medium',
          message: '' 
        });
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      console.error('Erreur inattendue:', err);
      alert('Erreur inattendue lors de l\'envoi du message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Support et aide</h1>
        <p className="text-blue-100">Nous sommes là pour vous aider avec vos questions et problèmes</p>
      </div>

      {/* Message de succès */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5" />
          <span>Votre requête a été envoyée avec succès ! Un administrateur vous répondra bientôt.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contactez-nous</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Téléphone</p>
                  <p className="text-sm text-gray-600">+237 233 40 03 80</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">support@iut-douala.edu</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Adresse</p>
                  <p className="text-sm text-gray-600">IUT de Douala, Cameroun</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Horaires</p>
                  <p className="text-sm text-gray-600">Lun-Ven: 8h-17h</p>
                  <p className="text-sm text-gray-600">Sam: 8h-12h</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Liens rapides</h3>
            
            <div className="space-y-3">
              <a href="#" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors">
                <Book className="w-5 h-5" />
                <span>Guide utilisateur</span>
              </a>
              <a href="#" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors">
                <HelpCircle className="w-5 h-5" />
                <span>FAQ complète</span>
              </a>
              <a href="#" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span>Chat en direct</span>
              </a>
            </div>
          </div>

          {/* Guide des priorités */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Guide des priorités</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor('critical')}`}>
                  Critique
                </span>
                <span className="text-sm text-gray-600">Problème bloquant urgent</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor('high')}`}>
                  Élevée
                </span>
                <span className="text-sm text-gray-600">Problème important</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor('medium')}`}>
                  Moyenne
                </span>
                <span className="text-sm text-gray-600">Question normale</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor('low')}`}>
                  Faible
                </span>
                <span className="text-sm text-gray-600">Demande mineure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Envoyez-nous une requête</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    name="fullname"
                    value={form.fullname}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Votre nom complet"
                    title="Nom complet"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="votre@email.com"
                    title="Email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sujet de la requête *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Résumé de votre problème ou question"
                  title="Sujet de la requête"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie *
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Catégorie"
                  >
                    <option value="general">Question générale</option>
                    <option value="technical">Problème technique</option>
                    <option value="payment">Problème de paiement</option>
                    <option value="card">Problème de carte</option>
                    <option value="account">Problème de compte</option>
                    <option value="bug">Signalement de bug</option>
                    <option value="feature">Demande de fonctionnalité</option>
                    <option value="urgent">Requête urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité *
                  </label>
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Priorité"
                  >
                    <option value="low">Faible</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Élevée</option>
                    <option value="critical">Critique</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description détaillée *
                </label>
                <textarea
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Décrivez votre problème ou question en détail. Plus vous donnez d'informations, plus nous pourrons vous aider rapidement..."
                  title="Description détaillée"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Incluez des détails comme les étapes pour reproduire le problème, les messages d'erreur, etc.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">Conseils pour une réponse rapide :</p>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Décrivez clairement votre problème</li>
                      <li>• Incluez les étapes pour reproduire le problème</li>
                      <li>• Mentionnez les messages d'erreur si applicable</li>
                      <li>• Précisez votre navigateur et système d'exploitation</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                disabled={sending}
              >
                <Send className="w-5 h-5" />
                <span>{sending ? 'Envoi en cours...' : 'Envoyer la requête'}</span>
              </button>
            </form>
          </div>


        </div>
      </div>

      {/* Mes requêtes */}
      {userRequests.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Mes requêtes de support</h2>
          
          <div className="space-y-4">
            {userRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {request.subject || 'Sujet inconnu'}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(request.priority || 'medium')}`}>
                        {getPriorityText(request.priority || 'medium')}
                      </span>
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {getCategoryText(request.category || 'general')}
                      </span>
                      <span className="text-gray-500">
                        {request.created_at ? new Date(request.created_at).toLocaleDateString('fr-FR') : 'Date inconnue'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      request.status === 'answered' ? 'bg-green-100 text-green-800' :
                      request.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status === 'pending' ? 'En attente' :
                       request.status === 'in_progress' ? 'En cours' :
                       request.status === 'answered' ? 'Répondu' :
                       request.status === 'resolved' ? 'Résolu' :
                       request.status === 'closed' ? 'Fermé' : request.status}
                    </span>
                    
                    {request.status === 'resolved' && !request.satisfaction_rating && (
                      <button
                        onClick={() => setEvaluationModal({ open: true, request })}
                        className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 flex items-center space-x-1"
                        title="Évaluer cette requête"
                      >
                        <Star className="w-4 h-4" />
                        <span>Évaluer</span>
                      </button>
                    )}
                    
                    {request.satisfaction_rating && (
                      <div className="flex items-center space-x-1 text-sm text-green-600">
                        <Star className="w-4 h-4 fill-current" />
                        <span>{request.satisfaction_rating}/5</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-700 text-sm mb-3 line-clamp-2">{request.message}</p>
                
                {request.response && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <h4 className="font-medium text-gray-900 mb-1 text-sm">Réponse :</h4>
                    <p className="text-gray-700 text-sm">{request.response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Questions fréquentes</h2>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'general', label: 'Général' },
            { id: 'payment', label: 'Paiement' },
            { id: 'delivery', label: 'Livraison' },
            { id: 'technical', label: 'Technique' },
            { id: 'card', label: 'Carte' },
            { id: 'account', label: 'Compte' }
          ].map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredFAQ.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <h3 className="font-medium text-gray-900 mb-2">{item.question}</h3>
              <p className="text-sm text-gray-600">{item.answer}</p>
            </div>
          ))}
          
          {filteredFAQ.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune question fréquente pour cette catégorie.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'évaluation */}
      {evaluationModal.open && evaluationModal.request && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Évaluer votre requête</h2>
              <button 
                onClick={() => setEvaluationModal({ open: false, request: null })}
                className="text-gray-400 hover:text-gray-600"
                title="Fermer le modal d'évaluation"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">{evaluationModal.request.subject || 'Sujet inconnu'}</h3>
              <p className="text-gray-700 text-sm mb-2">{evaluationModal.request.message}</p>
              {evaluationModal.request.response && (
                <div className="bg-white rounded p-3">
                  <h4 className="font-medium text-gray-900 mb-1 text-sm">Réponse reçue :</h4>
                  <p className="text-gray-700 text-sm">{evaluationModal.request.response}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note de satisfaction :</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        star <= rating ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                      }`}
                      title={`${star} étoile${star > 1 ? 's' : ''}`}
                    >
                      <Star className="w-5 h-5" />
                    </button>
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    {rating > 0 ? `${rating}/5` : 'Sélectionnez une note'}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire (optionnel) :</label>
                <textarea
                  value={evaluationComment}
                  onChange={(e) => setEvaluationComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Partagez votre expérience..."
                  title="Commentaire optionnel"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEvaluationModal({ open: false, request: null })}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={submitEvaluation}
                disabled={evaluating || rating === 0}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {evaluating ? 'Envoi...' : 'Soumettre l\'évaluation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
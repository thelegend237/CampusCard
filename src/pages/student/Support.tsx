import React, { useState } from 'react';
import { Send, Phone, Mail, MapPin, Clock, HelpCircle, MessageCircle, Book } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const Support: React.FC = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ fullname: '', email: '', category: 'general', message: '' });
  const [sending, setSending] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('general');

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
    }
  ];

  const filteredFAQ = faqItems.filter(item => item.category === selectedCategory);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const { error } = await supabase.from('support_messages').insert([{
      userid: user?.id,
      fullname: form.fullname,
      email: form.email,
      category: form.category,
      message: form.message,
    }]);
    setSending(false);
    if (!error) {
      alert('Votre message a bien été envoyé. Un administrateur vous répondra bientôt.');
      setForm({ fullname: '', email: '', category: 'general', message: '' });
    } else {
      alert('Erreur lors de l\'envoi du message.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Support et aide</h1>
        <p className="text-blue-100">Nous sommes là pour vous aider avec vos questions</p>
      </div>

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
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
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
                    Email
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
                  Catégorie
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
                  <option value="payment">Problème de paiement</option>
                  <option value="delivery">Livraison/Retrait</option>
                  <option value="technical">Problème technique</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Décrivez votre problème ou question..."
                  title="Message"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                disabled={sending}
              >
                <Send className="w-5 h-5" />
                <span>{sending ? 'Envoi...' : 'Envoyer le message'}</span>
              </button>
            </form>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Questions fréquentes</h2>
            
            <div className="flex space-x-2 mb-6">
              {[
                { id: 'general', label: 'Général' },
                { id: 'payment', label: 'Paiement' },
                { id: 'delivery', label: 'Livraison' }
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
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{item.question}</h3>
                  <p className="text-sm text-gray-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
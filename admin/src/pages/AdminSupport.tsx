import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SupportMessage } from '../types';
import { Search, Filter, MessageSquare, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const AdminSupport: React.FC = () => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  console.log('🚀 AdminSupport - Composant chargé');

  useEffect(() => {
    console.log('📞 AdminSupport - Début du chargement des messages');
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      console.log('🔍 AdminSupport - Récupération des messages de support...');
      
      const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ AdminSupport - Erreur lors de la récupération:', error);
        setError('Erreur lors du chargement des messages');
        return;
      }

      console.log('✅ AdminSupport - Messages récupérés:', data?.length || 0);
    setMessages(data || []);
    } catch (err) {
      console.error('❌ AdminSupport - Erreur inattendue:', err);
      setError('Erreur inattendue');
    } finally {
    setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('support_messages')
        .update({ status, answered_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) {
        console.error('❌ Erreur lors de la mise à jour:', error);
        return;
      }

      console.log('✅ Statut mis à jour pour le message:', messageId);
      fetchMessages(); // Recharger les messages
    } catch (err) {
      console.error('❌ Erreur inattendue lors de la mise à jour:', err);
    }
  };

  const sendReply = async (messageId: string) => {
    if (!replyText.trim()) return;

    setReplying(true);
    try {
    const { error } = await supabase
      .from('support_messages')
        .update({ 
          response: replyText,
          status: 'answered',
          answered_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) {
        console.error('❌ Erreur lors de l\'envoi de la réponse:', error);
        return;
      }

      console.log('✅ Réponse envoyée pour le message:', messageId);
      setReplyText('');
      setSelectedMessage(null);
      fetchMessages(); // Recharger les messages
    } catch (err) {
      console.error('❌ Erreur inattendue lors de l\'envoi de la réponse:', err);
    } finally {
      setReplying(false);
    }
  };

  // Filtrage et recherche
  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || message.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Statistiques
  const stats = {
    total: messages.length,
    pending: messages.filter(m => m.status === 'pending').length,
    answered: messages.filter(m => m.status === 'answered').length,
    closed: messages.filter(m => m.status === 'closed').length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'answered': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed': return <XCircle className="w-4 h-4 text-gray-500" />;
      default: return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'answered': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'answered': return 'Répondu';
      case 'closed': return 'Fermé';
      default: return 'Inconnu';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Gestion des requêtes étudiantes</h1>
          <p className="text-blue-100">Chargement en cours...</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Erreur :</strong> {error}
          <button 
            onClick={fetchMessages}
            className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header avec statistiques */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Gestion des requêtes étudiantes</h1>
            <p className="text-blue-100">
              {stats.total} message{stats.total !== 1 ? 's' : ''} reçu{stats.total !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.pending}</div>
              <div className="text-sm text-blue-100">En attente</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.answered}</div>
              <div className="text-sm text-blue-100">Répondu</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.closed}</div>
              <div className="text-sm text-blue-100">Fermé</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom, email ou message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Filtrer par statut"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="answered">Répondu</option>
              <option value="closed">Fermé</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Filtrer par catégorie"
            >
              <option value="all">Toutes les catégories</option>
              <option value="technical">Technique</option>
              <option value="payment">Paiement</option>
              <option value="general">Général</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages */}
      {filteredMessages.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucun message trouvé avec les critères actuels.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <div key={message.id} className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {message.fullname}
                    </h3>
                    {getStatusIcon(message.status)}
                  </div>
                  <p className="text-sm text-gray-600">{message.email}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(message.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                    {getStatusText(message.status)}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2">
                  {message.category}
                </span>
                <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
              </div>

              {message.response && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Réponse de l'administrateur :
                  </h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{message.response}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Répondu le {new Date(message.answered_at!).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                {message.status === 'pending' && (
                  <>
                    <button
                      onClick={() => setSelectedMessage(message)}
                      className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                    >
                      Répondre
                    </button>
                    <button
                      onClick={() => updateMessageStatus(message.id, 'answered')}
                      className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                    >
                      Marquer comme répondu
                    </button>
                    <button
                      onClick={() => updateMessageStatus(message.id, 'closed')}
                      className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
                    >
                      Fermer
                    </button>
                  </>
                )}
                {message.status === 'answered' && (
                  <button
                    onClick={() => updateMessageStatus(message.id, 'closed')}
                    className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
                  >
                    Fermer
                  </button>
        )}
      </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de réponse */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">
              Répondre à {selectedMessage.fullname}
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Message original :</p>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-700">{selectedMessage.message}</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre réponse :
              </label>
            <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tapez votre réponse ici..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setSelectedMessage(null);
                  setReplyText('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={() => sendReply(selectedMessage.id)}
                disabled={replying || !replyText.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {replying ? 'Envoi...' : 'Envoyer la réponse'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupport; 
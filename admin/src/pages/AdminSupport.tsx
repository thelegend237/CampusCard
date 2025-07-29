import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SupportMessage } from '../types';
import { 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  User, 
  Calendar,
  Star,
  Tag,
  Edit,
  Eye,
  Reply,
  Archive,
  TrendingUp,
  BarChart3,
  Settings,
  Plus,
  X
} from 'lucide-react';

const AdminSupport: React.FC = () => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  
  // Modal pour répondre
  const [replyModal, setReplyModal] = useState<{ open: boolean; message: SupportMessage | null }>({ open: false, message: null });
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  
  // Modal pour voir les détails
  const [detailModal, setDetailModal] = useState<{ open: boolean; message: SupportMessage | null }>({ open: false, message: null });

  // Modal pour assigner et ajouter des notes
  const [assignModal, setAssignModal] = useState<{ open: boolean; message: SupportMessage | null }>({ open: false, message: null });
  const [assignedTo, setAssignedTo] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  // Modal pour les statistiques détaillées
  const [statsModal, setStatsModal] = useState(false);

  // Liste des admins disponibles (à récupérer depuis la base de données)
  const availableAdmins = [
    { id: 'admin1', name: 'Admin Principal' },
    { id: 'admin2', name: 'Support Technique' },
    { id: 'admin3', name: 'Support Paiement' },
  ];

  // Options de temps estimé
  const timeOptions = [
    { value: '1-2h', label: '1-2 heures' },
    { value: '2-4h', label: '2-4 heures' },
    { value: '1-2j', label: '1-2 jours' },
    { value: '2-3j', label: '2-3 jours' },
    { value: '1s', label: '1 semaine' },
    { value: '2s', label: '2 semaines' },
  ];

  console.log('🚀 Centre de Gestion des Requêtes - Composant chargé');

  useEffect(() => {
    console.log('📞 Centre de Gestion des Requêtes - Début du chargement');
    fetchMessages();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [messages, searchTerm, statusFilter, categoryFilter, priorityFilter, dateFilter]);

  const fetchMessages = async () => {
    try {
      console.log('🔍 Récupération des requêtes...');
      
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors de la récupération:', error);
        setError('Erreur lors du chargement des requêtes');
        return;
      }

      console.log('✅ Requêtes récupérées:', data?.length || 0);
      setMessages(data || []);
    } catch (err) {
      console.error('❌ Erreur inattendue:', err);
      setError('Erreur inattendue');
    } finally {
      setLoading(false);
    }
  };

  const filterMessages = () => {
    let filtered = [...messages];

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(msg => 
        msg.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (msg.subject && msg.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(msg => msg.status === statusFilter);
    }

    // Filtre par catégorie
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(msg => msg.category === categoryFilter);
    }

    // Filtre par priorité
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(msg => msg.priority === priorityFilter);
    }

    // Filtre par date
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(msg => {
        if (!msg.created_at) return false;
        const msgDate = new Date(msg.created_at);
        switch (dateFilter) {
          case 'today':
            return msgDate >= today;
          case 'yesterday':
            return msgDate >= yesterday && msgDate < today;
          case 'week':
            return msgDate >= weekAgo;
          default:
            return true;
        }
      });
    }

    setFilteredMessages(filtered);
  };

  const updateMessageStatus = async (messageId: string, status: string) => {
    try {
      const updateData: any = { status };
      
      if (status === 'answered') {
        updateData.answered_at = new Date().toISOString();
      } else if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
        // Calculer le temps réel de résolution
        const message = messages.find(m => m.id === messageId);
        if (message && message.created_at) {
          const created = new Date(message.created_at);
          const resolved = new Date();
          const diffMs = resolved.getTime() - created.getTime();
          const diffHours = Math.round(diffMs / (1000 * 60 * 60));
          
          if (diffHours < 24) {
            updateData.actual_resolution_time = `${diffHours}h`;
          } else {
            const diffDays = Math.round(diffHours / 24);
            updateData.actual_resolution_time = `${diffDays}j`;
          }
        }
        
        // Envoyer automatiquement une demande d'évaluation
        await sendEvaluationRequest(messageId);
      } else if (status === 'closed') {
        updateData.closed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('support_messages')
        .update(updateData)
        .eq('id', messageId);

      if (error) {
        console.error('❌ Erreur lors de la mise à jour:', error);
        return;
      }

      console.log('✅ Statut mis à jour pour la requête:', messageId);
      if (status === 'resolved') {
        console.log('📧 Demande d\'évaluation envoyée automatiquement');
      }
      fetchMessages();
    } catch (err) {
      console.error('❌ Erreur inattendue lors de la mise à jour:', err);
    }
  };

  const sendEvaluationRequest = async (messageId: string) => {
    try {
      // Ici on pourrait envoyer un email ou une notification à l'utilisateur
      // Pour l'instant, on ajoute juste une note dans les logs
      console.log('📧 Demande d\'évaluation automatique envoyée pour la requête:', messageId);
      
      // Optionnel : Ajouter une note interne pour indiquer que l'évaluation a été demandée
      const { error } = await supabase
        .from('support_messages')
        .update({ 
          internal_notes: (messages.find(m => m.id === messageId)?.internal_notes || '') + 
            '\n\n[SYSTÈME] Demande d\'évaluation envoyée automatiquement le ' + 
            new Date().toLocaleString('fr-FR')
        })
        .eq('id', messageId);

      if (error) {
        console.error('❌ Erreur lors de l\'ajout de la note d\'évaluation:', error);
      }
    } catch (err) {
      console.error('❌ Erreur lors de l\'envoi de la demande d\'évaluation:', err);
    }
  };

  const sendReply = async () => {
    if (!replyModal.message || !replyText.trim()) return;

    setReplyLoading(true);
    try {
      const { error } = await supabase
        .from('support_messages')
        .update({ 
          response: replyText,
          status: 'answered',
          answered_at: new Date().toISOString()
        })
        .eq('id', replyModal.message.id);

      if (error) {
        console.error('❌ Erreur lors de l\'envoi de la réponse:', error);
        return;
      }

      console.log('✅ Réponse envoyée');
      setReplyModal({ open: false, message: null });
      setReplyText('');
      fetchMessages();
    } catch (err) {
      console.error('❌ Erreur inattendue:', err);
    } finally {
      setReplyLoading(false);
    }
  };

  const assignRequest = async () => {
    if (!assignModal.message) return;

    setAssignLoading(true);
    try {
      const updateData: any = {
        status: 'in_progress',
        assigned_to: assignedTo,
        internal_notes: internalNotes,
        estimated_resolution_time: estimatedTime
      };

      const { error } = await supabase
        .from('support_messages')
        .update(updateData)
        .eq('id', assignModal.message.id);

      if (error) {
        console.error('❌ Erreur lors de l\'assignation:', error);
        return;
      }

      console.log('✅ Requête assignée');
      setAssignModal({ open: false, message: null });
      setAssignedTo('');
      setInternalNotes('');
      setEstimatedTime('');
      fetchMessages();
    } catch (err) {
      console.error('❌ Erreur inattendue:', err);
    } finally {
      setAssignLoading(false);
    }
  };

  const calculateResolutionTime = (createdAt: string, resolvedAt?: string) => {
    if (!resolvedAt) return null;
    
    const created = new Date(createdAt);
    const resolved = new Date(resolvedAt);
    const diffMs = resolved.getTime() - created.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours}h`;
    } else {
      const diffDays = Math.round(diffHours / 24);
      return `${diffDays}j`;
    }
  };

  // Calcul des statistiques détaillées
  const getDetailedStats = () => {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Filtres par période
    const last30DaysMessages = messages.filter(msg => msg.created_at && new Date(msg.created_at) >= last30Days);
    const last7DaysMessages = messages.filter(msg => msg.created_at && new Date(msg.created_at) >= last7Days);
    const todayMessages = messages.filter(msg => msg.created_at && new Date(msg.created_at) >= today);

    // Statistiques par statut
    const statusStats = {
      pending: messages.filter(m => m.status === 'pending').length,
      in_progress: messages.filter(m => m.status === 'in_progress').length,
      answered: messages.filter(m => m.status === 'answered').length,
      resolved: messages.filter(m => m.status === 'resolved').length,
      closed: messages.filter(m => m.status === 'closed').length,
    };

    // Statistiques par priorité
    const priorityStats = {
      critical: messages.filter(m => m.priority === 'critical').length,
      high: messages.filter(m => m.priority === 'high').length,
      medium: messages.filter(m => m.priority === 'medium').length,
      low: messages.filter(m => m.priority === 'low').length,
    };

    // Statistiques par catégorie
    const categoryStats = {
      technical: messages.filter(m => m.category === 'technical').length,
      payment: messages.filter(m => m.category === 'payment').length,
      card: messages.filter(m => m.category === 'card').length,
      account: messages.filter(m => m.category === 'account').length,
      general: messages.filter(m => m.category === 'general').length,
      urgent: messages.filter(m => m.category === 'urgent').length,
      bug: messages.filter(m => m.category === 'bug').length,
      feature: messages.filter(m => m.category === 'feature').length,
    };

    // Temps de résolution moyen
    const resolvedMessages = messages.filter(m => m.status === 'resolved' && m.created_at && m.resolved_at);
    const avgResolutionTime = resolvedMessages.length > 0 
      ? resolvedMessages.reduce((acc, msg) => {
          if (!msg.created_at || !msg.resolved_at) return acc;
          const created = new Date(msg.created_at);
          const resolved = new Date(msg.resolved_at);
          return acc + (resolved.getTime() - created.getTime());
        }, 0) / resolvedMessages.length / (1000 * 60 * 60) // en heures
      : 0;

    // Taux de satisfaction
    const evaluatedMessages = messages.filter(m => m.satisfaction_rating);
    const avgSatisfaction = evaluatedMessages.length > 0
      ? evaluatedMessages.reduce((acc, msg) => acc + (msg.satisfaction_rating || 0), 0) / evaluatedMessages.length
      : 0;

    // Tendances
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const dayMessages = messages.filter(msg => {
        if (!msg.created_at) return false;
        const msgDate = new Date(msg.created_at);
        return msgDate >= dayStart && msgDate < dayEnd;
      });

      dailyStats.push({
        date: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
        count: dayMessages.length,
        resolved: dayMessages.filter(m => m.status === 'resolved').length,
      });
    }

    return {
      total: messages.length,
      last30Days: last30DaysMessages.length,
      last7Days: last7DaysMessages.length,
      today: todayMessages.length,
      statusStats,
      priorityStats,
      categoryStats,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
      evaluationRate: messages.length > 0 ? Math.round((evaluatedMessages.length / messages.length) * 100) : 0,
      dailyStats,
      resolvedMessages: resolvedMessages.length,
      evaluatedMessages: evaluatedMessages.length,
    };
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'answered': return 'bg-green-100 text-green-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return '🔧';
      case 'payment': return '💳';
      case 'card': return '🆔';
      case 'account': return '👤';
      case 'urgent': return '🚨';
      case 'bug': return '🐛';
      case 'feature': return '✨';
      default: return '📝';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'in_progress': return 'En cours';
      case 'answered': return 'Répondu';
      case 'resolved': return 'Résolu';
      case 'closed': return 'Fermé';
      default: return status;
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

  // Statistiques
  const stats = {
    total: messages.length,
    pending: messages.filter(m => m.status === 'pending').length,
    inProgress: messages.filter(m => m.status === 'in_progress').length,
    resolved: messages.filter(m => m.status === 'resolved').length,
    critical: messages.filter(m => m.priority === 'critical').length,
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Centre de Gestion des Requêtes</h1>
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
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Centre de Gestion des Requêtes</h1>
            <p className="text-blue-100">
              {filteredMessages.length} requête{filteredMessages.length !== 1 ? 's' : ''} affichée{filteredMessages.length !== 1 ? 's' : ''} sur {messages.length} total
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setStatsModal(true)}
              className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Statistiques</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En cours</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Résolues</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critiques</p>
              <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, sujet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title="Filtrer par statut"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="in_progress">En cours</option>
            <option value="answered">Répondu</option>
            <option value="resolved">Résolu</option>
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
            <option value="card">Carte</option>
            <option value="account">Compte</option>
            <option value="general">Général</option>
            <option value="urgent">Urgent</option>
            <option value="bug">Bug</option>
            <option value="feature">Fonctionnalité</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title="Filtrer par priorité"
          >
            <option value="all">Toutes les priorités</option>
            <option value="critical">Critique</option>
            <option value="high">Élevée</option>
            <option value="medium">Moyenne</option>
            <option value="low">Faible</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title="Filtrer par date"
          >
            <option value="all">Toutes les dates</option>
            <option value="today">Aujourd'hui</option>
            <option value="yesterday">Hier</option>
            <option value="week">Cette semaine</option>
          </select>
        </div>
      </div>

      {/* Liste des requêtes */}
      {filteredMessages.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12">
          <div className="text-center text-gray-500">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Aucune requête trouvée</p>
            <p className="mb-4">Aucune requête ne correspond aux critères de recherche.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCategoryFilter('all');
                setPriorityFilter('all');
                setDateFilter('all');
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <div key={message.id} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                    {getCategoryIcon(message.category || 'general')}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {message.subject || 'Sujet inconnu'}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(message.priority || 'medium')}`}>
                        {getPriorityText(message.priority || 'medium')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <User className="w-4 h-4 inline mr-1" />
                      {message.fullname || 'Utilisateur inconnu'} ({message.email || 'Email inconnu'})
                    </p>
                    <p className="text-sm text-gray-500">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {message.created_at ? new Date(message.created_at).toLocaleString('fr-FR') : 'Date inconnue'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status || 'pending')}`}>
                    {getStatusText(message.status || 'pending')}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {getCategoryText(message.category || 'général')}
                  </span>
                  {message.tags && message.tags.map((tag, index) => (
                    <span key={index} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      <Tag className="w-3 h-3 inline mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 whitespace-pre-wrap line-clamp-2">{message.message || 'Message inconnu'}</p>
              </div>

              {message.response && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Reply className="w-4 h-4 mr-2" />
                    Réponse :
                  </h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{message.response}</p>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setDetailModal({ open: true, message })}
                  className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded text-sm font-medium flex items-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>Détails</span>
                </button>
                
                {message.status === 'pending' && (
                  <>
                    <button
                      onClick={() => setAssignModal({ open: true, message })}
                      className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 flex items-center space-x-1"
                      title="Assigner la requête"
                    >
                      <User className="w-4 h-4" />
                      <span>Assigner</span>
                    </button>
                    <button
                      onClick={() => setReplyModal({ open: true, message })}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center space-x-1"
                    >
                      <Reply className="w-4 h-4" />
                      <span>Répondre</span>
                    </button>
                    <button
                      onClick={() => updateMessageStatus(message.id, 'in_progress')}
                      className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                    >
                      En cours
                    </button>
                  </>
                )}
                
                {message.status === 'in_progress' && (
                  <>
                    <button
                      onClick={() => setAssignModal({ open: true, message })}
                      className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 flex items-center space-x-1"
                      title="Modifier l'assignation"
                    >
                      <User className="w-4 h-4" />
                      <span>Assigner</span>
                    </button>
                    <button
                      onClick={() => setReplyModal({ open: true, message })}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center space-x-1"
                    >
                      <Reply className="w-4 h-4" />
                      <span>Répondre</span>
                    </button>
                    <button
                      onClick={() => updateMessageStatus(message.id, 'resolved')}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Résolu
                    </button>
                  </>
                )}
                
                {message.status === 'answered' && (
                  <>
                    <button
                      onClick={() => updateMessageStatus(message.id, 'resolved')}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Résolu
                    </button>
                  </>
                )}
                
                {message.status === 'resolved' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-green-600 flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Évaluation demandée automatiquement
                    </span>
                  </div>
                )}
                
                {message.status !== 'closed' && (
                  <button
                    onClick={() => updateMessageStatus(message.id, 'closed')}
                    className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 flex items-center space-x-1"
                  >
                    <Archive className="w-4 h-4" />
                    <span>Fermer</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de réponse */}
      {replyModal.open && replyModal.message && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Répondre à la requête</h2>
              <button 
                onClick={() => setReplyModal({ open: false, message: null })}
                className="text-gray-400 hover:text-gray-600"
                title="Fermer le modal de réponse"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">{replyModal.message.subject || 'Sujet inconnu'}</h3>
              <p className="text-sm text-gray-600 mb-2">
                De: {replyModal.message.fullname || 'Utilisateur inconnu'} ({replyModal.message.email || 'Email inconnu'})
              </p>
              <p className="text-gray-700">{replyModal.message.message || 'Message inconnu'}</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Votre réponse :</label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tapez votre réponse..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setReplyModal({ open: false, message: null })}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={sendReply}
                disabled={replyLoading || !replyText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {replyLoading ? 'Envoi...' : 'Envoyer la réponse'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {detailModal.open && detailModal.message && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Détails de la requête</h2>
              <button 
                onClick={() => setDetailModal({ open: false, message: null })}
                className="text-gray-400 hover:text-gray-600"
                title="Fermer le modal de détails"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Informations de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Sujet</label>
                  <p className="text-lg font-semibold text-gray-900">{detailModal.message.subject || 'Sujet inconnu'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Statut</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(detailModal.message.status || 'pending')}`}>
                    {getStatusText(detailModal.message.status || 'pending')}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Priorité</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(detailModal.message.priority || 'medium')}`}>
                    {getPriorityText(detailModal.message.priority || 'medium')}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Catégorie</label>
                  <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded">
                    {getCategoryText(detailModal.message.category || 'général')}
                  </span>
                </div>
              </div>

              {/* Informations de contact */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">Informations de contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Nom complet</label>
                    <p className="text-gray-900">{detailModal.message.fullname || 'Utilisateur inconnu'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                    <p className="text-gray-900">{detailModal.message.email || 'Email inconnu'}</p>
                  </div>
                </div>
              </div>

              {/* Message original */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">Message original</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{detailModal.message.message || 'Message inconnu'}</p>
                </div>
              </div>

              {/* Réponse */}
              {detailModal.message.response && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">Réponse</h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{detailModal.message.response}</p>
                  </div>
                </div>
              )}

              {/* Métadonnées */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">Métadonnées</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Date de création</label>
                    <p className="text-gray-900">{detailModal.message.created_at ? new Date(detailModal.message.created_at).toLocaleString('fr-FR') : 'Date inconnue'}</p>
                  </div>
                  {detailModal.message.answered_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Date de réponse</label>
                      <p className="text-gray-900">{new Date(detailModal.message.answered_at).toLocaleString('fr-FR')}</p>
                    </div>
                  )}
                  {detailModal.message.resolved_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Date de résolution</label>
                      <p className="text-gray-900">{new Date(detailModal.message.resolved_at).toLocaleString('fr-FR')}</p>
                    </div>
                  )}
                  {detailModal.message.closed_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Date de fermeture</label>
                      <p className="text-gray-900">{new Date(detailModal.message.closed_at).toLocaleString('fr-FR')}</p>
                    </div>
                  )}
                  {detailModal.message.assigned_to && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Assigné à</label>
                      <p className="text-gray-900">{detailModal.message.assigned_to}</p>
                    </div>
                  )}
                  {detailModal.message.estimated_resolution_time && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Temps estimé</label>
                      <p className="text-gray-900">{detailModal.message.estimated_resolution_time}</p>
                    </div>
                  )}
                  {detailModal.message.actual_resolution_time && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Temps réel</label>
                      <p className="text-gray-900">{detailModal.message.actual_resolution_time}</p>
                    </div>
                  )}
                  {detailModal.message.created_at && detailModal.message.resolved_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Temps calculé</label>
                      <p className="text-gray-900">{calculateResolutionTime(detailModal.message.created_at, detailModal.message.resolved_at)}</p>
                    </div>
                  )}
                  {detailModal.message.satisfaction_rating && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Note de satisfaction</label>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star 
                            key={star} 
                            className={`w-4 h-4 ${star <= detailModal.message.satisfaction_rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-2">({detailModal.message.satisfaction_rating}/5)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes internes */}
              {detailModal.message.internal_notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">Notes internes</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{detailModal.message.internal_notes}</p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {detailModal.message.tags && detailModal.message.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {detailModal.message.tags.map((tag, index) => (
                      <span key={index} className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded">
                        <Tag className="w-4 h-4 inline mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal d'assignation */}
      {assignModal.open && assignModal.message && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Assigner la requête</h2>
              <button 
                onClick={() => setAssignModal({ open: false, message: null })}
                className="text-gray-400 hover:text-gray-600"
                title="Fermer le modal d'assignation"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">{assignModal.message.subject || 'Sujet inconnu'}</h3>
              <p className="text-sm text-gray-600 mb-2">
                De: {assignModal.message.fullname} ({assignModal.message.email})
              </p>
              <p className="text-gray-700">{assignModal.message.message}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigner à :</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Sélectionner un admin"
                >
                  <option value="">Sélectionner un admin</option>
                  {availableAdmins.map(admin => (
                    <option key={admin.id} value={admin.id}>{admin.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Temps estimé de résolution :</label>
                <select
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Sélectionner le temps estimé"
                >
                  <option value="">Sélectionner un délai</option>
                  {timeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes internes :</label>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Notes internes pour l'équipe..."
                  title="Notes internes"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setAssignModal({ open: false, message: null })}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={assignRequest}
                disabled={assignLoading || !assignedTo}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {assignLoading ? 'Assignation...' : 'Assigner la requête'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de statistiques détaillées */}
      {statsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Statistiques détaillées du support</h2>
              <button 
                onClick={() => setStatsModal(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Fermer les statistiques"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {(() => {
              const stats = getDetailedStats();
              return (
                <div className="space-y-8">
                  {/* Vue d'ensemble */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600">Total requêtes</p>
                          <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
                        </div>
                        <MessageSquare className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600">Résolues</p>
                          <p className="text-2xl font-bold text-green-800">{stats.resolvedMessages}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-yellow-600">Temps moyen</p>
                          <p className="text-2xl font-bold text-yellow-800">{stats.avgResolutionTime}h</p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-600" />
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-600">Satisfaction</p>
                          <p className="text-2xl font-bold text-purple-800">{stats.avgSatisfaction}/5</p>
                        </div>
                        <Star className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  {/* Tendances des 7 derniers jours */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendances des 7 derniers jours</h3>
                    <div className="grid grid-cols-7 gap-2">
                      {stats.dailyStats.map((day, index) => (
                        <div key={index} className="text-center">
                          <p className="text-xs text-gray-600 mb-1">{day.date}</p>
                          <div className="bg-blue-100 rounded p-2">
                            <p className="text-sm font-bold text-blue-800">{day.count}</p>
                            <p className="text-xs text-blue-600">requêtes</p>
                          </div>
                          {day.resolved > 0 && (
                            <div className="bg-green-100 rounded p-1 mt-1">
                              <p className="text-xs font-bold text-green-800">{day.resolved}</p>
                              <p className="text-xs text-green-600">résolues</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Répartition par statut */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par statut</h3>
                      <div className="space-y-3">
                        {Object.entries(stats.statusStats).map(([status, count]) => (
                          <div key={status} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${
                                status === 'pending' ? 'bg-yellow-400' :
                                status === 'in_progress' ? 'bg-blue-400' :
                                status === 'answered' ? 'bg-green-400' :
                                status === 'resolved' ? 'bg-green-500' :
                                'bg-gray-400'
                              }`} />
                              <span className="text-sm text-gray-700">
                                {status === 'pending' ? 'En attente' :
                                 status === 'in_progress' ? 'En cours' :
                                 status === 'answered' ? 'Répondu' :
                                 status === 'resolved' ? 'Résolu' :
                                 status === 'closed' ? 'Fermé' : status}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Répartition par priorité */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par priorité</h3>
                      <div className="space-y-3">
                        {Object.entries(stats.priorityStats).map(([priority, count]) => (
                          <div key={priority} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${
                                priority === 'critical' ? 'bg-red-400' :
                                priority === 'high' ? 'bg-orange-400' :
                                priority === 'medium' ? 'bg-yellow-400' :
                                'bg-green-400'
                              }`} />
                              <span className="text-sm text-gray-700">
                                {priority === 'critical' ? 'Critique' :
                                 priority === 'high' ? 'Élevée' :
                                 priority === 'medium' ? 'Moyenne' :
                                 priority === 'low' ? 'Faible' : priority}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Répartition par catégorie */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par catégorie</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(stats.categoryStats).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getCategoryIcon(category)}</span>
                            <span className="text-sm text-gray-700">
                              {getCategoryText(category)}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Métriques de performance */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Périodes</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Aujourd'hui</span>
                          <span className="text-sm font-bold text-gray-900">{stats.today}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">7 derniers jours</span>
                          <span className="text-sm font-bold text-gray-900">{stats.last7Days}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">30 derniers jours</span>
                          <span className="text-sm font-bold text-gray-900">{stats.last30Days}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Temps moyen de résolution</span>
                          <span className="text-sm font-bold text-gray-900">{stats.avgResolutionTime}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Taux d'évaluation</span>
                          <span className="text-sm font-bold text-gray-900">{stats.evaluationRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Requêtes évaluées</span>
                          <span className="text-sm font-bold text-gray-900">{stats.evaluatedMessages}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Satisfaction</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Note moyenne</span>
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-bold text-gray-900">{stats.avgSatisfaction}</span>
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Sur 5 étoiles</span>
                          <span className="text-sm text-gray-500">/5</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ width: `${(stats.avgSatisfaction / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupport; 
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, CreditCard, DollarSign, TrendingUp, AlertCircle, CheckCircle, MessageSquare, Star, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Activity {
  id: string;
  type: 'card' | 'payment' | 'support';
  message: string;
  time: string;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCards: 0,
    totalPayments: 0,
    pendingCards: 0,
    approvedCards: 0,
    pendingPayments: 0,
    approvedPayments: 0,
    revenue: 0,
    // Statistiques de support
    totalSupportRequests: 0,
    pendingSupportRequests: 0,
    resolvedSupportRequests: 0,
    avgSatisfaction: 0,
    avgResolutionTime: 0
  });
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('🔄 Début du chargement des données du dashboard...');
      
      // Fetch statistics
      const [usersResult, cardsResult, paymentsResult, supportResult] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('cards').select('*'),
        supabase.from('payments').select('*'),
        supabase.from('support_messages').select('*')
      ]);

      console.log('📊 Résultats des requêtes:');
      console.log('Users:', usersResult);
      console.log('Cards:', cardsResult);
      console.log('Payments:', paymentsResult);
      console.log('Support Messages:', supportResult);

      const users = usersResult.data || [];
      const cards = cardsResult.data || [];
      const payments = paymentsResult.data || [];
      const supportMessages = supportResult.data || [];

      console.log('📈 Données extraites:');
      console.log('Users count:', users.length);
      console.log('Cards count:', cards.length);
      console.log('Payments count:', payments.length);
      console.log('Support Messages count:', supportMessages.length);

      const totalRevenue = payments
        .filter(p => p.status === 'approved')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      // Calcul des statistiques de support
      const resolvedMessages = supportMessages.filter(m => m.status === 'resolved' && m.created_at && m.resolved_at);
      const avgResolutionTime = resolvedMessages.length > 0 
        ? resolvedMessages.reduce((acc, msg) => {
            if (!msg.created_at || !msg.resolved_at) return acc;
            const created = new Date(msg.created_at);
            const resolved = new Date(msg.resolved_at);
            return acc + (resolved.getTime() - created.getTime());
          }, 0) / resolvedMessages.length / (1000 * 60 * 60) // en heures
        : 0;

      const evaluatedMessages = supportMessages.filter(m => m.satisfaction_rating);
      const avgSatisfaction = evaluatedMessages.length > 0
        ? evaluatedMessages.reduce((acc, msg) => acc + (msg.satisfaction_rating || 0), 0) / evaluatedMessages.length
        : 0;

      const newStats = {
        totalStudents: users.filter(u => u.role === 'student').length,
        totalCards: cards.length,
        totalPayments: payments.length,
        pendingCards: cards.filter(c => c.status === 'pending').length,
        approvedCards: cards.filter(c => c.status === 'approved').length,
        pendingPayments: payments.filter(p => p.status === 'pending').length,
        approvedPayments: payments.filter(p => p.status === 'approved').length,
        revenue: totalRevenue,
        // Statistiques de support
        totalSupportRequests: supportMessages.length,
        pendingSupportRequests: supportMessages.filter(m => m.status === 'pending').length,
        resolvedSupportRequests: supportMessages.filter(m => m.status === 'resolved').length,
        avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
        avgResolutionTime: Math.round(avgResolutionTime * 10) / 10
      };

      console.log('📊 Statistiques calculées:', newStats);
      setStats(newStats);

      function getRelativeTime(dateString: string): string {
        const now = new Date();
        const date = new Date(dateString);
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
        if (diff < 60) return `il y a ${diff} sec.`;
        if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min.`;
        if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
        return date.toLocaleDateString('fr-FR');
      }

      // Récupération des activités récentes réelles (cartes et paiements)
      const recentCards: Activity[] = cards
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map((card) => ({
          id: card.id,
          type: 'card' as const,
          message:
            card.status === 'approved'
              ? `Carte approuvée - ${card.firstname || card.firstName} ${card.lastname || card.lastName}`
              : `Nouvelle demande de carte - ${card.firstname || card.firstName} ${card.lastname || card.lastName}`,
          time: getRelativeTime(card.created_at),
          created_at: card.created_at
        }));

      const recentPayments: Activity[] = payments
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map((payment) => ({
          id: payment.id,
          type: 'payment' as const,
          message:
            payment.status === 'approved'
              ? `Paiement approuvé - ${parseFloat(payment.amount || '0').toLocaleString()} FCFA`
              : `Nouveau paiement - ${parseFloat(payment.amount || '0').toLocaleString()} FCFA`,
          time: getRelativeTime(payment.created_at),
          created_at: payment.created_at
        }));

      const recentSupport: Activity[] = supportMessages
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3)
        .map((support) => ({
          id: support.id,
          type: 'support' as const,
          message:
            support.status === 'resolved'
              ? `Requête résolue - ${support.subject || 'Sujet inconnu'}`
              : support.status === 'answered'
              ? `Réponse envoyée - ${support.subject || 'Sujet inconnu'}`
              : `Nouvelle requête - ${support.subject || 'Sujet inconnu'}`,
          time: getRelativeTime(support.created_at),
          created_at: support.created_at
        }));

      // Fusionner et trier les activités récentes par date
      const allActivities = [...recentCards, ...recentPayments, ...recentSupport].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      console.log('📅 Activités récentes:', allActivities);
      setRecentActivity(allActivities.slice(0, 8));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
        <h1 className="text-2xl font-bold mb-2">Tableau de bord Admin</h1>
        <p className="text-blue-100">Vue d'ensemble de l'activité du système</p>
          </div>
          <button 
            onClick={fetchDashboardData}
            disabled={loading}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 disabled:opacity-50"
            title="Rafraîchir les données"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{loading ? 'Chargement...' : 'Rafraîchir'}</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total étudiants</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cartes créées</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCards}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenus</p>
              <p className="text-2xl font-bold text-gray-900">{stats.revenue.toLocaleString()} FCFA</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Requêtes de support</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSupportRequests}</p>
              <p className="text-xs text-gray-500">{stats.pendingSupportRequests} en attente</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Cartes supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingCards + stats.pendingPayments + stats.pendingSupportRequests}</p>
              <p className="text-xs text-gray-500">Cartes, paiements et support</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Satisfaction support</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgSatisfaction}/5</p>
              <p className="text-xs text-gray-500">Note moyenne</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Temps de résolution</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgResolutionTime}h</p>
              <p className="text-xs text-gray-500">Support moyen</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Support utilisateurs</h3>
          <p className="text-gray-500 mb-4 text-center">Consultez et répondez aux messages de support envoyés par les étudiants.</p>
          <div className="text-center mb-4">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-1"></div>
                {stats.pendingSupportRequests} en attente
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                {stats.resolvedSupportRequests} résolues
              </span>
            </div>
          </div>
          <Link to="/admin/support" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">Voir les messages</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Activité récente</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'card' ? 'bg-blue-100' : activity.type === 'payment' ? 'bg-green-100' : 'bg-purple-100'
                }`}>
                  {activity.type === 'card' ? 
                    <CreditCard className="w-4 h-4 text-blue-600" /> : 
                    activity.type === 'payment' ? 
                      <DollarSign className="w-4 h-4 text-green-600" /> : 
                      <MessageSquare className="w-4 h-4 text-purple-600" />
                  }
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">Il y a {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Overview */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">État des demandes</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Cartes en attente</span>
              </div>
              <span className="text-blue-600 font-bold">{stats.pendingCards}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">Cartes approuvées</span>
              </div>
              <span className="text-green-600 font-bold">{stats.approvedCards}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-gray-900">Paiements en attente</span>
              </div>
              <span className="text-yellow-600 font-bold">{stats.pendingPayments}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900">Paiements approuvés</span>
              </div>
              <span className="text-purple-600 font-bold">{stats.approvedPayments}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5 text-red-600" />
                <span className="font-medium text-gray-900">Requêtes de support en attente</span>
              </div>
              <span className="text-red-600 font-bold">{stats.pendingSupportRequests}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Requêtes de support résolues</span>
              </div>
              <span className="text-gray-600 font-bold">{stats.resolvedSupportRequests}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg">
              <div className="flex items-center space-x-3">
                <Star className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Satisfaction moyenne</span>
              </div>
              <span className="text-blue-600 font-bold">{stats.avgSatisfaction}%</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">Temps de résolution moyen</span>
              </div>
              <span className="text-green-600 font-bold">{stats.avgResolutionTime} heures</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
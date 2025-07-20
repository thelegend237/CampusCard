import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, CreditCard, DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';


const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCards: 0,
    totalPayments: 0,
    pendingCards: 0,
    approvedCards: 0,
    pendingPayments: 0,
    approvedPayments: 0,
    revenue: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch statistics
      const [usersResult, cardsResult, paymentsResult] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('cards').select('*'),
        supabase.from('payments').select('*')
      ]);

      const users = usersResult.data || [];
      const cards = cardsResult.data || [];
      const payments = paymentsResult.data || [];

      const totalRevenue = payments
        .filter(p => p.status === 'approved')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

      setStats({
        totalStudents: users.filter(u => u.role === 'student').length,
        totalCards: cards.length,
        totalPayments: payments.length,
        pendingCards: cards.filter(c => c.status === 'pending').length,
        approvedCards: cards.filter(c => c.status === 'approved').length,
        pendingPayments: payments.filter(p => p.status === 'pending').length,
        approvedPayments: payments.filter(p => p.status === 'approved').length,
        revenue: totalRevenue
      });

      function getRelativeTime(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
        if (diff < 60) return `il y a ${diff} sec.`;
        if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min.`;
        if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
        return date.toLocaleDateString('fr-FR');
      }

      // Récupération des activités récentes réelles (cartes et paiements)
      const recentCards = cards
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map((card) => ({
          id: card.id,
          type: 'card',
          message:
            card.status === 'approved'
              ? `Carte approuvée - ${card.firstname || card.firstName} ${card.lastname || card.lastName}`
              : `Nouvelle demande de carte - ${card.firstname || card.firstName} ${card.lastname || card.lastName}`,
          time: getRelativeTime(card.created_at)
        }));

      const recentPayments = payments
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map((payment) => ({
          id: payment.id,
          type: 'payment',
          message:
            payment.status === 'approved'
              ? `Paiement approuvé - ${parseFloat(payment.amount).toLocaleString()} FCFA`
              : `Nouveau paiement - ${parseFloat(payment.amount).toLocaleString()} FCFA`,
          time: getRelativeTime(payment.created_at)
        }));

      // Fusionner et trier les activités récentes par date
      const allActivities = [...recentCards, ...recentPayments].sort(
        (a, b) => new Date(b.timeRaw || b.created_at).getTime() - new Date(a.timeRaw || a.created_at).getTime()
      );

      setRecentActivity(allActivities.slice(0, 6));
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
        <h1 className="text-2xl font-bold mb-2">Tableau de bord Admin</h1>
        <p className="text-blue-100">Vue d'ensemble de l'activité du système</p>
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
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingCards + stats.pendingPayments}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
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
                  activity.type === 'card' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {activity.type === 'card' ? 
                    <CreditCard className="w-4 h-4 text-blue-600" /> : 
                    <DollarSign className="w-4 h-4 text-green-600" />
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
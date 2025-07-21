import React, { useState, useEffect } from 'react';
import { supabase } from '../../../src/lib/supabase';
import { Download, TrendingUp, Users, CreditCard, DollarSign, Calendar } from 'lucide-react';
import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable"; // linter: not used

const AdminReports: React.FC = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCards: 0,
    totalRevenue: 0,
    monthlyGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);

  // Weekly stats
  const [weeklyStats, setWeeklyStats] = useState<{
    students: number;
    studentsPercent: number;
    approvedCards: number;
    cardsPercent: number;
    revenue: number;
    revenuePercent: number;
  } | null>(null);
  const [weeklyLoading, setWeeklyLoading] = useState(true);

  useEffect(() => {
    fetchReportsData();
    fetchWeeklyStats();
  }, []);

  const fetchReportsData = async () => {
    try {
      const [usersResult, cardsResult, paymentsResult] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('cards').select('*'),
        supabase.from('payments').select('*')
      ]);

      const users = usersResult.data || [];
      const cardsData = cardsResult.data || [];
      const paymentsData = paymentsResult.data || [];
      setCards(cardsData);
      setPayments(paymentsData);

      const totalRevenue = paymentsData
        .filter((p: any) => p.status === 'approved')
        .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);

      setStats({
        totalStudents: users.filter((u: any) => u.role === 'student').length,
        totalCards: cardsData.length,
        totalRevenue,
        monthlyGrowth: (() => {
          const now = new Date();
          const thisMonth = now.getMonth();
          const thisYear = now.getFullYear();
          const approvedPayments = paymentsData.filter((p: any) => p.status === 'approved');
          const totalThisMonth = approvedPayments
            .filter((p: any) => {
              const d = new Date(p.created_at);
              return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
            })
            .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
          const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1;
          const prevYear = thisMonth === 0 ? thisYear - 1 : thisYear;
          const totalPrevMonth = approvedPayments
            .filter((p: any) => {
              const d = new Date(p.created_at);
              return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
            })
            .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
          if (totalPrevMonth === 0) {
            return totalThisMonth > 0 ? 100 : 0;
          }
          return Math.round(((totalThisMonth - totalPrevMonth) / totalPrevMonth) * 100);
        })()
      });
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Weekly stats fetcher
  const fetchWeeklyStats = async () => {
    setWeeklyLoading(true);
    // Dates pour cette semaine et la semaine précédente
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Lundi
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfWeek.getDate() - 7);
    const endOfLastWeek = new Date(startOfWeek);
    const iso = (d: Date) => d.toISOString();
    // Récupérer les étudiants inscrits cette semaine et la semaine dernière
    const studentsPromise = supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'student')
      .gte('created_at', iso(startOfWeek))
      .lt('created_at', iso(endOfWeek));
    const studentsLastWeekPromise = supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'student')
      .gte('created_at', iso(startOfLastWeek))
      .lt('created_at', iso(endOfLastWeek));
    // Cartes approuvées cette semaine et la semaine dernière
    const cardsPromise = supabase
      .from('cards')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')
      .gte('created_at', iso(startOfWeek))
      .lt('created_at', iso(endOfWeek));
    const cardsLastWeekPromise = supabase
      .from('cards')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')
      .gte('created_at', iso(startOfLastWeek))
      .lt('created_at', iso(endOfLastWeek));
    // Revenus cette semaine et la semaine dernière
    const paymentsPromise = supabase
      .from('payments')
      .select('amount, status, created_at')
      .eq('status', 'approved')
      .gte('created_at', iso(startOfWeek))
      .lt('created_at', iso(endOfWeek));
    const paymentsLastWeekPromise = supabase
      .from('payments')
      .select('amount, status, created_at')
      .eq('status', 'approved')
      .gte('created_at', iso(startOfLastWeek))
      .lt('created_at', iso(endOfLastWeek));
    const [
      studentsRes,
      studentsLastWeekRes,
      cardsRes,
      cardsLastWeekRes,
      paymentsRes,
      paymentsLastWeekRes,
    ] = await Promise.all([
      studentsPromise,
      studentsLastWeekPromise,
      cardsPromise,
      cardsLastWeekPromise,
      paymentsPromise,
      paymentsLastWeekPromise,
    ]);
    const students = studentsRes.count || 0;
    const studentsLastWeek = studentsLastWeekRes.count || 0;
    const studentsPercent = studentsLastWeek === 0
      ? (students > 0 ? 100 : 0)
      : Math.round(((students - studentsLastWeek) / studentsLastWeek) * 100);
    const approvedCards = cardsRes.count || 0;
    const approvedCardsLastWeek = cardsLastWeekRes.count || 0;
    const cardsPercent = approvedCardsLastWeek === 0
      ? (approvedCards > 0 ? 100 : 0)
      : Math.round(((approvedCards - approvedCardsLastWeek) / approvedCardsLastWeek) * 100);
    const revenue = (paymentsRes.data || []).reduce(
      (sum: number, p: any) => sum + parseFloat(p.amount || 0),
      0
    );
    const revenueLastWeek = (paymentsLastWeekRes.data || []).reduce(
      (sum: number, p: any) => sum + parseFloat(p.amount || 0),
      0
    );
    const revenuePercent = revenueLastWeek === 0
      ? (revenue > 0 ? 100 : 0)
      : Math.round(((revenue - revenueLastWeek) / revenueLastWeek) * 100);
    setWeeklyStats({
      students,
      studentsPercent,
      approvedCards,
      cardsPercent,
      revenue,
      revenuePercent,
    });
    setWeeklyLoading(false);
  };


  const generateReport = (type: string) => {
    // Exemple : Générer un rapport PDF simple selon le type demandé
    const doc = new jsPDF();
    let title = "";
    let columns: any[] = [];
    let rows: any[] = [];

    if (type === "paiements") {
      title = "Rapport des paiements";
      columns = [
        { header: "Étudiant", dataKey: "student" },
        { header: "Montant", dataKey: "amount" },
        { header: "Date", dataKey: "date" },
        { header: "Statut", dataKey: "status" }
      ];
      // On suppose que 'payments' est dans le scope du composant
      rows = payments.map((p) => {
        const user = p.users as any;
        return {
          student: `${user?.firstname || ""} ${user?.lastname || ""}`,
          amount: `${parseFloat(p.amount).toLocaleString()} FCFA`,
          date: new Date(p.created_at).toLocaleDateString("fr-FR"),
          status: p.status
        };
      });
    } else if (type === "cartes") {
      title = "Rapport des cartes";
      columns = [
        { header: "Étudiant", dataKey: "student" },
        { header: "Numéro carte", dataKey: "cardNumber" },
        { header: "Date création", dataKey: "date" },
        { header: "Statut", dataKey: "status" }
      ];
      // On suppose que 'cards' est dans le scope du composant
      rows = cards.map((c) => ({
        student: `${c.firstname || c.firstName || ""} ${c.lastname || c.lastName || ""}`,
        cardNumber: c.cardnumber || c.cardNumber || "",
        date: new Date(c.created_at).toLocaleDateString("fr-FR"),
        status: c.status
      }));
    } else {
      alert("Type de rapport inconnu.");
      return;
    }

    doc.text(title, 14, 16);
    (doc as any).autoTable({
      startY: 22,
      head: [columns.map(col => col.header)],
      body: rows.map(row => columns.map(col => row[col.dataKey])),
      styles: { font: "helvetica", fontSize: 10 }
    });

    doc.save(`${title.replace(/\s/g, "_").toLowerCase()}_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Rapports et statistiques</h1>
        <p className="text-blue-100">Analysez les performances et générez des rapports</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total étudiants</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cartes générées</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalCards}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenus totaux</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalRevenue.toLocaleString()} FCFA</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Croissance mensuelle</p>
              <p className="text-2xl font-bold text-yellow-600">+{stats.monthlyGrowth}%</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Report Generation */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Génération de rapports</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Rapport étudiants</h3>
                <p className="text-sm text-gray-600">Liste complète des étudiants</p>
              </div>
            </div>
            <button
              onClick={() => generateReport('étudiants')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Générer</span>
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Rapport cartes</h3>
                <p className="text-sm text-gray-600">Statistiques des cartes</p>
              </div>
            </div>
            <button
              onClick={() => generateReport('cartes')}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Générer</span>
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Rapport financier</h3>
                <p className="text-sm text-gray-600">Analyse des revenus</p>
              </div>
            </div>
            <button
              onClick={() => generateReport('financier')}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Générer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Aperçu des activités - Données réelles */}
      {/*
        On crée une fonction pour récupérer les statistiques réelles de la semaine.
        On suppose que supabase est importé et disponible.
      */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Aperçu des activités</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Inscriptions cette semaine</h3>
                <p className="text-sm text-gray-600">
                  {weeklyLoading
                    ? 'Chargement...'
                    : `${weeklyStats?.students ?? 0} nouveaux étudiants`}
                </p>
              </div>
            </div>
            <span className="text-blue-600 font-bold">
              {weeklyLoading
                ? '...'
                : (weeklyStats
                    ? (weeklyStats.studentsPercent > 0 ? '+' : '') + weeklyStats.studentsPercent + '%'
                    : '0%')}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Cartes approuvées</h3>
                <p className="text-sm text-gray-600">
                  {weeklyLoading
                    ? 'Chargement...'
                    : `${weeklyStats?.approvedCards ?? 0} cartes cette semaine`}
                </p>
              </div>
            </div>
            <span className="text-green-600 font-bold">
              {weeklyLoading
                ? '...'
                : (weeklyStats
                    ? (weeklyStats.cardsPercent > 0 ? '+' : '') + weeklyStats.cardsPercent + '%'
                    : '0%')}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Revenus cette semaine</h3>
                <p className="text-sm text-gray-600">
                  {weeklyLoading
                    ? 'Chargement...'
                    : `${weeklyStats
                        ? parseFloat(weeklyStats.revenue.toString()).toLocaleString('fr-FR') + ' FCFA'
                        : '0 FCFA'}`}
                </p>
              </div>
            </div>
            <span className="text-purple-600 font-bold">
              {weeklyLoading
                ? '...'
                : (weeklyStats
                    ? (weeklyStats.revenuePercent > 0 ? '+' : '') + weeklyStats.revenuePercent + '%'
                    : '0%')}
            </span>
          </div>
        </div>
      </div>
   </div>
  );
};

export default AdminReports;
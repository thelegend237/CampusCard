import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../../../src/types';
import StudentCardDisplay from '../../../src/components/StudentCardDisplay';
import { generateCardPDF } from '../../../src/utils/pdfGenerator';
import { 
  Search, Filter, Download, Check, X, Eye, Calendar, Printer, FileText, Users, Building, GraduationCap,
  BarChart3, Settings, RefreshCw, FileDown, EyeOff, Grid, List, SortAsc, SortDesc, Filter as FilterIcon,
  ChevronDown, ChevronUp, Info, AlertCircle, CheckCircle, Clock, Star, Zap, CreditCard, TrendingUp
} from 'lucide-react';

const AdminCards: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterProgram, setFilterProgram] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [printModal, setPrintModal] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [programs, setPrograms] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  
  // Nouvelles fonctionnalités
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'department' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [printSettings, setPrintSettings] = useState({
    format: 'a4',
    copies: 1,
    includePhoto: true,
    includeQR: true,
    paperSize: 'A4',
    orientation: 'portrait'
  });
  const [printHistory, setPrintHistory] = useState<any[]>([]);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [cardPreviewModal, setCardPreviewModal] = useState<{ open: boolean; card: Card | null }>({ open: false, card: null });
  const [statsModal, setStatsModal] = useState(false);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select(`
          *,
          users!inner(firstname, lastname, email)
        `)
        .order('created_at', { ascending: false });

      console.log('Cartes récupérées:', data);

      if (error) throw error;
      setCards(data || []);
      
      // Extraire les données uniques pour les filtres
      if (data) {
        const uniqueDepartments = [...new Set(data.map(card => card.department).filter(Boolean))];
        const uniquePrograms = [...new Set(data.map(card => card.program).filter(Boolean))];
        const uniqueYears = [...new Set(data.map(card => card.year).filter(Boolean))];
        
        setDepartments(uniqueDepartments);
        setPrograms(uniquePrograms);
        setYears(uniqueYears);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCardStatus = async (cardid: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('cards')
        .update({ status })
        .eq('id', cardid);

      if (error) throw error;
      fetchCards();
    } catch (error) {
      console.error('Error updating card status:', error);
    }
  };

  const filteredCards = cards.filter(card => {
    const matchesSearch = 
      card.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.studentid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((card as any).matricule && (card as any).matricule.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === '' || card.status === filterStatus;
    const matchesDepartment = filterDepartment === '' || card.department === filterDepartment;
    const matchesProgram = filterProgram === '' || card.program === filterProgram;
    const matchesYear = filterYear === '' || (card as any).year === filterYear;
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesProgram && matchesYear;
  });

  const handleCardSelection = (cardId: string) => {
    setSelectedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const selectAllCards = () => {
    const approvedCards = filteredCards.filter(card => card.status === 'approved').map(card => card.id);
    setSelectedCards(approvedCards);
  };

  const clearSelection = () => {
    setSelectedCards([]);
  };

  const printSelectedCards = () => {
    if (selectedCards.length === 0) {
      alert('Veuillez sélectionner au moins une carte à imprimer');
      return;
    }
    setPrintModal(true);
  };

  const generatePrintData = () => {
    const cardsToPrint = cards.filter(card => selectedCards.includes(card.id));
    return cardsToPrint.map(card => ({
      name: `${card.firstname} ${card.lastname}`,
      matricule: (card as any).matricule || card.studentid,
      department: card.department,
      program: card.program,
      year: (card as any).year || 'N/A',
      photo: (card as any).photo || null
    }));
  };

  // Nouvelles fonctions avancées
  const sortCards = (cardsToSort: Card[]) => {
    return cardsToSort.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = `${a.firstname} ${a.lastname}`.toLowerCase();
          bValue = `${b.firstname} ${b.lastname}`.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'department':
          aValue = a.department.toLowerCase();
          bValue = b.department.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const getPrintStats = () => {
    const totalCards = cards.length;
    const approvedCards = cards.filter(c => c.status === 'approved').length;
    const pendingCards = cards.filter(c => c.status === 'pending').length;
    const rejectedCards = cards.filter(c => c.status === 'rejected').length;
    const todayCards = cards.filter(c => {
      const today = new Date().toDateString();
      return new Date(c.created_at).toDateString() === today;
    }).length;

    return { totalCards, approvedCards, pendingCards, rejectedCards, todayCards };
  };

  const exportToPDF = async () => {
    const cardsToExport = cards.filter(card => selectedCards.includes(card.id));
    
    try {
      // Exporter chaque carte individuellement
      for (const card of cardsToExport) {
        await generateCardPDF(card);
        // Petite pause entre les exports pour éviter les conflits
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Optionnel : créer un ZIP avec toutes les cartes
      if (cardsToExport.length > 1) {
        alert(`${cardsToExport.length} cartes exportées avec succès !`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      alert('Erreur lors de l\'export PDF. Vérifiez que les logos sont disponibles.');
    }
  };

  const previewIndividualCard = (card: Card) => {
    setCardPreviewModal({ open: true, card });
  };

  const downloadCardPDF = async (card: Card) => {
    try {
      await generateCardPDF(card);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement de la carte.');
    }
  };

  const generateQRCode = (matricule: string) => {
    // Simulation de génération de QR code
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${matricule}`;
  };

  const previewCard = (card: any) => {
    setPreviewModal(true);
    // Ici on pourrait afficher une prévisualisation de la carte
  };

  const createBatch = () => {
    const batchId = `batch_${Date.now()}`;
    const batchData = {
      id: batchId,
      name: `Lot ${new Date().toLocaleDateString('fr-FR')}`,
      cards: selectedCards,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    setPrintHistory(prev => [...prev, batchData]);
    setSelectedBatch(batchId);
  };

  const getFilteredAndSortedCards = () => {
    let filtered = cards.filter(card => {
      const matchesSearch = 
        card.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.studentid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ((card as any).matricule && (card as any).matricule.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = filterStatus === '' || card.status === filterStatus;
      const matchesDepartment = filterDepartment === '' || card.department === filterDepartment;
      const matchesProgram = filterProgram === '' || card.program === filterProgram;
      const matchesYear = filterYear === '' || (card as any).year === filterYear;
      
      return matchesSearch && matchesStatus && matchesDepartment && matchesProgram && matchesYear;
    });

    return sortCards(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvée';
      case 'rejected': return 'Rejetée';
      default: return 'Inconnu';
    }
  };

  const getDetailedCardStats = () => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Statistiques de base
    const total = cards.length;
    const approved = cards.filter(card => card.status === 'approved').length;
    const pending = cards.filter(card => card.status === 'pending').length;
    const rejected = cards.filter(card => card.status === 'rejected').length;
    
    // Statistiques d'impression
    const totalPrinted = approved; // Toutes les cartes approuvées sont considérées comme imprimées
    const todayPrinted = cards.filter(card => {
      const cardDate = new Date(card.created_at);
      return cardDate.toDateString() === now.toDateString() && card.status === 'approved';
    }).length;
    
    // Statistiques par département
    const departmentStats: { [key: string]: number } = {};
    cards.forEach(card => {
      const dept = card.department || 'Non spécifié';
      departmentStats[dept] = (departmentStats[dept] || 0) + 1;
    });
    
    // Statistiques par programme
    const programStats: { [key: string]: number } = {};
    cards.forEach(card => {
      const prog = card.program || 'Non spécifié';
      programStats[prog] = (programStats[prog] || 0) + 1;
    });
    
    // Statistiques par année
    const yearStats: { [key: string]: number } = {};
    cards.forEach(card => {
      const year = (card as any).year || 'Non spécifié';
      yearStats[year] = (yearStats[year] || 0) + 1;
    });
    
    // Statistiques des 7 derniers jours
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      
      const dayCards = cards.filter(card => {
        const cardDate = new Date(card.created_at);
        return cardDate.toDateString() === date.toDateString();
      });
      
      const dayApproved = dayCards.filter(card => card.status === 'approved').length;
      const dayPrinted = dayApproved; // Cartes approuvées = cartes imprimées
      
      dailyStats.push({
        date: dateStr,
        count: dayCards.length,
        approved: dayApproved,
        printed: dayPrinted
      });
    }
    
    // Taux d'approbation
    const approvalRate = total > 0 ? ((approved / total) * 100).toFixed(1) : '0';
    
    // Temps moyen de traitement (si on a des données de mise à jour)
    const processedCards = cards.filter(card => card.status !== 'pending' && card.updated_at);
    let avgProcessingTime = 0;
    if (processedCards.length > 0) {
      const totalTime = processedCards.reduce((sum, card) => {
        const created = new Date(card.created_at);
        const updated = new Date(card.updated_at || card.created_at);
        return sum + (updated.getTime() - created.getTime());
      }, 0);
      avgProcessingTime = Math.round(totalTime / processedCards.length / (1000 * 60 * 60)); // en heures
    }
    
    // Cartes créées aujourd'hui
    const todayCards = cards.filter(card => {
      const cardDate = new Date(card.created_at);
      return cardDate.toDateString() === now.toDateString();
    });
    
    // Top départements
    const topDepartments = Object.entries(departmentStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    // Top programmes
    const topPrograms = Object.entries(programStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    return {
      total,
      approved,
      pending,
      rejected,
      totalPrinted,
      todayPrinted,
      approvalRate,
      avgProcessingTime,
      todayCards: todayCards.length,
      dailyStats,
      departmentStats,
      programStats,
      yearStats,
      topDepartments,
      topPrograms
    };
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
      {/* Header avec statistiques */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Gestion des cartes</h1>
            <p className="text-blue-100">Gérez et imprimez les cartes d'étudiant</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={fetchCards}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all flex items-center space-x-2 disabled:opacity-50"
              title="Rafraîchir les données"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{loading ? 'Chargement...' : 'Actualiser'}</span>
            </button>
            <button 
              onClick={() => setStatsModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all flex items-center space-x-2"
              title="Voir les statistiques détaillées"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="hidden sm:inline">Statistiques</span>
            </button>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all flex items-center space-x-2"
              title="Afficher/Masquer les filtres"
            >
              <FilterIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Filtres</span>
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Statistiques en temps réel */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {(() => {
            const stats = getPrintStats();
            return (
              <>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{stats.totalCards}</div>
                  <div className="text-sm text-blue-100">Total</div>
                </div>
                <div className="bg-green-500/20 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{stats.approvedCards}</div>
                  <div className="text-sm text-green-100">Approuvées</div>
                </div>
                <div className="bg-yellow-500/20 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{stats.pendingCards}</div>
                  <div className="text-sm text-yellow-100">En attente</div>
                </div>
                <div className="bg-red-500/20 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{stats.rejectedCards}</div>
                  <div className="text-sm text-red-100">Rejetées</div>
                </div>
                <div className="bg-blue-500/20 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{stats.todayCards}</div>
                  <div className="text-sm text-blue-100">Aujourd'hui</div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Contrôles avancés */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Barre de recherche */}
          <div className="flex-1 relative max-w-md">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom, matricule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Rechercher par nom, matricule ou ID étudiant"
            />
          </div>

          {/* Mode d'affichage */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              title="Vue tableau"
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              title="Vue grille"
            >
              <Grid className="w-5 h-5" />
            </button>
          </div>

          {/* Tri */}
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              title="Trier par"
            >
              <option value="date">Date</option>
              <option value="name">Nom</option>
              <option value="department">Département</option>
              <option value="status">Statut</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title={`Trier ${sortOrder === 'asc' ? 'décroissant' : 'croissant'}`}
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>
          </div>

          {/* Actions rapides */}
          <div className="flex items-center space-x-2">
            <button
              onClick={selectAllCards}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
              title="Sélectionner toutes les cartes approuvées"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Tout sélectionner</span>
            </button>
            <button
              onClick={clearSelection}
              className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 text-sm"
              title="Effacer la sélection"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Effacer</span>
            </button>
          </div>
        </div>

        {/* Filtres avancés (conditionnels) */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Building className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Filtrer par département"
                >
                  <option value="">Tous les départements</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <GraduationCap className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <select
                  value={filterProgram}
                  onChange={(e) => setFilterProgram(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Filtrer par filière"
                >
                  <option value="">Toutes les filières</option>
                  {programs.map(prog => (
                    <option key={prog} value={prog}>{prog}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Filtrer par année"
                >
                  <option value="">Toutes les années</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Filtrer par statut"
              >
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="approved">Approuvées</option>
                <option value="rejected">Rejetées</option>
              </select>
            </div>
          </div>
        )}

        {/* Actions d'impression */}
        {selectedCards.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">
                    {selectedCards.length} carte{selectedCards.length > 1 ? 's' : ''} sélectionnée{selectedCards.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Prêtes à imprimer</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPreviewModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  title="Prévisualiser les cartes"
                >
                  <Eye className="w-4 h-4" />
                  <span>Prévisualiser</span>
                </button>
                <button
                  onClick={exportToPDF}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                  title="Exporter en PDF"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Exporter PDF</span>
                </button>
                <button
                  onClick={printSelectedCards}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  title="Imprimer les cartes sélectionnées"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer ({selectedCards.length})</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Affichage des cartes */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Étudiant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Département
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de demande
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredAndSortedCards().map((card) => (
                  <tr key={card.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {card.firstname[0]}{card.lastname[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {card.firstname} {card.lastname}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {card.studentid}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{card.department}</div>
                      <div className="text-sm text-gray-500">{card.program}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(card.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(card.status)}`}>
                        {getStatusText(card.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => previewIndividualCard(card)}
                          className="text-blue-600 hover:text-blue-500"
                          title="Voir les détails de la carte"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {card.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateCardStatus(card.id, 'approved')}
                              className="text-green-600 hover:text-green-500"
                              title="Approuver la carte"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateCardStatus(card.id, 'rejected')}
                              className="text-red-600 hover:text-red-500"
                              title="Rejeter la carte"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {card.status === 'approved' && (
                          <button 
                            onClick={() => downloadCardPDF(card)}
                            className="text-purple-600 hover:text-purple-500"
                            title="Télécharger la carte en PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        {card.status === 'approved' && (
                          <input
                            type="checkbox"
                            checked={selectedCards.includes(card.id)}
                            onChange={() => handleCardSelection(card.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            title="Sélectionner pour impression"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getFilteredAndSortedCards().map((card) => (
                <div key={card.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-lg">
                        {card.firstname[0]}{card.lastname[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{card.firstname} {card.lastname}</h3>
                      <p className="text-sm text-gray-500">ID: {card.studentid}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{card.department}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <GraduationCap className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{card.program}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {new Date(card.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(card.status)}`}>
                      {getStatusText(card.status)}
                    </span>
                    {card.status === 'approved' && (
                      <input
                        type="checkbox"
                        checked={selectedCards.includes(card.id)}
                        onChange={() => handleCardSelection(card.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        title="Sélectionner pour impression"
                      />
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => previewIndividualCard(card)}
                      className="flex-1 bg-blue-50 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-100 transition-colors"
                      title="Voir les détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {card.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateCardStatus(card.id, 'approved')}
                          className="flex-1 bg-green-50 text-green-600 px-3 py-1 rounded text-sm hover:bg-green-100 transition-colors"
                          title="Approuver"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateCardStatus(card.id, 'rejected')}
                          className="flex-1 bg-red-50 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-100 transition-colors"
                          title="Rejeter"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {card.status === 'approved' && (
                      <button 
                        onClick={() => downloadCardPDF(card)}
                        className="flex-1 bg-purple-50 text-purple-600 px-3 py-1 rounded text-sm hover:bg-purple-100 transition-colors"
                        title="Télécharger en PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {getFilteredAndSortedCards().length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium mb-2">Aucune carte trouvée</p>
            <p className="text-sm">Essayez de modifier vos critères de recherche ou de filtrage</p>
          </div>
        )}
      </div>

      {/* Modal de prévisualisation */}
      {previewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Prévisualisation des cartes</h2>
                <p className="text-gray-600">
                  {selectedCards.length} carte{selectedCards.length > 1 ? 's' : ''} sélectionnée{selectedCards.length > 1 ? 's' : ''} • 
                  Prêt{selectedCards.length > 1 ? 's' : ''} à imprimer
                </p>
              </div>
              <button 
                onClick={() => setPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Fermer la prévisualisation"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {selectedCards.map((cardId, index) => {
                // Trouver la carte complète dans la liste des cartes
                const fullCard = cards.find(c => c.id === cardId);
                if (!fullCard) return null;
                
                return (
                  <div key={cardId} className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg">
                    {/* En-tête avec numéro de carte */}
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full text-lg font-bold mb-3 shadow-md">
                        {index + 1}
                      </div>
                      <h3 className="font-bold text-xl text-gray-900 mb-2">{fullCard.firstname} {fullCard.lastname}</h3>
                      <p className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full inline-block shadow-sm">
                        Matricule: {fullCard.studentid}
                      </p>
                    </div>
                    
                    {/* Layout en deux colonnes : Informations à gauche, Carte à droite */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Colonne gauche : Informations détaillées */}
                      <div className="space-y-3 text-sm bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-3 text-center">Informations de l'étudiant</h4>
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="font-semibold text-gray-700">Département:</span>
                            <span className="text-gray-900 bg-blue-50 px-2 py-1 rounded text-xs">{fullCard.department}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="font-semibold text-gray-700">Filière:</span>
                            <span className="text-gray-900 bg-purple-50 px-2 py-1 rounded text-xs">{fullCard.program}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="font-semibold text-gray-700">Date de naissance:</span>
                            <span className="text-gray-900 bg-green-50 px-2 py-1 rounded text-xs">
                              {fullCard.dateofbirth || 'Non renseignée'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="font-semibold text-gray-700">Lieu de naissance:</span>
                            <span className="text-gray-900 bg-yellow-50 px-2 py-1 rounded text-xs">
                              {fullCard.placeofbirth || 'Non renseigné'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="font-semibold text-gray-700">Date de création:</span>
                            <span className="text-gray-900 bg-indigo-50 px-2 py-1 rounded text-xs">
                              {new Date(fullCard.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="font-semibold text-gray-700">Statut:</span>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(fullCard.status)}`}>
                              {getStatusText(fullCard.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Colonne droite : Carte d'étudiant */}
                      <div className="flex justify-center items-start">
                        <div className="transform scale-75 origin-top hover:scale-80 transition-transform duration-200">
                          <StudentCardDisplay
                            studentid={fullCard.studentid}
                            firstname={fullCard.firstname}
                            lastname={fullCard.lastname}
                            dateofbirth={fullCard.dateofbirth}
                            placeofbirth={fullCard.placeofbirth}
                            program={fullCard.program}
                            department={fullCard.department}
                            avatar={fullCard.avatar}
                            showQr={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setPreviewModal(false)}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Fermer</span>
              </button>
              <button
                onClick={() => {
                  setPreviewModal(false);
                  setPrintModal(true);
                }}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-lg"
              >
                <Printer className="w-4 h-4" />
                <span>Procéder à l'impression ({selectedCards.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'impression amélioré */}
      {printModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Impression des cartes</h2>
              <button 
                onClick={() => setPrintModal(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Fermer le modal d'impression"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Résumé de l'impression */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Printer className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-blue-800">Résumé de l'impression</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Cartes sélectionnées:</span>
                    <span className="font-bold text-blue-800 ml-2">{selectedCards.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Copies:</span>
                    <span className="font-bold text-blue-800 ml-2">{printSettings.copies}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Format:</span>
                    <span className="font-bold text-blue-800 ml-2">{printSettings.format.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total pages:</span>
                    <span className="font-bold text-blue-800 ml-2">{selectedCards.length * printSettings.copies}</span>
                  </div>
                </div>
              </div>

              {/* Options d'impression avancées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres d'impression</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Format d'impression</label>
                      <select 
                        value={printSettings.format}
                        onChange={(e) => setPrintSettings({...printSettings, format: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Sélectionner le format d'impression"
                      >
                        <option value="a4">A4 - Portrait</option>
                        <option value="a4-landscape">A4 - Paysage</option>
                        <option value="card">Format carte d'identité</option>
                        <option value="batch">Impression par lots</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de copies</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="10"
                        value={printSettings.copies}
                        onChange={(e) => setPrintSettings({...printSettings, copies: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Nombre de copies à imprimer"
                        placeholder="1"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input 
                          type="checkbox"
                          checked={printSettings.includePhoto}
                          onChange={(e) => setPrintSettings({...printSettings, includePhoto: e.target.checked})}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Inclure la photo</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="checkbox"
                          checked={printSettings.includeQR}
                          onChange={(e) => setPrintSettings({...printSettings, includeQR: e.target.checked})}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Inclure le QR code</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
                  <div className="space-y-3">
                    <button
                      onClick={createBatch}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Créer un lot d'impression</span>
                    </button>
                    <button
                      onClick={exportToPDF}
                      className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>Exporter en PDF</span>
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const cardsToPrint = cards.filter(card => selectedCards.includes(card.id));
                          for (const card of cardsToPrint) {
                            await generateCardPDF(card);
                            await new Promise(resolve => setTimeout(resolve, 300));
                          }
                          alert(`${cardsToPrint.length} cartes imprimées avec succès !`);
                          setPrintModal(false);
                        } catch (error) {
                          console.error('Erreur lors de l\'impression:', error);
                          alert('Erreur lors de l\'impression. Vérifiez que les logos sont disponibles.');
                        }
                      }}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Lancer l'impression</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Historique des impressions */}
              {printHistory.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique des impressions</h3>
                  <div className="space-y-2">
                    {printHistory.slice(-5).map((batch, index) => (
                      <div key={batch.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium text-gray-900">{batch.name}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {batch.cards.length} cartes • {new Date(batch.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          batch.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {batch.status === 'completed' ? 'Terminé' : 'En cours'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de prévisualisation individuelle de carte */}
      {cardPreviewModal.open && cardPreviewModal.card && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-[98vw] max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Prévisualisation de la carte</h2>
                <p className="text-gray-600">
                  Détails complets et aperçu de la carte d'étudiant
                </p>
              </div>
              <button 
                onClick={() => setCardPreviewModal({ open: false, card: null })}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Fermer la prévisualisation"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Colonne gauche : Informations détaillées */}
              <div className="space-y-6">
                {/* Informations de l'étudiant */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <Info className="w-6 h-6 text-blue-600" />
                    <span>Informations de l'étudiant</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="font-semibold text-gray-700">Nom complet:</span>
                      <span className="text-gray-900 bg-white px-3 py-1 rounded-lg shadow-sm">
                        {cardPreviewModal.card.firstname} {cardPreviewModal.card.lastname}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="font-semibold text-gray-700">Matricule:</span>
                      <span className="text-gray-900 bg-blue-50 px-3 py-1 rounded-lg text-xs">
                        {(cardPreviewModal.card as any).matricule || cardPreviewModal.card.studentid}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="font-semibold text-gray-700">Département:</span>
                      <span className="text-gray-900 bg-purple-50 px-3 py-1 rounded-lg text-xs">
                        {cardPreviewModal.card.department}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="font-semibold text-gray-700">Filière:</span>
                      <span className="text-gray-900 bg-green-50 px-3 py-1 rounded-lg text-xs">
                        {cardPreviewModal.card.program}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="font-semibold text-gray-700">Date de naissance:</span>
                      <span className="text-gray-900 bg-yellow-50 px-3 py-1 rounded-lg text-xs">
                        {cardPreviewModal.card.dateofbirth || 'Non renseignée'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="font-semibold text-gray-700">Lieu de naissance:</span>
                      <span className="text-gray-900 bg-indigo-50 px-3 py-1 rounded-lg text-xs">
                        {cardPreviewModal.card.placeofbirth || 'Non renseigné'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="font-semibold text-gray-700">Date de création:</span>
                      <span className="text-gray-900 bg-pink-50 px-3 py-1 rounded-lg text-xs">
                        {new Date(cardPreviewModal.card.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-semibold text-gray-700">Statut:</span>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(cardPreviewModal.card.status)}`}>
                        {getStatusText(cardPreviewModal.card.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  {cardPreviewModal.card.status === 'approved' && (
                    <button
                      onClick={() => downloadCardPDF(cardPreviewModal.card!)}
                      className="w-full bg-purple-600 text-white px-6 py-4 rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center space-x-3 shadow-lg text-lg font-semibold"
                      title="Télécharger la carte en PDF"
                    >
                      <Download className="w-6 h-6" />
                      <span>Télécharger PDF</span>
                    </button>
                  )}
                  {cardPreviewModal.card.status === 'pending' && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          updateCardStatus(cardPreviewModal.card!.id, 'approved');
                          setCardPreviewModal({ open: false, card: null });
                        }}
                        className="flex-1 bg-green-600 text-white px-6 py-4 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center space-x-3 shadow-lg text-lg font-semibold"
                      >
                        <Check className="w-6 h-6" />
                        <span>Approuver</span>
                      </button>
                      <button
                        onClick={() => {
                          updateCardStatus(cardPreviewModal.card!.id, 'rejected');
                          setCardPreviewModal({ open: false, card: null });
                        }}
                        className="flex-1 bg-red-600 text-white px-6 py-4 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center space-x-3 shadow-lg text-lg font-semibold"
                      >
                        <X className="w-6 h-6" />
                        <span>Rejeter</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Colonne droite : Carte d'étudiant */}
              <div className="flex flex-col items-center justify-center">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-gray-200 shadow-lg w-full">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center space-x-2">
                    <Eye className="w-6 h-6 text-blue-600" />
                    <span>Aperçu de la carte</span>
                  </h3>
                  <div className="flex justify-center">
                    <div className="transform scale-90 origin-center hover:scale-95 transition-transform duration-200">
                      <StudentCardDisplay
                        studentid={cardPreviewModal.card.studentid}
                        firstname={cardPreviewModal.card.firstname}
                        lastname={cardPreviewModal.card.lastname}
                        dateofbirth={cardPreviewModal.card.dateofbirth}
                        placeofbirth={cardPreviewModal.card.placeofbirth}
                        program={cardPreviewModal.card.program}
                        department={cardPreviewModal.card.department}
                        avatar={cardPreviewModal.card.avatar}
                        showQr={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons d'action en bas */}
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setCardPreviewModal({ open: false, card: null })}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Fermer</span>
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
              <h2 className="text-2xl font-bold text-gray-800">Statistiques détaillées des cartes</h2>
              <button 
                onClick={() => setStatsModal(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Fermer les statistiques"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {(() => {
              const stats = getDetailedCardStats();
              return (
                <div className="space-y-8">
                  {/* Vue d'ensemble */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600">Total cartes</p>
                          <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
                        </div>
                        <CreditCard className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600">Approuvées</p>
                          <p className="text-2xl font-bold text-green-800">{stats.approved}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-orange-600">Impressions</p>
                          <p className="text-2xl font-bold text-orange-800">{stats.totalPrinted}</p>
                        </div>
                        <Printer className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-yellow-600">Taux d'approbation</p>
                          <p className="text-2xl font-bold text-yellow-800">{stats.approvalRate}%</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-yellow-600" />
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-600">Aujourd'hui</p>
                          <p className="text-2xl font-bold text-purple-800">{stats.todayCards}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-purple-600" />
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
                            <p className="text-xs text-blue-600">cartes</p>
                          </div>
                          {day.approved > 0 && (
                            <div className="bg-green-100 rounded p-1 mt-1">
                              <p className="text-xs font-bold text-green-800">{day.approved}</p>
                              <p className="text-xs text-green-600">approuvées</p>
                            </div>
                          )}
                          {day.printed > 0 && (
                            <div className="bg-orange-100 rounded p-1 mt-1">
                              <p className="text-xs font-bold text-orange-800">{day.printed}</p>
                              <p className="text-xs text-orange-600">imprimées</p>
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
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            <span className="text-sm">Approuvées</span>
                          </div>
                          <span className="font-semibold text-green-600">{stats.approved}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <span className="text-sm">En attente</span>
                          </div>
                          <span className="font-semibold text-yellow-600">{stats.pending}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <span className="text-sm">Rejetées</span>
                          </div>
                          <span className="font-semibold text-red-600">{stats.rejected}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top départements</h3>
                      <div className="space-y-3">
                        {stats.topDepartments.map(([dept, count], index) => (
                          <div key={dept} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                              <span className="text-sm">{dept}</span>
                            </div>
                            <span className="font-semibold text-blue-600">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Répartition par programme et année */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top programmes</h3>
                      <div className="space-y-3">
                        {stats.topPrograms.map(([prog, count], index) => (
                          <div key={prog} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                              <span className="text-sm">{prog}</span>
                            </div>
                            <span className="font-semibold text-purple-600">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par année</h3>
                      <div className="space-y-3">
                        {Object.entries(stats.yearStats).map(([year, count]) => (
                          <div key={year} className="flex items-center justify-between">
                            <span className="text-sm">{year}</span>
                            <span className="font-semibold text-indigo-600">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Métriques de performance */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Métriques de performance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{stats.approvalRate}%</p>
                        <p className="text-sm text-gray-600">Taux d'approbation</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.avgProcessingTime}h</p>
                        <p className="text-sm text-gray-600">Temps moyen de traitement</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{stats.todayCards}</p>
                        <p className="text-sm text-gray-600">Cartes créées aujourd'hui</p>
                      </div>
                    </div>
                  </div>

                  {/* Statistiques d'impression */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Printer className="w-6 h-6 text-orange-600" />
                      <span>Statistiques d'impression</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-orange-600">{stats.totalPrinted}</p>
                        <p className="text-sm text-gray-600">Total imprimées</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-600">{stats.todayPrinted}</p>
                        <p className="text-sm text-gray-600">Imprimées aujourd'hui</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-blue-600">{stats.approved}</p>
                        <p className="text-sm text-gray-600">Cartes approuvées</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-purple-600">{stats.approved - stats.totalPrinted}</p>
                        <p className="text-sm text-gray-600">En attente d'impression</p>
                      </div>
                    </div>
                    
                    {/* Graphique d'impression par jour */}
                    <div className="mt-6">
                      <h4 className="text-md font-semibold text-gray-800 mb-3">Impressions des 7 derniers jours</h4>
                      <div className="grid grid-cols-7 gap-2">
                        {stats.dailyStats.map((day, index) => (
                          <div key={index} className="text-center">
                            <p className="text-xs text-gray-600 mb-1">{day.date}</p>
                            <div className="bg-orange-100 rounded p-2">
                              <p className="text-sm font-bold text-orange-800">{day.printed}</p>
                              <p className="text-xs text-orange-600">imprimées</p>
                            </div>
                          </div>
                        ))}
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

export default AdminCards;
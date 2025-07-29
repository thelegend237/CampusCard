import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card, User } from '../types';
import { Search, Filter, Printer, Download, Eye, FileText, Users, Building } from 'lucide-react';

interface CardWithUser extends Card {
  users: User;
}

const AdminPrintCards: React.FC = () => {
  const [cards, setCards] = useState<CardWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [programs, setPrograms] = useState<string[]>([]);
  const [printMode, setPrintMode] = useState<'single' | 'batch'>('single');

  console.log('🚀 AdminPrintCards - Composant chargé');

  useEffect(() => {
    console.log('📋 AdminPrintCards - Début du chargement des cartes');
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      console.log('🔍 AdminPrintCards - Récupération des cartes...');
      
      const { data, error } = await supabase
        .from('cards')
        .select(`
          *,
          users (
            id,
            firstname,
            lastname,
            email,
            matricule,
            department,
            program,
            avatar,
            phone,
            dateofbirth,
            placeofbirth
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ AdminPrintCards - Erreur lors de la récupération:', error);
        setError('Erreur lors du chargement des cartes');
        return;
      }

      console.log('✅ AdminPrintCards - Cartes récupérées:', data?.length || 0);
      setCards(data || []);

      // Extraire les départements et programmes uniques
      const uniqueDepartments = [...new Set(data?.map(card => card.department).filter(Boolean))];
      const uniquePrograms = [...new Set(data?.map(card => card.program).filter(Boolean))];
      
      setDepartments(uniqueDepartments);
      setPrograms(uniquePrograms);
    } catch (err) {
      console.error('❌ AdminPrintCards - Erreur inattendue:', err);
      setError('Erreur inattendue');
    } finally {
      setLoading(false);
    }
  };

  // Filtrage et recherche
  const filteredCards = cards.filter(card => {
    const matchesSearch = 
      card.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.studentid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.users?.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.program?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || card.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || card.department === departmentFilter;
    const matchesProgram = programFilter === 'all' || card.program === programFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesProgram;
  });

  // Statistiques
  const stats = {
    total: cards.length,
    pending: cards.filter(c => c.status === 'pending').length,
    approved: cards.filter(c => c.status === 'approved').length,
    rejected: cards.filter(c => c.status === 'rejected').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const handleCardSelection = (cardId: string) => {
    setSelectedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCards.length === filteredCards.length) {
      setSelectedCards([]);
    } else {
      setSelectedCards(filteredCards.map(card => card.id));
    }
  };

  const printCard = (card: CardWithUser) => {
    // Créer une URL d'impression spécifique à l'admin
    const printUrl = `/admin/print-card?cardId=${card.id}&mode=pdf`;
    window.open(printUrl, '_blank');
  };

  const printSelectedCards = () => {
    if (selectedCards.length === 0) {
      alert('Veuillez sélectionner au moins une carte à imprimer');
      return;
    }

    // Ouvrir les cartes sélectionnées dans de nouveaux onglets
    selectedCards.forEach(cardId => {
      const printUrl = `/admin/print-card?cardId=${cardId}&mode=pdf`;
      window.open(printUrl, '_blank');
    });
  };

  const downloadCardsList = () => {
    const csvContent = [
      ['Matricule', 'Nom', 'Prénom', 'Département', 'Programme', 'Statut', 'Date de création'],
      ...filteredCards.map(card => [
        card.users?.matricule || card.studentid || '',
        card.lastname || '',
        card.firstname || '',
        card.department || '',
        card.program || '',
        getStatusText(card.status),
        new Date(card.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cartes_etudiants_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Impression des cartes d'étudiants</h1>
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
            onClick={fetchCards}
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
            <h1 className="text-2xl font-bold mb-2">Impression des cartes d'étudiants</h1>
            <p className="text-blue-100">
              {stats.total} carte{stats.total !== 1 ? 's' : ''} disponible{stats.total !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.pending}</div>
              <div className="text-sm text-blue-100">En attente</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.approved}</div>
              <div className="text-sm text-blue-100">Approuvées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.rejected}</div>
              <div className="text-sm text-blue-100">Rejetées</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom, matricule, département..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Filtrer par statut"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvées</option>
              <option value="rejected">Rejetées</option>
            </select>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Filtrer par département"
            >
              <option value="all">Tous les départements</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Filtrer par programme"
            >
              <option value="all">Tous les programmes</option>
              {programs.map(prog => (
                <option key={prog} value={prog}>{prog}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Actions d'impression */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                                    <input
                        type="checkbox"
                        checked={selectedCards.length === filteredCards.length && filteredCards.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                        title="Sélectionner toutes les cartes affichées"
                      />
              <span className="text-sm text-gray-600">
                {selectedCards.length} sur {filteredCards.length} sélectionnée{selectedCards.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadCardsList}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              <Download className="w-4 h-4" />
              Exporter la liste
            </button>
            <button
              onClick={printSelectedCards}
              disabled={selectedCards.length === 0}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              Imprimer sélection ({selectedCards.length})
            </button>
          </div>
        </div>
      </div>

      {/* Liste des cartes */}
      {filteredCards.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune carte trouvée avec les critères actuels.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDepartmentFilter('all');
                setProgramFilter('all');
              }}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sélection
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Étudiant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Matricule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Département
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Programme
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCards.map((card) => (
                  <tr key={card.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedCards.includes(card.id)}
                        onChange={() => handleCardSelection(card.id)}
                        className="rounded border-gray-300"
                        title={`Sélectionner la carte de ${card.firstname} ${card.lastname}`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {card.avatar ? (
                            <img className="h-10 w-10 rounded-full" src={card.avatar} alt="Avatar" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <Users className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {card.firstname} {card.lastname}
                          </div>
                          <div className="text-sm text-gray-500">{card.users?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {card.users?.matricule || card.studentid || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 text-gray-400 mr-2" />
                        {card.department}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {card.program}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(card.status)}`}>
                        {getStatusText(card.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(card.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => printCard(card)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Imprimer cette carte"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(`/student/card-view?cardId=${card.id}`, '_blank')}
                          className="text-green-600 hover:text-green-900"
                          title="Voir cette carte"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPrintCards; 
import { supabase } from '../lib/supabase';
import { Card, User } from '../types';
import { Search, Filter, Printer, Download, Eye, FileText, Users, Building } from 'lucide-react';

interface CardWithUser extends Card {
  users: User;
}

const AdminPrintCards: React.FC = () => {
  const [cards, setCards] = useState<CardWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [programs, setPrograms] = useState<string[]>([]);
  const [printMode, setPrintMode] = useState<'single' | 'batch'>('single');

  console.log('🚀 AdminPrintCards - Composant chargé');

  useEffect(() => {
    console.log('📋 AdminPrintCards - Début du chargement des cartes');
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      console.log('🔍 AdminPrintCards - Récupération des cartes...');
      
      const { data, error } = await supabase
        .from('cards')
        .select(`
          *,
          users (
            id,
            firstname,
            lastname,
            email,
            matricule,
            department,
            program,
            avatar,
            phone,
            dateofbirth,
            placeofbirth
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ AdminPrintCards - Erreur lors de la récupération:', error);
        setError('Erreur lors du chargement des cartes');
        return;
      }

      console.log('✅ AdminPrintCards - Cartes récupérées:', data?.length || 0);
      setCards(data || []);

      // Extraire les départements et programmes uniques
      const uniqueDepartments = [...new Set(data?.map(card => card.department).filter(Boolean))];
      const uniquePrograms = [...new Set(data?.map(card => card.program).filter(Boolean))];
      
      setDepartments(uniqueDepartments);
      setPrograms(uniquePrograms);
    } catch (err) {
      console.error('❌ AdminPrintCards - Erreur inattendue:', err);
      setError('Erreur inattendue');
    } finally {
      setLoading(false);
    }
  };

  // Filtrage et recherche
  const filteredCards = cards.filter(card => {
    const matchesSearch = 
      card.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.studentid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.users?.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.program?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || card.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || card.department === departmentFilter;
    const matchesProgram = programFilter === 'all' || card.program === programFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesProgram;
  });

  // Statistiques
  const stats = {
    total: cards.length,
    pending: cards.filter(c => c.status === 'pending').length,
    approved: cards.filter(c => c.status === 'approved').length,
    rejected: cards.filter(c => c.status === 'rejected').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const handleCardSelection = (cardId: string) => {
    setSelectedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCards.length === filteredCards.length) {
      setSelectedCards([]);
    } else {
      setSelectedCards(filteredCards.map(card => card.id));
    }
  };

  const printCard = (card: CardWithUser) => {
    // Créer une URL d'impression spécifique à l'admin
    const printUrl = `/admin/print-card?cardId=${card.id}&mode=pdf`;
    window.open(printUrl, '_blank');
  };

  const printSelectedCards = () => {
    if (selectedCards.length === 0) {
      alert('Veuillez sélectionner au moins une carte à imprimer');
      return;
    }

    // Ouvrir les cartes sélectionnées dans de nouveaux onglets
    selectedCards.forEach(cardId => {
      const printUrl = `/admin/print-card?cardId=${cardId}&mode=pdf`;
      window.open(printUrl, '_blank');
    });
  };

  const downloadCardsList = () => {
    const csvContent = [
      ['Matricule', 'Nom', 'Prénom', 'Département', 'Programme', 'Statut', 'Date de création'],
      ...filteredCards.map(card => [
        card.users?.matricule || card.studentid || '',
        card.lastname || '',
        card.firstname || '',
        card.department || '',
        card.program || '',
        getStatusText(card.status),
        new Date(card.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cartes_etudiants_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Impression des cartes d'étudiants</h1>
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
            onClick={fetchCards}
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
            <h1 className="text-2xl font-bold mb-2">Impression des cartes d'étudiants</h1>
            <p className="text-blue-100">
              {stats.total} carte{stats.total !== 1 ? 's' : ''} disponible{stats.total !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.pending}</div>
              <div className="text-sm text-blue-100">En attente</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.approved}</div>
              <div className="text-sm text-blue-100">Approuvées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.rejected}</div>
              <div className="text-sm text-blue-100">Rejetées</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom, matricule, département..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Filtrer par statut"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvées</option>
              <option value="rejected">Rejetées</option>
            </select>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Filtrer par département"
            >
              <option value="all">Tous les départements</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Filtrer par programme"
            >
              <option value="all">Tous les programmes</option>
              {programs.map(prog => (
                <option key={prog} value={prog}>{prog}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Actions d'impression */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                                    <input
                        type="checkbox"
                        checked={selectedCards.length === filteredCards.length && filteredCards.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                        title="Sélectionner toutes les cartes affichées"
                      />
              <span className="text-sm text-gray-600">
                {selectedCards.length} sur {filteredCards.length} sélectionnée{selectedCards.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadCardsList}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              <Download className="w-4 h-4" />
              Exporter la liste
            </button>
            <button
              onClick={printSelectedCards}
              disabled={selectedCards.length === 0}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              Imprimer sélection ({selectedCards.length})
            </button>
          </div>
        </div>
      </div>

      {/* Liste des cartes */}
      {filteredCards.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune carte trouvée avec les critères actuels.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDepartmentFilter('all');
                setProgramFilter('all');
              }}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sélection
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Étudiant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Matricule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Département
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Programme
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCards.map((card) => (
                  <tr key={card.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedCards.includes(card.id)}
                        onChange={() => handleCardSelection(card.id)}
                        className="rounded border-gray-300"
                        title={`Sélectionner la carte de ${card.firstname} ${card.lastname}`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {card.avatar ? (
                            <img className="h-10 w-10 rounded-full" src={card.avatar} alt="Avatar" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <Users className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {card.firstname} {card.lastname}
                          </div>
                          <div className="text-sm text-gray-500">{card.users?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {card.users?.matricule || card.studentid || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 text-gray-400 mr-2" />
                        {card.department}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {card.program}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(card.status)}`}>
                        {getStatusText(card.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(card.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => printCard(card)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Imprimer cette carte"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(`/student/card-view?cardId=${card.id}`, '_blank')}
                          className="text-green-600 hover:text-green-900"
                          title="Voir cette carte"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPrintCards; 
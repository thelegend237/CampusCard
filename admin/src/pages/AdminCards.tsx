import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../../../src/types';
import { Search, Filter, Download, Check, X, Eye, Calendar } from 'lucide-react';

const AdminCards: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

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

      console.log('Cartes récupérées:', data); // Ajout du console.log

      if (error) throw error;
      setCards(data || []);
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
      card.studentid.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === '' || card.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

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
      case 'approved':
        return 'Approuvée';
      case 'pending':
        return 'En attente';
      case 'rejected':
        return 'Rejetée';
      default:
        return 'Inconnu';
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
        <h1 className="text-2xl font-bold mb-2">Gestion des cartes</h1>
        <p className="text-blue-100">Gérez les demandes de cartes d'étudiant</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom ou ID étudiant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvées</option>
            <option value="rejected">Rejetées</option>
          </select>
        </div>
      </div>

      {/* Cards Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
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
              {filteredCards.map((card) => (
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
                      <button className="text-blue-600 hover:text-blue-500">
                        <Eye className="w-4 h-4" />
                      </button>
                      {card.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateCardStatus(card.id, 'approved')}
                            className="text-green-600 hover:text-green-500"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateCardStatus(card.id, 'rejected')}
                            className="text-red-600 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {card.status === 'approved' && (
                        <button className="text-purple-600 hover:text-purple-500">
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCards.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Aucune carte trouvée</p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total cartes</h3>
          <p className="text-3xl font-bold text-blue-600">{cards.length}</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">En attente</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {cards.filter(c => c.status === 'pending').length}
          </p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Approuvées</h3>
          <p className="text-3xl font-bold text-green-600">
            {cards.filter(c => c.status === 'approved').length}
          </p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Rejetées</h3>
          <p className="text-3xl font-bold text-red-600">
            {cards.filter(c => c.status === 'rejected').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminCards;
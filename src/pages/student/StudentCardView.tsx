// Pour React Router :
// <Route path="/student/card-view" element={<StudentCardView />} />
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../../types';
import { ArrowLeftRight } from 'lucide-react';
import './StudentCardView.module.css';

const StudentCardView: React.FC = () => {
  const { user } = useAuth();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBack, setIsBack] = useState(false);

  useEffect(() => {
    const fetchCard = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('userid', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      if (!error && data && data.length > 0) {
        setCard(data[0]);
      }
      setLoading(false);
    };
    fetchCard();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="max-w-xl mx-auto mt-12 bg-gray-800 rounded-2xl p-8 text-white text-center">
        Aucune carte trouvée.
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-12">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Ma carte d'étudiant</h1>
      <div className="flex flex-col items-center">
        <div className="relative w-96 h-56 mb-4 perspective">
          <div className={`transition-transform duration-500 w-full h-full ${isBack ? 'rotate-y-180' : ''}`}
            style={{ transformStyle: 'preserve-3d' }}>
            {/* Recto */}
            <div className={`absolute w-full h-full backface-hidden bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white flex flex-col justify-between ${isBack ? 'invisible' : 'visible'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold">IUT de Douala</h3>
                <span className="text-sm">ID: #{card.studentid}</span>
              </div>
              <p className="text-sm mb-2">Carte d'étudiant 2025-2026</p>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                  {card.avatar ? (
                    <img src={card.avatar} alt="Avatar" className="w-16 h-16 object-cover" />
                  ) : (
                    <span className="text-2xl">👤</span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{card.firstname} {card.lastname}</h4>
                  <p className="text-sm opacity-90">{card.program}</p>
                  <p className="text-xs opacity-75">Département: {card.department}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs">
                  <p>Valide jusqu'au: {card.expirydate ? new Date(card.expirydate).toLocaleDateString('fr-FR') : ''}</p>
                </div>
                <div className="bg-white/20 rounded p-2">
                  <div className="w-8 h-8 bg-white/30 rounded"></div>
                </div>
              </div>
            </div>
            {/* Verso */}
            <div className={`absolute w-full h-full backface-hidden bg-gray-900 rounded-xl p-6 text-white flex flex-col justify-between rotate-y-180 ${isBack ? 'visible' : 'invisible'}`}>
              <div>
                <h3 className="text-lg font-bold mb-2">Informations complémentaires</h3>
                <p className="text-sm">Nom: {card.lastname}</p>
                <p className="text-sm">Prénom: {card.firstname}</p>
                <p className="text-sm">Département: {card.department}</p>
                <p className="text-sm">Programme: {card.program}</p>
                <p className="text-sm">ID étudiant: {card.studentid}</p>
              </div>
              <div className="text-xs text-gray-300 mt-4">
                <p>Date d'émission: {card.issueddate ? new Date(card.issueddate).toLocaleDateString('fr-FR') : ''}</p>
                <p>Date d'expiration: {card.expirydate ? new Date(card.expirydate).toLocaleDateString('fr-FR') : ''}</p>
                <p className="mt-2">CampusCard - IUT de Douala</p>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsBack((prev) => !prev)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <ArrowLeftRight className="w-5 h-5" />
          {isBack ? 'Voir le recto' : 'Voir le verso'}
        </button>
      </div>
    </div>
  );
};

export default StudentCardView; 
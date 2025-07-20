// Pour React Router :
// <Route path="/student/card-view" element={<StudentCardView />} />
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../../types';
import { ArrowLeftRight } from 'lucide-react';
import './StudentCardView.module.css';
import Header from '../../components/Layout/Header';
import Sidebar from '../../components/Layout/Sidebar';
import QRCode from 'qrcode';
import { generateCardPDF } from '../../utils/pdfGenerator';
import { useNavigate } from 'react-router-dom';

const StudentCardView: React.FC = () => {
  const { user } = useAuth();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBack, setIsBack] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [iconAnimated, setIconAnimated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCard = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('cards')
        .select('*, user:userid (firstname, lastname, dateofbirth, placeofbirth, department, program, avatar)')
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

  useEffect(() => {
    if (card?.studentid) {
      QRCode.toDataURL(card.studentid)
        .then(url => setQrDataUrl(url))
        .catch(() => setQrDataUrl(null));
    }
  }, [card]);

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
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Ma carte d'étudiant</h1>
      <div className="flex flex-col items-center">
            <div className="relative w-[420px] h-[260px] mb-4">
          <div className={`transition-transform duration-700 w-full h-full ${isBack ? 'rotate-y-180' : ''}`}
            style={{ transformStyle: 'preserve-3d' }}>
                {/* Recto - identique au PDF */}
                <div className={`absolute w-full h-full backface-hidden bg-white rounded-xl shadow-xl ${isBack ? 'invisible' : 'visible'}`}
                  style={{
                    background: 'linear-gradient(135deg, #f8fafc 60%, #e3eafc 100%)',
                    borderRadius: '18px',
                    boxShadow: '0 4px 18px rgba(0,0,0,0.10)',
                    border: '1.5px solid #003366',
                    padding: 0,
                    color: '#1a202c',
                    fontFamily: "'Segoe UI', 'Roboto', Arial, sans-serif",
                    position: 'absolute',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    width: '420px',
                    height: '260px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 6px 16px', background: '#fff', borderBottom: '1px solid #e3eafc' }}>
                    <img src="/logo-iut.png" alt="Logo" style={{ height: 38 }} crossOrigin="anonymous" />
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: 15, letterSpacing: 0.5 }}>UNIVERSITE DE DOUALA</div>
                      <div style={{ fontSize: 12, marginTop: 1 }}>INSTITUT UNIVERSITAIRE DE TECHNOLOGIE</div>
                      <div style={{ fontSize: 10, color: '#2563eb', marginTop: 1 }}>CARTE D'ETUDIANT - {new Date().getFullYear()}/{new Date().getFullYear() + 1}</div>
              </div>
                    <img src="/logo-iut2.png" alt="Logo" style={{ height: 38 }} crossOrigin="anonymous" />
                </div>
                  <div style={{ display: 'flex', flex: 1, padding: '10px 16px 0 16px', gap: 10, minHeight: 0 }}>
                    <div style={{ flex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', rowGap: 4, columnGap: 12, alignItems: 'center' }}>
                        <div style={{ fontSize: 12, fontWeight: 'bold' }}>Matricule :</div>
                        <div style={{ fontSize: 12 }}>{card.studentid}</div>
                        <div style={{ fontSize: 12, fontWeight: 'bold' }}>Nom et Prénom :</div>
                        <div style={{ fontSize: 12 }}>{card.lastname} {card.firstname}</div>
                        <div style={{ fontSize: 12, fontWeight: 'bold' }}>Né(e) le :</div>
                        <div style={{ fontSize: 12 }}>{card.dateofbirth || ''}</div>
                        <div style={{ fontSize: 12, fontWeight: 'bold' }}>Lieu de Naissance :</div>
                        <div style={{ fontSize: 12 }}>{card.placeofbirth || ''}</div>
                        <div style={{ fontSize: 12, fontWeight: 'bold' }}>Filière :</div>
                        <div style={{ fontSize: 12 }}>{card.program}</div>
                </div>
              </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: 6, minWidth: 0 }}>
                      <div style={{ width: 64, height: 72, background: '#e3eafc', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}>
                        {card.user.avatar ? (
                          <img src={card.user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
                        ) : ''}
                </div>
                      {qrDataUrl && (
                        <img src={qrDataUrl} alt="QR Code" style={{ width: 48, height: 48, borderRadius: 6, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 2 }} />
                      )}
                      <div style={{ fontSize: 10, color: '#2563eb', fontStyle: 'italic', letterSpacing: 0.5, marginTop: 2, textAlign: 'center' }}>Visa Directeur</div>
                </div>
              </div>
            </div>
                {/* Verso - simple infos de contact */}
                <div className={`absolute w-full h-full backface-hidden bg-gray-900 rounded-xl p-6 text-white flex flex-col justify-between rotate-y-180 ${isBack ? 'visible' : 'invisible'}`}
                  style={{ width: '420px', height: '260px' }}>
              <div>
                    <h3 className="text-lg font-bold mb-2">En cas de perte</h3>
                    <p className="text-sm">Nom : {card.lastname}</p>
                    <p className="text-sm">Prénom : {card.firstname}</p>
                    {user?.phone && <p className="text-sm">Téléphone : {user.phone}</p>}
                    {user?.email && <p className="text-sm">Email : {user.email}</p>}
                    <p className="text-sm">ID étudiant : {card.studentid}</p>
              </div>
              <div className="text-xs text-gray-300 mt-4">
                    <p>Si vous trouvez cette carte, merci de contacter le propriétaire ou l'administration de l'IUT de Douala.</p>
                <p className="mt-2">CampusCard - IUT de Douala</p>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setIsBack((prev) => !prev);
            setIconAnimated(true);
            setTimeout(() => setIconAnimated(false), 600);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <ArrowLeftRight
            className={`w-5 h-5 transition-transform duration-500 ${iconAnimated ? 'animate-spin' : ''}`}
          />
          {isBack ? 'Voir le recto' : 'Voir le verso'}
        </button>
            <div className="flex flex-row gap-4 mt-4">
              <button
                onClick={() => generateCardPDF(card)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Télécharger ma carte
              </button>
              <button
                onClick={async () => {
                  if (!user) return;
                  if (window.confirm('Voulez-vous vraiment supprimer votre carte ?')) {
                    // Supprime le paiement lié à la carte
                    await supabase.from('payments').delete().eq('cardid', card.id);
                    // Supprime la carte
                    const { error } = await supabase.from('cards').delete().eq('id', card.id);
                    if (error) {
                      alert('Erreur lors de la suppression de la carte');
                      return;
                    }
                    setCard(null);
                    navigate('/dashboard');
                  }
                }}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Supprimer ma carte
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentCardView; 
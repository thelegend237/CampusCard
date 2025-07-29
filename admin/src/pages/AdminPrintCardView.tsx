import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, User } from '../types';
import { Printer, ArrowLeft, Download, ArrowLeftRight } from 'lucide-react';
import QRCode from 'qrcode';

interface CardWithUser extends Card {
  users: User;
}

const AdminPrintCardView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [card, setCard] = useState<CardWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBack, setIsBack] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [iconAnimated, setIconAnimated] = useState(false);
  
  const cardId = searchParams.get('cardId');
  const mode = searchParams.get('mode');

  console.log('🚀 AdminPrintCardView - Composant chargé', { cardId, mode });

  useEffect(() => {
    if (cardId) {
      fetchCard(cardId);
    }
  }, [cardId]);

  useEffect(() => {
    if (card?.studentid) {
      QRCode.toDataURL(card.studentid)
        .then(url => setQrDataUrl(url))
        .catch(() => setQrDataUrl(null));
    }
  }, [card]);

  const fetchCard = async (id: string) => {
    try {
      console.log('🔍 AdminPrintCardView - Récupération de la carte:', id);
      
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
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ AdminPrintCardView - Erreur lors de la récupération:', error);
        setError('Erreur lors du chargement de la carte');
        return;
      }

      console.log('✅ AdminPrintCardView - Carte récupérée:', data);
      
      // Si l'avatar existe, obtenir l'URL complète depuis Supabase Storage
      if (data.users?.avatar && !data.users.avatar.startsWith('http')) {
        try {
          console.log('🔍 AdminPrintCardView - Récupération de l\'URL de l\'avatar:', data.users.avatar);
          const { data: avatarUrl, error: avatarError } = supabase.storage
            .from('avatar')
            .getPublicUrl(data.users.avatar);
          
          if (avatarError) {
            console.error('❌ AdminPrintCardView - Erreur lors de la récupération de l\'URL avatar:', avatarError);
          } else {
            console.log('✅ AdminPrintCardView - URL avatar générée:', avatarUrl.publicUrl);
            data.users.avatar = avatarUrl.publicUrl;
          }
        } catch (err) {
          console.error('❌ AdminPrintCardView - Erreur inattendue lors de la récupération de l\'avatar:', err);
        }
      } else if (data.users?.avatar) {
        console.log('✅ AdminPrintCardView - Avatar déjà avec URL complète:', data.users.avatar);
      } else {
        console.log('ℹ️ AdminPrintCardView - Aucun avatar trouvé pour cet utilisateur');
      }
      
      setCard(data);
    } catch (err) {
      console.error('❌ AdminPrintCardView - Erreur inattendue:', err);
      setError('Erreur inattendue');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Logique de téléchargement PDF (à implémenter si nécessaire)
    console.log('Téléchargement de la carte:', card?.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Erreur :</strong> {error || 'Carte non trouvée'}
          </div>
          <button
            onClick={() => window.close()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header d'impression (visible seulement à l'écran) */}
      <div className="print:hidden bg-white shadow-sm p-4 border-b">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.close()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Impression - Carte d'étudiant
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              <Download className="w-4 h-4" />
              Télécharger
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <Printer className="w-4 h-4" />
              Imprimer
            </button>
          </div>
        </div>
      </div>

      {/* Contenu de la carte (visible à l'écran et à l'impression) */}
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 print:hidden">
            Carte d'étudiant - {card.firstname} {card.lastname}
          </h1>
          
          <div className="flex flex-col items-center w-full max-w-full">
            <div className="relative w-full max-w-[420px] h-[260px] mb-4">
              <div className={`transition-transform duration-700 w-full h-full ${isBack ? 'rotate-y-180' : ''}`}
                style={{ transformStyle: 'preserve-3d' }}>
                
                {/* Recto - identique au StudentCardView */}
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
                    <img 
                      src="/logo-iut.png" 
                      alt="Logo IUT" 
                      style={{ height: 38 }} 
                      crossOrigin="anonymous"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: 15, letterSpacing: 0.5 }}>UNIVERSITE DE DOUALA</div>
                      <div style={{ fontSize: 12, marginTop: 1 }}>INSTITUT UNIVERSITAIRE DE TECHNOLOGIE</div>
                      <div style={{ fontSize: 10, color: '#2563eb', marginTop: 1 }}>CARTE D'ETUDIANT - {new Date().getFullYear()}/{new Date().getFullYear() + 1}</div>
                    </div>
                    <img 
                      src="/logo-iut2.png" 
                      alt="Logo IUT 2" 
                      style={{ height: 38 }} 
                      crossOrigin="anonymous"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
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
                        {card.users?.avatar ? (
                          <img 
                            src={card.users.avatar} 
                            alt="Avatar étudiant" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            crossOrigin="anonymous"
                            onError={(e) => {
                              // Si l'image ne charge pas, on cache l'élément
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div style={{ 
                            width: '100%', 
                            height: '100%', 
                            background: '#e3eafc', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '12px',
                            color: '#2563eb',
                            fontWeight: 'bold'
                          }}>
                            PHOTO
                          </div>
                        )}
                      </div>
                      {qrDataUrl && (
                        <img src={qrDataUrl} alt="QR Code étudiant" style={{ width: 48, height: 48, borderRadius: 6, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 2 }} />
                      )}
                      <div style={{ fontSize: 10, color: '#2563eb', fontStyle: 'italic', letterSpacing: 0.5, marginTop: 2, textAlign: 'center' }}>Visa Directeur</div>
                    </div>
                  </div>
                </div>
                
                {/* Verso - identique au StudentCardView */}
                <div className={`absolute w-full h-full backface-hidden bg-gray-900 rounded-xl p-6 text-white flex flex-col justify-between rotate-y-180 ${isBack ? 'visible' : 'invisible'}`}
                  style={{ width: '420px', height: '260px' }}>
                  <div>
                    <h3 className="text-lg font-bold mb-2">En cas de perte</h3>
                    <p className="text-sm">Nom : {card.lastname}</p>
                    <p className="text-sm">Prénom : {card.firstname}</p>
                    {card.users?.phone && <p className="text-sm">Téléphone : {card.users.phone}</p>}
                    {card.users?.email && <p className="text-sm">Email : {card.users.email}</p>}
                    <p className="text-sm">ID étudiant : {card.studentid}</p>
                  </div>
                  <div className="text-xs text-gray-300 mt-4">
                    <p>Si vous trouvez cette carte, merci de contacter le propriétaire ou l'administration de l'IUT de Douala.</p>
                    <p className="mt-2">CampusCard - IUT de Douala</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bouton retourner la carte (visible seulement à l'écran) */}
            <button
              onClick={() => {
                setIsBack((prev) => !prev);
                setIconAnimated(true);
                setTimeout(() => setIconAnimated(false), 600);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors mt-2 print:hidden"
              title="Retourner la carte"
            >
              <ArrowLeftRight
                className={`w-5 h-5 transition-transform duration-500 ${iconAnimated ? 'animate-spin' : ''}`}
              />
              {isBack ? 'Voir le recto' : 'Voir le verso'}
            </button>
          </div>
        </div>
      </div>

      {/* Styles d'impression */}
      <style jsx>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .bg-gray-100 {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminPrintCardView; 
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, User } from '../types';
import { Printer, ArrowLeft, Download, ArrowLeftRight } from 'lucide-react';
import QRCode from 'qrcode';

interface CardWithUser extends Card {
  users: User;
}

const AdminPrintCardView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [card, setCard] = useState<CardWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBack, setIsBack] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [iconAnimated, setIconAnimated] = useState(false);
  
  const cardId = searchParams.get('cardId');
  const mode = searchParams.get('mode');

  console.log('🚀 AdminPrintCardView - Composant chargé', { cardId, mode });

  useEffect(() => {
    if (cardId) {
      fetchCard(cardId);
    }
  }, [cardId]);

  useEffect(() => {
    if (card?.studentid) {
      QRCode.toDataURL(card.studentid)
        .then(url => setQrDataUrl(url))
        .catch(() => setQrDataUrl(null));
    }
  }, [card]);

  const fetchCard = async (id: string) => {
    try {
      console.log('🔍 AdminPrintCardView - Récupération de la carte:', id);
      
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
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ AdminPrintCardView - Erreur lors de la récupération:', error);
        setError('Erreur lors du chargement de la carte');
        return;
      }

      console.log('✅ AdminPrintCardView - Carte récupérée:', data);
      
      // Si l'avatar existe, obtenir l'URL complète depuis Supabase Storage
      if (data.users?.avatar && !data.users.avatar.startsWith('http')) {
        try {
          console.log('🔍 AdminPrintCardView - Récupération de l\'URL de l\'avatar:', data.users.avatar);
          const { data: avatarUrl, error: avatarError } = supabase.storage
            .from('avatar')
            .getPublicUrl(data.users.avatar);
          
          if (avatarError) {
            console.error('❌ AdminPrintCardView - Erreur lors de la récupération de l\'URL avatar:', avatarError);
          } else {
            console.log('✅ AdminPrintCardView - URL avatar générée:', avatarUrl.publicUrl);
            data.users.avatar = avatarUrl.publicUrl;
          }
        } catch (err) {
          console.error('❌ AdminPrintCardView - Erreur inattendue lors de la récupération de l\'avatar:', err);
        }
      } else if (data.users?.avatar) {
        console.log('✅ AdminPrintCardView - Avatar déjà avec URL complète:', data.users.avatar);
      } else {
        console.log('ℹ️ AdminPrintCardView - Aucun avatar trouvé pour cet utilisateur');
      }
      
      setCard(data);
    } catch (err) {
      console.error('❌ AdminPrintCardView - Erreur inattendue:', err);
      setError('Erreur inattendue');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Logique de téléchargement PDF (à implémenter si nécessaire)
    console.log('Téléchargement de la carte:', card?.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Erreur :</strong> {error || 'Carte non trouvée'}
          </div>
          <button
            onClick={() => window.close()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header d'impression (visible seulement à l'écran) */}
      <div className="print:hidden bg-white shadow-sm p-4 border-b">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.close()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Impression - Carte d'étudiant
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              <Download className="w-4 h-4" />
              Télécharger
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <Printer className="w-4 h-4" />
              Imprimer
            </button>
          </div>
        </div>
      </div>

      {/* Contenu de la carte (visible à l'écran et à l'impression) */}
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 print:hidden">
            Carte d'étudiant - {card.firstname} {card.lastname}
          </h1>
          
          <div className="flex flex-col items-center w-full max-w-full">
            <div className="relative w-full max-w-[420px] h-[260px] mb-4">
              <div className={`transition-transform duration-700 w-full h-full ${isBack ? 'rotate-y-180' : ''}`}
                style={{ transformStyle: 'preserve-3d' }}>
                
                {/* Recto - identique au StudentCardView */}
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
                    <img 
                      src="/logo-iut.png" 
                      alt="Logo IUT" 
                      style={{ height: 38 }} 
                      crossOrigin="anonymous"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: 15, letterSpacing: 0.5 }}>UNIVERSITE DE DOUALA</div>
                      <div style={{ fontSize: 12, marginTop: 1 }}>INSTITUT UNIVERSITAIRE DE TECHNOLOGIE</div>
                      <div style={{ fontSize: 10, color: '#2563eb', marginTop: 1 }}>CARTE D'ETUDIANT - {new Date().getFullYear()}/{new Date().getFullYear() + 1}</div>
                    </div>
                    <img 
                      src="/logo-iut2.png" 
                      alt="Logo IUT 2" 
                      style={{ height: 38 }} 
                      crossOrigin="anonymous"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
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
                        {card.users?.avatar ? (
                          <img 
                            src={card.users.avatar} 
                            alt="Avatar étudiant" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            crossOrigin="anonymous"
                            onError={(e) => {
                              // Si l'image ne charge pas, on cache l'élément
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div style={{ 
                            width: '100%', 
                            height: '100%', 
                            background: '#e3eafc', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '12px',
                            color: '#2563eb',
                            fontWeight: 'bold'
                          }}>
                            PHOTO
                          </div>
                        )}
                      </div>
                      {qrDataUrl && (
                        <img src={qrDataUrl} alt="QR Code étudiant" style={{ width: 48, height: 48, borderRadius: 6, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 2 }} />
                      )}
                      <div style={{ fontSize: 10, color: '#2563eb', fontStyle: 'italic', letterSpacing: 0.5, marginTop: 2, textAlign: 'center' }}>Visa Directeur</div>
                    </div>
                  </div>
                </div>
                
                {/* Verso - identique au StudentCardView */}
                <div className={`absolute w-full h-full backface-hidden bg-gray-900 rounded-xl p-6 text-white flex flex-col justify-between rotate-y-180 ${isBack ? 'visible' : 'invisible'}`}
                  style={{ width: '420px', height: '260px' }}>
                  <div>
                    <h3 className="text-lg font-bold mb-2">En cas de perte</h3>
                    <p className="text-sm">Nom : {card.lastname}</p>
                    <p className="text-sm">Prénom : {card.firstname}</p>
                    {card.users?.phone && <p className="text-sm">Téléphone : {card.users.phone}</p>}
                    {card.users?.email && <p className="text-sm">Email : {card.users.email}</p>}
                    <p className="text-sm">ID étudiant : {card.studentid}</p>
                  </div>
                  <div className="text-xs text-gray-300 mt-4">
                    <p>Si vous trouvez cette carte, merci de contacter le propriétaire ou l'administration de l'IUT de Douala.</p>
                    <p className="mt-2">CampusCard - IUT de Douala</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bouton retourner la carte (visible seulement à l'écran) */}
            <button
              onClick={() => {
                setIsBack((prev) => !prev);
                setIconAnimated(true);
                setTimeout(() => setIconAnimated(false), 600);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors mt-2 print:hidden"
              title="Retourner la carte"
            >
              <ArrowLeftRight
                className={`w-5 h-5 transition-transform duration-500 ${iconAnimated ? 'animate-spin' : ''}`}
              />
              {isBack ? 'Voir le recto' : 'Voir le verso'}
            </button>
          </div>
        </div>
      </div>

      {/* Styles d'impression */}
      <style jsx>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .bg-gray-100 {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminPrintCardView; 
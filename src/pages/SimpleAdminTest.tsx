import React from 'react';

const SimpleAdminTest: React.FC = () => {
  console.log('🧪 SimpleAdminTest - Composant chargé');

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1f2937',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h1 style={{ color: '#1f2937', marginBottom: '20px' }}>
          🧪 Test Admin Simple
        </h1>
        
        <p style={{ color: '#6b7280', marginBottom: '30px' }}>
          Si vous voyez cette page, le routage fonctionne !
        </p>
        
        <div style={{
          backgroundColor: '#10b981',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          ✅ Page de test admin chargée avec succès
        </div>
        
        <div style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          📍 Route : /admin/simple-test
        </div>
        
        <div style={{
          backgroundColor: '#8b5cf6',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          🎯 Prochaine étape : Tester la connexion admin
        </div>
        
        <a 
          href="/admin/login" 
          style={{
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            display: 'inline-block',
            fontWeight: 'bold'
          }}
        >
          Aller à la page de connexion admin
        </a>
        
        <div style={{ marginTop: '20px' }}>
          <a 
            href="/" 
            style={{
              color: '#3b82f6',
              textDecoration: 'none'
            }}
          >
            ← Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
};

export default SimpleAdminTest; 
import React from 'react';

const AdminTestPage: React.FC = () => {
  console.log('🔍 AdminTestPage - Composant chargé');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-orange-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">🧪 Test Admin</h1>
        <p className="text-gray-600 mb-6">
          Si vous voyez cette page, le routage fonctionne !
        </p>
        
        <div className="space-y-4">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            ✅ Page de test admin chargée avec succès
          </div>
          
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            📍 Route : /admin/test
          </div>
          
          <div className="bg-purple-100 border border-purple-400 text-purple-700 px-4 py-3 rounded">
            🎯 Prochaine étape : Tester la connexion admin
          </div>
        </div>
        
        <div className="mt-6">
          <a 
            href="/admin/login" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Aller à la page de connexion admin
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminTestPage; 
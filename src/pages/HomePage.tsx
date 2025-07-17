import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 via-red-500 to-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">IUT</span>
              </div>
              <span className="text-xl font-bold text-gray-800">CampusCard Creator</span>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                🏠 Accueil
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                ⚙️ Comment ça marche
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                ❓ FAQ
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                📞 Contact
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                👤 {user?.firstName || 'test2'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 bg-black/50"></div>
        
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1595391/pexels-photo-1595391.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
            alt="IUT Douala Campus"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Créez votre carte étudiant
              <br />
              <span className="text-blue-400">en quelques clics</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Simplifiez vos démarches administratives avec notre service en ligne sécurisé et rapide. 
              Obtenez votre carte étudiant officielle sans file d'attente.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleGetStarted}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>▶️ Commencer</span>
              </button>
              
              <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors flex items-center justify-center space-x-2">
                <span>ℹ️ En savoir plus</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir CampusCard Creator ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Notre service offre une solution complète pour la création de cartes étudiantes, 
              conçue pour répondre aux besoins des établissements d'enseignement modernes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gray-50 rounded-2xl">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Rapide et efficace</h3>
              <p className="text-gray-600">
                Créez votre carte en moins de 5 minutes avec notre interface intuitive
              </p>
            </div>

            <div className="text-center p-8 bg-gray-50 rounded-2xl">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Sécurisé</h3>
              <p className="text-gray-600">
                Vos données sont protégées avec les dernières technologies de sécurité
              </p>
            </div>

            <div className="text-center p-8 bg-gray-50 rounded-2xl">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Accessible partout</h3>
              <p className="text-gray-600">
                Accédez à votre carte depuis n'importe quel appareil, n'importe où
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
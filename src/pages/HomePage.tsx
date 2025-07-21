import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, ShoppingCart, MapPin, Linkedin, Facebook, Twitter, Phone, Clock} from "lucide-react";

// Ajout du scroll fluide global
if (typeof window !== 'undefined') {
  document.documentElement.style.scrollBehavior = 'smooth';
}

const glowText = 'drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg sticky top-0 z-50 shadow-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-tr from-blue-500 to-purple-500 shadow-lg">
                  <img src="/logo-iut.png" alt="Logo IUT" className="w-full h-full object-contain rounded-full" />
              </div>
                <span className={`text-xl font-bold text-blue-400 ${glowText}`}>CampusCard</span>
            </Link>
          </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#hero" className="text-blue-400 hover:text-blue-400 transition-colors font-semibold tracking-wide">🏠 Accueil</a>
              <a href="#how" className="text-blue-400 hover:text-blue-400 transition-colors font-semibold tracking-wide">⚙️ Comment ça marche</a>
              <a href="#faq" className="text-blue-400 hover:text-blue-400 transition-colors font-semibold tracking-wide">❓ FAQ</a>
              <a href="#contact" className="text-blue-400 hover:text-blue-400 transition-colors font-semibold tracking-wide">📞 Contact</a>
            </nav>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-tr from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl shadow-lg hover:scale-105 transition-transform font-semibold border border-white/20 backdrop-blur-md"
              >
              {user?.firstname || '😀 User'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image (with dark overlay for better text contrast) */}
        <div className="absolute inset-0">
          <img
            src="iutdoualaimg.png"
            alt="IUT Douala Campus"
            className="w-full h-full object-cover brightness-50"
          />
        </div>

        <div className="absolute inset-0 animate-pulse-slow"></div>
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[120vw] h-[60vh] bg-gradient-radial from-blue-500/30 via-purple-500/20 to-transparent rounded-full blur-3xl opacity-70 animate-spin-slow"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl text-center">
            <h1 className={`text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight ${glowText}`}
              style={{textShadow: '0 0 32px #60a5fa, 0 0 8px #a78bfa'}}>
              Créez votre carte étudiant
              <br />
              <span className="text-white drop-shadow-[0_0_20px_rgba(96,165,250,0.8)]">en quelques clics</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed drop-shadow-lg">
              Simplifiez vos démarches administratives avec notre service en ligne sécurisé et rapide. 
              Obtenez votre carte étudiant officielle sans file d'attente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-tr from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl hover:scale-105 transition-transform border border-white/20 backdrop-blur-md"
                style={{boxShadow: '0 0 32px #60a5fa55'}}
              >
                <span>▶️ Commencer</span>
              </button>
              <a href="#how" className="bg-white/10 border-2 border-blue-400 text-blue-200 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-blue-400 hover:text-white transition-colors shadow-xl backdrop-blur-md">
                <span>ℹ️ En savoir plus</span>
              </a>
            </div>
          </div>
        </div>
        {/* Séparateur SVG */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
          <svg viewBox="0 0 1920 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-24">
            <path d="M0 0C400 120 1520 0 1920 120V120H0V0Z" fill="#fff" fillOpacity="0.08"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-blue-100 border-b-2 border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-5xl font-extrabold text-blue-700 mb-4 ${glowText}`}>Pourquoi choisir CampusCard Creator ?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Notre service offre une solution complète pour la création de cartes étudiantes, 
              conçue pour répondre aux besoins des établissements d'enseignement modernes.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            <div className={`relative text-center p-10 bg-white/90 backdrop-blur-md border border-blue-100 shadow-lg rounded-3xl hover:scale-105 transition-transform duration-300 group overflow-hidden`}> 
              <div className="w-20 h-20 bg-gradient-to-tr from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:shadow-blue-400/50 animate-bounce-slow">
                <span className="text-4xl text-white drop-shadow-lg animate-pulse">⚡</span>
              </div>
              <h3 className={`text-2xl font-bold text-blue-600 mb-4 ${glowText}`}>Rapide et efficace</h3>
              <p className="text-gray-800 font-medium">
                Créez votre carte en moins de 5 minutes avec notre interface intuitive
              </p>
            </div>
            <div className={`relative text-center p-10 bg-white/90 backdrop-blur-md border border-green-100 shadow-lg rounded-3xl hover:scale-105 transition-transform duration-300 group overflow-hidden`}> 
              <div className="w-20 h-20 bg-gradient-to-tr from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:shadow-green-400/50 animate-bounce-slow">
                <span className="text-4xl text-white drop-shadow-lg animate-pulse">🔒</span>
              </div>
              <h3 className={`text-2xl font-bold text-green-600 mb-4 ${glowText}`}>Sécurisé</h3>
              <p className="text-gray-800 font-medium">
                Vos données sont protégées avec les dernières technologies de sécurité
              </p>
            </div>
            <div className={`relative text-center p-10 bg-white/90 backdrop-blur-md border border-purple-100 shadow-lg rounded-3xl hover:scale-105 transition-transform duration-300 group overflow-hidden`}> 
              <div className="w-20 h-20 bg-gradient-to-tr from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:shadow-purple-400/50 animate-bounce-slow">
                <span className="text-4xl text-white drop-shadow-lg animate-pulse">📱</span>
              </div>
              <h3 className={`text-2xl font-bold text-purple-600 mb-4 ${glowText}`}>Accessible partout</h3>
              <p className="text-gray-800 font-medium">
                Accédez à votre carte depuis n'importe quel appareil, n'importe où
              </p>
            </div>
          </div>
        </div>
        {/* Séparateur SVG */}
        <div className="w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1920 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-24">
            <path d="M0 120C400 0 1520 120 1920 0V120H0V120Z" fill="#fff" fillOpacity="0.08"/>
          </svg>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how" className="py-24 bg-gradient-to-br from-blue-50 via-white to-blue-100 border-b-2 border-blue-200">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className={`text-5xl font-extrabold text-blue-700 mb-12 text-center ${glowText}`}>⚙️ Comment ça marche ?</h2>
          <div className="grid md:grid-cols-5 gap-6">
            <div className={`bg-white/90 backdrop-blur-md border border-blue-100 shadow-lg rounded-3xl p-6 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300`}> 
              <div className="w-12 h-12 mb-4 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl shadow-lg">1</div>
              <span className="font-semibold text-blue-600">Créez votre compte étudiant</span>
              <span className="text-gray-700 text-sm mt-2">sur la plateforme CampusCard.</span>
            </div>
            <div className={`bg-white/90 backdrop-blur-md border border-blue-100 shadow-lg rounded-3xl p-6 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300`}> 
              <div className="w-12 h-12 mb-4 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl shadow-lg">2</div>
              <span className="font-semibold text-blue-600">Complétez vos informations</span>
              <span className="text-gray-700 text-sm mt-2">et téléchargez votre photo d'identité.</span>
            </div>
            <div className={`bg-white/90 backdrop-blur-md border border-blue-100 shadow-lg rounded-3xl p-6 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300`}> 
              <div className="w-12 h-12 mb-4 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl shadow-lg">3</div>
              <span className="font-semibold text-blue-600">Générez votre carte</span>
              <span className="text-gray-700 text-sm mt-2">en remplissant le formulaire dédié.</span>
            </div>
            <div className={`bg-white/90 backdrop-blur-md border border-blue-100 shadow-lg rounded-3xl p-6 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300`}> 
              <div className="w-12 h-12 mb-4 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl shadow-lg">4</div>
              <span className="font-semibold text-blue-600">Paiement sécurisé</span>
              <span className="text-gray-700 text-sm mt-2">des frais de carte.</span>
            </div>
            <div className={`bg-white/90 backdrop-blur-md border border-blue-100 shadow-lg rounded-3xl p-6 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300`}> 
              <div className="w-12 h-12 mb-4 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl shadow-lg">5</div>
              <span className="font-semibold text-blue-600">Téléchargez ou imprimez</span>
              <span className="text-gray-700 text-sm mt-2">votre carte validée, ou récupérez-la à l'IUT.</span>
            </div>
          </div>
        </div>
        {/* Séparateur SVG */}
        <div className="w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1920 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-24">
            <path d="M0 0C400 120 1520 0 1920 120V120H0V0Z" fill="#fff" fillOpacity="0.08"/>
          </svg>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-gradient-to-br from-blue-50 via-white to-blue-100 border-b-2 border-blue-200">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className={`text-5xl font-extrabold text-blue-700 mb-12 text-center ${glowText}`}>❓ FAQ</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className={`bg-white/90 backdrop-blur-md border border-purple-100 shadow-lg rounded-3xl p-8 flex flex-col gap-2 hover:scale-105 transition-transform duration-300`}> 
              <span className="font-semibold text-blue-700 text-lg">Combien coûte la carte d'étudiant ?</span>
              <span className="text-gray-700">La carte coûte 5 000 FCFA, incluant les frais de traitement et d'impression.</span>
            </div>
            <div className={`bg-white/90 backdrop-blur-md border border-purple-100 shadow-lg rounded-3xl p-8 flex flex-col gap-2 hover:scale-105 transition-transform duration-300`}> 
              <span className="font-semibold text-blue-700 text-lg">Quels documents dois-je fournir ?</span>
              <span className="text-gray-700">Une photo d'identité récente et vos informations personnelles (nom, prénom, date de naissance, etc.).</span>
            </div>
            <div className={`bg-white/90 backdrop-blur-md border border-purple-100 shadow-lg rounded-3xl p-8 flex flex-col gap-2 hover:scale-105 transition-transform duration-300`}> 
              <span className="font-semibold text-blue-700 text-lg">Comment récupérer ma carte ?</span>
              <span className="text-gray-700">Après validation, vous pouvez la télécharger en PDF ou la retirer au bureau des cartes étudiantes de l'IUT.</span>
            </div>
            <div className={`bg-white/90 backdrop-blur-md border border-purple-100 shadow-lg rounded-3xl p-8 flex flex-col gap-2 hover:scale-105 transition-transform duration-300`}> 
              <span className="font-semibold text-blue-700 text-lg">Que faire en cas de perte ?</span>
              <span className="text-gray-700">Connectez-vous à la plateforme pour signaler la perte et demander une nouvelle carte.</span>
            </div>
          </div>
        </div>
        {/* Séparateur SVG */}
        <div className="w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1920 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-24">
            <path d="M0 120C400 0 1520 120 1920 0V120H0V120Z" fill="#fff" fillOpacity="0.08"/>
          </svg>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-gradient-to-br from-blue-100 via-white to-blue-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className={`text-5xl font-extrabold text-blue-700 mb-12 text-center ${glowText}`}>📞 Contact</h2>
          <div className={`bg-white/90 backdrop-blur-md border border-blue-100 shadow-lg rounded-3xl p-12 flex flex-col gap-6 items-center`}> 
            <div className="flex items-center gap-4">
              <Mail className="w-7 h-7 text-blue-600" />
              <a href="mailto:support@iut-douala.edu" className="text-blue-700 hover:underline text-lg font-semibold">support@iut-douala.edu</a>
            </div>
            <div className="flex items-center gap-4">
              <Phone className="w-7 h-7 text-blue-600" />
              <a href="tel:+237233400380" className="text-blue-700 hover:underline text-lg font-semibold">+237 233 40 03 80</a>
            </div>
            <div className="flex items-center gap-4">
              <MapPin className="w-7 h-7 text-blue-600" />
              <span className="text-gray-700 text-lg font-semibold">IUT de Douala, Bâtiment administratif, 1er étage</span>
          </div>
            <div className="flex items-center gap-4">
              <Clock className="w-7 h-7 text-blue-600" />
              <span className="text-gray-700 text-lg font-semibold">Lundi à vendredi : 9h-16h, Samedi : 9h-12h</span>
          </div>
          </div>
        </div>
      </section>

     
      <footer className="bg-gradient-to-tr from-blue-900/95 to-purple-900/95 border-t border-blue-800/40 shadow-2xl mt-2">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center space-x-3">
            <img src="/public/logo-iut.png" alt="Logo IUT" className="w-12 h-12 object-contain rounded-full shadow-lg border-2 border-blue-400/30" />
            <span className="text-2xl font-extrabold text-blue-100 tracking-wide drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">CampusCard</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4 text-blue-200 text-sm font-medium">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-400" />
              <a href="mailto:support@iut-douala.edu" className="hover:underline">support@iut-douala.edu</a>
            </div>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-400" />
              <a href="tel:+237233400380" className="hover:underline">+237 233 40 03 80</a>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-400" />
              <span>IUT de Douala, 1er étage</span>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-6 md:mt-0">
            <a href="#" title="LinkedIn" className="hover:scale-110 transition-transform">
              <Linkedin className="w-6 h-6 text-blue-400" />
            </a>
            <a href="#" title="Facebook" className="hover:scale-110 transition-transform">
              <Facebook className="w-6 h-6 text-blue-400" />
            </a>
            <a href="#" title="Twitter" className="hover:scale-110 transition-transform">
              <Twitter className="w-6 h-6 text-blue-400" />
            </a>
          </div>
        </div>
        <div className="border-t border-blue-800/40 mt-2 p-4 text-center text-blue-300 text-xs font-light tracking-wide">
          © {new Date().getFullYear()} CampusCard Creator. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
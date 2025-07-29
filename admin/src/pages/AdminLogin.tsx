import React, { useState } from 'react';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authenticateByMatricule } from '../../../src/lib/matriculeAuth';

const AdminLogin: React.FC = () => {
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signInWithMatricule } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Essayer d'abord l'authentification matricule
      const { user, error: matriculeError } = await authenticateByMatricule(matricule, password);
      
      if (matriculeError) {
        // Si l'authentification matricule échoue, essayer Supabase Auth
        const { error: supabaseError } = await signInWithMatricule(matricule, password);
        
        if (supabaseError) {
          setError('Matricule ou mot de passe incorrect');
          return;
        }
      } else if (user && user.role === 'admin') {
        // Authentification matricule réussie pour un admin
        console.log('✅ Connexion admin réussie via matricule:', user.email);
        navigate('/admin/dashboard');
        return;
      } else if (user && user.role !== 'admin') {
        setError('Accès refusé. Seuls les administrateurs peuvent accéder à cette section.');
        return;
      }

      // Redirection vers le dashboard après connexion réussie
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin CampusCard</h1>
          <p className="text-gray-600">Connectez-vous à votre compte administrateur</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="matricule" className="block text-sm font-medium text-gray-700 mb-2">
              Matricule ou Email
            </label>
            <input
              type="text"
              id="matricule"
              value={matricule}
              onChange={(e) => setMatricule(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="admin@iut.com ou matricule"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Retour à l'application principale{' '}
            <a href="http://localhost:5175" className="text-blue-600 hover:text-blue-700">
              CampusCard
            </a>
          </p>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Identifiants de test :</h3>
          <div className="text-xs text-blue-700 space-y-1">
            <p><strong>Email :</strong> admin@iut.com</p>
            <p><strong>Mot de passe :</strong> CampusCard2024!</p>
            <p className="text-blue-600 mt-2">⚠️ Assurez-vous que l'admin existe dans Supabase Auth</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 
import { useAuth } from '../../../src/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authenticateByMatricule } from '../../../src/lib/matriculeAuth';

const AdminLogin: React.FC = () => {
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signInWithMatricule } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Essayer d'abord l'authentification matricule
      const { user, error: matriculeError } = await authenticateByMatricule(matricule, password);
      
      if (matriculeError) {
        // Si l'authentification matricule échoue, essayer Supabase Auth
        const { error: supabaseError } = await signInWithMatricule(matricule, password);
        
        if (supabaseError) {
          setError('Matricule ou mot de passe incorrect');
          return;
        }
      } else if (user && user.role === 'admin') {
        // Authentification matricule réussie pour un admin
        console.log('✅ Connexion admin réussie via matricule:', user.email);
        navigate('/admin/dashboard');
        return;
      } else if (user && user.role !== 'admin') {
        setError('Accès refusé. Seuls les administrateurs peuvent accéder à cette section.');
        return;
      }

      // Redirection vers le dashboard après connexion réussie
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin CampusCard</h1>
          <p className="text-gray-600">Connectez-vous à votre compte administrateur</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="matricule" className="block text-sm font-medium text-gray-700 mb-2">
              Matricule ou Email
            </label>
            <input
              type="text"
              id="matricule"
              value={matricule}
              onChange={(e) => setMatricule(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="admin@iut.com ou matricule"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Retour à l'application principale{' '}
            <a href="http://localhost:5175" className="text-blue-600 hover:text-blue-700">
              CampusCard
            </a>
          </p>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Identifiants de test :</h3>
          <div className="text-xs text-blue-700 space-y-1">
            <p><strong>Email :</strong> admin@iut.com</p>
            <p><strong>Mot de passe :</strong> CampusCard2024!</p>
            <p className="text-blue-600 mt-2">⚠️ Assurez-vous que l'admin existe dans Supabase Auth</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 
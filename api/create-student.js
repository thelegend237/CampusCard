import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';

try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const envPath = join(__dirname, '.env');

  dotenv.config({ path: envPath });

  console.log('🚀 Démarrage de l\'API...');
  console.log('📡 URL Supabase:', process.env.SUPABASE_URL);
  console.log('🔑 Clé service_role:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configurée' : 'Manquante');

  const app = express();
  
  // Configuration CORS
  app.use(cors({
    origin: ['http://localhost:5177', 'http://localhost:5176', 'http://localhost:5175'], // Frontend React
    credentials: true
  }));
  
  app.use(express.json());

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Endpoint de test
  app.get('/api/test', (req, res) => {
    res.json({ message: 'API CampusCard fonctionne !', timestamp: new Date().toISOString() });
  });

  app.post('/api/create-student', async (req, res) => {
    console.log('📝 Création d\'étudiant demandée:', req.body);
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      console.error('❌ Erreur création utilisateur:', error);
      return res.status(400).json({ error: error.message });
    }
    
    console.log('✅ Utilisateur créé:', data.user.id);
    res.status(200).json({ user: data.user });
  });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`✅ API server running on http://localhost:${PORT}`);
    console.log(`🔗 Test: http://localhost:${PORT}/api/test`);
  });
} catch (error) {
  console.error('❌ Erreur lors du démarrage de l\'API:', error);
} 
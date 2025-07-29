console.log('🚀 Démarrage du script...');

import express from 'express';
console.log('✅ Express importé');

import { createClient } from '@supabase/supabase-js';
console.log('✅ Supabase importé');

import dotenv from 'dotenv';
console.log('✅ Dotenv importé');

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
console.log('✅ Path modules importés');

import cors from 'cors';
console.log('✅ CORS importé');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '.env');

console.log('📁 Répertoire:', __dirname);
console.log('📄 Chemin .env:', envPath);

dotenv.config({ path: envPath });

console.log('📡 URL Supabase:', process.env.SUPABASE_URL);
console.log('🔑 Clé service_role:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configurée' : 'Manquante');

const app = express();

// Configuration CORS
app.use(cors({
  origin: ['http://localhost:5177', 'http://localhost:5175'], // Frontend React
  credentials: true
}));

app.use(express.json());

console.log('✅ Express app créé avec CORS');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('✅ Supabase client créé');

app.get('/api/test', (req, res) => {
  console.log('📝 Test endpoint appelé');
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
console.log('🚀 Démarrage du serveur sur le port:', PORT);

app.listen(PORT, () => {
  console.log(`✅ API server running on http://localhost:${PORT}`);
  console.log(`🔗 Test: http://localhost:${PORT}/api/test`);
});

console.log('✅ Script terminé'); 
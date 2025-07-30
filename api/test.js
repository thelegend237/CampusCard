import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '.env');

console.log('🚀 Test Node.js...');
console.log('📁 Répertoire courant:', __dirname);
console.log('📄 Chemin du fichier .env:', envPath);
console.log('📄 Fichier .env existe:', existsSync(envPath));

if (existsSync(envPath)) {
  console.log('📄 Contenu du fichier .env:');
  console.log(readFileSync(envPath, 'utf8'));
}

dotenv.config({ path: envPath });

console.log('📡 Variables d\'environnement après dotenv:');
console.log('- SUPABASE_URL:', process.env.SUPABASE_URL || 'Non définie');
console.log('- PORT:', process.env.PORT || 'Non défini');
console.log('✅ Test terminé'); 
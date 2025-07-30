import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '.env');

dotenv.config({ path: envPath });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixStudent() {
  console.log('🔧 Correction de l\'étudiant Test015...');
  
  const matricule = 'Test015';
  const password = 'test123';
  
  // Hasher le mot de passe
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  console.log('🔐 Hash généré:', passwordHash);
  
  // Mettre à jour l'étudiant
  const { data: updatedUser, error } = await supabase
    .from('users')
    .update({
      password_hash: passwordHash,
      password_plain: password,
      password_changed: false,
    })
    .eq('matricule', matricule)
    .select()
    .single();
    
  if (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
  } else {
    console.log('✅ Étudiant mis à jour avec succès!');
    console.log('📋 Détails:', {
      id: updatedUser.id,
      email: updatedUser.email,
      matricule: updatedUser.matricule,
      password_hash: updatedUser.password_hash ? 'Présent' : 'Manquant',
      firstname: updatedUser.firstname,
      lastname: updatedUser.lastname
    });
  }
}

fixStudent().catch(console.error); 
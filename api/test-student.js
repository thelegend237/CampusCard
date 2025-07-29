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

async function testStudent() {
  console.log('🔍 Test de l\'étudiant...');
  
  // 1. Chercher par email
  console.log('\n1️⃣ Recherche par email: test@test.com');
  const { data: userByEmail, error: emailError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'test@test.com')
    .single();
    
  if (emailError) {
    console.log('❌ Erreur recherche par email:', emailError.message);
  } else {
    console.log('✅ Utilisateur trouvé par email:', {
      id: userByEmail.id,
      email: userByEmail.email,
      matricule: userByEmail.matricule,
      password_hash: userByEmail.password_hash ? 'Présent' : 'Manquant',
      password_plain: userByEmail.password_plain ? 'Présent' : 'Manquant',
      firstname: userByEmail.firstname,
      lastname: userByEmail.lastname,
      role: userByEmail.role
    });
  }
  
  // 2. Chercher par matricule
  console.log('\n2️⃣ Recherche par matricule: Test015');
  const { data: userByMatricule, error: matriculeError } = await supabase
    .from('users')
    .select('*')
    .eq('matricule', 'Test015')
    .single();
    
  if (matriculeError) {
    console.log('❌ Erreur recherche par matricule:', matriculeError.message);
  } else {
    console.log('✅ Utilisateur trouvé par matricule:', {
      id: userByMatricule.id,
      email: userByMatricule.email,
      matricule: userByMatricule.matricule,
      password_hash: userByMatricule.password_hash ? 'Présent' : 'Manquant',
      password_plain: userByMatricule.password_plain ? 'Présent' : 'Manquant',
      firstname: userByMatricule.firstname,
      lastname: userByMatricule.lastname,
      role: userByMatricule.role
    });
  }
  
  // 3. Lister tous les étudiants
  console.log('\n3️⃣ Liste de tous les étudiants:');
  const { data: allStudents, error: listError } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'student');
    
  if (listError) {
    console.log('❌ Erreur liste étudiants:', listError.message);
  } else {
    console.log(`✅ ${allStudents.length} étudiant(s) trouvé(s):`);
    allStudents.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.email} (${student.matricule || 'Pas de matricule'}) - Hash: ${student.password_hash ? 'Présent' : 'Manquant'}`);
    });
  }
}

testStudent().catch(console.error); 
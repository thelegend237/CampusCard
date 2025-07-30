import { supabase } from './supabase';
import { User } from '../types';

// Fonction pour hasher un mot de passe (utilise bcrypt ou une alternative)
export const hashPassword = async (password: string): Promise<string> => {
  // Pour l'instant, on utilise une fonction simple
  // En production, utilisez bcrypt ou une bibliothèque de hachage sécurisée
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Fonction pour vérifier un mot de passe
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
};

// Fonction pour créer un compte étudiant (admin seulement)
export const createStudentAccount = async (studentData: {
  matricule: string;
  firstname: string;
  lastname: string;
  email: string;
  department: string;
  program: string;
  password: string;
  phone?: string;
  studentid?: string;
  dateofbirth?: string;
  placeofbirth?: string;
  avatar?: string;
}): Promise<{ success: boolean; error: string | null }> => {
  try {
    // Hasher le mot de passe
    const passwordHash = await hashPassword(studentData.password);

    // Créer l'utilisateur
    const { error } = await supabase
      .from('users')
      .insert([
        {
          matricule: studentData.matricule,
          firstname: studentData.firstname,
          lastname: studentData.lastname,
          email: studentData.email,
          department: studentData.department,
          program: studentData.program,
          phone: studentData.phone,
          studentid: studentData.studentid,
          dateofbirth: studentData.dateofbirth,
          placeofbirth: studentData.placeofbirth,
          avatar: studentData.avatar,
          role: 'student',
          password_hash: passwordHash,
          password_plain: studentData.password, // Stocker temporairement le mot de passe en clair
          password_changed: false,
          created_at: new Date().toISOString(),
        }
      ]);

    if (error) {
      if (error.code === '23505') { // Code d'erreur PostgreSQL pour violation de contrainte unique
        return { success: false, error: 'Ce matricule existe déjà' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Erreur lors de la création du compte:', error);
    return { success: false, error: 'Erreur lors de la création du compte' };
  }
};

// Fonction pour mettre à jour un compte étudiant
export const updateStudentAccount = async (
  userId: string, 
  studentData: Partial<{
    matricule: string;
    firstname: string;
    lastname: string;
    email: string;
    department: string;
    program: string;
    phone: string;
    studentid: string;
    dateofbirth: string;
    placeofbirth: string;
    avatar: string;
  }>
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        ...studentData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'Ce matricule existe déjà' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du compte:', error);
    return { success: false, error: 'Erreur lors de la mise à jour du compte' };
  }
};

// Fonction pour changer le mot de passe d'un étudiant
export const changeStudentPassword = async (userId: string, newPassword: string): Promise<{ success: boolean; error: string | null }> => {
  try {
    const passwordHash = await hashPassword(newPassword);

    const { error } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        password_plain: null, // Supprimer le mot de passe en clair
        password_changed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    return { success: false, error: 'Erreur lors du changement de mot de passe' };
  }
};

// Fonction pour réinitialiser le mot de passe d'un étudiant
export const resetStudentPassword = async (matricule: string, newPassword: string): Promise<{ success: boolean; error: string | null }> => {
  try {
    const passwordHash = await hashPassword(newPassword);

    const { error } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        password_plain: newPassword, // Stocker le nouveau mot de passe en clair
        password_changed: false, // L'utilisateur devra changer son mot de passe à la prochaine connexion
        updated_at: new Date().toISOString()
      })
      .eq('matricule', matricule);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    return { success: false, error: 'Erreur lors de la réinitialisation du mot de passe' };
  }
};

// Fonction pour vérifier si un matricule existe
export const checkMatriculeExists = async (matricule: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('matricule', matricule)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Erreur lors de la vérification du matricule:', error);
    return false;
  }
}; 
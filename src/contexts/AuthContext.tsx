import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId);

      if (error) {
        // Gère les erreurs de requête
        if (error.code === 'PGRST116') {
          // C'est l'erreur "0 ou N lignes". Dans ce cas, on peut considérer l'utilisateur comme n'ayant pas de profil
          console.warn('User profile not found or multiple profiles exist for:', userId);
          setUser(null); // ou une valeur par défaut
          return;
        }
        throw error;
      }

      // Traite la réponse comme un tableau
      if (data && data.length > 0) {
        setUser(data[0]); // Prend le premier résultat
      } else {
        console.warn('No user profile found for:', userId);
        setUser(null); // Pas de profil trouvé
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.user) {
      // Attendre que le trigger ait créé le profil (max 2s)
      let tries = 0;
      let profileExists = false;
      while (tries < 10 && !profileExists) {
        const { data: profile } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id);
        if (profile && profile.length > 0) {
          profileExists = true;
        } else {
          await new Promise(res => setTimeout(res, 1000));
          tries++;
        }
      }

      // Log des valeurs envoyées à l'update
      console.log('Tentative update profil', {
        id: data.user.id,
        firstname: userData.firstname,
        lastname: userData.lastname,
        studentid: userData.studentid,
        department: userData.department,
        program: userData.program,
      });

      // Met à jour le profil avec les vraies infos
      const { error: updateError } = await supabase
        .from('users')
        .update({
          firstname: userData.firstname,
          lastname: userData.lastname,
          studentid: userData.studentid,
          department: userData.department,
          program: userData.program,
        })
        .eq('id', data.user.id);

      if (updateError) {
        console.error('Erreur update profil:', updateError);
        throw updateError;
      } else {
        console.log('Profil mis à jour avec succès');
        // Rafraîchir le contexte utilisateur
        await fetchUserProfile(data.user.id);
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
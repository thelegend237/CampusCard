// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
      },
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Configuration manquante' }), { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Récupérer tous les étudiants
    const { data: students, error: fetchError } = await supabase
      .from('users')
      .select('id, email, studentid')
      .eq('role', 'student');

    if (fetchError) {
      return new Response(JSON.stringify({ error: fetchError.message }), { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      });
    }

    const results = [];
    for (const student of students || []) {
      try {
        // 1. Créer ou réinitialiser le compte Auth
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: student.email,
          password: 'CampusCard2024!',
          email_confirm: true,
        });

        if (authError && !authError.message.includes('already registered')) {
          results.push({ student: student.studentid, error: authError.message });
          continue;
        }

        // 2. Récupérer l'utilisateur Auth (si déjà existant)
        let userId = authUser?.user?.id;
        if (!userId) {
          // Chercher l'utilisateur Auth par email
          const { data: usersList, error: listError } = await supabase.auth.admin.listUsers({ email: student.email });
          if (listError || !usersList?.users?.length) {
            results.push({ student: student.studentid, error: 'Impossible de trouver l\'utilisateur Auth' });
            continue;
          }
          userId = usersList.users[0].id;
          // Réinitialiser le mot de passe
          await supabase.auth.admin.updateUserById(userId, { password: 'CampusCard2024!' });
        }

        // 3. Mettre à jour la colonne id dans la table users
        const { error: updateError } = await supabase
          .from('users')
          .update({ id: userId })
          .eq('studentid', student.studentid);

        if (updateError) {
          results.push({ student: student.studentid, error: updateError.message });
        } else {
          results.push({ student: student.studentid, success: true });
        }
      } catch (error) {
        results.push({ student: student.studentid, error: error.message });
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      results,
      message: 'Synchronisation terminée. Mot de passe = CampusCard2024!'
    }), { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Erreur interne' }), { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }
    });
  }
});
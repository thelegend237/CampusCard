import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { email, password, studentid, firstname, lastname, department, program, phone } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // 1. Créer l'utilisateur dans Auth
  const { data, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (authError || !data?.user) {
    return new Response(JSON.stringify({ error: authError?.message || 'Erreur Auth' }), { status: 400 })
  }

  // 2. Ajouter dans la table users
  const { error: dbError } = await supabase.from('users').insert([{
    id: data.user.id,
    email,
    studentid,
    firstname,
    lastname,
    department,
    program,
    phone,
    role: 'student',
  }])
  if (dbError) {
    return new Response(JSON.stringify({ error: dbError.message }), { status: 400 })
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 })
})
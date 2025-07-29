-- Script rapide pour corriger les politiques RLS de support_messages
-- À exécuter dans l'interface SQL de Supabase

-- 1. Supprimer les anciennes politiques (si elles existent)
DROP POLICY IF EXISTS "Users can view own support messages" ON support_messages;
DROP POLICY IF EXISTS "Users can create own support messages" ON support_messages;
DROP POLICY IF EXISTS "Users can update own support messages" ON support_messages;
DROP POLICY IF EXISTS "Admins can do everything on support messages" ON support_messages;

-- 2. Créer une politique permissive pour le développement
CREATE POLICY "Allow all operations on support_messages" ON support_messages
  FOR ALL USING (true);

-- 3. Vérification
SELECT 'Politiques RLS corrigées pour support_messages:' as info;
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'support_messages'
ORDER BY policyname;

-- 4. Test de lecture
SELECT 'Test de lecture des messages:' as info;
SELECT COUNT(*) as nombre_messages FROM support_messages;

-- 5. Message de confirmation
SELECT '✅ Politiques RLS corrigées !' as status;
SELECT '📧 La page AdminSupport devrait maintenant fonctionner.' as app_status; 
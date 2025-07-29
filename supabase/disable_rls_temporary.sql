-- Script pour désactiver temporairement RLS (Row Level Security)
-- À exécuter dans l'interface SQL de Supabase
-- ATTENTION: Ceci est pour le développement seulement !

-- Désactiver RLS sur toutes les tables principales
ALTER TABLE cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages DISABLE ROW LEVEL SECURITY;

-- Vérification
SELECT 'RLS désactivé sur les tables:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('cards', 'payments', 'users', 'notifications', 'support_messages')
AND schemaname = 'public';

-- Message de confirmation
SELECT '✅ RLS désactivé avec succès !' as status;
SELECT '⚠️  ATTENTION: Ceci est pour le développement seulement.' as warning;
SELECT '🔒 Réactiver RLS en production avec des politiques appropriées.' as reminder; 
-- À exécuter dans l'interface SQL de Supabase
-- ATTENTION: Ceci est pour le développement seulement !

-- Désactiver RLS sur toutes les tables principales
ALTER TABLE cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages DISABLE ROW LEVEL SECURITY;

-- Vérification
SELECT 'RLS désactivé sur les tables:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('cards', 'payments', 'users', 'notifications', 'support_messages')
AND schemaname = 'public';

-- Message de confirmation
SELECT '✅ RLS désactivé avec succès !' as status;
SELECT '⚠️  ATTENTION: Ceci est pour le développement seulement.' as warning;
SELECT '🔒 Réactiver RLS en production avec des politiques appropriées.' as reminder; 
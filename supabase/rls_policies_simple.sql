-- Version simplifiée des politiques RLS pour l'authentification matricule
-- À exécuter dans l'interface SQL de Supabase

-- 1. Désactiver temporairement RLS pour les tests
ALTER TABLE cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Ou créer des politiques très permissives pour les tests
-- (À utiliser seulement en développement)

-- Activer RLS
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Politique permissive pour les cartes (développement seulement)
CREATE POLICY "Allow all operations on cards" ON cards
  FOR ALL USING (true);

-- Politique permissive pour les paiements (développement seulement)
CREATE POLICY "Allow all operations on payments" ON payments
  FOR ALL USING (true);

-- Politique permissive pour les utilisateurs (développement seulement)
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true);

-- 3. Vérification
SELECT 'Politiques RLS simplifiées créées:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('cards', 'payments', 'users')
ORDER BY tablename, policyname; 
-- À exécuter dans l'interface SQL de Supabase

-- 1. Désactiver temporairement RLS pour les tests
ALTER TABLE cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Ou créer des politiques très permissives pour les tests
-- (À utiliser seulement en développement)

-- Activer RLS
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Politique permissive pour les cartes (développement seulement)
CREATE POLICY "Allow all operations on cards" ON cards
  FOR ALL USING (true);

-- Politique permissive pour les paiements (développement seulement)
CREATE POLICY "Allow all operations on payments" ON payments
  FOR ALL USING (true);

-- Politique permissive pour les utilisateurs (développement seulement)
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true);

-- 3. Vérification
SELECT 'Politiques RLS simplifiées créées:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('cards', 'payments', 'users')
ORDER BY tablename, policyname; 
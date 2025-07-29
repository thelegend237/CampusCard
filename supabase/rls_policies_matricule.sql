-- Politiques RLS appropriées pour l'authentification matricule
-- À exécuter dans l'interface SQL de Supabase

-- 1. Créer une fonction pour obtenir l'utilisateur actuel via matricule
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Essayer de récupérer l'utilisateur depuis la session Supabase Auth
  SELECT auth.uid() INTO current_user_id;
  
  -- Si pas d'utilisateur via Supabase Auth, retourner NULL
  -- L'application gérera l'authentification matricule côté client
  RETURN current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Créer une fonction pour vérifier si l'utilisateur est admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Vérifier si l'utilisateur est admin
  SELECT role INTO user_role 
  FROM users 
  WHERE id = get_current_user_id();
  
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Activer RLS sur les tables
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- 4. Politiques pour la table users
-- Permettre aux utilisateurs de voir leurs propres données
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (
    id = get_current_user_id() OR is_admin()
  );

-- Permettre aux admins de voir toutes les données utilisateurs
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (is_admin());

-- Permettre aux admins de modifier les utilisateurs
CREATE POLICY "Admins can modify users" ON users
  FOR ALL USING (is_admin());

-- Permettre aux utilisateurs de mettre à jour leurs propres données
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (
    id = get_current_user_id() OR is_admin()
  );

-- 5. Politiques pour la table cards
-- Permettre aux utilisateurs de voir leurs propres cartes
CREATE POLICY "Users can view own cards" ON cards
  FOR SELECT USING (
    userid = get_current_user_id() OR is_admin()
  );

-- Permettre aux utilisateurs de créer leurs propres cartes
CREATE POLICY "Users can create own cards" ON cards
  FOR INSERT WITH CHECK (
    userid = get_current_user_id() OR is_admin()
  );

-- Permettre aux utilisateurs de mettre à jour leurs propres cartes
CREATE POLICY "Users can update own cards" ON cards
  FOR UPDATE USING (
    userid = get_current_user_id() OR is_admin()
  );

-- Permettre aux admins de faire toutes les opérations sur les cartes
CREATE POLICY "Admins can do everything on cards" ON cards
  FOR ALL USING (is_admin());

-- 6. Politiques pour la table payments
-- Permettre aux utilisateurs de voir leurs propres paiements
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (
    userid = get_current_user_id() OR is_admin()
  );

-- Permettre aux utilisateurs de créer leurs propres paiements
CREATE POLICY "Users can create own payments" ON payments
  FOR INSERT WITH CHECK (
    userid = get_current_user_id() OR is_admin()
  );

-- Permettre aux utilisateurs de mettre à jour leurs propres paiements
CREATE POLICY "Users can update own payments" ON payments
  FOR UPDATE USING (
    userid = get_current_user_id() OR is_admin()
  );

-- Permettre aux admins de faire toutes les opérations sur les paiements
CREATE POLICY "Admins can do everything on payments" ON payments
  FOR ALL USING (is_admin());

-- 7. Politiques pour la table notifications
-- Permettre aux utilisateurs de voir leurs propres notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (
    userid = get_current_user_id() OR is_admin()
  );

-- Permettre aux utilisateurs de créer leurs propres notifications
CREATE POLICY "Users can create own notifications" ON notifications
  FOR INSERT WITH CHECK (
    userid = get_current_user_id() OR is_admin()
  );

-- Permettre aux utilisateurs de mettre à jour leurs propres notifications
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (
    userid = get_current_user_id() OR is_admin()
  );

-- Permettre aux admins de faire toutes les opérations sur les notifications
CREATE POLICY "Admins can do everything on notifications" ON notifications
  FOR ALL USING (is_admin());

-- 8. Politiques pour la table support_messages
-- Permettre aux utilisateurs de voir leurs propres messages de support
CREATE POLICY "Users can view own support messages" ON support_messages
  FOR SELECT USING (
    userid = get_current_user_id() OR is_admin()
  );

-- Permettre aux utilisateurs de créer leurs propres messages de support
CREATE POLICY "Users can create own support messages" ON support_messages
  FOR INSERT WITH CHECK (
    userid = get_current_user_id() OR is_admin()
  );

-- Permettre aux utilisateurs de mettre à jour leurs propres messages de support
CREATE POLICY "Users can update own support messages" ON support_messages
  FOR UPDATE USING (
    userid = get_current_user_id() OR is_admin()
  );

-- Permettre aux admins de faire toutes les opérations sur les messages de support
CREATE POLICY "Admins can do everything on support messages" ON support_messages
  FOR ALL USING (is_admin());

-- 9. Politiques pour les tables de référence (lecture seule pour tous)
-- Permettre la lecture des départements et programmes
CREATE POLICY "Allow read access to departments" ON departments
  FOR SELECT USING (true);

CREATE POLICY "Allow read access to programs" ON programs
  FOR SELECT USING (true);

-- Permettre aux admins de modifier les départements et programmes
CREATE POLICY "Admins can modify departments" ON departments
  FOR ALL USING (is_admin());

CREATE POLICY "Admins can modify programs" ON programs
  FOR ALL USING (is_admin());

-- 10. Vérification des politiques créées
SELECT 'Politiques RLS créées pour users:' as info;
SELECT policyname, cmd, permissive 
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

SELECT 'Politiques RLS créées pour cards:' as info;
SELECT policyname, cmd, permissive 
FROM pg_policies 
WHERE tablename = 'cards'
ORDER BY policyname;

SELECT 'Politiques RLS créées pour payments:' as info;
SELECT policyname, cmd, permissive 
FROM pg_policies 
WHERE tablename = 'payments'
ORDER BY policyname;

SELECT 'Politiques RLS créées pour notifications:' as info;
SELECT policyname, cmd, permissive 
FROM pg_policies 
WHERE tablename = 'notifications'
ORDER BY policyname;

SELECT 'Politiques RLS créées pour support_messages:' as info;
SELECT policyname, cmd, permissive 
FROM pg_policies 
WHERE tablename = 'support_messages'
ORDER BY policyname;

-- 11. Test des fonctions
SELECT 'Test des fonctions:' as info;
SELECT 
  'get_current_user_id()' as function,
  get_current_user_id() as result;

SELECT 
  'is_admin()' as function,
  is_admin() as result; 
-- À exécuter dans l'interface SQL de Supabase

-- 1. Créer une fonction pour obtenir l'utilisateur actuel via matricule
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Essayer de récupérer l'utilisateur depuis la session Supabase Auth
  SELECT auth.uid() INTO current_user_id;
  
  -- Si pas d'utilisateur via Supabase Auth, retourner NULL
  -- L'application gérera l'authentification matricule côté client
  RETURN current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Créer une fonction pour vérifier si l'utilisateur est admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Vérifier si l'utilisateur est admin
  SELECT role INTO user_role 
  FROM users 
  WHERE id = get_current_user_id();
  
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Activer RLS sur les tables
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- 4. Politiques pour la table users
-- Permettre aux utilisateurs de voir leurs propres données
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (
    id = get_current_user_id() OR is_admin()
  );

-- Permettre aux admins de voir toutes les données utilisateurs
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (is_admin());

-- Permettre aux admins de modifier les utilisateurs
CREATE POLICY "Admins can modify users" ON users
  FOR ALL USING (is_admin());

-- Permettre aux utilisateurs de mettre à jour leurs propres données
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (
    id = get_current_user_id() OR is_admin()
  );

-- 5. Politiques pour la table cards
-- Permettre aux utilisateurs de voir leurs propres cartes
CREATE POLICY "Users can view own cards" ON cards
  FOR SELECT USING (
    userid = get_current_user_id() OR is_admin()
  );

-- Permettre aux utilisateurs de créer leurs propres cartes
CREATE POLICY "Users can create own cards" ON cards
  FOR INSERT WITH CHECK (
    userid = get_current_user_id() OR is_admin()
  );

-- Permettre aux utilisateurs de mettre à jour leurs propres cartes
CREATE POLICY "Users can update own cards" ON cards
  FOR UPDATE USING (
    userid = get_current_user_id() OR is_admin()
  );

-- Permettre aux admins de faire toutes les opérations sur les cartes
CREATE POLICY "Admins can do everything on cards" ON cards
  FOR ALL USING (is_admin());

-- 6. Politiques pour la table payments
-- Permettre aux utilisateurs de voir leurs propres paiements
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (
    userid = get_current_user_id() OR is_admin()
  );

-- Permettre aux utilisateurs de créer leurs propres paiements
CREATE POLICY "Users can create own payments" ON payments
  FOR INSERT WITH CHECK (
    userid = get_current_user_id() OR is_admin()
  );

-- Permettre aux utilisateurs de mettre à jour leurs propres paiements
CREATE POLICY "Users can update own payments" ON payments
  FOR UPDATE USING (
    userid = get_current_user_id() OR is_admin()
  );

-- Permettre aux admins de faire toutes les opérations sur les paiements
CREATE POLICY "Admins can do everything on payments" ON payments
  FOR ALL USING (is_admin());

-- 7. Politiques pour la table notifications
-- Permettre aux utilisateurs de voir leurs propres notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (
    userid = get_current_user_id() OR is_admin()
  );

-- Permettre aux utilisateurs de créer leurs propres notifications
CREATE POLICY "Users can create own notifications" ON notifications
  FOR INSERT WITH CHECK (
    userid = get_current_user_id() OR is_admin()
  );

-- Permettre aux utilisateurs de mettre à jour leurs propres notifications
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (
    userid = get_current_user_id() OR is_admin()
  );

-- Permettre aux admins de faire toutes les opérations sur les notifications
CREATE POLICY "Admins can do everything on notifications" ON notifications
  FOR ALL USING (is_admin());

-- 8. Politiques pour la table support_messages
-- Permettre aux utilisateurs de voir leurs propres messages de support
CREATE POLICY "Users can view own support messages" ON support_messages
  FOR SELECT USING (
    userid = get_current_user_id() OR is_admin()
  );

-- Permettre aux utilisateurs de créer leurs propres messages de support
CREATE POLICY "Users can create own support messages" ON support_messages
  FOR INSERT WITH CHECK (
    userid = get_current_user_id() OR is_admin()
  );

-- Permettre aux utilisateurs de mettre à jour leurs propres messages de support
CREATE POLICY "Users can update own support messages" ON support_messages
  FOR UPDATE USING (
    userid = get_current_user_id() OR is_admin()
  );

-- Permettre aux admins de faire toutes les opérations sur les messages de support
CREATE POLICY "Admins can do everything on support messages" ON support_messages
  FOR ALL USING (is_admin());

-- 9. Politiques pour les tables de référence (lecture seule pour tous)
-- Permettre la lecture des départements et programmes
CREATE POLICY "Allow read access to departments" ON departments
  FOR SELECT USING (true);

CREATE POLICY "Allow read access to programs" ON programs
  FOR SELECT USING (true);

-- Permettre aux admins de modifier les départements et programmes
CREATE POLICY "Admins can modify departments" ON departments
  FOR ALL USING (is_admin());

CREATE POLICY "Admins can modify programs" ON programs
  FOR ALL USING (is_admin());

-- 10. Vérification des politiques créées
SELECT 'Politiques RLS créées pour users:' as info;
SELECT policyname, cmd, permissive 
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

SELECT 'Politiques RLS créées pour cards:' as info;
SELECT policyname, cmd, permissive 
FROM pg_policies 
WHERE tablename = 'cards'
ORDER BY policyname;

SELECT 'Politiques RLS créées pour payments:' as info;
SELECT policyname, cmd, permissive 
FROM pg_policies 
WHERE tablename = 'payments'
ORDER BY policyname;

SELECT 'Politiques RLS créées pour notifications:' as info;
SELECT policyname, cmd, permissive 
FROM pg_policies 
WHERE tablename = 'notifications'
ORDER BY policyname;

SELECT 'Politiques RLS créées pour support_messages:' as info;
SELECT policyname, cmd, permissive 
FROM pg_policies 
WHERE tablename = 'support_messages'
ORDER BY policyname;

-- 11. Test des fonctions
SELECT 'Test des fonctions:' as info;
SELECT 
  'get_current_user_id()' as function,
  get_current_user_id() as result;

SELECT 
  'is_admin()' as function,
  is_admin() as result; 
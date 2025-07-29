-- Script pour configurer les politiques RLS (Row Level Security)
-- À exécuter dans l'interface SQL de Supabase

-- 1. Activer RLS sur les tables
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 2. Politiques pour la table cards
-- Permettre aux étudiants de voir leurs propres cartes
CREATE POLICY "Students can view their own cards" ON cards
  FOR SELECT USING (
    auth.uid() = userid OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Permettre aux étudiants de créer leurs propres cartes
CREATE POLICY "Students can create their own cards" ON cards
  FOR INSERT WITH CHECK (
    auth.uid() = userid OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Permettre aux étudiants de mettre à jour leurs propres cartes
CREATE POLICY "Students can update their own cards" ON cards
  FOR UPDATE USING (
    auth.uid() = userid OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Permettre aux admins de faire toutes les opérations
CREATE POLICY "Admins can do everything on cards" ON cards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 3. Politiques pour la table payments
-- Permettre aux étudiants de voir leurs propres paiements
CREATE POLICY "Students can view their own payments" ON payments
  FOR SELECT USING (
    auth.uid() = userid OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Permettre aux étudiants de créer leurs propres paiements
CREATE POLICY "Students can create their own payments" ON payments
  FOR INSERT WITH CHECK (
    auth.uid() = userid OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Permettre aux étudiants de mettre à jour leurs propres paiements
CREATE POLICY "Students can update their own payments" ON payments
  FOR UPDATE USING (
    auth.uid() = userid OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Permettre aux admins de faire toutes les opérations
CREATE POLICY "Admins can do everything on payments" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 4. Politiques pour la table users (si pas déjà configurées)
-- Permettre aux utilisateurs de voir leurs propres données
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Permettre aux admins de voir toutes les données utilisateurs
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Permettre aux admins de modifier les utilisateurs
CREATE POLICY "Admins can modify users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 5. Vérification des politiques créées
SELECT 'Politiques RLS créées pour cards:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'cards';

SELECT 'Politiques RLS créées pour payments:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'payments';

SELECT 'Politiques RLS créées pour users:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users'; 
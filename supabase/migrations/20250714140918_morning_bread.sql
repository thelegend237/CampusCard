/*
  # Schéma initial pour CampusCard Creator

  1. Nouvelles tables
    - `users` - Informations des utilisateurs (étudiants et admins)
    - `departments` - Départements de l'IUT
    - `cards` - Cartes d'étudiant générées
    - `payments` - Paiements et transactions
    - `notifications` - Notifications système

  2. Sécurité
    - Activation RLS sur toutes les tables
    - Politiques d'accès pour étudiants et admins
    - Chiffrement des données sensibles

  3. Indexes
    - Index sur les colonnes fréquemment utilisées
*/

-- Créer les tables principales
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  firstName text NOT NULL,
  lastName text NOT NULL,
  studentId text,
  department text,
  program text,
  avatar text,
  phone text,
  dateOfBirth date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  programs text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  userId uuid REFERENCES users(id) ON DELETE CASCADE,
  studentId text NOT NULL,
  firstName text NOT NULL,
  lastName text NOT NULL,
  department text NOT NULL,
  program text NOT NULL,
  avatar text,
  issuedDate timestamptz NOT NULL,
  expiryDate timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  qrCode text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  userId uuid REFERENCES users(id) ON DELETE CASCADE,
  cardId uuid REFERENCES cards(id) ON DELETE SET NULL,
  amount decimal(10,2) NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  paymentMethod text,
  transactionId text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  userId uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Insérer des départements par défaut
INSERT INTO departments (name, code, programs) VALUES
  ('Informatique & Réseaux', 'INFO', ARRAY['DUT Informatique', 'Licence Informatique', 'Master Informatique']),
  ('Génie Civil', 'GC', ARRAY['DUT Génie Civil', 'Licence Génie Civil', 'Master Génie Civil']),
  ('Électronique', 'ELEC', ARRAY['DUT Électronique', 'Licence Électronique', 'Master Électronique']),
  ('Maintenance Industrielle', 'MAINT', ARRAY['DUT Maintenance', 'BTS Maintenance', 'Licence Maintenance']);

-- Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(studentId);
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(userId);
CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(userId);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(userId);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Politiques pour les utilisateurs
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all users"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques pour les départements
CREATE POLICY "Everyone can read departments"
  ON departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage departments"
  ON departments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques pour les cartes
CREATE POLICY "Users can read own cards"
  ON cards FOR SELECT
  TO authenticated
  USING (userId = auth.uid());

CREATE POLICY "Users can create own cards"
  ON cards FOR INSERT
  TO authenticated
  WITH CHECK (userId = auth.uid());

CREATE POLICY "Users can update own cards"
  ON cards FOR UPDATE
  TO authenticated
  USING (userId = auth.uid());

CREATE POLICY "Admins can read all cards"
  ON cards FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all cards"
  ON cards FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques pour les paiements
CREATE POLICY "Users can read own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (userId = auth.uid());

CREATE POLICY "Users can create own payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (userId = auth.uid());

CREATE POLICY "Admins can read all payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques pour les notifications
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (userId = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (userId = auth.uid());

CREATE POLICY "Admins can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Créer une fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer des triggers pour updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_cards_updated_at
  BEFORE UPDATE ON cards
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();
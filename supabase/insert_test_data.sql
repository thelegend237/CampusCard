-- Script pour insérer des données de test dans les tables departments et programs
-- À exécuter dans l'interface SQL de Supabase

-- 1. Insérer des départements de test
INSERT INTO departments (id, name, code, programs) VALUES
  (gen_random_uuid(), 'Informatique & Réseaux', 'INFO', ARRAY['DUT Informatique', 'Licence Informatique']),
  (gen_random_uuid(), 'Génie Civil', 'GC', ARRAY['DUT Génie Civil', 'Licence Génie Civil']),
  (gen_random_uuid(), 'Électronique', 'ELEC', ARRAY['DUT Électronique', 'Licence Électronique']),
  (gen_random_uuid(), 'Maintenance Industrielle', 'MAINT', ARRAY['DUT Maintenance', 'BTS Maintenance']),
  (gen_random_uuid(), 'GENIE RESEAUX ET TELECOMMUNICATION', 'GRT', ARRAY['DUT Réseaux', 'Licence Réseaux'])
ON CONFLICT (code) DO NOTHING;

-- 2. Insérer des programmes de test
-- DUT Informatique
INSERT INTO programs (id, name, code, department_id, level, duration, description) 
SELECT 
  gen_random_uuid(),
  'DUT Informatique',
  'DUT_INFO',
  d.id,
  'DUT',
  4,
  'Diplôme Universitaire de Technologie en Informatique'
FROM departments d WHERE d.code = 'INFO'
ON CONFLICT (code) DO NOTHING;

-- Licence Informatique
INSERT INTO programs (id, name, code, department_id, level, duration, description) 
SELECT 
  gen_random_uuid(),
  'Licence Informatique',
  'LIC_INFO',
  d.id,
  'Licence',
  6,
  'Licence en Informatique'
FROM departments d WHERE d.code = 'INFO'
ON CONFLICT (code) DO NOTHING;

-- DUT Génie Civil
INSERT INTO programs (id, name, code, department_id, level, duration, description) 
SELECT 
  gen_random_uuid(),
  'DUT Génie Civil',
  'DUT_GC',
  d.id,
  'DUT',
  4,
  'Diplôme Universitaire de Technologie en Génie Civil'
FROM departments d WHERE d.code = 'GC'
ON CONFLICT (code) DO NOTHING;

-- Licence Génie Civil
INSERT INTO programs (id, name, code, department_id, level, duration, description) 
SELECT 
  gen_random_uuid(),
  'Licence Génie Civil',
  'LIC_GC',
  d.id,
  'Licence',
  6,
  'Licence en Génie Civil'
FROM departments d WHERE d.code = 'GC'
ON CONFLICT (code) DO NOTHING;

-- DUT Électronique
INSERT INTO programs (id, name, code, department_id, level, duration, description) 
SELECT 
  gen_random_uuid(),
  'DUT Électronique',
  'DUT_ELEC',
  d.id,
  'DUT',
  4,
  'Diplôme Universitaire de Technologie en Électronique'
FROM departments d WHERE d.code = 'ELEC'
ON CONFLICT (code) DO NOTHING;

-- Licence Électronique
INSERT INTO programs (id, name, code, department_id, level, duration, description) 
SELECT 
  gen_random_uuid(),
  'Licence Électronique',
  'LIC_ELEC',
  d.id,
  'Licence',
  6,
  'Licence en Électronique'
FROM departments d WHERE d.code = 'ELEC'
ON CONFLICT (code) DO NOTHING;

-- DUT Maintenance
INSERT INTO programs (id, name, code, department_id, level, duration, description) 
SELECT 
  gen_random_uuid(),
  'DUT Maintenance',
  'DUT_MAINT',
  d.id,
  'DUT',
  4,
  'Diplôme Universitaire de Technologie en Maintenance Industrielle'
FROM departments d WHERE d.code = 'MAINT'
ON CONFLICT (code) DO NOTHING;

-- BTS Maintenance
INSERT INTO programs (id, name, code, department_id, level, duration, description) 
SELECT 
  gen_random_uuid(),
  'BTS Maintenance',
  'BTS_MAINT',
  d.id,
  'BTS',
  2,
  'Brevet de Technicien Supérieur en Maintenance'
FROM departments d WHERE d.code = 'MAINT'
ON CONFLICT (code) DO NOTHING;

-- DUT Réseaux
INSERT INTO programs (id, name, code, department_id, level, duration, description) 
SELECT 
  gen_random_uuid(),
  'DUT Réseaux',
  'DUT_GRT',
  d.id,
  'DUT',
  4,
  'Diplôme Universitaire de Technologie en Réseaux et Télécommunications'
FROM departments d WHERE d.code = 'GRT'
ON CONFLICT (code) DO NOTHING;

-- Licence Réseaux
INSERT INTO programs (id, name, code, department_id, level, duration, description) 
SELECT 
  gen_random_uuid(),
  'Licence Réseaux',
  'LIC_GRT',
  d.id,
  'Licence',
  6,
  'Licence en Réseaux et Télécommunications'
FROM departments d WHERE d.code = 'GRT'
ON CONFLICT (code) DO NOTHING;

-- Vérification des données insérées
SELECT 'Départements insérés:' as info;
SELECT name, code FROM departments ORDER BY name;

SELECT 'Programmes insérés:' as info;
SELECT p.name, p.level, d.name as department 
FROM programs p 
JOIN departments d ON p.department_id = d.id 
ORDER BY d.name, p.name;

-- 3. Insérer des cartes de test
INSERT INTO cards (id, userid, studentid, firstname, lastname, department, program, avatar, issueddate, expirydate, status, qrcode, created_at, updated_at, dateofbirth, placeofbirth)
SELECT 
  gen_random_uuid(),
  u.id,
  u.studentid,
  u.firstname,
  u.lastname,
  u.department,
  u.program,
  u.avatar,
  NOW(),
  NOW() + INTERVAL '2 years',
  'pending',
  'QR_TEST_' || u.id,
  NOW(),
  NOW(),
  u.dateofbirth,
  u.placeofbirth
FROM users u 
WHERE u.role = 'student' 
LIMIT 5
ON CONFLICT (id) DO NOTHING;

-- 4. Insérer des paiements de test
INSERT INTO payments (id, userid, cardid, amount, description, status, paymentmethod, transactionid, created_at, updated_at, phone)
SELECT 
  gen_random_uuid(),
  c.userid,
  c.id,
  5000,
  'Paiement carte étudiant',
  'pending',
  'mobile_money',
  'TXN_' || gen_random_uuid(),
  NOW(),
  NOW(),
  u.phone
FROM cards c
JOIN users u ON c.userid = u.id
WHERE c.status = 'pending'
LIMIT 3
ON CONFLICT (id) DO NOTHING;

-- Vérification finale
SELECT 'Cartes insérées:' as info;
SELECT COUNT(*) as total_cards FROM cards;

SELECT 'Paiements insérés:' as info;
SELECT COUNT(*) as total_payments FROM payments;

SELECT 'Statistiques finales:' as info;
SELECT 
  (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
  (SELECT COUNT(*) FROM cards) as total_cards,
  (SELECT COUNT(*) FROM payments) as total_payments,
  (SELECT COUNT(*) FROM cards WHERE status = 'pending') as pending_cards,
  (SELECT COUNT(*) FROM cards WHERE status = 'approved') as approved_cards,
  (SELECT COUNT(*) FROM payments WHERE status = 'pending') as pending_payments,
  (SELECT COUNT(*) FROM payments WHERE status = 'approved') as approved_payments,
  (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'approved') as total_revenue; 
-- À exécuter dans l'interface SQL de Supabase

-- 1. Insérer des départements de test
INSERT INTO departments (id, name, code, programs) VALUES
  (gen_random_uuid(), 'Informatique & Réseaux', 'INFO', ARRAY['DUT Informatique', 'Licence Informatique']),
  (gen_random_uuid(), 'Génie Civil', 'GC', ARRAY['DUT Génie Civil', 'Licence Génie Civil']),
  (gen_random_uuid(), 'Électronique', 'ELEC', ARRAY['DUT Électronique', 'Licence Électronique']),
  (gen_random_uuid(), 'Maintenance Industrielle', 'MAINT', ARRAY['DUT Maintenance', 'BTS Maintenance']),
  (gen_random_uuid(), 'GENIE RESEAUX ET TELECOMMUNICATION', 'GRT', ARRAY['DUT Réseaux', 'Licence Réseaux'])
ON CONFLICT (code) DO NOTHING;

-- 2. Insérer des programmes de test
-- DUT Informatique
INSERT INTO programs (id, name, code, department_id, level, duration, description) 
SELECT 
  gen_random_uuid(),
  'DUT Informatique',
  'DUT_INFO',
  d.id,
  'DUT',
  4,
  'Diplôme Universitaire de Technologie en Informatique'
FROM departments d WHERE d.code = 'INFO'
ON CONFLICT (code) DO NOTHING;

-- Licence Informatique
INSERT INTO programs (id, name, code, department_id, level, duration, description) 
SELECT 
  gen_random_uuid(),
  'Licence Informatique',
  'LIC_INFO',
  d.id,
  'Licence',
  6,
  'Licence en Informatique'
FROM departments d WHERE d.code = 'INFO'
ON CONFLICT (code) DO NOTHING;

-- DUT Génie Civil
INSERT INTO programs (id, name, code, department_id, level, duration, description) 
SELECT 
  gen_random_uuid(),
  'DUT Génie Civil',
  'DUT_GC',
  d.id,
  'DUT',
  4,
  'Diplôme Universitaire de Technologie en Génie Civil'
FROM departments d WHERE d.code = 'GC'
ON CONFLICT (code) DO NOTHING;

-- Licence Génie Civil
INSERT INTO programs (id, name, code, department_id, level, duration, description) 
SELECT 
  gen_random_uuid(),
  'Licence Génie Civil',
  'LIC_GC',
  d.id,
  'Licence',
  6,
  'Licence en Génie Civil'
FROM departments d WHERE d.code = 'GC'
ON CONFLICT (code) DO NOTHING;

-- DUT Électronique
INSERT INTO programs (id, name, code, department_id, level, duration, description) 
SELECT 
  gen_random_uuid(),
  'DUT Électronique',
  'DUT_ELEC',
  d.id,
  'DUT',
  4,
  'Diplôme Universitaire de Technologie en Électronique'
FROM departments d WHERE d.code = 'ELEC'
ON CONFLICT (code) DO NOTHING;

-- Licence Électronique
INSERT INTO programs (id, name, code, department_id, level, duration, description) 
SELECT 
  gen_random_uuid(),
  'Licence Électronique',
  'LIC_ELEC',
  d.id,
  'Licence',
  6,
  'Licence en Électronique'
FROM departments d WHERE d.code = 'ELEC'
ON CONFLICT (code) DO NOTHING;

-- DUT Maintenance
INSERT INTO programs (id, name, code, department_id, level, duration, description) 
SELECT 
  gen_random_uuid(),
  'DUT Maintenance',
  'DUT_MAINT',
  d.id,
  'DUT',
  4,
  'Diplôme Universitaire de Technologie en Maintenance Industrielle'
FROM departments d WHERE d.code = 'MAINT'
ON CONFLICT (code) DO NOTHING;

-- BTS Maintenance
INSERT INTO programs (id, name, code, department_id, level, duration, description) 
SELECT 
  gen_random_uuid(),
  'BTS Maintenance',
  'BTS_MAINT',
  d.id,
  'BTS',
  2,
  'Brevet de Technicien Supérieur en Maintenance'
FROM departments d WHERE d.code = 'MAINT'
ON CONFLICT (code) DO NOTHING;

-- DUT Réseaux
INSERT INTO programs (id, name, code, department_id, level, duration, description) 
SELECT 
  gen_random_uuid(),
  'DUT Réseaux',
  'DUT_GRT',
  d.id,
  'DUT',
  4,
  'Diplôme Universitaire de Technologie en Réseaux et Télécommunications'
FROM departments d WHERE d.code = 'GRT'
ON CONFLICT (code) DO NOTHING;

-- Licence Réseaux
INSERT INTO programs (id, name, code, department_id, level, duration, description) 
SELECT 
  gen_random_uuid(),
  'Licence Réseaux',
  'LIC_GRT',
  d.id,
  'Licence',
  6,
  'Licence en Réseaux et Télécommunications'
FROM departments d WHERE d.code = 'GRT'
ON CONFLICT (code) DO NOTHING;

-- Vérification des données insérées
SELECT 'Départements insérés:' as info;
SELECT name, code FROM departments ORDER BY name;

SELECT 'Programmes insérés:' as info;
SELECT p.name, p.level, d.name as department 
FROM programs p 
JOIN departments d ON p.department_id = d.id 
ORDER BY d.name, p.name;

-- 3. Insérer des cartes de test
INSERT INTO cards (id, userid, studentid, firstname, lastname, department, program, avatar, issueddate, expirydate, status, qrcode, created_at, updated_at, dateofbirth, placeofbirth)
SELECT 
  gen_random_uuid(),
  u.id,
  u.studentid,
  u.firstname,
  u.lastname,
  u.department,
  u.program,
  u.avatar,
  NOW(),
  NOW() + INTERVAL '2 years',
  'pending',
  'QR_TEST_' || u.id,
  NOW(),
  NOW(),
  u.dateofbirth,
  u.placeofbirth
FROM users u 
WHERE u.role = 'student' 
LIMIT 5
ON CONFLICT (id) DO NOTHING;

-- 4. Insérer des paiements de test
INSERT INTO payments (id, userid, cardid, amount, description, status, paymentmethod, transactionid, created_at, updated_at, phone)
SELECT 
  gen_random_uuid(),
  c.userid,
  c.id,
  5000,
  'Paiement carte étudiant',
  'pending',
  'mobile_money',
  'TXN_' || gen_random_uuid(),
  NOW(),
  NOW(),
  u.phone
FROM cards c
JOIN users u ON c.userid = u.id
WHERE c.status = 'pending'
LIMIT 3
ON CONFLICT (id) DO NOTHING;

-- Vérification finale
SELECT 'Cartes insérées:' as info;
SELECT COUNT(*) as total_cards FROM cards;

SELECT 'Paiements insérés:' as info;
SELECT COUNT(*) as total_payments FROM payments;

SELECT 'Statistiques finales:' as info;
SELECT 
  (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
  (SELECT COUNT(*) FROM cards) as total_cards,
  (SELECT COUNT(*) FROM payments) as total_payments,
  (SELECT COUNT(*) FROM cards WHERE status = 'pending') as pending_cards,
  (SELECT COUNT(*) FROM cards WHERE status = 'approved') as approved_cards,
  (SELECT COUNT(*) FROM payments WHERE status = 'pending') as pending_payments,
  (SELECT COUNT(*) FROM payments WHERE status = 'approved') as approved_payments,
  (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'approved') as total_revenue; 
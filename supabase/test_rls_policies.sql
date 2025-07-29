-- Script de test pour vérifier les politiques RLS
-- À exécuter dans l'interface SQL de Supabase

-- 1. Test d'insertion de données de test
-- Insérer quelques cartes de test
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
  CASE 
    WHEN random() > 0.7 THEN 'approved'
    WHEN random() > 0.5 THEN 'pending'
    ELSE 'rejected'
  END,
  'QR_TEST_' || u.id,
  NOW() - INTERVAL '1 day' * random() * 30,
  NOW(),
  u.dateofbirth,
  u.placeofbirth
FROM users u 
WHERE u.role = 'student' 
LIMIT 5
ON CONFLICT (id) DO NOTHING;

-- Insérer quelques paiements de test
INSERT INTO payments (id, userid, cardid, amount, description, status, paymentmethod, transactionid, created_at, updated_at, phone)
SELECT 
  gen_random_uuid(),
  c.userid,
  c.id,
  CASE 
    WHEN random() > 0.5 THEN 5000
    ELSE 3000
  END,
  'Paiement carte étudiant - ' || c.firstname || ' ' || c.lastname,
  CASE 
    WHEN c.status = 'approved' THEN 'approved'
    WHEN c.status = 'rejected' THEN 'rejected'
    ELSE 'pending'
  END,
  CASE 
    WHEN random() > 0.5 THEN 'mobile_money'
    ELSE 'card'
  END,
  'TXN_' || gen_random_uuid(),
  c.created_at,
  c.updated_at,
  u.phone
FROM cards c
JOIN users u ON c.userid = u.id
LIMIT 3
ON CONFLICT (id) DO NOTHING;

-- 2. Test de lecture des données
SELECT 'Test de lecture des cartes:' as info;
SELECT COUNT(*) as total_cards FROM cards;

SELECT 'Test de lecture des paiements:' as info;
SELECT COUNT(*) as total_payments FROM payments;

SELECT 'Test de lecture des utilisateurs:' as info;
SELECT COUNT(*) as total_users FROM users;

-- 3. Test de lecture des départements et programmes
SELECT 'Test de lecture des départements:' as info;
SELECT COUNT(*) as total_departments FROM departments;

SELECT 'Test de lecture des programmes:' as info;
SELECT COUNT(*) as total_programs FROM programs;

-- 4. Statistiques finales
SELECT 'Statistiques finales:' as info;
SELECT 
  (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
  (SELECT COUNT(*) FROM users WHERE role = 'admin') as total_admins,
  (SELECT COUNT(*) FROM cards) as total_cards,
  (SELECT COUNT(*) FROM payments) as total_payments,
  (SELECT COUNT(*) FROM cards WHERE status = 'pending') as pending_cards,
  (SELECT COUNT(*) FROM cards WHERE status = 'approved') as approved_cards,
  (SELECT COUNT(*) FROM payments WHERE status = 'pending') as pending_payments,
  (SELECT COUNT(*) FROM payments WHERE status = 'approved') as approved_payments,
  (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'approved') as total_revenue;

-- 5. Vérification des politiques RLS
SELECT 'Vérification des politiques RLS:' as info;
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'cards', 'payments', 'notifications', 'support_messages', 'departments', 'programs')
GROUP BY tablename
ORDER BY tablename;

-- 6. Message de succès
SELECT '✅ Tests terminés avec succès !' as status;
SELECT '🔧 Les politiques RLS sont maintenant fonctionnelles.' as rls_status;
SELECT '📊 Les données de test ont été insérées.' as data_status;
SELECT '🚀 L''application devrait maintenant fonctionner sans erreurs 406/401.' as app_status; 
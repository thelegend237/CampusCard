-- Script pour insérer des messages de support de test
-- À exécuter dans l'interface SQL de Supabase

-- 1. Insérer des messages de support de test
INSERT INTO support_messages (id, userid, fullname, email, category, message, response, status, created_at, answered_at)
VALUES
  (
    gen_random_uuid(),
    (SELECT id FROM users WHERE role = 'student' LIMIT 1),
    'Jean Dupont',
    'jean.dupont@email.com',
    'Problème technique',
    'Bonjour, je n\'arrive pas à générer ma carte d\'étudiant. Le système affiche une erreur 404. Pouvez-vous m\'aider ?',
    NULL,
    'pending',
    NOW() - INTERVAL '2 days',
    NULL
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM users WHERE role = 'student' LIMIT 1 OFFSET 1),
    'Marie Martin',
    'marie.martin@email.com',
    'Question générale',
    'Bonjour, je voudrais savoir combien de temps il faut pour recevoir ma carte après avoir fait la demande ?',
    'Bonjour Marie, généralement la carte est disponible dans les 24-48h après validation de votre demande. Cordialement, l\'équipe CampusCard',
    'answered',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '4 days'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM users WHERE role = 'student' LIMIT 1 OFFSET 2),
    'Pierre Durand',
    'pierre.durand@email.com',
    'Paiement',
    'J\'ai effectué un paiement mais il n\'apparaît pas dans mon historique. Le numéro de transaction est TXN123456.',
    NULL,
    'pending',
    NOW() - INTERVAL '1 day',
    NULL
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM users WHERE role = 'student' LIMIT 1 OFFSET 3),
    'Sophie Bernard',
    'sophie.bernard@email.com',
    'Problème de connexion',
    'Je n\'arrive pas à me connecter avec mon matricule. Le système me dit que mes identifiants sont incorrects.',
    'Bonjour Sophie, vérifiez que votre matricule et mot de passe sont corrects. Si le problème persiste, contactez l\'administration. Cordialement.',
    'answered',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM users WHERE role = 'student' LIMIT 1 OFFSET 4),
    'Lucas Petit',
    'lucas.petit@email.com',
    'Demande d\'information',
    'Bonjour, je voudrais savoir si je peux utiliser ma carte d\'étudiant pour accéder à la bibliothèque ?',
    NULL,
    'pending',
    NOW() - INTERVAL '6 hours',
    NULL
  )
ON CONFLICT (id) DO NOTHING;

-- 2. Vérification des messages insérés
SELECT 'Messages de support insérés:' as info;
SELECT 
  fullname,
  email,
  category,
  status,
  created_at::date as date_creation,
  CASE 
    WHEN answered_at IS NOT NULL THEN answered_at::date
    ELSE NULL
  END as date_reponse
FROM support_messages
ORDER BY created_at DESC;

-- 3. Statistiques des messages
SELECT 'Statistiques des messages de support:' as info;
SELECT 
  COUNT(*) as total_messages,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as messages_en_attente,
  COUNT(CASE WHEN status = 'answered' THEN 1 END) as messages_repondus,
  COUNT(CASE WHEN response IS NOT NULL THEN 1 END) as messages_avec_reponse
FROM support_messages;

-- 4. Vérification des politiques RLS
SELECT 'Vérification des politiques RLS pour support_messages:' as info;
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'support_messages'
ORDER BY policyname;

-- 5. Test de lecture des messages
SELECT 'Test de lecture des messages:' as info;
SELECT COUNT(*) as nombre_messages FROM support_messages;

-- 6. Message de confirmation
SELECT '✅ Messages de support insérés avec succès !' as status;
SELECT '📧 Vous pouvez maintenant tester la page AdminSupport.' as test_note;
SELECT '🔍 Vérifiez la console du navigateur pour les logs de debug.' as debug_note; 
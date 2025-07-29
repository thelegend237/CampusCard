-- Script pour créer l'utilisateur admin
-- À exécuter dans l'interface SQL de Supabase

-- 1. Vérifier si l'admin existe déjà dans la table users
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@iut.com') THEN
    -- Insérer l'admin dans la table users
    INSERT INTO users (
      email,
      role,
      firstname,
      lastname,
      department,
      program,
      created_at,
      updated_at
    ) VALUES (
      'admin@iut.com',
      'admin',
      'Administrateur',
      'CampusCard',
      'Administration',
      'Gestion',
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Utilisateur admin créé dans la table users';
  ELSE
    RAISE NOTICE 'L''utilisateur admin existe déjà dans la table users';
  END IF;
END $$;

-- 2. Afficher les informations de l'admin
SELECT 
  id,
  email,
  role,
  firstname,
  lastname,
  created_at
FROM users 
WHERE email = 'admin@iut.com';

-- 3. Instructions pour créer le compte Supabase Auth
-- IMPORTANT: Vous devez créer manuellement le compte dans Supabase Auth
-- 1. Allez dans votre dashboard Supabase
-- 2. Cliquez sur "Authentication" dans le menu de gauche
-- 3. Cliquez sur "Users"
-- 4. Cliquez sur "Add user"
-- 5. Remplissez:
--    - Email: admin@iut.com
--    - Password: CampusCard2024!
--    - Email confirm: ✓ (cocher)
-- 6. Cliquez sur "Create user"
-- 7. Copiez l'ID de l'utilisateur créé
-- 8. Exécutez la requête ci-dessous avec l'ID copié

-- 4. Mettre à jour l'ID de l'admin avec l'ID Supabase Auth (à exécuter après avoir créé l'utilisateur dans Supabase Auth)
-- REMPLACEZ 'VOTRE_ID_SUPABASE_AUTH' par l'ID réel de l'utilisateur créé dans Supabase Auth
-- UPDATE users SET id = 'VOTRE_ID_SUPABASE_AUTH' WHERE email = 'admin@iut.com'; 
-- Script pour configurer les politiques de sécurité du bucket Storage
-- À exécuter dans l'interface SQL de Supabase

-- 1. Vérifier si le bucket 'avatar' existe
SELECT name, public FROM storage.buckets WHERE name = 'avatar';

-- 2. Créer le bucket 'avatar' s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatar', 'avatar', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (name) DO NOTHING;

-- 3. Configurer le bucket comme public
UPDATE storage.buckets 
SET public = true 
WHERE name = 'avatar';

-- 4. Créer des politiques permissives pour le bucket avatar
-- Politique pour permettre la lecture publique des avatars
CREATE POLICY "Public read access for avatars" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatar');

-- Politique pour permettre l'upload d'avatars aux utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatar');

-- Politique pour permettre la mise à jour d'avatars aux utilisateurs authentifiés
CREATE POLICY "Authenticated users can update avatars" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatar')
  WITH CHECK (bucket_id = 'avatar');

-- Politique pour permettre la suppression d'avatars aux utilisateurs authentifiés
CREATE POLICY "Authenticated users can delete avatars" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatar');

-- 5. Vérifier les politiques créées
SELECT 
  'Storage policies for avatar bucket:' as info;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND qual LIKE '%avatar%'
ORDER BY policyname;

-- 6. Test : Lister les fichiers dans le bucket avatar
SELECT 
  'Files in avatar bucket:' as info;
SELECT 
  name,
  bucket_id,
  created_at,
  updated_at
FROM storage.objects 
WHERE bucket_id = 'avatar'
ORDER BY created_at DESC; 
-- À exécuter dans l'interface SQL de Supabase

-- 1. Vérifier si le bucket 'avatar' existe
SELECT name, public FROM storage.buckets WHERE name = 'avatar';

-- 2. Créer le bucket 'avatar' s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatar', 'avatar', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (name) DO NOTHING;

-- 3. Configurer le bucket comme public
UPDATE storage.buckets 
SET public = true 
WHERE name = 'avatar';

-- 4. Créer des politiques permissives pour le bucket avatar
-- Politique pour permettre la lecture publique des avatars
CREATE POLICY "Public read access for avatars" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatar');

-- Politique pour permettre l'upload d'avatars aux utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatar');

-- Politique pour permettre la mise à jour d'avatars aux utilisateurs authentifiés
CREATE POLICY "Authenticated users can update avatars" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatar')
  WITH CHECK (bucket_id = 'avatar');

-- Politique pour permettre la suppression d'avatars aux utilisateurs authentifiés
CREATE POLICY "Authenticated users can delete avatars" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatar');

-- 5. Vérifier les politiques créées
SELECT 
  'Storage policies for avatar bucket:' as info;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND qual LIKE '%avatar%'
ORDER BY policyname;

-- 6. Test : Lister les fichiers dans le bucket avatar
SELECT 
  'Files in avatar bucket:' as info;
SELECT 
  name,
  bucket_id,
  created_at,
  updated_at
FROM storage.objects 
WHERE bucket_id = 'avatar'
ORDER BY created_at DESC; 
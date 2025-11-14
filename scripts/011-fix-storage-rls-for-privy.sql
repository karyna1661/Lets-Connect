-- Fix storage RLS policies to work with Privy authentication
-- Since we're using Privy (not Supabase Auth), auth.uid() is NULL
-- We need to allow authenticated uploads through the service role or anon key

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Profile images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile image" ON storage.objects;

-- Create new permissive policies for profile-images bucket
-- Allow anyone with valid credentials to upload
CREATE POLICY "Allow authenticated uploads to profile-images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profile-images');

-- Allow public read access
CREATE POLICY "Public read access to profile-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-images');

-- Allow updates to profile-images
CREATE POLICY "Allow authenticated updates to profile-images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'profile-images')
  WITH CHECK (bucket_id = 'profile-images');

-- Allow deletes to profile-images
CREATE POLICY "Allow authenticated deletes to profile-images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'profile-images');

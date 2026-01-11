-- Migration: 006_storage
-- Description: Create storage policies (buckets are created via Supabase Dashboard)
-- Date: 2026-01-06

-- NOTE: Storage buckets must be created manually in Supabase Dashboard:
-- 1. Go to Storage > New Bucket
-- 2. Create these buckets:
--    - screenshots (private, 5MB limit, image/png, image/jpeg, image/webp)
--    - annotated (private, 5MB limit, image/png, image/jpeg, image/webp)
--    - public (public, 5MB limit, image/png, image/jpeg, image/webp)
--    - exports (private, 50MB limit, application/pdf)

-- Screenshots bucket: Users can upload/read their own files
-- File path format: {user_id}/{procedure_id}/{filename}
CREATE POLICY IF NOT EXISTS screenshots_insert ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'screenshots' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY IF NOT EXISTS screenshots_select ON storage.objects
  FOR SELECT USING (
    bucket_id = 'screenshots' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY IF NOT EXISTS screenshots_delete ON storage.objects
  FOR DELETE USING (
    bucket_id = 'screenshots' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Annotated bucket: Users can read their own, service role can write
CREATE POLICY IF NOT EXISTS annotated_select ON storage.objects
  FOR SELECT USING (
    bucket_id = 'annotated' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Public bucket: Anyone can read
CREATE POLICY IF NOT EXISTS public_select ON storage.objects
  FOR SELECT USING (bucket_id = 'public');

-- Exports bucket: Users can read their own PDFs
CREATE POLICY IF NOT EXISTS exports_select ON storage.objects
  FOR SELECT USING (
    bucket_id = 'exports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add branding fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#2563eb',
ADD COLUMN IF NOT EXISTS brand_logo_url TEXT;

-- Create storage bucket for branding if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for images (Anyone can view, User can upload own)
CREATE POLICY "Public Access Branding"
ON storage.objects FOR SELECT
USING ( bucket_id = 'branding' );

CREATE POLICY "User Upload Branding"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'branding' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "User Update Branding"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'branding' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "User Delete Branding"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'branding' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

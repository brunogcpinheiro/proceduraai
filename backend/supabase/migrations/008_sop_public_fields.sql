-- Migration: 008_sop_public_fields.sql
-- Description: Add public sharing fields to sop_documents table
-- Date: 2026-01-12

-- Add public sharing columns
ALTER TABLE sop_documents
ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS public_slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS views_count INTEGER NOT NULL DEFAULT 0;

-- Create index for public slug lookups
CREATE INDEX IF NOT EXISTS idx_sop_documents_public_slug ON sop_documents(public_slug) WHERE public_slug IS NOT NULL;

-- Add RLS policy for public access
CREATE POLICY "Anyone can view public documents"
  ON sop_documents FOR SELECT
  USING (is_public = TRUE AND public_slug IS NOT NULL);

-- Function to generate unique public slug for documents
CREATE OR REPLACE FUNCTION generate_document_public_slug()
RETURNS TEXT AS $$
DECLARE
  new_slug TEXT;
  slug_exists BOOLEAN;
BEGIN
  LOOP
    new_slug := encode(gen_random_bytes(6), 'base64');
    new_slug := replace(replace(replace(new_slug, '+', ''), '/', ''), '=', '');
    new_slug := lower(new_slug);
    
    SELECT EXISTS(SELECT 1 FROM sop_documents WHERE public_slug = new_slug) INTO slug_exists;
    
    IF NOT slug_exists THEN
      RETURN new_slug;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to increment document views
CREATE OR REPLACE FUNCTION increment_document_views(slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE sop_documents
  SET views_count = views_count + 1
  WHERE public_slug = slug AND is_public = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON COLUMN sop_documents.is_public IS 'Whether this SOP document is publicly accessible';
COMMENT ON COLUMN sop_documents.public_slug IS 'Unique slug for public URL access';
COMMENT ON COLUMN sop_documents.views_count IS 'Number of times this public document has been viewed';

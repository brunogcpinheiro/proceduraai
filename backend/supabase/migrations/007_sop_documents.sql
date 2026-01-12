-- Migration: 007_sop_documents.sql
-- Description: Create sop_documents table for AI-generated SOP documents
-- Date: 2026-01-12

-- Create table
CREATE TABLE IF NOT EXISTS sop_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  generation_count INTEGER NOT NULL DEFAULT 1,
  generation_reset_at DATE NOT NULL DEFAULT CURRENT_DATE,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT positive_version CHECK (version >= 1),
  CONSTRAINT positive_generation_count CHECK (generation_count >= 0 AND generation_count <= 10)
);

-- Add comment
COMMENT ON TABLE sop_documents IS 'AI-generated SOP documents stored as structured JSON';

-- Create indexes
CREATE INDEX idx_sop_documents_procedure_id ON sop_documents(procedure_id);
CREATE UNIQUE INDEX idx_sop_documents_procedure_unique ON sop_documents(procedure_id);

-- Enable RLS
ALTER TABLE sop_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own documents"
  ON sop_documents FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM procedures
    WHERE procedures.id = sop_documents.procedure_id
    AND procedures.user_id = auth.uid()
  ));

CREATE POLICY "Users can create documents for own procedures"
  ON sop_documents FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM procedures
    WHERE procedures.id = sop_documents.procedure_id
    AND procedures.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own documents"
  ON sop_documents FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM procedures
    WHERE procedures.id = sop_documents.procedure_id
    AND procedures.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own documents"
  ON sop_documents FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM procedures
    WHERE procedures.id = sop_documents.procedure_id
    AND procedures.user_id = auth.uid()
  ));

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_sop_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sop_documents_updated_at
  BEFORE UPDATE ON sop_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_sop_documents_updated_at();

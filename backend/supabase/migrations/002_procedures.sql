-- Migration: 002_procedures
-- Description: Create procedures (SOPs) table
-- Date: 2026-01-06

-- Create procedure status enum
CREATE TYPE procedure_status AS ENUM ('draft', 'recording', 'processing', 'ready', 'error');

-- Create procedures table
CREATE TABLE IF NOT EXISTS procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  description TEXT,
  status procedure_status NOT NULL DEFAULT 'draft',
  processing_progress INTEGER DEFAULT 0 CHECK (processing_progress BETWEEN 0 AND 100),
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  public_slug TEXT UNIQUE CHECK (public_slug ~* '^[a-z0-9-]{8,50}$'),
  views_count INTEGER NOT NULL DEFAULT 0 CHECK (views_count >= 0),
  step_count INTEGER NOT NULL DEFAULT 0,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_procedures_user_id ON procedures(user_id);
CREATE INDEX idx_procedures_status ON procedures(status);
CREATE INDEX idx_procedures_public_slug ON procedures(public_slug) WHERE public_slug IS NOT NULL;
CREATE INDEX idx_procedures_created_at ON procedures(created_at DESC);
CREATE INDEX idx_procedures_user_created ON procedures(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY procedures_select_own ON procedures
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY procedures_select_public ON procedures
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY procedures_insert ON procedures
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY procedures_update ON procedures
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY procedures_delete ON procedures
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER procedures_updated_at
  BEFORE UPDATE ON procedures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Comment
COMMENT ON TABLE procedures IS 'SOPs created by users from screen recordings';

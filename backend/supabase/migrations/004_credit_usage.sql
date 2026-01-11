-- Migration: 004_credit_usage
-- Description: Create credit_usage audit log table
-- Date: 2026-01-06

-- Create credit_usage table
CREATE TABLE IF NOT EXISTS credit_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  procedure_id UUID REFERENCES procedures(id) ON DELETE SET NULL,
  credits_used INTEGER NOT NULL DEFAULT 1,
  action TEXT NOT NULL CHECK (action IN ('generate_sop', 'regenerate_sop', 'export_pdf')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_credit_usage_user ON credit_usage(user_id);
CREATE INDEX idx_credit_usage_created ON credit_usage(created_at DESC);

-- Enable RLS
ALTER TABLE credit_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own credit usage
CREATE POLICY credit_usage_select ON credit_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Comment
COMMENT ON TABLE credit_usage IS 'Audit log for credit consumption';

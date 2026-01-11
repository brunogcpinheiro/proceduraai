-- Migration: 003_steps
-- Description: Create steps table for procedure actions
-- Date: 2026-01-06

-- Create action type enum
CREATE TYPE action_type AS ENUM ('click', 'input', 'navigate', 'scroll', 'select');

-- Create steps table
CREATE TABLE IF NOT EXISTS steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL CHECK (order_index >= 1),
  screenshot_url TEXT,
  annotated_screenshot_url TEXT,
  action_type action_type NOT NULL,
  element_selector TEXT,
  element_text TEXT CHECK (element_text IS NULL OR char_length(element_text) <= 500),
  element_tag TEXT,
  click_x INTEGER,
  click_y INTEGER,
  page_url TEXT NOT NULL,
  page_title TEXT,
  generated_text TEXT CHECK (generated_text IS NULL OR char_length(generated_text) <= 2000),
  manual_text TEXT CHECK (manual_text IS NULL OR char_length(manual_text) <= 2000),
  captured_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (procedure_id, order_index)
);

-- Create indexes
CREATE INDEX idx_steps_procedure_id ON steps(procedure_id);
CREATE INDEX idx_steps_order ON steps(procedure_id, order_index);

-- Enable RLS
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY steps_select ON steps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM procedures
      WHERE procedures.id = steps.procedure_id
      AND (procedures.user_id = auth.uid() OR procedures.is_public = TRUE)
    )
  );

CREATE POLICY steps_insert ON steps
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM procedures
      WHERE procedures.id = steps.procedure_id
      AND procedures.user_id = auth.uid()
    )
  );

CREATE POLICY steps_update ON steps
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM procedures
      WHERE procedures.id = steps.procedure_id
      AND procedures.user_id = auth.uid()
    )
  );

CREATE POLICY steps_delete ON steps
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM procedures
      WHERE procedures.id = steps.procedure_id
      AND procedures.user_id = auth.uid()
    )
  );

-- Comment
COMMENT ON TABLE steps IS 'Individual captured actions within a procedure';

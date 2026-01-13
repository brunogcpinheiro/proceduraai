-- ============================================
-- PARTE 1: RESET (EXECUTE PRIMEIRO)
-- ============================================

-- Drop all tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS sop_documents CASCADE;
DROP TABLE IF EXISTS credit_usage CASCADE;
DROP TABLE IF EXISTS steps CASCADE;
DROP TABLE IF EXISTS procedures CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop all types
DROP TYPE IF EXISTS user_plan CASCADE;
DROP TYPE IF EXISTS procedure_status CASCADE;
DROP TYPE IF EXISTS action_type CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS generate_public_slug() CASCADE;
DROP FUNCTION IF EXISTS increment_procedure_views(TEXT) CASCADE;
DROP FUNCTION IF EXISTS deduct_user_credit(UUID, UUID, TEXT, INT) CASCADE;
DROP FUNCTION IF EXISTS update_step_count() CASCADE;
DROP FUNCTION IF EXISTS update_sop_documents_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_procedure_thumbnail() CASCADE;
DROP FUNCTION IF EXISTS reset_monthly_credits() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS generate_document_public_slug() CASCADE;
DROP FUNCTION IF EXISTS increment_document_views(TEXT) CASCADE;

-- ============================================
-- PARTE 2: MIGRATIONS (EXECUTE DEPOIS DO RESET)
-- ============================================

-- 001_users
CREATE TYPE user_plan AS ENUM ('free', 'starter', 'pro', 'business');

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  plan user_plan NOT NULL DEFAULT 'free',
  credits_remaining INTEGER NOT NULL DEFAULT 3 CHECK (credits_remaining >= 0),
  credits_reset_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_plan ON users(plan);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_update ON users FOR UPDATE USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 002_procedures
CREATE TYPE procedure_status AS ENUM ('draft', 'recording', 'processing', 'ready', 'error');

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

CREATE INDEX idx_procedures_user_id ON procedures(user_id);
CREATE INDEX idx_procedures_status ON procedures(status);
CREATE INDEX idx_procedures_public_slug ON procedures(public_slug) WHERE public_slug IS NOT NULL;
CREATE INDEX idx_procedures_created_at ON procedures(created_at DESC);
CREATE INDEX idx_procedures_user_created ON procedures(user_id, created_at DESC);

ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;

CREATE POLICY procedures_select_own ON procedures FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY procedures_select_public ON procedures FOR SELECT USING (is_public = TRUE);
CREATE POLICY procedures_insert ON procedures FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY procedures_update ON procedures FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY procedures_delete ON procedures FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER procedures_updated_at
  BEFORE UPDATE ON procedures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 003_steps
CREATE TYPE action_type AS ENUM ('click', 'input', 'navigate', 'scroll', 'select');

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

CREATE INDEX idx_steps_procedure_id ON steps(procedure_id);
CREATE INDEX idx_steps_order ON steps(procedure_id, order_index);

ALTER TABLE steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY steps_select ON steps FOR SELECT USING (
  EXISTS (SELECT 1 FROM procedures WHERE procedures.id = steps.procedure_id AND (procedures.user_id = auth.uid() OR procedures.is_public = TRUE))
);
CREATE POLICY steps_insert ON steps FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM procedures WHERE procedures.id = steps.procedure_id AND procedures.user_id = auth.uid())
);
CREATE POLICY steps_update ON steps FOR UPDATE USING (
  EXISTS (SELECT 1 FROM procedures WHERE procedures.id = steps.procedure_id AND procedures.user_id = auth.uid())
);
CREATE POLICY steps_delete ON steps FOR DELETE USING (
  EXISTS (SELECT 1 FROM procedures WHERE procedures.id = steps.procedure_id AND procedures.user_id = auth.uid())
);

-- 004_credit_usage
CREATE TABLE IF NOT EXISTS credit_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  procedure_id UUID REFERENCES procedures(id) ON DELETE SET NULL,
  credits_used INTEGER NOT NULL DEFAULT 1,
  action TEXT NOT NULL CHECK (action IN ('generate_sop', 'regenerate_sop', 'export_pdf')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_usage_user ON credit_usage(user_id);
CREATE INDEX idx_credit_usage_created ON credit_usage(created_at DESC);
ALTER TABLE credit_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY credit_usage_select ON credit_usage FOR SELECT USING (auth.uid() = user_id);

-- 005_functions
CREATE OR REPLACE FUNCTION generate_public_slug()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_procedure_views(slug TEXT)
RETURNS void AS $$
BEGIN
  UPDATE procedures SET views_count = views_count + 1 WHERE public_slug = slug AND is_public = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_procedure_views(TEXT) TO anon;

CREATE OR REPLACE FUNCTION update_step_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE procedures SET step_count = (SELECT COUNT(*) FROM steps WHERE procedure_id = NEW.procedure_id) WHERE id = NEW.procedure_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE procedures SET step_count = (SELECT COUNT(*) FROM steps WHERE procedure_id = OLD.procedure_id) WHERE id = OLD.procedure_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_step_count
  AFTER INSERT OR DELETE ON steps
  FOR EACH ROW EXECUTE FUNCTION update_step_count();

CREATE OR REPLACE FUNCTION update_procedure_thumbnail()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_index = 1 AND NEW.screenshot_url IS NOT NULL THEN
    UPDATE procedures SET thumbnail_url = NEW.screenshot_url WHERE id = NEW.procedure_id AND thumbnail_url IS NULL;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_thumbnail
  AFTER INSERT ON steps
  FOR EACH ROW EXECUTE FUNCTION update_procedure_thumbnail();

CREATE OR REPLACE FUNCTION deduct_user_credit(p_user_id UUID, p_procedure_id UUID, p_action TEXT, p_amount INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE v_credits INTEGER;
BEGIN
  SELECT credits_remaining INTO v_credits FROM users WHERE id = p_user_id;
  IF v_credits IS NULL OR v_credits < p_amount THEN RETURN FALSE; END IF;
  UPDATE users SET credits_remaining = credits_remaining - p_amount WHERE id = p_user_id;
  INSERT INTO credit_usage (user_id, procedure_id, credits_used, action) VALUES (p_user_id, p_procedure_id, p_amount, p_action);
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION deduct_user_credit(UUID, UUID, TEXT, INTEGER) TO authenticated;

-- 007_sop_documents
CREATE TABLE IF NOT EXISTS sop_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  generation_count INTEGER NOT NULL DEFAULT 1,
  generation_reset_at DATE NOT NULL DEFAULT CURRENT_DATE,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_edited_at TIMESTAMPTZ,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  public_slug TEXT UNIQUE,
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT positive_version CHECK (version >= 1),
  CONSTRAINT positive_generation_count CHECK (generation_count >= 0 AND generation_count <= 10)
);

CREATE INDEX idx_sop_documents_procedure_id ON sop_documents(procedure_id);
CREATE UNIQUE INDEX idx_sop_documents_procedure_unique ON sop_documents(procedure_id);
CREATE INDEX idx_sop_documents_public_slug ON sop_documents(public_slug) WHERE public_slug IS NOT NULL;

ALTER TABLE sop_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents" ON sop_documents FOR SELECT
  USING (EXISTS (SELECT 1 FROM procedures WHERE procedures.id = sop_documents.procedure_id AND procedures.user_id = auth.uid()));

CREATE POLICY "Anyone can view public documents" ON sop_documents FOR SELECT
  USING (is_public = TRUE AND public_slug IS NOT NULL);

CREATE POLICY "Users can create documents for own procedures" ON sop_documents FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM procedures WHERE procedures.id = sop_documents.procedure_id AND procedures.user_id = auth.uid()));

CREATE POLICY "Users can update own documents" ON sop_documents FOR UPDATE
  USING (EXISTS (SELECT 1 FROM procedures WHERE procedures.id = sop_documents.procedure_id AND procedures.user_id = auth.uid()));

CREATE POLICY "Users can delete own documents" ON sop_documents FOR DELETE
  USING (EXISTS (SELECT 1 FROM procedures WHERE procedures.id = sop_documents.procedure_id AND procedures.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION update_sop_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sop_documents_updated_at
  BEFORE UPDATE ON sop_documents
  FOR EACH ROW EXECUTE FUNCTION update_sop_documents_updated_at();

-- Functions for document public sharing
CREATE OR REPLACE FUNCTION generate_document_public_slug()
RETURNS TEXT AS $$
DECLARE new_slug TEXT; slug_exists BOOLEAN;
BEGIN
  LOOP
    new_slug := encode(gen_random_bytes(6), 'base64');
    new_slug := replace(replace(replace(new_slug, '+', ''), '/', ''), '=', '');
    new_slug := lower(new_slug);
    SELECT EXISTS(SELECT 1 FROM sop_documents WHERE public_slug = new_slug) INTO slug_exists;
    IF NOT slug_exists THEN RETURN new_slug; END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_document_views(slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE sop_documents SET views_count = views_count + 1 WHERE public_slug = slug AND is_public = TRUE;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION increment_document_views(TEXT) TO anon;

-- Done!


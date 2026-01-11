-- Migration: 005_functions
-- Description: Create database functions
-- Date: 2026-01-06

-- Generate public slug function
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

-- Increment procedure views (public, no auth required)
CREATE OR REPLACE FUNCTION increment_procedure_views(slug TEXT)
RETURNS void AS $$
BEGIN
  UPDATE procedures
  SET views_count = views_count + 1
  WHERE public_slug = slug AND is_public = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to anon for public view counting
GRANT EXECUTE ON FUNCTION increment_procedure_views(TEXT) TO anon;

-- Update step count trigger function
CREATE OR REPLACE FUNCTION update_step_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE procedures
    SET step_count = (SELECT COUNT(*) FROM steps WHERE procedure_id = NEW.procedure_id)
    WHERE id = NEW.procedure_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE procedures
    SET step_count = (SELECT COUNT(*) FROM steps WHERE procedure_id = OLD.procedure_id)
    WHERE id = OLD.procedure_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for step count updates
CREATE TRIGGER trigger_update_step_count
  AFTER INSERT OR DELETE ON steps
  FOR EACH ROW EXECUTE FUNCTION update_step_count();

-- Update thumbnail on first step insert
CREATE OR REPLACE FUNCTION update_procedure_thumbnail()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if this is the first step (order_index = 1)
  IF NEW.order_index = 1 AND NEW.screenshot_url IS NOT NULL THEN
    UPDATE procedures
    SET thumbnail_url = NEW.screenshot_url
    WHERE id = NEW.procedure_id AND thumbnail_url IS NULL;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_thumbnail
  AFTER INSERT ON steps
  FOR EACH ROW EXECUTE FUNCTION update_procedure_thumbnail();

-- Deduct credits function (called by Edge Functions)
CREATE OR REPLACE FUNCTION deduct_user_credit(
  p_user_id UUID,
  p_procedure_id UUID,
  p_action TEXT,
  p_amount INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  v_credits INTEGER;
BEGIN
  -- Check current credits
  SELECT credits_remaining INTO v_credits
  FROM users
  WHERE id = p_user_id;

  IF v_credits IS NULL OR v_credits < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Deduct credits
  UPDATE users
  SET credits_remaining = credits_remaining - p_amount
  WHERE id = p_user_id;

  -- Log usage
  INSERT INTO credit_usage (user_id, procedure_id, credits_used, action)
  VALUES (p_user_id, p_procedure_id, p_amount, p_action);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION deduct_user_credit(UUID, UUID, TEXT, INTEGER) TO authenticated;

-- Reset monthly credits function (for cron job)
CREATE OR REPLACE FUNCTION reset_monthly_credits()
RETURNS void AS $$
BEGIN
  UPDATE users
  SET
    credits_remaining = CASE
      WHEN plan = 'free' THEN 3
      WHEN plan = 'starter' THEN 20
      WHEN plan = 'pro' THEN 100
      WHEN plan = 'business' THEN 999999
    END,
    credits_reset_at = DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
  WHERE credits_reset_at IS NULL
    OR credits_reset_at <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION generate_public_slug() IS 'Generates a random 12-character slug for public sharing';
COMMENT ON FUNCTION increment_procedure_views(TEXT) IS 'Increments view count for public procedures';
COMMENT ON FUNCTION deduct_user_credit(UUID, UUID, TEXT, INTEGER) IS 'Deducts credits from user and logs usage';

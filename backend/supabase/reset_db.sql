-- DANGER: This script will DROP ALL tables and types
-- Use only in development to reset the database

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
DROP FUNCTION IF EXISTS update_updated_at();
DROP FUNCTION IF EXISTS generate_public_slug();
DROP FUNCTION IF EXISTS increment_procedure_views(TEXT);
DROP FUNCTION IF EXISTS deduct_user_credit(UUID, UUID, TEXT, INT);
DROP FUNCTION IF EXISTS update_procedure_step_count();
DROP FUNCTION IF EXISTS update_sop_documents_updated_at();

-- Drop triggers (if they exist)
DROP TRIGGER IF EXISTS users_updated_at ON users;
DROP TRIGGER IF EXISTS procedures_updated_at ON procedures;
DROP TRIGGER IF EXISTS procedure_step_count_trigger ON steps;
DROP TRIGGER IF EXISTS sop_documents_updated_at ON sop_documents;

-- Drop storage policies (optional - comment out if not needed)
DROP POLICY IF EXISTS screenshots_insert ON storage.objects;
DROP POLICY IF EXISTS screenshots_select ON storage.objects;
DROP POLICY IF EXISTS screenshots_delete ON storage.objects;
DROP POLICY IF EXISTS annotated_select ON storage.objects;
DROP POLICY IF EXISTS public_select ON storage.objects;
DROP POLICY IF EXISTS exports_select ON storage.objects;

-- Clear migrations table to allow re-running
DELETE FROM supabase_migrations.schema_migrations;

-- Done! Now you can run: npx supabase db push

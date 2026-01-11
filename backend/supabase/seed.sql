-- Seed data for development and testing
-- Note: This requires a test user to be created in auth.users first

-- Example test data (uncomment and modify UUIDs as needed)
/*

-- Create a test user (this would normally be done through auth signup)
-- INSERT INTO auth.users (id, email) VALUES ('00000000-0000-0000-0000-000000000001', 'test@example.com');

-- Update test user profile
UPDATE users SET
  name = 'Test User',
  plan = 'pro',
  credits_remaining = 100,
  credits_reset_at = DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
WHERE email = 'test@example.com';

-- Create a sample procedure
INSERT INTO procedures (id, user_id, title, description, status, is_public, public_slug, step_count)
SELECT
  'a0000000-0000-0000-0000-000000000001',
  id,
  'Como cadastrar um cliente no CRM',
  'Processo passo a passo para cadastrar novos clientes no sistema CRM',
  'ready',
  TRUE,
  'demo123abc',
  3
FROM users WHERE email = 'test@example.com';

-- Create sample steps for the procedure
INSERT INTO steps (procedure_id, order_index, action_type, element_text, page_url, page_title, generated_text, captured_at)
VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    1,
    'click',
    'Clientes',
    'https://crm.example.com/dashboard',
    'Dashboard - CRM',
    'Clique no menu "Clientes" na barra lateral esquerda para acessar a seção de gerenciamento de clientes.',
    NOW() - INTERVAL '1 hour'
  ),
  (
    'a0000000-0000-0000-0000-000000000001',
    2,
    'click',
    'Novo Cliente',
    'https://crm.example.com/clients',
    'Clientes - CRM',
    'Clique no botão "Novo Cliente" no canto superior direito para iniciar o cadastro de um novo cliente.',
    NOW() - INTERVAL '59 minutes'
  ),
  (
    'a0000000-0000-0000-0000-000000000001',
    3,
    'input',
    'Nome do cliente',
    'https://crm.example.com/clients/new',
    'Novo Cliente - CRM',
    'Preencha o campo "Nome do cliente" com o nome completo do cliente que deseja cadastrar.',
    NOW() - INTERVAL '58 minutes'
  );

*/

-- Always create a function to easily reset test data
CREATE OR REPLACE FUNCTION reset_test_data()
RETURNS void AS $$
BEGIN
  -- Delete test procedures and their steps (cascade)
  DELETE FROM procedures WHERE title LIKE '%[TEST]%';

  -- Reset credits for test users
  UPDATE users
  SET credits_remaining = 100
  WHERE email LIKE '%test%' OR email LIKE '%example%';

  RAISE NOTICE 'Test data reset complete';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION reset_test_data() IS 'Resets test data for development environment';

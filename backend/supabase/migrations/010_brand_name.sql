-- Add brand_name field to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS brand_name TEXT;

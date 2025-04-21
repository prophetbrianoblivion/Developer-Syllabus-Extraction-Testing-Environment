/*
  # Fix Authentication Schema and Permissions

  1. Changes
    - Ensure auth schema is properly configured
    - Add missing indices
    - Fix permissions for authentication functions
    - Update RLS policies
*/

-- Enable required extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Ensure auth schema exists
CREATE SCHEMA IF NOT EXISTS auth;

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;

-- Ensure proper permissions on auth functions
GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.role() TO authenticated;

-- Add missing indices for performance
CREATE INDEX IF NOT EXISTS users_email_idx ON auth.users (email);
CREATE INDEX IF NOT EXISTS users_instance_id_idx ON auth.users (instance_id);
CREATE INDEX IF NOT EXISTS identities_user_id_idx ON auth.identities (user_id);

-- Update RLS policies with proper security definer context
ALTER POLICY "Users can read own data" ON auth.users USING (auth.uid() = id);
ALTER POLICY "Users can update own data" ON auth.users USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Ensure proper table ownership
ALTER TABLE IF EXISTS auth.users OWNER TO supabase_auth_admin;
ALTER TABLE IF EXISTS auth.identities OWNER TO supabase_auth_admin;

-- Reset session context to ensure clean state
SELECT set_config('role', 'authenticated', false);
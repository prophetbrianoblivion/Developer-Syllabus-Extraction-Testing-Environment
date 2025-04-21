/*
  # Authentication Schema Setup

  1. Schema Changes
    - Enable auth schema extensions
    - Set up auth schema policies
  
  2. Security
    - Add RLS policies for auth.users
    - Configure secure defaults
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set up RLS policies for auth.users
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own data
CREATE POLICY "Users can read own data"
ON auth.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy to allow users to update their own data
CREATE POLICY "Users can update own data"
ON auth.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
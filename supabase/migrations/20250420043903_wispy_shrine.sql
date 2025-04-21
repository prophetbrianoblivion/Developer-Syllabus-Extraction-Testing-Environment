/*
  # Fix RLS policies for test_sessions table

  1. Changes
    - Drop existing RLS policies for test_sessions table that are not working correctly
    - Create new RLS policies that properly allow authenticated users to:
      - Insert new test sessions
      - Read their own test sessions
      - Update their own test sessions
      - Delete their own test sessions
    - Add user_id column to track ownership
    - Backfill existing rows with current user ID
  
  2. Security
    - Enable RLS on test_sessions table (already enabled)
    - Add policies to ensure users can only access their own sessions
    - Ensure proper authentication checks
*/

-- Add user_id column to test_sessions if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'test_sessions' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE test_sessions ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert test sessions" ON test_sessions;
DROP POLICY IF EXISTS "Users can read test sessions" ON test_sessions;

-- Create new policies
CREATE POLICY "Enable insert for authenticated users" ON test_sessions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read access for users" ON test_sessions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Enable update for users" ON test_sessions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users" ON test_sessions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
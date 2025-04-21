/*
  # Fix email_change column in auth.users table

  1. Changes
    - Set email_change column to NOT NULL with empty string default
    - Update any existing NULL values to empty string
    - Add other missing default values for auth columns
  
  2. Details
    - Ensures email_change column never contains NULL values
    - Maintains data consistency
    - Prevents NULL to string conversion errors
*/

-- Update existing NULL values to empty string
UPDATE auth.users 
SET email_change = ''
WHERE email_change IS NULL;

-- Set NOT NULL constraint and default value
ALTER TABLE auth.users
ALTER COLUMN email_change SET NOT NULL,
ALTER COLUMN email_change SET DEFAULT '',
ALTER COLUMN email_change_token_current SET NOT NULL,
ALTER COLUMN email_change_token_current SET DEFAULT '',
ALTER COLUMN email_change_token_new SET NOT NULL,
ALTER COLUMN email_change_token_new SET DEFAULT '',
ALTER COLUMN phone_change SET NOT NULL,
ALTER COLUMN phone_change SET DEFAULT '',
ALTER COLUMN phone_change_token SET NOT NULL,
ALTER COLUMN phone_change_token SET DEFAULT '',
ALTER COLUMN reauthentication_token SET NOT NULL,
ALTER COLUMN reauthentication_token SET DEFAULT '';

-- Add missing indices
CREATE INDEX IF NOT EXISTS users_email_change_idx ON auth.users (email_change);
CREATE INDEX IF NOT EXISTS users_phone_change_idx ON auth.users (phone_change);

-- Reset session context
SELECT set_config('role', 'authenticated', false);
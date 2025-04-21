/*
  # Create hardcoded users if they don't exist
  
  Creates two users with email/password authentication:
  - paul@ringger.me
  - paul.ringger@gmail.com
  
  Includes checks to prevent duplicate user creation
*/

-- Enable the pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
BEGIN
  -- Create first user if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'paul@ringger.me') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      confirmation_token,
      email_change_token_current,
      email_change_token_new,
      recovery_token,
      raw_app_meta_data,
      raw_user_meta_data
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      user1_id,
      'authenticated',
      'authenticated',
      'paul@ringger.me',
      crypt('bpg1hxw8xmj_EFQ3qyb', gen_salt('bf')),
      now(),
      now(),
      now(),
      '',
      '',
      '',
      '',
      '{"provider":"email","providers":["email"]}',
      '{}'
    );

    -- Create identity for first user
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES
    (
      gen_random_uuid(),
      user1_id,
      jsonb_build_object('sub', user1_id::text, 'email', 'paul@ringger.me'),
      'email',
      'paul@ringger.me',
      now(),
      now(),
      now()
    );
  END IF;

  -- Create second user if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'paul.ringger@gmail.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      confirmation_token,
      email_change_token_current,
      email_change_token_new,
      recovery_token,
      raw_app_meta_data,
      raw_user_meta_data
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      user2_id,
      'authenticated',
      'authenticated',
      'paul.ringger@gmail.com',
      crypt('bpg1hxw8xmj_EFQ3qyb', gen_salt('bf')),
      now(),
      now(),
      now(),
      '',
      '',
      '',
      '',
      '{"provider":"email","providers":["email"]}',
      '{}'
    );

    -- Create identity for second user
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES
    (
      gen_random_uuid(),
      user2_id,
      jsonb_build_object('sub', user2_id::text, 'email', 'paul.ringger@gmail.com'),
      'email',
      'paul.ringger@gmail.com',
      now(),
      now(),
      now()
    );
  END IF;
END $$;
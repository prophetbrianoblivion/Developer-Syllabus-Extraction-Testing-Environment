/*
  # Add hardcoded users
  
  1. Changes
    - Create two users with specified email addresses
    - Set up auth identities with required provider_id field
*/

DO $$
DECLARE
  user1_id uuid;
  user2_id uuid;
BEGIN
  -- Create first user
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
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
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
    ''
  )
  RETURNING id INTO user1_id;

  -- Create second user
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
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
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
    ''
  )
  RETURNING id INTO user2_id;

  -- Insert identities for the users
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
  ),
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
END $$;
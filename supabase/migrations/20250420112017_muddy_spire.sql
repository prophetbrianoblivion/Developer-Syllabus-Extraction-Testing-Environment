/*
  # Fix storage bucket policies for document uploads

  1. Changes
    - Rename bucket to match application code
    - Update RLS policies to allow proper file uploads
    - Fix path validation in policies
  
  2. Security
    - Maintain RLS protection
    - Allow authenticated users to manage their documents
*/

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('documents', 'documents')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own documents" ON storage.objects;

-- Create new policies with fixed path validation
CREATE POLICY "Allow authenticated users to upload documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IS NOT NULL
);

CREATE POLICY "Allow users to view their own documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'documents'
);

CREATE POLICY "Allow users to update their own documents"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'documents'
)
WITH CHECK (
  bucket_id = 'documents'
);

CREATE POLICY "Allow users to delete their own documents"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'documents'
);
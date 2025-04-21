import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Document storage functions
export const uploadDocument = async (file: File, sessionId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${sessionId}/${file.name}`;
  const filePath = `documents/${fileName}`;

  const { data, error } = await supabase.storage
    .from('syllabus-documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`Error uploading document: ${error.message}`);
  }

  return { path: filePath, name: file.name, type: fileExt };
};

export const getDocumentUrl = async (path: string) => {
  const { data, error } = await supabase.storage
    .from('syllabus-documents')
    .createSignedUrl(path, 3600);

  if (error) {
    throw new Error(`Error getting document URL: ${error.message}`);
  }

  return data.signedUrl;
};

// Session management functions
export const createSession = async (name: string, description: string) => {
  const { data, error } = await supabase
    .from('test_sessions')
    .insert([{ name, description, created_at: new Date().toISOString() }])
    .select();

  if (error) {
    throw new Error(`Error creating session: ${error.message}`);
  }

  return data[0];
};

export const getSessions = async () => {
  const { data, error } = await supabase
    .from('test_sessions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching sessions: ${error.message}`);
  }

  return data;
};

// Results storage functions
export const saveExtractionResult = async (
  sessionId: string,
  documentId: string,
  rawContent: string,
  promptUsed: string,
  extractedData: any,
  metrics: any
) => {
  const { data, error } = await supabase
    .from('extraction_results')
    .insert([{
      session_id: sessionId,
      document_id: documentId,
      raw_content: rawContent,
      prompt_used: promptUsed,
      extracted_data: extractedData,
      metrics,
      created_at: new Date().toISOString()
    }])
    .select();

  if (error) {
    throw new Error(`Error saving extraction result: ${error.message}`);
  }

  return data[0];
};

export const getExtractionResults = async (sessionId: string) => {
  const { data, error } = await supabase
    .from('extraction_results')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching extraction results: ${error.message}`);
  }

  return data;
};
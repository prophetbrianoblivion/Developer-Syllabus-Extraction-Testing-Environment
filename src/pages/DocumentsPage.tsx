import React, { useState } from 'react';
import DocumentUploader from '../components/DocumentUploader';
import { supabase } from '../api/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadStatus: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
  path?: string;
}

const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);

  const handleUploadComplete = async (files: File[]) => {
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return;
    }

    // Create a new test session with user_id
    const { data: session, error: sessionError } = await supabase
      .from('test_sessions')
      .insert([{
        name: `Upload Session ${new Date().toLocaleString()}`,
        description: `Batch upload of ${files.length} files`,
        user_id: user.id
      }])
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      return;
    }

    // Initialize documents with pending status
    const newDocuments = files.map(file => ({
      id: uuidv4(),
      name: file.name,
      size: file.size,
      type: file.name.split('.').pop() || 'unknown',
      uploadStatus: 'pending' as const
    }));

    setDocuments(prev => [...prev, ...newDocuments]);

    // Upload each file
    for (let i = 0; i < files.length; i++) {
      const doc = newDocuments[i];
      const file = files[i];

      try {
        // Update status to uploading
        setDocuments(prev => 
          prev.map(d => 
            d.id === doc.id 
              ? { ...d, uploadStatus: 'uploading' }
              : d
          )
        );

        // Create a safe filename by removing special characters
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        
        // Upload to storage with user ID in path
        const filePath = `${user.id}/${session.id}/${safeFileName}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Create document record
        const { error: docError } = await supabase
          .from('documents')
          .insert([{
            session_id: session.id,
            name: file.name,
            path: filePath,
            type: doc.type,
            size: file.size
          }]);

        if (docError) throw docError;

        // Update status to complete
        setDocuments(prev => 
          prev.map(d => 
            d.id === doc.id 
              ? { ...d, uploadStatus: 'complete', path: filePath }
              : d
          )
        );
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        setDocuments(prev => 
          prev.map(d => 
            d.id === doc.id 
              ? { 
                  ...d, 
                  uploadStatus: 'error',
                  error: error instanceof Error ? error.message : 'Upload failed'
                }
              : d
          )
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Document Processing</h1>
      <DocumentUploader onUploadComplete={handleUploadComplete} />
      
      {/* Display uploaded documents */}
      {documents.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-white mb-4">Uploaded Documents</h2>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div 
                key={doc.id}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-md"
              >
                <div className="flex items-center flex-1 min-w-0">
                  <div className="truncate">
                    <div className="text-sm text-gray-300 truncate">{doc.name}</div>
                    <div className="text-xs text-gray-500">
                      {(doc.size / 1024).toFixed(1)} KB • {doc.type}
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  {doc.uploadStatus === 'pending' && (
                    <span className="text-sm text-gray-400">Pending</span>
                  )}
                  {doc.uploadStatus === 'uploading' && (
                    <span className="text-sm text-cyan-400">Uploading...</span>
                  )}
                  {doc.uploadStatus === 'complete' && (
                    <span className="text-sm text-green-400">Complete</span>
                  )}
                  {doc.uploadStatus === 'error' && (
                    <span className="text-sm text-red-400" title={doc.error}>Error</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage
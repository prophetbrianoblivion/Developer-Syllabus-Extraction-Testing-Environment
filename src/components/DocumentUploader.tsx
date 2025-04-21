import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Upload, X, AlertCircle } from 'lucide-react';

interface DocumentUploaderProps {
  onUploadComplete: (files: File[]) => void;
  maxFiles?: number;
  acceptedFileTypes?: string[];
}

interface FileWithPreview extends File {
  preview?: string;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onUploadComplete,
  maxFiles = 10,
  acceptedFileTypes = ['.pdf', '.docx', '.doc', '.txt']
}) => {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    if (selectedFiles.length + acceptedFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));

    setSelectedFiles(prev => [...prev, ...newFiles]);
  }, [selectedFiles.length, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt']
    },
    maxFiles,
    multiple: true
  });

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }
    onUploadComplete(selectedFiles);
    // Clear selected files after upload
    selectedFiles.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setSelectedFiles([]);
  };

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-cyan-400 bg-cyan-50/5' : 'border-gray-600 hover:border-cyan-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-300">
          {isDragActive ? 'Drop files here...' : 'Drag & drop files here'}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          {acceptedFileTypes.join(', ')} files accepted (max {maxFiles})
        </p>
        <button className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors">
          Browse Files
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-white">
              Selected Files ({selectedFiles.length}/{maxFiles})
            </h3>
            <button 
              onClick={() => setSelectedFiles([])}
              className="text-sm text-gray-400 hover:text-white"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2 mb-4">
            {selectedFiles.map((file, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-md"
              >
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm text-gray-300">{file.name}</div>
                    <div className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-gray-600 rounded"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-white" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleUpload}
            className="w-full px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors flex items-center justify-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'}
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;
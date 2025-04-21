import React, { useState, useEffect } from 'react';
import { Save, Copy, RotateCcw } from 'lucide-react';

interface PromptEditorProps {
  initialPrompt: string;
  onSave: (prompt: string) => void;
  readOnly?: boolean;
  showTokenCount?: boolean;
}

const PromptEditor: React.FC<PromptEditorProps> = ({
  initialPrompt,
  onSave,
  readOnly = false,
  showTokenCount = true
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [tokenCount, setTokenCount] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  
  // Estimate token count (very rough estimation)
  useEffect(() => {
    // Roughly 4 characters per token for GPT models
    const estimatedTokens = Math.ceil(prompt.length / 4);
    setTokenCount(estimatedTokens);
  }, [prompt]);
  
  const handleSave = () => {
    onSave(prompt);
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const handleReset = () => {
    setPrompt(initialPrompt);
  };
  
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between bg-gray-700 px-4 py-2">
        <h3 className="font-medium text-white">Extraction Prompt</h3>
        <div className="flex items-center space-x-2">
          {showTokenCount && (
            <div className="text-xs text-gray-400">
              ~{tokenCount} tokens
            </div>
          )}
          {!readOnly && (
            <>
              <button 
                onClick={handleReset}
                className="p-1 rounded hover:bg-gray-600"
                title="Reset to original prompt"
              >
                <RotateCcw className="h-4 w-4 text-gray-400" />
              </button>
              <button 
                onClick={handleCopy}
                className="p-1 rounded hover:bg-gray-600"
                title="Copy prompt"
              >
                <Copy className="h-4 w-4 text-gray-400" />
              </button>
              <button 
                onClick={handleSave}
                className="px-3 py-1 bg-cyan-600 rounded text-white text-sm hover:bg-cyan-700 transition-colors flex items-center"
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </button>
            </>
          )}
        </div>
      </div>
      
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full bg-gray-900 text-gray-300 p-4 font-mono text-sm"
        rows={15}
        disabled={readOnly}
        placeholder="Enter your extraction prompt here..."
        style={{ resize: 'vertical' }}
      />
      
      {isCopied && (
        <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded text-sm">
          Copied!
        </div>
      )}
    </div>
  );
};

export default PromptEditor;
import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  PlayCircle, 
  Trash2, 
  Download, 
  ArrowDown,
  Clock,
  AlertCircle,
  Info,
  Check
} from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'error' | 'warn' | 'success';
  message: string;
  details?: any;
}

const DebugConsole: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});
  
  // Simulate generating logs
  useEffect(() => {
    const initialLogs: LogEntry[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 60000 * 5),
        type: 'info',
        message: 'Deepseek API connection established',
        details: {
          endpoint: 'https://api.deepseek.com/v1',
          status: 'connected',
          latency: '124ms'
        }
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 60000 * 4),
        type: 'info',
        message: 'Document processing started',
        details: {
          filename: 'CS101-Fall2023.pdf',
          size: '245KB',
          processingEngine: 'pdfjs-dist@4.0.379'
        }
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 60000 * 3),
        type: 'warn',
        message: 'Unusual token consumption detected',
        details: {
          promptTokens: 1245,
          completionTokens: 3782,
          expectedTokens: '~3000',
          recommendation: 'Consider optimizing prompt'
        }
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 60000 * 2),
        type: 'error',
        message: 'Failed to parse extracted JSON data',
        details: {
          error: 'Unexpected token } in JSON at position 423',
          rawResponse: '{"course": {"code": "CS101", "title": "Introduction to Computer Science", "instructor": "Dr. John Smith", "term": "Fall 2023"}, "events": [{"name": "Midterm Exam", "type": "exam", "date": "2023-10-15", "description": "Covers chapters 1-5"}},',
          recommendation: 'Check prompt for JSON structure guidance'
        }
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 60000),
        type: 'success',
        message: 'Extraction completed successfully',
        details: {
          documentId: 'doc_835f2a1b',
          processingTime: '2.34s',
          tokensUsed: 4523,
          events: 12,
          dates: 15
        }
      }
    ];
    
    setLogs(initialLogs);
  }, []);
  
  const toggleLogExpanded = (logId: string) => {
    setExpandedLogs(prev => ({
      ...prev,
      [logId]: !prev[logId]
    }));
  };
  
  const clearLogs = () => {
    setLogs([]);
    setExpandedLogs({});
  };
  
  const downloadLogs = () => {
    const logsJson = JSON.stringify(logs, null, 2);
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `syllabus-extractor-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const getIconForLogType = (type: LogEntry['type']) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'warn':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case 'success':
        return <Check className="h-4 w-4 text-green-400" />;
      default:
        return <Info className="h-4 w-4 text-gray-400" />;
    }
  };
  
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Debug Console</h1>
        <div className="flex items-center space-x-3">
          <button
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 flex items-center"
            onClick={downloadLogs}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </button>
          <button
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 flex items-center"
            onClick={clearLogs}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </button>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="bg-gray-700 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center">
            <Terminal className="h-5 w-5 text-cyan-400 mr-2" />
            <h2 className="font-medium text-white">System Logs</h2>
          </div>
          <button
            className="p-1 rounded hover:bg-gray-600"
            title="Scroll to bottom"
            onClick={() => {
              // Scroll to bottom of log container
              const container = document.getElementById('log-container');
              if (container) {
                container.scrollTop = container.scrollHeight;
              }
            }}
          >
            <ArrowDown className="h-4 w-4 text-gray-400" />
          </button>
        </div>
        
        <div 
          id="log-container"
          className="h-[calc(100vh-250px)] overflow-y-auto p-4 font-mono text-sm space-y-2"
        >
          {logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="border-b border-gray-700 pb-2 last:border-b-0">
                <div 
                  className="flex items-start cursor-pointer p-2 hover:bg-gray-750 rounded-md"
                  onClick={() => toggleLogExpanded(log.id)}
                >
                  {getIconForLogType(log.type)}
                  <div className="ml-2 flex-1">
                    <div className="flex items-center text-gray-300">
                      <span className="text-gray-500 mr-2 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimestamp(log.timestamp)}
                      </span>
                      {log.message}
                    </div>
                    
                    {expandedLogs[log.id] && log.details && (
                      <div className="mt-2 pl-2 border-l-2 border-gray-700">
                        <pre className="text-gray-400 text-xs overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No logs to display
            </div>
          )}
        </div>
        
        <div className="bg-gray-750 border-t border-gray-700 p-3 flex items-center">
          <PlayCircle className="h-4 w-4 text-cyan-400 mr-2" />
          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-gray-300 placeholder-gray-600"
            placeholder="Execute command..."
          />
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Request Inspector</h2>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Last Request</h3>
            <pre className="bg-gray-750 rounded-md p-3 text-xs text-gray-300 overflow-auto max-h-40">
{`POST https://api.deepseek.com/v1/chat/completions
Content-Type: application/json
Authorization: Bearer sk_...

{
  "model": "deepseek-coder",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant that extracts structured data from syllabus documents."
    },
    {
      "role": "user",
      "content": "Extract all academic events, deadlines, and important dates..."
    }
  ],
  "max_tokens": 2048,
  "temperature": 0.2
}`}
            </pre>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Last Response</h3>
            <pre className="bg-gray-750 rounded-md p-3 text-xs text-gray-300 overflow-auto max-h-40">
{`{
  "id": "chatcmpl-8f5Vzr2WhPnqZs38hcKJN5V2P5Rkl",
  "object": "chat.completion",
  "created": 1684137677,
  "model": "deepseek-coder",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "\`\`\`json\\n{\\n  \\"course\\": {\\n    \\"code\\": \\"CS101\\",\\n    \\"title\\": \\"Introduction to Computer Science\\"..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 1245,
    "completion_tokens": 3782,
    "total_tokens": 5027
  }
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugConsole;
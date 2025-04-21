import React, { useState } from 'react';
import PromptEditor from '../components/PromptEditor';
import { 
  Save, 
  PlayCircle, 
  ListPlus, 
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Check,
  Loader,
  FileText
} from 'lucide-react';

// Default prompt template
const defaultPrompt = `You are an AI assistant specialized in extracting academic calendar information from college syllabus documents.

Extract all relevant dates, deadlines, and events from the syllabus and format them as a structured JSON object.

Focus on identifying:
1. Course information (code, title, instructor, term)
2. Important dates (assignments, exams, holidays, etc.)
3. Weekly schedule
4. Office hours

Return a JSON object with the following structure:
{
  "course": {
    "code": "string",
    "title": "string",
    "instructor": "string",
    "term": "string"
  },
  "events": [
    {
      "name": "string",
      "type": "string", // (assignment, exam, holiday, etc.)
      "date": "YYYY-MM-DD",
      "description": "string",
      "location": "string" // optional
    }
  ],
  "weeklySchedule": [
    {
      "day": "string", // (Monday, Tuesday, etc.)
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "location": "string"
    }
  ],
  "officeHours": [
    {
      "day": "string",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "location": "string"
    }
  ]
}

If certain information is not found in the syllabus, leave those fields empty or omit them. Only include fields that you have high confidence about.`;

interface PromptVersion {
  id: string;
  name: string;
  content: string;
  notes?: string;
  createdAt: string;
}

interface TestResult {
  id: string;
  docName: string;
  accuracy: number;
  processingTime: number;
  tokensUsed: number;
}

const PromptLab: React.FC = () => {
  const [currentPrompt, setCurrentPrompt] = useState(defaultPrompt);
  const [isPromptMenuOpen, setIsPromptMenuOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  
  // Sample prompt versions
  const [promptVersions, setPromptVersions] = useState<PromptVersion[]>([
    {
      id: '1',
      name: 'Base Template v1.0',
      content: defaultPrompt,
      createdAt: '2023-05-01'
    },
    {
      id: '2',
      name: 'Enhanced Date Recognition v1.1',
      content: defaultPrompt + '\n\nBe particularly careful about date formats. Parse dates in any format (MM/DD/YYYY, Month Day Year, etc.) and convert them to YYYY-MM-DD format.',
      notes: 'Improved date format handling',
      createdAt: '2023-05-05'
    },
    {
      id: '3',
      name: 'Better Event Type Classification v1.2',
      content: defaultPrompt + '\n\nClassify event types into these categories: lecture, assignment, exam, project, holiday, office-hours, deadline.',
      notes: 'Added clearer event type classification',
      createdAt: '2023-05-10'
    }
  ]);
  
  // Sample test documents
  const testDocuments = [
    { id: '1', name: 'CS101-Fall2023.pdf', size: '245 KB' },
    { id: '2', name: 'ENG201-Spring2023.docx', size: '176 KB' },
    { id: '3', name: 'MATH305-Summer2023.pdf', size: '312 KB' }
  ];
  
  // Sample test results
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  
  const handleSavePrompt = () => {
    // New version based on current prompt
    const newVersion: PromptVersion = {
      id: (promptVersions.length + 1).toString(),
      name: `Version ${promptVersions.length + 1}.0`,
      content: currentPrompt,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setPromptVersions([...promptVersions, newVersion]);
  };
  
  const handleSelectPrompt = (version: PromptVersion) => {
    setCurrentPrompt(version.content);
    setIsPromptMenuOpen(false);
  };
  
  const handleRunTest = () => {
    if (!selectedDocument) return;
    
    setIsTesting(true);
    
    // Simulate a test run
    setTimeout(() => {
      const newResult: TestResult = {
        id: Date.now().toString(),
        docName: testDocuments.find(d => d.id === selectedDocument)?.name || '',
        accuracy: Math.floor(Math.random() * 30) + 70, // Random accuracy between 70-99%
        processingTime: Math.floor(Math.random() * 2000) + 1000, // 1-3 seconds
        tokensUsed: Math.floor(Math.random() * 2000) + 3000 // 3000-5000 tokens
      };
      
      setTestResults([newResult, ...testResults]);
      setIsTesting(false);
    }, 2000);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Prompt Engineering Lab</h1>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 flex items-center"
              onClick={() => setIsPromptMenuOpen(!isPromptMenuOpen)}
            >
              <span>Prompt Versions</span>
              {isPromptMenuOpen ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </button>
            
            {isPromptMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
                <div className="p-2">
                  {promptVersions.map(version => (
                    <button
                      key={version.id}
                      className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded-md text-sm flex items-center"
                      onClick={() => handleSelectPrompt(version)}
                    >
                      <span className="text-gray-300">{version.name}</span>
                      {version.content === currentPrompt && (
                        <Check className="h-4 w-4 ml-auto text-cyan-400" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-700 p-2">
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded-md text-sm flex items-center text-cyan-400"
                    onClick={handleSavePrompt}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Current as New Version
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button
            className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors flex items-center"
            onClick={handleSavePrompt}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        {/* Prompt Editor */}
        <div className="col-span-2">
          <PromptEditor 
            initialPrompt={currentPrompt} 
            onSave={setCurrentPrompt} 
          />
        </div>
        
        {/* Test Controls */}
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Test Document</h2>
            
            <div className="space-y-3">
              {testDocuments.map(doc => (
                <div
                  key={doc.id}
                  className={`p-3 rounded-md cursor-pointer flex items-center justify-between ${
                    doc.id === selectedDocument 
                      ? 'bg-gray-700 border-l-2 border-cyan-400' 
                      : 'bg-gray-750 hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedDocument(doc.id)}
                >
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <div className="text-gray-300">{doc.name}</div>
                      <div className="text-xs text-gray-500">{doc.size}</div>
                    </div>
                  </div>
                  {doc.id === selectedDocument && (
                    <div className="w-4 h-4 bg-cyan-400 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4">
              <button
                className="w-full px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors flex items-center justify-center"
                onClick={handleRunTest}
                disabled={!selectedDocument || isTesting}
              >
                {isTesting ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Running Test...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Run Test
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Prompt Analytics</h2>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Token Estimation</div>
                <div className="text-xl font-semibold text-white">
                  ~{Math.ceil(currentPrompt.length / 4)} tokens
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Specificity Score</div>
                <div className="flex items-center">
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                      style={{ width: '83%' }}
                    ></div>
                  </div>
                  <span className="ml-2 text-white font-medium">83%</span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Clarity Score</div>
                <div className="flex items-center">
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                      style={{ width: '78%' }}
                    ></div>
                  </div>
                  <span className="ml-2 text-white font-medium">78%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Test Results</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 text-left text-sm">
                  <th className="pb-3 font-medium">Document</th>
                  <th className="pb-3 font-medium">
                    <div className="flex items-center">
                      Accuracy
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </div>
                  </th>
                  <th className="pb-3 font-medium">
                    <div className="flex items-center">
                      Processing Time
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </div>
                  </th>
                  <th className="pb-3 font-medium">
                    <div className="flex items-center">
                      Tokens Used
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </div>
                  </th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {testResults.map((result) => (
                  <tr key={result.id} className="border-t border-gray-700">
                    <td className="py-3 text-white">{result.docName}</td>
                    <td className="py-3">
                      <div className="flex items-center">
                        <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              result.accuracy >= 90 ? 'bg-green-500' : 
                              result.accuracy >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${result.accuracy}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-gray-400">{result.accuracy}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-400">
                      {(result.processingTime / 1000).toFixed(2)}s
                    </td>
                    <td className="py-3 text-gray-400">
                      {result.tokensUsed.toLocaleString()}
                    </td>
                    <td className="py-3 text-right">
                      <button className="text-cyan-400 hover:text-cyan-300">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptLab;
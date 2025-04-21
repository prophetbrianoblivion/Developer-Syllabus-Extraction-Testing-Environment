import React from 'react';
import { Database, Plus, ChevronRight } from 'lucide-react';

const TestSessionsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Test Sessions</h1>
        <button className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          New Session
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="text-center py-8">
          <Database className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-white mb-2">No Test Sessions Yet</h2>
          <p className="text-gray-400 mb-6">Create your first test session to start processing documents</p>
          <button className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors flex items-center mx-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Test Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestSessionsPage;
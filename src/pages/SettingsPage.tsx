import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { initializeDeepseekAPI, testConnection } from '../api/deepseekAPI';
import { supabase } from '../api/supabaseClient';

interface Settings {
  deepseekApiKey: string;
  deepseekModel: string;
  maxTokens: number;
  temperature: number;
  supabaseUrl: string;
  supabaseKey: string;
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    deepseekApiKey: '',
    deepseekModel: 'deepseek-chat',
    maxTokens: 2048,
    temperature: 0.2,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  });
  
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'untested' | 'success' | 'error'>('untested');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  
  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('syllabus-extractor-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(prev => ({
        ...prev,
        ...parsed
      }));
      
      // Initialize API with saved settings
      initializeDeepseekAPI({
        apiKey: parsed.deepseekApiKey,
        model: parsed.deepseekModel,
        maxTokens: parsed.maxTokens
      });
    }
  }, []);
  
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Initialize Deepseek API with new settings
      initializeDeepseekAPI({
        apiKey: settings.deepseekApiKey,
        model: settings.deepseekModel,
        maxTokens: settings.maxTokens
      });
      
      // Save to localStorage
      localStorage.setItem('syllabus-extractor-settings', JSON.stringify(settings));
      
      setSaveMessage('Settings saved successfully');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };
  
  const testDeepseekConnection = async () => {
    if (!settings.deepseekApiKey) {
      setSaveMessage('Please enter an API key first');
      return;
    }
    
    setIsTestingConnection(true);
    setConnectionStatus('untested');
    
    try {
      // Initialize API with current settings before testing
      initializeDeepseekAPI({
        apiKey: settings.deepseekApiKey,
        model: settings.deepseekModel,
        maxTokens: settings.maxTokens
      });
      
      const isConnected = await testConnection();
      setConnectionStatus(isConnected ? 'success' : 'error');
      setSaveMessage(isConnected ? 'Connection successful' : 'Connection failed');
    } catch (error) {
      setConnectionStatus('error');
      setSaveMessage('Connection failed');
    } finally {
      setIsTestingConnection(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <div className="flex items-center space-x-3">
          {saveMessage && (
            <span className={`text-sm ${
              saveMessage.includes('Error') || saveMessage.includes('failed') 
                ? 'text-red-400' 
                : 'text-green-400'
            }`}>
              {saveMessage}
            </span>
          )}
          <button
            className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors flex items-center"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
      
      {/* Deepseek API Settings */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Deepseek API Configuration</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              API Key
            </label>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={settings.deepseekApiKey}
                  onChange={(e) => setSettings(prev => ({ ...prev, deepseekApiKey: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md pl-3 pr-10 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="sk-..."
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <button
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 flex items-center"
                onClick={testDeepseekConnection}
                disabled={isTestingConnection || !settings.deepseekApiKey}
              >
                {isTestingConnection ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : connectionStatus === 'success' ? (
                  <Check className="h-4 w-4 mr-2 text-green-400" />
                ) : connectionStatus === 'error' ? (
                  <AlertCircle className="h-4 w-4 mr-2 text-red-400" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Test Connection
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Model
            </label>
            <select
              value={settings.deepseekModel}
              onChange={(e) => setSettings(prev => ({ ...prev, deepseekModel: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-300"
            >
              <option value="deepseek-chat">deepseek-chat (DeepSeek-V3)</option>
              <option value="deepseek-reasoner">deepseek-reasoner (DeepSeek-R1)</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Max Tokens
              </label>
              <input
                type="number"
                value={settings.maxTokens}
                onChange={(e) => setSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-300"
                min="1"
                max="8192"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Temperature
              </label>
              <input
                type="number"
                value={settings.temperature}
                onChange={(e) => setSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-300"
                min="0"
                max="2"
                step="0.1"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Supabase Configuration */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Supabase Configuration</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Project URL
            </label>
            <input
              type="text"
              value={settings.supabaseUrl}
              onChange={(e) => setSettings(prev => ({ ...prev, supabaseUrl: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-300"
              placeholder="https://your-project.supabase.co"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Anon Key
            </label>
            <input
              type="password"
              value={settings.supabaseKey}
              onChange={(e) => setSettings(prev => ({ ...prev, supabaseKey: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-300"
              placeholder="your-anon-key"
            />
          </div>
        </div>
      </div>
      
      {/* Document Processing Settings */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Document Processing</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Maximum File Size
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                defaultValue={10}
                className="w-24 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-300"
                min="1"
              />
              <span className="text-gray-400">MB</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Accepted File Types
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="form-checkbox text-cyan-500 bg-gray-700 border-gray-600 rounded" />
                <span className="ml-2 text-gray-300">.pdf - PDF Documents</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="form-checkbox text-cyan-500 bg-gray-700 border-gray-600 rounded" />
                <span className="ml-2 text-gray-300">.docx - Word Documents</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="form-checkbox text-cyan-500 bg-gray-700 border-gray-600 rounded" />
                <span className="ml-2 text-gray-300">.txt - Text Files</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      {/* Debug Settings */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Debug Options</h2>
        
        <div className="space-y-4">
          <div>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="form-checkbox text-cyan-500 bg-gray-700 border-gray-600 rounded" />
              <span className="ml-2 text-gray-300">Enable detailed logging</span>
            </label>
          </div>
          
          <div>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="form-checkbox text-cyan-500 bg-gray-700 border-gray-600 rounded" />
              <span className="ml-2 text-gray-300">Log API requests and responses</span>
            </label>
          </div>
          
          <div>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="form-checkbox text-cyan-500 bg-gray-700 border-gray-600 rounded" />
              <span className="ml-2 text-gray-300">Save debug information to local storage</span>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Log Retention Period
            </label>
            <select defaultValue="7" className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-300">
              <option value="1">1 day</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
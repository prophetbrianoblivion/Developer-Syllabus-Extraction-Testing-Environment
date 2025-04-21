import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DocumentsPage from './pages/DocumentsPage';
import PromptLab from './pages/PromptLab';
import DebugConsole from './pages/DebugConsole';
import SettingsPage from './pages/SettingsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LoginPage from './pages/LoginPage';
import TestSessionsPage from './pages/TestSessionsPage';
import { AuthProvider } from './components/AuthProvider';
import { Loader } from 'lucide-react';

// Lazy load ProtectedRoute to break circular dependency
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <Suspense fallback={
                <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <Loader className="h-8 w-8 text-cyan-400 animate-spin mx-auto" />
                    <p className="mt-4 text-gray-400">Loading...</p>
                  </div>
                </div>
              }>
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              </Suspense>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="prompt-lab" element={<PromptLab />} />
            <Route path="debug" element={<DebugConsole />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="sessions" element={<TestSessionsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
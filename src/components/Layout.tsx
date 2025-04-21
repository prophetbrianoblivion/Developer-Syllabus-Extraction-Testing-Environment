import React from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import Sidebar from './Layout/Sidebar';
import Header from './Layout/Header';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex">
      <Sidebar user={user} onSignOut={handleSignOut} />
      
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
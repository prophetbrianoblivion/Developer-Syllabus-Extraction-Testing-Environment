import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Beaker, 
  BarChart2, 
  Settings, 
  Database, 
  Terminal,
  LogOut
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  user: { email?: string };
  onSignOut: () => void;
}

const navItems: NavItem[] = [
  {
    path: '/',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />
  },
  {
    path: '/documents',
    label: 'Documents',
    icon: <FileText className="h-5 w-5" />
  },
  {
    path: '/prompt-lab',
    label: 'Prompt Lab',
    icon: <Beaker className="h-5 w-5" />
  },
  {
    path: '/analytics',
    label: 'Analytics',
    icon: <BarChart2 className="h-5 w-5" />
  },
  {
    path: '/debug',
    label: 'Debug Console',
    icon: <Terminal className="h-5 w-5" />
  },
  {
    path: '/sessions',
    label: 'Test Sessions',
    icon: <Database className="h-5 w-5" />
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: <Settings className="h-5 w-5" />
  }
];

const Sidebar: React.FC<SidebarProps> = ({ user, onSignOut }) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    return location.pathname.startsWith(path) && path !== '/';
  };

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700 flex items-center">
        <Beaker className="h-6 w-6 text-cyan-400 mr-2" />
        <h1 className="text-lg font-semibold text-white">Syllabus Extractor</h1>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  isActive(item.path)
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {React.cloneElement(item.icon as React.ReactElement, {
                  className: `h-5 w-5 mr-3 ${isActive(item.path) ? 'text-cyan-400' : 'text-gray-400'}`
                })}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <span className="text-sm text-gray-400">
              {user?.email?.split('@')[0]}
            </span>
          </div>
          <button
            onClick={onSignOut}
            className="p-1 rounded hover:bg-gray-700"
            title="Sign out"
          >
            <LogOut className="h-4 w-4 text-gray-400 hover:text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
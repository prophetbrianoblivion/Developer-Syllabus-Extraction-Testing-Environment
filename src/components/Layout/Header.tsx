import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Developer Testing Environment</h2>
        <div className="flex items-center">
          <span className="text-sm text-gray-400 mr-4">Token usage: 1,245,678</span>
          <button className="px-3 py-1 bg-cyan-600 rounded-md text-white hover:bg-cyan-700 transition-colors">
            New Session
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
'use client';

import React from 'react';
import { useApp } from '@/contexts/AppContext';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useApp();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <span className="text-2xl"></span>
            <h1 className="text-xl font-bold text-gray-800">
              打卡鸭
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {currentUser && (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{currentUser.avatar}</span>
                  <span className="text-gray-700 font-medium">
                    {currentUser.name}
                  </span>
                  <span className={`
                    px-2 py-1 rounded text-xs
                    ${currentUser.role === 'parent' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-yellow-100 text-yellow-800'
                    }
                  `}>
                    {currentUser.role === 'parent' ? '家长' : '孩子'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  退出
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import React from 'react';

interface GlobalLoadingProps {
  show: boolean;
  message?: string;
}

const GlobalLoading: React.FC<GlobalLoadingProps> = ({ show, message = '加载中...' }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default GlobalLoading;

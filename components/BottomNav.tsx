import React from 'react';
import { RouteConfig } from '@/config/routes';

interface BottomNavProps {
  routes: RouteConfig[];
  activeRouteId: string;
  onRouteChange: (routeId: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ routes, activeRouteId, onRouteChange }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-around">
          {routes.map((route) => (
            <button
              key={route.id}
              onClick={() => onRouteChange(route.id)}
              className={`
                flex-1 py-4 flex flex-col items-center transition-colors
                ${activeRouteId === route.id
                  ? 'text-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
                }
              `}
            >
              <span className="text-2xl mb-1">{route.icon}</span>
              <span className="text-sm font-medium">{route.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;

'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { routes, getRoutesByRole, getRouteByPath } from '@/config/routes';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import GlobalLoading from './GlobalLoading';

interface MainPageProps {
  children?: React.ReactNode;
}

const MainPage: React.FC<MainPageProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isOperationLoading } = useApp();
  
  // 根据当前用户角色获取可访问的路由
  const availableRoutes = currentUser ? getRoutesByRole(currentUser.role) : routes;
  
  // 根据当前路径获取活动路由
  const activeRoute = getRouteByPath(pathname) || availableRoutes[0];

  // 监听路由变化，更新页面标题
  useEffect(() => {
    if (activeRoute) {
      document.title = `${activeRoute.label}`;
    }
  }, [activeRoute]);

  // 处理路由切换
  const handleRouteChange = (routeId: string) => {
    const route = availableRoutes.find(r => r.id === routeId);
    if (route) {
      router.push(route.path);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="max-w-4xl mx-auto p-2">
        {/* 内容区域 */}
        <div className="bg-white rounded-lg shadow-md">
          {children}
        </div>
      </div>
      
      {/* 底部导航栏 */}
      <BottomNav 
        routes={availableRoutes} 
        activeRouteId={activeRoute.id} 
        onRouteChange={handleRouteChange} 
      />

      {/* 全局加载提示 */}
      <GlobalLoading show={isOperationLoading} />
    </div>
  );
};

export default MainPage;

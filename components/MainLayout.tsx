"use client";
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import BottomNav from './BottomNav';
import { routes } from '@/config/routes';

// 定义底部导航专用的路由类型
interface BottomNavRoute {
  id: string;
  path: string;
  label: string;
  icon: string;
}

// 底部导航的路由配置（只显示任务和星星）
const bottomNavRoutes: BottomNavRoute[] = [
  {
    id: 'tasks',
    path: '/tasks',
    label: '任务',
    icon: '🎯',
  },
  {
    id: 'stars',
    path: '/stars',
    label: '星星',
    icon: '⭐',
  },
];

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  // 判断当前是否在需要显示底部导航的页面
  const showBottomNav = pathname === '/tasks' || pathname === '/stars';

  // 获取当前激活的路由ID
  const activeRouteId = bottomNavRoutes.find(route => route.path === pathname)?.id || '';

  const handleRouteChange = (routeId: string) => {
    const route = bottomNavRoutes.find(r => r.id === routeId);
    if (route) {
      router.push(route.path);
    }
  };

  return (
    <div className="min-h-screen pb-16">
      {children}
      {showBottomNav && (
        <BottomNav
          routes={bottomNavRoutes}
          activeRouteId={activeRouteId}
          onRouteChange={handleRouteChange}
        />
      )}
    </div>
  );
};

export default MainLayout;

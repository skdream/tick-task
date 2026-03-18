"use client";

import { usePathname } from 'next/navigation';
import MainPage from './MainPage';
import AuthGuard from './AuthGuard';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

// 需要使用MainPage布局的路由
const mainPageRoutes = ['/tasks', '/stars'];

// 登录和注册页面路由
const authRoutes = ['/login', '/register'];

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const useMainPage = mainPageRoutes.includes(pathname);
  const useAuthPage = authRoutes.includes(pathname);

  if (useMainPage) {
    return (
      <AuthGuard>
        <MainPage>{children}</MainPage>
      </AuthGuard>
    );
  }

  if (useAuthPage) {
    return <>{children}</>;
  }

  // 默认重定向到登录页
  return <>{children}</>;
}

"use client";

import { usePathname } from 'next/navigation';
import MainPage from './MainPage';
import AuthGuard from './AuthGuard';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

// 需要使用MainPage布局的路由
const mainPageRoutes = ['/tasks', '/stars'];

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const useMainPage = mainPageRoutes.includes(pathname);

  if (useMainPage) {
    return (
      <AuthGuard>
        <MainPage>{children}</MainPage>
      </AuthGuard>
    );
  }

  return <>{children}</>;
}

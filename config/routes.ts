import React from 'react';

// 页面路由配置
export interface RouteConfig {
  id: string;
  path: string;
  label: string;
  icon: string;
  component: React.ComponentType;
  roles?: ('parent' | 'child')[]; // 允许访问的角色，不设置则允许所有角色
}

// 导入页面组件
import TaskPage from '@/components/TaskPage';
import StarPage from '@/components/StarPage';

// 路由配置
export const routes: RouteConfig[] = [
  {
    id: 'tasks',
    path: '/tasks',
    label: '目标',
    icon: '🎯',
    component: TaskPage,
    // 家长和孩子都可以访问任务页面
  },
  {
    id: 'stars',
    path: '/stars',
    label: '星星',
    icon: '⭐',
    component: StarPage,
  },
];

// 根据角色获取可访问的路由
export const getRoutesByRole = (role: 'parent' | 'child'): RouteConfig[] => {
  return routes.filter(route => !route.roles || route.roles.includes(role));
};

// 根据路径获取路由
export const getRouteByPath = (path: string): RouteConfig | undefined => {
  return routes.find(route => route.path === path);
};

// 根据ID获取路由
export const getRouteById = (id: string): RouteConfig | undefined => {
  return routes.find(route => route.id === id);
};

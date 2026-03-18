'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Task, StarLog } from '@/types';
import {
  getCurrentUser,
  setCurrentUser,
  getTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
  getStarLogs,
  getUserTotalStars,
  getFamilyMembers,
  getFamilies
} from '@/lib/api';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  tasks: Task[];
  starLogs: StarLog[];
  totalStars: number;
  isLoading: boolean;
  login: (email: string, pin: string, password: string, role: 'parent' | 'child') => Promise<boolean>;
  logout: () => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'familyId'>) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [starLogs, setStarLogs] = useState<StarLog[]>([]);
  const [totalStars, setTotalStars] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 刷新数据
  const refreshData = async () => {
    const user = getCurrentUser();
    if (!user) return;

    setIsLoading(true);
    try {
      const [tasksRes, logsRes, starsRes, usersRes] = await Promise.all([
        getTasks(),
        getStarLogs(),
        getUserTotalStars(),
        getFamilyMembers()
      ]);

      setTasks(tasksRes.data);
      setStarLogs(logsRes.data);
      setTotalStars(starsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('刷新数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 登录
  const login = async (email: string, pin: string, password: string, role: 'parent' | 'child') => {
    // 获取所有家庭数据
    const familiesRes = await getFamilies();
    const families = familiesRes.data;

    // 查找匹配的家庭
    const family = families.find(f => f.email === email && f.pin === pin);
    if (!family) {
      return false;
    }

    // 获取家庭所有成员
    const usersRes = await getFamilyMembers(family.id);
    const familyMembers = usersRes.data;
    const user = familyMembers.find(u => u.role === role && u.password === password);

    if (!user) {
      return false;
    }

    setCurrentUser(user);
    setCurrentUserState(user);
    await refreshData();
    return true;
  };

  // 登出
  const logout = () => {
    setCurrentUser(null);
    setCurrentUserState(null);
    setTasks([]);
    setStarLogs([]);
    setTotalStars(0);
    setUsers([]);
    // 清除localStorage中的登录数据
    localStorage.removeItem('loginData');
  };

  // 添加任务
  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'familyId'>) => {
    await createTask(task);
    await refreshData();
  };

  // 完成任务
  const completeTask = async (taskId: string) => {
    await updateTaskStatus(taskId, 'completed');
    await refreshData();
  };

  // 删除任务
  const removeTask = async (taskId: string) => {
    await deleteTask(taskId);
    await refreshData();
  };

  // 初始化时检查是否有已登录用户
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUserState(user);
      refreshData();
    } else {
      // 如果用户已过期或不存在，清除所有状态
      setTasks([]);
      setStarLogs([]);
      setTotalStars(0);
      setUsers([]);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        tasks,
        starLogs,
        totalStars,
        isLoading,
        login,
        logout,
        addTask,
        completeTask,
        removeTask,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

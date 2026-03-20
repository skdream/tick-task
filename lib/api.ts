import { User, Task, StarLog, ApiResponse, Family } from '@/types';
import { mockUsers, mockTasks, mockStarLogs, mockFamilies } from './mockData';

// 登录有效期（毫秒）- 30天
const LOGIN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

// 模拟当前登录用户
let currentUser: User | null = null;

// 设置当前用户
export const setCurrentUser = (user: User) => {
  currentUser = user;
  // 存储用户信息和登录时间到localStorage
  const loginData = {
    user,
    loginTime: new Date().getTime()
  };
  localStorage.setItem('loginData', JSON.stringify(loginData));
};

// 获取当前用户
export const getCurrentUser = (): User | null => {
  // 首先检查localStorage中的登录数据
  const loginDataStr = localStorage.getItem('loginData');
  if (loginDataStr) {
    try {
      const loginData = JSON.parse(loginDataStr);
      const currentTime = new Date().getTime();
      
      // 检查登录是否过期
      if (currentTime - loginData.loginTime > LOGIN_EXPIRY_MS) {
        // 登录已过期，清除数据
        localStorage.removeItem('loginData');
        currentUser = null;
        return null;
      }
      
      // 登录未过期，使用存储的用户信息
      currentUser = loginData.user;
    } catch (error) {
      console.error('解析登录数据失败:', error);
      localStorage.removeItem('loginData');
    }
  }
  return currentUser;
};

// 获取所有家庭
export const getFamilies = async (): Promise<ApiResponse<Family[]>> => {
  return { data: mockFamilies };
};

// 注册新家庭
export const registerFamily = async (
  familyName: string,
  email: string,
  pin: string,
  userName: string,
  password: string,
  role: 'parent' | 'child'
): Promise<boolean> => {
  // 检查邮箱是否已存在
  const existingFamily = mockFamilies.find(f => f.email === email);
  if (existingFamily) {
    return false;
  }

  // 创建新家庭
  const newFamily: Family = {
    id: `family${Date.now()}`,
    name: familyName,
    email,
    pin,
    createdAt: new Date(),
  };
  mockFamilies.push(newFamily);

  // 创建用户（不包含pin字段）
  const newUser: User = {
    id: `user${Date.now()}`,
    name: userName,
    role,
    familyId: newFamily.id,
    avatar: role === 'parent' ? '👨‍👩‍👧' : '👦',
    password,
  };
  mockUsers.push(newUser);

  return true;
};

// 获取家庭成员
export const getFamilyMembers = async (familyId?: string): Promise<ApiResponse<User[]>> => {
  // 如果提供了familyId，直接使用
  if (familyId) {
    const members = mockUsers.filter(user => user.familyId === familyId);
    return { data: members };
  }

  // 否则使用当前登录用户的家庭ID
  const user = getCurrentUser();
  if (!user) {
    throw new Error('未登录');
  }

  const members = mockUsers.filter(user => user.familyId === user.familyId);
  return { data: members };
};

// 添加孩子
export const addChild = async (name: string, password: string): Promise<boolean> => {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'parent') {
    return false;
  }

  const newChild: User = {
    id: `user${Date.now()}`,
    name,
    role: 'child',
    familyId: currentUser.familyId,
    avatar: '👦',
    password,
  };

  mockUsers.push(newChild);
  return true;
};

// 编辑孩子
export const editChild = async (id: string, name: string, password: string): Promise<boolean> => {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'parent') {
    return false;
  }

  const childIndex = mockUsers.findIndex(u => u.id === id && u.familyId === currentUser.familyId);
  if (childIndex === -1) {
    return false;
  }

  mockUsers[childIndex] = {
    ...mockUsers[childIndex],
    name,
    password,
  };

  return true;
};

// 删除孩子
export const deleteChild = async (id: string): Promise<boolean> => {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'parent') {
    return false;
  }

  const childIndex = mockUsers.findIndex(u => u.id === id && u.familyId === currentUser.familyId);
  if (childIndex === -1) {
    return false;
  }

  mockUsers.splice(childIndex, 1);
  return true;
};

// 获取任务列表
export const getTasks = async (dateFilter?: Date): Promise<ApiResponse<Task[]>> => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('未登录');
  }

  let tasks = mockTasks.filter(task => task.familyId === user.familyId);

  // 如果提供了日期过滤条件，则只返回该日期的任务
  if (dateFilter) {
    const dateStr = dateFilter.toISOString().split('T')[0];
    tasks = tasks.filter(task => {
      return task.taskDate === dateStr;
    });
  }

  return { data: tasks };
};

// 创建任务（仅家长）
export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'familyId'>): Promise<ApiResponse<Task>> => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('未登录');
  }

  if (user.role !== 'parent') {
    throw new Error('只有家长可以创建任务');
  }

  const newTask: Task = {
    ...task,
    id: `task${Date.now()}`,
    createdAt: new Date(),
    familyId: user.familyId,
    taskDate: task.taskDate || new Date().toISOString().split('T')[0],
  };

  mockTasks.push(newTask);
  return { data: newTask };
};

// 更新任务状态（孩子可以标记为完成）
export const updateTaskStatus = async (taskId: string, status: 'pending' | 'completed'): Promise<ApiResponse<Task>> => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('未登录');
  }

  const taskIndex = mockTasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    throw new Error('任务不存在');
  }

  const task = mockTasks[taskIndex];

  // 只有孩子可以标记任务为完成
  if (status === 'completed' && user.role !== 'child') {
    throw new Error('只有孩子可以标记任务为完成');
  }

  // 只有家长可以将任务重置为待完成
  if (status === 'pending' && user.role !== 'parent') {
    throw new Error('只有家长可以将任务重置为待完成');
  }

  // 更新任务状态
  task.status = status;
  if (status === 'completed') {
    task.completedAt = new Date();
    task.completedBy = user.id;
  } else {
    task.completedAt = undefined;
    task.completedBy = undefined;
  }

  // 如果任务完成，添加星星记录
  if (status === 'completed') {
    const starLog: StarLog = {
      id: `log${Date.now()}`,
      userId: user.id,
      taskId: task.id,
      stars: task.stars,
      earnedAt: new Date(),
      familyId: user.familyId,
    };
    mockStarLogs.push(starLog);
  }

  return { data: task };
};

// 删除任务（仅家长）
export const deleteTask = async (taskId: string): Promise<ApiResponse<void>> => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('未登录');
  }

  if (user.role !== 'parent') {
    throw new Error('只有家长可以删除任务');
  }

  const taskIndex = mockTasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    throw new Error('任务不存在');
  }

  mockTasks.splice(taskIndex, 1);
  return { data: undefined };
};

// 获取星星日志
export const getStarLogs = async (): Promise<ApiResponse<StarLog[]>> => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('未登录');
  }

  const logs = mockStarLogs.filter(log => log.familyId === user.familyId);
  return { data: logs };
};

// 获取用户星星总数
export const getUserTotalStars = async (userId?: string): Promise<ApiResponse<number>> => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('未登录');
  }

  const targetUserId = userId || user.id;
  const logs = mockStarLogs.filter(log =>
    log.familyId === user.familyId &&
    log.userId === targetUserId
  );

  const totalStars = logs.reduce((sum, log) => sum + log.stars, 0);
  return { data: totalStars };
};

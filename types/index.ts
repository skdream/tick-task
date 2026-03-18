// 用户类型
export type UserRole = 'parent' | 'child';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  familyId: string;
  avatar?: string;
  password?: string;
}

// 任务类型
export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status: TaskStatus;
  stars: number;
  createdAt: Date;
  completedAt?: Date;
  createdBy: string;
  completedBy?: string;
  familyId: string;
  assignedTo?: string;
}

// 星星日志类型
export interface StarLog {
  id: string;
  userId: string;
  taskId: string;
  stars: number;
  earnedAt: Date;
  familyId: string;
}

// 家庭类型
export interface Family {
  id: string;
  name: string;
  email: string;
  pin: string;
  createdAt: Date;
}

// API响应类型
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

import { User, Task, StarLog, Family } from '@/types';

// 模拟家庭数据
export const mockFamilies: Family[] = [
  {
    id: 'family1',
    name: '张家',
    email: 'zhang@example.com',
    pin: '1234',
    createdAt: new Date('2023-01-01'),
  },
  {
    id: 'family2',
    name: '李家',
    email: 'li@example.com',
    pin: '5678',
    createdAt: new Date('2023-02-15'),
  },
];

// 模拟用户数据
export const mockUsers: User[] = [
  {
    id: 'user1',
    name: '张家长',
    role: 'parent',
    familyId: 'family1',
    avatar: '👨‍👩‍👧',
    password: 'parent123',
  },
  {
    id: 'user2',
    name: '小明',
    role: 'child',
    familyId: 'family1',
    avatar: '👦',
    password: 'child111',
  },
  {
    id: 'user5',
    name: '小红',
    role: 'child',
    familyId: 'family1',
    avatar: '👧',
    password: 'child222',
  },
  {
    id: 'user3',
    name: '李家长',
    role: 'parent',
    familyId: 'family2',
    avatar: '👨‍👩‍👧',
    password: 'parent456',
  },
  {
    id: 'user4',
    name: '小李',
    role: 'child',
    familyId: 'family2',
    avatar: '👦',
    password: 'child333',
  },
  {
    id: 'user6',
    name: '小芳',
    role: 'child',
    familyId: 'family2',
    avatar: '👧',
    password: 'child444',
  },
];

// 模拟任务数据
export const mockTasks: Task[] = [
  // 张家的任务
  {
    id: 'task1',
    title: '完成数学作业',
    description: '完成第3章练习题',
    category: '学习',
    status: 'pending',
    stars: 3,
    createdAt: new Date('2024-01-15'),
    taskDate:'2024-01-15',
    createdBy: 'user1', // 张家长
    familyId: 'family1',
    assignedTo: 'user2', // 小明
  },
  {
    id: 'task2',
    title: '阅读30分钟',
    description: '阅读课外书籍',
    category: '阅读',
    status: 'completed',
    stars: 2,
    createdAt: new Date('2024-01-15'),
    completedAt: new Date('2024-01-15'),
    taskDate:'2024-01-15',
    createdBy: 'user1', // 张家长
    completedBy: 'user2', // 小明
    familyId: 'family1',
    assignedTo: 'user2', // 小明
  },
  {
    id: 'task3',
    title: '整理房间',
    description: '整理自己的房间和书桌',
    category: '家务',
    status: 'pending',
    stars: 2,
    createdAt: new Date('2024-01-15'),
    taskDate:'2024-01-15',
    createdBy: 'user1', // 张家长
    familyId: 'family1',
    assignedTo: 'user5', // 小红
  },
  {
    id: 'task4',
    title: '完成英语单词背诵',
    description: '背诵第5单元单词',
    category: '学习',
    status: 'pending',
    stars: 2,
    createdAt: new Date('2024-01-15'),
    taskDate:'2024-01-15',
    createdBy: 'user1', // 张家长
    familyId: 'family1',
    assignedTo: 'user2', // 小明
  },
  {
    id: 'task5',
    title: '练习钢琴',
    description: '练习30分钟钢琴',
    category: '运动',
    status: 'completed',
    taskDate:'2024-01-15',
    stars: 3,
    createdAt: new Date('2024-01-15'),
    completedAt: new Date('2024-01-15'),
    createdBy: 'user1', // 张家长
    completedBy: 'user5', // 小红
    familyId: 'family1',
    assignedTo: 'user5', // 小红
  },
  // 李家的任务
  {
    id: 'task6',
    title: '完成语文作业',
    description: '完成作文练习',
    category: '学习',
    status: 'completed',
    taskDate:'2024-01-15',
    stars: 3,
    createdAt: new Date('2024-01-15'),
    completedAt: new Date('2024-01-15'),
    createdBy: 'user3', // 李家长
    completedBy: 'user4', // 小李
    familyId: 'family2',
    assignedTo: 'user4', // 小李
  },
  {
    id: 'task7',
    title: '做家务',
    description: '帮忙洗碗和打扫卫生',
    category: '家务',
    status: 'pending',
    taskDate:'2024-01-15',  
    stars: 2,
    createdAt: new Date('2024-01-15'),
    createdBy: 'user3', // 李家长
    familyId: 'family2',
    assignedTo: 'user4', // 小李
  },
  {
    id: 'task8',
    title: '完成数学练习题',
    description: '完成第4章练习题',
    category: '学习',
    status: 'pending',  
    taskDate:'2024-01-15',
    stars: 3,
    createdAt: new Date('2024-01-15'),
    createdBy: 'user3', // 李家长
    familyId: 'family2',
    assignedTo: 'user6', // 小芳
  },
  {
    id: 'task9',
    title: '背诵古诗',
    description: '背诵3首唐诗',
    category: '阅读',
    status: 'completed',
    taskDate:'2024-01-15',
    stars: 2,
    createdAt: new Date('2024-01-15'),
    completedAt: new Date('2024-01-15'),
 createdBy: 'user3', // 李家长
    completedBy: 'user6', // 小芳
    familyId: 'family2',
    assignedTo: 'user6', // 小芳
  },
  {
    id: 'task10',
    title: '画画',
    description: '完成一幅画作',
    category: '其他',
    status: 'pending',  
    taskDate:'2024-01-15',
    stars: 2,
    createdAt: new Date('2024-01-15'),
    createdBy: 'user3', // 李家长
    familyId: 'family2',
    assignedTo: 'user6', // 小芳
  },
];

// 模拟星星日志数据
export const mockStarLogs: StarLog[] = [
  // 张家的星星记录
  {
    id: 'log1',
    userId: 'user2', // 小明
    taskId: 'task2',
    stars: 2,
    earnedAt: new Date('2024-01-15'),
    familyId: 'family1',
  },
  {
    id: 'log2',
    userId: 'user5', // 小红
    taskId: 'task5',
    stars: 3,
    earnedAt: new Date('2024-01-15'),
    familyId: 'family1',
  },
  // 李家的星星记录
  {
    id: 'log3',
    userId: 'user4', // 小李
    taskId: 'task6',
    stars: 3,
    earnedAt: new Date('2024-01-15'),
    familyId: 'family2',
  },
  {
    id: 'log4',
    userId: 'user6', // 小芳
    taskId: 'task9',
    stars: 2,
    earnedAt: new Date('2024-01-15'),
    familyId: 'family2',
  },
];

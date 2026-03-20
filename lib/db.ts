import dayjs from 'dayjs';
import { createClient } from './supabase/client';
import { User, Task, StarLog, Family, ApiResponse } from '@/types';


// 登录有效期（毫秒）- 30天
const LOGIN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

// 设置当前用户
export const setCurrentUser = (user: User) => {
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
        return null;
      }

      // 登录未过期，使用存储的用户信息
      return loginData.user;
    } catch (error) {
      console.error('解析登录数据失败:', error);
      localStorage.removeItem('loginData');
    }
  }
  return null;
};

// 获取所有家庭
export const getFamilies = async (): Promise<ApiResponse<Family[]>> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('families')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取家庭列表失败:', error);
    return { data: [] };
  }

  return { data: data.map(f => ({
    id: f.id,
    name: f.name,
    email: f.email,
    pin: f.pin,
    createdAt: new Date(f.created_at)
  })) };
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
  const supabase = createClient();

  // 检查邮箱是否已存在
  const { data: existingFamily } = await supabase
    .from('families')
    .select('id')
    .eq('email', email)
    .single();

  if (existingFamily) {
    return false;
  }

  // 创建新家庭
  const { data: family, error: familyError } = await supabase
    .from('families')
    .insert({
      name: familyName,
      email,
      pin
    })
    .select()
    .single();

  if (familyError) {
    console.error('创建家庭失败:', familyError);
    return false;
  }

  // 创建用户
  const { error: userError } = await supabase
    .from('users')
    .insert({
      name: userName,
      role,
      family_id: family.id,
      avatar: role === 'parent' ? '👨‍👩‍👧' : '👦',
      password
    });

  if (userError) {
    console.error('创建用户失败:', userError);
    return false;
  }

  return true;
};

// 获取家庭成员
export const getFamilyMembers = async (familyId?: string): Promise<ApiResponse<User[]>> => {
  const supabase = createClient();

  // 如果提供了familyId，直接使用
  if (familyId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('获取家庭成员失败:', error);
      return { data: [] };
    }

    return { data: data.map(u => ({
      id: u.id,
      name: u.name,
      role: u.role,
      familyId: u.family_id,
      avatar: u.avatar,
      password: u.password
    })) };
  }

  // 否则使用当前登录用户的家庭ID
  const user = getCurrentUser();
  if (!user) {
    throw new Error('未登录');
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('family_id', user.familyId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('获取家庭成员失败:', error);
    return { data: [] };
  }

  return { data: data.map(u => ({
    id: u.id,
    name: u.name,
    role: u.role,
    familyId: u.family_id,
    avatar: u.avatar,
    password: u.password
  })) };
};

// 添加孩子
export const addChild = async (name: string, password: string): Promise<boolean> => {
  const supabase = createClient();
  const currentUser = getCurrentUser();

  if (!currentUser || currentUser.role !== 'parent') {
    return false;
  }

  const { error } = await supabase
    .from('users')
    .insert({
      name,
      role: 'child',
      family_id: currentUser.familyId,
      avatar: '👦',
      password
    });

  if (error) {
    console.error('添加孩子失败:', error);
    return false;
  }

  return true;
};

// 编辑孩子
export const editChild = async (id: string, name: string, password: string): Promise<boolean> => {
  const supabase = createClient();
  const currentUser = getCurrentUser();

  if (!currentUser || currentUser.role !== 'parent') {
    return false;
  }

  const { error } = await supabase
    .from('users')
    .update({
      name,
      password
    })
    .eq('id', id)
    .eq('family_id', currentUser.familyId);

  if (error) {
    console.error('编辑孩子失败:', error);
    return false;
  }

  return true;
};

// 删除孩子
export const deleteChild = async (id: string): Promise<boolean> => {
  const supabase = createClient();
  const currentUser = getCurrentUser();

  if (!currentUser || currentUser.role !== 'parent') {
    return false;
  }

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)
    .eq('family_id', currentUser.familyId);

  if (error) {
    console.error('删除孩子失败:', error);
    return false;
  }

  return true;
};

// 获取任务列表
export const getTasks = async (dateFilter?: Date): Promise<ApiResponse<Task[]>> => {
  const supabase = createClient();
  const user = getCurrentUser();

  if (!user) {
    throw new Error('未登录');
  }

  let query = supabase
    .from('tasks')
    .select('*')
    .eq('family_id', user.familyId);

  // 如果提供了日期过滤条件，则只返回该日期的任务
  if (dateFilter) {
    const dateStr = dayjs(dateFilter).format('YYYY-MM-DD');
    query = query.eq('task_date', dateStr);
  }

  const { data, error } = await query.order('task_date', { ascending: true });

  if (error) {
    console.error('获取任务列表失败:', error);
    return { data: [] };
  }

  return { data: data.map(t => ({
    id: t.id,
    title: t.title,
    description: t.description,
    category: t.category,
    status: t.status,
    stars: t.stars,
    createdAt: new Date(t.created_at),
    completedAt: t.completed_at ? new Date(t.completed_at) : undefined,
    createdBy: t.created_by,
    completedBy: t.completed_by,
    familyId: t.family_id,
    assignedTo: t.assigned_to,
    taskDate: dayjs(t.task_date).format('YYYY-MM-DD')
  })) };
};

// 创建任务（仅家长）
export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'familyId'>): Promise<ApiResponse<Task>> => {
  const supabase = createClient();
  const user = getCurrentUser();

  if (!user) {
    throw new Error('未登录');
  }

  if (user.role !== 'parent') {
    throw new Error('只有家长可以创建任务');
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: task.title,
      description: task.description,
      category: task.category,
      status: task.status,
      stars: task.stars,
      created_by: task.createdBy,
      family_id: user.familyId,
      assigned_to: task.assignedTo,
      task_date: task.taskDate
    })
    .select()
    .single();

  if (error) {
    console.error('创建任务失败:', error);
    throw error;
  }


  // data.task_date 转换为东八区时间
  

  return { data: {
    id: data.id,
    title: data.title,
    description: data.description,
    category: data.category,
    status: data.status,
    stars: data.stars,
    createdAt: new Date(data.created_at),
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    createdBy: data.created_by,
    completedBy: data.completed_by,
    familyId: data.family_id,
    assignedTo: data.assigned_to,
    taskDate: dayjs(data.task_date).format('YYYY-MM-DD')
  }};
};

// 更新任务状态（孩子可以标记为完成）
export const updateTaskStatus = async (taskId: string, status: 'pending' | 'completed'): Promise<ApiResponse<Task>> => {
  const supabase = createClient();
  const user = getCurrentUser();

  if (!user) {
    throw new Error('未登录');
  }

  // 检查任务是否存在
  const { data: existingTask } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (!existingTask) {
    throw new Error('任务不存在');
  }

  // 只有孩子可以标记任务为完成
  if (status === 'completed' && user.role !== 'child') {
    throw new Error('只有孩子可以标记任务为完成');
  }

  // 允许孩子和家长都可以将任务重置为待完成
  // 孩子可以撤销自己完成的任务
  if (status === 'pending' && user.role !== 'parent' && user.role !== 'child') {
    throw new Error('只有孩子或家长可以将任务重置为待完成');
  }

  const updateData: any = {
    status
  };

  if (status === 'completed') {
    updateData.completed_at = dayjs().format('YYYY-MM-DD HH:mm:ss');
    updateData.completed_by = user.id;
  } else {
    updateData.completed_at = null;
    updateData.completed_by = null;
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error('更新任务状态失败:', error);
    throw error;
  }

  return { data: {
    id: data.id,
    title: data.title,
    description: data.description,
    category: data.category,
    status: data.status,
    stars: data.stars,
    createdAt: new Date(data.created_at),
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    createdBy: data.created_by,
    completedBy: data.completed_by,
    familyId: data.family_id,
    assignedTo: data.assigned_to,
    taskDate: dayjs(data.task_date).format('YYYY-MM-DD')
  }};
};

// 删除任务（仅家长）
export const deleteTask = async (taskId: string): Promise<ApiResponse<void>> => {
  const supabase = createClient();
  const user = getCurrentUser();

  if (!user) {
    throw new Error('未登录');
  }

  if (user.role !== 'parent') {
    throw new Error('只有家长可以删除任务');
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) {
    console.error('删除任务失败:', error);
    throw error;
  }

  return { data: undefined };
};

// 获取星星日志
export const getStarLogs = async (
  userId?: string,
  page: number = 1,
  pageSize: number = 10
): Promise<ApiResponse<{ data: StarLog[]; total: number; page: number; pageSize: number }>> => {
  const supabase = createClient();
  const user = getCurrentUser();

  if (!user) {
    throw new Error('未登录');
  }

  // 计算分页偏移量
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // 构建查询
  let query = supabase
    .from('star_logs')
    .select('*', { count: 'exact' })
    .eq('family_id', user.familyId);

  // 如果指定了userId，则只查询该用户的星星日志
  if (userId) {
    query = query.eq('user_id', userId);
  }

  // 执行查询
  const { data, error, count } = await query
    .order('earned_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('获取星星日志失败:', error);
    return { data: { data: [], total: 0, page, pageSize } };
  }

  return {
    data: {
      data: data.map(l => ({
        id: l.id,
        userId: l.user_id,
        taskId: l.task_id,
        stars: l.stars,
        earnedAt: new Date(l.earned_at),
        familyId: l.family_id
      })),
      total: count || 0,
      page,
      pageSize
    }
  };
};

// 获取用户星星总数
export const getUserTotalStars = async (userId?: string): Promise<ApiResponse<number>> => {
  const supabase = createClient();
  const user = getCurrentUser();

  if (!user) {
    throw new Error('未登录');
  }

  const targetUserId = userId || user.id;

  const { data, error } = await supabase
    .from('star_logs')
    .select('stars')
    .eq('family_id', user.familyId)
    .eq('user_id', targetUserId);

  if (error) {
    console.error('获取用户星星总数失败:', error);
    return { data: 0 };
  }

  const totalStars = data.reduce((sum, log) => sum + log.stars, 0);
  return { data: totalStars };
};

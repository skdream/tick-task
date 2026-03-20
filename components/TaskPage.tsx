
'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Task } from '@/types';
import AddTaskModal from './AddTaskModal';
import ConfirmDialog from './ConfirmDialog';
import CelebrationEffect from './CelebrationEffect';
import StarEffect from './StarEffect';
import ManageChildrenModal from './ManageChildrenModal';
import { Picker } from 'antd-mobile';
import dayjs from 'dayjs';


const TaskPage: React.FC = () => {
  const { tasks, currentUser, addTask, completeTask, updateTaskStatus, removeTask, isLoading, users, addChild, editChild, removeChild, refreshData } = useApp();
  const [showAddTask, setShowAddTask] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showStarEffect, setShowStarEffect] = useState(false);
  const [currentTaskStars, setCurrentTaskStars] = useState<number>(0);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editStars, setEditStars] = useState(1);
  const [editTaskDate, setEditTaskDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [editDatePickerVisible, setEditDatePickerVisible] = useState(false);
  const [showManageChildren, setShowManageChildren] = useState(false);
  const [justCompletedTask, setJustCompletedTask] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [parentDatePickerVisible, setParentDatePickerVisible] = useState(false);
  const [childDatePickerVisible, setChildDatePickerVisible] = useState(false);

  const isParent = currentUser?.role === 'parent';

  // 生成日期列数据
  const now = new Date();
  const years = Array.from({ length: 10 }, (_, i) => now.getFullYear() - 5 + i).map(year => ({
    label: `${year}年`,
    value: year,
  }));
  const months = Array.from({ length: 12 }, (_, i) => ({
    label: `${i + 1}月`,
    value: i + 1,
  }));
  const days = Array.from({ length: 31 }, (_, i) => ({
    label: `${i + 1}日`,
    value: i + 1,
  }));

  // 获取当前家庭中的所有孩子，确保avatar和password字段存在
  const children = users
    .filter(user => user.role === 'child' && user.familyId === currentUser?.familyId)
    .map(user => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar || '👦', // 提供默认头像
      password: user.password || '' // 提供默认密码
    }));

  // 如果是家长，默认选择第一个孩子；如果是孩子，只能看到自己的任务
  const filteredTasks = isParent
    ? selectedChildId
      ? tasks.filter(task => task.assignedTo === selectedChildId && task.familyId === currentUser?.familyId)
      : tasks.filter(task => task.familyId === currentUser?.familyId)
    : tasks.filter(task => task.assignedTo === currentUser?.id && task.familyId === currentUser?.familyId);

  // 初始化选中的孩子
  useEffect(() => {
    if (isParent && children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [isParent, children, selectedChildId]);

  // 初始化时刷新数据
  useEffect(() => {
    if (currentUser) {
      refreshData(selectedDate);
    }
  }, [currentUser]);

  // 当selectedDate变化时刷新数据
  useEffect(() => {
    refreshData(selectedDate);
  }, [selectedDate]);

  // 添加调试日志
  useEffect(() => {
    console.log('=== 任务状态调试 ===');
    console.log('当前用户:', currentUser?.id, currentUser?.name, currentUser?.role);
    console.log('所有任务数量:', tasks.length);
    console.log('过滤后的任务数量:', filteredTasks.length);
    console.log('待完成任务:', filteredTasks.filter(task => task.status === 'pending').map(t => ({id: t.id, title: t.title, status: t.status})));
    console.log('已完成任务:', filteredTasks.filter(task => task.status === 'completed').map(t => ({id: t.id, title: t.title, status: t.status})));
    console.log('showCelebration状态:', showCelebration);
    console.log('showStarEffect状态:', showStarEffect);
    console.log('===================');
  }, [currentUser, tasks, filteredTasks, showCelebration, showStarEffect]);

  // 监听任务状态变化，当所有任务都完成时显示庆祝效果
  useEffect(() => {
    const pendingTasks = filteredTasks.filter(task => task.status === 'pending');
    console.log('检查庆祝效果条件:', {
      pendingTasksCount: pendingTasks.length,
      filteredTasksCount: filteredTasks.length,
      showStarEffect,
      showCelebration,
      isParent,
      justCompletedTask
    });

    // 只有当有任务且所有任务都已完成，并且当前没有显示庆祝效果时才触发
    // 注意：只有孩子完成所有任务时才显示庆祝效果，家长不需要
    // 并且只有在刚刚完成任务时才显示庆祝效果，而不是在页面加载时
    if (pendingTasks.length === 0 && filteredTasks.length > 0 && !showCelebration && !isParent && justCompletedTask) {
      console.log('所有任务已完成，准备显示庆祝效果');
      // 延迟显示庆祝效果，确保在星星效果结束后显示
      const timer = setTimeout(() => {
        console.log('显示庆祝效果');
        setShowCelebration(true);
        // 重置justCompletedTask状态，防止重复触发
        setJustCompletedTask(false);
      }, 1500); // 1.5秒后显示，确保星星动画先完成

      return () => clearTimeout(timer);
    }
  }, [filteredTasks, showCelebration, isParent, justCompletedTask]);

  const handleCompleteTask = async (taskId: string) => {
    console.log('开始完成任务:', taskId);
    // 获取当前任务的星星数量
    const task = tasks.find(t => t.id === taskId);
    const stars = task?.stars || 0;
    console.log('任务星星数量:', stars);

    // 标记刚刚完成了任务
    setJustCompletedTask(true);

    // 先设置星星数量，再显示星星效果
    setCurrentTaskStars(stars);
    setShowStarEffect(true);
    console.log('已显示星星效果，星星数量:', stars);

    // 完成任务
    await completeTask(taskId, selectedDate);
    console.log('任务完成API调用完成');
  };

  const handleUndoCompleteTask = async (taskId: string) => {
    console.log('开始撤销完成任务:', taskId);
    try {
      await updateTaskStatus(taskId, 'pending', selectedDate);
      console.log('任务撤销完成');
    } catch (error) {
      console.error('撤销完成任务失败:', error);
      alert('撤销完成任务失败，请重试');
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTask = async () => {
    if (taskToDelete) {
      await removeTask(taskToDelete);
      setTaskToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditCategory(task.category || '学习');
    setEditStars(task.stars);
    setEditTaskDate(task.taskDate);
  };

  const handleSaveEdit = async () => {
    if (!editingTask || !editTitle.trim()) return;
    await addTask({
      title: editTitle,
      description: editDescription,
      category: editCategory,
      status: 'pending',
      stars: editStars,
      createdBy: currentUser!.id,
      assignedTo: tasks.find(t => t.id === editingTask)?.assignedTo || '',
      taskDate: editTaskDate,
    }, selectedDate);
    await removeTask(editingTask);
    setEditingTask(null);
    setEditTitle('');
    setEditDescription('');
    setEditCategory('学习');
    setEditStars(1);
    setEditTaskDate(new Date().toISOString().split('T')[0]);
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditTitle('');
    setEditDescription('');
    setEditCategory('学习');
    setEditStars(1);
    setEditTaskDate(new Date().toISOString().split('T')[0]);
  };

  const pendingTasks = filteredTasks.filter(task => task.status === 'pending');
  const completedTasks = filteredTasks.filter(task => task.status === 'completed').sort((a, b) => new Date(b.taskDate).getTime() - new Date(a.taskDate).getTime());

  return (
    <div className="max-w-4xl mx-auto p-4">
      {isParent ? (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              家长管理面板
            </h1>
            <p className="text-gray-600 mb-6">
              家长可以管理任务，但不需要完成自己的任务。
            </p>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={() => setShowAddTask(!showAddTask)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
               添加任务
              </button>
              <button
                onClick={() => setShowManageChildren(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                管理孩子
              </button>
            </div>
          </div>

          {/* 孩子选择器 */}
          {children.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择查看孩子的任务
              </label>
              <div className="flex space-x-2">
                {children.map(child => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChildId(child.id)}
                    className={`
                      flex-1 px-4 py-2 rounded-lg transition-colors
                      ${selectedChildId === child.id
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {child.avatar} {child.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">
                任务管理
              </h2>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">选择日期:</label>
                <button
                  onClick={() => setParentDatePickerVisible(true)}
                  className="border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {selectedDate.toLocaleDateString('zh-CN')}
                </button>
                <Picker
                  columns={[years, months, days]}
                  visible={parentDatePickerVisible}
                  onClose={() => setParentDatePickerVisible(false)}
                  value={[selectedDate.getFullYear(), selectedDate.getMonth() + 1, selectedDate.getDate()]}
                  onConfirm={(value) => {
                    if (value[0] && value[1] && value[2]) {
                      setSelectedDate(new Date(Number(value[0]), Number(value[1]) - 1, Number(value[2])));
                    }
                    setParentDatePickerVisible(false);
                  }}
                />
              </div>
            </div>
            <div className="space-y-3">
              {pendingTasks.length === 0 && completedTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-md">
                  <p>暂无任务</p>
                </div>
              ) : (
                <>
                  {pendingTasks.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3 text-gray-600">待完成任务</h3>
                      {pendingTasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow mb-3"
                        >
                          {editingTask === task.id ? (
                            // 编辑模式
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                                <textarea
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  rows={2}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                                <select
                                  value={editCategory}
                                  onChange={(e) => setEditCategory(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                  {['学习', '阅读', '家务', '运动', '其他'].map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">星星数量</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={editStars}
                                  onChange={(e) => setEditStars(parseInt(e.target.value))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">任务日期</label>
                                <button
                                  onClick={() => setEditDatePickerVisible(true)}
                                  className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-left"
                                >
                                  {editTaskDate}
                                </button>
                                <Picker
                                  columns={[years, months, days]}
                                  visible={editDatePickerVisible}
                                  onClose={() => setEditDatePickerVisible(false)}
                                  value={(() => {
                                    const [year, month, day] = editTaskDate.split('-').map(Number);
                                    return [year, month, day];
                                  })()}
                                  onConfirm={(value) => {
                                    if (value[0] && value[1] && value[2]) {
                                      const year = value[0];
                                      const month = String(value[1]).padStart(2, '0');
                                      const day = String(value[2]).padStart(2, '0');
                                      setEditTaskDate(`${year}-${month}-${day}`);
                                    }
                                    setEditDatePickerVisible(false);
                                  }}
                                />
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={handleCancelEdit}
                                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                  取消
                                </button>
                                <button
                                  onClick={handleSaveEdit}
                                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                  保存
                                </button>
                              </div>
                            </div>
                          ) : (
                            // 查看模式
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-800">{task.title}</h3>
                                {task.description && (
                                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                )}
                                <div className="mt-2 flex items-center space-x-2">
                                  {task.category && (
                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                                      {task.category}
                                    </span>
                                  )}
                                  <span className="text-yellow-500 font-bold">
                                    {task.stars} ⭐
                                  </span>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                {!isParent && (
                                  <button
                                    onClick={() => handleCompleteTask(task.id)}
                                    disabled={isLoading}
                                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
                                  >
                                    完成
                                  </button>
                                )}
                                {isParent && (
                                  <button
                                    onClick={() => handleEditTask(task)}
                                    disabled={isLoading}
                                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
                                  >
                                    编辑
                                  </button>
                                )}
                                {isParent && (
                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    disabled={isLoading}
                                    className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
                                  >
                                    删除
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {completedTasks.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-gray-600">已完成任务</h3>
                      {completedTasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-white rounded-lg shadow-md p-4 opacity-75 mb-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 line-through">
                                {task.title}
                              </h3>
                              {task.description && (
                                <p className="text-sm text-gray-600 mt-1 line-through">
                                  {task.description}
                                </p>
                              )}
                              <div className="mt-2 flex items-center space-x-2">
                                <span className="text-yellow-500 font-bold">
                                  {task.stars} ⭐
                                </span>
                                {task.completedAt && (
                                  <span className="text-sm text-gray-500">
                                    完成于 {new Date(task.completedAt).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <AddTaskModal
            isOpen={showAddTask}
            onClose={() => setShowAddTask(false)}
            selectedDate={selectedDate}
            onAddTask={async (title, description, category, stars, assignedTo, taskDate) => {
              await addTask({
                title,
                description,
                category,
                status: 'pending',
                stars,
                createdBy: currentUser!.id,
                assignedTo,
                taskDate,
              }, selectedDate);
            }}
            isLoading={isLoading}
            children={children}
          />

          <CelebrationEffect
            show={showCelebration}
            onComplete={() => setShowCelebration(false)}
          />

          <StarEffect
            show={showStarEffect}
            starsCount={currentTaskStars}
            onComplete={() => setShowStarEffect(false)}
          />

          <ManageChildrenModal
            isOpen={showManageChildren}
            onClose={() => setShowManageChildren(false)}
            children={children}
            onAddChild={async (name, password) => {
              await addChild(name, password);
            }}
            onEditChild={async (id, name, password) => {
              await editChild(id, name, password);
            }}
            onDeleteChild={async (id) => {
              await removeChild(id);
            }}
            isLoading={isLoading}
          />

          <ConfirmDialog
            isOpen={showDeleteConfirm}
            onClose={() => {
              setShowDeleteConfirm(false);
              setTaskToDelete(null);
            }}
            onConfirm={confirmDeleteTask}
            title="确认删除"
            message="确定要删除这个任务吗？删除后无法恢复。"
            confirmText="删除"
            cancelText="取消"
            isLoading={isLoading}
          />
        </div>
      ) : (
        <>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">
              待完成任务
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setChildDatePickerVisible(true)}
                className="border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {selectedDate.toLocaleDateString('zh-CN')}
              </button>
              <Picker
                columns={[years, months, days]}
                visible={childDatePickerVisible}
                onClose={() => setChildDatePickerVisible(false)}
                value={[selectedDate.getFullYear(), selectedDate.getMonth() + 1, selectedDate.getDate()]}
                onConfirm={(value) => {
                  if (value[0] && value[1] && value[2]) {
                    setSelectedDate(new Date(Number(value[0]), Number(value[1]) - 1, Number(value[2])));
                  }
                  setChildDatePickerVisible(false);
                }}
              />
            </div>
          </div>
          {pendingTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-md">
              <p>暂无待完成任务</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-yellow-500 font-bold">
                          {task.stars} ⭐
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {!isParent && (
                        <button
                          onClick={() => handleCompleteTask(task.id)}
                          disabled={isLoading}
                          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          完成
                        </button>
                      )}
                      {isParent && (
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          disabled={isLoading}
                          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          删除
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            已完成任务
          </h2>
          {completedTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-md">
              <p>暂无已完成任务</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-lg shadow-md p-4 opacity-75"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 line-through">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1 line-through">
                          {task.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-yellow-500 font-bold">
                          {task.stars} ⭐
                        </span>
                        {task.completedAt && (
                          <span className="text-sm text-gray-500">
                            完成于 {new Date(task.completedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {!isParent && (
                        <button
                          onClick={() => handleUndoCompleteTask(task.id)}
                          disabled={isLoading}
                          className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          撤销
                        </button>
                      )}
                      {isParent && (
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          disabled={isLoading}
                          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          删除
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>

        <CelebrationEffect
          show={showCelebration}
          onComplete={() => setShowCelebration(false)}
        />

        <StarEffect
          show={showStarEffect}
          starsCount={currentTaskStars}
          onComplete={() => setShowStarEffect(false)}
        />
        {console.log('TaskPage - StarEffect props:', { showStarEffect, currentTaskStars })}
        </>
      )}
    </div>
  );
};

export default TaskPage;

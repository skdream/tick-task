
'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Task } from '@/types';
import AddTaskModal from './AddTaskModal';
import ConfirmDialog from './ConfirmDialog';
import CelebrationEffect from './CelebrationEffect';
import StarEffect from './StarEffect';
import ManageChildrenModal from './ManageChildrenModal';

const TaskPage: React.FC = () => {
  const { tasks, currentUser, addTask, completeTask, removeTask, isLoading, users, addChild, editChild, removeChild } = useApp();
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
  const [showManageChildren, setShowManageChildren] = useState(false);

  const isParent = currentUser?.role === 'parent';

  // 获取当前家庭中的所有孩子
  const children = users.filter(user => user.role === 'child' && user.familyId === currentUser?.familyId);

  // 如果是家长，默认选择第一个孩子；如果是孩子，只能看到自己的任务
  const filteredTasks = isParent
    ? selectedChildId
      ? tasks.filter(task => task.assignedTo === selectedChildId && task.familyId === currentUser?.familyId)
      : tasks.filter(task => task.familyId === currentUser?.familyId)
    : tasks.filter(task => task.assignedTo === currentUser?.id);

  // 初始化选中的孩子
  useEffect(() => {
    if (isParent && children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [isParent, children, selectedChildId]);

  // 添加调试日志
  useEffect(() => {
    console.log('当前用户:', currentUser);
    console.log('所有任务:', tasks);
    console.log('过滤后的任务:', filteredTasks);
  }, [currentUser, tasks, filteredTasks]);

  const handleCompleteTask = async (taskId: string) => {
    // 获取当前任务的星星数量
    const task = tasks.find(t => t.id === taskId);
    const stars = task?.stars || 0;
    
    await completeTask(taskId);
    
    // 显示星星效果
    setCurrentTaskStars(stars);
    setShowStarEffect(true);

    // 检查是否所有任务都已完成
    const pendingTasks = filteredTasks.filter(task => task.status === 'pending');

    if (pendingTasks.length === 0) {
      setShowCelebration(true);
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
    });
    await removeTask(editingTask);
    setEditingTask(null);
    setEditTitle('');
    setEditDescription('');
    setEditCategory('学习');
    setEditStars(1);
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditTitle('');
    setEditDescription('');
    setEditCategory('学习');
    setEditStars(1);
  };

  const pendingTasks = filteredTasks.filter(task => task.status === 'pending');
  const completedTasks = filteredTasks.filter(task => task.status === 'completed');

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
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddTask(!showAddTask)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {showAddTask ? '取消' : '添加任务'}
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
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              家庭任务管理
            </h2>
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
                              <div className="flex space-x-2">
                                <button
                                  onClick={handleSaveEdit}
                                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                  保存
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                  取消
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
            onAddTask={async (title, description, category, stars, assignedTo) => {
              await addTask({
                title,
                description,
                category,
                status: 'pending',
                stars,
                createdBy: currentUser!.id,
                assignedTo,
              });
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
            message="确定要删除这个目标吗？删除后无法恢复。"
            confirmText="删除"
            cancelText="取消"
            isLoading={isLoading}
          />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              今日目标
            </h1>
          </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            待完成目标
          </h2>
          {pendingTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-md">
              <p>暂无待完成目标</p>
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
            已完成目标
          </h2>
          {completedTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-md">
              <p>暂无已完成目标</p>
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
                    {isParent && (
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        disabled={isLoading}
                        className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors ml-4"
                      >
                        删除
                      </button>
                    )}
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
        </>
      )}
    </div>
  );
};

export default TaskPage;

import React, { useState, useEffect } from 'react';
import { Picker } from 'antd-mobile';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (title: string, description: string, category: string, stars: number, assignedTo: string, taskDate: string) => Promise<void>;
  isLoading?: boolean;
  userOptions: Array<{ id: string; name: string; avatar?: string }>;
  selectedDate?: Date;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  isLoading = false,
  userOptions,
  selectedDate = new Date(),
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('学习');
  const [stars, setStars] = useState(1);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [taskDate, setTaskDate] = useState<Date>(selectedDate);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  // 当userOptions数据加载完成后，自动设置selectedChildId为第一个孩子的ID
  useEffect(() => {
    if (userOptions.length > 0 && !selectedChildId) {
      setSelectedChildId(userOptions[0].id);
    }
  }, [userOptions, selectedChildId]);

  useEffect(() => {
    setTaskDate(selectedDate);
    setSelectedChildId(userOptions[0]?.id || '');
  }, [selectedDate, userOptions]);

  useEffect(() => {
    setSelectedChildId(userOptions[0]?.id || '');
  }, [userOptions]);

  const categories = ['学习', '阅读', '家务', '运动', '其他'];

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

  const handleAdd = async () => {
    if (!title.trim() || !selectedChildId) return;
    const taskDateStr = taskDate.toISOString().split('T')[0];
    await onAddTask(title, description, category, stars, selectedChildId, taskDateStr);
    setTitle('');
    setDescription('');
    setCategory('学习');
    setStars(1);
    setSelectedChildId(userOptions[0]?.id || '');
    setTaskDate(selectedDate);
    onClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setCategory('学习');
    setStars(1);
    setSelectedChildId(userOptions[0]?.id || '');
    setTaskDate(selectedDate);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* 弹窗内容 */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">添加新任务</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* 任务标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              任务标题
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="例如：完成数学作业"
            />
          </div>

          {/* 任务日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              任务日期
            </label>
            <button
              onClick={() => setDatePickerVisible(true)}
              className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-left"
            >
              {taskDate.toISOString().split('T')[0]}
            </button>
            <Picker
              columns={[years, months, days]}
              visible={datePickerVisible}
              onClose={() => setDatePickerVisible(false)}
              value={[taskDate.getFullYear(), taskDate.getMonth() + 1, taskDate.getDate()]}
              onConfirm={(value) => {
                if (value[0] && value[1] && value[2]) {
                  setTaskDate(new Date(Number(value[0]), Number(value[1]) - 1, Number(value[2])));
                }
                setDatePickerVisible(false);
              }}
            />
          </div>

          {/* 任务描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              任务描述（可选）
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="例如：完成第3章练习题"
              rows={3}
            />
          </div>

          {/* 任务分类 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              任务分类
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* 分配给哪个孩子 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              分配给
            </label>
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {userOptions.map(child => (
                <option key={child.id} value={child.id}>
                  {child.avatar} {child.name}
                </option>
              ))}
            </select>
          </div>

          {/* 奖励星星数量 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              奖励星星数量
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="1"
                max="10"
                value={stars}
                onChange={(e) => setStars(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-2xl font-bold text-yellow-500">
                {stars} ⭐
              </span>
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleAdd}
              disabled={isLoading || !title.trim()}
              className="flex-1 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
            >
              添加任务
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;

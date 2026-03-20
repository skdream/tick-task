import React, { useState } from 'react';

interface Child {
  id: string;
  name: string;
  avatar: string;
  password: string;
}

interface ManageChildrenModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: Child[];
  onAddChild: (name: string, password: string) => Promise<void>;
  onEditChild: (id: string, name: string, password: string) => Promise<void>;
  onDeleteChild: (id: string) => Promise<void>;
  isLoading?: boolean;
}

const ManageChildrenModal: React.FC<ManageChildrenModalProps> = ({
  isOpen,
  onClose,
  children,
  onAddChild,
  onEditChild,
  onDeleteChild,
  isLoading = false,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [editName, setEditName] = useState('');
  const [editPassword, setEditPassword] = useState('');

  const handleAdd = async () => {
    if (!name.trim() || !password) return;
    await onAddChild(name, password);
    setName('');
    setPassword('');
    setShowAddForm(false);
  };

  const handleEdit = async (child: Child) => {
    setEditingChildId(child.id);
    setEditName(child.name);
    setEditPassword(child.password);
  };

  const handleSaveEdit = async () => {
    if (!editingChildId || !editName.trim()) return;
    await onEditChild(editingChildId, editName, editPassword);
    setEditingChildId(null);
    setEditName('');
    setEditPassword('');
  };

  const handleCancelEdit = () => {
    setEditingChildId(null);
    setEditName('');
    setEditPassword('');
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setName('');
    setPassword('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* 弹窗内容 */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">管理孩子</h2>
          <button
            onClick={onClose}
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
          {/* 添加孩子表单 */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              + 添加孩子
            </button>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold text-gray-800">添加新孩子</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="请输入孩子的姓名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">登录密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="请输入登录密码"
                />
              </div>
              <div className="flex space-x-2">

                <button
                  onClick={handleCancelAdd}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAdd}
                  disabled={isLoading || !name.trim() || !password}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  添加
                </button>
              </div>
            </div>
          )}

          {/* 孩子列表 */}
          <div className="space-y-3">
            {children.length === 0 ? (
              <p className="text-center text-gray-500 py-4">暂无孩子</p>
            ) : (
              children.map((child) => (
                <div
                  key={child.id}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  {editingChildId === child.id ? (
                    // 编辑模式
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">登录密码</label>
                        <input
                          type="password"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                          disabled={isLoading || !editName.trim()}
                          className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 查看模式
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{child.avatar}</div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{child.name}</h3>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(child)}
                          disabled={isLoading}
                          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-3 py-1 rounded transition-colors"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`确定要删除 ${child.name} 吗？`)) {
                              onDeleteChild(child.id);
                            }
                          }}
                          disabled={isLoading}
                          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-3 py-1 rounded transition-colors"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageChildrenModal;

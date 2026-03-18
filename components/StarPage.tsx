'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { StarLog } from '@/types';

const StarPage: React.FC = () => {
  const { starLogs, users, currentUser } = useApp();
  const isParent = currentUser?.role === 'parent';
  
  // 获取当前家庭中的所有孩子
  const children = users.filter(user => user.role === 'child' && user.familyId === currentUser?.familyId);
  
  // 初始化选中的用户ID
  const [selectedUserId, setSelectedUserId] = useState<string>(() => {
    if (isParent && children.length > 0) {
      return children[0].id;
    }
    return currentUser?.id || '';
  });

  // 计算当前家庭中每个用户的星星总数
  const userStars = users.reduce((acc, user) => {
    if (user.familyId !== currentUser?.familyId) return acc;
    const logs = starLogs.filter(log => log.userId === user.id && log.familyId === currentUser?.familyId);
    const total = logs.reduce((sum, log) => sum + log.stars, 0);
    acc[user.id] = total;
    return acc;
  }, {} as Record<string, number>);

  // 获取当前用户的星星总数
  const currentUserStars = userStars[selectedUserId] || 0;

  // 获取当前用户的星星日志
  const currentUserLogs = starLogs
    .filter(log => log.userId === selectedUserId && log.familyId === currentUser?.familyId)
    .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime());

  // 获取用户信息
  const selectedUser = users.find(user => user.id === selectedUserId);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        星星
      </h1>

      {/* 星星总数展示 */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-lg p-8 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg opacity-90 mb-2">
              {selectedUser?.name || '用户'} 的星星总数
            </p>
            <p className="text-6xl font-bold">
              {currentUserStars} ⭐
            </p>
          </div>
          <div className="text-8xl opacity-20">
            ⭐
          </div>
        </div>
      </div>

      {/* 用户选择器 - 只有家长可以看到 */}
      {isParent && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择查看孩子的星星
          </label>
          <div className="flex space-x-2">
            {children.map(child => (
              <button
                key={child.id}
                onClick={() => setSelectedUserId(child.id)}
                className={`
                  flex-1 px-4 py-2 rounded-lg transition-colors
                  ${selectedUserId === child.id
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

      {/* 所有成员星星统计 - 只有家长可以看到 */}
      {isParent && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            家庭成员星星统计
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {children.map(user => (
            <div
              key={user.id}
              className={`
                rounded-lg p-4 border-2 transition-all
                ${selectedUserId === user.id 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-200 hover:border-indigo-300'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{user.avatar}</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{user.name}</p>
                  <p className="text-sm text-gray-500">
                    {user.role === 'parent' ? '家长' : '孩子'}
                  </p>
                </div>
                <div className="text-2xl font-bold text-yellow-500">
                  {userStars[user.id] || 0} ⭐
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* 星星获取日志 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          星星获取日志
        </h2>
        {currentUserLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>暂无星星获取记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentUserLogs.map(log => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl text-yellow-500">
                    ⭐
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      获得 {log.stars} 颗星星
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(log.earnedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StarPage;

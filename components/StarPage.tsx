'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { StarLog } from '@/types';

const StarPage: React.FC = () => {
  const { users, currentUser, tasks, getStarLogsPaginated, getUserTotalStars } = useApp();
  const isParent = currentUser?.role === 'parent';
  
  const children = useMemo(() => 
    users.filter(user => user.role === 'child' && user.familyId === currentUser?.familyId),
    [users, currentUser?.familyId]
  );
  
  // 当 children 变化时，重新设置 selectedUserId
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const [userStars, setUserStars] = useState<Record<string, number>>({});
  const [currentUserStars, setCurrentUserStars] = useState(0);

  // 当 children 变化时，自动设置 selectedUserId
  useEffect(() => {
    if (isParent && children.length > 0 && !selectedUserId) {
      setSelectedUserId(children[0].id);
    } else if (!isParent && currentUser?.id) {
      setSelectedUserId(currentUser.id);
    }
  }, [children, isParent, currentUser?.id, selectedUserId]);

  useEffect(() => {
    const fetchCurrentUserStars = async () => {
      if (!currentUser) return;

      try {
        if (!isParent) {
          const result = await getUserTotalStars(currentUser.id);
          setCurrentUserStars(result.data);
          setUserStars(prev => ({ ...prev, [currentUser.id]: result.data }));
        } else {
          const starsMap: Record<string, number> = {};
          for (const child of children) {
            try {
              const result = await getUserTotalStars(child.id);
              starsMap[child.id] = result.data;
            } catch (error) {
              console.error(`获取孩子${child.name}的星星总数失败:`, error);
              starsMap[child.id] = 0;
            }
          }
          setUserStars(starsMap);
          if (selectedUserId && starsMap[selectedUserId] !== undefined) {
            setCurrentUserStars(starsMap[selectedUserId]);
          }
        }
      } catch (error) {
        console.error('获取星星总数失败:', error);
        setCurrentUserStars(0);
      }
    };

    fetchCurrentUserStars();
  }, [currentUser, isParent, children, selectedUserId, getUserTotalStars]);

  useEffect(() => {
    if (isParent && selectedUserId && userStars[selectedUserId] !== undefined) {
      setCurrentUserStars(userStars[selectedUserId]);
    }
  }, [selectedUserId, userStars, isParent]);

  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedLogs, setPaginatedLogs] = useState<StarLog[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const itemsPerPage = 10;
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoadingLogs(true);
      try {
        const result = await getStarLogsPaginated(selectedUserId, currentPage, itemsPerPage);
        setPaginatedLogs(result.data);
        setTotalLogs(result.total);
      } catch (error) {
        console.error('获取星星日志失败:', error);
      } finally {
        setIsLoadingLogs(false);
      }
    };

    if (selectedUserId) {
      fetchLogs();
    }
  }, [selectedUserId, currentPage, getStarLogsPaginated]);

  const totalPages = Math.ceil(totalLogs / itemsPerPage);

  const selectedUser = users.find(user => user.id === selectedUserId);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        星星
      </h1>

      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-lg p-8 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg opacity-90 mb-2">
              {selectedUser?.name || '用户'} 的星星总数
            </p>
            <p className="text-6xl font-bold">
              {isParent ? currentUserStars : currentUserStars} ⭐
            </p>
          </div>
          <div className="text-8xl opacity-20">
            ⭐
          </div>
        </div>
      </div>

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

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          星星获取日志
        </h2>
        {isLoadingLogs ? (
          <div className="text-center py-8 text-gray-500">
            <p>加载中...</p>
          </div>
        ) : paginatedLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>暂无星星获取记录</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedLogs.map(log => {
              const task = tasks.find(t => t.id === log.taskId);
              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl text-yellow-500">
                      ⭐
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        获得 {log.stars} 颗星星
                      </p>
                      {task && (
                        <>
                          <p className="text-sm text-gray-700 mt-1">
                            任务：{task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-gray-500 mt-1">
                              {task.description}
                            </p>
                          )}
                          {task.category && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                              {task.category}
                            </span>
                          )}
                        </>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(log.earnedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  上一页
                </button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default StarPage;

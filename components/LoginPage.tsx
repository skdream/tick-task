'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';

type UserRole = 'parent' | 'child';

const LoginPage: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string>('');

  const handleLogin = async () => {
    setError('');
    if (!email || !pin || !password || !selectedRole) {
      setError('请填写所有字段');
      return;
    }

    if (pin.length < 4 || pin.length > 6) {
      setError('PIN码必须是4-6位数字');
      return;
    }

    const success = await login(email, pin, password, selectedRole);
    if (!success) {
      setError('邮箱、PIN码或密码错误，或者该类型用户不存在');
    }
  };

  // 获取可用的角色
  const availableRoles = [
    { role: 'parent' as const, label: '家长', icon: '👨‍👩‍👧' },
    { role: 'child' as const, label: '孩子', icon: '👦👧' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          家庭目标管理系统
        </h1>

        <div className="space-y-6">
          {/* 家庭邮箱输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              家庭邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入家庭邮箱"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* PIN码输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              家庭PIN码（4-6位）
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="请输入PIN码"
              maxLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* 密码输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              登录密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入登录密码"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* 角色选择 */}
          <div>
            <p className="text-gray-600 text-center mb-4">
              请选择您的角色
            </p>
            <div className="grid grid-cols-2 gap-4">
              {availableRoles.map((roleOption) => (
                <button
                  key={roleOption.role}
                  onClick={() => setSelectedRole(roleOption.role)}
                  className={`
                    flex flex-col items-center p-6 rounded-xl transition-all duration-200
                    ${selectedRole === roleOption.role
                      ? 'ring-2 ring-indigo-500 ' + (roleOption.role === 'parent'
                          ? 'bg-blue-100 border-2 border-blue-300'
                          : 'bg-yellow-100 border-2 border-yellow-300')
                      : roleOption.role === 'parent'
                        ? 'bg-blue-50 hover:bg-blue-100 border-2 border-blue-200'
                        : 'bg-yellow-50 hover:bg-yellow-100 border-2 border-yellow-200'
                    }
                  `}
                >
                  <div className="text-4xl mb-2">{roleOption.icon}</div>
                  <div className="text-sm font-medium text-gray-800">{roleOption.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* 登录按钮 */}
          <button
            onClick={handleLogin}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            登录
          </button>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>💡 提示：家长可以管理任务，孩子可以完成任务获取星星</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

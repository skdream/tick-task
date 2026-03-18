# 数据库集成指南

## 概述

本项目已从 Mock 数据迁移到 Supabase 数据库，实现了真实的后端 API。

## 安装依赖

运行以下命令安装 Supabase 依赖包：

```bash
npm install
```

## 环境变量

确保 `.env.local` 文件包含以下 Supabase 配置：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 数据库初始化

1. 在 Supabase 控制台中创建新项目
2. 在 SQL 编辑器中运行 `docs/supabase-schema.sql` 中的建表脚本
3. 确保以下表已创建：
   - families (家庭表)
   - users (用户表)
   - tasks (任务表)
   - star_logs (星星日志表)

## API 接口说明

### 家庭相关
- `getFamilies()` - 获取所有家庭
- `registerFamily()` - 注册新家庭

### 用户相关
- `getFamilyMembers()` - 获取家庭成员
- `addChild()` - 添加孩子
- `editChild()` - 编辑孩子信息
- `deleteChild()` - 删除孩子

### 任务相关
- `getTasks()` - 获取任务列表
- `createTask()` - 创建新任务
- `updateTaskStatus()` - 更新任务状态
- `deleteTask()` - 删除任务

### 星星相关
- `getStarLogs()` - 获取星星日志
- `getUserTotalStars()` - 获取用户星星总数

## 数据结构

### families 表
- id (UUID, 主键)
- name (VARCHAR, 家庭名称)
- email (VARCHAR, 唯一)
- pin (VARCHAR, 4-6位PIN码)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### users 表
- id (UUID, 主键)
- name (VARCHAR, 用户名)
- role (VARCHAR, parent/child)
- family_id (UUID, 外键)
- avatar (VARCHAR, 头像)
- password (VARCHAR, 密码)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### tasks 表
- id (UUID, 主键)
- title (VARCHAR, 任务标题)
- description (TEXT, 任务描述)
- category (VARCHAR, 任务分类)
- status (VARCHAR, pending/completed)
- stars (INTEGER, 星星数量)
- created_at (TIMESTAMP)
- completed_at (TIMESTAMP)
- created_by (UUID, 外键)
- completed_by (UUID, 外键)
- family_id (UUID, 外键)
- assigned_to (UUID, 外键)

### star_logs 表
- id (UUID, 主键)
- user_id (UUID, 外键)
- task_id (UUID, 外键)
- stars (INTEGER, 星星数量)
- earned_at (TIMESTAMP)
- family_id (UUID, 外键)

## 注意事项

1. PIN码只保存在 families 表中，用户表中不再存储 PIN 码
2. 家庭成员共享同一个 PIN 码
3. 数据库已启用 Row Level Security (RLS) 策略
4. 任务完成时会自动创建星星日志（通过触发器）
5. 所有时间戳字段自动更新（通过触发器）

## 运行项目

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

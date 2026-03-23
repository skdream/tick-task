-- ============================================
-- Tick-Task 数据库建表脚本 (Supabase/PostgreSQL)
-- ============================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. 家庭表 (families)
-- ============================================
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  pin VARCHAR(6) NOT NULL CHECK (LENGTH(pin) BETWEEN 4 AND 6),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. 用户表 (users)
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('parent', 'child')),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  avatar VARCHAR(50),
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. 任务表 (tasks)
-- ============================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'other',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  stars INTEGER NOT NULL DEFAULT 0 CHECK (stars >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- 4. 星星日志表 (star_logs)
-- ============================================
CREATE TABLE star_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  stars INTEGER NOT NULL CHECK (stars > 0),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE
);

-- ============================================
-- 索引
-- ============================================

-- families 表索引
CREATE INDEX idx_families_email ON families(email);
CREATE INDEX idx_families_pin ON families(pin);

-- users 表索引
CREATE INDEX idx_users_family_id ON users(family_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_family_role ON users(family_id, role);

-- tasks 表索引
CREATE INDEX idx_tasks_family_id ON tasks(family_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_family_status ON tasks(family_id, status);
CREATE INDEX idx_tasks_family_category ON tasks(family_id, category);

-- star_logs 表索引
CREATE INDEX idx_star_logs_user_id ON star_logs(user_id);
CREATE INDEX idx_star_logs_task_id ON star_logs(task_id);
CREATE INDEX idx_star_logs_family_id ON star_logs(family_id);
CREATE INDEX idx_star_logs_user_family ON star_logs(user_id, family_id);
CREATE INDEX idx_star_logs_earned_at ON star_logs(earned_at);

-- ============================================
-- Row Level Security (RLS) 策略
-- ============================================
-- 注意：由于应用使用自定义认证系统（email + pin + password），
-- 不使用 Supabase Auth，因此暂时不启用 RLS。
-- 权限控制在应用层实现（lib/db.ts）。
-- 
-- 如果将来需要使用 Supabase Auth，可以取消注释以下内容并调整策略。

-- ALTER TABLE families ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE star_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 视图
-- ============================================

-- 创建用户星星总数视图
CREATE VIEW user_total_stars AS
SELECT
  u.id AS user_id,
  u.name,
  u.family_id,
  COALESCE(SUM(sl.stars), 0) AS total_stars
FROM users u
LEFT JOIN star_logs sl ON u.id = sl.user_id
GROUP BY u.id, u.name, u.family_id;

-- 创建星星日志详情视图（包含任务信息）
CREATE VIEW star_logs_with_task_details AS
SELECT
  sl.id,
  sl.user_id,
  u.name AS user_name,
  sl.task_id,
  t.title AS task_title,
  t.description AS task_description,
  t.category AS task_category,
  sl.stars,
  sl.earned_at,
  sl.family_id
FROM star_logs sl
JOIN users u ON sl.user_id = u.id
JOIN tasks t ON sl.task_id = t.id;

-- ============================================
-- 触发器
-- ============================================

-- 任务完成时自动创建星星记录的函数
-- 只有在20:30前完成的任务才能获得星星
CREATE OR REPLACE FUNCTION create_star_log_on_task_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status = 'pending' THEN
    -- 检查当前时间是否在20:30之前
    IF EXTRACT(HOUR FROM NOW()) < 20 OR (EXTRACT(HOUR FROM NOW()) = 20 AND EXTRACT(MINUTE FROM NOW()) < 30) THEN
      INSERT INTO star_logs (user_id, task_id, stars, family_id)
      VALUES (
        NEW.completed_by,
        NEW.id,
        NEW.stars,
        NEW.family_id
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER trigger_create_star_log
AFTER UPDATE OF status ON tasks
FOR EACH ROW
EXECUTE FUNCTION create_star_log_on_task_completion();

-- 任务由已完成撤销为未完成时删除星星记录的函数
CREATE OR REPLACE FUNCTION delete_star_log_on_task_revert()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'completed' AND NEW.status = 'pending' THEN
    DELETE FROM star_logs
    WHERE task_id = OLD.id AND user_id = OLD.completed_by;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建撤销任务时删除星星记录的触发器
CREATE TRIGGER trigger_delete_star_log_on_revert
AFTER UPDATE OF status ON tasks
FOR EACH ROW
EXECUTE FUNCTION delete_star_log_on_task_revert();

-- 为 families 表创建更新时间戳触发器
CREATE TRIGGER update_families_updated_at
  BEFORE UPDATE ON families
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为 users 表创建更新时间戳触发器
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 示例数据（可选，用于测试）
-- ============================================

-- 插入示例家庭
INSERT INTO families (name, email, pin) VALUES
  ('张家', 'zhang@example.com', '1234'),
  ('李家', 'li@example.com', '5678');

-- 插入示例用户（不包含pin字段，使用家庭PIN码）
INSERT INTO users (name, role, family_id, avatar, password) VALUES
  ('张家长', 'parent', (SELECT id FROM families WHERE email = 'zhang@example.com'), '👨‍👩‍👧', 'parent123'),
  ('小明', 'child', (SELECT id FROM families WHERE email = 'zhang@example.com'), '👦', 'child111'),
  ('小红', 'child', (SELECT id FROM families WHERE email = 'zhang@example.com'), '👧', 'child222'),
  ('李家长', 'parent', (SELECT id FROM families WHERE email = 'li@example.com'), '👨‍👩‍👧', 'parent456'),
  ('小李', 'child', (SELECT id FROM families WHERE email = 'li@example.com'), '👦', 'child333'),
  ('小芳', 'child', (SELECT id FROM families WHERE email = 'li@example.com'), '👧', 'child444');

-- 插入示例任务
INSERT INTO tasks (title, description, category, status, stars, created_by, family_id, assigned_to) VALUES
  ('完成数学作业', '完成第3章练习题', '学习', 'pending', 3,
   (SELECT id FROM users WHERE name = '张家长'),
   (SELECT id FROM families WHERE email = 'zhang@example.com'),
   (SELECT id FROM users WHERE name = '小明')),
  ('阅读30分钟', '阅读课外书籍', '阅读', 'completed', 2,
   (SELECT id FROM users WHERE name = '张家长'),
   (SELECT id FROM families WHERE email = 'zhang@example.com'),
   (SELECT id FROM users WHERE name = '小明')),
  ('整理房间', '整理自己的房间和书桌', '家务', 'pending', 2,
   (SELECT id FROM users WHERE name = '张家长'),
   (SELECT id FROM families WHERE email = 'zhang@example.com'),
   (SELECT id FROM users WHERE name = '小红')),
  ('完成语文作业', '完成作文练习', '学习', 'completed', 3,
   (SELECT id FROM users WHERE name = '李家长'),
   (SELECT id FROM families WHERE email = 'li@example.com'),
   (SELECT id FROM users WHERE name = '小李')),
  ('做家务', '帮忙洗碗和打扫卫生', '家务', 'pending', 2,
   (SELECT id FROM users WHERE name = '李家长'),
   (SELECT id FROM families WHERE email = 'li@example.com'),
   (SELECT id FROM users WHERE name = '小李'));

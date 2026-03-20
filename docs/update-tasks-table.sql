-- ============================================
-- 更新 tasks 表，添加任务日期字段
-- ============================================

-- 添加任务日期字段
ALTER TABLE tasks ADD COLUMN task_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- 添加索引以提高查询性能
CREATE INDEX idx_tasks_task_date ON tasks(task_date);
CREATE INDEX idx_tasks_family_date ON tasks(family_id, task_date);
CREATE INDEX idx_tasks_family_date_status ON tasks(family_id, task_date, status);

-- 更新现有记录的任务日期为创建日期
UPDATE tasks SET task_date = DATE(created_at) WHERE task_date IS NULL;

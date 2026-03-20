-- 更新tasks表task_date字段类型为VARCHAR
-- 注意：执行此脚本前请确保已备份数据库

-- 1. 添加新的VARCHAR类型的task_date_str字段
ALTER TABLE tasks ADD COLUMN task_date_str VARCHAR(10);

-- 2. 将现有的task_date数据转换为字符串格式并存储到新字段
UPDATE tasks 
SET task_date_str = TO_CHAR(task_date, 'YYYY-MM-DD');

-- 3. 删除原有的task_date字段
ALTER TABLE tasks DROP COLUMN task_date;

-- 4. 将新字段重命名为task_date
ALTER TABLE tasks RENAME COLUMN task_date_str TO task_date;

-- 5. 设置NOT NULL约束
ALTER TABLE tasks ALTER COLUMN task_date SET NOT NULL;

-- 6. 重建索引
DROP INDEX IF EXISTS idx_tasks_task_date;
DROP INDEX IF EXISTS idx_tasks_family_date;
DROP INDEX IF EXISTS idx_tasks_family_date_status;

CREATE INDEX idx_tasks_task_date ON tasks(task_date);
CREATE INDEX idx_tasks_family_date ON tasks(family_id, task_date);
CREATE INDEX idx_tasks_family_date_status ON tasks(family_id, task_date, status);

-- Expand task statuses from pending/completed to new/in_progress/completed
-- Also migrate existing rows.

-- 1) Migrate existing data
UPDATE tasks
SET status = 'new'
WHERE status = 'pending';

-- 2) Update default
ALTER TABLE tasks
ALTER COLUMN status SET DEFAULT 'new';

-- 3) Update constraint
ALTER TABLE tasks
DROP CONSTRAINT IF EXISTS tasks_status_check;

ALTER TABLE tasks
ADD CONSTRAINT tasks_status_check
CHECK (status IN ('new', 'in_progress', 'completed'));

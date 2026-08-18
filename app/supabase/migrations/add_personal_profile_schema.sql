-- ============================================================
-- Migration: Personal Profile Schema Enhancement
-- Description: Adds task categories, tags, subtasks, recurrence
--              rules, and enhanced profile fields for personal
--              task management in Workdayr.
-- Date: 2026-02-12
-- ============================================================

-- ============================================================
-- 1. TASK CATEGORIES (Life Areas)
-- ============================================================
-- Stores both system-default and user-created categories.
-- System categories are shared (user_id IS NULL).

CREATE TABLE IF NOT EXISTS task_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📋',
  color TEXT NOT NULL DEFAULT '#6B7280',
  is_system BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent duplicate category names per user (and per system)
CREATE UNIQUE INDEX idx_task_categories_unique_name
  ON task_categories (COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid), LOWER(name));

-- Index for fast lookups
CREATE INDEX idx_task_categories_user ON task_categories(user_id);

-- RLS
ALTER TABLE task_categories ENABLE ROW LEVEL SECURITY;

-- Users can see system categories + their own
CREATE POLICY "Users can view system and own categories"
  ON task_categories FOR SELECT
  USING (is_system = true OR user_id = auth.uid());

-- Users can create their own categories
CREATE POLICY "Users can create own categories"
  ON task_categories FOR INSERT
  WITH CHECK (user_id = auth.uid() AND is_system = false);

-- Users can update their own categories only
CREATE POLICY "Users can update own categories"
  ON task_categories FOR UPDATE
  USING (user_id = auth.uid() AND is_system = false);

-- Users can delete their own categories only
CREATE POLICY "Users can delete own categories"
  ON task_categories FOR DELETE
  USING (user_id = auth.uid() AND is_system = false);

-- Seed 8 default system categories
INSERT INTO task_categories (user_id, name, icon, color, is_system, sort_order) VALUES
  (NULL, 'Work',            '💼', '#3B82F6', true, 1),
  (NULL, 'Home',            '🏠', '#10B981', true, 2),
  (NULL, 'Finance',         '💰', '#F59E0B', true, 3),
  (NULL, 'Health & Fitness','💪', '#EF4444', true, 4),
  (NULL, 'Learning',        '📚', '#8B5CF6', true, 5),
  (NULL, 'Social',          '👥', '#EC4899', true, 6),
  (NULL, 'Errands',         '🛒', '#F97316', true, 7),
  (NULL, 'Goals',           '🎯', '#06B6D4', true, 8);


-- ============================================================
-- 2. TASK RECURRENCE RULES
-- ============================================================

CREATE TABLE IF NOT EXISTS task_recurrence_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  interval INTEGER NOT NULL DEFAULT 1 CHECK (interval >= 1),
  days_of_week INTEGER[] DEFAULT NULL,       -- For weekly: 0=Sun, 1=Mon, ..., 6=Sat
  day_of_month INTEGER DEFAULT NULL CHECK (day_of_month IS NULL OR (day_of_month >= 1 AND day_of_month <= 31)),
  month_of_year INTEGER DEFAULT NULL CHECK (month_of_year IS NULL OR (month_of_year >= 1 AND month_of_year <= 12)),
  end_type TEXT NOT NULL DEFAULT 'never' CHECK (end_type IN ('never', 'on_date', 'after_count')),
  end_date DATE DEFAULT NULL,
  max_occurrences INTEGER DEFAULT NULL CHECK (max_occurrences IS NULL OR max_occurrences >= 1),
  occurrences_created INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_recurrence_rules_user ON task_recurrence_rules(user_id);

-- RLS
ALTER TABLE task_recurrence_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recurrence rules"
  ON task_recurrence_rules FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own recurrence rules"
  ON task_recurrence_rules FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own recurrence rules"
  ON task_recurrence_rules FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own recurrence rules"
  ON task_recurrence_rules FOR DELETE
  USING (user_id = auth.uid());


-- ============================================================
-- 3. ALTER TASKS TABLE — Add category & recurrence FK
-- ============================================================

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES task_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS recurrence_rule_id UUID REFERENCES task_recurrence_rules(id) ON DELETE SET NULL;

CREATE INDEX idx_tasks_category ON tasks(category_id);
CREATE INDEX idx_tasks_recurrence ON tasks(recurrence_rule_id);


-- ============================================================
-- 4. TASK TAGS (User-Defined Labels)
-- ============================================================

CREATE TABLE IF NOT EXISTS task_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6B7280',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Each user's tag names must be unique
CREATE UNIQUE INDEX idx_task_tags_unique_per_user
  ON task_tags (user_id, LOWER(name));

CREATE INDEX idx_task_tags_user ON task_tags(user_id);

-- RLS
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tags"
  ON task_tags FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own tags"
  ON task_tags FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own tags"
  ON task_tags FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own tags"
  ON task_tags FOR DELETE
  USING (user_id = auth.uid());


-- ============================================================
-- 5. TASK ↔ TAG MAPPING (Many-to-Many)
-- ============================================================

CREATE TABLE IF NOT EXISTS task_tag_map (
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES task_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

CREATE INDEX idx_task_tag_map_task ON task_tag_map(task_id);
CREATE INDEX idx_task_tag_map_tag ON task_tag_map(tag_id);

-- RLS
ALTER TABLE task_tag_map ENABLE ROW LEVEL SECURITY;

-- Users can manage tag mappings for their own tasks
CREATE POLICY "Users can view own task tags"
  ON task_tag_map FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id = task_tag_map.task_id AND tasks.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can add tags to own tasks"
  ON task_tag_map FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id = task_tag_map.task_id AND tasks.created_by = auth.uid()
    )
    AND
    EXISTS (
      SELECT 1 FROM task_tags WHERE task_tags.id = task_tag_map.tag_id AND task_tags.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove tags from own tasks"
  ON task_tag_map FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id = task_tag_map.task_id AND tasks.created_by = auth.uid()
    )
  );


-- ============================================================
-- 6. TASK SUBTASKS (Checklists)
-- ============================================================

CREATE TABLE IF NOT EXISTS task_subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_task_subtasks_task ON task_subtasks(task_id);

-- Auto-update updated_at on subtask changes
CREATE TRIGGER update_task_subtasks_updated_at
  BEFORE UPDATE ON task_subtasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE task_subtasks ENABLE ROW LEVEL SECURITY;

-- Users can manage subtasks of their own tasks
CREATE POLICY "Users can view subtasks of own tasks"
  ON task_subtasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id = task_subtasks.task_id AND tasks.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create subtasks for own tasks"
  ON task_subtasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id = task_subtasks.task_id AND tasks.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update subtasks of own tasks"
  ON task_subtasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id = task_subtasks.task_id AND tasks.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete subtasks of own tasks"
  ON task_subtasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id = task_subtasks.task_id AND tasks.created_by = auth.uid()
    )
  );


-- ============================================================
-- 7. ENHANCE PROFILES TABLE
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB NOT NULL DEFAULT '{
    "daily_summary": false,
    "due_date_reminder": true,
    "overdue_alert": true
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS theme_preference TEXT NOT NULL DEFAULT 'system'
    CHECK (theme_preference IN ('system', 'light', 'dark')),
  ADD COLUMN IF NOT EXISTS daily_goal INTEGER DEFAULT NULL
    CHECK (daily_goal IS NULL OR (daily_goal >= 1 AND daily_goal <= 50));


-- ============================================================
-- 8. HELPER FUNCTION: Auto-set completed_at for subtasks
-- ============================================================

CREATE OR REPLACE FUNCTION handle_subtask_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = true AND (OLD.is_completed = false OR OLD.is_completed IS NULL) THEN
    NEW.completed_at = now();
  ELSIF NEW.is_completed = false AND OLD.is_completed = true THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_subtask_completed_at
  BEFORE UPDATE ON task_subtasks
  FOR EACH ROW
  EXECUTE FUNCTION handle_subtask_completion();


-- ============================================================
-- Done! Personal profile schema enhancement complete.
-- ============================================================

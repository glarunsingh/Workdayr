-- Workdayr Database Schema (Personal Use)
-- Run this in Supabase SQL Editor
-- ================================

-- 1. PROFILES TABLE
-- Extends Supabase auth.users with app-specific data
-- ================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  mode TEXT DEFAULT 'personal' CHECK (mode IN ('personal', 'business')),
  week_starts_on TEXT DEFAULT 'sunday' CHECK (week_starts_on IN ('sunday', 'monday')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. TASKS TABLE
-- Personal task storage
-- ================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title TEXT NOT NULL,
  description TEXT,

  due_date DATE NOT NULL,
  end_date DATE,

  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),

  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  team_id UUID,
  task_type TEXT DEFAULT 'personal' CHECK (task_type IN ('personal', 'business')),

  CONSTRAINT tasks_personal_only CHECK (
    task_type = 'personal' AND team_id IS NULL
  ),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 3. INDEXES
-- ================================
CREATE INDEX idx_tasks_created_by_due_date ON tasks(created_by, due_date);
CREATE INDEX idx_tasks_status ON tasks(status);

-- 4. RLS POLICIES FOR TASKS
-- ================================
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create own tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND task_type = 'personal'
    AND team_id IS NULL
    AND assignee_id IS NULL
  );

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (
    auth.uid() = created_by
    AND task_type = 'personal'
    AND team_id IS NULL
    AND assignee_id IS NULL
  );

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = created_by);

-- 5. AUTO-CREATE PROFILE ON SIGNUP
-- ================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. UPDATE TIMESTAMP FUNCTION
-- ================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 7. GRANTS
-- ================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO authenticated;

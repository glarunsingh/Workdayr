-- Workdayr Database Schema
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

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own profile
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 2. COMPANIES TABLE
-- Business entities
-- ================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- 3. TEAMS TABLE
-- Teams within companies
-- ================================
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- 4. TEAM_MEMBERS TABLE
-- User-team relationships with roles
-- ================================
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- 5. TASKS TABLE
-- Main task storage
-- ================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Task content
  title TEXT NOT NULL,
  description TEXT,
  
  -- Dates
  due_date DATE NOT NULL,
  end_date DATE, -- For multi-day tasks (NULL = single day)
  
  -- Status & Priority
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  
  -- Ownership
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Business context (NULL for personal tasks)
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Task type
  task_type TEXT DEFAULT 'personal' CHECK (task_type IN ('personal', 'business')),

  -- Ensure team context matches task type
  CONSTRAINT tasks_team_type_consistency CHECK (
    (task_type = 'personal' AND team_id IS NULL)
    OR
    (task_type = 'business' AND team_id IS NOT NULL)
  ),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 6. INDEXES FOR PERFORMANCE
-- ================================
-- Tasks by user and date (most common query)
CREATE INDEX idx_tasks_created_by_due_date ON tasks(created_by, due_date);
CREATE INDEX idx_tasks_assignee_due_date ON tasks(assignee_id, due_date);
CREATE INDEX idx_tasks_team_due_date ON tasks(team_id, due_date);
CREATE INDEX idx_tasks_status ON tasks(status);

-- Team lookups
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_teams_company ON teams(company_id);

-- 7. RLS POLICIES FOR TASKS
-- ================================
-- Personal tasks: only creator can see
CREATE POLICY "Users can view own personal tasks"
  ON tasks FOR SELECT
  USING (
    task_type = 'personal' AND created_by = auth.uid()
  );

-- Helper function to check if current user is an admin of a team
CREATE OR REPLACE FUNCTION public.is_team_admin(team_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = team_uuid
      AND tm.user_id = auth.uid()
      AND tm.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Business tasks: team members see tasks assigned to them, unassigned tasks,
-- tasks they created, and team admins can see all tasks in their teams.
CREATE POLICY "Team members can view relevant business tasks"
  ON tasks FOR SELECT
  USING (
    task_type = 'business'
    AND team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    AND (
      public.is_team_admin(team_id)
      OR created_by = auth.uid()
      OR assignee_id = auth.uid()
      OR assignee_id IS NULL
    )
  );

-- Users can create personal tasks for themselves
CREATE POLICY "Users can create personal tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND task_type = 'personal'
    AND team_id IS NULL
    AND assignee_id IS NULL
  );

-- Team members can create business tasks in their teams
CREATE POLICY "Team members can create business tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND task_type = 'business'
    AND team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    AND (
      assignee_id IS NULL
      OR EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = tasks.team_id
          AND tm.user_id = tasks.assignee_id
      )
    )
  );

-- Users can update their own personal tasks
CREATE POLICY "Users can update own personal tasks"
  ON tasks FOR UPDATE
  USING (
    task_type = 'personal' AND created_by = auth.uid()
  )
  WITH CHECK (
    task_type = 'personal' AND created_by = auth.uid() AND team_id IS NULL AND assignee_id IS NULL
  );

-- Business tasks: creator/assignee/admin can update within their teams
CREATE POLICY "Team members can update relevant business tasks"
  ON tasks FOR UPDATE
  USING (
    task_type = 'business'
    AND team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    AND (
      public.is_team_admin(team_id)
      OR created_by = auth.uid()
      OR assignee_id = auth.uid()
    )
  )
  WITH CHECK (
    task_type = 'business'
    AND team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    AND (
      assignee_id IS NULL
      OR EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = tasks.team_id
          AND tm.user_id = tasks.assignee_id
      )
    )
  );

-- Users can delete their own personal tasks
CREATE POLICY "Users can delete own personal tasks"
  ON tasks FOR DELETE
  USING (
    task_type = 'personal' AND created_by = auth.uid()
  );

-- Business tasks: creator/admin can delete within their teams
CREATE POLICY "Team members can delete relevant business tasks"
  ON tasks FOR DELETE
  USING (
    task_type = 'business'
    AND team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    AND (
      public.is_team_admin(team_id)
      OR created_by = auth.uid()
    )
  );

-- 8. RLS POLICIES FOR COMPANIES & TEAMS
-- ================================
-- Users can see companies they're part of
CREATE POLICY "Users can view their companies"
  ON companies FOR SELECT
  USING (
    id IN (
      SELECT c.id FROM companies c
      JOIN teams t ON t.company_id = c.id
      JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.user_id = auth.uid()
    )
    OR created_by = auth.uid()
  );

-- Users can create companies
CREATE POLICY "Users can create companies"
  ON companies FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Users can see teams they're part of
CREATE POLICY "Users can view their teams"
  ON teams FOR SELECT
  USING (
    id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

-- Team members can see other team members
CREATE POLICY "Team members can view team members"
  ON team_members FOR SELECT
  USING (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

-- 9. AUTO-CREATE PROFILE ON SIGNUP
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

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. UPDATE TIMESTAMP FUNCTION
-- ================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

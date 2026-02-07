-- Migration: Harden task constraints + RLS policies
-- Applies the updated task_type/team_id constraints and tighter task visibility rules.

-- Ensure RLS is enabled
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Ensure helper exists
CREATE OR REPLACE FUNCTION public.is_team_admin(team_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = team_uuid
      AND tm.user_id = auth.uid()
      AND tm.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enforce task type/team consistency
DO $$
BEGIN
  ALTER TABLE public.tasks
    ADD CONSTRAINT tasks_team_type_consistency CHECK (
      (task_type = 'personal' AND team_id IS NULL)
      OR
      (task_type = 'business' AND team_id IS NOT NULL)
    );
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- Drop old policies (if present)
DROP POLICY IF EXISTS "Users can view own personal tasks" ON public.tasks;
DROP POLICY IF EXISTS "Team members can view business tasks" ON public.tasks;
DROP POLICY IF EXISTS "Team members can view relevant business tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create personal tasks" ON public.tasks;
DROP POLICY IF EXISTS "Team members can create business tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update own or assigned tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update own personal tasks" ON public.tasks;
DROP POLICY IF EXISTS "Team members can update relevant business tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete own personal tasks" ON public.tasks;
DROP POLICY IF EXISTS "Team members can delete relevant business tasks" ON public.tasks;

-- Recreate policies

-- Personal tasks: only creator can see
CREATE POLICY "Users can view own personal tasks"
  ON public.tasks FOR SELECT
  USING (task_type = 'personal' AND created_by = auth.uid());

-- Business tasks:
-- - Team admins can see all tasks in their teams
-- - Everyone else sees tasks they created, tasks assigned to them, and unassigned tasks
CREATE POLICY "Team members can view relevant business tasks"
  ON public.tasks FOR SELECT
  USING (
    task_type = 'business'
    AND team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    AND (
      public.is_team_admin(team_id)
      OR created_by = auth.uid()
      OR assignee_id = auth.uid()
      OR assignee_id IS NULL
    )
  );

-- Create personal tasks (no team/assignee)
CREATE POLICY "Users can create personal tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND task_type = 'personal'
    AND team_id IS NULL
    AND assignee_id IS NULL
  );

-- Create business tasks only inside your teams, optionally assigned to a team member
CREATE POLICY "Team members can create business tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND task_type = 'business'
    AND team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    AND (
      assignee_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.team_id = tasks.team_id
          AND tm.user_id = tasks.assignee_id
      )
    )
  );

-- Update personal tasks
CREATE POLICY "Users can update own personal tasks"
  ON public.tasks FOR UPDATE
  USING (task_type = 'personal' AND created_by = auth.uid())
  WITH CHECK (task_type = 'personal' AND created_by = auth.uid() AND team_id IS NULL AND assignee_id IS NULL);

-- Update business tasks
CREATE POLICY "Team members can update relevant business tasks"
  ON public.tasks FOR UPDATE
  USING (
    task_type = 'business'
    AND team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    AND (
      public.is_team_admin(team_id)
      OR created_by = auth.uid()
      OR assignee_id = auth.uid()
    )
  )
  WITH CHECK (
    task_type = 'business'
    AND team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    AND (
      assignee_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.team_id = tasks.team_id
          AND tm.user_id = tasks.assignee_id
      )
    )
  );

-- Delete personal tasks
CREATE POLICY "Users can delete own personal tasks"
  ON public.tasks FOR DELETE
  USING (task_type = 'personal' AND created_by = auth.uid());

-- Delete business tasks
CREATE POLICY "Team members can delete relevant business tasks"
  ON public.tasks FOR DELETE
  USING (
    task_type = 'business'
    AND team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    AND (
      public.is_team_admin(team_id)
      OR created_by = auth.uid()
    )
  );

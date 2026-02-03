-- Migration: Add Team Management RLS Policies
-- Run this in Supabase SQL Editor
-- ================================

-- Helper function to check if user is admin of any team in a company
CREATE OR REPLACE FUNCTION is_company_admin(company_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM team_members tm
    JOIN teams t ON t.id = tm.team_id
    WHERE t.company_id = company_uuid
      AND tm.user_id = auth.uid()
      AND tm.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admins can create teams in their company
CREATE POLICY "Admins can create teams"
  ON teams FOR INSERT
  WITH CHECK (
    is_company_admin(company_id)
    OR company_id IN (SELECT id FROM companies WHERE created_by = auth.uid())
  );

-- Admins can update teams in their company
CREATE POLICY "Admins can update teams"
  ON teams FOR UPDATE
  USING (
    is_company_admin(company_id)
  );

-- Admins can delete teams in their company
CREATE POLICY "Admins can delete teams"
  ON teams FOR DELETE
  USING (
    is_company_admin(company_id)
  );

-- Admins can add team members
CREATE POLICY "Admins can add team members"
  ON team_members FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT t.id FROM teams t
      WHERE is_company_admin(t.company_id)
    )
    -- Or allow first team member (when creating company)
    OR NOT EXISTS (SELECT 1 FROM team_members WHERE team_id = team_members.team_id)
  );

-- Admins can update team member roles
CREATE POLICY "Admins can update team members"
  ON team_members FOR UPDATE
  USING (
    team_id IN (
      SELECT t.id FROM teams t
      WHERE is_company_admin(t.company_id)
    )
  );

-- Admins can remove team members
CREATE POLICY "Admins can remove team members"
  ON team_members FOR DELETE
  USING (
    team_id IN (
      SELECT t.id FROM teams t
      WHERE is_company_admin(t.company_id)
    )
    -- Or users can remove themselves
    OR user_id = auth.uid()
  );

-- Update teams SELECT policy to include teams in companies user created
DROP POLICY IF EXISTS "Users can view their teams" ON teams;
CREATE POLICY "Users can view their teams"
  ON teams FOR SELECT
  USING (
    id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    OR company_id IN (SELECT id FROM companies WHERE created_by = auth.uid())
  );

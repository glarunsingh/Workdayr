-- Migration: Fix infinite recursion in team_members RLS policy
-- Created: 2026-02-03
-- Issue: The "Team members can view team members" policy was querying team_members 
--        to check if user can view team_members, causing infinite recursion
-- ================================

-- Drop the problematic policy
DROP POLICY IF EXISTS "Team members can view team members" ON team_members;

-- Create a security definer function to break the recursion
-- This function bypasses RLS to get team IDs for the current user
CREATE OR REPLACE FUNCTION get_user_team_ids()
RETURNS SETOF UUID AS $$
  SELECT team_id FROM team_members WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Recreate policy using the function (no recursion)
-- Users can view team members if:
-- 1. They are in the same team (checked via the function)
-- 2. OR it's their own membership record
CREATE POLICY "Team members can view team members"
  ON team_members FOR SELECT
  USING (
    team_id IN (SELECT get_user_team_ids())
    OR user_id = auth.uid()
  );

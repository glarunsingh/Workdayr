-- Migration: Add Invite Codes for Team Invitations
-- Run this in Supabase SQL Editor
-- ================================

-- 1. INVITE_CODES TABLE
-- Stores invite codes for joining teams
-- ================================
CREATE TABLE invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  max_uses INTEGER DEFAULT 1,
  use_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick code lookups
CREATE INDEX idx_invite_codes_code ON invite_codes(code);
CREATE INDEX idx_invite_codes_team ON invite_codes(team_id);

-- Enable RLS
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

-- 2. RLS POLICIES FOR INVITE CODES
-- ================================

-- Admins can view invite codes for their teams
CREATE POLICY "Admins can view invite codes"
  ON invite_codes FOR SELECT
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid() AND tm.role = 'admin'
    )
  );

-- Admins can create invite codes for their teams
CREATE POLICY "Admins can create invite codes"
  ON invite_codes FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid() AND tm.role = 'admin'
    )
  );

-- Admins can update (deactivate) invite codes
CREATE POLICY "Admins can update invite codes"
  ON invite_codes FOR UPDATE
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid() AND tm.role = 'admin'
    )
  );

-- Admins can delete invite codes
CREATE POLICY "Admins can delete invite codes"
  ON invite_codes FOR DELETE
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid() AND tm.role = 'admin'
    )
  );

-- 3. FUNCTION TO VALIDATE AND USE INVITE CODE
-- This bypasses RLS to allow any authenticated user to validate a code
-- ================================
CREATE OR REPLACE FUNCTION validate_invite_code(invite_code TEXT)
RETURNS TABLE (
  team_id UUID,
  team_name TEXT,
  company_id UUID,
  company_name TEXT,
  is_valid BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  v_code_record RECORD;
  v_team RECORD;
  v_company RECORD;
BEGIN
  -- Find the invite code
  SELECT * INTO v_code_record
  FROM invite_codes ic
  WHERE ic.code = invite_code
    AND ic.is_active = true
    AND ic.expires_at > NOW()
    AND (ic.max_uses IS NULL OR ic.use_count < ic.max_uses);
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      NULL::UUID, NULL::TEXT, NULL::UUID, NULL::TEXT, 
      false, 'Invalid or expired invite code'::TEXT;
    RETURN;
  END IF;
  
  -- Get team info
  SELECT * INTO v_team FROM teams t WHERE t.id = v_code_record.team_id;
  
  -- Get company info
  SELECT * INTO v_company FROM companies c WHERE c.id = v_team.company_id;
  
  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM team_members tm 
    WHERE tm.team_id = v_code_record.team_id AND tm.user_id = auth.uid()
  ) THEN
    RETURN QUERY SELECT 
      v_team.id, v_team.name, v_company.id, v_company.name,
      false, 'You are already a member of this team'::TEXT;
    RETURN;
  END IF;
  
  -- Return valid result
  RETURN QUERY SELECT 
    v_team.id, v_team.name, v_company.id, v_company.name,
    true, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. FUNCTION TO JOIN TEAM WITH INVITE CODE
-- ================================
CREATE OR REPLACE FUNCTION join_team_with_invite_code(invite_code TEXT)
RETURNS TABLE (
  success BOOLEAN,
  team_id UUID,
  error_message TEXT
) AS $$
DECLARE
  v_code_record RECORD;
  v_new_member_id UUID;
BEGIN
  -- Find and validate the invite code
  SELECT * INTO v_code_record
  FROM invite_codes ic
  WHERE ic.code = invite_code
    AND ic.is_active = true
    AND ic.expires_at > NOW()
    AND (ic.max_uses IS NULL OR ic.use_count < ic.max_uses);
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Invalid or expired invite code'::TEXT;
    RETURN;
  END IF;
  
  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM team_members tm 
    WHERE tm.team_id = v_code_record.team_id AND tm.user_id = auth.uid()
  ) THEN
    RETURN QUERY SELECT false, NULL::UUID, 'You are already a member of this team'::TEXT;
    RETURN;
  END IF;
  
  -- Add user to team as member
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (v_code_record.team_id, auth.uid(), 'member')
  RETURNING id INTO v_new_member_id;
  
  -- Increment use count
  UPDATE invite_codes SET use_count = use_count + 1 WHERE id = v_code_record.id;
  
  RETURN QUERY SELECT true, v_code_record.team_id, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. HELPER FUNCTION TO GENERATE RANDOM CODE
-- ================================
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

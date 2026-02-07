import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useAuth } from './auth';
import { Company, Team, TeamMember, TeamMemberWithProfile, InviteCode, InviteValidation, Profile } from './types';

interface CompanyContextType {
  company: Company | null;
  teams: Team[];
  teamMembers: TeamMember[];
  teamMembersWithProfiles: TeamMemberWithProfile[];
  inviteCodes: InviteCode[];
  loading: boolean;
  hasCompany: boolean;
  isAdmin: boolean;
  createCompany: (name: string) => Promise<{ company: Company | null; error: Error | null }>;
  updateCompany: (name: string) => Promise<{ error: Error | null }>;
  createTeam: (name: string) => Promise<{ team: Team | null; error: Error | null }>;
  updateTeam: (teamId: string, name: string) => Promise<{ error: Error | null }>;
  deleteTeam: (teamId: string) => Promise<{ error: Error | null }>;
  generateInviteCode: (teamId: string, expiresInDays?: number, maxUses?: number) => Promise<{ code: InviteCode | null; error: Error | null }>;
  deactivateInviteCode: (codeId: string) => Promise<{ error: Error | null }>;
  validateInviteCode: (code: string) => Promise<{ validation: InviteValidation | null; error: Error | null }>;
  joinWithInviteCode: (code: string) => Promise<{ success: boolean; error: Error | null }>;
  getAssignableMembers: (teamId?: string) => TeamMemberWithProfile[];
  refreshCompany: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamMembersWithProfiles, setTeamMembersWithProfiles] = useState<TeamMemberWithProfile[]>([]);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanyData = async () => {
    if (!session?.user?.id) {
      setCompany(null);
      setTeams([]);
      setTeamMembers([]);
      setLoading(false);
      return;
    }

    try {
      // First, try to find a company created by this user
      const { data: ownedCompany, error: ownedError } = await supabase
        .from('companies')
        .select('*')
        .eq('created_by', session.user.id)
        .maybeSingle();

      if (ownedError && ownedError.code !== 'PGRST116') {
        throw ownedError;
      }

      if (ownedCompany) {
        setCompany(ownedCompany);
        await fetchTeamsAndMembers(ownedCompany.id);
        return;
      }

      // If no owned company, check if user is a member of any team
      const { data: membership, error: memberError } = await supabase
        .from('team_members')
        .select(`
          *,
          teams:team_id (
            *,
            companies:company_id (*)
          )
        `)
        .eq('user_id', session.user.id)
        .limit(1)
        .maybeSingle();

      if (memberError && memberError.code !== 'PGRST116') {
        throw memberError;
      }

      if (membership?.teams?.companies) {
        const companyData = membership.teams.companies as Company;
        setCompany(companyData);
        await fetchTeamsAndMembers(companyData.id);
        return;
      }

      // No company found
      setCompany(null);
      setTeams([]);
      setTeamMembers([]);
      setInviteCodes([]);
    } catch (error) {
      console.error('Error fetching company data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamsAndMembers = async (companyId: string) => {
    try {
      // Fetch teams for this company
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: true });

      if (teamsError) throw teamsError;
      setTeams(teamsData || []);

      // Fetch all team members for these teams
      if (teamsData && teamsData.length > 0) {
        const teamIds = teamsData.map((t) => t.id);
        const { data: membersData, error: membersError } = await supabase
          .from('team_members')
          .select('*')
          .in('team_id', teamIds);

        if (membersError) throw membersError;
        setTeamMembers(membersData || []);

        // Fetch profiles for all team members
        if (membersData && membersData.length > 0) {
          const userIds = [...new Set(membersData.map((m) => m.user_id))];
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .in('id', userIds);

          if (!profilesError && profilesData) {
            const profilesMap = new Map(profilesData.map((p) => [p.id, p]));
            const membersWithProfiles: TeamMemberWithProfile[] = membersData.map((m) => ({
              ...m,
              profile: profilesMap.get(m.user_id) || null,
            }));
            setTeamMembersWithProfiles(membersWithProfiles);
          } else {
            setTeamMembersWithProfiles([]);
          }
        } else {
          setTeamMembersWithProfiles([]);
        }

        // Fetch invite codes for these teams (only for admins)
        const { data: codesData, error: codesError } = await supabase
          .from('invite_codes')
          .select('*')
          .in('team_id', teamIds)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!codesError) {
          setInviteCodes(codesData || []);
        }
      } else {
        setTeamMembers([]);
        setTeamMembersWithProfiles([]);
        setInviteCodes([]);
      }
    } catch (error) {
      console.error('Error fetching teams and members:', error);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, [session?.user?.id]);

  const createCompany = async (name: string) => {
    if (!session?.user?.id) {
      return { company: null, error: new Error('Not authenticated') };
    }

    try {
      // Create the company
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: name.trim(),
          created_by: session.user.id,
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Create a default "General" team
      const { data: defaultTeam, error: teamError } = await supabase
        .from('teams')
        .insert({
          company_id: newCompany.id,
          name: 'General',
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add the creator as an admin of the default team
      const { data: membership, error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: defaultTeam.id,
          user_id: session.user.id,
          role: 'admin',
        })
        .select()
        .single();

      if (memberError) throw memberError;

      // Update local state
      setCompany(newCompany);
      setTeams([defaultTeam]);
      if (membership) {
        setTeamMembers([membership]);
      } else {
        // Fallback: refresh from DB
        await fetchTeamsAndMembers(newCompany.id);
      }

      return { company: newCompany, error: null };
    } catch (error) {
      console.error('Error creating company:', error);
      return { company: null, error: error as Error };
    }
  };

  const updateCompany = async (name: string) => {
    if (!session?.user?.id || !company) {
      return { error: new Error('Not authenticated or no company') };
    }

    try {
      const { error } = await supabase
        .from('companies')
        .update({ name: name.trim() })
        .eq('id', company.id);

      if (error) throw error;

      setCompany((prev) => prev ? { ...prev, name: name.trim() } : null);
      return { error: null };
    } catch (error) {
      console.error('Error updating company:', error);
      return { error: error as Error };
    }
  };

  const createTeam = async (name: string) => {
    if (!session?.user?.id || !company) {
      return { team: null, error: new Error('Not authenticated or no company') };
    }

    try {
      // Create the team
      const { data: newTeam, error: teamError } = await supabase
        .from('teams')
        .insert({
          company_id: company.id,
          name: name.trim(),
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add the creator as an admin of the new team
      const { data: membership, error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: newTeam.id,
          user_id: session.user.id,
          role: 'admin',
        })
        .select()
        .single();

      if (memberError) throw memberError;

      // Update local state
      setTeams((prev) => [...prev, newTeam]);
      setTeamMembers((prev) => [...prev, membership]);

      return { team: newTeam, error: null };
    } catch (error) {
      console.error('Error creating team:', error);
      return { team: null, error: error as Error };
    }
  };

  const updateTeam = async (teamId: string, name: string) => {
    if (!session?.user?.id || !company) {
      return { error: new Error('Not authenticated or no company') };
    }

    try {
      const { error } = await supabase
        .from('teams')
        .update({ name: name.trim() })
        .eq('id', teamId);

      if (error) throw error;

      setTeams((prev) =>
        prev.map((t) => (t.id === teamId ? { ...t, name: name.trim() } : t))
      );
      return { error: null };
    } catch (error) {
      console.error('Error updating team:', error);
      return { error: error as Error };
    }
  };

  const deleteTeam = async (teamId: string) => {
    if (!session?.user?.id || !company) {
      return { error: new Error('Not authenticated or no company') };
    }

    // Prevent deleting the last team
    if (teams.length <= 1) {
      return { error: new Error('Cannot delete the last team') };
    }

    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;

      // Update local state
      setTeams((prev) => prev.filter((t) => t.id !== teamId));
      setTeamMembers((prev) => prev.filter((tm) => tm.team_id !== teamId));
      setInviteCodes((prev) => prev.filter((ic) => ic.team_id !== teamId));

      return { error: null };
    } catch (error) {
      console.error('Error deleting team:', error);
      return { error: error as Error };
    }
  };

  const generateInviteCode = async (teamId: string, expiresInDays: number = 7, maxUses: number = 10) => {
    if (!session?.user?.id || !company) {
      return { code: null, error: new Error('Not authenticated or no company') };
    }

    try {
      // Generate a random 8-character code
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      const { data: newCode, error } = await supabase
        .from('invite_codes')
        .insert({
          code,
          team_id: teamId,
          created_by: session.user.id,
          expires_at: expiresAt.toISOString(),
          max_uses: maxUses,
        })
        .select()
        .single();

      if (error) throw error;

      setInviteCodes((prev) => [newCode, ...prev]);
      return { code: newCode, error: null };
    } catch (error) {
      console.error('Error generating invite code:', error);
      return { code: null, error: error as Error };
    }
  };

  const deactivateInviteCode = async (codeId: string) => {
    if (!session?.user?.id) {
      return { error: new Error('Not authenticated') };
    }

    try {
      const { error } = await supabase
        .from('invite_codes')
        .update({ is_active: false })
        .eq('id', codeId);

      if (error) throw error;

      setInviteCodes((prev) => prev.filter((ic) => ic.id !== codeId));
      return { error: null };
    } catch (error) {
      console.error('Error deactivating invite code:', error);
      return { error: error as Error };
    }
  };

  const validateInviteCode = async (code: string) => {
    try {
      const { data, error } = await supabase
        .rpc('validate_invite_code', { invite_code: code.toUpperCase().trim() });

      if (error) throw error;

      const validation = data?.[0] as InviteValidation | undefined;
      return { validation: validation || null, error: null };
    } catch (error) {
      console.error('Error validating invite code:', error);
      return { validation: null, error: error as Error };
    }
  };

  const joinWithInviteCode = async (code: string) => {
    try {
      const { data, error } = await supabase
        .rpc('join_team_with_invite_code', { invite_code: code.toUpperCase().trim() });

      if (error) throw error;

      const result = data?.[0];
      if (!result?.success) {
        return { success: false, error: new Error(result?.error_message || 'Failed to join team') };
      }

      // Refresh company data to get the new team membership
      await fetchCompanyData();
      return { success: true, error: null };
    } catch (error) {
      console.error('Error joining with invite code:', error);
      return { success: false, error: error as Error };
    }
  };

  const refreshCompany = async () => {
    setLoading(true);
    await fetchCompanyData();
  };

  // Check if current user is admin of any team
  const isAdmin = teamMembers.some(
    (tm) => tm.user_id === session?.user?.id && tm.role === 'admin'
  );

  // Get assignable members for a specific team or all teams
  const getAssignableMembers = (teamId?: string): TeamMemberWithProfile[] => {
    if (teamId) {
      return teamMembersWithProfiles.filter((m) => m.team_id === teamId);
    }
    // Return unique members across all teams
    const uniqueUserIds = new Set<string>();
    return teamMembersWithProfiles.filter((m) => {
      if (uniqueUserIds.has(m.user_id)) return false;
      uniqueUserIds.add(m.user_id);
      return true;
    });
  };

  const value: CompanyContextType = {
    company,
    teams,
    teamMembers,
    teamMembersWithProfiles,
    inviteCodes,
    loading,
    hasCompany: !!company,
    isAdmin,
    createCompany,
    updateCompany,
    createTeam,
    updateTeam,
    deleteTeam,
    generateInviteCode,
    deactivateInviteCode,
    validateInviteCode,
    joinWithInviteCode,
    getAssignableMembers,
    refreshCompany,
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}

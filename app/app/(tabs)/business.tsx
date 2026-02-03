import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { FontAwesome } from '@expo/vector-icons';
import { useCompany } from '@/lib/company';
import { useSettings } from '@/lib/settings';

export default function BusinessScreen() {
  const { 
    company, teams, teamMembers, inviteCodes, loading, hasCompany, isAdmin, 
    createCompany, updateCompany, createTeam, updateTeam, deleteTeam,
    generateInviteCode, deactivateInviteCode, validateInviteCode, joinWithInviteCode
  } = useCompany();
  const { mode, updateMode } = useSettings();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  
  // Team management state
  const [showCreateTeamForm, setShowCreateTeamForm] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingTeamName, setEditingTeamName] = useState('');

  // Invite code state
  const [selectedTeamForInvite, setSelectedTeamForInvite] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joiningWithCode, setJoiningWithCode] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);

  const handleCreateCompany = async () => {
    if (!companyName.trim()) {
      Alert.alert('Error', 'Please enter a company name');
      return;
    }

    setCreating(true);
    const { error } = await createCompany(companyName);
    setCreating(false);

    if (error) {
      Alert.alert('Error', 'Failed to create company. Please try again.');
    } else {
      setShowCreateForm(false);
      setCompanyName('');
      Alert.alert('Success', 'Company created successfully!');
    }
  };

  const handleUpdateCompanyName = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Please enter a company name');
      return;
    }

    const { error } = await updateCompany(newName);
    
    if (error) {
      Alert.alert('Error', 'Failed to update company name. Please try again.');
    } else {
      setEditingName(false);
      setNewName('');
    }
  };

  const handleModeToggle = async (newMode: 'personal' | 'business') => {
    if (newMode === 'business' && !hasCompany) {
      Alert.alert(
        'No Company',
        'You need to create or join a company to use Business mode.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create Company', onPress: () => setShowCreateForm(true) },
        ]
      );
      return;
    }

    try {
      await updateMode(newMode);
    } catch (error) {
      Alert.alert('Error', 'Failed to switch mode. Please try again.');
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return;
    }

    setCreatingTeam(true);
    const { error } = await createTeam(teamName);
    setCreatingTeam(false);

    if (error) {
      Alert.alert('Error', 'Failed to create team. Please try again.');
    } else {
      setShowCreateTeamForm(false);
      setTeamName('');
    }
  };

  const handleUpdateTeam = async (teamId: string) => {
    if (!editingTeamName.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return;
    }

    const { error } = await updateTeam(teamId, editingTeamName);
    
    if (error) {
      Alert.alert('Error', 'Failed to update team name. Please try again.');
    } else {
      setEditingTeamId(null);
      setEditingTeamName('');
    }
  };

  const handleDeleteTeam = (teamId: string, teamNameToDelete: string) => {
    if (teams.length <= 1) {
      Alert.alert('Cannot Delete', 'You must have at least one team in your company.');
      return;
    }

    Alert.alert(
      'Delete Team',
      `Are you sure you want to delete "${teamNameToDelete}"? This will remove all team members and cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteTeam(teamId);
            if (error) {
              Alert.alert('Error', 'Failed to delete team. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleGenerateInviteCode = async (teamId: string) => {
    setGeneratingCode(true);
    const { code, error } = await generateInviteCode(teamId);
    setGeneratingCode(false);

    if (error || !code) {
      Alert.alert('Error', 'Failed to generate invite code. Please try again.');
    } else {
      setSelectedTeamForInvite(teamId);
    }
  };

  const handleCopyCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Alert.alert('Copied!', 'Invite code copied to clipboard');
  };

  const handleShareCode = async (code: string, teamName: string) => {
    try {
      await Share.share({
        message: `Join my team "${teamName}" on Workdayr! Use invite code: ${code}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDeactivateCode = (codeId: string) => {
    Alert.alert(
      'Deactivate Code',
      'This invite code will no longer work. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deactivateInviteCode(codeId);
            if (error) {
              Alert.alert('Error', 'Failed to deactivate code.');
            }
          },
        },
      ]
    );
  };

  const handleJoinWithCode = async () => {
    if (!joinCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    setJoiningWithCode(true);
    
    // First validate the code
    const { validation, error: validateError } = await validateInviteCode(joinCode);
    
    if (validateError || !validation) {
      setJoiningWithCode(false);
      Alert.alert('Error', 'Failed to validate invite code. Please try again.');
      return;
    }

    if (!validation.is_valid) {
      setJoiningWithCode(false);
      Alert.alert('Invalid Code', validation.error_message || 'This invite code is not valid.');
      return;
    }

    // Confirm joining
    Alert.alert(
      'Join Team',
      `Join "${validation.team_name}" at "${validation.company_name}"?`,
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => setJoiningWithCode(false),
        },
        {
          text: 'Join',
          onPress: async () => {
            const { success, error } = await joinWithInviteCode(joinCode);
            setJoiningWithCode(false);

            if (error || !success) {
              Alert.alert('Error', error?.message || 'Failed to join team.');
            } else {
              setShowJoinForm(false);
              setJoinCode('');
              Alert.alert('Success', `You've joined ${validation.team_name}!`);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Mode Toggle Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Mode</Text>
        <View style={styles.card}>
          <Text style={styles.settingDescription}>
            Switch between Personal and Business mode to manage different types of tasks.
          </Text>
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === 'personal' && styles.modeButtonActive,
              ]}
              onPress={() => handleModeToggle('personal')}
            >
              <FontAwesome
                name="user"
                size={20}
                color={mode === 'personal' ? '#fff' : '#666'}
              />
              <Text
                style={[
                  styles.modeButtonText,
                  mode === 'personal' && styles.modeButtonTextActive,
                ]}
              >
                Personal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === 'business' && styles.modeButtonActive,
              ]}
              onPress={() => handleModeToggle('business')}
            >
              <FontAwesome
                name="briefcase"
                size={20}
                color={mode === 'business' ? '#fff' : '#666'}
              />
              <Text
                style={[
                  styles.modeButtonText,
                  mode === 'business' && styles.modeButtonTextActive,
                ]}
              >
                Business
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Company Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Company</Text>
        
        {hasCompany ? (
          <View style={styles.card}>
            {editingName ? (
              <View style={styles.editForm}>
                <TextInput
                  style={styles.input}
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="Company name"
                  autoFocus
                />
                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setEditingName(false);
                      setNewName('');
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleUpdateCompanyName}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.companyHeader}>
                  <View style={styles.companyIcon}>
                    <FontAwesome name="building" size={24} color="#007AFF" />
                  </View>
                  <View style={styles.companyInfo}>
                    <Text style={styles.companyName}>{company?.name}</Text>
                    {isAdmin && (
                      <View style={styles.adminBadge}>
                        <Text style={styles.adminBadgeText}>Admin</Text>
                      </View>
                    )}
                  </View>
                  {isAdmin && (
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => {
                        setNewName(company?.name || '');
                        setEditingName(true);
                      }}
                    >
                      <FontAwesome name="pencil" size={16} color="#007AFF" />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.divider} />

                {/* Teams Summary */}
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={styles.statNumber}>{teams.length}</Text>
                    <Text style={styles.statLabel}>
                      {teams.length === 1 ? 'Team' : 'Teams'}
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statNumber}>{teamMembers.length}</Text>
                    <Text style={styles.statLabel}>
                      {teamMembers.length === 1 ? 'Member' : 'Members'}
                    </Text>
                  </View>
                </View>

                {/* Teams List */}
                {teams.length > 0 && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.teamsHeader}>
                      <Text style={styles.subSectionTitle}>Teams</Text>
                      {isAdmin && !showCreateTeamForm && (
                        <TouchableOpacity
                          style={styles.addTeamButton}
                          onPress={() => setShowCreateTeamForm(true)}
                        >
                          <FontAwesome name="plus" size={14} color="#007AFF" />
                          <Text style={styles.addTeamButtonText}>Add Team</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    
                    {/* Create Team Form */}
                    {showCreateTeamForm && (
                      <View style={styles.createTeamForm}>
                        <TextInput
                          style={styles.teamInput}
                          value={teamName}
                          onChangeText={setTeamName}
                          placeholder="Enter team name"
                          autoFocus
                        />
                        <View style={styles.teamFormActions}>
                          <TouchableOpacity
                            style={styles.teamCancelButton}
                            onPress={() => {
                              setShowCreateTeamForm(false);
                              setTeamName('');
                            }}
                          >
                            <FontAwesome name="times" size={16} color="#999" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.teamSaveButton, creatingTeam && styles.buttonDisabled]}
                            onPress={handleCreateTeam}
                            disabled={creatingTeam}
                          >
                            {creatingTeam ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              <FontAwesome name="check" size={16} color="#fff" />
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                    
                    {teams.map((team) => {
                      const memberCount = teamMembers.filter(
                        (tm) => tm.team_id === team.id
                      ).length;
                      const isEditing = editingTeamId === team.id;
                      
                      return (
                        <View key={team.id} style={styles.teamRow}>
                          {isEditing ? (
                            <>
                              <TextInput
                                style={styles.teamEditInput}
                                value={editingTeamName}
                                onChangeText={setEditingTeamName}
                                autoFocus
                              />
                              <TouchableOpacity
                                style={styles.teamCancelButton}
                                onPress={() => {
                                  setEditingTeamId(null);
                                  setEditingTeamName('');
                                }}
                              >
                                <FontAwesome name="times" size={16} color="#999" />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.teamSaveButton}
                                onPress={() => handleUpdateTeam(team.id)}
                              >
                                <FontAwesome name="check" size={16} color="#fff" />
                              </TouchableOpacity>
                            </>
                          ) : (
                            <>
                              <FontAwesome name="users" size={16} color="#666" />
                              <Text style={styles.teamName}>{team.name}</Text>
                              <Text style={styles.teamMemberCount}>
                                {memberCount} {memberCount === 1 ? 'member' : 'members'}
                              </Text>
                              {isAdmin && (
                                <View style={styles.teamActions}>
                                  <TouchableOpacity
                                    style={styles.teamActionButton}
                                    onPress={() => {
                                      setEditingTeamId(team.id);
                                      setEditingTeamName(team.name);
                                    }}
                                  >
                                    <FontAwesome name="pencil" size={14} color="#007AFF" />
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    style={styles.teamActionButton}
                                    onPress={() => handleDeleteTeam(team.id, team.name)}
                                  >
                                    <FontAwesome name="trash-o" size={14} color="#FF3B30" />
                                  </TouchableOpacity>
                                </View>
                              )}
                            </>
                          )}
                        </View>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </View>
        ) : showCreateForm ? (
          <View style={styles.card}>
            <Text style={styles.formTitle}>Create Your Company</Text>
            <Text style={styles.formDescription}>
              Start by giving your company a name. You can add teams and invite members later.
            </Text>
            <TextInput
              style={styles.input}
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="Enter company name"
              autoFocus
            />
            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowCreateForm(false);
                  setCompanyName('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createButton, creating && styles.buttonDisabled]}
                onPress={handleCreateCompany}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.emptyState}>
              <FontAwesome name="building-o" size={48} color="#ccc" />
              <Text style={styles.emptyStateTitle}>No Company Yet</Text>
              <Text style={styles.emptyStateDescription}>
                Create a company to start managing business tasks with your team.
              </Text>
              <TouchableOpacity
                style={styles.createCompanyButton}
                onPress={() => setShowCreateForm(true)}
              >
                <FontAwesome name="plus" size={16} color="#fff" />
                <Text style={styles.createCompanyButtonText}>Create Company</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Invite Members Section - Only show if user has company */}
      {hasCompany && isAdmin && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invite Members</Text>
          <View style={styles.card}>
            <Text style={styles.settingDescription}>
              Generate invite codes to add team members. Share the code with colleagues to let them join.
            </Text>
            
            {teams.map((team) => {
              const teamCodes = inviteCodes.filter((ic) => ic.team_id === team.id);
              
              return (
                <View key={team.id} style={styles.inviteTeamSection}>
                  <View style={styles.inviteTeamHeader}>
                    <FontAwesome name="users" size={16} color="#666" />
                    <Text style={styles.inviteTeamName}>{team.name}</Text>
                    <TouchableOpacity
                      style={[styles.generateCodeButton, generatingCode && styles.buttonDisabled]}
                      onPress={() => handleGenerateInviteCode(team.id)}
                      disabled={generatingCode}
                    >
                      {generatingCode ? (
                        <ActivityIndicator size="small" color="#007AFF" />
                      ) : (
                        <>
                          <FontAwesome name="plus" size={12} color="#007AFF" />
                          <Text style={styles.generateCodeButtonText}>New Code</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                  
                  {teamCodes.length > 0 ? (
                    <View style={styles.codesList}>
                      {teamCodes.map((invite) => {
                        const expiresAt = new Date(invite.expires_at);
                        const isExpired = expiresAt < new Date();
                        const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        
                        return (
                          <View key={invite.id} style={styles.codeItem}>
                            <View style={styles.codeInfo}>
                              <Text style={styles.codeText}>{invite.code}</Text>
                              <Text style={styles.codeDetails}>
                                {invite.use_count}/{invite.max_uses || '∞'} uses • {isExpired ? 'Expired' : `${daysLeft}d left`}
                              </Text>
                            </View>
                            <View style={styles.codeActions}>
                              <TouchableOpacity
                                style={styles.codeActionButton}
                                onPress={() => handleCopyCode(invite.code)}
                              >
                                <FontAwesome name="copy" size={16} color="#007AFF" />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.codeActionButton}
                                onPress={() => handleShareCode(invite.code, team.name)}
                              >
                                <FontAwesome name="share" size={16} color="#007AFF" />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.codeActionButton}
                                onPress={() => handleDeactivateCode(invite.id)}
                              >
                                <FontAwesome name="trash-o" size={16} color="#FF3B30" />
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  ) : (
                    <Text style={styles.noCodesText}>No active invite codes</Text>
                  )}
                  
                  {team !== teams[teams.length - 1] && <View style={styles.divider} />}
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Join Company Section - Only show if user has no company */}
      {!hasCompany && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Join a Company</Text>
          <View style={styles.card}>
            {showJoinForm ? (
              <View>
                <Text style={styles.formDescription}>
                  Enter the invite code you received from your team admin.
                </Text>
                <TextInput
                  style={styles.input}
                  value={joinCode}
                  onChangeText={setJoinCode}
                  placeholder="Enter invite code (e.g., ABC12345)"
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
                <View style={styles.formActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowJoinForm(false);
                      setJoinCode('');
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.createButton, joiningWithCode && styles.buttonDisabled]}
                    onPress={handleJoinWithCode}
                    disabled={joiningWithCode}
                  >
                    {joiningWithCode ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.createButtonText}>Join</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <FontAwesome name="ticket" size={48} color="#ccc" />
                <Text style={styles.emptyStateTitle}>Have an Invite Code?</Text>
                <Text style={styles.emptyStateDescription}>
                  If someone shared an invite code with you, use it to join their company.
                </Text>
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={() => setShowJoinForm(true)}
                >
                  <FontAwesome name="sign-in" size={16} color="#fff" />
                  <Text style={styles.joinButtonText}>Enter Invite Code</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Coming Soon Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Coming Soon</Text>
        <View style={styles.card}>
          <View style={styles.comingSoonItem}>
            <FontAwesome name="tasks" size={20} color="#999" />
            <View style={styles.comingSoonText}>
              <Text style={styles.comingSoonTitle}>Assign Tasks</Text>
              <Text style={styles.comingSoonDescription}>
                Assign tasks to team members
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  modeToggle: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  modeButtonActive: {
    backgroundColor: '#007AFF',
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  adminBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  adminBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4CAF50',
    textTransform: 'uppercase',
  },
  editButton: {
    padding: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  teamsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addTeamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#E3F2FD',
  },
  addTeamButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  createTeamForm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  teamInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  teamEditInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  teamFormActions: {
    flexDirection: 'row',
    gap: 8,
  },
  teamCancelButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamSaveButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamActions: {
    flexDirection: 'row',
    gap: 4,
  },
  teamActionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  teamName: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  teamMemberCount: {
    fontSize: 13,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 16,
    lineHeight: 20,
  },
  createCompanyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  createCompanyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  editForm: {
    gap: 12,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    minWidth: 80,
    alignItems: 'center',
  },
  saveButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  comingSoonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  comingSoonText: {
    flex: 1,
  },
  comingSoonTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  comingSoonDescription: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  // Invite code styles
  inviteTeamSection: {
    marginBottom: 8,
  },
  inviteTeamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  inviteTeamName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  generateCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#E3F2FD',
  },
  generateCodeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  codesList: {
    gap: 8,
  },
  codeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  codeInfo: {
    flex: 1,
  },
  codeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  codeDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  codeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  codeActionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  noCodesText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    marginLeft: 26,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#34C759',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSettings } from '@/lib/settings';
import { useAuth } from '@/lib/auth';
import { WeekStartDay } from '@/lib/types';

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut, session } = useAuth();
  const { profile, weekStartsOn, updateWeekStartsOn, loading } = useSettings();
  const [updating, setUpdating] = useState(false);

  const handleWeekStartChange = async (value: WeekStartDay) => {
    if (updating || value === weekStartsOn) return;
    
    setUpdating(true);
    try {
      await updateWeekStartsOn(value);
    } catch (error) {
      Alert.alert('Error', 'Failed to update setting. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* User Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.avatarPlaceholder}>
              <FontAwesome name="user" size={24} color="#fff" />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {profile?.full_name || 'User'}
              </Text>
              <Text style={styles.userEmail}>
                {session?.user?.email || ''}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Calendar Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Calendar Settings</Text>
        <View style={styles.card}>
          <Text style={styles.settingLabel}>Week starts on</Text>
          <Text style={styles.settingDescription}>
            Choose whether your calendar week starts on Sunday (US) or Monday (EU/ISO)
          </Text>
          
          <View style={styles.optionGroup}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                weekStartsOn === 'sunday' && styles.optionButtonActive,
              ]}
              onPress={() => handleWeekStartChange('sunday')}
              disabled={updating}
            >
              <FontAwesome
                name={weekStartsOn === 'sunday' ? 'check-circle' : 'circle-o'}
                size={20}
                color={weekStartsOn === 'sunday' ? '#007AFF' : '#999'}
              />
              <Text
                style={[
                  styles.optionText,
                  weekStartsOn === 'sunday' && styles.optionTextActive,
                ]}
              >
                Sunday (US)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                weekStartsOn === 'monday' && styles.optionButtonActive,
              ]}
              onPress={() => handleWeekStartChange('monday')}
              disabled={updating}
            >
              <FontAwesome
                name={weekStartsOn === 'monday' ? 'check-circle' : 'circle-o'}
                size={20}
                color={weekStartsOn === 'monday' ? '#007AFF' : '#999'}
              />
              <Text
                style={[
                  styles.optionText,
                  weekStartsOn === 'monday' && styles.optionTextActive,
                ]}
              >
                Monday (EU/ISO)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* App Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoValue}>1.0.0 (MVP)</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mode</Text>
            <Text style={styles.infoValue}>{profile?.mode || 'personal'}</Text>
          </View>
        </View>
      </View>

      {/* Legal Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => router.push('/legal/terms')}
          >
            <FontAwesome name="file-text-o" size={18} color="#666" />
            <Text style={styles.linkText}>Terms of Service</Text>
            <FontAwesome name="chevron-right" size={14} color="#ccc" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => router.push('/legal/privacy')}
          >
            <FontAwesome name="lock" size={18} color="#666" />
            <Text style={styles.linkText}>Privacy Policy</Text>
            <FontAwesome name="chevron-right" size={14} color="#ccc" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sign Out Button */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <FontAwesome name="sign-out" size={18} color="#FF3B30" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Workdayr © 2026</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  optionGroup: {
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  optionButtonActive: {
    backgroundColor: '#E8F4FD',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
  },
  optionTextActive: {
    color: '#007AFF',
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  linkText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    padding: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

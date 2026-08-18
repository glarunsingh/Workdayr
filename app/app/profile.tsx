import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/lib/auth';
import { useSettings } from '@/lib/settings';
import { supabase } from '@/lib/supabase';
import { useAppTheme, AppColors, fontFamily, fontWeight } from '@/lib/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { session, signOut, updatePassword } = useAuth();
  const { profile, updateProfile, loading } = useSettings();
  const { colors, spacing } = useAppTheme();
  const styles = createStyles(colors);

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(profile?.full_name || '');
  const [dailyGoal, setDailyGoal] = useState(profile?.daily_goal ?? 5);
  const [updating, setUpdating] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const avatarUrl = profile?.avatar_url || null;
  const initials = getInitials(profile?.full_name || session?.user?.email || '?');
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : '—';
  // ── Photo upload ────────────────────────────────────
  const handlePickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const userId = session?.user?.id;
    if (!userId) return;

    setUploadingPhoto(true);
    try {
      const ext = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `${userId}/avatar.${ext}`;

      // Fetch image as blob
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, arrayBuffer, {
          contentType: asset.mimeType || `image/${ext}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Append cache-bust so the image refreshes
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      await updateProfile({ avatar_url: publicUrl });
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      Alert.alert('Upload failed', error.message || 'Could not upload photo.');
    } finally {
      setUploadingPhoto(false);
    }
  }, [session?.user?.id, updateProfile]);
  // ── Name editing ──────────────────────────────────
  const handleSaveName = useCallback(async () => {
    const trimmed = nameValue.trim();
    if (!trimmed || trimmed === profile?.full_name) {
      setEditingName(false);
      setNameValue(profile?.full_name || '');
      return;
    }
    setUpdating(true);
    try {
      await updateProfile({ full_name: trimmed });
      setEditingName(false);
    } catch {
      Alert.alert('Error', 'Failed to update name.');
    } finally {
      setUpdating(false);
    }
  }, [nameValue, profile?.full_name, updateProfile]);

  // ── Daily goal ────────────────────────────────────
  const handleGoalChange = useCallback(
    async (delta: number) => {
      const next = Math.max(1, Math.min(50, dailyGoal + delta));
      if (next === dailyGoal) return;
      setDailyGoal(next);
      try {
        await updateProfile({ daily_goal: next });
      } catch {
        setDailyGoal(dailyGoal); // revert
      }
    },
    [dailyGoal, updateProfile],
  );

  // ── Password change ───────────────────────────────
  const handleChangePassword = () => {
    Alert.prompt(
      'Change Password',
      'Enter your new password (min 6 characters)',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async (value?: string) => {
            if (!value || value.length < 6) {
              Alert.alert('Error', 'Password must be at least 6 characters.');
              return;
            }
            const { error } = await updatePassword(value);
            if (error) {
              Alert.alert('Error', error.message);
            } else {
              Alert.alert('Success', 'Password updated.');
            }
          },
        },
      ],
      'secure-text',
    );
  };

  // ── Sign out ──────────────────────────────────────
  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── Close button ──────────────────────────────── */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <FontAwesome name="times" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      {/* ── Avatar & Identity ─────────────────────────── */}
      <View style={styles.identity}>
        <TouchableOpacity
          style={styles.avatarTouchable}
          onPress={handlePickImage}
          disabled={uploadingPhoto}
          activeOpacity={0.7}
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          <View style={styles.cameraOverlay}>
            {uploadingPhoto ? (
              <ActivityIndicator size="small" color={colors.onPrimary} />
            ) : (
              <FontAwesome name="camera" size={12} color={colors.onPrimary} />
            )}
          </View>
        </TouchableOpacity>

        {editingName ? (
          <View style={styles.nameEditRow}>
            <TextInput
              style={styles.nameInput}
              value={nameValue}
              onChangeText={setNameValue}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSaveName}
              onBlur={handleSaveName}
              editable={!updating}
              placeholder="Your name"
              placeholderTextColor={colors.textDisabled}
            />
          </View>
        ) : (
          <TouchableOpacity onPress={() => setEditingName(true)} activeOpacity={0.6}>
            <Text style={styles.displayName}>
              {profile?.full_name || 'Add your name'}
            </Text>
            <FontAwesome
              name="pencil"
              size={12}
              color={colors.textDisabled}
              style={styles.editIcon}
            />
          </TouchableOpacity>
        )}

        <Text style={styles.email}>{session?.user?.email || ''}</Text>
      </View>

      {/* ── Account section ───────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Account</Text>

        {Platform.OS === 'ios' ? (
          <TouchableOpacity
            style={styles.row}
            onPress={handleChangePassword}
            activeOpacity={0.6}
          >
            <Text style={styles.rowText}>Change Password</Text>
            <FontAwesome name="chevron-right" size={12} color={colors.textDisabled} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              Alert.alert(
                'Change Password',
                'This feature uses a secure prompt available on iOS. On this platform, please use "Forgot Password" from the login screen.',
              )
            }
            activeOpacity={0.6}
          >
            <Text style={styles.rowText}>Change Password</Text>
            <FontAwesome name="chevron-right" size={12} color={colors.textDisabled} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Preferences section ───────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Preferences</Text>

        {/* Timezone */}
        <View style={styles.infoRow}>
          <Text style={styles.rowText}>Timezone</Text>
          <Text style={styles.infoValue}>
            {profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Daily Goal */}
        <View style={styles.goalRow}>
          <View>
            <Text style={styles.rowText}>Daily Goal</Text>
            <Text style={styles.goalDescription}>Tasks you aim to complete per day</Text>
          </View>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => handleGoalChange(-1)}
              disabled={dailyGoal <= 1}
              activeOpacity={0.5}
            >
              <FontAwesome name="minus" size={12} color={dailyGoal <= 1 ? colors.textDisabled : colors.text} />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{dailyGoal}</Text>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => handleGoalChange(1)}
              disabled={dailyGoal >= 50}
              activeOpacity={0.5}
            >
              <FontAwesome name="plus" size={12} color={dailyGoal >= 50 ? colors.textDisabled : colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── Info section ──────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Info</Text>
        <View style={styles.infoRow}>
          <Text style={styles.rowText}>Member since</Text>
          <Text style={styles.infoValue}>{memberSince}</Text>
        </View>
      </View>

      {/* ── Danger zone ───────────────────────────────── */}
      <View style={[styles.section, { marginTop: 40 }]}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.6}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ── Helpers ───────────────────────────────────────────────
function getInitials(nameOrEmail: string): string {
  const parts = nameOrEmail.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return nameOrEmail.charAt(0).toUpperCase();
}

// ── Styles ────────────────────────────────────────────────
const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingBottom: 40,
    },

    // ── Close button ──────────────
    closeButton: {
      alignSelf: 'flex-end',
      padding: 20,
    },

    // ── Identity ──────────────────
    identity: {
      alignItems: 'center',
      paddingBottom: 32,
    },
    avatarTouchable: {
      position: 'relative',
      marginBottom: 16,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    avatarText: {
      fontSize: 28,
      fontWeight: fontWeight.bold,
      fontFamily: fontFamily,
      color: colors.text,
    },
    cameraOverlay: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.background,
    },
    nameEditRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    nameInput: {
      fontSize: 22,
      fontWeight: fontWeight.semibold,
      fontFamily: fontFamily,
      color: colors.text,
      textAlign: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.primary,
      paddingVertical: 4,
      paddingHorizontal: 16,
      minWidth: 160,
    },
    displayName: {
      fontSize: 22,
      fontWeight: fontWeight.semibold,
      fontFamily: fontFamily,
      color: colors.text,
      textAlign: 'center',
    },
    editIcon: {
      position: 'absolute',
      right: -20,
      top: 6,
    },
    email: {
      fontSize: 14,
      fontFamily: fontFamily,
      color: colors.textSubtle,
      marginTop: 4,
    },

    // ── Sections ──────────────────
    section: {
      marginTop: 24,
      paddingHorizontal: 20,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: fontWeight.semibold,
      fontFamily: fontFamily,
      color: colors.textSubtle,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 12,
    },

    // ── Rows ──────────────────────
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
    },
    rowText: {
      fontSize: 15,
      fontFamily: fontFamily,
      color: colors.text,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
    },
    infoValue: {
      fontSize: 15,
      fontFamily: fontFamily,
      color: colors.textSubtle,
    },

    // ── Divider ───────────────────
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.borderLight,
    },

    // ── Daily Goal Stepper ────────
    goalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
    },
    goalDescription: {
      fontSize: 13,
      fontFamily: fontFamily,
      color: colors.textSubtle,
      marginTop: 2,
    },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    stepperButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepperValue: {
      fontSize: 18,
      fontWeight: fontWeight.semibold,
      fontFamily: fontFamily,
      color: colors.text,
      minWidth: 28,
      textAlign: 'center',
    },

    // ── Sign Out ──────────────────
    signOutButton: {
      alignItems: 'center',
      paddingVertical: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.danger,
    },
    signOutText: {
      fontSize: 15,
      fontWeight: fontWeight.medium,
      fontFamily: fontFamily,
      color: colors.danger,
    },
  });

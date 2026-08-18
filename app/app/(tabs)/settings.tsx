import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSettings } from '@/lib/settings';
import { WeekStartDay, ThemePreference } from '@/lib/types';
import { useAppTheme, AppColors, fontFamily, fontWeight } from '@/lib/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const {
    profile,
    weekStartsOn,
    updateWeekStartsOn,
    updateThemePreference,
    updateNotificationPreferences,
    loading,
  } = useSettings();
  const { colors, spacing } = useAppTheme();
  const [updating, setUpdating] = useState(false);
  const styles = createStyles(colors);

  const themePreference = profile?.theme_preference || 'system';
  const notifications = profile?.notification_preferences || {
    daily_summary: false,
    due_date_reminder: true,
    overdue_alert: true,
  };

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

  const handleThemeChange = async (value: ThemePreference) => {
    if (updating || value === themePreference) return;
    setUpdating(true);
    try {
      await updateThemePreference(value);
    } catch (error) {
      Alert.alert('Error', 'Failed to update theme. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleNotificationToggle = async (key: 'daily_summary' | 'due_date_reminder' | 'overdue_alert') => {
    if (updating) return;
    setUpdating(true);
    try {
      await updateNotificationPreferences({ [key]: !notifications[key] });
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification setting.');
    } finally {
      setUpdating(false);
    }
  };

  const themeOptions: { label: string; value: ThemePreference }[] = [
    { label: 'System', value: 'system' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ];

  const weekOptions: { label: string; value: WeekStartDay; subtitle: string }[] = [
    { label: 'Sunday', value: 'sunday', subtitle: 'US' },
    { label: 'Monday', value: 'monday', subtitle: 'EU / ISO' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── Appearance ─────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Appearance</Text>
        <View style={styles.themeRow}>
          {themeOptions.map((opt) => {
            const isActive = themePreference === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.themePill, isActive && styles.themePillActive]}
                onPress={() => handleThemeChange(opt.value)}
                disabled={updating}
                activeOpacity={0.7}
              >
                <Text style={[styles.themePillText, isActive && styles.themePillTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── Calendar ───────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Calendar</Text>
        <Text style={styles.settingTitle}>Week starts on</Text>
        <View style={styles.optionGroup}>
          {weekOptions.map((opt) => {
            const isActive = weekStartsOn === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.optionButton, isActive && styles.optionButtonActive]}
                onPress={() => handleWeekStartChange(opt.value)}
                disabled={updating}
                activeOpacity={0.7}
              >
                <View style={[styles.radio, isActive && styles.radioActive]}>
                  {isActive && <View style={styles.radioDot} />}
                </View>
                <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                  {opt.label}
                </Text>
                <Text style={styles.optionSubtitle}>{opt.subtitle}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── Notifications ──────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Notifications</Text>
        <View style={styles.toggleList}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Daily summary</Text>
              <Text style={styles.toggleDescription}>Morning overview of today's tasks</Text>
            </View>
            <Switch
              value={notifications.daily_summary}
              onValueChange={() => handleNotificationToggle('daily_summary')}
              trackColor={{ false: colors.borderLight, true: colors.primary }}
              thumbColor={colors.surface}
              disabled={updating}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Due date reminders</Text>
              <Text style={styles.toggleDescription}>Notify before tasks are due</Text>
            </View>
            <Switch
              value={notifications.due_date_reminder}
              onValueChange={() => handleNotificationToggle('due_date_reminder')}
              trackColor={{ false: colors.borderLight, true: colors.primary }}
              thumbColor={colors.surface}
              disabled={updating}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Overdue alerts</Text>
              <Text style={styles.toggleDescription}>Alert when tasks pass their due date</Text>
            </View>
            <Switch
              value={notifications.overdue_alert}
              onValueChange={() => handleNotificationToggle('overdue_alert')}
              trackColor={{ false: colors.borderLight, true: colors.primary }}
              thumbColor={colors.surface}
              disabled={updating}
            />
          </View>
        </View>
      </View>

      {/* ── About ──────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>1.0.0 (MVP)</Text>
        </View>
      </View>

      {/* ── Legal ──────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Legal</Text>
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => router.push('/legal/terms')}
          activeOpacity={0.6}
        >
          <Text style={styles.linkText}>Terms of Service</Text>
          <FontAwesome name="chevron-right" size={12} color={colors.textDisabled} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => router.push('/legal/privacy')}
          activeOpacity={0.6}
        >
          <Text style={styles.linkText}>Privacy Policy</Text>
          <FontAwesome name="chevron-right" size={12} color={colors.textDisabled} />
        </TouchableOpacity>
      </View>

      {/* ── Footer ─────────────────────────────────────── */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Workdayr © 2026</Text>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingBottom: 40,
    },

    // ── Sections ──────────────────
    section: {
      marginTop: 32,
      paddingHorizontal: 20,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: fontWeight.semibold,
      fontFamily: fontFamily,
      color: colors.textSubtle,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 16,
    },

    // ── Appearance / Theme ────────
    themeRow: {
      flexDirection: 'row',
      gap: 10,
    },
    themePill: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
    },
    themePillActive: {
      borderColor: colors.primary,
      backgroundColor: colors.surfaceMuted,
    },
    themePillText: {
      fontSize: 14,
      fontWeight: fontWeight.medium,
      fontFamily: fontFamily,
      color: colors.textMuted,
    },
    themePillTextActive: {
      color: colors.text,
      fontWeight: fontWeight.semibold,
    },

    // ── Calendar Week Start ───────
    settingTitle: {
      fontSize: 15,
      fontWeight: fontWeight.medium,
      fontFamily: fontFamily,
      color: colors.text,
      marginBottom: 12,
    },
    optionGroup: {
      flexDirection: 'row',
      gap: 10,
    },
    optionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    optionButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.surfaceMuted,
    },
    radio: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 1.5,
      borderColor: colors.textDisabled,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    radioActive: {
      borderColor: colors.primary,
    },
    radioDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
    optionText: {
      fontSize: 15,
      fontWeight: fontWeight.medium,
      fontFamily: fontFamily,
      color: colors.textMuted,
    },
    optionTextActive: {
      color: colors.text,
      fontWeight: fontWeight.semibold,
    },
    optionSubtitle: {
      fontSize: 13,
      fontFamily: fontFamily,
      color: colors.textSubtle,
      marginLeft: 6,
    },

    // ── Notifications ─────────────
    toggleList: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
    },
    toggleInfo: {
      flex: 1,
      marginRight: 16,
    },
    toggleTitle: {
      fontSize: 15,
      fontWeight: fontWeight.medium,
      fontFamily: fontFamily,
      color: colors.text,
    },
    toggleDescription: {
      fontSize: 13,
      fontFamily: fontFamily,
      color: colors.textSubtle,
      marginTop: 2,
    },

    // ── About ─────────────────────
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    infoLabel: {
      fontSize: 15,
      fontFamily: fontFamily,
      color: colors.text,
    },
    infoValue: {
      fontSize: 15,
      fontFamily: fontFamily,
      color: colors.textSubtle,
    },

    // ── Legal & links ─────────────
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
    },
    linkText: {
      fontSize: 15,
      fontFamily: fontFamily,
      color: colors.text,
    },

    // ── Shared ────────────────────
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.borderLight,
    },

    // ── Footer ────────────────────
    footer: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    footerText: {
      fontSize: 12,
      fontFamily: fontFamily,
      color: colors.textDisabled,
    },
  });

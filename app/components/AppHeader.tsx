import React from 'react';
import { View, Text, Pressable, Image, Modal, StyleSheet, Platform } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '@/lib/settings';
import { useAuth } from '@/lib/auth';
import { useAppTheme } from '@/lib/theme';

export function AppHeader() {
  const router = useRouter();
  const segments = useSegments(); // triggers re-render on route change
  const insets = useSafeAreaInsets();
  const { profile, updateMode } = useSettings();
  const { signOut } = useAuth();
  const { colors, radius } = useAppTheme();
  const [menuVisible, setMenuVisible] = React.useState(false);

  const displayName = profile?.full_name || profile?.email || 'there';
  const canGoBack = router.canGoBack();

  const handleBack = () => {
    router.back();
  };

  const handleNavigateProfile = () => {
    setMenuVisible(false);
    router.push('/profile');
  };

  const handleSwitchMode = async () => {
    setMenuVisible(false);
    try {
      const newMode = profile?.mode === 'business' ? 'personal' : 'business';
      await updateMode(newMode);
    } catch {
      // no-op; settings screen can surface errors if needed
    }
  };

  const handleSettings = () => {
    setMenuVisible(false);
    router.push('/settings');
  };

  const handleLogout = async () => {
    setMenuVisible(false);
    await signOut();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.headerRow}>
        <View style={styles.brandRow}>
          {canGoBack && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={handleBack}
              style={({ pressed }) => [
                styles.backButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <FontAwesome name="chevron-left" size={18} color={colors.text} />
            </Pressable>
          )}
          <View style={[styles.logoWrap, { borderRadius: radius.md, backgroundColor: colors.surface }]}>
            <Image
              source={require('../assets/images/logo-icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View>
            <Text style={[styles.brandTitle, { color: colors.text }]}>Workdayr</Text>
            <Text style={[styles.brandSubtitle, { color: colors.textMuted }]}>Welcome {displayName}</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => setMenuVisible(true)}
          style={({ pressed }) => [
            styles.profileButton,
            {
              backgroundColor: colors.surfaceMuted,
              borderColor: colors.border,
              opacity: pressed ? 0.9 : 1,
              overflow: 'hidden' as const,
            },
          ]}
        >
          {profile?.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              style={styles.profileImage}
            />
          ) : (
            <Text style={[styles.profileInitial, { color: colors.text }]}>
              {displayName?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          )}
        </Pressable>
      </View>

      <Modal
        visible={menuVisible}
        animationType={Platform.OS === 'web' ? 'fade' : 'slide'}
        transparent
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menuSheet, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
            <Pressable style={styles.menuItem} onPress={handleNavigateProfile}>
              <Text style={[styles.menuText, { color: colors.text }]}>Profile</Text>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={handleSettings}>
              <Text style={[styles.menuText, { color: colors.text }]}>Settings</Text>
            </Pressable>
            <View style={{ height: 1, backgroundColor: colors.borderLight, marginVertical: 4, marginHorizontal: 16 }} />
            <Pressable style={styles.menuItem} onPress={handleLogout}>
              <Text style={[styles.menuText, { color: colors.danger }]}>Log out</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // paddingTop is set dynamically via safe area insets
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    width: 44,
    height: 44,
    overflow: 'hidden',
  },
  logo: {
    width: 44,
    height: 44,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  brandSubtitle: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '500',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 16,
    fontWeight: '700',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 76,
    paddingRight: 16,
  },
  menuSheet: {
    width: 240,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

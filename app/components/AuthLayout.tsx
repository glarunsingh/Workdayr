import React from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useResponsive } from '../lib/responsive';
import { useAppTheme } from '../lib/theme';
import BrandingPanel from './BrandingPanel';

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Shared responsive layout for auth screens (login, signup, forgot-password).
 * Mobile: stacked BrandingPanel → form. Desktop/Tablet: side-by-side split.
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  const { isMobile, isTablet } = useResponsive();
  const { colors } = useAppTheme();

  if (isMobile) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.mobileContainer, { backgroundColor: colors.surface }]}
      >
        <ScrollView
          contentContainerStyle={styles.mobileScroll}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <BrandingPanel compact />
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={[styles.splitContainer, { backgroundColor: colors.surface }]}>
      <View style={[styles.brandingSide, isTablet && styles.brandingSideTablet]}>
        <BrandingPanel />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.formSide, isTablet && styles.formSideTablet, { backgroundColor: colors.surface }]}
      >
        <ScrollView
          contentContainerStyle={styles.formScroll}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  brandingSide: {
    flex: 0.58,
  },
  brandingSideTablet: {
    flex: 0.5,
  },
  formSide: {
    flex: 0.42,
  },
  formSideTablet: {
    flex: 0.5,
  },
  formScroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  mobileContainer: {
    flex: 1,
  },
  mobileScroll: {
    flexGrow: 1,
  },
});

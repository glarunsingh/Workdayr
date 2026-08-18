import { StyleSheet, Platform } from 'react-native';
import React, { createContext, useContext } from 'react';
import { useColorScheme } from '@/components/useColorScheme';

export type ColorSchemeName = 'light' | 'dark';
export type ThemePreference = 'system' | 'light' | 'dark';

// ─── Palette ────────────────────────────────────────────────
// Single 9-step neutral gray ramp — no pure black, no pure white
export const palette = {
  gray50:  '#F8F9FA',
  gray100: '#E9ECEF',
  gray200: '#DEE2E6',
  gray300: '#CED4DA',
  gray400: '#ADB5BD',
  gray500: '#6C757D',
  gray600: '#495057',
  gray700: '#343A40',
  gray800: '#212529',
} as const;

// ─── Design tokens ──────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const fontFamily = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "system-ui", "Segoe UI", Roboto, sans-serif',
  default: undefined, // undefined = system font (SF on iOS, Roboto on Android)
});

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const typography = {
  title: 20,
  h2: 18,
  body: 16,
  subtext: 14,
  caption: 12,
} as const;

// ─── Semantic (functional) colors — shared across themes ────
const semantic = {
  danger:  '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  info:    '#007AFF',
} as const;

// ─── App color tokens ───────────────────────────────────────
export const appColors = {
  light: {
    // Surfaces
    background:   palette.gray100,
    surface:      palette.gray50,
    surfaceMuted: palette.gray200,
    surfaceAlt:   palette.gray100,   // input fields, alternate surfaces

    // Text
    text:         palette.gray800,
    textMuted:    palette.gray600,
    textSubtle:   palette.gray500,
    textDisabled: palette.gray400,   // placeholders, disabled labels

    // Interactive
    primary:      palette.gray800,
    primaryHover: palette.gray700,

    // On-colored backgrounds
    onPrimary:    palette.gray50,
    onDanger:     palette.gray50,
    onSuccess:    palette.gray50,

    // Chrome
    border:       palette.gray300,
    borderLight:  palette.gray200,   // subtle dividers
    shadow:       palette.gray400,

    // Semantic
    ...semantic,
  },
  dark: {
    // Surfaces
    background:   palette.gray800,
    surface:      palette.gray700,
    surfaceMuted: palette.gray600,
    surfaceAlt:   palette.gray700,

    // Text
    text:         palette.gray50,
    textMuted:    palette.gray300,
    textSubtle:   palette.gray400,
    textDisabled: palette.gray500,

    // Interactive
    primary:      palette.gray50,
    primaryHover: palette.gray100,

    // On-colored backgrounds
    onPrimary:    palette.gray800,
    onDanger:     palette.gray50,
    onSuccess:    palette.gray50,

    // Chrome
    border:       palette.gray600,
    borderLight:  palette.gray700,
    shadow:       palette.gray800,

    // Semantic
    ...semantic,
  },
} as const;

export type AppColors = typeof appColors.light | typeof appColors.dark;

// ─── Common style factories ─────────────────────────────────
// Reusable style fragments so screens don't duplicate card/button/input styles.

export function createCommonStyles(colors: AppColors) {
  return StyleSheet.create({
    // Card / surface container
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.lg,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    },

    // Primary button
    buttonPrimary: {
      backgroundColor: colors.primary,
      borderRadius: radius.sm,
      paddingVertical: 15,
      alignItems: 'center' as const,
    },
    buttonPrimaryText: {
      color: colors.onPrimary,
      fontSize: typography.body,
      fontWeight: '600' as const,
      letterSpacing: 0.3,
    },
    buttonDisabled: {
      opacity: 0.6,
    },

    // Text input
    input: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      paddingHorizontal: 14,
      paddingVertical: 14,
      fontSize: typography.body,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },

    // Input label
    inputLabel: {
      fontSize: typography.caption,
      fontWeight: '600' as const,
      color: colors.textMuted,
      letterSpacing: 0.3,
      textTransform: 'uppercase' as const,
    },

    // Section title (uppercase muted header)
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.textSubtle,
      textTransform: 'uppercase' as const,
      marginBottom: spacing.sm,
    },

    // Divider line
    divider: {
      height: 1,
      backgroundColor: colors.borderLight,
      marginVertical: spacing.md,
    },

    // Error container
    errorContainer: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: radius.sm,
      padding: spacing.md,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    errorText: {
      color: colors.text,
      fontSize: typography.subtext,
      textAlign: 'center' as const,
    },
  });
}

// ─── Color Scheme Override Context ──────────────────────────
// Allows the app to override the system color scheme based on user preference.
const ColorSchemeOverrideContext = createContext<ColorSchemeName | null>(null);

/**
 * Wrap your app tree with this provider to override the system color scheme.
 * Pass `null` or omit `override` to follow the system scheme.
 */
export function ColorSchemeOverrideProvider({
  override,
  children,
}: {
  override: ColorSchemeName | null;
  children: React.ReactNode;
}) {
  return React.createElement(
    ColorSchemeOverrideContext.Provider,
    { value: override },
    children,
  );
}

/**
 * Given a ThemePreference and the system scheme, compute the effective scheme.
 */
export function resolveColorScheme(
  preference: ThemePreference | undefined | null,
  systemScheme: ColorSchemeName,
): ColorSchemeName {
  if (preference === 'light' || preference === 'dark') return preference;
  return systemScheme; // 'system' or undefined → follow OS
}

// ─── Hook ───────────────────────────────────────────────────
export function useAppTheme() {
  const systemScheme = (useColorScheme() ?? 'light') as ColorSchemeName;
  const override = useContext(ColorSchemeOverrideContext);
  const scheme = override ?? systemScheme;
  const colors = appColors[scheme];
  const common = createCommonStyles(colors);

  return {
    scheme,
    colors,
    common,
    spacing,
    radius,
    typography,
    fontFamily,
    fontWeight,
  };
}

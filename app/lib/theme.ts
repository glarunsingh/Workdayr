import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export type ColorSchemeName = 'light' | 'dark';

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

export const typography = {
  title: 20,
  h2: 18,
  body: 16,
  subtext: 14,
  caption: 12,
} as const;

const base = {
  primary: Colors.light.tint,
  danger: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  info: '#007AFF',
} as const;

export const appColors = {
  light: {
    background: '#F5F5F7',
    surface: '#FFFFFF',
    surfaceMuted: '#F2F2F7',
    text: '#111111',
    textMuted: '#666666',
    textSubtle: '#999999',
    onPrimary: '#FFFFFF',
    onDanger: '#FFFFFF',
    onSuccess: '#FFFFFF',
    border: '#E5E5EA',
    shadow: '#000000',
    ...base,
  },
  dark: {
    background: '#000000',
    surface: '#1C1C1E',
    surfaceMuted: '#2C2C2E',
    text: '#FFFFFF',
    textMuted: '#C7C7CC',
    textSubtle: '#8E8E93',
    onPrimary: '#FFFFFF',
    onDanger: '#FFFFFF',
    onSuccess: '#FFFFFF',
    border: '#38383A',
    shadow: '#000000',
    primary: Colors.dark.tint,
    danger: base.danger,
    success: base.success,
    warning: base.warning,
    info: base.info,
  },
} as const;

export function useAppTheme() {
  const scheme = (useColorScheme() ?? 'light') as ColorSchemeName;
  const colors = appColors[scheme];

  return {
    scheme,
    colors,
    spacing,
    radius,
    typography,
  };
}

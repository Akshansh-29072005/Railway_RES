import { Platform } from 'react-native';

export type ThemeColor =
  | 'text'
  | 'textSecondary'
  | 'textLight'
  | 'background'
  | 'white'
  | 'primary'
  | 'primaryLight'
  | 'border';

export const COLORS = {
  background: '#F7F8FA',
  white: '#FFFFFF',

  primary: '#3C87F7',
  primaryLight: '#EAF2FF',

  text: '#111827',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',

  border: '#E5E7EB',
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const Spacing = {
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  seven: 28,
  eight: 32,
  nine: 36,
  ten: 40,
};

export const Fonts = {
  sans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }) as string,

  serif: Platform.select({
    ios: 'Times New Roman',
    android: 'serif',
    default: 'serif',
  }) as string,

  rounded: Platform.select({
    ios: 'Arial Rounded MT Bold',
    android: 'sans-serif',
    default: 'sans-serif',
  }) as string,

  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }) as string,
};

export const ThemeColorMap = {
  light: {
    text: COLORS.text,
    textSecondary: COLORS.textSecondary,
    textLight: COLORS.textLight,
    background: COLORS.background,
    white: COLORS.white,
    primary: COLORS.primary,
    primaryLight: COLORS.primaryLight,
    border: COLORS.border,
  },

  dark: {
    text: '#FFFFFF',
    textSecondary: '#B8C0CC',
    textLight: '#8B95A5',
    background: '#101318',
    white: '#181C23',
    primary: '#3C87F7',
    primaryLight: '#172A46',
    border: '#2A303A',
  },
};
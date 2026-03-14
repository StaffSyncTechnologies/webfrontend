/**
 * StaffSync Brand Colors
 * "Smart Workforce. Seamless Scheduling."
 */

// Brand Colors (constant across themes)
export const brandColors = {
  primary: {
    navy: '#000035',
    blue: '#00AFEF',
  },
  status: {
    success: '#34A853',
    warning: '#FBBC04',
    error: '#EA4335',
  },
  interactive: {
    default: '#00AFEF',
    hover: '#0099D6',
    active: '#0088C2',
    disabled: '#9CA3AF',
  },
} as const;

// Light Theme Colors
export const lightTheme = {
  ...brandColors,
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F7FA',
    tertiary: '#E5E7EB',
  },
  text: {
    primary: '#000035',
    secondary: '#6B7280',
    muted: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  border: {
    light: '#E5E7EB',
    default: '#D1D5DB',
  },
  card: '#FFFFFF',
} as const;

// Dark Theme Colors
export const darkTheme = {
  ...brandColors,
  background: {
    primary: '#0D0D1A',
    secondary: '#1A1A2E',
    tertiary: '#2D2D44',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#A0A0B2',
    muted: '#6B6B80',
    inverse: '#000035',
  },
  border: {
    light: '#2D2D44',
    default: '#3D3D55',
  },
  card: '#1A1A2E',
} as const;

// Default export (light theme for backwards compatibility)
export const colors = lightTheme;

export type ThemeColors = typeof lightTheme;
export type BrandColors = typeof brandColors;


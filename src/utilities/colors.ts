/**
 * StaffSync Brand Colors
 * "Smart Workforce. Seamless Scheduling."
 */

export const colors = {
  // Primary Colors
  primary: {
    navy: '#000035',      // Deep Navy Blue - Headers, text, dashboard, logo base
    blue: '#00AFEF',      // Bright Tech Blue - Buttons, highlights, links, active elements
    dark: '#000035',      // Alias for navy - used in components
    main: '#00AFEF',      // Alias for blue - used in components
  },

  // Secondary Colors
  secondary: {
    white: '#FFFFFF',     // Backgrounds, cards
    lightGray: '#F5F7FA', // Page backgrounds, alt rows
    gray: '#6B7280',      // Secondary text, labels
  },

  // Status Colors
  status: {
    success: '#34A853',   // Green - Success, Approved, Valid
    warning: '#FBBC04',   // Yellow - Warning, Pending, Expiring
    error: '#EA4335',     // Red - Error, Expired, Blocked
    info: '#00AFEF',      // Blue - Information, In Progress
  },

  // Semantic aliases for easier usage
  text: {
    primary: '#000035',
    secondary: '#6B7280',
    inverse: '#FFFFFF',
  },

  background: {
    primary: '#FFFFFF',
    secondary: '#F5F7FA',
    dark: '#000035',
  },

  border: {
    light: '#E5E7EB',
    default: '#D1D5DB',
  },

  // Interactive states
  interactive: {
    default: '#00AFEF',
    hover: '#0099D6',
    active: '#0088C2',
    disabled: '#9CA3AF',
  },

  // Neutral colors for UI elements
  neutral: {
    white: '#FFFFFF',
    grey100: '#F5F7FA',
    grey200: '#E5E7EB',
    grey300: '#D1D5DB',
  },
} as const;

export type Colors = typeof colors;

/**
 * StaffSync Brand Colors
 * "Smart Workforce. Seamless Scheduling."
 */

export const colors = {
  // Primary Colors
  primary: {
    navy: '#000035',      // Deep Navy Blue - Headers, text, dashboard, logo base
    blue: '#00AFEF',      // Bright Tech Blue - Buttons, highlights, links, active elements
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
} as const;

export type Colors = typeof colors;

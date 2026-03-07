/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit_400Regular'],
        'outfit-light': ['Outfit_300Light'],
        'outfit-medium': ['Outfit_500Medium'],
        'outfit-semibold': ['Outfit_600SemiBold'],
        'outfit-bold': ['Outfit_700Bold'],
      },
      colors: {
        // Brand Colors
        primary: {
          navy: '#000035',
          blue: '#00AFEF',
        },
        // Status Colors
        status: {
          success: '#34A853',
          warning: '#FBBC04',
          error: '#EA4335',
        },
        // Light Theme Colors
        light: {
          background: {
            primary: '#FFFFFF',
            secondary: '#F5F7FA',
            tertiary: '#E5E7EB',
          },
          text: {
            primary: '#000035',
            secondary: '#6B7280',
            muted: '#9CA3AF',
          },
          border: {
            light: '#E5E7EB',
            default: '#D1D5DB',
          },
          card: '#FFFFFF',
        },
        // Dark Theme Colors
        dark: {
          background: {
            primary: '#0D0D1A',
            secondary: '#1A1A2E',
            tertiary: '#2D2D44',
          },
          text: {
            primary: '#FFFFFF',
            secondary: '#A0A0B2',
            muted: '#6B6B80',
          },
          border: {
            light: '#2D2D44',
            default: '#3D3D55',
          },
          card: '#1A1A2E',
        },
        // Semantic Theme Colors (use CSS variables)
        background: {
          DEFAULT: 'var(--color-background)',
          secondary: 'var(--color-background-secondary)',
          tertiary: 'var(--color-background-tertiary)',
        },
        foreground: {
          DEFAULT: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        card: {
          DEFAULT: 'var(--color-card)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          light: 'var(--color-border-light)',
        },
      },
    },
  },
  plugins: [],
}


import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  colors: typeof lightColors;
}

const lightColors = {
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
  // Brand colors (same in both themes)
  primary: {
    navy: '#000035',
    blue: '#00AFEF',
  },
  status: {
    success: '#34A853',
    warning: '#FBBC04',
    error: '#EA4335',
  },
};

const darkColors = {
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
  // Brand colors (same in both themes)
  primary: {
    navy: '#000035',
    blue: '#00AFEF',
  },
  status: {
    success: '#34A853',
    warning: '#FBBC04',
    error: '#EA4335',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@staffsync_theme_mode';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme preference
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((savedMode) => {
        if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
          setThemeModeState(savedMode as ThemeMode);
        }
      })
      .finally(() => setIsLoaded(true));
  }, []);

  // Save theme preference
  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  };

  // Resolve actual theme based on mode
  const theme: 'light' | 'dark' = 
    themeMode === 'system' 
      ? (systemColorScheme || 'light') 
      : themeMode;

  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, isDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { lightColors, darkColors };

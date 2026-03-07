import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { brandColors } from '../constants/colors';

const ORG_THEME_KEY = '@staffsync_org_theme';

interface OrgTheme {
  organizationId: string;
  organizationName: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor?: string;
}

interface OrgThemeContextType {
  orgTheme: OrgTheme | null;
  primaryColor: string;
  secondaryColor: string;
  setOrgTheme: (theme: OrgTheme) => void;
  clearOrgTheme: () => void;
  loadOrgTheme: () => Promise<void>;
}

const defaultPrimaryColor = brandColors.primary.navy;
const defaultSecondaryColor = brandColors.primary.blue;

const OrgThemeContext = createContext<OrgThemeContextType | undefined>(undefined);

export function OrgThemeProvider({ children }: { children: ReactNode }) {
  const [orgTheme, setOrgThemeState] = useState<OrgTheme | null>(null);

  const primaryColor = orgTheme?.primaryColor || defaultPrimaryColor;
  const secondaryColor = orgTheme?.secondaryColor || defaultSecondaryColor;

  const setOrgTheme = useCallback((theme: OrgTheme) => {
    setOrgThemeState(theme);
    AsyncStorage.setItem(ORG_THEME_KEY, JSON.stringify(theme));
  }, []);

  const clearOrgTheme = useCallback(() => {
    setOrgThemeState(null);
    AsyncStorage.removeItem(ORG_THEME_KEY);
  }, []);

  const loadOrgTheme = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(ORG_THEME_KEY);
      if (stored) {
        setOrgThemeState(JSON.parse(stored));
      }
    } catch {}
  }, []);

  return (
    <OrgThemeContext.Provider value={{ orgTheme, primaryColor, secondaryColor, setOrgTheme, clearOrgTheme, loadOrgTheme }}>
      {children}
    </OrgThemeContext.Provider>
  );
}

export function useOrgTheme() {
  const ctx = useContext(OrgThemeContext);
  if (!ctx) throw new Error('useOrgTheme must be used within OrgThemeProvider');
  return ctx;
}

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import ar from './locales/ar.json';
import yo from './locales/yo.json';
import pl from './locales/pl.json';

const LANGUAGE_KEY = '@staffsync_language';

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧', nativeLabel: 'English' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸', nativeLabel: 'Español' },
  { code: 'fr', label: 'French', flag: '🇫🇷', nativeLabel: 'Français' },
  { code: 'ar', label: 'Arabic', flag: '🇸🇦', nativeLabel: 'العربية' },
  { code: 'yo', label: 'Yoruba', flag: '🇳🇬', nativeLabel: 'Yorùbá' },
  { code: 'pl', label: 'Polish', flag: '🇵🇱', nativeLabel: 'Polski' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  ar: { translation: ar },
  yo: { translation: yo },
  pl: { translation: pl },
};

// Get stored or device language
async function getInitialLanguage(): Promise<string> {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (stored && Object.keys(resources).includes(stored)) return stored;
  } catch {}
  // Fall back to device locale
  const deviceLocale = Localization.getLocales()?.[0]?.languageCode || 'en';
  return Object.keys(resources).includes(deviceLocale) ? deviceLocale : 'en';
}

// Initialize immediately with English, then update async
i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

// Load saved language preference
getInitialLanguage().then((lng) => {
  i18n.changeLanguage(lng);
});

export async function changeLanguage(code: string) {
  await AsyncStorage.setItem(LANGUAGE_KEY, code);
  await i18n.changeLanguage(code);
}

export default i18n;

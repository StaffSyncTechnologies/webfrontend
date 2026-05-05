import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, NOTIFICATIONS } from './endpoints';
import { store } from '../store';

const VERSION_CHECK_KEY = '@staffsync_last_version_check';
const UPDATE_DISMISSED_KEY = '@staffsync_update_dismissed_version';

export interface AppVersionInfo {
  version: string;
  buildNumber: string;
  releaseDate: string;
  mandatory: boolean;
  updateMessage: string;
  downloadUrl: string;
}

export interface VersionCheckResult {
  hasUpdate: boolean;
  latestVersion: AppVersionInfo | null;
  currentVersion: string;
  isMandatory: boolean;
}

/**
 * Get current app version from Constants
 */
export const getCurrentVersion = (): string => {
  console.log(Constants.expoConfig?.version,'ok')
  return Constants.expoConfig?.version || '1.0.0';
};

/**
 * Get current build number
 */
export const getCurrentBuildNumber = (): string => {
  const buildNumber = Constants.expoConfig?.android?.versionCode || 
                     Constants.expoConfig?.ios?.buildNumber || 
                     Constants.expoConfig?.version || '1';
  console.log(buildNumber, 'buildNumber ok');
  return String(buildNumber);
};

/**
 * Compare two version strings (e.g., "1.0.0" vs "1.0.1")
 * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
export const compareVersions = (v1: string, v2: string): number => {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  
  return 0;
};

/**
 * Get platform identifier for API
 */
export const getPlatform = (): string => {
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';
  return 'expo';
};

/**
 * Fetch latest app version from backend
 */
export const fetchLatestVersion = async (): Promise<AppVersionInfo | null> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}${NOTIFICATIONS.APP_VERSION}?platform=${getPlatform()}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.data;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to fetch latest version:', error);
    return null;
  }
};

/**
 * Check for app updates
 */
export const checkForUpdates = async (): Promise<VersionCheckResult> => {
  const currentVersion = getCurrentVersion();
  const latestVersion = await fetchLatestVersion();
  
  if (!latestVersion) {
    return {
      hasUpdate: false,
      latestVersion: null,
      currentVersion,
      isMandatory: false,
    };
  }

  const hasUpdate = compareVersions(latestVersion.version, currentVersion) > 0;
  const isMandatory = latestVersion.mandatory;

  return {
    hasUpdate,
    latestVersion,
    currentVersion,
    isMandatory,
  };
};

/**
 * Check if update was previously dismissed
 */
export const isUpdateDismissed = async (version: string): Promise<boolean> => {
  try {
    const dismissedVersion = await AsyncStorage.getItem(UPDATE_DISMISSED_KEY);
    return dismissedVersion === version;
  } catch {
    return false;
  }
};

/**
 * Mark update as dismissed
 */
export const dismissUpdate = async (version: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(UPDATE_DISMISSED_KEY, version);
  } catch (error) {
    console.error('Failed to dismiss update:', error);
  }
};

/**
 * Check if enough time has passed since last version check
 * (to avoid checking too frequently - default: once per day)
 */
export const shouldCheckForUpdates = async (): Promise<boolean> => {
  try {
    const lastCheck = await AsyncStorage.getItem(VERSION_CHECK_KEY);
    if (!lastCheck) return true;
    
    const lastCheckTime = parseInt(lastCheck, 10);
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    return now - lastCheckTime > oneDay;
  } catch {
    return true;
  }
};

/**
 * Mark that we've checked for updates
 */
export const markVersionChecked = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(VERSION_CHECK_KEY, Date.now().toString());
  } catch (error) {
    console.error('Failed to mark version checked:', error);
  }
};

import React, { ReactNode, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store, loadAuthFromStorage, hydrateAuth } from '../store';
import { ThemeProvider, ToastProvider, OrgThemeProvider, useOrgTheme } from '../contexts';
import * as Notifications from 'expo-notifications';
import { checkForUpdates, shouldCheckForUpdates, markVersionChecked, isUpdateDismissed, dismissUpdate } from '../services/appVersionService';
import { API_BASE_URL, NOTIFICATIONS } from '../services/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppProviderProps {
  children: ReactNode;
}

function AuthHydrator({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const { loadOrgTheme } = useOrgTheme();

  useEffect(() => {
    async function hydrate() {
      console.log('AuthHydrator: Starting hydration...');
      const authData = await loadAuthFromStorage();
      console.log('AuthHydrator: Auth data loaded:', authData);
      store.dispatch(hydrateAuth(authData));
      console.log('AuthHydrator: About to load org theme...');
      await loadOrgTheme();
      console.log('AuthHydrator: Org theme loaded');
      setIsHydrated(true);
      console.log('AuthHydrator: Hydration complete');
    }
    hydrate();
  }, []);

  useEffect(() => {
    async function checkForAppUpdates() {
      if (!isHydrated) return;
      
      const shouldCheck = await shouldCheckForUpdates();
      if (!shouldCheck) return;

      const checkResult = await checkForUpdates();
      
      if (checkResult.hasUpdate && checkResult.latestVersion) {
        const isDismissed = await isUpdateDismissed(checkResult.latestVersion.version);
        
        // Don't show if already dismissed (unless mandatory)
        if (isDismissed && !checkResult.isMandatory) {
          await markVersionChecked();
          return;
        }

        // Check if user has APP_UPDATES enabled
        const token = store.getState().auth.token ?? (await AsyncStorage.getItem('@staffsync_auth_token'));
        if (token) {
          try {
            const response = await fetch(`${API_BASE_URL}${NOTIFICATIONS.PREFERENCES}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              const data = await response.json();
              const appUpdatesPref = data.data.preferences?.find(
                (p: any) => p.type === 'APP_UPDATES'
              );

              // Only show notification if user has APP_UPDATES enabled
              if (appUpdatesPref?.push) {
                await Notifications.scheduleNotificationAsync({
                  content: {
                    title: '📱 App Update Available',
                    body: checkResult.latestVersion.updateMessage || 'A new version is available.',
                    data: {
                      type: 'app_update',
                      version: checkResult.latestVersion.version,
                      downloadUrl: checkResult.latestVersion.downloadUrl,
                      mandatory: checkResult.isMandatory,
                    },
                  },
                  trigger: null,
                });
              }
            }
          } catch (error) {
            console.error('Failed to check notification preferences:', error);
          }
        }
      }
      
      await markVersionChecked();
    }

    checkForAppUpdates();
  }, [isHydrated]);

  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <ThemeProvider>
            <OrgThemeProvider>
              <ToastProvider>
                <AuthHydrator>
                  {children}
                </AuthHydrator>
              </ToastProvider>
            </OrgThemeProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

export default AppProvider;

import React, { ReactNode, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store, loadAuthFromStorage, hydrateAuth } from '../store';
import { ThemeProvider, ToastProvider, OrgThemeProvider, useOrgTheme } from '../contexts';

interface AppProviderProps {
  children: ReactNode;
}

function AuthHydrator({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const { loadOrgTheme } = useOrgTheme();

  useEffect(() => {
    async function hydrate() {
      const authData = await loadAuthFromStorage();
      store.dispatch(hydrateAuth(authData));
      await loadOrgTheme();
      setIsHydrated(true);
    }
    hydrate();
  }, []);

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

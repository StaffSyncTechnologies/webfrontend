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

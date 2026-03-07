import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme, NavigationContainerRef } from '@react-navigation/native';
import * as SplashScreenLib from 'expo-splash-screen';
import type { RootStackParamList } from './src/types/navigation';
import {
  useFonts,
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider } from './src/providers';
import { useAppSelector } from './src/store/hooks';
import { RootNavigator } from './src/navigation';
import { useTheme } from './src/contexts';
import { SplashScreen } from './src/components';
import { NetworkStatusBanner } from './src/components/NetworkStatusBanner';
import { useNotifications } from './src/hooks/useNotifications';
import './global.css';
import './src/i18n';

// Keep the splash screen visible while we fetch resources
SplashScreenLib.preventAutoHideAsync();

// Custom navigation themes
const LightNavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#00AFEF',
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#000035',
    border: '#E5E7EB',
  },
};

const DarkNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#00AFEF',
    background: '#0D0D1A',
    card: '#1A1A2E',
    text: '#FFFFFF',
    border: '#2D2D44',
  },
};

function AppContent() {
  const { isDark } = useTheme();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  // Register push notifications when authenticated
  const { lastNotificationResponse } = useNotifications();

  // Handle notification tap deep linking
  useEffect(() => {
    if (!lastNotificationResponse || !isAuthenticated) return;
    const data = lastNotificationResponse.notification.request.content.data as Record<string, any>;
    if (!data) return;

    setTimeout(() => {
      const nav = navigationRef.current;
      if (!nav) return;

      switch (data.action) {
        case 'VIEW_SHIFT':
          if (data.shiftId) nav.navigate('ShiftDetails', { shiftId: data.shiftId as string });
          break;
        case 'VIEW_CHAT':
          nav.navigate('Chat', { roomId: data.roomId as string });
          break;
        case 'VIEW_RTW':
          nav.navigate('RightToWork');
          break;
        case 'SHIFT_CANCELLED':
          nav.navigate('Notifications');
          break;
        default:
          nav.navigate('Notifications');
          break;
      }
    }, 500);
  }, [lastNotificationResponse, isAuthenticated]);

  useEffect(() => {
    async function prepare() {
      try {
        // Small delay for splash animation
        await new Promise((resolve) => setTimeout(resolve, 500));
      } finally {
        setAppReady(true);
        await SplashScreenLib.hideAsync();
      }
    }
    prepare();
  }, []);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (!appReady) {
    return null;
  }

  if (showSplash) {
    return <SplashScreen onAnimationComplete={handleSplashComplete} />;
  }

  return (
    <NavigationContainer ref={navigationRef} theme={isDark ? DarkNavigationTheme : LightNavigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={{ flex: 1 }}>
        <RootNavigator isAuthenticated={isAuthenticated} />
        <NetworkStatusBanner />
      </View>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    ...Ionicons.font,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000035' }}>
        <ActivityIndicator size="large" color="#00AFEF" />
      </View>
    );
  }

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

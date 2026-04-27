import { useState, useEffect, useCallback, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { useRegisterPushTokenMutation } from '../store/api/notificationsApi';
import { useAppSelector } from '../store/hooks';
import {
  setupNotifeeChannels,
  displayShiftNotification,
  displayGeneralNotification,
  handleShiftApiCall,
  handleNotifeeEvent,
  NOTIFEE_CHANNELS,
} from '../services/notifeeService';

const AUTH_TOKEN_KEY = '@staffsync_auth_token';
const NOTIFICATION_PREFS_KEY = '@staffsync_notification_prefs';

const SHIFT_TYPES = new Set([
  'shift_available',
  'shift_assigned',
  'new_shift',
  'shift_reminder',
]);

const TYPE_TO_CHANNEL: Record<string, string> = {
  payslip_ready: NOTIFEE_CHANNELS.PAYSLIPS,
  payslip: NOTIFEE_CHANNELS.PAYSLIPS,
};

// Map backend notification types to the toggle keys used in NotificationSettingsScreen
const TYPE_TO_PREF: Record<string, string> = {
  shift_available: 'newShiftAlerts',
  shift_assigned: 'newShiftAlerts',
  new_shift: 'newShiftAlerts',
  shift_reminder: 'shiftReminder',
  payslip_ready: 'payslipReady',
  payslip: 'payslipReady',
  holiday_request: 'holidayRequest',
  holiday_update: 'holidayRequest',
  app_update: 'appUpdates',
  chat_message: 'chatMessages',
};

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data as Record<string, any> | undefined;
    const type = data?.type as string | undefined;

    // Check if user has disabled this notification type
    if (type && TYPE_TO_PREF[type]) {
      try {
        const stored = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
        if (stored) {
          const prefs = JSON.parse(stored) as Record<string, boolean>;
          if (prefs[TYPE_TO_PREF[type]] === false) {
            return {
              shouldShowAlert: false,
              shouldPlaySound: false,
              shouldSetBadge: false,
              shouldShowBanner: false,
              shouldShowList: false,
            };
          }
        }
      } catch {}
    }

    // Display via Notifee for rich UI with action buttons
    if (SHIFT_TYPES.has(type ?? '')) {
      displayShiftNotification({
        shiftId: (data?.shiftId as string) ?? '',
        title: notification.request.content.title ?? undefined,
        body: notification.request.content.body ?? undefined,
        date: data?.date as string | undefined,
        location: data?.location as string | undefined,
        hours: data?.hours as string | undefined,
        pay: data?.pay as string | undefined,
      }).catch(console.error);
    } else {
      displayGeneralNotification({
        title: notification.request.content.title ?? 'StaffSync',
        body: notification.request.content.body ?? '',
        channelId: TYPE_TO_CHANNEL[type ?? ''],
      }).catch(console.error);
    }

    // Suppress expo's built-in display — Notifee handles it
    return {
      shouldShowAlert: false,
      shouldPlaySound: false,
      shouldSetBadge: true,
      shouldShowBanner: false,
      shouldShowList: false,
    };
  },
});


export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [lastNotificationResponse, setLastNotificationResponse] = useState<Notifications.NotificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);
  const [registerToken] = useRegisterPushTokenMutation();
  const isAuthenticated = useAppSelector((state) => state?.auth.isAuthenticated);
  const hasRegistered = useRef(false);

  const registerForPushNotifications = useCallback(async () => {
    try {
      // Handle platform-specific limitations
      if (!Device.isDevice) {
        if (Platform.OS === 'ios') {
          console.log('[PushToken] Running on iOS simulator - push notifications may not work reliably');
          // Continue to try, but expect limitations
        } else {
          console.log('[PushToken] Running on Android emulator - attempting push notifications');
        }
      }

      const { granted: existingGranted } = await Notifications.getPermissionsAsync();
      let isGranted = existingGranted;

      if (!isGranted) {
        const { granted } = await Notifications.requestPermissionsAsync();
        isGranted = granted;
      }

      if (!isGranted) {
        throw new Error('Push notification permission denied');
      }

      const tokenResponse = await Notifications.getExpoPushTokenAsync({
        projectId: '7e3e3568-a25b-4dae-95bf-a62fe46929b3',
      });

      console.log('[PushToken] Expo Push Token:', tokenResponse.data);
      setExpoPushToken(tokenResponse.data);
      setError(null);

      return tokenResponse.data;
    } catch (e: any) {
      console.error('[PushToken] Full Error:', e);
      const errorMessage = e?.message ?? 'Failed to get push token';
      
      // Provide better error messages for iOS simulators
      if (!Device.isDevice && Platform.OS === 'ios') {
        console.log('[PushToken] iOS simulator limitation - using mock token for development');
        // Don't set error for iOS simulator - allow app to continue
        return null;
      }
      
      setError(errorMessage);
      return null;
    }
  }, []);

  // Get a stable device ID
  const getDeviceId = useCallback((): string => {
    return [
      Device.deviceName ?? 'unknown',
      Device.osName ?? Platform.OS,
      Device.osVersion ?? '',
      Device.modelName ?? '',
    ].join('-').replace(/\s+/g, '_').toLowerCase();
  }, []);

  // Register a token with the backend (expo = Expo format, ios/android = FCM format)
  const registerTokenWithBackend = useCallback(async (
    token: string,
    platform: 'expo' | 'ios' | 'android' = 'expo',
  ) => {
    try {
      await registerToken({
        pushToken: token,
        platform,
        deviceId: getDeviceId(),
      }).unwrap();
      console.log(`[PushToken] Registered ${platform} token:`, token.slice(0, 20) + '...');
    } catch (e) {
      console.error(`[PushToken] Failed to register ${platform} token:`, e);
    }
  }, [registerToken, getDeviceId]);

  // On login: get push token and register it with the backend
  useEffect(() => {
    console.log('[PushToken] Auth state changed:', isAuthenticated);
    if (!isAuthenticated) {
      console.log('[PushToken] User logged out, resetting registration flag');
      hasRegistered.current = false; // reset on logout so next login re-registers
      return;
    }
    if (hasRegistered.current) {
      console.log('[PushToken] Already registered for this session');
      return;
    }
    console.log('[PushToken] User authenticated, registering push token...');

    registerForPushNotifications().then(async (expoToken) => {
      if (expoToken) {
        hasRegistered.current = true;
        // Register Expo token (platform = 'expo') for Expo Push Service
        await registerTokenWithBackend(expoToken, 'expo');

        // Also register FCM token (platform = 'ios'|'android') for background data messages
        try {
          const fcmToken = await messaging().getToken();
          if (fcmToken) {
            const fcmPlatform = Platform.OS === 'ios' ? 'ios' : 'android';
            await registerTokenWithBackend(fcmToken, fcmPlatform);
            console.log('[PushToken] FCM token registered for background support');
          }
        } catch (fcmErr) {
          console.warn('[PushToken] FCM token unavailable (Firebase not configured?):', fcmErr);
        }
      } else {
        hasRegistered.current = false;
        console.log('[PushToken] Failed to get Expo token');
      }
    });
  }, [isAuthenticated, registerForPushNotifications, registerTokenWithBackend]);

  // Set up Notifee channels + expo categories, then attach listeners
  useEffect(() => {
    // Notifee: create Android channels and iOS categories
    setupNotifeeChannels().catch(console.error);

    // Notifee foreground event handler (action buttons on Notifee-displayed notifications)
    const unsubscribeNotifee = notifee.onForegroundEvent(handleNotifeeEvent);

    // expo-notifications: update state when a notification arrives in foreground
    // (actual display is handled by Notifee via setNotificationHandler above)
    notificationListener.current = Notifications.addNotificationReceivedListener((n) => {
      setNotification(n);
    });

    // expo-notifications: handle taps / background action buttons
    // (Notifee handles foreground button presses via onForegroundEvent)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const actionId = response.actionIdentifier;
      const data = response.notification.request.content.data as Record<string, any>;
      const shiftId = data?.shiftId as string | undefined;

      // Background expo category buttons (accept_shift / decline_shift)
      if (shiftId && actionId === 'accept_shift') {
        handleShiftApiCall(shiftId, 'accept').catch(console.error);
        return;
      }
      if (shiftId && actionId === 'decline_shift') {
        handleShiftApiCall(shiftId, 'decline').catch(console.error);
        return;
      }

      // Default tap — pass to deep linking handler
      console.log('[Notification] Tapped:', data);
      setLastNotificationResponse(response);
    });

    return () => {
      unsubscribeNotifee();
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
  }, []);

  // Badge count management
  const setBadgeCount = useCallback(async (count: number) => {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Failed to set badge count:', error);
    }
  }, []);

  const clearBadgeCount = useCallback(async () => {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('Failed to clear badge count:', error);
    }
  }, []);

  const getBadgeCount = useCallback(async (): Promise<number> => {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Failed to get badge count:', error);
      return 0;
    }
  }, []);

  return { 
    expoPushToken, 
    notification, 
    lastNotificationResponse, 
    error, 
    registerForPushNotifications,
    setBadgeCount,
    clearBadgeCount,
    getBadgeCount
  };
}

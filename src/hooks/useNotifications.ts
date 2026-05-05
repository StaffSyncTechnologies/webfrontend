import { useState, useEffect, useCallback, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRegisterPushTokenMutation } from '../store/api/notificationsApi';
import { useAppSelector } from '../store/hooks';
import {
  setupNotificationChannels,
  displayShiftNotification,
  displayGeneralNotification,
  displayChatNotification,
  handleShiftApiCall,
  handleNotificationAction,
  NOTIFICATION_CHANNELS,
} from '../services/notificationService';

const AUTH_TOKEN_KEY = '@staffsync_auth_token';
const NOTIFICATION_PREFS_KEY = '@staffsync_notification_prefs';

const SHIFT_TYPES = new Set([
  'shift_available',
  'shift_assigned',
  'new_shift',
  'shift_reminder',
]);

const TYPE_TO_CHANNEL: Record<string, string> = {
  payslip_ready: NOTIFICATION_CHANNELS.PAYSLIPS,
  payslip: NOTIFICATION_CHANNELS.PAYSLIPS,
  chat_message: NOTIFICATION_CHANNELS.CHAT,
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

    // Display notification based on type using notification service
    if (type && SHIFT_TYPES.has(type)) {
      displayShiftNotification({
        shiftId: (data?.shiftId as string) ?? '',
        title: notification.request.content.title ?? undefined,
        body: notification.request.content.body ?? undefined,
        date: data?.date as string | undefined,
        location: data?.location as string | undefined,
        hours: data?.hours as string | undefined,
        pay: data?.pay as string | undefined,
      }).catch(console.error);
    } else if (type === 'chat_message') {
      displayChatNotification({
        title: notification.request.content.title ?? 'New Message',
        body: notification.request.content.body ?? '',
        roomId: data?.roomId as string | undefined,
        senderId: data?.senderId as string | undefined,
      }).catch(console.error);
    } else {
      displayGeneralNotification({
        title: notification.request.content.title ?? 'StaffSync',
        body: notification.request.content.body ?? '',
      }).catch(console.error);
    }

    // Show notification in both foreground and background
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
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

      const existingStatus = await Notifications.getPermissionsAsync() as any;
      let isGranted = existingStatus.granted === true || existingStatus.status === 'granted';

      if (!isGranted) {
        const finalStatus = await Notifications.requestPermissionsAsync() as any;
        isGranted = finalStatus.granted === true || finalStatus.status === 'granted';
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

  // Register a token with the backend
  const registerTokenWithBackend = useCallback(async (token: string) => {
    try {
      await registerToken({
        pushToken: token,
        platform: 'expo',
        deviceId: getDeviceId(),
      }).unwrap();
      console.log(`[PushToken] Registered Expo token:`, token.slice(0, 20) + '...');
    } catch (e) {
      console.error(`[PushToken] Failed to register token:`, e);
    }
  }, [registerToken, getDeviceId]);

  // On login: get push token and register it with the backend
  useEffect(() => {
    console.log('[PushToken] Auth state changed:', isAuthenticated);
    if (!isAuthenticated) {
      console.log('[PushToken] User logged out, resetting registration flag');
      hasRegistered.current = false;
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
        await registerTokenWithBackend(expoToken);
      } else {
        hasRegistered.current = false;
        console.log('[PushToken] Failed to get Expo token');
      }
    });
  }, [isAuthenticated, registerForPushNotifications, registerTokenWithBackend]);

  // Set up expo-notifications channels and listeners
  useEffect(() => {
    // Create Android channels and iOS categories
    setupNotificationChannels().catch(console.error);

    // expo-notifications: update state when a notification arrives in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener((n) => {
      setNotification(n);
      console.log('[Notification] Received in foreground:', n);
    });

    // expo-notifications: handle taps / background action buttons
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const actionId = response.actionIdentifier;
      const data = response.notification.request.content.data as Record<string, any>;
      const shiftId = data?.shiftId as string | undefined;

      console.log('[Notification] Response received:', actionId, data);

      // Handle action buttons
      handleNotificationAction(actionId, data).catch(console.error);

      // Default tap — pass to deep linking handler
      setLastNotificationResponse(response);
    });

    return () => {
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
  }, []);

  // Badge count management — uses expo-notifications
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

import { useState, useEffect, useCallback, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRegisterPushTokenMutation } from '../store/api/notificationsApi';
import { useAppSelector } from '../store/hooks';
import { store } from '../store';
import { baseApi } from '../store/api/baseApi';
import { API_BASE_URL } from '../services/endpoints';

const AUTH_TOKEN_KEY = '@staffsync_auth_token';
const NOTIFICATION_PREFS_KEY = '@staffsync_notification_prefs';

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

    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

// Register interactive notification categories
async function setupNotificationCategories() {
  await Notifications.setNotificationCategoryAsync('shift_action', [
    {
      identifier: 'accept_shift',
      buttonTitle: '✅ Accept',
      options: {
        opensAppToForeground: false,
      },
    },
    {
      identifier: 'decline_shift',
      buttonTitle: '❌ Decline',
      options: {
        opensAppToForeground: false,
        isDestructive: true,
      },
    },
  ]);
}

// Handle shift accept/decline directly from notification (runs outside React tree)
async function handleShiftAction(shiftId: string, action: 'accept' | 'decline') {
  try {
    const token = store.getState().auth.token || await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      console.error('No auth token for notification action');
      return;
    }

    const endpoint = action === 'accept'
      ? `${API_BASE_URL}/shifts/${shiftId}/accept`
      : `${API_BASE_URL}/shifts/${shiftId}/decline`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: action === 'decline' ? JSON.stringify({ reason: 'Declined from notification' }) : undefined,
    });

    const data = await res.json();

    if (data.success) {
      console.log(`Shift ${action}ed successfully from notification`);
      // Invalidate RTK Query cache so lists refresh when user opens the app
      store.dispatch(baseApi.util.invalidateTags(['Shifts', 'Notifications']));

      // Show a local confirmation notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: action === 'accept' ? 'Shift Accepted ✅' : 'Shift Declined',
          body: action === 'accept'
            ? 'You have accepted the shift. Check your schedule for details.'
            : 'You have declined the shift.',
        },
        trigger: null, // show immediately
      });
    } else {
      console.error(`Failed to ${action} shift:`, data.message);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Could not ${action} shift`,
          body: data.message || 'Please open the app and try again.',
        },
        trigger: null,
      });
    }
  } catch (e) {
    console.error(`Error handling shift ${action} from notification:`, e);
  }
}

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
      if (!Device.isDevice) {
        throw new Error('Push notifications require a physical device');
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        throw new Error('Push notification permission denied');
      }

      // Set up Android notification channels
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('shifts', {
          name: 'Shift Notifications',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
        });
        await Notifications.setNotificationChannelAsync('default', {
          name: 'General',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
        });
      }

      await setupNotificationCategories();

     const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId: '7e3e3568-a25b-4dae-95bf-a62fe46929b3', });

      console.log('[PushToken] Expo Push Token:', tokenResponse.data);
      setExpoPushToken(tokenResponse.data);
      setError(null);

      return tokenResponse.data;
    } catch (e: any) {
      console.error('[PushToken] Full Error:', e);
      setError(e?.message ?? 'Failed to get push token');
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

  // Register token with the backend
  const registerTokenWithBackend = useCallback(async (token: string) => {
    try {
      await registerToken({
        pushToken: token,
        platform: Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'expo',
        deviceId: getDeviceId(),
      }).unwrap();
      console.log('Push token registered with backend:', token.slice(0, 20) + '...');
    } catch (e) {
      console.error('Failed to register push token with backend:', e);
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

    registerForPushNotifications().then((token) => {
      if (token) {
        hasRegistered.current = true;
        console.log('[PushToken] Got token, registering with backend...');
        registerTokenWithBackend(token);
      } else {
        hasRegistered.current = false;
        console.log('[PushToken] Failed to get token');
      }
    });
  }, [isAuthenticated, registerForPushNotifications, registerTokenWithBackend]);

  // Set up foreground/response listeners once on mount
  useEffect(() => {

    notificationListener.current = Notifications.addNotificationReceivedListener((n) => {
      setNotification(n);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const actionId = response.actionIdentifier;
      const data = response.notification.request.content.data as Record<string, any>;
      const shiftId = data?.shiftId as string | undefined;

      // Handle Accept/Decline action buttons pressed from notification
      if (shiftId && actionId === 'accept_shift') {
        handleShiftAction(shiftId, 'accept');
        return;
      }
      if (shiftId && actionId === 'decline_shift') {
        handleShiftAction(shiftId, 'decline');
        return;
      }

      // Default tap (opened the app) — pass to deep linking handler
      console.log('Notification tapped:', data);
      setLastNotificationResponse(response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [registerForPushNotifications, registerTokenWithBackend]);

  return { expoPushToken, notification, lastNotificationResponse, error, registerForPushNotifications };
}

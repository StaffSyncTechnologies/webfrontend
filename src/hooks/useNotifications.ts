import { useState, useEffect, useCallback, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRegisterPushTokenMutation } from '../store/api/notificationsApi';
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
          sound: 'default',
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

  const registerForPushNotifications = useCallback(async () => {
    if (!Device.isDevice) {
      setError('Push notifications require a physical device');
      return null;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        setError('Push notification permission denied');
        return null;
      }

      // Set up Android notification channels
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('shifts', {
          name: 'Shift Notifications',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          sound: 'default',
        });
        await Notifications.setNotificationChannelAsync('default', {
          name: 'General',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
        });
      }

      // Register interactive notification categories (Accept/Decline buttons)
      await setupNotificationCategories();

      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      const token = await Notifications.getExpoPushTokenAsync({
        ...(projectId && { projectId }),
      });
      setExpoPushToken(token.data);

      return token.data;
    } catch (e: any) {
      setError(e.message);
      return null;
    }
  }, []);

  // Register token with the backend
  const registerTokenWithBackend = useCallback(async (token: string) => {
    try {
      await registerToken({
        pushToken: token,
        platform: Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'expo',
      }).unwrap();
      console.log('Push token registered with backend');
    } catch (e) {
      console.error('Failed to register push token with backend:', e);
    }
  }, [registerToken]);

  useEffect(() => {
    registerForPushNotifications().then((token) => {
      if (token) {
        registerTokenWithBackend(token);
      }
    });

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

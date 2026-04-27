import notifee, {
  AndroidImportance,
  AndroidCategory,
  AndroidVisibility,
  EventType,
  Event,
} from '@notifee/react-native';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store';
import { baseApi } from '../store/api/baseApi';
import { API_BASE_URL } from './endpoints';

const AUTH_TOKEN_KEY = '@staffsync_auth_token';

export const NOTIFEE_CHANNELS = {
  SHIFTS: 'staffsync_shifts',
  PAYSLIPS: 'staffsync_payslips',
  GENERAL: 'staffsync_general',
} as const;

const SHIFT_ACTIONS = {
  ACCEPT: 'ACCEPT_SHIFT',
  DECLINE: 'DECLINE_SHIFT',
} as const;

export async function setupNotifeeChannels(): Promise<void> {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: NOTIFEE_CHANNELS.SHIFTS,
      name: 'Shift Requests',
      description: 'New shift available and assignment notifications',
      importance: AndroidImportance.HIGH,
      vibration: true,
      vibrationPattern: [0, 300, 200, 300],
      lights: true,
      lightColor: '#00AFEF',
      sound: 'default',
    });

    await notifee.createChannel({
      id: NOTIFEE_CHANNELS.PAYSLIPS,
      name: 'Payslips',
      description: 'Payslip ready notifications',
      importance: AndroidImportance.DEFAULT,
      sound: 'default',
    });

    await notifee.createChannel({
      id: NOTIFEE_CHANNELS.GENERAL,
      name: 'General',
      description: 'General app notifications',
      importance: AndroidImportance.DEFAULT,
      sound: 'default',
    });
  }

  if (Platform.OS === 'ios') {
    await notifee.setNotificationCategories([
      {
        id: 'shift_action',
        actions: [
          {
            id: SHIFT_ACTIONS.ACCEPT,
            title: '✅ Accept',
            foreground: false,
          },
          {
            id: SHIFT_ACTIONS.DECLINE,
            title: '❌ Decline',
            foreground: false,
            destructive: true,
          },
        ],
      },
    ]);
  }
}

export async function displayShiftNotification(data: {
  shiftId: string;
  title?: string;
  body?: string;
  date?: string;
  location?: string;
  hours?: string;
  pay?: string;
}): Promise<void> {
  const { shiftId, title, body, date, location, hours, pay } = data;

  const lines: string[] = [];
  if (date || location) lines.push([date, location].filter(Boolean).join(' · '));
  if (hours || pay) lines.push([hours, pay].filter(Boolean).join(' · '));

  await notifee.displayNotification({
    id: `shift_${shiftId}`,
    title: title ?? '🔔 New Shift Available',
    body:
      body ??
      (lines.length
        ? lines.join('\n')
        : 'Tap Accept or Decline below to respond quickly.'),
    data: { shiftId },
    android: {
      channelId: NOTIFEE_CHANNELS.SHIFTS,
      category: AndroidCategory.MESSAGE,
      importance: AndroidImportance.HIGH,
      color: '#00AFEF',
      visibility: AndroidVisibility.PUBLIC,
      largeIcon: 'ic_launcher',
      pressAction: { id: 'default', launchActivity: 'default' },
      actions: [
        {
          title: '✅ Accept',
          pressAction: { id: SHIFT_ACTIONS.ACCEPT },
        },
        {
          title: '❌ Decline',
          pressAction: { id: SHIFT_ACTIONS.DECLINE },
        },
      ],
      timestamp: Date.now(),
      showTimestamp: true,
    },
    ios: {
      categoryId: 'shift_action',
      sound: 'default',
      foregroundPresentationOptions: {
        banner: true,
        list: true,
        badge: true,
        sound: true,
      },
    },
  });
}

export async function displayGeneralNotification(data: {
  title: string;
  body: string;
  channelId?: string;
}): Promise<void> {
  await notifee.displayNotification({
    title: data.title,
    body: data.body,
    android: {
      channelId: data.channelId ?? NOTIFEE_CHANNELS.GENERAL,
      color: '#00AFEF',
      largeIcon: 'ic_launcher',
      pressAction: { id: 'default', launchActivity: 'default' },
      timestamp: Date.now(),
      showTimestamp: true,
    },
    ios: {
      sound: 'default',
      foregroundPresentationOptions: {
        banner: true,
        list: true,
        badge: true,
        sound: true,
      },
    },
  });
}

export async function handleShiftApiCall(
  shiftId: string,
  action: 'accept' | 'decline',
): Promise<void> {
  try {
    const token =
      store.getState().auth.token ??
      (await AsyncStorage.getItem(AUTH_TOKEN_KEY));

    if (!token) {
      console.error('[Notifee] No auth token available for shift action');
      return;
    }

    const res = await fetch(`${API_BASE_URL}/shifts/${shiftId}/${action}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body:
        action === 'decline'
          ? JSON.stringify({ reason: 'Declined from notification' })
          : undefined,
    });

    const json = await res.json();
    store.dispatch(baseApi.util.invalidateTags(['Shifts', 'Notifications']));

    await displayGeneralNotification({
      title: json.success
        ? action === 'accept'
          ? '✅ Shift Accepted'
          : 'Shift Declined'
        : `Could not ${action} shift`,
      body: json.success
        ? action === 'accept'
          ? "You've accepted the shift. Check your schedule."
          : "You've declined the shift."
        : (json.message ?? 'Please open the app and try again.'),
    });
  } catch (e) {
    console.error(`[Notifee] Error handling shift ${action}:`, e);
  }
}

export async function handleNotifeeEvent({ type, detail }: Event): Promise<void> {
  const shiftId = detail.notification?.data?.shiftId as string | undefined;

  if (type === EventType.ACTION_PRESS && shiftId) {
    if (detail.pressAction?.id === SHIFT_ACTIONS.ACCEPT) {
      await handleShiftApiCall(shiftId, 'accept');
    } else if (detail.pressAction?.id === SHIFT_ACTIONS.DECLINE) {
      await handleShiftApiCall(shiftId, 'decline');
    }
  }
}

export function registerNotifeeBackgroundHandler(): void {
  notifee.onBackgroundEvent(handleNotifeeEvent);
}

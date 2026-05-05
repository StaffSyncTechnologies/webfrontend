import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store';
import { baseApi } from '../store/api/baseApi';
import { API_BASE_URL } from './endpoints';

const AUTH_TOKEN_KEY = '@staffsync_auth_token';

export const NOTIFICATION_CHANNELS = {
  SHIFTS: 'staffsync_shifts',
  PAYSLIPS: 'staffsync_payslips',
  CHAT: 'staffsync_chat',
  GENERAL: 'staffsync_general',
} as const;

const SHIFT_ACTIONS = {
  ACCEPT: 'accept_shift',
  DECLINE: 'decline_shift',
} as const;

export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.SHIFTS, {
      name: 'Shift Requests',
      description: 'New shift available and assignment notifications',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [300, 300, 200, 300],
      lightColor: '#00AFEF',
      sound: null,
      enableVibrate: true,
      enableLights: true,
    });

    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.PAYSLIPS, {
      name: 'Payslips',
      description: 'Payslip ready notifications',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: null,
    });

    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.CHAT, {
      name: 'Messages',
      description: 'Chat message notifications',
      importance: Notifications.AndroidImportance.HIGH,
      sound: null,
    });

    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.GENERAL, {
      name: 'General',
      description: 'General app notifications',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: null,
    });
  }

  if (Platform.OS === 'ios') {
    await Notifications.setNotificationCategoryAsync('shift_action', [
      {
        identifier: SHIFT_ACTIONS.ACCEPT,
        buttonTitle: '✅ Accept',
        options: {
          isAuthenticationRequired: false,
        },
      },
      {
        identifier: SHIFT_ACTIONS.DECLINE,
        buttonTitle: '❌ Decline',
        options: {
          isAuthenticationRequired: false,
          isDestructive: true,
        },
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

  const metaParts: string[] = [];
  if (date) metaParts.push(`📅 ${date}`);
  if (location) metaParts.push(`📍 ${location}`);
  if (hours) metaParts.push(`⏱ ${hours}`);
  if (pay) metaParts.push(`💷 ${pay}`);

  const displayBody =
    body ??
    (metaParts.length
      ? metaParts.join(' | ')
      : 'Tap Accept or Decline below to respond quickly.');

  await Notifications.scheduleNotificationAsync({
    content: {
      title: title ?? '🔔 New Shift Available',
      body: displayBody,
      data: { shiftId, type: 'shift' },
      categoryIdentifier: Platform.OS === 'ios' ? 'shift_action' : undefined,
      ...(Platform.OS === 'android' && {
        android: {
          channelId: NOTIFICATION_CHANNELS.SHIFTS,
        },
      }),
    },
    trigger: null,
  });
}

export async function displayGeneralNotification(data: {
  title: string;
  body: string;
  channelId?: string;
}): Promise<void> {
  const channelId = data.channelId ?? NOTIFICATION_CHANNELS.GENERAL;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: data.title,
      body: data.body,
      data: { type: 'general' },
      ...(Platform.OS === 'android' && {
        android: {
          channelId,
        },
      }),
    },
    trigger: null,
  });
}

export async function displayChatNotification(data: {
  title: string;
  body: string;
  roomId?: string;
  senderId?: string;
}): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: data.title,
      body: data.body,
      data: {
        type: 'chat_message',
        action: 'VIEW_CHAT',
        roomId: data.roomId ?? '',
        senderId: data.senderId ?? '',
      },
      ...(Platform.OS === 'android' && {
        android: {
          channelId: NOTIFICATION_CHANNELS.CHAT,
        },
      }),
    },
    trigger: null,
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
      console.error('[Notification] No auth token available for shift action');
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
    console.error(`[Notification] Error handling shift ${action}:`, e);
  }
}

export async function handleNotificationAction(
  actionId: string,
  data: Record<string, any>,
): Promise<void> {
  const shiftId = data?.shiftId as string | undefined;

  if (shiftId) {
    if (actionId === SHIFT_ACTIONS.ACCEPT) {
      await handleShiftApiCall(shiftId, 'accept');
    } else if (actionId === SHIFT_ACTIONS.DECLINE) {
      await handleShiftApiCall(shiftId, 'decline');
    }
  }
}

import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types/navigation';
import { useOrgTheme, useTheme } from '../contexts';
import { H2, H3, Body, Caption } from '../components/ui';
import { API_BASE_URL, NOTIFICATIONS } from '../services/endpoints';
import { store } from '../store';

const DEFAULT_TOGGLES: Record<string, boolean> = {
  newShiftAlerts: true,
  shiftReminder: true,
  chatMessages: true,
  payslipReady: true,
  holidayRequest: true,
  appUpdates: true,
};

// Map frontend keys to backend notification types
const KEY_TO_TYPE: Record<string, string> = {
  newShiftAlerts: 'NEW_SHIFT_ALERTS',
  shiftReminder: 'SHIFT_REMINDER',
  chatMessages: 'CHAT_MESSAGES',
  payslipReady: 'PAYSLIP_READY',
  holidayRequest: 'HOLIDAY_REQUEST',
  appUpdates: 'APP_UPDATES',
};

interface NotificationToggle {
  key: string;
  title: string;
  description: string;
}

export function NotificationSettingsScreen({ navigation }: RootStackScreenProps<'NotificationSettings'>) {
  const insets = useSafeAreaInsets();
  const { secondaryColor } = useOrgTheme();
  const { isDark } = useTheme();

  const [toggles, setToggles] = useState<Record<string, boolean>>(DEFAULT_TOGGLES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const trackColor = secondaryColor || '#38BDF8';
  const AUTH_TOKEN_KEY = '@staffsync_auth_token';

  // Fetch preferences from backend
  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const token = store.getState().auth.token ?? (await AsyncStorage.getItem(AUTH_TOKEN_KEY));
      if (!token) {
        console.error('No auth token available');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}${NOTIFICATIONS.PREFERENCES}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const backendPrefs = data.data.preferences || [];

        // Map backend preferences to frontend toggles
        const mappedToggles: Record<string, boolean> = { ...DEFAULT_TOGGLES };
        backendPrefs.forEach((pref: any) => {
          const frontendKey = Object.keys(KEY_TO_TYPE).find(
            key => KEY_TO_TYPE[key] === pref.type
          );
          if (frontendKey) {
            mappedToggles[frontendKey] = pref.push;
          }
        });

        setToggles(mappedToggles);
      }
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = useCallback(async (key: string) => {
    const newValue = !toggles[key];
    setToggles((prev) => ({ ...prev, [key]: newValue }));

    try {
      setSaving(true);
      const token = store.getState().auth.token ?? (await AsyncStorage.getItem(AUTH_TOKEN_KEY));
      if (!token) {
        console.error('No auth token available');
        setSaving(false);
        return;
      }

      const notificationType = KEY_TO_TYPE[key];

      const response = await fetch(`${API_BASE_URL}${NOTIFICATIONS.UPDATE_PREFERENCE}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: notificationType,
          channel: 'PUSH',
          enabled: newValue,
        }),
      });

      if (!response.ok) {
        // Revert on error
        setToggles((prev) => ({ ...prev, [key]: !newValue }));
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to update notification preference:', response.status, errorData);
      }
    } catch (error) {
      // Revert on error
      setToggles((prev) => ({ ...prev, [key]: !newValue }));
      console.error('Failed to update notification preference:', error);
    } finally {
      setSaving(false);
    }
  }, [toggles]);

  const workAlerts: NotificationToggle[] = [
    { key: 'newShiftAlerts', title: 'New Shift Alerts', description: 'Get notified as soon as a new shift becomes available for you.' },
    { key: 'shiftReminder', title: 'Shift Reminder', description: 'Receive a nudge 1 hour before your scheduled shift starts.' },
  ];

  const messages: NotificationToggle[] = [
    { key: 'chatMessages', title: 'Chat Messages', description: 'Get notified when your manager sends you a message.' },
  ];

  const administrative: NotificationToggle[] = [
    { key: 'payslipReady', title: 'Payslip Ready', description: 'Alerts you when your weekly or monthly payslip is available to view.' },
    { key: 'holidayRequest', title: 'Holiday Request', description: 'Updates on the status of your time-off and holiday requests.' },
    { key: 'appUpdates', title: 'App Updates', description: 'Stay informed about new features and important app maintenance.' },
  ];

  const renderSection = (title: string, items: NotificationToggle[]) => (
    <View className="mb-4">
      <H3 className="mb-3">{title}</H3>
      <View className="h-px bg-light-border-light dark:bg-dark-border-light mb-3" />
      {items.map((item) => (
        <View key={item.key} className="flex-row items-center justify-between mb-5">
          <View className="flex-1 mr-4">
            <Body className="font-outfit-bold mb-1">{item.title}</Body>
            <Caption color="secondary">{item.description}</Caption>
          </View>
          <Switch
            value={toggles[item.key]}
            onValueChange={() => handleToggle(item.key)}
            trackColor={{ false: isDark ? '#2D2D44' : '#E2E8F0', true: '#38BDF8' }}
            thumbColor={toggles[item.key] ? '#FFFFFF' : (isDark ? '#E2E8F0' : '#FFFFFF')}
            ios_backgroundColor={isDark ? '#2D2D44' : '#E2E8F0'}
          />
        </View>
      ))}
    </View>
  );

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#000035'} />
        </TouchableOpacity>
        <View className="flex-1 items-center mr-10">
          <H2>Notifications</H2>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={trackColor} />
        </View>
      ) : (
        <ScrollView className="flex-1 px-5 pt-2" showsVerticalScrollIndicator={false}>
          {renderSection('Work Alerts', workAlerts)}
          {renderSection('Messages', messages)}
          {renderSection('Administrative', administrative)}
          <View className="h-5" />
        </ScrollView>
      )}
    </View>
  );
}

export default NotificationSettingsScreen;

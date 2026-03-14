import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types/navigation';
import { useOrgTheme } from '../contexts';
import { H2, H3, Body, Caption } from '../components/ui';

const NOTIFICATION_PREFS_KEY = '@staffsync_notification_prefs';

const DEFAULT_TOGGLES: Record<string, boolean> = {
  newShiftAlerts: true,
  shiftReminder: true,
  chatMessages: true,
  payslipReady: true,
  holidayRequest: true,
  appUpdates: true,
};

interface NotificationToggle {
  key: string;
  title: string;
  description: string;
}

export function NotificationSettingsScreen({ navigation }: RootStackScreenProps<'NotificationSettings'>) {
  const insets = useSafeAreaInsets();
  const { secondaryColor } = useOrgTheme();

  const [toggles, setToggles] = useState<Record<string, boolean>>(DEFAULT_TOGGLES);

  useEffect(() => {
    AsyncStorage.getItem(NOTIFICATION_PREFS_KEY).then((stored) => {
      if (stored) {
        try {
          setToggles({ ...DEFAULT_TOGGLES, ...JSON.parse(stored) });
        } catch {}
      }
    });
  }, []);

  const trackColor = secondaryColor || '#38BDF8';

  const handleToggle = useCallback((key: string) => {
    setToggles((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

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
            trackColor={{ false: '#E2E8F0', true: trackColor }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#E2E8F0"
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
          <Ionicons name="chevron-back" size={24} color="#000035" />
        </TouchableOpacity>
        <View className="flex-1 items-center mr-10">
          <H2>Notifications</H2>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-2" showsVerticalScrollIndicator={false}>
        {renderSection('Work Alerts', workAlerts)}
        {renderSection('Messages', messages)}
        {renderSection('Administrative', administrative)}
        <View className="h-5" />
      </ScrollView>
    </View>
  );
}

export default NotificationSettingsScreen;

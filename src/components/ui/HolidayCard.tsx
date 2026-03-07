import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Body, Caption } from './index';

export type HolidayStatus = 'approved' | 'pending' | 'denied';

export interface HolidayCardData {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  duration: string;
  status: HolidayStatus;
}

interface HolidayCardProps {
  holiday: HolidayCardData;
  onPress?: () => void;
}

const STATUS_CONFIG: Record<HolidayStatus, { label: string; bg: string; text: string; iconBg: string; iconColor: string; iconName: keyof typeof Ionicons.glyphMap }> = {
  approved: {
    label: 'Approved',
    bg: '#DCFCE7',
    text: '#16A34A',
    iconBg: '#DCFCE7',
    iconColor: '#16A34A',
    iconName: 'checkbox-outline',
  },
  pending: {
    label: 'Pending',
    bg: '#FEF3C7',
    text: '#D97706',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    iconName: 'calendar-outline',
  },
  denied: {
    label: 'Denied',
    bg: '#FEE2E2',
    text: '#DC2626',
    iconBg: '#FEE2E2',
    iconColor: '#DC2626',
    iconName: 'calendar-outline',
  },
};

export function HolidayCard({ holiday, onPress }: HolidayCardProps) {
  const config = STATUS_CONFIG[holiday.status];

  return (
    <TouchableOpacity
      className="flex-row items-center bg-white dark:bg-dark-background-secondary rounded-xl px-3.5 py-3 mb-2.5"
      style={{ borderWidth: 1, borderColor: '#F3F4F6' }}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Icon */}
      <View
        className="w-10 h-10 rounded-lg items-center justify-center mr-3"
        style={{ backgroundColor: config.iconBg }}
      >
        <Ionicons name={config.iconName} size={20} color={config.iconColor} />
      </View>

      {/* Info */}
      <View className="flex-1">
        <Body className="font-outfit-semibold mb-0.5">{holiday.title}</Body>
        <Caption color="secondary">
          {holiday.startDate} - {holiday.endDate} • {holiday.duration}
        </Caption>
      </View>

      {/* Status Badge */}
      <View
        className="px-2.5 py-1 rounded-full"
        style={{ backgroundColor: config.bg }}
      >
        <Caption className="font-outfit-semibold" style={{ color: config.text, fontSize: 11 }}>
          {config.label}
        </Caption>
      </View>
    </TouchableOpacity>
  );
}

export default HolidayCard;

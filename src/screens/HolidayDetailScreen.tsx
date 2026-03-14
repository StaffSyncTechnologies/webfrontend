import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types/navigation';
import { useOrgTheme } from '../contexts';
import { H2, H3, Body, Caption, Button } from '../components/ui';

interface RequestLogEntry {
  status: string;
  date: string;
  isActive: boolean;
}

export function HolidayDetailScreen({ route, navigation }: RootStackScreenProps<'HolidayDetail'>) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { holidayId } = route.params;

  const holiday = {
    title: 'Summer Break',
    dateRange: 'Oct 14 - Oct 16 2026',
    duration: '3 days',
    status: 'pending' as const,
    leavePeriod: 'Mon, Oct 14 - Tue Oct 16 2026',
    leaveType: 'Annual leave',
    leaveDuration: '3 days',
    reason: 'Summer vacation to spend time with family.',
    requestedOn: 'Mon, Oct 01',
    approvedBy: 'Nill',
  };

  const requestLog: RequestLogEntry[] = [
    { status: 'In review\nMon, 02 Oct 2026 by Sarah Joe', date: '', isActive: true },
    { status: 'Submitted\nMon, 01 Oct 2026 by you', date: '', isActive: false },
  ];

  const STATUS_CONFIG = {
    approved: { label: 'APPROVED', bg: '#DCFCE7', text: '#16A34A' },
    pending: { label: 'PENDING', bg: '#FEF3C7', text: '#D97706' },
    denied: { label: 'DENIED', bg: '#FEE2E2', text: '#DC2626' },
  };

  const config = STATUS_CONFIG[holiday.status];

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="chevron-back" size={24} color="#000035" />
        </TouchableOpacity>
        <View className="flex-1 items-center mr-10">
          <H2>Holiday Details</H2>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Title + Badge */}
        <View className="px-5 mb-1">
          <View className="flex-row items-start justify-between">
            <H2 className="text-2xl flex-1 mr-3">{holiday.title}</H2>
            <View className="px-3 py-1 rounded-full" style={{ backgroundColor: config.bg }}>
              <Caption className="font-outfit-bold" style={{ color: config.text, fontSize: 11 }}>
                {config.label}
              </Caption>
            </View>
          </View>
        </View>

        {/* Date Range */}
        <View className="flex-row items-center gap-1.5 px-5 mb-5">
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Body color="secondary">{holiday.dateRange} • {holiday.duration}</Body>
        </View>

        {/* Leave Period Card */}
        <View className="mx-5 mb-4 p-4 rounded-2xl" style={{ borderWidth: 1, borderColor: '#E2E8F0' }}>
          <Caption color="secondary" className="mb-1.5">Leave Period</Caption>
          <H3 className="mb-1">{holiday.leavePeriod}</H3>
          <Body color="secondary">{holiday.leaveType}</Body>
        </View>

        {/* Divider */}
        <View className="h-px bg-light-border-light dark:bg-dark-border-light mx-5" />

        {/* Holiday Details */}
        <View className="px-5 py-4">
          <H3 className="mb-4">Holiday Details</H3>

          <View className="flex-row items-center justify-between mb-3">
            <Body color="secondary">Leave duration</Body>
            <Body className="font-outfit-semibold">{holiday.leaveDuration}</Body>
          </View>

          <View className="flex-row items-start justify-between mb-3">
            <Body color="secondary" className="mr-4">Reason</Body>
            <Body className="font-outfit-semibold text-right flex-1">{holiday.reason}</Body>
          </View>

          <View className="flex-row items-center justify-between mb-3">
            <Body color="secondary">Requested on</Body>
            <Body className="font-outfit-semibold">{holiday.requestedOn}</Body>
          </View>

          <View className="flex-row items-center justify-between">
            <Body color="secondary">Approved by</Body>
            <Body className="font-outfit-semibold">{holiday.approvedBy}</Body>
          </View>
        </View>

        {/* Divider */}
        <View className="h-px bg-light-border-light dark:bg-dark-border-light mx-5" />

        {/* Request Log */}
        <View className="px-5 py-4">
          <H3 className="mb-4">Request Log</H3>

          {requestLog.map((entry, index) => {
            const lines = entry.status.split('\n');
            return (
              <View key={index} className="flex-row mb-4">
                {/* Timeline Dot + Line */}
                <View className="items-center mr-3 pt-1">
                  <View
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.isActive ? (primaryColor || '#3B82F6') : '#D1D5DB' }}
                  />
                  {index < requestLog.length - 1 && (
                    <View className="w-0.5 flex-1 mt-1" style={{ backgroundColor: '#E5E7EB' }} />
                  )}
                </View>

                {/* Log Content */}
                <View className="flex-1 pb-2">
                  <Caption
                    className="font-outfit-semibold"
                    style={{ color: entry.isActive ? '#374151' : '#9CA3AF' }}
                  >
                    {lines[0]}
                  </Caption>
                  {lines[1] && (
                    <Caption color="secondary">{lines[1]}</Caption>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Cancel Request Button */}
      <View className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-3 bg-light-background-primary dark:bg-dark-background-primary">
        <Button onPress={() => navigation.goBack()}>
          Cancel request
        </Button>
      </View>
    </View>
  );
}

export default HolidayDetailScreen;

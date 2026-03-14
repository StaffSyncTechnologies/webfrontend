import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types/navigation';
import { useOrgTheme } from '../contexts';
import { H2, H3, Body, Caption, Button, HolidayCard } from '../components/ui';
import type { HolidayCardData } from '../components/ui';

const upcomingHolidays: HolidayCardData[] = [
  { id: '1', title: 'Summer Break', startDate: 'Oct 14', endDate: 'Oct 16 2026', duration: '3 days', status: 'approved' },
  { id: '2', title: 'Summer Break', startDate: 'Oct 14', endDate: 'Oct 16 2026', duration: '3 days', status: 'approved' },
];

const holidayRequests: HolidayCardData[] = [
  { id: '3', title: 'Summer Break', startDate: 'Oct 14', endDate: 'Oct 16 2026', duration: '3 days', status: 'approved' },
  { id: '4', title: 'Summer Break', startDate: 'Oct 14', endDate: 'Oct 16 2026', duration: '3 days', status: 'pending' },
  { id: '5', title: 'Summer Break', startDate: 'Oct 14', endDate: 'Oct 16 2026', duration: '3 days', status: 'approved' },
  { id: '6', title: 'Summer Break', startDate: 'Oct 14', endDate: 'Oct 16 2026', duration: '3 days', status: 'denied' },
];

export function HolidaysScreen({ navigation }: RootStackScreenProps<'Holidays'>) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="chevron-back" size={24} color="#000035" />
        </TouchableOpacity>
        <View className="flex-1 items-center mr-10">
          <H2>Holidays</H2>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Total Holidays Card */}
        <View
          className="mx-5 mb-5 rounded-2xl p-5"
          style={{ backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' }}
        >
          <Caption color="secondary" className="mb-1">Total Holidays</Caption>
          <View className="flex-row items-baseline mb-4">
            <H2 className="text-3xl font-outfit-bold mr-2">20</H2>
            <Body color="secondary">Days Left</Body>
          </View>

          {/* Stats Row */}
          <View className="flex-row">
            <View className="flex-1 items-center py-2.5 rounded-lg" style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' }}>
              <Caption color="secondary" className="mb-0.5">Total Days</Caption>
              <H3>32</H3>
            </View>
            <View className="w-2" />
            <View className="flex-1 items-center py-2.5 rounded-lg" style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' }}>
              <Caption color="secondary" className="mb-0.5">Days Used</Caption>
              <H3>12</H3>
            </View>
            <View className="w-2" />
            <View className="flex-1 items-center py-2.5 rounded-lg" style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' }}>
              <Caption color="secondary" className="mb-0.5">Days Left</Caption>
              <H3>20</H3>
            </View>
          </View>
        </View>

        {/* Request Holiday Button */}
        <View className="px-5 mb-5">
          <TouchableOpacity
            className="flex-row items-center justify-center py-3.5 rounded-xl"
            style={{ backgroundColor: primaryColor }}
            onPress={() => navigation.navigate('RequestHoliday')}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Body className="font-outfit-semibold ml-1.5" style={{ color: '#FFFFFF' }}>
              Request holiday
            </Body>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View className="h-px bg-light-border-light dark:bg-dark-border-light mx-5 mb-4" />

        {/* Upcoming Holidays */}
        <View className="px-5 mb-5">
          <H3 className="mb-3">Upcoming Holiday</H3>
          {upcomingHolidays.map((holiday) => (
            <HolidayCard key={holiday.id} holiday={holiday} onPress={() => navigation.navigate('HolidayDetail', { holidayId: holiday.id })} />
          ))}
        </View>

        {/* Holiday Requests */}
        <View className="px-5 mb-5">
          <H3 className="mb-3">Holiday Requests</H3>
          {holidayRequests.map((holiday) => (
            <HolidayCard key={holiday.id} holiday={holiday} onPress={() => navigation.navigate('HolidayDetail', { holidayId: holiday.id })} />
          ))}
        </View>

        <View className="h-5" />
      </ScrollView>
    </View>
  );
}

export default HolidaysScreen;

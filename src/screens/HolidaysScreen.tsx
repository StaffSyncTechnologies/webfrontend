import React from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types/navigation';
import { useOrgTheme, useTheme } from '../contexts';
import { H2, H3, Body, Caption, Button, HolidayCard, ScreenHeader } from '../components/ui';
import type { HolidayCardData } from '../components/ui';
import { useGetMyHolidayRequestsQuery } from '../store';

// Helper to format date from backend to display format
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const formatDateWithYear = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Transform backend status to HolidayCard status
const transformStatus = (status: string): HolidayCardData['status'] => {
  if (status === 'APPROVED') return 'approved';
  if (status === 'PENDING') return 'pending';
  if (status === 'DENIED') return 'denied';
  return 'pending';
};

// Transform backend holiday data to HolidayCardData
const transformHolidayData = (holiday: any): HolidayCardData => ({
  id: holiday.id,
  title: holiday.title,
  startDate: formatDate(holiday.startDate),
  endDate: formatDateWithYear(holiday.endDate),
  duration: `${holiday.totalDays} day${holiday.totalDays > 1 ? 's' : ''}`,
  status: transformStatus(holiday.status),
});

export function HolidaysScreen({ navigation }: RootStackScreenProps<'Holidays'>) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  
  // Fetch holiday data from backend
  const { data: holidaysData, isLoading } = useGetMyHolidayRequestsQuery();

  const summary = holidaysData?.data?.summary;
  const upcomingHolidays = holidaysData?.data?.upcomingHolidays || [];
  const holidayRequests = holidaysData?.data?.holidayRequests || [];

  // Transform backend data to HolidayCardData format
  const upcomingCards = upcomingHolidays.map(transformHolidayData);
  const requestCards = holidayRequests.map(transformHolidayData);

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <ScreenHeader
        title="Holidays"
        onBack={() => navigation.goBack()}
        showOrgBranding={true}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Total Holidays Card */}
          <View
            className="mx-5 mb-5 rounded-2xl p-5"
            style={{ backgroundColor: isDark ? '#1F2937' : '#F8FAFC', borderWidth: 1, borderColor: isDark ? '#374151' : '#E2E8F0' }}
          >
            <Caption color="secondary" className="mb-1">Total Holidays</Caption>
            <View className="flex-row items-baseline mb-4">
              <H2 className="text-3xl font-outfit-bold mr-2">{summary?.daysLeft || 0}</H2>
              <Body color="secondary">Days Left</Body>
            </View>

            {/* Stats Row */}
            <View className="flex-row">
              <View className="flex-1 items-center py-2.5 rounded-lg" style={{ backgroundColor: isDark ? '#374151' : '#FFFFFF', borderWidth: 1, borderColor: isDark ? '#4B5563' : '#E2E8F0' }}>
                <Caption color="secondary" className="mb-0.5">Total Days</Caption>
                <H3>{summary?.totalDays || 0}</H3>
              </View>
              <View className="w-2" />
              <View className="flex-1 items-center py-2.5 rounded-lg" style={{ backgroundColor: isDark ? '#374151' : '#FFFFFF', borderWidth: 1, borderColor: isDark ? '#4B5563' : '#E2E8F0' }}>
                <Caption color="secondary" className="mb-0.5">Days Used</Caption>
                <H3>{summary?.usedDays || 0}</H3>
              </View>
              <View className="w-2" />
              <View className="flex-1 items-center py-2.5 rounded-lg" style={{ backgroundColor: isDark ? '#374151' : '#FFFFFF', borderWidth: 1, borderColor: isDark ? '#4B5563' : '#E2E8F0' }}>
                <Caption color="secondary" className="mb-0.5">Days Left</Caption>
                <H3>{summary?.daysLeft || 0}</H3>
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
          {upcomingCards.length > 0 && (
            <View className="px-5 mb-5">
              <H3 className="mb-3">Upcoming Holiday</H3>
              {upcomingCards.map((holiday) => (
                <HolidayCard key={holiday.id} holiday={holiday} onPress={() => navigation.navigate('HolidayDetail', { holidayId: holiday.id })} />
              ))}
            </View>
          )}

          {/* Holiday Requests */}
          {requestCards.length > 0 && (
            <View className="px-5 mb-5">
              <H3 className="mb-3">Holiday Requests</H3>
              {requestCards.map((holiday) => (
                <HolidayCard key={holiday.id} holiday={holiday} onPress={() => navigation.navigate('HolidayDetail', { holidayId: holiday.id })} />
              ))}
            </View>
          )}

          <View className="h-5" />
        </ScrollView>
      )}
    </View>
  );
}

export default HolidaysScreen;

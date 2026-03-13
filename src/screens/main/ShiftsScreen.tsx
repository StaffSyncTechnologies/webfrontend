import React, { useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabScreenProps } from '../../types/navigation';
import { useOrgTheme } from '../../contexts';
import { H2, Body, Caption, ShiftCard } from '../../components/ui';
import { useGetShiftsQuery } from '../../store/api/shiftsApi';
import type { ShiftCardData } from '../../components/ui';

const FILTERS = ['Date', 'Distance', 'Time', 'Role'] as const;
const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function formatTime(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m}${ampm}`;
}

function getShiftType(iso: string): string {
  const h = new Date(iso).getHours();
  if (h >= 6 && h < 14) return 'Day shift';
  if (h >= 14 && h < 20) return 'Afternoon shift';
  return 'Night shift';
}

function mapPriority(priority?: string): ShiftCardData['status'] {
  if (priority === 'URGENT') return 'urgent';
  if (priority === 'HIGH') return 'high_pay';
  return undefined;
}

export function ShiftsScreen({ navigation }: MainTabScreenProps<'Shifts'>) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('Date');
  const { primaryColor } = useOrgTheme();
  const { data: shiftsResponse, isLoading, isFetching, refetch } = useGetShiftsQuery({});

  const shifts: ShiftCardData[] = (shiftsResponse?.data || []).map((s: any) => {
    const startDate = new Date(s.startAt || s.startTime);
    return {
      id: s.id,
      title: s.title || 'Shift',
      location: s.siteLocation || s.clientCompany?.name || 'TBC',
      type: getShiftType(s.startAt || s.startTime),
      time: `${formatTime(s.startAt || s.startTime)} - ${formatTime(s.endAt || s.endTime)}`,
      month: MONTHS[startDate.getMonth()],
      day: startDate.getDate().toString(),
      payRate: s.payRate || s.hourlyRate ? `£${s.payRate || s.hourlyRate}/hr` : undefined,
      status: mapPriority(s.priority),
    };
  });

  const filtered = shifts.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="items-center py-4">
        <H2>Shifts</H2>
      </View>

      {/* Search Bar */}
      <View className="px-5 pb-3">
        <View className="flex-row items-center bg-light-background-secondary dark:bg-dark-background-secondary rounded-full px-4 py-3">
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2.5 text-base font-outfit-regular text-light-text-primary dark:text-dark-text-primary"
            placeholder="Search"
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
            <Ionicons name="options-outline" size={20} color={showFilters ? primaryColor : '#6B7280'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Chips */}
      {showFilters && <View className="px-5 pb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                className="flex-row items-center mr-2 px-3.5 py-2 rounded-full border"
                style={{
                  backgroundColor: isActive ? primaryColor : 'transparent',
                  borderColor: isActive ? primaryColor : '#D1D5DB',
                }}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.7}
              >
                <Caption
                  className="font-outfit-semibold"
                  style={{ color: isActive ? '#FFFFFF' : '#6B7280' }}
                >
                  {filter}
                </Caption>
                <Ionicons
                  name="chevron-down"
                  size={14}
                  color={isActive ? '#FFFFFF' : '#6B7280'}
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>}

      {/* Shift List */}
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={primaryColor} colors={[primaryColor]} />
        }
      >
        {isLoading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color={primaryColor} />
          </View>
        ) : filtered.length === 0 ? (
          <View className="items-center py-12">
            <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
            <Body color="secondary" className="mt-3">No shifts available</Body>
            <Caption color="muted" className="mt-1">Pull down to refresh</Caption>
          </View>
        ) : (
          filtered.map((shift) => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              onPress={() => navigation.getParent()?.navigate('ShiftDetails', { shiftId: shift.id })}
              onViewDetails={() => navigation.getParent()?.navigate('ShiftDetails', { shiftId: shift.id })}
            />
          ))
        )}
        <View className="h-5" />
      </ScrollView>
    </View>
  );
}

export default ShiftsScreen;

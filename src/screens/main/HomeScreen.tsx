import React from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabScreenProps } from '../../types/navigation';
import { useAppSelector } from '../../store/hooks';
import { useOrgTheme } from '../../contexts';
import { H2, H3, Body, Caption, Card, Button, ShiftCard, HolidayCard } from '../../components/ui';
import { useGetHomeQuery } from '../../store/api/workerApi';
import { useGetUnreadCountQuery } from '../../store/api/notificationsApi';
import type { ShiftCardData, HolidayCardData } from '../../components/ui';
import { useTranslation } from 'react-i18next';

function formatTime(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m}${ampm}`;
}

function formatStartsIn(minutes: number | null): string {
  if (!minutes || minutes <= 0) return 'Starting soon';
  if (minutes < 60) return `${minutes}mins`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}mins` : `${h}h`;
}

function formatShiftDate(iso: string): { month: string; day: string } {
  const d = new Date(iso);
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  return { month: months[d.getMonth()], day: d.getDate().toString() };
}

function formatHolidayDate(iso: string): string {
  const d = new Date(iso);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function getShiftType(iso: string): string {
  const h = new Date(iso).getHours();
  if (h >= 6 && h < 14) return 'Day shift';
  if (h >= 14 && h < 20) return 'Afternoon shift';
  return 'Night shift';
}

function isShiftElapsed(shift: any): boolean {
  const now = new Date();
  const endTime = new Date(shift.endAt);
  return now > endTime;
}

export function HomeScreen({ navigation }: MainTabScreenProps<'Home'>) {
  const insets = useSafeAreaInsets();
  const worker = useAppSelector((state) => state.auth.worker);
  const { primaryColor } = useOrgTheme();
  const [refreshing, setRefreshing] = React.useState(false);
  const { data: homeResponse, isLoading, refetch } = useGetHomeQuery();
  const homeData = homeResponse?.data;
  const { data: unreadCount, refetch: refetchNotifications } = useGetUnreadCountQuery();
  const { t } = useTranslation();

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
      await refetchNotifications();
    } finally {
      setRefreshing(false);
    }
  }, [refetch, refetchNotifications]);

  // Transform backend data into component-ready formats
  const stats = [
    { icon: 'briefcase' as const, iconBg: primaryColor, label: t('home.stats.shifts'), value: String(homeData?.weeklyStats.shifts ?? 0) },
    { icon: 'airplane' as const, iconBg: '#10B981', label: t('home.stats.holiday'), value: String(homeData?.weeklyStats.holidayBalance ?? 0) },
    { icon: 'time' as const, iconBg: '#F59E0B', label: t('home.stats.hours'), value: String(homeData?.weeklyStats.hoursWorked ?? 0) },
  ];

  const todayShift = homeData?.todayShift ?? null;

  const nextShifts: ShiftCardData[] = (homeData?.nextShifts ?? []).map((s:any) => {
    const { month, day } = formatShiftDate(s.startAt);
    return {
      id: s.id,
      title: s.title,
      location: s.location,
      type: getShiftType(s.startAt),
      time: `${formatTime(s.startAt)} - ${formatTime(s.endAt)}`,
      month,
      day,
    };
  });

  const upcomingHolidays: HolidayCardData[] = (homeData?.upcomingHolidays ?? []).map((h:any) => ({
    id: h.id,
    title: h.title,
    startDate: formatHolidayDate(h.startDate),
    endDate: formatHolidayDate(h.endDate),
    duration: `${h.totalDays} day${h.totalDays !== 1 ? 's' : ''}`,
    status: h.status as 'approved' | 'pending' | 'denied',
  }));

  if (isLoading) {
    return (
      <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary items-center justify-center" style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00AFEF"
            colors={['#00AFEF', '#000035']}
            progressBackgroundColor="#F5F7FA"
            progressViewOffset={20}
          />
        }
      >

        {/* Header */}
        <View className="flex-row justify-between items-center px-5 pt-4 pb-3">
          <View>
            <Body color="secondary" className="mb-0.5">{homeData?.greeting ?? t('home.greeting')},</Body>
            <H2>{homeData?.worker.firstName || worker?.fullName || 'Worker'}</H2>
          </View>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              className="w-11 h-11 rounded-full border border-light-border-light dark:border-dark-border-light items-center justify-center"
              onPress={() => navigation.getParent()?.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={20} color="#6B7280" />
              {(unreadCount ?? 0) > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    backgroundColor: '#EF4444',
                    borderRadius: 10,
                    minWidth: 18,
                    height: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 4,
                    borderWidth: 2,
                    borderColor: '#FFFFFF',
                  }}
                >
                  <Caption className="text-white text-[10px] font-outfit-bold">
                    {(unreadCount ?? 0) > 99 ? '99+' : unreadCount}
                  </Caption>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* THIS WEEK Stats */}
        <View className="px-5 pt-3 pb-4">
          <View className="flex-row items-center mb-4">
            <Caption color="secondary" className="font-outfit-semibold tracking-wider">{t('home.thisWeek').toUpperCase()}</Caption>
            <Ionicons name="chevron-down" size={14} color="#6B7280" style={{ marginLeft: 4 }} />
          </View>
          <View className="flex-row justify-between items-center">
            {stats.map((stat, index) => (
              <React.Fragment key={index}>
                <View className="flex-row items-center gap-2.5">
                  <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: stat.iconBg }}>
                    <Ionicons name={stat.icon} size={18} color="#FFFFFF" />
                  </View>
                  <View>
                    <Caption color="secondary">{stat.label}</Caption>
                    <H3>{stat.value}</H3>
                  </View>
                </View>
                {index < stats.length - 1 && (
                  <View className="h-10 w-px bg-light-border-light dark:bg-dark-border-light" />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Divider */}
        <View className="h-2 bg-light-background-secondary dark:bg-dark-background-secondary" />

        {/* Today's Shift */}
        {todayShift ? (
          <View className="px-5 pt-5 pb-4">
            <View className="flex-row justify-between items-center mb-4">
              <View className={`px-3 py-1.5 rounded-full border ${
                isShiftElapsed(todayShift) 
                  ? 'border-red-200 bg-red-50' 
                  : todayShift.clockedIn 
                  ? 'border-green-200 bg-green-50' 
                  : `border-[${primaryColor}30] bg-[${primaryColor}10]`
              }`}>
                <Caption className={`font-outfit-bold tracking-wider ${
                  isShiftElapsed(todayShift) 
                    ? 'text-red-600' 
                    : todayShift.clockedIn 
                    ? 'text-green-600' 
                    : ''
                }`} style={{ color: !isShiftElapsed(todayShift) && !todayShift.clockedIn ? primaryColor : undefined }}>
                  {t('home.todayShift').toUpperCase()}
                </Caption>
              </View>
              <View className="flex-row items-center gap-1">
                <Ionicons 
                  name={
                    isShiftElapsed(todayShift) 
                      ? 'time-outline' 
                      : todayShift.clockedIn 
                      ? 'radio-button-on' 
                      : 'time-outline'
                  } 
                  size={16} 
                  color={
                    isShiftElapsed(todayShift) 
                      ? '#EF4444' 
                      : todayShift.clockedIn 
                      ? '#10B981' 
                      : '#6B7280'
                  } 
                />
                <Caption color={
                  isShiftElapsed(todayShift) 
                    ? 'error' 
                    : todayShift.clockedIn 
                    ? 'success' 
                    : 'secondary'
                }>
                  {
                    isShiftElapsed(todayShift)
                      ? 'Shift ended'
                      : todayShift.clockedIn 
                      ? 'In progress' 
                      : `Starts in ${formatStartsIn(todayShift.startsIn)}`
                  }
                </Caption>
              </View>
            </View>

            <View className="h-px bg-light-border-light dark:bg-dark-border-light mb-4" />

            <H2 className="mb-1.5">{todayShift.title}</H2>
            <View className="flex-row items-center gap-1 mb-4">
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Body color="secondary" className="text-sm">{todayShift.location}</Body>
            </View>

            <View className="flex-row gap-12 mb-5">
              <View>
                <Caption color="secondary" className="mb-1">{t('shifts.time')}</Caption>
                <Body className="font-outfit-semibold">{formatTime(todayShift.startAt)} - {formatTime(todayShift.endAt)}</Body>
              </View>
              {todayShift.hourlyRate && (
                <View>
                  <Caption color="secondary" className="mb-1">{t('shifts.hourlyRate')}</Caption>
                  <Body className="font-outfit-semibold">£{todayShift.hourlyRate}/hr</Body>
                </View>
              )}
            </View>

            {/* Show appropriate button based on shift state */}
            {!isShiftElapsed(todayShift) && !todayShift.clockedIn && (
              <Button
                onPress={() => navigation.getParent()?.navigate('ClockIn', { shiftId: todayShift.id })}
                leftIcon={<Ionicons name="log-in-outline" size={20} color="#FFFFFF" />}
              >
                {t('shifts.clockIn')}
              </Button>
            )}
            {!isShiftElapsed(todayShift) && todayShift.clockedIn && !todayShift.clockedOut && (
              <Button
                onPress={() => navigation.getParent()?.navigate('ClockIn', { shiftId: todayShift.id })}
                leftIcon={<Ionicons name="log-out-outline" size={20} color="#FFFFFF" />}
              >
                {t('shifts.clockOut')}
              </Button>
            )}
            {isShiftElapsed(todayShift) && (
              <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="alert-circle" size={20} color="#EF4444" />
                  <View className="flex-1">
                    <Body className="font-outfit-semibold text-red-600 dark:text-red-400">Shift Ended</Body>
                    <Caption color="error" className="text-xs mt-0.5">
                      {todayShift.clockedIn 
                        ? 'You successfully completed this shift' 
                        : 'This shift has ended and cannot be started'
                      }
                    </Caption>
                  </View>
                </View>
              </View>
            )}
          </View>
        ) : (
          <View className="px-5 pt-5 pb-4">
            <View className="px-3 py-1.5 rounded-full border self-start mb-4" style={{ borderColor: `${primaryColor}30`, backgroundColor: `${primaryColor}10` }}>
              <Caption className="font-outfit-bold tracking-wider" style={{ color: primaryColor }}>
                {t('home.todayShift').toUpperCase()}
              </Caption>
            </View>
            <View className="h-px bg-light-border-light dark:bg-dark-border-light mb-4" />
            <Body color="secondary" className="text-center py-4">{t('home.noShiftToday')}</Body>
          </View>
        )}

        {/* Book Holidays */}
        <View className="px-5 pt-5">
          <TouchableOpacity
            className="flex-row items-center p-4 rounded-2xl"
            style={{ backgroundColor: `${primaryColor}08`, borderWidth: 1, borderColor: `${primaryColor}20` }}
            onPress={() => navigation.getParent()?.navigate('Holidays')}
            activeOpacity={0.7}
          >
            <View className="w-11 h-11 rounded-xl items-center justify-center mr-3.5" style={{ backgroundColor: `${primaryColor}15` }}>
              <Ionicons name="airplane-outline" size={20} color={primaryColor} />
            </View>
            <View className="flex-1">
              <Body className="font-outfit-semibold">{t('holidays.request')}</Body>
              <Caption color="secondary">{t('holidays.daysRemaining')}</Caption>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Upcoming Holidays */}
        {upcomingHolidays.length > 0 && (
          <View className="px-5 pt-5">
            <View className="flex-row justify-between items-center mb-3">
              <H3>{t('holidays.title')}</H3>
              <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Holidays')}>
                <Body className="font-outfit-semibold" style={{ color: primaryColor }}>See all</Body>
              </TouchableOpacity>
            </View>
            {upcomingHolidays.map((h) => (
              <HolidayCard
                key={h.id}
                holiday={h}
                onPress={() => navigation.getParent()?.navigate('HolidayDetail', { holidayId: h.id })}
              />
            ))}
          </View>
        )}

        {/* Next Shifts */}
        {nextShifts.length > 0 && (
          <View className="px-5 pt-5">
            <View className="flex-row justify-between items-center mb-4">
              <H3>{t('home.nextShifts')}</H3>
              <TouchableOpacity onPress={() => navigation.navigate('Shifts')}>
                <Body className="font-outfit-semibold" style={{ color: primaryColor }}>See all</Body>
              </TouchableOpacity>
            </View>

            {nextShifts.map((shift) => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                compact
                onPress={() => navigation.getParent()?.navigate('ShiftDetails', { shiftId: shift.id })}
              />
            ))}
          </View>
        )}

        <View className="h-5" />
      </ScrollView>
    </View>
  );
}

export default HomeScreen;

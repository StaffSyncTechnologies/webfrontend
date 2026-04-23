import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabScreenProps } from '../../types/navigation';
import { useOrgTheme } from '../../contexts';
import { H2, H3, Body, Caption, ShiftCard, ScreenHeader } from '../../components/ui';
import { useGetMyScheduleQuery, useGetMyRecurringSchedulesQuery, useGetMyScheduleChangeRequestsQuery } from '../../store/api/workerApi';
import type { ShiftCardData } from '../../components/ui';
import type { ScheduleChangeRequest } from '../../store/api/workerApi';

type ViewMode = 'week' | 'month';

const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(startDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

function getWeekDays(year: number, month: number, day: number) {
  const date = new Date(year, month, day);
  const dow = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((dow === 0 ? 7 : dow) - 1));
  const days: { day: number; month: number; year: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push({ day: d.getDate(), month: d.getMonth(), year: d.getFullYear() });
  }
  return days;
}

function getDayName(year: number, month: number, day: number) {
  const d = new Date(year, month, day);
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return names[d.getDay()];
}

const MONTHS_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

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

export function ScheduleScreen({ navigation }: MainTabScreenProps<'Schedule'>) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(now.getDate());

  // Fetch shifts for the visible month range
  const from = new Date(currentYear, currentMonth, 1).toISOString();
  const to = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).toISOString();
  const { data: scheduleResponse, isLoading, isFetching, refetch } = useGetMyScheduleQuery({ from, to }, { refetchOnMountOrArgChange: true });

  // Fetch recurring schedules and schedule change requests
  const { data: recurringSchedulesResponse, refetch: refetchRecurringSchedules } = useGetMyRecurringSchedulesQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: scheduleChangeRequestsResponse } = useGetMyScheduleChangeRequestsQuery(undefined, { refetchOnMountOrArgChange: true });
  const recurringSchedules = Array.isArray(recurringSchedulesResponse) ? recurringSchedulesResponse : recurringSchedulesResponse?.data || [];
  const scheduleChangeRequests = Array.isArray(scheduleChangeRequestsResponse) ? scheduleChangeRequestsResponse : scheduleChangeRequestsResponse?.data || [];


  // Group shifts by day-of-month
  const shiftsByDay = useMemo(() => {
    const map: Record<string, ShiftCardData[]> = {};
    for (const s of scheduleResponse?.data || []) {
      const d = new Date(s.startAt);
      if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) continue;
      const dayKey = String(d.getDate());
      if (!map[dayKey]) map[dayKey] = [];
      map[dayKey].push({
        id: s.id,
        title: s.title,
        location: s.siteLocation || s.clientCompany?.name || 'TBC',
        type: getShiftType(s.startAt),
        time: `${formatTime(s.startAt)} - ${formatTime(s.endAt)}`,
        month: MONTHS_SHORT[d.getMonth()],
        day: d.getDate().toString(),
        payRate: s.payRate ? `£${s.payRate}/hr` : undefined,
        recurringScheduleId: s.recurringScheduleId ?? undefined,
      });
    }
    return map;
  }, [scheduleResponse, currentMonth, currentYear]);

  const monthGrid = useMemo(() => getMonthGrid(currentYear, currentMonth), [currentYear, currentMonth]);
  const weekDays = useMemo(() => getWeekDays(currentYear, currentMonth, selectedDay), [currentYear, currentMonth, selectedDay]);

  const hasShifts = (day: number) => !!shiftsByDay[String(day)];

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(1);
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(1);
  };

  const scheduleDays = viewMode === 'week'
    ? [selectedDay]
    : Object.keys(shiftsByDay).map(Number).sort((a, b) => a - b);

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <ScreenHeader
        title="My Schedules"
        showOrgBranding={true}
        rightAction={
          <TouchableOpacity
            onPress={() => {
              // Navigate to schedule change request creation screen
              navigation.getParent()?.navigate('ScheduleChangeRequest');
            }}
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{ backgroundColor: primaryColor }}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      {/* Week / Month Toggle */}
      <View className="px-5 pb-4">
        <View className="flex-row rounded-full border border-light-border-light dark:border-dark-border-light overflow-hidden">
          {(['week', 'month'] as ViewMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              className="flex-1 py-2.5 items-center rounded-full"
              style={{ backgroundColor: viewMode === mode ? primaryColor : 'transparent' }}
              onPress={() => setViewMode(mode)}
              activeOpacity={0.7}
            >
              <Body
                className="font-outfit-semibold"
                style={{ color: viewMode === mode ? '#FFFFFF' : '#6B7280' }}
              >
                {mode === 'week' ? 'Week' : 'Month'}
              </Body>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Month Header */}
      <View className="flex-row items-center justify-between px-5 pb-3">
        <Body className="font-outfit-bold">{MONTH_NAMES[currentMonth]} {currentYear}</Body>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={goToPrevMonth}>
            <Ionicons name="chevron-back" size={20} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity onPress={goToNextMonth}>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Day Labels */}
      <View className="flex-row px-5 pb-2">
        {DAY_LABELS.map((label) => (
          <View key={label} className="flex-1 items-center">
            <Caption color="secondary" className="font-outfit-semibold">{label}</Caption>
          </View>
        ))}
      </View>

      {/* Calendar */}
      {viewMode === 'week' ? (
        <View className="flex-row px-5 pb-4">
          {weekDays.map((wd, i) => {
            const isSelected = wd.day === selectedDay && wd.month === currentMonth;
            const dayHasShifts = wd.month === currentMonth && hasShifts(wd.day);
            const isCurrentMonth = wd.month === currentMonth;
            return (
              <TouchableOpacity
                key={i}
                className="flex-1 items-center py-2"
                onPress={() => {
                  if (isCurrentMonth) setSelectedDay(wd.day);
                }}
                activeOpacity={0.7}
              >
                <View
                  className="w-9 h-9 rounded-full items-center justify-center"
                  style={isSelected ? { backgroundColor: primaryColor } : undefined}
                >
                  <Body
                    className="font-outfit-semibold"
                    style={{
                      color: isSelected ? '#FFFFFF' : dayHasShifts ? primaryColor : isCurrentMonth ? '#111827' : '#D1D5DB',
                    }}
                  >
                    {wd.day}
                  </Body>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View className="px-5 pb-4">
          {monthGrid.map((week, wi) => (
            <View key={wi} className="flex-row">
              {week.map((day, di) => {
                if (day === null) return <View key={di} className="flex-1 items-center py-1.5" />;
                const isSelected = day === selectedDay;
                const dayHasShifts = hasShifts(day);
                return (
                  <TouchableOpacity
                    key={di}
                    className="flex-1 items-center py-1.5"
                    onPress={() => setSelectedDay(day)}
                    activeOpacity={0.7}
                  >
                    <View
                      className="w-9 h-9 rounded-full items-center justify-center"
                      style={isSelected ? { backgroundColor: primaryColor } : undefined}
                    >
                      <Body
                        className="font-outfit-semibold"
                        style={{
                          color: isSelected ? '#FFFFFF' : dayHasShifts ? primaryColor : '#111827',
                        }}
                      >
                        {day}
                      </Body>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      )}

      {/* Divider */}
      <View className="h-px bg-light-border-light dark:bg-dark-border-light" />

      {/* Shift List */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={primaryColor} colors={[primaryColor]} />
        }
      >
        {viewMode === 'week' ? (
          <View className="px-5 pt-4">
            <H3 className="mb-3">{getDayName(currentYear, currentMonth, selectedDay)}, {MONTH_NAMES[currentMonth].slice(0, 3)} {selectedDay}</H3>
            {isLoading ? (
              <ActivityIndicator size="small" color={primaryColor} />
            ) : (shiftsByDay[String(selectedDay)] || []).length > 0 ? (
              (shiftsByDay[String(selectedDay)] || []).map((shift) => (
                <ShiftCard
                  key={shift.id}
                  shift={shift}
                  compact
                  onPress={() => {
                    // When isRecurring, pass the recurringScheduleId so ClockInScreen can match the rota shift
                    // Otherwise pass the actual shift ID
                    navigation.getParent()?.navigate('ClockIn', { 
                      shiftId: shift.recurringScheduleId || shift.id, 
                      isRecurring: !!shift.recurringScheduleId,
                      recurringScheduleId: shift.recurringScheduleId,
                    });
                  }}
                />
              ))
            ) : (
              <View className="items-center py-8">
                <Caption color="muted">No shifts scheduled</Caption>
              </View>
            )}
          </View>
        ) : (
          <View className="px-5 pt-4">
            {isLoading ? (
              <ActivityIndicator size="small" color={primaryColor} />
            ) : scheduleDays.length === 0 ? (
              <View className="items-center py-8">
                <Caption color="muted">No shifts this month</Caption>
              </View>
            ) : (
              scheduleDays.map((day) => (
                <View key={day} className="mb-4">
                  <H3 className="mb-3">{getDayName(currentYear, currentMonth, day)}, {MONTH_NAMES[currentMonth].slice(0, 3)} {day}</H3>
                  {shiftsByDay[String(day)]?.map((shift) => (
                    <ShiftCard
                      key={shift.id}
                      shift={shift}
                      compact
                      onPress={() => {
                        // When isRecurring, pass the recurringScheduleId so ClockInScreen can match the rota shift
                        // Otherwise pass the actual shift ID
                        navigation.getParent()?.navigate('ClockIn', { 
                          shiftId: shift.recurringScheduleId || shift.id, 
                          isRecurring: !!shift.recurringScheduleId,
                          recurringScheduleId: shift.recurringScheduleId,
                        });
                      }}
                    />
                  ))}
                </View>
              ))
            )}
          </View>
        )}

        {/* Recurring Schedules Section */}
        <View className="px-5 pt-4">
          <H3 className="mb-3">Recurring Schedules</H3>
          {recurringSchedules.length === 0 ? (
            <View className="items-center py-4">
              <Caption color="muted">No recurring schedules</Caption>
            </View>
          ) : (
            recurringSchedules.map((schedule) => (
              <TouchableOpacity
                key={schedule.id}
                className="mb-3 p-4 bg-white dark:bg-dark-card rounded-lg border border-light-border-light dark:border-dark-border-light"
                onPress={() => {
                  // Use todayShiftId if available, otherwise fall back to recurring schedule ID
                  const shiftIdToUse = schedule.todayShiftId || schedule.id;
                  navigation.getParent()?.navigate('ClockIn', { 
                    shiftId: shiftIdToUse, 
                    isRecurring: !!schedule.todayShiftId,
                    recurringScheduleId: schedule.id,
                  });
                }}
                activeOpacity={0.7}
              >
                <Body className="font-outfit-semibold mb-1">{schedule.title}</Body>
                <Caption color="secondary" className="mb-2">{schedule.role || 'No role'}</Caption>
                <View className="flex-row flex-wrap gap-1 mb-2">
                  {schedule.days.map((day:any) => (
                    <View key={day.dayOfWeek} className="px-2 py-1 bg-light-background-secondary dark:bg-dark-background-secondary rounded">
                      <Caption>{day.dayOfWeek}</Caption>
                    </View>
                  ))}
                </View>
                {schedule.days.length > 0 && (
                  <Body className="text-xs">{schedule.days[0].startTime} - {schedule.days[0].endTime}</Body>
                )}
                <View className="mt-2">
                  <Caption color={schedule.status === 'ACTIVE' ? 'success' : 'muted'} className="text-xs">
                    {schedule.status}
                  </Caption>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Schedule Change Requests Section */}
        <View className="px-5 pt-4">
          <H3 className="mb-3">Schedule Change Requests</H3>
          {scheduleChangeRequests.length === 0 ? (
            <View className="items-center py-4">
              <Caption color="muted">No schedule change requests</Caption>
            </View>
          ) : (
            scheduleChangeRequests.map((request: ScheduleChangeRequest) => (
              <View key={request.id} className="mb-3 p-4 bg-white dark:bg-dark-card rounded-lg border border-light-border-light dark:border-dark-border-light">
                <Body className="font-outfit-semibold mb-1">{request.recurringSchedule.title}</Body>
                {request.workerNote && (
                  <Caption color="secondary" className="mb-2 italic">"{request.workerNote}"</Caption>
                )}
                <View className="flex-row flex-wrap gap-1 mb-2">
                  {request.proposedDays.map((day) => (
                    <View key={day.dayOfWeek} className="px-2 py-1 bg-light-background-secondary dark:bg-dark-background-secondary rounded">
                      <Caption>{day.dayOfWeek}</Caption>
                    </View>
                  ))}
                </View>
                <Body className="text-xs">{request.proposedDays[0]?.startTime} - {request.proposedDays[0]?.endTime}</Body>
                <View className="mt-2">
                  <Caption color={request.status === 'PENDING' ? 'warning' : request.status === 'APPROVED' ? 'success' : 'error'} className="text-xs">
                    {request.status}
                  </Caption>
                </View>
              </View>
            ))
          )}
        </View>

        <View className="h-5" />
      </ScrollView>
    </View>
  );
}

export default ScheduleScreen;

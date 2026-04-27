import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../../types/navigation';
import { useOrgTheme } from '../../contexts';
import { H2, H3, Body, Caption, ScreenHeader } from '../../components/ui';
import { useGetMyTimesheetQuery } from '../../store/api/shiftsApi';
import type { TimesheetDay, TimesheetEntry } from '../../store/api/shiftsApi';

type Props = RootStackScreenProps<'Timesheet'>;

function formatTime(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m}${ampm}`;
}

function formatDateShort(iso: string): string {
  const d = new Date(iso);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function getWeekLabel(weekStart: string): string {
  const now = new Date();
  const start = new Date(weekStart);
  // Current Sun-Sat week start
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
  currentWeekStart.setHours(0, 0, 0, 0);

  if (start.toDateString() === currentWeekStart.toDateString()) return 'This Week';

  const lastWeek = new Date(currentWeekStart);
  lastWeek.setDate(lastWeek.getDate() - 7);
  if (start.toDateString() === lastWeek.toDateString()) return 'Last Week';

  const nextWeek = new Date(currentWeekStart);
  nextWeek.setDate(nextWeek.getDate() + 7);
  if (start.toDateString() === nextWeek.toDateString()) return 'Next Week';

  return `${formatDateShort(weekStart)}`;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  APPROVED: { color: '#10B981', bg: '#ECFDF5', label: 'Approved' },
  PENDING: { color: '#F59E0B', bg: '#FFFBEB', label: 'Pending' },
  FLAGGED: { color: '#EF4444', bg: '#FEF2F2', label: 'Flagged' },
  UPCOMING: { color: '#6B7280', bg: '#F3F4F6', label: 'Upcoming' },
  MISSED: { color: '#EF4444', bg: '#FEF2F2', label: 'Missed' },
};

export function TimesheetScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const [refreshing, setRefreshing] = useState(false);

  // Week navigation: offset from current week (0 = this week, -1 = last week, etc.)
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    // Sun-Sat: subtract getDay() to reach Sunday, then apply offset
    start.setDate(start.getDate() - start.getDay() + weekOffset * 7);
    start.setHours(0, 0, 0, 0);
    return start.toISOString().split('T')[0];
  }, [weekOffset]);

  const { data: response, isLoading, refetch } = useGetMyTimesheetQuery({ weekStart });
  const timesheet = response?.data;

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try { await refetch(); } finally { setRefreshing(false); }
  }, [refetch]);

  const renderEntry = (entry: TimesheetEntry) => {
    const statusCfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.PENDING;
    return (
      <View key={entry.shiftId} className="bg-light-background-primary dark:bg-dark-background-primary rounded-xl p-4 mb-2 border border-light-border-light dark:border-dark-border-light">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 mr-3">
            <Body className="font-outfit-semibold">{entry.shiftTitle}</Body>
            {entry.client && (
              <Caption color="secondary" className="mt-0.5">{entry.client}</Caption>
            )}
          </View>
          <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: statusCfg.bg }}>
            <Caption className="font-outfit-semibold text-[10px]" style={{ color: statusCfg.color }}>
              {statusCfg.label}
            </Caption>
          </View>
        </View>

        <View className="flex-row items-center gap-4">
          {/* Scheduled */}
          <View className="flex-row items-center gap-1">
            <Ionicons name="calendar-outline" size={13} color="#9CA3AF" />
            <Caption color="secondary">
              {formatTime(entry.scheduledStart)} - {formatTime(entry.scheduledEnd)}
            </Caption>
          </View>

          {/* Actual clock times */}
          {entry.clockInAt && (
            <View className="flex-row items-center gap-1">
              <Ionicons name="time-outline" size={13} color={primaryColor} />
              <Caption style={{ color: primaryColor }}>
                {formatTime(entry.clockInAt)}{entry.clockOutAt ? ` - ${formatTime(entry.clockOutAt)}` : ' (active)'}
              </Caption>
            </View>
          )}
        </View>

        {/* Hours + earnings row */}
        {entry.hoursWorked != null && (
          <View className="flex-row items-center gap-4 mt-2">
            <View className="flex-row items-center gap-1">
              <Ionicons name="hourglass-outline" size={13} color="#6B7280" />
              <Caption color="secondary">{entry.hoursWorked.toFixed(1)}h worked</Caption>
            </View>
            {entry.hourlyRate && (
              <View className="flex-row items-center gap-1">
                <Ionicons name="cash-outline" size={13} color="#6B7280" />
                <Caption color="secondary">£{(entry.hoursWorked * entry.hourlyRate).toFixed(2)}</Caption>
              </View>
            )}
            {entry.flagReason && (
              <View className="flex-row items-center gap-1">
                <Ionicons name="warning-outline" size={13} color="#EF4444" />
                <Caption className="text-red-500 text-[10px]">{entry.flagReason.replace(/_/g, ' ')}</Caption>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderDay = (day: TimesheetDay) => {
    const hasEntries = day.entries.length > 0;
    return (
      <View key={day.date} className="mb-4">
        {/* Day header */}
        <View className="flex-row justify-between items-center mb-2 px-1">
          <View className="flex-row items-center gap-2">
            <View
              className="w-8 h-8 rounded-lg items-center justify-center"
              style={{ backgroundColor: day.isToday ? primaryColor : '#F3F4F6' }}
            >
              <Caption
                className="font-outfit-bold text-[10px]"
                style={{ color: day.isToday ? '#FFFFFF' : '#6B7280' }}
              >
                {day.dayName}
              </Caption>
            </View>
            <Caption color={day.isToday ? 'primary' : 'secondary'} className="font-outfit-medium">
              {formatDateShort(day.date)}
            </Caption>
            {day.isToday && (
              <View className="px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${primaryColor}20` }}>
                <Caption className="text-[9px] font-outfit-bold" style={{ color: primaryColor }}>TODAY</Caption>
              </View>
            )}
          </View>
          {hasEntries && (
            <Caption color="secondary" className="font-outfit-semibold">
              {day.totalHours > 0 ? `${day.totalHours.toFixed(1)}h` : '-'}
            </Caption>
          )}
        </View>

        {/* Entries or empty state */}
        {hasEntries ? (
          day.entries.map(renderEntry)
        ) : (
          <View className="bg-light-background-secondary dark:bg-dark-background-secondary rounded-xl py-3 px-4">
            <Caption color="secondary" className="text-center">No shifts</Caption>
          </View>
        )}
      </View>
    );
  };

  if (isLoading && !timesheet) {
    return (
      <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary items-center justify-center" style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-light-background-secondary dark:bg-dark-background-secondary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <ScreenHeader
        title="Timesheet"
        onBack={() => navigation.goBack()}
        showOrgBranding={true}
      />

      {/* Week Navigation */}
      <View className="bg-light-background-primary dark:bg-dark-background-primary px-5 pb-3">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => setWeekOffset((o) => o - 1)}
            className="w-9 h-9 rounded-full bg-light-background-secondary dark:bg-dark-background-secondary items-center justify-center"
          >
            <Ionicons name="chevron-back" size={18} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setWeekOffset(0)}>
            <Body className="font-outfit-semibold">
              {timesheet ? getWeekLabel(timesheet.weekStart) : 'This Week'}
            </Body>
            {timesheet && (
              <Caption color="secondary" className="text-center text-[11px]">
                {formatDateShort(timesheet.weekStart)} – {formatDateShort(timesheet.weekEnd)}
              </Caption>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setWeekOffset((o) => o + 1)}
            className="w-9 h-9 rounded-full bg-light-background-secondary dark:bg-dark-background-secondary items-center justify-center"
          >
            <Ionicons name="chevron-forward" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Weekly Summary Card */}
      {timesheet && (
        <View className="mx-4 mt-4 rounded-2xl overflow-hidden" style={{ backgroundColor: primaryColor }}>
          {/* Week label inside card */}
          <View className="px-5 pt-4 pb-1">
            <Caption className="text-white/60 text-[11px] font-outfit-medium uppercase tracking-wide">
              {getWeekLabel(timesheet.weekStart)} · Sun {formatDateShort(timesheet.weekStart)} – Sat {formatDateShort(timesheet.weekEnd)}
            </Caption>
          </View>

          <View className="flex-row px-5 pb-4 pt-2">
            <View className="flex-1 items-center">
              <H2 className="text-white">{timesheet.summary.totalHours.toFixed(1)}h</H2>
              <Caption className="text-white/70 mt-1">This Week</Caption>
            </View>
            <View className="w-px bg-white/20" />
            <View className="flex-1 items-center">
              <H2 className="text-white">£{timesheet.summary.totalEarnings.toFixed(0)}</H2>
              <Caption className="text-white/70 mt-1">Est. Pay</Caption>
            </View>
            <View className="w-px bg-white/20" />
            <View className="flex-1 items-center">
              <H2 className="text-white">{timesheet.summary.shiftsWorked}/{timesheet.summary.shiftsScheduled}</H2>
              <Caption className="text-white/70 mt-1">Shifts</Caption>
            </View>
          </View>

          {/* Status dots */}
          {(timesheet.summary.approved > 0 || timesheet.summary.pending > 0 || timesheet.summary.flagged > 0) && (
            <View className="flex-row gap-3 px-5 pb-4 justify-center">
              {timesheet.summary.approved > 0 && (
                <View className="flex-row items-center gap-1">
                  <View className="w-2 h-2 rounded-full bg-green-400" />
                  <Caption className="text-white/70 text-[10px]">{timesheet.summary.approved} approved</Caption>
                </View>
              )}
              {timesheet.summary.pending > 0 && (
                <View className="flex-row items-center gap-1">
                  <View className="w-2 h-2 rounded-full bg-yellow-400" />
                  <Caption className="text-white/70 text-[10px]">{timesheet.summary.pending} pending</Caption>
                </View>
              )}
              {timesheet.summary.flagged > 0 && (
                <View className="flex-row items-center gap-1">
                  <View className="w-2 h-2 rounded-full bg-red-400" />
                  <Caption className="text-white/70 text-[10px]">{timesheet.summary.flagged} flagged</Caption>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* Monthly Summary Card */}
      {timesheet?.monthly && (
        <View className="mx-4 mt-3 rounded-2xl bg-light-background-primary dark:bg-dark-background-primary border border-light-border-light dark:border-dark-border-light p-4">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center gap-2">
              <Ionicons name="calendar-outline" size={16} color={primaryColor} />
              <Body className="font-outfit-semibold">{timesheet.monthly.monthName}</Body>
            </View>
            <Caption color="secondary">{timesheet.monthly.shiftsWorked} shifts</Caption>
          </View>

          <View className="flex-row gap-3">
            {/* Monthly hours */}
            <View className="flex-1 bg-light-background-secondary dark:bg-dark-background-secondary rounded-xl p-3">
              <View className="flex-row items-end gap-1">
                <H3 style={{ color: primaryColor }}>{timesheet.monthly.totalHours.toFixed(1)}</H3>
                <Caption color="secondary" className="mb-0.5">hrs</Caption>
              </View>
              <Caption color="secondary" className="mt-0.5">This Month</Caption>
              {/* Simple visual bar: capped at 160h (full-time month) */}
              <View className="mt-2 h-1.5 rounded-full bg-light-border-light dark:bg-dark-border-light overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min((timesheet.monthly.totalHours / 160) * 100, 100)}%`,
                    backgroundColor: primaryColor,
                  }}
                />
              </View>
              <Caption color="secondary" className="text-[10px] mt-1">
                {Math.round((timesheet.monthly.totalHours / 160) * 100)}% of 160h
              </Caption>
            </View>

            {/* Monthly earnings */}
            <View className="flex-1 bg-light-background-secondary dark:bg-dark-background-secondary rounded-xl p-3">
              <View className="flex-row items-end gap-1">
                <H3 style={{ color: '#10B981' }}>£{timesheet.monthly.totalEarnings.toFixed(0)}</H3>
              </View>
              <Caption color="secondary" className="mt-0.5">Est. Earnings</Caption>
              {/* Weekly progress within monthly earnings */}
              <View className="mt-2 h-1.5 rounded-full bg-light-border-light dark:bg-dark-border-light overflow-hidden">
                <View
                  className="h-full rounded-full bg-emerald-500"
                  style={{
                    width: timesheet.monthly.totalEarnings > 0
                      ? `${Math.min((timesheet.summary.totalEarnings / timesheet.monthly.totalEarnings) * 100, 100)}%`
                      : '0%',
                  }}
                />
              </View>
              <Caption color="secondary" className="text-[10px] mt-1">This week's share</Caption>
            </View>
          </View>
        </View>
      )}

      {/* Day-by-day entries */}
      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={primaryColor}
            colors={[primaryColor]}
          />
        }
      >
        {timesheet?.days.map(renderDay)}
        <View className="h-6" />
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    padding: 20,
    backgroundColor: colors.background.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  weekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  weekText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  weekArrow: {
    fontSize: 10,
    color: colors.text.secondary,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: colors.primary.navy,
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.inverse,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.text.inverse,
    opacity: 0.8,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  dayInfo: {
    width: 60,
  },
  day: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  date: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  timeInfo: {
    flex: 1,
    paddingHorizontal: 16,
  },
  timeLabel: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  timeValue: {
    fontWeight: '500',
    color: colors.text.primary,
  },
  hoursInfo: {
    alignItems: 'flex-end',
    gap: 6,
  },
  hours: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary.navy,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusApproved: {
    backgroundColor: colors.status.success,
  },
  statusPending: {
    backgroundColor: colors.status.warning,
  },
  statusUpcoming: {
    backgroundColor: colors.border.light,
  },
});

export default TimesheetScreen;

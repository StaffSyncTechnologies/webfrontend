import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrgTheme, useTheme, useToast } from '../../../contexts';
import { H2, H3, Body, Caption, Card, Badge, PaginatedCardList, FilterOption } from '../../../components/ui';
import { useGetTimesheetStatsQuery, useGetTimesheetListQuery, useApproveAttendanceMutation, useFlagAttendanceMutation, Attendance, TimesheetStats } from '../../../store/slices/adminSlices/attendanceSlice';
import { useAppSelector } from '../../../store/hooks';
import { useNavigation } from '@react-navigation/native';

// ─── Types ─────────────────────────────────────────────────────────────────

type Timesheet = Attendance;

// ─── Helpers ───────────────────────────────────────────────────────────────

const formatDate = (iso: string) => {
  try { return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
};

const formatTime = (iso: string) => {
  try { return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); }
  catch { return iso; }
};

const STATUS_FILTERS: FilterOption[] = [
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Flagged', value: 'FLAGGED' },
  { label: 'Rejected', value: 'REJECTED' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

const getStatusVariant = (status: string) => {
  const map: Record<string, string> = {
    APPROVED: 'success', PENDING: 'warning', FLAGGED: 'error',
    REJECTED: 'error',
  };
  return map[status] ?? 'default';
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    APPROVED: 'Approved', PENDING: 'Pending', FLAGGED: 'Flagged',
    REJECTED: 'Rejected',
  };
  return map[status] ?? status;
};

const getProgressColor = (pct: number, primaryColor: string) => {
  if (pct === 100) return '#10B981';
  if (pct >= 60)  return primaryColor;
  return '#F59E0B';
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// ─── Screen ────────────────────────────────────────────────────────────────

export function TimesheetScreen() {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const navigation = useNavigation();
  const adminRole = useAppSelector((state) => state.auth.admin?.role);
  const { showToast } = useToast();

  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } =
    useGetTimesheetStatsQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: listData, isLoading: listLoading, isError: listError, refetch: refetchList } =
    useGetTimesheetListQuery({ page: 1, limit: 100 }, { refetchOnMountOrArgChange: true });

  const [approveAttendance] = useApproveAttendanceMutation();
  const [flagAttendance] = useFlagAttendanceMutation();

  const stats: TimesheetStats = statsData ?? { total: { count: 0, change: 0 }, approved: { count: 0, change: 0 }, pending: { count: 0, change: 0 }, flagged: { count: 0, change: 0 }, rejected: { count: 0, change: 0 } };
  const timesheets: Timesheet[] = listData?.timesheets ?? [];

  console.log('Timesheet Stats:', stats);
  console.log('Timesheet Data:', timesheets);

  const handleApproveTimesheet = async (timesheet: Timesheet) => {
    try {
      await approveAttendance(timesheet.id).unwrap();
      showToast('Timesheet approved', 'success');
      refetchList();
      refetchStats();
    } catch (e: any) {
      showToast(e?.data?.message ?? 'Failed to approve timesheet', 'error');
    }
  };

  const handleFlagTimesheet = async (timesheet: Timesheet) => {
    try {
      await flagAttendance({ attendanceId: timesheet.id, reason: 'Flagged for review' }).unwrap();
      showToast('Timesheet flagged', 'success');
      refetchList();
      refetchStats();
    } catch (e: any) {
      showToast(e?.data?.message ?? 'Failed to flag timesheet', 'error');
    }
  };

  // ── Timesheet card renderer ─────────────────────────────────────────────
  const renderTimesheet = (timesheet: Timesheet) => {
    const isPending = timesheet.status === 'PENDING';
    const workerName = timesheet.worker?.fullName || 'Unknown Worker';
    const shiftName = timesheet.shiftTitle || (timesheet as any).shift?.title || (timesheet as any).shift?.name || 'Shift';
    const client = timesheet.client?.companyName || 'Unknown Client';
    const date = timesheet.date ? formatDate(timesheet.date) : (timesheet.clockInAt ? formatDate(timesheet.clockInAt) : '—');
    const clockIn = timesheet.clockInAt ? formatTime(timesheet.clockInAt) : '—';
    const clockOut = timesheet.clockOutAt ? formatTime(timesheet.clockOutAt) : '—';
    const hours = timesheet.durationHours ?? 0;

    return (
      <Card className="p-4">
        {/* ── Header row ── */}
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1 pr-3">
            <Body className="font-outfit-semibold text-sm mb-0.5" numberOfLines={1}>
              {shiftName}
            </Body>
            <View className="flex-row items-center gap-1.5 flex-wrap">
              <View
                className="flex-row items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6' }}
              >
                <Ionicons name="person-outline" size={10} color="#9CA3AF" />
                <Caption className="text-[10px]" color="secondary">{workerName}</Caption>
              </View>
              <View
                className="flex-row items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6' }}
              >
                <Ionicons name="business-outline" size={10} color="#9CA3AF" />
                <Caption className="text-[10px]" color="secondary">{client}</Caption>
              </View>
            </View>
          </View>
          <Badge variant={getStatusVariant(timesheet.status) as any} className="text-[10px] shrink-0">
            {getStatusLabel(timesheet.status)}
          </Badge>
        </View>

        {/* ── Date / time strip ── */}
        <View
          className="flex-row items-center gap-3 px-3 py-2 rounded-xl mb-3"
          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }}
        >
          <View className="flex-row items-center gap-1.5 flex-1">
            <Ionicons name="calendar-outline" size={13} color="#9CA3AF" />
            <Caption color="secondary" className="text-xs">{date}</Caption>
          </View>
          <View className="w-px h-3" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }} />
          <View className="flex-row items-center gap-1.5 flex-1">
            <Ionicons name="time-outline" size={13} color="#9CA3AF" />
            <Caption color="secondary" className="text-xs">{hours} hrs</Caption>
          </View>
        </View>

        {/* ── Clock in/out ── */}
        <View className="mb-3">
          <View className="flex-row items-center justify-between mb-1.5">
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="log-in-outline" size={13} color="#9CA3AF" />
              <Caption color="secondary" className="text-xs">
                Clock In{' '}
                <Caption className="font-outfit-semibold text-xs" color="primary">
                  {clockIn}
                </Caption>
              </Caption>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="log-out-outline" size={13} color="#9CA3AF" />
              <Caption color="secondary" className="text-xs">
                Clock Out{' '}
                <Caption className="font-outfit-semibold text-xs" color="primary">
                  {clockOut}
                </Caption>
              </Caption>
            </View>
          </View>
        </View>

        {/* ── Actions ── */}
        <View className="flex-row gap-2 flex-wrap pt-3 border-t border-light-border-light dark:border-dark-border-light">
          {/* View */}
          <TouchableOpacity
            onPress={() => navigation.navigate('AdminTimesheetDetail' as any, { attendanceId: timesheet.id } as any)}
            className="flex-row items-center justify-center px-3 py-2 rounded-lg bg-light-background-secondary dark:bg-dark-background-secondary gap-1.5"
          >
            <Ionicons name="eye-outline" size={14} color={isDark ? '#FFF' : '#374151'} />
            <Body className="text-xs">View</Body>
          </TouchableOpacity>

          {/* Approve — pending only */}
          {isPending && (
            <TouchableOpacity
              onPress={() => handleApproveTimesheet(timesheet)}
              className="flex-row items-center justify-center px-3 py-2 rounded-lg gap-1.5"
              style={{ backgroundColor: primaryColor }}
            >
              <Ionicons name="checkmark-outline" size={14} color="#FFF" />
              <Body className="text-xs text-white font-outfit-medium">Approve</Body>
            </TouchableOpacity>
          )}

          {/* Flag — pending only */}
          {isPending && (
            <TouchableOpacity
              onPress={() => handleFlagTimesheet(timesheet)}
              className="flex-row items-center justify-center px-3 py-2 rounded-lg bg-light-background-secondary dark:bg-dark-background-secondary gap-1.5"
            >
              <Ionicons name="flag-outline" size={14} color="#EF4444" />
              <Body className="text-xs" style={{ color: '#EF4444' }}>Flag</Body>
            </TouchableOpacity>
          )}

          {/* More */}
          <TouchableOpacity className="w-8 h-8 items-center justify-center rounded-lg bg-light-background-secondary dark:bg-dark-background-secondary">
            <Ionicons name="ellipsis-horizontal" size={14} color={isDark ? '#FFF' : '#374151'} />
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <View
      className="flex-1 bg-light-background-primary dark:bg-dark-background-primary"
      style={{ paddingTop: insets.top }}
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <View className="px-5 pt-2 pb-4">
        <View className="flex-row items-center">
          {adminRole !== 'COMPLIANCE_OFFICER' && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-light-background-secondary dark:bg-dark-background-secondary"
            >
              <Ionicons name="chevron-back" size={20} color={isDark ? '#FFF' : '#374151'} />
            </TouchableOpacity>
          )}
          <View>
            <H2>Timesheet</H2>
            <Caption color="secondary">Review attendance, approve hours, and resolve exceptions</Caption>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* ── Stat Cards ─────────────────────────────────────────────── */}
        <View className="px-5 mb-6">
          {/* Hero card — total timesheets */}
          <Card className="p-5 mb-3" style={{ backgroundColor: primaryColor }}>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Caption className="text-white/70 text-xs mb-1">Total Timesheets (Last 30 Days)</Caption>
                <View className="flex-row items-end gap-2">
                  <H2 className="text-white text-4xl font-outfit-bold">{stats.total.count}</H2>
                </View>
                {/* Approved vs pending mini-bar */}
                <View className="mt-3">
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Caption className="text-white/70 text-[10px]">
                      {stats.approved.count} approved · {stats.pending.count} pending
                    </Caption>
                    <Caption className="text-white/70 text-[10px]">
                      {stats.total.count > 0 ? Math.round((stats.approved.count / stats.total.count) * 100) : 0}%
                    </Caption>
                  </View>
                  <View className="h-1.5 rounded-full bg-white/20">
                    <View
                      className="h-1.5 rounded-full bg-white"
                      style={{ width: `${stats.total.count > 0 ? Math.round((stats.approved.count / stats.total.count) * 100) : 0}%` }}
                    />
                  </View>
                </View>
              </View>
              <View
                className="w-14 h-14 rounded-2xl items-center justify-center ml-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
              >
                <Ionicons name="document-text" size={26} color="#FFF" />
              </View>
            </View>
          </Card>

          {/* Three small stat cards */}
          <View className="flex-row gap-3">
            {[
              { icon: 'checkmark-circle', iconColor: '#10B981', bg: '#D1FAE5', count: stats.approved.count, label: 'Approved\nTimesheets'  },
              { icon: 'time',             iconColor: '#3B82F6', bg: '#DBEAFE', count: stats.pending.count,   label: 'Pending\nTimesheets'   },
              { icon: 'flag',             iconColor: '#EF4444', bg: '#FFE4E6', count: stats.flagged.count, label: 'Flagged\nTimesheets' },
            ].map((s, i) => (
              <Card key={i} className="flex-1 p-4">
                <View
                  className="w-9 h-9 rounded-xl items-center justify-center mb-3"
                  style={{ backgroundColor: s.bg }}
                >
                  <Ionicons name={s.icon as any} size={18} color={s.iconColor} />
                </View>
                <H3 className="text-xl font-outfit-bold mb-0.5">{s.count}</H3>
                <Caption color="secondary" className="text-xs leading-tight">{s.label}</Caption>
              </Card>
            ))}
          </View>
        </View>

        {/* ── PaginatedCardList ───────────────────────────────────────── */}
        {listLoading ? (
          <View className="items-center justify-center py-16 px-5 gap-3">
            <ActivityIndicator size="large" color={primaryColor} />
            <Caption color="secondary" className="text-xs">Loading timesheets…</Caption>
          </View>
        ) : listError ? (
          <View className="items-center justify-center py-16 px-5 gap-3">
            <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
            <Body className="font-outfit-semibold text-sm">Failed to load timesheets</Body>
            <TouchableOpacity
              onPress={() => refetchList()}
              className="px-5 py-3 rounded-xl flex-row items-center gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              <Ionicons name="refresh-outline" size={16} color="#FFF" />
              <Body className="text-white font-outfit-semibold text-sm">Retry</Body>
            </TouchableOpacity>
          </View>
        ) : (
          <PaginatedCardList<Timesheet>
            data={timesheets}
            defaultPageSize={3}
            pageSizeOptions={[3, 5, 7]}
            renderItem={renderTimesheet}
            searchKeys={['worker.fullName', 'shiftTitle', 'client.companyName']}
            searchPlaceholder="Search timesheets, workers or clients..."
            filterOptions={STATUS_FILTERS}
            filterKey="status"
            sectionLabel="Timesheets"
            emptyTitle="No timesheets found"
            emptySubtitle="Try a different search term or filter"
            className="px-5 mb-6"
          />
        )}

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}

export default TimesheetScreen;

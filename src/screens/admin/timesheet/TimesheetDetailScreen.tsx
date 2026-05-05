import React from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../../../types/navigation';
import { useOrgTheme, useTheme, useToast } from '../../../contexts';
import { H2, H3, Body, Caption, Card, Badge } from '../../../components/ui';
import {
  useGetTimesheetDetailQuery,
  useApproveAttendanceMutation,
  useFlagAttendanceMutation,
} from '../../../store/slices/adminSlices/attendanceSlice';

// ─── Helpers ───────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; variant: string }> = {
  APPROVED: { label: 'Approved',  bg: '#D1FAE5', text: '#065F46', variant: 'success' },
  PENDING:  { label: 'Pending',   bg: '#FEF3C7', text: '#92400E', variant: 'warning' },
  FLAGGED:  { label: 'Flagged',   bg: '#FEE2E2', text: '#991B1B', variant: 'error'   },
};

// ─── Screen ────────────────────────────────────────────────────────────────

export function AdminTimesheetDetailScreen({
  route,
  navigation,
}: RootStackScreenProps<'AdminTimesheetDetail'>) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const { attendanceId } = route.params;

  const { data, isLoading, isError, refetch } = useGetTimesheetDetailQuery(attendanceId);
  const [approveAttendance, { isLoading: approving }] = useApproveAttendanceMutation();
  const [flagAttendance, { isLoading: flagging }] = useFlagAttendanceMutation();

  const statusCfg = STATUS_CONFIG[data?.status] ?? STATUS_CONFIG.PENDING;

  const handleApprove = async () => {
    try {
      await approveAttendance(attendanceId).unwrap();
      showToast('Timesheet approved', 'success');
      refetch();
    } catch (e: any) {
      showToast(e?.data?.message ?? 'Failed to approve', 'error');
    }
  };

  const handleFlag = async () => {
    try {
      await flagAttendance({ attendanceId, reason: 'Flagged for review' }).unwrap();
      showToast('Timesheet flagged', 'success');
      refetch();
    } catch (e: any) {
      showToast(e?.data?.message ?? 'Failed to flag', 'error');
    }
  };

  // ── Loading / Error states ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary items-center justify-center" style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary items-center justify-center gap-4" style={{ paddingTop: insets.top }}>
        <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
        <Body className="font-outfit-semibold">Failed to load timesheet</Body>
        <TouchableOpacity onPress={refetch} className="px-5 py-3 rounded-xl" style={{ backgroundColor: primaryColor }}>
          <Body className="text-white font-outfit-semibold">Retry</Body>
        </TouchableOpacity>
      </View>
    );
  }

  const { worker, shift, attendance, totalHours, breakDuration, status, flagReason, flagNote, geofenceValid, locationVerified, activityLog } = data;

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <View className="px-5 pt-2 pb-4 flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full items-center justify-center bg-light-background-secondary dark:bg-dark-background-secondary"
        >
          <Ionicons name="chevron-back" size={20} color={isDark ? '#FFF' : '#374151'} />
        </TouchableOpacity>
        <View className="flex-1">
          <H2>Timesheet Detail</H2>
          <Caption color="secondary">{shift?.title ?? 'Shift Record'}</Caption>
        </View>
        <View className="px-3 py-1.5 rounded-full" style={{ backgroundColor: statusCfg.bg }}>
          <Caption className="text-xs font-outfit-semibold" style={{ color: statusCfg.text }}>
            {statusCfg.label}
          </Caption>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 gap-4 pb-10">

          {/* ── Worker ─────────────────────────────────────────────── */}
          <Card className="p-4">
            <Caption color="secondary" className="text-xs font-outfit-semibold uppercase tracking-wide mb-3">Worker</Caption>
            <View className="flex-row items-center gap-3">
              <View
                className="w-11 h-11 rounded-full items-center justify-center"
                style={{ backgroundColor: primaryColor + '22' }}
              >
                <Body className="font-outfit-bold text-base" style={{ color: primaryColor }}>
                  {(worker?.fullName ?? 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                </Body>
              </View>
              <View className="flex-1">
                <Body className="font-outfit-semibold">{worker?.fullName ?? '—'}</Body>
                <Caption color="secondary">{worker?.email ?? '—'}</Caption>
                {worker?.phone && <Caption color="secondary">{worker.phone}</Caption>}
              </View>
            </View>
          </Card>

          {/* ── Shift Info ─────────────────────────────────────────── */}
          <Card className="p-4">
            <Caption color="secondary" className="text-xs font-outfit-semibold uppercase tracking-wide mb-3">Shift</Caption>
            <View className="gap-2.5">
              <View className="flex-row items-start gap-2">
                <Ionicons name="briefcase-outline" size={15} color="#9CA3AF" style={{ marginTop: 2 }} />
                <View className="flex-1">
                  <Caption color="secondary" className="text-[10px]">Position</Caption>
                  <Body className="text-sm font-outfit-medium">{shift?.title ?? '—'}</Body>
                </View>
              </View>
              <View className="flex-row items-start gap-2">
                <Ionicons name="business-outline" size={15} color="#9CA3AF" style={{ marginTop: 2 }} />
                <View className="flex-1">
                  <Caption color="secondary" className="text-[10px]">Client</Caption>
                  <Body className="text-sm font-outfit-medium">{shift?.client?.name ?? '—'}</Body>
                </View>
              </View>
              <View className="flex-row items-start gap-2">
                <Ionicons name="calendar-outline" size={15} color="#9CA3AF" style={{ marginTop: 2 }} />
                <View className="flex-1">
                  <Caption color="secondary" className="text-[10px]">Scheduled</Caption>
                  <Body className="text-sm font-outfit-medium">
                    {shift?.scheduledStart ? formatDateTime(shift.scheduledStart) : '—'} → {shift?.scheduledEnd ? formatTime(shift.scheduledEnd) : '—'}
                  </Body>
                </View>
              </View>
            </View>
          </Card>

          {/* ── Hours Summary ──────────────────────────────────────── */}
          <View className="flex-row gap-3">
            {[
              { label: 'Hours Worked', value: `${totalHours ?? 0}h`, icon: 'time-outline', color: '#3B82F6' },
              { label: 'Break',        value: `${breakDuration ?? 0}m`, icon: 'cafe-outline', color: '#10B981' },
              { label: 'Location',     value: locationVerified ?? '—', icon: geofenceValid ? 'shield-checkmark' : 'alert-circle', color: geofenceValid ? '#10B981' : '#F59E0B' },
            ].map((item, i) => (
              <Card key={i} className="flex-1 p-3 items-center gap-1">
                <Ionicons name={item.icon as any} size={18} color={item.color} />
                <Body className="text-sm font-outfit-bold text-center" numberOfLines={1}>{item.value}</Body>
                <Caption color="secondary" className="text-[10px] text-center">{item.label}</Caption>
              </Card>
            ))}
          </View>

          {/* ── Clock In / Out ─────────────────────────────────────── */}
          <Card className="p-4">
            <Caption color="secondary" className="text-xs font-outfit-semibold uppercase tracking-wide mb-3">Attendance</Caption>
            <View className="gap-3">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                  <Ionicons name="log-in-outline" size={16} color="#065F46" />
                </View>
                <View>
                  <Caption color="secondary" className="text-[10px]">Clock In</Caption>
                  <Body className="text-sm font-outfit-semibold">
                    {attendance?.clockInAt ? formatDateTime(attendance.clockInAt) : '—'}
                  </Body>
                </View>
              </View>
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
                  <Ionicons name="log-out-outline" size={16} color="#991B1B" />
                </View>
                <View>
                  <Caption color="secondary" className="text-[10px]">Clock Out</Caption>
                  <Body className="text-sm font-outfit-semibold">
                    {attendance?.clockOutAt ? formatDateTime(attendance.clockOutAt) : 'Still clocked in'}
                  </Body>
                </View>
              </View>
            </View>
          </Card>

          {/* ── Flag Info (if flagged) ─────────────────────────────── */}
          {(status === 'FLAGGED' && (flagReason || flagNote)) && (
            <Card className="p-4 border border-red-200">
              <View className="flex-row items-center gap-2 mb-2">
                <Ionicons name="flag" size={15} color="#EF4444" />
                <Caption className="text-xs font-outfit-semibold text-red-500 uppercase tracking-wide">Flag Reason</Caption>
              </View>
              <Body className="text-sm">{flagReason ?? ''}</Body>
              {flagNote && <Caption color="secondary" className="mt-1">{flagNote}</Caption>}
            </Card>
          )}

          {/* ── Activity Log ───────────────────────────────────────── */}
          {activityLog?.length > 0 && (
            <Card className="p-4">
              <Caption color="secondary" className="text-xs font-outfit-semibold uppercase tracking-wide mb-3">Activity Log</Caption>
              <View className="gap-3">
                {activityLog.map((entry: any, i: number) => (
                  <View key={i} className="flex-row gap-3">
                    <View className="items-center">
                      <View className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: primaryColor }} />
                      {i < activityLog.length - 1 && (
                        <View className="w-px flex-1 mt-1" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }} />
                      )}
                    </View>
                    <View className="flex-1 pb-2">
                      <Body className="text-sm font-outfit-semibold">{entry.action}</Body>
                      {entry.details && <Caption color="secondary">{entry.details}</Caption>}
                      <Caption color="secondary" className="text-[10px] mt-0.5">
                        {entry.time ? formatDateTime(entry.time) : ''}
                      </Caption>
                    </View>
                  </View>
                ))}
              </View>
            </Card>
          )}

          {/* ── Actions ────────────────────────────────────────────── */}
          {status === 'PENDING' && (
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleApprove}
                disabled={approving}
                className="flex-1 flex-row items-center justify-center py-3.5 rounded-xl gap-2"
                style={{ backgroundColor: primaryColor, opacity: approving ? 0.7 : 1 }}
              >
                {approving
                  ? <ActivityIndicator size="small" color="#FFF" />
                  : <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />}
                <Body className="text-white font-outfit-semibold">Approve</Body>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleFlag}
                disabled={flagging}
                className="flex-1 flex-row items-center justify-center py-3.5 rounded-xl gap-2 bg-light-background-secondary dark:bg-dark-background-secondary"
                style={{ opacity: flagging ? 0.7 : 1 }}
              >
                {flagging
                  ? <ActivityIndicator size="small" color="#EF4444" />
                  : <Ionicons name="flag-outline" size={18} color="#EF4444" />}
                <Body className="font-outfit-semibold" style={{ color: '#EF4444' }}>Flag</Body>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </ScrollView>
    </View>
  );
}

export default AdminTimesheetDetailScreen;

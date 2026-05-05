import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOrgTheme, useTheme, useToast } from '../../../contexts';
import { H2, H3, Body, Caption, Card, Badge, PaginatedCardList, FilterOption } from '../../../components/ui';
import {
  useListSchedulesQuery,
  useListScheduleRequestsQuery,
  usePauseScheduleMutation,
  useResumeScheduleMutation,
  useEndScheduleMutation,
  useDeleteScheduleMutation,
  useApproveScheduleRequestMutation,
  useRejectScheduleRequestMutation,
  AdminSchedule,
  AdminScheduleRequest,
} from '../../../store/api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../types/navigation';

// ─── Helpers ───────────────────────────────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const formatDate = (d: string) => {
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2,'0')} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
};

const formatShortDate = (d: string) => {
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2,'0')} ${MONTHS[dt.getMonth()]}`;
};

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const DAY_LABELS: Record<string, string> = {
  MON: 'Mo', TUE: 'Tu', WED: 'We', THU: 'Th', FRI: 'Fr', SAT: 'Sa', SUN: 'Su',
};
const ALL_DAYS = ['MON','TUE','WED','THU','FRI','SAT','SUN'];

const getStatusVariant = (status: string) => {
  const map: Record<string, string> = {
    ACTIVE: 'success', PAUSED: 'default', ENDED: 'error',
    PENDING_APPROVAL: 'warning', PENDING: 'warning', APPROVED: 'success', REJECTED: 'error',
  };
  return (map[status] ?? 'default') as any;
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    ACTIVE: 'Active', PAUSED: 'Paused', ENDED: 'Ended',
    PENDING_APPROVAL: 'Pending', PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Rejected',
  };
  return map[status] ?? status;
};

// ─── Status filter options ──────────────────────────────────────────────────

const SCHEDULE_FILTERS: FilterOption[] = [
  { label: 'Active',  value: 'ACTIVE'  },
  { label: 'Paused',  value: 'PAUSED'  },
  { label: 'Ended',   value: 'ENDED'   },
];

// ─── Icon action button ─────────────────────────────────────────────────────

function IconBtn({
  icon, color, bg, onPress,
}: { icon: string; color: string; bg: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-8 h-8 rounded-lg items-center justify-center"
      style={{ backgroundColor: bg }}
    >
      <Ionicons name={icon as any} size={15} color={color} />
    </TouchableOpacity>
  );
}

// ─── Empty state ────────────────────────────────────────────────────────────

function EmptyState({ icon, label }: { icon: string; label: string }) {
  const { isDark } = useTheme();
  return (
    <View className="items-center justify-center py-16 gap-3">
      <View
        className="w-16 h-16 rounded-2xl items-center justify-center"
        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6' }}
      >
        <Ionicons name={icon as any} size={30} color="#9CA3AF" />
      </View>
      <Caption color="secondary" className="text-sm">{label}</Caption>
    </View>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────

export function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const toast = useToast();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [activeTab,      setActiveTab]      = useState<'schedules' | 'requests'>('schedules');

  // ── API ────────────────────────────────────────────────────────────────
  const { data: schedulesData, isLoading: schedulesLoading, refetch: refetchSchedules } =
    useListSchedulesQuery({});
  const { data: requestsData,  isLoading: requestsLoading,  refetch: refetchRequests  } =
    useListScheduleRequestsQuery({ status: 'PENDING' });

  console.log('ScheduleScreen - schedulesData:', schedulesData);
  console.log('ScheduleScreen - requestsData:', requestsData);

  const [pauseSchedule]   = usePauseScheduleMutation();
  const [resumeSchedule]  = useResumeScheduleMutation();
  const [endSchedule]     = useEndScheduleMutation();
  const [deleteSchedule]  = useDeleteScheduleMutation();
  const [approveRequest]  = useApproveScheduleRequestMutation();
  const [rejectRequest]   = useRejectScheduleRequestMutation();

  // ── Data transform ────────────────────────────────────────────────────
  const schedules = schedulesData?.data?.schedules?.map((s: AdminSchedule) => {
    const totalMins = s.days?.reduce((sum, d) => {
      const [sh, sm] = d.startTime.split(':').map(Number);
      const [eh, em] = d.endTime.split(':').map(Number);
      return sum + Math.max(0, (eh * 60 + em) - (sh * 60 + sm) - (d.breakMinutes || 0));
    }, 0) ?? 0;

    return {
      id:           s.id,
      client:       s.clientCompany?.name || 'Unknown',
      workerName:   s.worker.fullName,
      workerEmail:  s.worker.email,
      role:         s.role || 'N/A',
      status:       s.status,
      title:        s.title,
      startDate:    s.startDate ? formatDate(s.startDate) : '—',
      days:         s.days?.map(d => d.dayOfWeek) || [],
      weeklyHours:  (totalMins / 60).toFixed(1),
      isOnHoliday:  s.isOnHoliday || false,
      holidayTitle: s.holidayInfo?.title || '',
      holidayDates: s.holidayInfo
        ? `${formatShortDate(s.holidayInfo.startDate)} – ${formatDate(s.holidayInfo.endDate)}`
        : '',
    };
  }) ?? [];

  const requests = requestsData?.data?.requests?.map((r: AdminScheduleRequest) => ({
    id:                r.id,
    workerName:        r.worker.fullName,
    requestType:       r.requestType === 'NEW' ? 'New Schedule' : 'Schedule Change',
    status:            r.status,
    proposedDays:      r.proposedDays?.map((d: any) => d.dayOfWeek) || [],
    startTime:         r.proposedDays?.[0]?.startTime || '—',
    endTime:           r.proposedDays?.[0]?.endTime   || '—',
    proposedStartDate: r.proposedStartDate ? formatDate(r.proposedStartDate) : '—',
    workerNote:        r.workerNote || '',
  })) ?? [];

  const pendingCount = requestsData?.data?.pagination?.total ?? 0;

  // ── Handlers ──────────────────────────────────────────────────────────
  const confirm = (title: string, message: string, onConfirm: () => Promise<void>) =>
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: title.split(' ')[0], style: 'destructive', onPress: onConfirm },
    ]);

  const handlePause = (s: any) =>
    confirm('Pause Schedule', `Pause "${s.title}"?`, async () => {
      try   { await pauseSchedule({ id: s.id, reason: '' }).unwrap(); toast.success('Schedule paused'); refetchSchedules(); }
      catch { toast.error('Failed to pause schedule'); }
    });

  const handleResume = async (s: any) => {
    try   { await resumeSchedule(s.id).unwrap(); toast.success('Schedule resumed'); refetchSchedules(); }
    catch { toast.error('Failed to resume schedule'); }
  };

  const handleEnd = (s: any) =>
    confirm('End Schedule', `End "${s.title}"?`, async () => {
      try   { await endSchedule({ id: s.id, endDate: new Date().toISOString().split('T')[0], reason: '' }).unwrap(); toast.success('Schedule ended'); refetchSchedules(); }
      catch { toast.error('Failed to end schedule'); }
    });

  const handleDelete = (s: any) =>
    confirm('Delete Schedule', `Delete "${s.title}"? This cannot be undone.`, async () => {
      try   { await deleteSchedule(s.id).unwrap(); toast.success('Schedule deleted'); refetchSchedules(); }
      catch { toast.error('Failed to delete schedule'); }
    });

  const handleApprove = async (r: any) => {
    try   { await approveRequest({ requestId: r.id, note: '' }).unwrap(); toast.success('Request approved'); refetchRequests(); refetchSchedules(); }
    catch { toast.error('Failed to approve request'); }
  };

  const handleReject = (r: any) =>
    confirm('Reject Request', 'Reject this schedule request?', async () => {
      try   { await rejectRequest({ requestId: r.id, note: '' }).unwrap(); toast.success('Request rejected'); refetchRequests(); }
      catch { toast.error('Failed to reject request'); }
    });

  // ── Schedule card renderer ────────────────────────────────────────────
  const renderSchedule = (schedule: typeof schedules[0]) => (
    <Card key={schedule.id} className="p-4">
      {/* Top: avatar + worker info + badge */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center gap-3 flex-1 pr-3">
          <View
            className="w-10 h-10 rounded-full items-center justify-center shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            <Body className="text-white font-outfit-bold text-xs">
              {getInitials(schedule.workerName)}
            </Body>
          </View>
          <View className="flex-1">
            <Body className="font-outfit-semibold text-sm" numberOfLines={1}>
              {schedule.workerName}
            </Body>
            <Caption color="secondary" className="text-[10px]" numberOfLines={1}>
              {schedule.workerEmail}
            </Caption>
            <View
              className="flex-row items-center gap-1 px-2 py-0.5 rounded-full self-start mt-0.5"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6' }}
            >
              <Caption className="text-[10px]" color="secondary">{schedule.role}</Caption>
            </View>
          </View>
        </View>
        <Badge variant={getStatusVariant(schedule.status)} className="text-[10px] shrink-0">
          {getStatusLabel(schedule.status)}
        </Badge>
      </View>

      {/* Holiday banner */}
      {schedule.isOnHoliday && (
        <View
          className="flex-row items-center gap-2 px-3 py-2 rounded-xl mb-3 border"
          style={{
            backgroundColor: isDark ? 'rgba(217,119,6,0.12)' : '#FFFBEB',
            borderColor:     isDark ? 'rgba(217,119,6,0.3)'  : '#FDE68A',
          }}
        >
          <Body className="text-sm">🏖️</Body>
          <View className="flex-1">
            <Caption className="text-xs font-outfit-semibold" style={{ color: '#D97706' }}>
              On Holiday: {schedule.holidayTitle}
            </Caption>
            <Caption className="text-[10px]" style={{ color: '#D97706' }}>
              {schedule.holidayDates}
            </Caption>
          </View>
        </View>
      )}

      {/* Schedule title + start date */}
      <View
        className="px-3 py-2.5 rounded-xl mb-3"
        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }}
      >
        <Body className="font-outfit-semibold text-sm mb-0.5">{schedule.title}</Body>
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="calendar-outline" size={11} color="#9CA3AF" />
          <Caption color="secondary" className="text-xs">From {schedule.startDate}</Caption>
        </View>
      </View>

      {/* Day chips */}
      <View className="flex-row gap-1.5 mb-3">
        {ALL_DAYS.map(day => {
          const active = schedule.days.includes(day);
          return (
            <View
              key={day}
              className="flex-1 h-7 rounded-lg items-center justify-center"
              style={{ backgroundColor: active ? primaryColor : (isDark ? '#374151' : '#F1F5F9') }}
            >
              <Body
                className="text-[9px] font-outfit-semibold"
                style={{ color: active ? '#FFF' : (isDark ? '#6B7280' : '#94A3B8') }}
              >
                {DAY_LABELS[day]}
              </Body>
            </View>
          );
        })}
      </View>

      {/* Footer: hours + actions */}
      <View className="flex-row items-center justify-between pt-3 border-t border-light-border-light dark:border-dark-border-light">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="time-outline" size={13} color="#9CA3AF" />
          <Caption color="secondary" className="text-xs">
            <Caption className="font-outfit-bold text-xs" color="primary">
              {schedule.weeklyHours}h
            </Caption>
            {' '}/week
          </Caption>
        </View>
        <View className="flex-row gap-2">
          {schedule.status === 'ACTIVE' && (
            <>
              <IconBtn icon="pause-outline"   color={isDark ? '#FFF' : '#374151'} bg={isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6'} onPress={() => handlePause(schedule)} />
              <IconBtn icon="stop-outline"    color="#EF4444"                     bg={isDark ? 'rgba(239,68,68,0.12)' : '#FFE4E6'}  onPress={() => handleEnd(schedule)} />
              <IconBtn icon="trash-outline"   color="#EF4444"                     bg={isDark ? 'rgba(239,68,68,0.12)' : '#FFE4E6'}  onPress={() => handleDelete(schedule)} />
            </>
          )}
          {schedule.status === 'PAUSED' && (
            <>
              <IconBtn icon="play-outline"    color="#10B981"                     bg={isDark ? 'rgba(16,185,129,0.12)' : '#D1FAE5'} onPress={() => handleResume(schedule)} />
              <IconBtn icon="trash-outline"   color="#EF4444"                     bg={isDark ? 'rgba(239,68,68,0.12)'  : '#FFE4E6'} onPress={() => handleDelete(schedule)} />
            </>
          )}
        </View>
      </View>
    </Card>
  );

  // ── Request card renderer ─────────────────────────────────────────────
  const renderRequest = (request: typeof requests[0]) => (
    <Card key={request.id} className="p-4">
      {/* Top: avatar + worker + badge */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center gap-3 flex-1 pr-3">
          <View
            className="w-10 h-10 rounded-full items-center justify-center shrink-0"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : '#EDE9FE' }}
          >
            <Body className="text-xs font-outfit-bold" style={{ color: isDark ? '#FFF' : '#7C3AED' }}>
              {getInitials(request.workerName)}
            </Body>
          </View>
          <View>
            <Body className="font-outfit-semibold text-sm">{request.workerName}</Body>
            <View
              className="px-2 py-0.5 rounded-full self-start mt-0.5"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6' }}
            >
              <Caption color="secondary" className="text-[10px]">{request.requestType}</Caption>
            </View>
          </View>
        </View>
        <Badge variant={getStatusVariant(request.status)} className="text-[10px] shrink-0">
          {getStatusLabel(request.status)}
        </Badge>
      </View>

      {/* Worker note */}
      {!!request.workerNote && (
        <View
          className="flex-row items-start gap-2 px-3 py-2.5 rounded-xl mb-3"
          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }}
        >
          <Ionicons name="chatbubble-outline" size={13} color="#9CA3AF" style={{ marginTop: 1 }} />
          <Caption color="secondary" className="text-xs italic flex-1">
            "{request.workerNote}"
          </Caption>
        </View>
      )}

      {/* Proposed schedule details */}
      <View
        className="px-3 py-2.5 rounded-xl mb-3"
        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }}
      >
        {/* Day chips */}
        <View className="flex-row gap-1 mb-2">
          {ALL_DAYS.map(day => {
            const active = request.proposedDays.includes(day);
            return (
              <View
                key={day}
                className="flex-1 h-6 rounded-md items-center justify-center"
                style={{ backgroundColor: active ? primaryColor : (isDark ? '#374151' : '#E5E7EB') }}
              >
                <Body
                  className="text-[9px] font-outfit-semibold"
                  style={{ color: active ? '#FFF' : (isDark ? '#6B7280' : '#9CA3AF') }}
                >
                  {DAY_LABELS[day]}
                </Body>
              </View>
            );
          })}
        </View>
        <View className="flex-row gap-3">
          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={11} color="#9CA3AF" />
            <Caption color="secondary" className="text-[10px]">
              {request.startTime} – {request.endTime}
            </Caption>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="calendar-outline" size={11} color="#9CA3AF" />
            <Caption color="secondary" className="text-[10px]">
              From {request.proposedStartDate}
            </Caption>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row gap-2 pt-3 border-t border-light-border-light dark:border-dark-border-light">
        <TouchableOpacity
          onPress={() => handleReject(request)}
          className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl"
          style={{ backgroundColor: isDark ? 'rgba(239,68,68,0.12)' : '#FFE4E6' }}
        >
          <Ionicons name="close-outline" size={15} color="#EF4444" />
          <Body className="text-xs font-outfit-semibold" style={{ color: '#EF4444' }}>Reject</Body>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleApprove(request)}
          className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl"
          style={{ backgroundColor: primaryColor }}
        >
          <Ionicons name="checkmark-outline" size={15} color="#FFF" />
          <Body className="text-xs font-outfit-semibold text-white">Approve</Body>
        </TouchableOpacity>
      </View>
    </Card>
  );

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <View
      className="flex-1 bg-light-background-primary dark:bg-dark-background-primary"
      style={{ paddingTop: insets.top }}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
        <View>
          <H2>Schedules</H2>
          <Caption color="secondary">Permanent worker schedules</Caption>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => navigation.navigate('RotaBuilder' as any)}
            className="flex-row items-center gap-2 px-4 py-3 rounded-xl"
            style={{ backgroundColor: isDark ? '#374151' : '#E5E7EB' }}
          >
            <Ionicons name="grid-outline" size={16} color={isDark ? '#fff' : '#374151'} />
            <Body className="font-outfit-semibold text-sm" style={{ color: isDark ? '#fff' : '#374151' }}>Rota</Body>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('AssignSchedule')}
            className="flex-row items-center gap-2 px-4 py-3 rounded-xl"
            style={{ backgroundColor: primaryColor }}
          >
            <Ionicons name="add" size={16} color="#FFF" />
            <Body className="text-white font-outfit-semibold text-sm">Assign</Body>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* ── Summary stat cards ──────────────────────────────────── */}
        <View className="px-5 mb-5">
          <View className="flex-row gap-3">
            {[
              { icon: 'calendar',          bg: '#DBEAFE', color: '#2563EB', label: 'Total',   value: schedules.length                                   },
              { icon: 'checkmark-circle',  bg: '#D1FAE5', color: '#10B981', label: 'Active',  value: schedules.filter(s => s.status === 'ACTIVE').length  },
              { icon: 'pause-circle',      bg: '#FEF3C7', color: '#F59E0B', label: 'Paused',  value: schedules.filter(s => s.status === 'PAUSED').length  },
              { icon: 'alert-circle',      bg: '#FFE4E6', color: '#EF4444', label: 'Requests',value: pendingCount                                          },
            ].map((s, i) => (
              <Card key={i} className="flex-1 p-3">
                <View
                  className="w-8 h-8 rounded-lg items-center justify-center mb-2"
                  style={{ backgroundColor: s.bg }}
                >
                  <Ionicons name={s.icon as any} size={16} color={s.color} />
                </View>
                <H3 className="text-lg font-outfit-bold mb-0.5">{s.value}</H3>
                <Caption color="secondary" className="text-[10px]">{s.label}</Caption>
              </Card>
            ))}
          </View>
        </View>

        {/* ── Tabs ────────────────────────────────────────────────── */}
        <View className="px-5 mb-4">
          <View className="flex-row border-b border-light-border-light dark:border-dark-border-light">
            {([
              { id: 'schedules', label: 'All Schedules' },
              { id: 'requests',  label: 'Worker Requests', badge: pendingCount },
            ] as const).map(tab => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                className="flex-1 py-3 items-center relative"
                style={{
                  borderBottomWidth: activeTab === tab.id ? 2 : 0,
                  borderBottomColor: primaryColor,
                }}
              >
                <View className="flex-row items-center gap-2">
                  <Body
                    className="font-outfit-semibold text-sm"
                    style={{ color: activeTab === tab.id ? primaryColor : (isDark ? '#9CA3AF' : '#6B7280') }}
                  >
                    {tab.label}
                  </Body>
                  {'badge' in tab && tab.badge > 0 && (
                    <View
                      className="w-5 h-5 rounded-full items-center justify-center"
                      style={{ backgroundColor: '#EF4444' }}
                    >
                      <Caption className="text-[9px] text-white font-outfit-bold">{tab.badge}</Caption>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Schedules tab ───────────────────────────────────────── */}
        {activeTab === 'schedules' && (
          schedulesLoading ? (
            <View className="items-center justify-center py-16">
              <ActivityIndicator size="large" color={primaryColor} />
              <Caption color="secondary" className="mt-3 text-xs">Loading schedules…</Caption>
            </View>
          ) : (
            <PaginatedCardList
              data={schedules}
              defaultPageSize={5}
              pageSizeOptions={[5, 10, 20]}
              renderItem={renderSchedule}
              searchKeys={['workerName', 'workerEmail', 'title', 'client', 'role']}
              searchPlaceholder="Search by worker, client or title…"
              filterOptions={SCHEDULE_FILTERS}
              filterKey="status"
              sectionLabel="Schedules"
              emptyTitle="No schedules found"
              emptySubtitle="Try a different search or filter"
              className="px-5 mb-6"
            />
          )
        )}

        {/* ── Requests tab ────────────────────────────────────────── */}
        {activeTab === 'requests' && (
          requestsLoading ? (
            <View className="items-center justify-center py-16">
              <ActivityIndicator size="large" color={primaryColor} />
              <Caption color="secondary" className="mt-3 text-xs">Loading requests…</Caption>
            </View>
          ) : (
            <PaginatedCardList
              data={requests}
              defaultPageSize={5}
              pageSizeOptions={[5, 10]}
              renderItem={renderRequest}
              searchKeys={['workerName', 'requestType']}
              searchPlaceholder="Search by worker name…"
              sectionLabel="Requests"
              emptyTitle="No pending requests"
              emptySubtitle="All worker requests have been reviewed"
              className="px-5 mb-6"
            />
          )
        )}

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}

export default ScheduleScreen;
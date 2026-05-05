import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useOrgTheme, useTheme, useToast } from '../../../contexts';
import { H2, H3, Body, Caption, Card, Badge, Input, PaginatedCardList } from '../../../components/ui';
import AssignWorkersModal from './AssignWorkersModal';
import {
  useGetShiftByIdQuery,
  useGetShiftAssignmentsQuery,
  useBroadcastShiftMutation,
  useCancelShiftMutation,
  useAssignWorkersMutation,
} from '../../../store/slices/adminSlices/shiftSlice';


// ─── Types ─────────────────────────────────────────────────────────────────

interface AssignedWorker {
  id: string;
  name: string;
  clockIn: string;
  clockOut: string;
  status: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const getShiftStatusVariant = (status: string) => {
  const map: Record<string, string> = {
    OPEN: 'info', FILLED: 'success', IN_PROGRESS: 'warning',
    COMPLETED: 'success', CANCELLED: 'error',
  };
  return (map[status] ?? 'default') as any;
};

const getShiftStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    OPEN: 'Open', FILLED: 'Filled', IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed', CANCELLED: 'Cancelled',
  };
  return map[status] ?? status;
};

const getWorkerStatusVariant = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'assigned' || s === 'accepted') return 'success';
  if (s === 'declined' || s === 'cancelled') return 'error';
  return 'default';
};

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

// ─── Info Row ──────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  const { isDark } = useTheme();
  return (
    <View className="flex-row items-start gap-3 py-3 border-b border-light-border-light dark:border-dark-border-light last:border-0">
      <View
        className="w-8 h-8 rounded-lg items-center justify-center mt-0.5"
        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6' }}
      >
        <Ionicons name={icon as any} size={15} color="#9CA3AF" />
      </View>
      <View className="flex-1">
        <Caption color="secondary" className="text-[10px] mb-0.5">{label}</Caption>
        <Body className="font-outfit-semibold text-sm">{value || '—'}</Body>
      </View>
    </View>
  );
}

// ─── Action Button ─────────────────────────────────────────────────────────

function ActionBtn({
  icon, label, onPress, variant = 'default', disabled, loading,
}: {
  icon: string; label: string; onPress: () => void;
  variant?: 'default' | 'primary' | 'danger'; disabled?: boolean; loading?: boolean;
}) {
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();

  const bgMap = {
    default: isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6',
    primary: primaryColor,
    danger:  isDark ? 'rgba(239,68,68,0.15)'   : '#FFE4E6',
  };
  const colorMap = {
    default: isDark ? '#FFFFFF' : '#374151',
    primary: '#FFFFFF',
    danger:  '#EF4444',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className="flex-1 flex-row items-center justify-center gap-1.5 py-3 rounded-xl"
      style={{ backgroundColor: bgMap[variant], opacity: disabled ? 0.5 : 1 }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colorMap[variant]} />
      ) : (
        <Ionicons name={icon as any} size={16} color={colorMap[variant]} />
      )}
      <Body className="text-xs font-outfit-medium" style={{ color: colorMap[variant] }}>
        {label}
      </Body>
    </TouchableOpacity>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────

export function ShiftDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const navigation = useNavigation();
  const routeParams = useRoute();
  const toast = useToast();

  const shiftId = (routeParams.params as any)?.shiftId;

  // ── API ────────────────────────────────────────────────────────────────
  const { data: shiftData, isLoading: shiftLoading, refetch: refetchShift } =
    useGetShiftByIdQuery(shiftId || '', { skip: !shiftId });
  const { data: assignmentsData, isLoading: assignmentsLoading, refetch: refetchAssignments } =
    useGetShiftAssignmentsQuery(shiftId || '', { skip: !shiftId });
  const [broadcastShift, { isLoading: broadcastLoading }] = useBroadcastShiftMutation();
  const [cancelShift,   { isLoading: cancelLoading }]    = useCancelShiftMutation();
  const [assignWorkers, { isLoading: assignLoading }]    = useAssignWorkersMutation();

  const [showAssignModal, setShowAssignModal] = useState(false);

  // ── Data transform ────────────────────────────────────────────────────
  const shiftApiData       = (shiftData as any)?.data;
  const assignmentsApiData = (assignmentsData as any)?.data;

  const shift = shiftApiData ? {
    id:              shiftApiData.id,
    title:           shiftApiData.title,
    client:          shiftApiData.clientCompany?.name || shiftApiData.client?.name || 'Unknown',
    location:        shiftApiData.siteLocation || shiftApiData.location || 'Unknown',
    date:            shiftApiData.startAt
      ? new Date(shiftApiData.startAt).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })
      : '',
    time:            shiftApiData.startAt && shiftApiData.endAt
      ? `${new Date(shiftApiData.startAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} - ${new Date(shiftApiData.endAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
      : '',
    dateCreated:     shiftApiData.createdAt
      ? new Date(shiftApiData.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '',
    workersNeeded:   shiftApiData.workersNeeded || 0,
    workersAssigned: Array.isArray(assignmentsApiData) ? assignmentsApiData.length : 0,
    hourlyRate:      shiftApiData.payRate || shiftApiData.hourlyRate
      ? `£${shiftApiData.payRate || shiftApiData.hourlyRate}/hr`
      : 'N/A',
    status:          shiftApiData.status,
    skills:          shiftApiData.requiredSkills?.map((rs: any) => rs.skill?.name || rs.skillId) || [],
    notes:           shiftApiData.notes || '',
  } : null;

  const assignedWorkers: AssignedWorker[] = Array.isArray(assignmentsApiData)
    ? assignmentsApiData.map((a: any) => ({
        id:       a.id,
        name:     a.worker?.fullName || a.worker?.name || 'Unknown',
        clockIn:  a.clockInAt  ? new Date(a.clockInAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—',
        clockOut: a.clockOutAt ? new Date(a.clockOutAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—',
        status:   a.status || 'Not Started',
      }))
    : [];

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleAssignWorkers = async (selectedWorkerIds: string[]) => {
    if (!shiftId || selectedWorkerIds.length === 0) return;
    if (isFull) {
      toast.error('Shift is already full. Cannot assign more workers.');
      return;
    }
    try {
      await assignWorkers({ shiftId, workerIds: selectedWorkerIds }).unwrap();
      toast.success('Workers assigned successfully');
      refetchAssignments(); refetchShift();
      setShowAssignModal(false);
    } catch { toast.error('Failed to assign workers'); }
  };

  const handleBroadcast = async () => {
    if (!shiftId) return;
    try {
      await broadcastShift(shiftId).unwrap();
      toast.success('Shift broadcasted successfully');
      refetchShift();
    } catch { toast.error('Failed to broadcast shift'); }
  };

  const handleCancel = async () => {
    if (!shiftId) return;
    try {
      await cancelShift(shiftId).unwrap();
      toast.success('Shift cancelled');
      navigation.goBack();
    } catch (error: any) {
      console.error('Cancel shift error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to cancel shift';
      toast.error(errorMessage);
    }
  };

  // ── Worker row renderer ────────────────────────────────────────────────
  const renderWorkerRow = (worker: AssignedWorker) => (
    <View
      className="flex-row items-center gap-3 p-3 rounded-xl mb-2"
      style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F9FAFB' }}
    >
      {/* Avatar */}
      <View
        className="w-9 h-9 rounded-full items-center justify-center shrink-0"
        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : '#E5E7EB' }}
      >
        <Body className="text-xs font-outfit-bold" style={{ color: isDark ? '#FFF' : '#374151' }}>
          {getInitials(worker.name)}
        </Body>
      </View>

      {/* Name */}
      <Body className="flex-1 font-outfit-semibold text-sm" numberOfLines={1}>
        {worker.name}
      </Body>

      {/* Clock in / out */}
      <View className="items-center">
        <Caption color="secondary" className="text-[9px] mb-0.5">In</Caption>
        <Body className="text-xs font-outfit-medium">{worker.clockIn}</Body>
      </View>
      <View
        className="w-px h-5"
        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : '#E5E7EB' }}
      />
      <View className="items-center">
        <Caption color="secondary" className="text-[9px] mb-0.5">Out</Caption>
        <Body className="text-xs font-outfit-medium">{worker.clockOut}</Body>
      </View>

      {/* Status badge */}
      <Badge variant={getWorkerStatusVariant(worker.status) as any} className="text-[10px]">
        {worker.status}
      </Badge>

      {/* Actions */}
      <View className="flex-row gap-2">
        <TouchableOpacity
          className="w-7 h-7 rounded-lg items-center justify-center"
          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' }}
        >
          <Ionicons name="eye-outline" size={14} color={isDark ? '#FFF' : '#374151'} />
        </TouchableOpacity>
        <TouchableOpacity
          className="w-7 h-7 rounded-lg items-center justify-center"
          style={{ backgroundColor: isDark ? 'rgba(239,68,68,0.15)' : '#FFE4E6' }}
        >
          <Ionicons name="person-remove-outline" size={14} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── Loading / not found ────────────────────────────────────────────────
  if (shiftLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-light-background-primary dark:bg-dark-background-primary">
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  if (!shift) {
    return (
      <View className="flex-1 items-center justify-center bg-light-background-primary dark:bg-dark-background-primary px-8">
        <View
          className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6' }}
        >
          <Ionicons name="alert-circle-outline" size={32} color="#9CA3AF" />
        </View>
        <Body className="font-outfit-semibold text-base mb-1">Shift not found</Body>
        <Caption color="secondary" className="text-center text-xs">
          This shift may have been removed or you don't have access.
        </Caption>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-5 px-6 py-3 rounded-xl"
          style={{ backgroundColor: primaryColor }}
        >
          <Body className="text-white font-outfit-semibold text-sm">Go back</Body>
        </TouchableOpacity>
      </View>
    );
  }

  const fillPct    = Math.round((shift.workersAssigned / Math.max(shift.workersNeeded, 1)) * 100);
  const fillColor  = fillPct === 100 ? '#10B981' : fillPct >= 60 ? primaryColor : '#F59E0B';
  const isOpen     = shift.status === 'OPEN';
  const isDraft    = shift.status === 'DRAFT';
  const isFull     = shift.workersAssigned >= shift.workersNeeded;

  return (
    <View
      className="flex-1 bg-light-background-primary dark:bg-dark-background-primary"
      style={{ paddingTop: insets.top }}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <View className="flex-row items-center gap-3 px-5 py-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full items-center justify-center bg-light-background-secondary dark:bg-dark-background-secondary"
        >
          <Ionicons name="arrow-back" size={20} color={isDark ? '#FFF' : '#000035'} />
        </TouchableOpacity>
        <View className="flex-1">
          <H3>Shift Details</H3>
          <Caption color="secondary" className="text-xs" numberOfLines={1}>{shift.title}</Caption>
        </View>
        <Badge variant={getShiftStatusVariant(shift.status)} className="text-[10px]">
          {getShiftStatusLabel(shift.status)}
        </Badge>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* ── Hero card ───────────────────────────────────────────── */}
        <View className="px-5 mb-5">
          <Card className="p-5" style={{ backgroundColor: primaryColor }}>
            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-1 pr-4">
                <Caption className="text-white/70 text-[10px] mb-1 uppercase tracking-wide">Shift Title</Caption>
                <Body className="text-white font-outfit-bold text-base mb-2" numberOfLines={2}>
                  {shift.title}
                </Body>
                <View className="flex-row items-center gap-1.5">
                  <Ionicons name="business-outline" size={12} color="rgba(255,255,255,0.7)" />
                  <Caption className="text-white/70 text-xs">{shift.client}</Caption>
                </View>
                <View className="flex-row items-center gap-1.5 mt-1">
                  <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.7)" />
                  <Caption className="text-white/70 text-xs">{shift.location}</Caption>
                </View>
              </View>
              <View
                className="w-14 h-14 rounded-2xl items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
              >
                <Ionicons name="calendar" size={26} color="#FFF" />
              </View>
            </View>

            {/* Worker fill progress */}
            <View>
              <View className="flex-row items-center justify-between mb-1.5">
                <Caption className="text-white/70 text-xs">
                  Workers filled: {shift.workersAssigned}/{shift.workersNeeded}
                </Caption>
                <Caption className="text-white/85 text-xs font-outfit-semibold">{fillPct}%</Caption>
              </View>
              <View className="h-1.5 rounded-full bg-white/20">
                <View
                  className="h-1.5 rounded-full bg-white"
                  style={{ width: `${fillPct}%` }}
                />
              </View>
            </View>
          </Card>
        </View>

        {/* ── Quick action buttons ─────────────────────────────────── */}
        <View className="px-5 mb-5">
          <View className="flex-row gap-2 mb-2">
            <ActionBtn icon="create-outline"       label="Edit"       onPress={() => {}} />
            <ActionBtn icon="copy-outline"         label="Duplicate"  onPress={() => {}} />
            <ActionBtn
              icon="megaphone-outline"
              label={broadcastLoading ? 'Sending…' : 'Broadcast'}
              onPress={handleBroadcast}
              variant="primary"
              loading={broadcastLoading}
            />
          </View>
          <View className="flex-row gap-2">
            {(isOpen || isDraft) && !isFull && (
              <ActionBtn
                icon="person-add-outline"
                label="Assign Workers"
                onPress={() => setShowAssignModal(true)}
              />
            )}
            <ActionBtn
              icon="close-circle-outline"
              label={cancelLoading ? 'Cancelling…' : 'Cancel Shift'}
              onPress={handleCancel}
              variant="danger"
              loading={cancelLoading}
            />
          </View>
        </View>

        {/* ── Shift details card ───────────────────────────────────── */}
        <View className="px-5 mb-5">
          <Body className="font-outfit-semibold text-sm mb-3">Shift Details</Body>
          <Card className="p-4">
            <InfoRow icon="calendar-outline"  label="Date"               value={shift.date} />
            <InfoRow icon="time-outline"      label="Time"               value={shift.time} />
            <InfoRow icon="business-outline"  label="Client"             value={shift.client} />
            <InfoRow icon="location-outline"  label="Location"           value={shift.location} />
            <InfoRow icon="cash-outline"      label="Pay Rate"           value={shift.hourlyRate} />
            <InfoRow icon="document-text-outline" label="Date Created"   value={shift.dateCreated} />
            {shift.skills.length > 0 && (
              <View className="flex-row items-start gap-3 pt-3">
                <View
                  className="w-8 h-8 rounded-lg items-center justify-center mt-0.5"
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6' }}
                >
                  <Ionicons name="ribbon-outline" size={15} color="#9CA3AF" />
                </View>
                <View className="flex-1">
                  <Caption color="secondary" className="text-[10px] mb-1.5">Skills Required</Caption>
                  <View className="flex-row flex-wrap gap-1.5">
                    {shift.skills.map((skill: string, i: number) => (
                      <View
                        key={i}
                        className="px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#EDE9FE' }}
                      >
                        <Caption className="text-[10px] font-outfit-medium" style={{ color: isDark ? '#C4B5FD' : '#7C3AED' }}>
                          {skill}
                        </Caption>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}
            {shift.notes && (
              <View className="flex-row items-start gap-3 pt-3">
                <View
                  className="w-8 h-8 rounded-lg items-center justify-center mt-0.5"
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6' }}
                >
                  <Ionicons name="chatbox-outline" size={15} color="#9CA3AF" />
                </View>
                <View className="flex-1">
                  <Caption color="secondary" className="text-[10px] mb-0.5">Notes</Caption>
                  <Body className="text-sm" style={{ color: isDark ? '#D1D5DB' : '#374151' }}>
                    {shift.notes}
                  </Body>
                </View>
              </View>
            )}
          </Card>
        </View>

        {/* ── Staffing summary ─────────────────────────────────────── */}
        <View className="px-5 mb-5">
          <Body className="font-outfit-semibold text-sm mb-3">Staffing Summary</Body>
          <View className="flex-row gap-3 mb-4">
            {[
              { label: 'Needed',    value: shift.workersNeeded,                         icon: 'people',            bg: '#DBEAFE', color: '#2563EB' },
              { label: 'Assigned',  value: shift.workersAssigned,                       icon: 'checkmark-circle',  bg: '#D1FAE5', color: '#10B981' },
              { label: 'Unfilled',  value: shift.workersNeeded - shift.workersAssigned, icon: 'alert-circle',      bg: '#FFE4E6', color: '#EF4444' },
            ].map((s, i) => (
              <Card key={i} className="flex-1 p-3">
                <View
                  className="w-8 h-8 rounded-lg items-center justify-center mb-2"
                  style={{ backgroundColor: s.bg }}
                >
                  <Ionicons name={s.icon as any} size={16} color={s.color} />
                </View>
                <Body className="text-xl font-outfit-bold" style={{ color: s.color }}>{s.value}</Body>
                <Caption color="secondary" className="text-[10px]">{s.label}</Caption>
              </Card>
            ))}
          </View>

          {/* Fill progress */}
          <Card className="p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Caption color="secondary" className="text-xs">Fill rate</Caption>
              <Caption className="text-xs font-outfit-semibold" style={{ color: fillColor }}>
                {fillPct}%
              </Caption>
            </View>
            <View
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB' }}
            >
              <View
                className="h-full rounded-full"
                style={{ width: `${fillPct}%`, backgroundColor: fillColor }}
              />
            </View>
            {isOpen && (
              <TouchableOpacity
                onPress={handleBroadcast}
                disabled={broadcastLoading}
                className="flex-row items-center justify-center gap-2 py-3 rounded-xl mt-4"
                style={{ backgroundColor: primaryColor }}
              >
                {broadcastLoading
                  ? <ActivityIndicator size="small" color="#FFF" />
                  : <Ionicons name="megaphone-outline" size={18} color="#FFF" />
                }
                <Body className="text-white font-outfit-semibold text-sm">
                  {broadcastLoading ? 'Broadcasting…' : 'Broadcast shift to network'}
                </Body>
              </TouchableOpacity>
            )}
          </Card>
        </View>

        {/* ── Assigned workers ─────────────────────────────────────── */}
        <View className="px-5 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Body className="font-outfit-semibold text-sm">
              Assigned Workers{' '}
              <Caption color="secondary">{assignedWorkers.length}</Caption>
            </Body>
            {(isOpen || isDraft) && !isFull && (
              <TouchableOpacity
                onPress={() => setShowAssignModal(true)}
                className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6' }}
              >
                <Ionicons name="person-add-outline" size={14} color={primaryColor} />
                <Body className="text-xs font-outfit-medium" style={{ color: primaryColor }}>
                  Assign
                </Body>
              </TouchableOpacity>
            )}
          </View>

          <PaginatedCardList<AssignedWorker>
            data={assignedWorkers}
            renderItem={renderWorkerRow}
            defaultPageSize={5}
            pageSizeOptions={[5, 10, 20]}
            searchKeys={['name', 'status']}
            searchPlaceholder="Search workers..."
            sectionLabel="Workers"
            emptyTitle="No workers assigned"
            emptySubtitle="Assign workers to this shift using the button above"
          />
        </View>

        <View className="h-24" />
      </ScrollView>

      <AssignWorkersModal
        visible={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onAssign={handleAssignWorkers}
        shiftTitle={shift?.title || ''}
        alreadyAssigned={assignedWorkers.map(w => w.id)}
      />
    </View>
  );
}

export default ShiftDetailsScreen;

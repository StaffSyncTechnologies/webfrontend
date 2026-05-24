import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOrgTheme, useTheme, useToast } from '../../../contexts';
import { H2, H3, Body, Caption, Card, Badge, PaginatedCardList, FilterOption } from '../../../components/ui';
import { CreateShiftModal } from './CreateShiftModal';
import { useGetShiftsQuery, useCreateShiftMutation, useUpdateShiftMutation, useBroadcastShiftMutation } from '../../../store/api/shiftsApi';

// ─── Types ─────────────────────────────────────────────────────────────────

interface Shift {
  id: string;
  title: string;
  client: string;
  location: string;
  date: string;
  time: string;
  workers: number;
  workersNeeded: number;
  status: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const STATUS_FILTERS: FilterOption[] = [
  { label: 'Open',        value: 'OPEN'        },
  { label: 'Filled',      value: 'FILLED'      },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed',   value: 'COMPLETED'   },
  { label: 'Cancelled',   value: 'CANCELLED'   },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

const getStatusVariant = (status: string) => {
  const map: Record<string, string> = {
    OPEN: 'info', FILLED: 'success', IN_PROGRESS: 'warning',
    COMPLETED: 'success', CANCELLED: 'error',
  };
  return map[status] ?? 'default';
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    OPEN: 'Open', FILLED: 'Filled', IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed', CANCELLED: 'Cancelled',
  };
  return map[status] ?? status;
};

const getProgressColor = (pct: number, primaryColor: string) => {
  if (pct === 100) return '#10B981';
  if (pct >= 60)  return primaryColor;
  return '#F59E0B';
};

// ─── Screen ────────────────────────────────────────────────────────────────

export function ShiftsScreen() {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const toast = useToast();
  const navigation = useNavigation();

  const [showShiftModal, setShowShiftModal] = useState(false);
  const [modalMode, setModalMode]           = useState<'create' | 'edit'>('create');
  const [selectedShift, setSelectedShift]   = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState('');

  // API hooks
  const { data: shiftsData, isLoading: shiftsLoading, refetch: refetchShifts } = useGetShiftsQuery({});
  const [createShift, { isLoading: createLoading }] = useCreateShiftMutation();
  const [updateShift, { isLoading: updateLoading }] = useUpdateShiftMutation();
  const { data: filteredShiftsData, isLoading, refetch } = useGetShiftsQuery({ status: selectedStatus });
  const [broadcastShift] = useBroadcastShiftMutation();

  // Transform API data to UI format
  const shifts = useMemo(() => {
    if (!shiftsData?.data) return [];
    return shiftsData.data.map((apiShift: any) => ({
      id: apiShift.id,
      title: apiShift.title,
      client: apiShift.clientCompany?.name || 'Unknown',
      location: apiShift.siteLocation || apiShift.location || 'Unknown',
      date: apiShift.startAt?.split('T')[0] || '',
      time: `${apiShift.startAt?.split('T')[1]?.substring(0, 5) || ''} - ${apiShift.endAt?.split('T')[1]?.substring(0, 5) || ''}`,
      workers: apiShift._count?.assignments || 0,
      workersNeeded: apiShift.workersNeeded || 0,
      status: apiShift.status,
      // Store original data for editing
      _original: apiShift,
    }));
  }, [shiftsData]);

  // Calculate stats from real data
  const stats = useMemo(() => {
    const totalShifts = shifts.length;
    const openShifts = shifts.filter((s: Shift) => s.status === 'OPEN').length;
    const filledShifts = shifts.filter((s: Shift) => s.status === 'FILLED').length;
    const urgentShifts = shifts.filter((s: Shift) => s.status === 'OPEN' && (s.workersNeeded - s.workers) <= 2).length;
    return { totalShifts, openShifts, filledShifts, urgentShifts };
  }, [shifts]);

  const handleEditShift = (shift: any) => {
    setSelectedShift(shift);
    setModalMode('edit');
    setShowShiftModal(true);
  };

  const handleViewShift = (shift: Shift) => {
    // @ts-ignore
    navigation.navigate('AdminShiftDetailsScreen', { shiftId: shift.id });
  };

  const handleDuplicateShift = (shift: Shift) => {
    setSelectedShift(shift);
    setModalMode('create');
    setShowShiftModal(true);
  };

  const handleBroadcastShift = async (shift: Shift) => {
    try {
      await broadcastShift(shift.id).unwrap();
      toast.success('Shift broadcasted successfully');
    } catch (error) {
      console.error('Failed to broadcast shift:', error);
      toast.error('Failed to broadcast shift');
    }
  };

  const handleCreateShift = async (data: any) => {
    try {
      await createShift(data).unwrap();
      toast.success('Shift created successfully');
      setShowShiftModal(false);
      refetchShifts();
      refetch();
    } catch (error) {
      console.error('Failed to create shift:', error);
      toast.error('Failed to create shift');
    }
  };

  const handleUpdateShift = async (data: any) => {
    if (!selectedShift?.id) return;
    try {
      console.log('ShiftsScreen - handleUpdateShift - data:', data);
      await updateShift({ shiftId: selectedShift.id, updates: data }).unwrap();
      toast.success('Shift updated successfully');
      setShowShiftModal(false);
      setSelectedShift(null);
      setModalMode('create');
      refetchShifts();
      refetch();
    } catch (error: any) {
      console.error('Failed to update shift:', error);
      console.error('Error details:', error?.data?.details);
      toast.error('Failed to update shift');
    }
  };

  // ── Shift card renderer ───────────────────────────────────────────────
  const renderShift = (shift: Shift) => {
    const progress = shift.workersNeeded > 0 
      ? Math.round((shift.workers / shift.workersNeeded) * 100)
      : 0;
    const progressColor = getProgressColor(progress, primaryColor);
    const isOpen       = shift.status === 'OPEN';

    return (
      <Card className="p-4">
        {/* ── Header row ── */}
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1 pr-3">
            <Body className="font-outfit-semibold text-sm mb-0.5" numberOfLines={1}>
              {shift.title}
            </Body>
            <View className="flex-row items-center gap-1.5 flex-wrap">
              <View
                className="flex-row items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6' }}
              >
                <Ionicons name="business-outline" size={10} color="#9CA3AF" />
                <Caption className="text-[10px]" color="secondary">{shift.client}</Caption>
              </View>
              <View
                className="flex-row items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6' }}
              >
                <Ionicons name="location-outline" size={10} color="#9CA3AF" />
                <Caption className="text-[10px]" color="secondary">{shift.location}</Caption>
              </View>
            </View>
          </View>
          <Badge variant={getStatusVariant(shift.status) as any} className="text-[10px] shrink-0">
            {getStatusLabel(shift.status)}
          </Badge>
        </View>

        {/* ── Date / time strip ── */}
        <View
          className="flex-row items-center gap-3 px-3 py-2 rounded-xl mb-3"
          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }}
        >
          <View className="flex-row items-center gap-1.5 flex-1">
            <Ionicons name="calendar-outline" size={13} color="#9CA3AF" />
            <Caption color="secondary" className="text-xs">{shift.date}</Caption>
          </View>
          <View className="w-px h-3" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }} />
          <View className="flex-row items-center gap-1.5 flex-1">
            <Ionicons name="time-outline" size={13} color="#9CA3AF" />
            <Caption color="secondary" className="text-xs">{shift.time}</Caption>
          </View>
        </View>

        {/* ── Worker progress ── */}
        <View className="mb-3">
          <View className="flex-row items-center justify-between mb-1.5">
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="people-outline" size={13} color="#9CA3AF" />
              <Caption color="secondary" className="text-xs">
                Workers{' '}
                <Caption className="font-outfit-semibold text-xs" color="primary">
                  {shift.workers}/{shift.workersNeeded}
                </Caption>
              </Caption>
            </View>
            <Caption
              className="text-xs font-outfit-semibold"
              style={{ color: progressColor }}
            >
              {progress}%
            </Caption>
          </View>
          <View
            className="h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB' }}
          >
            <View
              className="h-full rounded-full"
              style={{ width: `${progress}%`, backgroundColor: progressColor }}
            />
          </View>
        </View>

        {/* ── Actions ── */}
        <View className="flex-row gap-2 flex-wrap pt-3 border-t border-light-border-light dark:border-dark-border-light">
          {/* View */}
          <TouchableOpacity
            onPress={() => handleViewShift(shift)}
            className="flex-row items-center justify-center px-3 py-2 rounded-lg bg-light-background-secondary dark:bg-dark-background-secondary gap-1.5"
          >
            <Ionicons name="eye-outline" size={14} color={isDark ? '#FFF' : '#374151'} />
            <Body className="text-xs">View</Body>
          </TouchableOpacity>

          {/* Edit */}
          <TouchableOpacity
            onPress={() => handleEditShift(shift)}
            className="flex-row items-center justify-center px-3 py-2 rounded-lg bg-light-background-secondary dark:bg-dark-background-secondary gap-1.5"
          >
            <Ionicons name="create-outline" size={14} color={isDark ? '#FFF' : '#374151'} />
            <Body className="text-xs">Edit</Body>
          </TouchableOpacity>

          {/* Duplicate */}
          <TouchableOpacity
            onPress={() => handleDuplicateShift(shift)}
            className="flex-row items-center justify-center px-3 py-2 rounded-lg bg-light-background-secondary dark:bg-dark-background-secondary gap-1.5"
          >
            <Ionicons name="copy-outline" size={14} color={isDark ? '#FFF' : '#374151'} />
            <Body className="text-xs">Duplicate</Body>
          </TouchableOpacity>

          {/* Broadcast — open shifts only */}
          {isOpen && (
            <TouchableOpacity
              onPress={() => handleBroadcastShift(shift)}
              className="flex-row items-center justify-center px-3 py-2 rounded-lg gap-1.5"
              style={{ backgroundColor: primaryColor }}
            >
              <Ionicons name="megaphone-outline" size={14} color="#FFF" />
              <Body className="text-xs text-white font-outfit-medium">Broadcast</Body>
            </TouchableOpacity>
          )}

          {/* Assign — open shifts only */}
          {isOpen && (
            <TouchableOpacity className="flex-row items-center justify-center px-3 py-2 rounded-lg bg-light-background-secondary dark:bg-dark-background-secondary gap-1.5">
              <Ionicons name="person-add-outline" size={14} color={isDark ? '#FFF' : '#374151'} />
              <Body className="text-xs">Assign</Body>
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
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
        <View>
          <H2>Shifts</H2>
          <Caption color="secondary">Manage shift schedules</Caption>
        </View>
        <TouchableOpacity
          className="flex-row items-center gap-2 px-4 py-3 rounded-xl"
          style={{ backgroundColor: primaryColor }}
          onPress={() => { setModalMode('create'); setShowShiftModal(true); }}
        >
          <Ionicons name="add" size={18} color="#FFF" />
          <Body className="text-white font-outfit-semibold text-sm">New Shift</Body>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* ── Stat Cards ─────────────────────────────────────────────── */}
        <View className="px-5 mb-6">
          {/* Hero card — total shifts */}
          <Card className="p-5 mb-3" style={{ backgroundColor: primaryColor }}>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Caption className="text-white/70 text-xs mb-1">Total Shifts This Week</Caption>
                <View className="flex-row items-end gap-2">
                  <H2 className="text-white text-4xl font-outfit-bold">{stats.totalShifts}</H2>
                </View>
                {/* Open vs filled mini-bar */}
                <View className="mt-3">
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Caption className="text-white/70 text-[10px]">
                      {stats.filledShifts} filled · {stats.openShifts} open
                    </Caption>
                    <Caption className="text-white/70 text-[10px]">
                      {Math.round((stats.filledShifts / stats.totalShifts) * 100)}%
                    </Caption>
                  </View>
                  <View className="h-1.5 rounded-full bg-white/20">
                    <View
                      className="h-1.5 rounded-full bg-white"
                      style={{ width: `${Math.round((stats.filledShifts / stats.totalShifts) * 100)}%` }}
                    />
                  </View>
                </View>
              </View>
              <View
                className="w-14 h-14 rounded-2xl items-center justify-center ml-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
              >
                <Ionicons name="calendar" size={26} color="#FFF" />
              </View>
            </View>
          </Card>

          {/* Three small stat cards */}
          <View className="flex-row gap-3">
            {[
              { icon: 'checkmark-circle', iconColor: '#10B981', bg: '#D1FAE5', count: stats.filledShifts, label: 'Filled\nShifts'  },
              { icon: 'time',             iconColor: '#3B82F6', bg: '#DBEAFE', count: stats.openShifts,   label: 'Open\nShifts'   },
              { icon: 'alert-circle',     iconColor: '#EF4444', bg: '#FFE4E6', count: stats.urgentShifts, label: 'Urgent\nShifts' },
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
        {shiftsLoading ? (
          <View className="flex-col items-center justify-center py-12">
            <ActivityIndicator size="large" color={primaryColor} />
            <Caption color="secondary" className="mt-3">Loading shifts...</Caption>
          </View>
        ) : (
          <PaginatedCardList<Shift>
            data={shifts}
            defaultPageSize={3}
            pageSizeOptions={[3, 5, 7]}
            renderItem={renderShift}
            searchKeys={['title', 'client', 'location', 'date']}
            searchPlaceholder="Search shifts, clients or locations..."
            filterOptions={STATUS_FILTERS}
            filterKey="status"
            sectionLabel="Shifts"
            emptyTitle="No shifts found"
            emptySubtitle="Try a different search term or filter"
            className="px-5 mb-6"
          />
        )}

        <View className="h-24" />
      </ScrollView>

      {/* ── Modal ──────────────────────────────────────────────────────── */}
      <CreateShiftModal
        visible={showShiftModal}
        onClose={() => { setShowShiftModal(false); setSelectedShift(null); setModalMode('create'); }}
        onSave={modalMode === 'create' ? handleCreateShift : handleUpdateShift}
        shiftData={selectedShift}
        mode={modalMode}
      />
    </View>
  );
}

export default ShiftsScreen;
import React, { useState, useCallback } from 'react';
import {
  View, ScrollView, TouchableOpacity, ActivityIndicator,
  Modal, Alert, RefreshControl, Dimensions, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrgTheme, useTheme, useToast } from '../../../contexts';
import { H2, H3, Body, Caption, Input } from '../../../components/ui';
import InviteWorkerModal from '../worker/InviteWorkerModal';
import {
  useGetWeekRotaQuery, useAssignWorkerMutation, useUnassignWorkerMutation,
  usePublishRotaMutation, useUnpublishRotaMutation,
  RotaWorker, RotaAssignment, ShiftType,
} from '../../../store/api/rotaApi';

// ─── Constants ───────────────────────────────────────────────────────────────

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CELL_W = 68;
const NAME_COL_W = 110;

const SHIFT_COLORS: Record<ShiftType, { bg: string; text: string; label: string; time: string }> = {
  morning:   { bg: '#3B82F6', text: '#fff', label: 'M', time: '6–14' },
  afternoon: { bg: '#F59E0B', text: '#fff', label: 'A', time: '14–22' },
  night:     { bg: '#8B5CF6', text: '#fff', label: 'N', time: '22–6' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function addDays(base: Date, n: number): Date {
  const d = new Date(base); d.setDate(d.getDate() + n); return d;
}

function getMondayOfWeek(ref: Date): Date {
  const d = new Date(ref); d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}

function isoDate(d: Date): string { return d.toISOString().split('T')[0]; }

function formatWeekLabel(monday: Date): string {
  const sunday = addDays(monday, 6);
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${fmt(monday)} – ${fmt(sunday)}`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface ShiftPillProps {
  type: ShiftType;
  onRemove: () => void;
  published: boolean;
}

const ShiftPill: React.FC<ShiftPillProps> = ({ type, onRemove, published }) => {
  const c = SHIFT_COLORS[type];
  return (
    <View style={{ backgroundColor: c.bg, borderRadius: 6, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 3, gap: 3 }}>
      <Body style={{ color: c.text, fontSize: 11, fontWeight: '700' }}>{c.label}</Body>
      {!published && (
        <TouchableOpacity onPress={onRemove} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
          <Ionicons name="close" size={10} color={c.text} />
        </TouchableOpacity>
      )}
    </View>
  );
};

interface CellProps {
  worker: RotaWorker;
  dayIdx: number;
  dayDate: string;
  rotaId: string;
  published: boolean;
  onAssign: (worker: RotaWorker, date: string, dayIdx: number) => void;
  onRemove: (worker: RotaWorker, assignment: RotaAssignment) => void;
}

const Cell: React.FC<CellProps> = ({ worker, dayIdx, dayDate, rotaId, published, onAssign, onRemove }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const isHoliday = worker.holidayDates.includes(dayDate);
  const isUnavailable = worker.unavailableDays.includes(dayIdx);
  const assignment = worker.assignments.find(a => a.date === dayDate);

  if (isHoliday) {
    return (
      <View style={{ width: CELL_W, height: 48, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#1f1a2e' : '#fef3c7', borderRadius: 6 }}>
        <Ionicons name="sunny" size={14} color="#F59E0B" />
        <Caption style={{ fontSize: 9, color: '#F59E0B' }}>Leave</Caption>
      </View>
    );
  }

  if (isUnavailable) {
    return (
      <View style={{ width: CELL_W, height: 48, backgroundColor: isDark ? '#1a1a2e' : '#f3f4f6', borderRadius: 6, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}>
        <Caption style={{ fontSize: 9, color: isDark ? '#6b7280' : '#9ca3af' }}>N/A</Caption>
      </View>
    );
  }

  if (assignment) {
    return (
      <View style={{ width: CELL_W, height: 48, justifyContent: 'center', alignItems: 'center' }}>
        <ShiftPill type={assignment.shiftType} published={published} onRemove={() => onRemove(worker, assignment)} />
      </View>
    );
  }

  if (published) {
    return <View style={{ width: CELL_W, height: 48 }} />;
  }

  return (
    <TouchableOpacity
      onPress={() => onAssign(worker, dayDate, dayIdx)}
      style={{ width: CELL_W, height: 48, borderRadius: 6, borderWidth: 1, borderStyle: 'dashed', borderColor: isDark ? '#374151' : '#d1d5db', justifyContent: 'center', alignItems: 'center' }}
    >
      <Ionicons name="add" size={16} color={isDark ? '#6b7280' : '#9ca3af'} />
    </TouchableOpacity>
  );
};

// ─── Shift picker modal ───────────────────────────────────────────────────────

interface ShiftPickerProps {
  visible: boolean;
  workerName: string;
  date: string;
  onPick: (type: ShiftType) => void;
  onClose: () => void;
}

const ShiftPicker: React.FC<ShiftPickerProps> = ({ visible, workerName, date, onPick, onClose }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const bg = isDark ? '#1f2937' : '#fff';

  const display = date ? new Date(date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : '';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }} onPress={onClose} activeOpacity={1}>
        <View style={{ backgroundColor: bg, borderRadius: 16, padding: 24, width: 280 }}>
          <H3 style={{ marginBottom: 4 }}>Assign Shift</H3>
          <Caption style={{ marginBottom: 20, color: '#6b7280' }}>{workerName} · {display}</Caption>
          {(Object.keys(SHIFT_COLORS) as ShiftType[]).map(type => {
            const c = SHIFT_COLORS[type];
            return (
              <TouchableOpacity
                key={type}
                onPress={() => onPick(type)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.bg, borderRadius: 10, padding: 14, marginBottom: 8 }}
              >
                <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}>
                  <Body style={{ color: c.text, fontWeight: '700', fontSize: 16 }}>{c.label}</Body>
                </View>
                <View>
                  <Body style={{ color: c.text, fontWeight: '600', textTransform: 'capitalize' }}>{type}</Body>
                  <Caption style={{ color: 'rgba(255,255,255,0.8)' }}>{c.time}</Caption>
                </View>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity onPress={onClose} style={{ marginTop: 8, alignItems: 'center' }}>
            <Body style={{ color: '#6b7280' }}>Cancel</Body>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

export const RotaBuilderScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { showToast } = useToast();

  const [currentMonday, setCurrentMonday] = useState<Date>(getMondayOfWeek(new Date()));
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerWorker, setPickerWorker] = useState<RotaWorker | null>(null);
  const [pickerDate, setPickerDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteModalVisible, setInviteModalVisible] = useState(false);

  const weekStart = isoDate(currentMonday);
  const { data, isLoading, isFetching, refetch } = useGetWeekRotaQuery({ weekStart });

  const [assignWorker] = useAssignWorkerMutation();
  const [unassignWorker] = useUnassignWorkerMutation();
  const [publishRota] = usePublishRotaMutation();
  const [unpublishRota] = useUnpublishRotaMutation();

  const rota = data?.rota;
  const workers = data?.workers ?? [];
  const stats = data?.stats;
  const published = rota?.status === 'PUBLISHED';

  // Filter workers by search query
  const filteredWorkers = workers.filter(w =>
    w.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const weekDates = Array.from({ length: 7 }, (_, i) => isoDate(addDays(currentMonday, i)));

  const navigateWeek = (dir: -1 | 1) => {
    setCurrentMonday(prev => addDays(prev, dir * 7));
  };

  const handleOpenPicker = useCallback((worker: RotaWorker, date: string) => {
    setPickerWorker(worker);
    setPickerDate(date);
    setPickerVisible(true);
  }, []);

  const handlePickShift = useCallback(async (shiftType: ShiftType) => {
    if (!rota || !pickerWorker) return;
    setPickerVisible(false);
    try {
      await assignWorker({ rotaId: rota.id, workerId: pickerWorker.id, date: pickerDate, shiftType }).unwrap();
    } catch (err: any) {
      const msg = err?.data?.message || 'Failed to assign shift';
      showToast(msg, 'error');
    }
  }, [rota, pickerWorker, pickerDate, assignWorker, showToast]);

  const handleRemoveShift = useCallback(async (worker: RotaWorker, assignment: RotaAssignment) => {
    if (!rota) return;
    try {
      await unassignWorker({ rotaId: rota.id, workerId: worker.id, rotaShiftId: assignment.rotaShiftId }).unwrap();
    } catch {
      showToast('Failed to remove shift', 'error');
    }
  }, [rota, unassignWorker, showToast]);

  const handlePublish = () => {
    if (!rota) return;
    const action = published ? 'unpublish' : 'publish';
    Alert.alert(
      published ? 'Unpublish Rota?' : 'Publish Rota?',
      published
        ? 'Workers will lose visibility of this schedule.'
        : `This will notify ${stats?.totalAssignments ?? 0} assigned worker(s).`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: published ? 'Unpublish' : 'Publish',
          style: published ? 'destructive' : 'default',
          onPress: async () => {
            try {
              if (published) await unpublishRota(rota.id).unwrap();
              else await publishRota(rota.id).unwrap();
              showToast(published ? 'Rota unpublished' : 'Rota published & workers notified', 'success');
            } catch {
              showToast('Action failed', 'error');
            }
          },
        },
      ]
    );
  };

  const cardBg = isDark ? '#1f2937' : '#ffffff';
  const borderColor = isDark ? '#374151' : '#e5e7eb';
  const textMuted = isDark ? '#9ca3af' : '#6b7280';

  // ── Replacement warnings ──────────────────────────────────────────────────
  const replacementWarnings = workers.filter(w =>
    w.holidayDates.some(hd => weekDates.includes(hd)) &&
    w.assignments.some(a => w.holidayDates.includes(a.date))
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: insets.top }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: isDark ? '#111827' : '#f9fafb' }}>
      {/* ── Header ── */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <H2>Rota Builder</H2>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => setInviteModalVisible(true)}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
              backgroundColor: isDark ? '#1f2937' : '#e5e7eb',
            }}
          >
            <Ionicons name="person-add-outline" size={15} color={isDark ? '#fff' : '#374151'} />
            <Body style={{ color: isDark ? '#fff' : '#374151', fontWeight: '600', fontSize: 13 }}>Add</Body>
          </TouchableOpacity>
          <TouchableOpacity
          onPress={handlePublish}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
            backgroundColor: published ? '#EF4444' : '#10B981',
          }}
        >
          <Ionicons name={published ? 'cloud-offline-outline' : 'cloud-upload-outline'} size={15} color="#fff" />
          <Body style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>{published ? 'Unpublish' : 'Publish'}</Body>
        </TouchableOpacity>
        </View>
      </View>

      {/* Search input */}
      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1f2937' : '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
          <Ionicons name="search" size={18} color={textMuted} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search workers..."
            placeholderTextColor={textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, fontSize: 14, color: isDark ? '#fff' : '#111827', fontFamily: 'System' }}
          />
        </View>
      </View>

      {/* ── Week nav ── */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, paddingBottom: 10, paddingHorizontal: 16 }}>
        <TouchableOpacity onPress={() => navigateWeek(-1)} style={{ padding: 6 }}>
          <Ionicons name="chevron-back" size={20} color={isDark ? '#fff' : '#374151'} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Body style={{ fontWeight: '700', fontSize: 15 }}>{formatWeekLabel(currentMonday)}</Body>
          <Caption style={{ color: rota?.status === 'PUBLISHED' ? '#10B981' : '#F59E0B', fontWeight: '600', fontSize: 11 }}>
            {rota?.status ?? 'DRAFT'}
          </Caption>
        </View>
        <TouchableOpacity onPress={() => navigateWeek(1)} style={{ padding: 6 }}>
          <Ionicons name="chevron-forward" size={20} color={isDark ? '#fff' : '#374151'} />
        </TouchableOpacity>
      </View>

      {/* ── Replacement warnings ── */}
      {replacementWarnings.length > 0 && (
        <View style={{ marginHorizontal: 16, marginBottom: 8, backgroundColor: '#FEF3C7', borderRadius: 10, padding: 10, flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
          <Ionicons name="warning" size={16} color="#D97706" style={{ marginTop: 1 }} />
          <View style={{ flex: 1 }}>
            <Body style={{ color: '#92400E', fontWeight: '600', fontSize: 12 }}>Replacement Needed</Body>
            {replacementWarnings.map(w => (
              <Caption key={w.id} style={{ color: '#92400E', fontSize: 11 }}>{w.fullName} is on leave but has shifts assigned</Caption>
            ))}
          </View>
        </View>
      )}

      {/* ── Legend ── */}
      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 8, flexWrap: 'wrap' }}>
        {(Object.keys(SHIFT_COLORS) as ShiftType[]).map(t => (
          <View key={t} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: SHIFT_COLORS[t].bg }} />
            <Caption style={{ fontSize: 10, textTransform: 'capitalize' }}>{t} ({SHIFT_COLORS[t].time})</Caption>
          </View>
        ))}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="sunny" size={10} color="#F59E0B" />
          <Caption style={{ fontSize: 10 }}>Leave</Caption>
        </View>
      </View>

      {/* ── Grid ── */}
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {/* Header row */}
            <View style={{ flexDirection: 'row', paddingHorizontal: 16 }}>
              <View style={{ width: NAME_COL_W, paddingVertical: 6 }}>
                <Caption style={{ fontSize: 10, color: textMuted }}>WORKER</Caption>
              </View>
              {DAYS.map((day, i) => {
                const today = isoDate(new Date());
                const isToday = weekDates[i] === today;
                return (
                  <View key={day} style={{ width: CELL_W, alignItems: 'center', paddingVertical: 6 }}>
                    <Caption style={{ fontSize: 11, fontWeight: isToday ? '700' : '400', color: isToday ? '#3B82F6' : textMuted }}>{day}</Caption>
                    <Caption style={{ fontSize: 9, color: textMuted }}>
                      {new Date(weekDates[i]).getDate()}
                    </Caption>
                  </View>
                );
              })}
            </View>

            {/* Worker rows */}
            {filteredWorkers.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Ionicons name="people-outline" size={40} color={textMuted} />
                <Body style={{ color: textMuted, marginTop: 8 }}>No workers found</Body>
              </View>
            ) : (
              filteredWorkers.map((worker, wi) => (
                <View
                  key={worker.id}
                  style={{
                    flexDirection: 'row',
                    paddingHorizontal: 16, paddingVertical: 6,
                    backgroundColor: wi % 2 === 0 ? (isDark ? '#1f2937' : '#fff') : (isDark ? '#111827' : '#f9fafb'),
                    borderBottomWidth: 1, borderBottomColor: borderColor,
                  }}
                >
                  {/* Name */}
                  <View style={{ width: NAME_COL_W, justifyContent: 'center', paddingRight: 6 }}>
                    <Body style={{ fontSize: 12, fontWeight: '600' }} numberOfLines={1}>{worker.fullName}</Body>
                    {worker.hourlyRate && (
                      <Caption style={{ fontSize: 10, color: textMuted }}>£{worker.hourlyRate}/h</Caption>
                    )}
                    {worker.assignments.length > 0 && (
                      <Caption style={{ fontSize: 9, color: '#10B981' }}>{worker.assignments.length} shift{worker.assignments.length !== 1 ? 's' : ''}</Caption>
                    )}
                  </View>

                  {/* Day cells */}
                  {weekDates.map((date, di) => (
                    <View key={date} style={{ marginHorizontal: 2 }}>
                      <Cell
                        worker={worker}
                        dayIdx={di}
                        dayDate={date}
                        rotaId={rota?.id ?? ''}
                        published={published}
                        onAssign={handleOpenPicker}
                        onRemove={handleRemoveShift}
                      />
                    </View>
                  ))}
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </ScrollView>

      {/* ── Stats bar ── */}
      <View style={{ backgroundColor: isDark ? '#1f2937' : '#fff', borderTopWidth: 1, borderTopColor: borderColor, paddingHorizontal: 16, paddingVertical: 12, paddingBottom: insets.bottom + 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {[
            { label: 'Shifts',  value: String(stats?.totalAssignments ?? 0) },
            { label: 'Hours',   value: String(stats?.totalHours ?? 0) },
            { label: 'Cost',    value: `£${(stats?.estimatedCost ?? 0).toLocaleString()}` },
            { label: 'On Leave', value: String(stats?.workersOnHoliday ?? 0) },
          ].map(s => (
            <View key={s.label} style={{ alignItems: 'center', flex: 1 }}>
              <Body style={{ fontWeight: '700', fontSize: 16 }}>{s.value}</Body>
              <Caption style={{ color: textMuted, fontSize: 10 }}>{s.label}</Caption>
            </View>
          ))}
        </View>
      </View>

      {/* ── Shift Picker Modal ── */}
      <ShiftPicker
        visible={pickerVisible}
        workerName={pickerWorker?.fullName ?? ''}
        date={pickerDate}
        onPick={handlePickShift}
        onClose={() => setPickerVisible(false)}
      />

      {/* ── Invite Worker Modal ── */}
      <InviteWorkerModal
        visible={inviteModalVisible}
        onClose={() => setInviteModalVisible(false)}
        onInvite={() => {
          // After inviting, refetch the rota data
          refetch();
          setInviteModalVisible(false);
        }}
      />
    </View>
  );
};

export default RotaBuilderScreen;

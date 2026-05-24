// ─────────────────────────────────────────────────────────────────────────────
// DROP-IN REPLACEMENTS for RotaBuilderScreen.tsx
//
// Root cause of "shift not showing after assign":
//
//   1. assignWorker() was IGNORING the rotaId param and creating a new rota
//      based on the date. The UI re-fetches the ORIGINAL rotaId so it got back
//      an empty rota. → Fixed in rota.controller.ts (use rotaId from params).
//
//   2. The Cell component's `onAssign` prop was typed as
//      (worker, date, dayIdx) but handleOpenPicker only accepted (worker, date).
//      The dayIdx was silently dropped. → Fixed below.
//
//   3. The optimistic update in rotaApi.ts was computing the cache key wrong
//      (using currentMonday from Redux state instead of the rota's startDate).
//      → Fixed in rotaApi.ts.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react';
import {
  View, ScrollView, TouchableOpacity, ActivityIndicator,
  Alert, RefreshControl, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useToast } from '../../../contexts';
import { H2, H3, Body, Caption } from '../../../components/ui';
import InviteWorkerModal from '../worker/InviteWorkerModal';
import {
  useGetWeekRotaQuery,
  useAssignWorkerMutation,
  useUnassignWorkerMutation,
  usePublishRotaMutation,
  useUnpublishRotaMutation,
  type RotaWorker,
  type RotaAssignment,
} from '../../../store/api/rotaApi';

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CELL_W = 68;
const NAME_COL_W = 110;

const SHIFT_SLOTS = {
  morning:   '06:00-14:00',
  afternoon: '14:00-22:00',
  night:     '22:00-06:00',
} as const;

type ShiftSlot = keyof typeof SHIFT_SLOTS;

const SHIFT_COLORS: Record<ShiftSlot, { bg: string; text: string; label: string; time: string }> = {
  morning:   { bg: '#3B82F6', text: '#fff', label: 'M', time: '6–14' },
  afternoon: { bg: '#F59E0B', text: '#fff', label: 'A', time: '14–22' },
  night:     { bg: '#8B5CF6', text: '#fff', label: 'N', time: '22–6' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

function getMondayOfWeek(ref: Date): Date {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}

function isoDate(d: Date): string {
  // Use LOCAL date components — toISOString() returns UTC which is the previous
  // calendar day for any UTC+ device timezone, shifting the whole week grid.
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatWeekLabel(monday: Date): string {
  const sunday = addDays(monday, 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${fmt(monday)} – ${fmt(sunday)}`;
}

// ─── ShiftPill ────────────────────────────────────────────────────────────────

interface ShiftPillProps {
  type: ShiftSlot | string;
  timeRange?: string;
  onRemove: () => void;
  published: boolean;
}

const ShiftPill: React.FC<ShiftPillProps> = ({ type, timeRange, onRemove, published }) => {
  const isCustom = !SHIFT_COLORS[type as ShiftSlot];
  const c = isCustom
    ? { bg: '#6366f1', text: '#fff', label: 'C', time: timeRange || 'Custom' }
    : SHIFT_COLORS[type as ShiftSlot];

  return (
    <View style={{
      backgroundColor: c.bg,
      borderRadius: 6,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
      paddingVertical: 3,
      gap: 3,
    }}>
      <Body style={{ color: c.text, fontSize: 11, fontWeight: '700' }}>{c.label}</Body>
      {!published && (
        <TouchableOpacity
          onPress={onRemove}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="close" size={10} color={c.text} />
        </TouchableOpacity>
      )}
    </View>
  );
};

// ─── Cell ─────────────────────────────────────────────────────────────────────
//
// FIX: onAssign receives (worker, dayDate, dayIdx) — all three params.
// The old Cell had the type correct but RotaBuilderScreen's handleOpenPicker
// only took (worker, date) — dayIdx was silently ignored, breaking the picker.

interface CellProps {
  worker: RotaWorker;
  dayIdx: number;
  dayDate: string;           // yyyy-MM-dd
  published: boolean;
  isPast: boolean;
  onAssign: (worker: RotaWorker, dayDate: string, dayIdx: number) => void;
  onRemove: (worker: RotaWorker, assignment: RotaAssignment) => void;
}

const Cell: React.FC<CellProps> = ({
  worker, dayIdx, dayDate, published, isPast, onAssign, onRemove,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const isHoliday    = worker.holidayDates.includes(dayDate);
  const isUnavailable = worker.unavailableDays.includes(dayIdx);

  // ── KEY FORMAT: "{dayIndex}-{startTime}-{endTime}" e.g. "0-06:00-14:00" ──
  // dayIdx (0=Mon … 6=Sun) matches the dayIndex the backend computes from monday.
  const assignmentKeys = Object.keys(worker.assignments).filter(
    (k) => k.startsWith(`${dayIdx}-`)
  );
  const assignments = assignmentKeys.map((k) => worker.assignments[k]);

  // Holiday with NO assignment → plain Leave cell
  if (isHoliday && assignments.length === 0) {
    return (
      <View style={{
        width: CELL_W, height: 48, justifyContent: 'center', alignItems: 'center',
        backgroundColor: isDark ? '#1f1a2e' : '#fef3c7', borderRadius: 6,
      }}>
        <Ionicons name="sunny" size={14} color="#F59E0B" />
        <Caption style={{ fontSize: 9, color: '#F59E0B' }}>Leave</Caption>
      </View>
    );
  }

  if (isUnavailable) {
    return (
      <View style={{
        width: CELL_W, height: 48,
        backgroundColor: isDark ? '#1a1a2e' : '#f3f4f6',
        borderRadius: 6, justifyContent: 'center', alignItems: 'center',
      }}>
        <Caption style={{ fontSize: 9, color: isDark ? '#6b7280' : '#9ca3af' }}>N/A</Caption>
      </View>
    );
  }

  if (assignments.length > 0) {
    return (
      <View style={{
        width: CELL_W, height: 48, justifyContent: 'center',
        alignItems: 'center', flexDirection: 'column', gap: 2,
        backgroundColor: isHoliday ? (isDark ? '#2d1f00' : '#fef3c7') : undefined,
        borderRadius: 6,
      }}>
        {/* Holiday warning badge when worker is scheduled on a leave day */}
        {isHoliday && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Ionicons name="sunny" size={9} color="#F59E0B" />
            <Caption style={{ fontSize: 8, color: '#92400e', fontWeight: '700' }}>LEAVE</Caption>
          </View>
        )}
        {assignments.map((assignment, idx) => {
          const timeSlot  = `${assignment.startTime}-${assignment.endTime}`;
          const shiftSlot = (Object.keys(SHIFT_SLOTS) as ShiftSlot[]).find(
            (key) => SHIFT_SLOTS[key] === timeSlot
          );
          const isCustom  = !shiftSlot;
          return (
            <ShiftPill
              key={`${dayDate}-${idx}`}
              type={isCustom ? 'CUSTOM' : shiftSlot!}
              timeRange={isCustom ? timeSlot : undefined}
              published={published}
              onRemove={() => onRemove(worker, assignment)}
            />
          );
        })}
        {/* Only allow adding more shifts on future/today non-holiday dates */}
        {!published && !isPast && !isHoliday && (
          <TouchableOpacity
            onPress={() => onAssign(worker, dayDate, dayIdx)}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Caption style={{ fontSize: 9, color: isDark ? '#6b7280' : '#9ca3af' }}>+ add</Caption>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (published || isPast) {
    return (
      <View style={{
        width: CELL_W, height: 48,
        backgroundColor: isPast && !published ? (isDark ? '#1a1a2e' : '#f9fafb') : undefined,
        borderRadius: 6, justifyContent: 'center', alignItems: 'center',
      }}>
        {isPast && !published && (
          <Caption style={{ fontSize: 10, color: isDark ? '#374151' : '#e5e7eb' }}>—</Caption>
        )}
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => onAssign(worker, dayDate, dayIdx)}
      style={{
        width: CELL_W, height: 48, borderRadius: 6,
        borderWidth: 1, borderStyle: 'dashed',
        borderColor: isDark ? '#374151' : '#d1d5db',
        justifyContent: 'center', alignItems: 'center',
      }}
    >
      <Ionicons name="add" size={16} color={isDark ? '#6b7280' : '#9ca3af'} />
    </TouchableOpacity>
  );
};

// ─── ShiftPicker ──────────────────────────────────────────────────────────────
//
// Two-step modal:
//   Step 1 — pick a preset or enter custom times
//   Step 2 — fill in shift details (site, pay, break, notes, workers needed)

interface ShiftDetails {
  payRate: string;
  breakMinutes: string;
  notes: string;
}

interface ShiftPickerProps {
  visible: boolean;
  workerName: string;
  date: string;
  onPick: (
    time: { startTime: string; endTime: string; role: string },
    details: ShiftDetails,
  ) => void;
  onClose: () => void;
}

const BLANK_DETAILS: ShiftDetails = {
  payRate: '', breakMinutes: '0', notes: '',
};

const ShiftPicker: React.FC<ShiftPickerProps> = ({
  visible, workerName, date, onPick, onClose,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const bg = isDark ? '#1f2937' : '#fff';
  const inputBg = isDark ? '#374151' : '#f3f4f6';
  const textColor = isDark ? '#fff' : '#111827';

  // step: 'time' | 'custom' | 'details'
  const [step, setStep]             = useState<'time' | 'custom' | 'details'>('time');
  const [pickedTime, setPickedTime] = useState<{ startTime: string; endTime: string; role: string } | null>(null);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd]     = useState('');
  const [details, setDetails]         = useState<ShiftDetails>(BLANK_DETAILS);

  const display = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('en-GB', {
        weekday: 'short', day: 'numeric', month: 'short',
      })
    : '';

  const normaliseTime = (raw: string): string => {
    const t = raw.trim();
    if (/^\d{1,2}:\d{2}$/.test(t)) return t.padStart(5, '0');
    if (/^\d{1,2}$/.test(t)) return String(parseInt(t)).padStart(2, '0') + ':00';
    return t;
  };

  const handleClose = () => {
    setStep('time'); setPickedTime(null);
    setCustomStart(''); setCustomEnd('');
    setDetails(BLANK_DETAILS);
    onClose();
  };

  const selectPreset = (type: ShiftSlot) => {
    const [s, e] = SHIFT_SLOTS[type].split('-');
    setPickedTime({ startTime: s, endTime: e, role: type });
    setStep('details');
  };

  const submitCustom = () => {
    const s = normaliseTime(customStart);
    const e = normaliseTime(customEnd);
    if (!s || !e) return;
    setPickedTime({ startTime: s, endTime: e, role: '' });
    setCustomStart(''); setCustomEnd('');
    setStep('details');
  };

  const submitDetails = () => {
    if (!pickedTime) return;
    onPick(pickedTime, details);
    setStep('time'); setPickedTime(null); setDetails(BLANK_DETAILS);
  };

  if (!visible) return null;

  const inputStyle = {
    backgroundColor: inputBg, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    color: textColor, fontSize: 13,
    marginBottom: 10,
  } as const;

  const labelStyle = { fontSize: 10, color: '#6b7280', marginBottom: 4, fontWeight: '600' as const };

  return (
    <View style={{
      position: 'absolute', inset: 0, flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center', alignItems: 'center', zIndex: 999,
    }}>
      <TouchableOpacity style={{ position: 'absolute', inset: 0 }} onPress={handleClose} activeOpacity={1} />
      <View style={{ backgroundColor: bg, borderRadius: 16, padding: 24, width: 310, zIndex: 1000 }}>
        <H3 style={{ marginBottom: 4 }}>Assign Shift</H3>
        <Caption style={{ marginBottom: 16, color: '#6b7280' }}>{workerName} · {display}</Caption>

        {/* ── Step 1: time picker ── */}
        {step === 'time' && (
          <>
            {(Object.keys(SHIFT_COLORS) as ShiftSlot[]).map((type) => {
              const c = SHIFT_COLORS[type];
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => selectPreset(type)}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 12,
                    backgroundColor: c.bg, borderRadius: 10, padding: 14, marginBottom: 8,
                  }}
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
            <TouchableOpacity
              onPress={() => setStep('custom')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: inputBg, borderRadius: 10, padding: 14, marginBottom: 8 }}
            >
              <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(59,130,246,0.2)', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="time-outline" size={18} color="#3B82F6" />
              </View>
              <View>
                <Body style={{ color: textColor, fontWeight: '600' }}>Custom time</Body>
                <Caption style={{ color: '#6b7280' }}>e.g. 12 – 22 or 08:00 – 16:00</Caption>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClose} style={{ alignItems: 'center', marginTop: 4 }}>
              <Body style={{ color: '#6b7280' }}>Cancel</Body>
            </TouchableOpacity>
          </>
        )}

        {/* ── Step 1b: custom time entry ── */}
        {step === 'custom' && (
          <>
            <Caption style={{ marginBottom: 12, color: '#6b7280' }}>Enter start and end (e.g. 12 or 12:00)</Caption>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              <TextInput placeholder="Start" placeholderTextColor="#6b7280" value={customStart} onChangeText={setCustomStart} keyboardType="numbers-and-punctuation" style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
              <TextInput placeholder="End" placeholderTextColor="#6b7280" value={customEnd} onChangeText={setCustomEnd} keyboardType="numbers-and-punctuation" style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
            </View>
            <TouchableOpacity onPress={submitCustom} disabled={!customStart || !customEnd} style={{ backgroundColor: '#3B82F6', borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 8, opacity: customStart && customEnd ? 1 : 0.5 }}>
              <Body style={{ color: '#fff', fontWeight: '600' }}>Next →</Body>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep('time')} style={{ alignItems: 'center' }}>
              <Body style={{ color: '#6b7280' }}>← Back</Body>
            </TouchableOpacity>
          </>
        )}

        {/* ── Step 2: shift details ── */}
        {step === 'details' && (
          <>
            <Caption style={{ color: '#6b7280', marginBottom: 12 }}>
              {pickedTime ? `${pickedTime.startTime} – ${pickedTime.endTime}` : ''} · optional details
            </Caption>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Caption style={labelStyle}>Pay rate (£/h)</Caption>
                <TextInput placeholder="0.00" placeholderTextColor="#6b7280" value={details.payRate} onChangeText={v => setDetails(d => ({ ...d, payRate: v }))} keyboardType="decimal-pad" style={{ ...inputStyle }} />
              </View>
              <View style={{ flex: 1 }}>
                <Caption style={labelStyle}>Break (mins)</Caption>
                <TextInput placeholder="0" placeholderTextColor="#6b7280" value={details.breakMinutes} onChangeText={v => setDetails(d => ({ ...d, breakMinutes: v }))} keyboardType="number-pad" style={{ ...inputStyle }} />
              </View>
            </View>

            <Caption style={labelStyle}>Notes</Caption>
            <TextInput placeholder="Any instructions for workers..." placeholderTextColor="#6b7280" value={details.notes} onChangeText={v => setDetails(d => ({ ...d, notes: v }))} multiline numberOfLines={2} style={{ ...inputStyle, minHeight: 60, textAlignVertical: 'top' }} />

            <TouchableOpacity onPress={submitDetails} style={{ backgroundColor: '#10B981', borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 8, marginTop: 4 }}>
              <Body style={{ color: '#fff', fontWeight: '600' }}>Assign Shift</Body>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep('time')} style={{ alignItems: 'center' }}>
              <Body style={{ color: '#6b7280' }}>← Back</Body>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};


// ─── Main Screen ──────────────────────────────────────────────────────────────

interface RotaBuilderScreenProps {
  clientCompanyId?: string;
  clientName?: string;
}

export default function RotaBuilderScreen({
  clientCompanyId,
  clientName,
}: RotaBuilderScreenProps) {
  const insets      = useSafeAreaInsets();
  const { theme }   = useTheme();
  const isDark      = theme === 'dark';
  const { showToast } = useToast();

  const [currentMonday, setCurrentMonday] = useState<Date>(
    getMondayOfWeek(new Date())
  );
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerWorker, setPickerWorker]   = useState<RotaWorker | null>(null);
  const [pickerDate, setPickerDate]       = useState('');
  const [searchQuery, setSearchQuery]     = useState('');
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [workersNeeded, setWorkersNeeded] = useState<number>(1);

  const weekStart = isoDate(currentMonday);

  const { data, isLoading, isFetching, refetch } = useGetWeekRotaQuery({
    weekStart,
    clientCompanyId,
  });

  console.log('[RotaBuilderScreen] API Response:', { weekStart, clientCompanyId, data, isLoading, isFetching });
  console.log('[RotaBuilderScreen] Workers count:', data?.workers?.length);
  console.log('[RotaBuilderScreen] Workers:', data?.workers);

  const [assignWorker]   = useAssignWorkerMutation();
  const [unassignWorker] = useUnassignWorkerMutation();
  const [publishRota]    = usePublishRotaMutation();
  const [unpublishRota]  = useUnpublishRotaMutation();

  const rota      = data?.rota;
  const workers   = data?.workers ?? [];
  const stats     = data?.stats;
  const published = rota?.status === 'PUBLISHED';

  // Sync global workers needed from rota default on load
  React.useEffect(() => {
    if (rota?.defaultWorkersNeeded) setWorkersNeeded(rota.defaultWorkersNeeded);
  }, [rota?.defaultWorkersNeeded]);

  const weekDates = Array.from({ length: 7 }, (_, i) =>
    isoDate(addDays(currentMonday, i))
  );

  const filteredWorkers = workers.filter((w) =>
    w.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navigateWeek = (dir: -1 | 1) =>
    setCurrentMonday((prev) => addDays(prev, dir * 7));

  // ── Open picker ──
  // FIX: accept dayIdx so it's available for the assignment key calculation
  const handleOpenPicker = useCallback(
    (worker: RotaWorker, date: string, _dayIdx: number) => {
      if (date < isoDate(new Date())) {
        showToast('Cannot assign shifts to past dates', 'error');
        return;
      }
      setPickerWorker(worker);
      setPickerDate(date);
      setPickerVisible(true);
    },
    [showToast]
  );

  // ── Pick shift ──
  const handlePickShift = useCallback(
    async (
      time: { startTime: string; endTime: string; role: string },
      details: ShiftDetails,
    ) => {
      if (!rota || !pickerWorker) return;
      setPickerVisible(false);

      try {
        await assignWorker({
          rotaId: rota.id,
          workerId: pickerWorker.id,
          date: pickerDate,
          startTime: time.startTime,
          endTime: time.endTime,
          role: time.role || `${time.startTime}-${time.endTime}`,
          payRate: details.payRate ? parseFloat(details.payRate) : undefined,
          breakMinutes: details.breakMinutes ? parseInt(details.breakMinutes) : undefined,
          notes: details.notes || undefined,
          workersNeeded,
        }).unwrap();
      } catch (err: any) {
        showToast(err?.data?.error ?? 'Failed to assign shift', 'error');
      }
    },
    [rota, pickerWorker, pickerDate, workersNeeded, assignWorker, showToast]
  );

  // ── Remove shift ──
  const handleRemoveShift = useCallback(
    async (worker: RotaWorker, assignment: RotaAssignment) => {
      if (!rota) return;
      try {
        await unassignWorker({
          rotaId: rota.id,
          workerId: worker.id,
          rotaShiftId: assignment.rotaShiftId,
        }).unwrap();
      } catch {
        showToast('Failed to remove shift', 'error');
      }
    },
    [rota, unassignWorker, showToast]
  );

  // ── Publish ──
  const handlePublish = () => {
    if (!rota) return;
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
              showToast(
                published ? 'Rota unpublished' : 'Rota published & workers notified',
                'success'
              );
            } catch {
              showToast('Action failed', 'error');
            }
          },
        },
      ]
    );
  };

  const cardBg     = isDark ? '#1f2937' : '#ffffff';
  const borderColor = isDark ? '#374151' : '#e5e7eb';
  const textMuted  = isDark ? '#9ca3af' : '#6b7280';

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{
      flex: 1,
      backgroundColor: isDark ? '#111827' : '#f9fafb',
    }}>

      {/* ── Header ── */}
      <View style={{
        paddingHorizontal: 16, paddingVertical: 12,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <H3>{clientName ? clientName : 'Rota Builder'}</H3>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => setInviteModalVisible(true)}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
              backgroundColor: isDark ? '#1f2937' : '#e5e7eb',
            }}
          >
            <Ionicons name="person-add-outline" size={15} color={isDark ? '#fff' : '#374151'} />
            <Body style={{ color: isDark ? '#fff' : '#374151', fontWeight: '600', fontSize: 13 }}>
              Add
            </Body>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handlePublish}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
              backgroundColor: published ? '#EF4444' : '#10B981',
            }}
          >
            <Ionicons
              name={published ? 'cloud-offline-outline' : 'cloud-upload-outline'}
              size={15}
              color="#fff"
            />
            <Body style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
              {published ? 'Unpublish' : 'Publish'}
            </Body>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Search ── */}
      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: isDark ? '#1f2937' : '#fff',
          borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
          borderWidth: 1, borderColor,
        }}>
          <Ionicons name="search" size={18} color={textMuted} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search workers..."
            placeholderTextColor={textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, fontSize: 14, color: isDark ? '#fff' : '#111827' }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Site & Workers Needed bar ── */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, marginBottom: 8, gap: 12,
      }}>
        {/* Company location (read-only) */}
        {data?.companyLocation && (
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="location-outline" size={13} color={textMuted} />
            <Caption style={{ fontSize: 11, color: textMuted, flex: 1 }} numberOfLines={1}>
              {[data.companyLocation.address, data.companyLocation.city, data.companyLocation.postcode].filter(Boolean).join(', ') || 'No location'}
            </Caption>
          </View>
        )}
        {/* Workers needed */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="people-outline" size={13} color={textMuted} />
          <Caption style={{ fontSize: 11, color: textMuted }}>Workers/shift:</Caption>
          <TextInput
            value={String(workersNeeded)}
            onChangeText={v => setWorkersNeeded(Math.max(1, parseInt(v) || 1))}
            keyboardType="number-pad"
            style={{
              backgroundColor: isDark ? '#1f2937' : '#fff',
              borderWidth: 1, borderColor,
              borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4,
              color: isDark ? '#fff' : '#111827', fontSize: 13, fontWeight: '700',
              width: 50, textAlign: 'center',
            }}
          />
        </View>
      </View>

      {/* ── Week nav ── */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 16,
        paddingBottom: 10, paddingHorizontal: 16,
      }}>
        <TouchableOpacity onPress={() => navigateWeek(-1)} style={{ padding: 6 }}>
          <Ionicons name="chevron-back" size={20} color={isDark ? '#fff' : '#374151'} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Body style={{ fontWeight: '700', fontSize: 15 }}>
            {formatWeekLabel(currentMonday)}
          </Body>
          <Caption style={{
            color: rota?.status === 'PUBLISHED' ? '#10B981' : '#F59E0B',
            fontWeight: '600', fontSize: 11,
          }}>
            {rota?.status ?? 'DRAFT'}
          </Caption>
        </View>
        <TouchableOpacity onPress={() => navigateWeek(1)} style={{ padding: 6 }}>
          <Ionicons name="chevron-forward" size={20} color={isDark ? '#fff' : '#374151'} />
        </TouchableOpacity>
      </View>

      {/* ── Legend ── */}
      <View style={{
        flexDirection: 'row', gap: 10,
        paddingHorizontal: 16, marginBottom: 8, flexWrap: 'wrap',
      }}>
        {(Object.keys(SHIFT_COLORS) as ShiftSlot[]).map((t) => (
          <View key={t} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: SHIFT_COLORS[t].bg }} />
            <Caption style={{ fontSize: 10, textTransform: 'capitalize' }}>
              {t} ({SHIFT_COLORS[t].time})
            </Caption>
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
                const isToday = weekDates[i] === isoDate(new Date());
                return (
                  <View key={day} style={{ width: CELL_W, alignItems: 'center', paddingVertical: 6 }}>
                    <Caption style={{
                      fontSize: 11, fontWeight: isToday ? '700' : '400',
                      color: isToday ? '#3B82F6' : textMuted,
                    }}>
                      {day}
                    </Caption>
                    <Caption style={{ fontSize: 9, color: textMuted }}>
                      {new Date(weekDates[i] + 'T00:00:00').getDate()}
                    </Caption>
                    {/* Worker count chips per shift type */}
                    <View style={{ flexDirection: 'row', gap: 2, marginTop: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {(Object.keys(SHIFT_COLORS) as ShiftSlot[]).map(t => {
                        const count = data?.shiftCounts?.[SHIFT_SLOTS[t]]?.[i] ?? 0;
                        return count > 0 ? (
                          <View key={t} style={{
                            backgroundColor: SHIFT_COLORS[t].bg,
                            borderRadius: 3, paddingHorizontal: 3, paddingVertical: 1,
                          }}>
                            <Caption style={{ fontSize: 8, color: SHIFT_COLORS[t].text, fontWeight: '800' }}>
                              {SHIFT_COLORS[t].label}{count}
                            </Caption>
                          </View>
                        ) : null;
                      })}
                    </View>
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
                    backgroundColor:
                      wi % 2 === 0
                        ? (isDark ? '#1f2937' : '#fff')
                        : (isDark ? '#111827' : '#f9fafb'),
                    borderBottomWidth: 1, borderBottomColor: borderColor,
                  }}
                >
                  {/* Name */}
                  <View style={{
                    width: NAME_COL_W, justifyContent: 'center', paddingRight: 6,
                  }}>
                    <Body style={{ fontSize: 12, fontWeight: '600' }} numberOfLines={1}>
                      {worker.fullName}
                    </Body>
                    {worker.hourlyRate ? (
                      <Caption style={{ fontSize: 10, color: textMuted }}>
                        £{worker.hourlyRate}/h
                      </Caption>
                    ) : null}
                    {Object.keys(worker.assignments).length > 0 && (
                      <Caption style={{ fontSize: 9, color: '#10B981' }}>
                        {Object.keys(worker.assignments).length} shift
                        {Object.keys(worker.assignments).length !== 1 ? 's' : ''}
                      </Caption>
                    )}
                  </View>

                  {/* Day cells */}
                  {weekDates.map((date, di) => (
                    <View key={date} style={{ marginHorizontal: 2 }}>
                      <Cell
                        worker={worker}
                        dayIdx={di}
                        dayDate={date}
                        published={published}
                        isPast={date < isoDate(new Date())}
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
      <View style={{
        backgroundColor: isDark ? '#1f2937' : '#fff',
        borderTopWidth: 1, borderTopColor: borderColor,
        paddingHorizontal: 16, paddingVertical: 12,
        paddingBottom: insets.bottom + 12,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {[
            { label: 'Shifts',   value: String(stats?.totalAssignments ?? 0) },
            { label: 'Hours',    value: String(stats?.totalHours ?? 0) },
            { label: 'Cost',     value: `£${(stats?.estimatedCost ?? 0).toLocaleString()}` },
            { label: 'On Leave', value: String(stats?.workersOnHoliday ?? 0) },
          ].map((s) => (
            <View key={s.label} style={{ alignItems: 'center', flex: 1 }}>
              <Body style={{ fontWeight: '700', fontSize: 16 }}>{s.value}</Body>
              <Caption style={{ color: textMuted, fontSize: 10 }}>{s.label}</Caption>
            </View>
          ))}
        </View>
      </View>

      {/* ── Shift Picker (rendered as absolute overlay) ── */}
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
        onInvite={() => { refetch(); setInviteModalVisible(false); }}
      />
    </View>
  );
}
import React, { useState, useEffect } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrgTheme, useTheme } from '../../../contexts';
import { H3, Body, Caption, Card, Input } from '../../../components/ui';
import { SkillsSelectionModal } from './SkillsSelectionModal';
import { DatePickerModal } from '../../../components/ui/DatePickerModal';
import { TimePickerModal } from '../../../components/ui/TimePickerModal';
import { useGetClientsQuery } from '../../../store/slices/adminSlices/organizationSlice';

// ─── Types ─────────────────────────────────────────────────────────────────

interface CreateShiftModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (shiftData: any) => void;
  shiftData?: any;
  mode?: 'create' | 'edit';
}

// ─── Sub-components ────────────────────────────────────────────────────────

/** Labelled form field wrapper */
function Field({
  label, required, children,
}: {
  label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <View className="mb-5">
      <View className="flex-row items-center gap-1 mb-2">
        <Caption color="secondary" className="text-xs font-outfit-medium">{label}</Caption>
        {required && <Caption className="text-xs text-red-400">*</Caption>}
      </View>
      {children}
    </View>
  );
}

/** Section divider with label */
function SectionHeader({ icon, title }: { icon: string; title: string }) {
  const { isDark } = useTheme();
  return (
    <View className="flex-row items-center gap-2 mb-4 mt-2">
      <View
        className="w-7 h-7 rounded-lg items-center justify-center"
        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' }}
      >
        <Ionicons name={icon as any} size={14} color="#9CA3AF" />
      </View>
      <Body className="font-outfit-semibold text-sm">{title}</Body>
      <View className="flex-1 h-px ml-1" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB' }} />
    </View>
  );
}

/** Pill toggle group */
function PillGroup<T extends string>({
  options, value, onChange, primaryColor, isDark,
}: {
  options: { label: string; value: T; color?: string }[];
  value: T;
  onChange: (v: T) => void;
  primaryColor: string;
  isDark: boolean;
}) {
  return (
    <View className="flex-row gap-2">
      {options.map(opt => {
        const active = value === opt.value;
        const activeBg = opt.color ?? primaryColor;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(opt.value)}
            className="flex-1 py-2.5 rounded-xl items-center"
            style={{
              backgroundColor: active ? activeBg : (isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6'),
              borderWidth: 1.5,
              borderColor: active ? activeBg : 'transparent',
            }}
          >
            <Body
              className="text-xs font-outfit-semibold"
              style={{ color: active ? '#FFF' : (isDark ? '#D1D5DB' : '#374151') }}
            >
              {opt.label}
            </Body>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/** Selector row (tappable field that opens a picker) */
function SelectorField({
  icon, placeholder, value, onPress,
}: {
  icon: string; placeholder: string; value?: string; onPress: () => void;
}) {
  const { isDark } = useTheme();
  const hasValue = !!value;
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 h-12 rounded-xl border"
      style={{
        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F9FAFB',
        borderColor:     isDark ? 'rgba(255,255,255,0.10)' : '#E5E7EB',
      }}
    >
      <Ionicons name={icon as any} size={18} color="#9CA3AF" />
      <Body
        className="flex-1 text-sm"
        style={{ color: hasValue ? (isDark ? '#FFF' : '#111827') : '#9CA3AF' }}
      >
        {value || placeholder}
      </Body>
      <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

// ─── Priority colours ──────────────────────────────────────────────────────

const PRIORITY_COLOR: Record<string, string> = {
  LOW: '#10B981', NORMAL: '#3B82F6', HIGH: '#F59E0B', URGENT: '#EF4444',
};

// ─── Main Modal ────────────────────────────────────────────────────────────

export function CreateShiftModal({
  visible, onClose, onSave, shiftData, mode = 'create',
}: CreateShiftModalProps) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();

  const { data: clientsData } = useGetClientsQuery();
  const clients = Array.isArray(clientsData?.data) ? clientsData.data : [];

  // ── Form state ────────────────────────────────────────────────────────
  const [title,           setTitle]           = useState('');
  const [clientCompanyId, setClientCompanyId] = useState('');
  const [location,        setLocation]        = useState('');
  const [postcode,        setPostcode]        = useState('');
  const [date,            setDate]            = useState('');
  const [startTime,       setStartTime]       = useState('');
  const [endTime,         setEndTime]         = useState('');
  const [workersNeeded,   setWorkersNeeded]   = useState('1');
  const [payRate,         setPayRate]         = useState('');
  const [notes,           setNotes]           = useState('');
  const [priority,        setPriority]        = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [status,          setStatus]          = useState<'DRAFT' | 'OPEN'>('OPEN');
  const [selectedSkills,  setSelectedSkills]  = useState<string[]>([]);

  const [showSkillsModal,     setShowSkillsModal]     = useState(false);
  const [showDatePicker,      setShowDatePicker]      = useState(false);
  const [showClientModal,     setShowClientModal]     = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker,   setShowEndTimePicker]   = useState(false);

  // ── Populate on edit / duplicate ──────────────────────────────────────
  useEffect(() => {
    if (!shiftData) return;
    setTitle(shiftData.title || '');
    setClientCompanyId(shiftData.clientCompanyId || '');
    setLocation(shiftData.siteLocation || shiftData.location || '');
    setPostcode(shiftData.postcode || '');
    setWorkersNeeded(String(shiftData.workersNeeded || 1));
    setPayRate(shiftData.payRate || shiftData.hourlyRate || '');
    setNotes(shiftData.notes || '');
    setPriority(shiftData.priority || 'NORMAL');
    setStatus(mode === 'edit' ? (shiftData.status || 'OPEN') : 'OPEN');
    setSelectedSkills(
      shiftData.requiredSkills?.map((rs: any) => rs.skill?.name || rs.skillId) ||
      shiftData.skills || [],
    );
    if (shiftData.time) {
      setStartTime(shiftData.time?.split(' - ')[0] || '');
      setEndTime(shiftData.time?.split(' - ')[1] || '');
    } else if (shiftData.startAt && shiftData.endAt) {
      // Use local-time hours so the picker shows the correct wall-clock time
      const s = new Date(shiftData.startAt);
      const e = new Date(shiftData.endAt);
      setStartTime(`${s.getHours().toString().padStart(2, '0')}:${s.getMinutes().toString().padStart(2, '0')}`);
      setEndTime(`${e.getHours().toString().padStart(2, '0')}:${e.getMinutes().toString().padStart(2, '0')}`);
      if (mode === 'edit') setDate(shiftData.startAt?.split('T')[0] || '');
    }
  }, [shiftData, mode]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleDateSelected = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setDate(`${y}-${m}-${day}`);
    setShowDatePicker(false);
  };

  const handleSave = () => {
    if (startTime && endTime && endTime <= startTime) return; // guard
    // Build as local time (no Z) then convert to proper UTC — matches web CreateShift.tsx
    const startAt = date && startTime ? new Date(`${date}T${startTime}:00`).toISOString() : shiftData?.startAt;
    const endAt   = date && endTime   ? new Date(`${date}T${endTime}:00`).toISOString()   : shiftData?.endAt;
    onSave({
      ...(mode === 'edit' ? shiftData : {}),
      title,
      clientCompanyId: clientCompanyId || undefined,
      siteLocation: location,
      postcode,
      startAt,
      endAt,
      workersNeeded: parseInt(workersNeeded),
      payRate:       payRate ? parseFloat(payRate) : undefined,
      notes, priority, status,
    });
    handleClose();
  };

  const handleClose = () => {
    setTitle(''); setClientCompanyId(''); setLocation(''); setPostcode('');
    setDate(''); setStartTime(''); setEndTime(''); setWorkersNeeded('1');
    setPayRate(''); setNotes(''); setPriority('NORMAL'); setStatus('OPEN');
    setSelectedSkills([]);
    onClose();
  };

  const selectedClientName = clients.find((c: any) => c.id === clientCompanyId)?.name;
  const modalTitle =
    mode === 'edit' ? 'Edit Shift' : shiftData ? 'Duplicate Shift' : 'Create Shift';

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
    : undefined;

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary">

        {/* ── Header ──────────────────────────────────────────────── */}
        <View
          className="flex-row items-center justify-between px-5 pb-4 border-b border-light-border-light dark:border-dark-border-light"
          style={{ paddingTop: insets.top + 12 }}
        >
          <TouchableOpacity
            onPress={handleClose}
            className="w-10 h-10 rounded-full items-center justify-center bg-light-background-secondary dark:bg-dark-background-secondary"
          >
            <Ionicons name="close" size={20} color={isDark ? '#FFF' : '#374151'} />
          </TouchableOpacity>

          <View className="items-center">
            <H3>{modalTitle}</H3>
            <Caption color="secondary" className="text-[10px]">
              {mode === 'edit' ? 'Update shift details' : 'Fill in the details below'}
            </Caption>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            className="px-5 py-2.5 rounded-xl"
            style={{ backgroundColor: primaryColor }}
          >
            <Body className="text-white font-outfit-semibold text-sm">Save</Body>
          </TouchableOpacity>
        </View>

        {/* ── Form ────────────────────────────────────────────────── */}
        <ScrollView
          className="flex-1 px-5 pt-5"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ─ Basic Info ─ */}
          <SectionHeader icon="information-circle-outline" title="Basic Information" />

          <Field label="Shift Title" required>
            <Input
              placeholder="e.g. Morning Warehouse Shift"
              value={title}
              onChangeText={setTitle}
              leftIcon={<Ionicons name="briefcase-outline" size={18} color="#9CA3AF" />}
            />
          </Field>

          <Field label="Client">
            <SelectorField
              icon="business-outline"
              placeholder="Select a client"
              value={selectedClientName}
              onPress={() => setShowClientModal(true)}
            />
          </Field>

          <Field label="Location" required>
            <Input
              placeholder="Site name or address"
              value={location}
              onChangeText={setLocation}
              leftIcon={<Ionicons name="location-outline" size={18} color="#9CA3AF" />}
            />
          </Field>

          <Field label="Postcode">
            <Input
              placeholder="e.g. SW1A 1AA"
              value={postcode}
              onChangeText={setPostcode}
              leftIcon={<Ionicons name="map-outline" size={18} color="#9CA3AF" />}
              autoCapitalize="characters"
            />
          </Field>

          {/* ─ Date & Time ─ */}
          <SectionHeader icon="calendar-outline" title="Date & Time" />

          <Field label="Date" required>
            <SelectorField
              icon="calendar-outline"
              placeholder="Select date"
              value={formattedDate}
              onPress={() => setShowDatePicker(true)}
            />
          </Field>

          {/* Time row */}
          <View className="flex-row gap-3 mb-5">
            {/* Start Time */}
            <View className="flex-1">
              <View className="flex-row items-center gap-1 mb-2">
                <Caption color="secondary" className="text-xs font-outfit-medium">Start Time</Caption>
                <Caption className="text-xs text-red-400">*</Caption>
              </View>
              <SelectorField
                icon="time-outline"
                placeholder="Select start time"
                value={startTime
                  ? new Date(`2000-01-01T${startTime}`).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()
                  : undefined}
                onPress={() => setShowStartTimePicker(true)}
              />
            </View>

            {/* End Time */}
            <View className="flex-1">
              <View className="flex-row items-center gap-1 mb-2">
                <Caption color="secondary" className="text-xs font-outfit-medium">End Time</Caption>
                <Caption className="text-xs text-red-400">*</Caption>
              </View>
              <SelectorField
                icon="time-outline"
                placeholder="Select end time"
                value={endTime
                  ? new Date(`2000-01-01T${endTime}`).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()
                  : undefined}
                onPress={() => setShowEndTimePicker(true)}
              />
            </View>
          </View>

          {/* Cross-field time validation */}
          {startTime && endTime && endTime <= startTime && (
            <View
              className="flex-row items-center gap-2 px-4 py-3 rounded-xl mb-5 -mt-2"
              style={{ backgroundColor: isDark ? 'rgba(239,68,68,0.12)' : '#FEE2E2' }}
            >
              <Ionicons name="alert-circle-outline" size={15} color="#EF4444" />
              <Caption className="text-xs flex-1" style={{ color: '#EF4444' }}>
                End time must be after start time
              </Caption>
            </View>
          )}

          {/* ─ Staffing & Pay ─ */}
          <SectionHeader icon="people-outline" title="Staffing & Pay" />

          <View className="flex-row gap-3 mb-5">
            <View className="flex-1">
              <Caption color="secondary" className="text-xs font-outfit-medium mb-2">
                Workers Needed <Caption className="text-red-400">*</Caption>
              </Caption>
              <Input
                placeholder="1"
                value={workersNeeded}
                onChangeText={setWorkersNeeded}
                keyboardType="number-pad"
                leftIcon={<Ionicons name="people-outline" size={18} color="#9CA3AF" />}
              />
            </View>
            <View className="flex-1">
              <Caption color="secondary" className="text-xs font-outfit-medium mb-2">
                Hourly Rate (£)
              </Caption>
              <Input
                placeholder="12.50"
                value={payRate}
                onChangeText={setPayRate}
                keyboardType="decimal-pad"
                leftIcon={<Ionicons name="cash-outline" size={18} color="#9CA3AF" />}
              />
            </View>
          </View>

          {/* ─ Priority ─ */}
          <Field label="Priority">
            <PillGroup
              options={[
                { label: 'Low',    value: 'LOW',    color: PRIORITY_COLOR.LOW    },
                { label: 'Normal', value: 'NORMAL', color: PRIORITY_COLOR.NORMAL },
                { label: 'High',   value: 'HIGH',   color: PRIORITY_COLOR.HIGH   },
                { label: 'Urgent', value: 'URGENT', color: PRIORITY_COLOR.URGENT },
              ]}
              value={priority}
              onChange={setPriority}
              primaryColor={primaryColor}
              isDark={isDark}
            />
          </Field>

          {/* ─ Status ─ */}
          <Field label="Status">
            <PillGroup
              options={[
                { label: 'Draft', value: 'DRAFT' },
                { label: 'Open',  value: 'OPEN'  },
              ]}
              value={status}
              onChange={setStatus}
              primaryColor={primaryColor}
              isDark={isDark}
            />
          </Field>

          {/* ─ Skills ─ */}
          <SectionHeader icon="ribbon-outline" title="Skills & Requirements" />

          <Field label="Required Skills">
            <TouchableOpacity
              onPress={() => setShowSkillsModal(true)}
              className="px-4 py-3 rounded-xl border min-h-[52px] flex-row items-center"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F9FAFB',
                borderColor:     isDark ? 'rgba(255,255,255,0.10)' : '#E5E7EB',
              }}
            >
              <View className="flex-1">
                {selectedSkills.length > 0 ? (
                  <View className="flex-row flex-wrap gap-1.5">
                    {selectedSkills.slice(0, 4).map(skill => (
                      <View
                        key={skill}
                        className="px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: isDark ? 'rgba(124,58,237,0.2)' : '#EDE9FE' }}
                      >
                        <Caption className="text-[10px] font-outfit-medium" style={{ color: isDark ? '#C4B5FD' : '#7C3AED' }}>
                          {skill}
                        </Caption>
                      </View>
                    ))}
                    {selectedSkills.length > 4 && (
                      <View
                        className="px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' }}
                      >
                        <Caption color="secondary" className="text-[10px]">+{selectedSkills.length - 4} more</Caption>
                      </View>
                    )}
                  </View>
                ) : (
                  <Caption color="secondary" className="text-sm">Tap to select required skills…</Caption>
                )}
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" className="ml-2" />
            </TouchableOpacity>
          </Field>

          {/* ─ Notes ─ */}
          <SectionHeader icon="chatbox-outline" title="Additional Notes" />

          <Field label="Notes">
            <View
              className="px-4 py-3 rounded-xl border min-h-[110px]"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F9FAFB',
                borderColor:     isDark ? 'rgba(255,255,255,0.10)' : '#E5E7EB',
              }}
            >
              <TextInput
                placeholder="Add any additional notes or instructions…"
                value={notes}
                onChangeText={setNotes}
                multiline
                textAlignVertical="top"
                placeholderTextColor="#9CA3AF"
                style={{
                  color:      isDark ? '#FFFFFF' : '#111827',
                  fontSize:   13,
                  fontFamily: 'Outfit-Regular',
                  minHeight:  88,
                }}
              />
            </View>
          </Field>

          <View className="h-24" />
        </ScrollView>

        {/* ── Skills modal ──────────────────────────────────────────── */}
        <SkillsSelectionModal
          visible={showSkillsModal}
          onClose={() => setShowSkillsModal(false)}
          onSkillsSelected={setSelectedSkills}
          preSelectedSkills={selectedSkills}
        />

        {/* ── Date picker ───────────────────────────────────────────── */}
        <DatePickerModal
          visible={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onConfirm={handleDateSelected}
          initialDate={date ? new Date(date) : new Date()}
          minimumDate={new Date()}
          primaryColor={primaryColor}
        />

        {/* ── Start time picker ─────────────────────────────────────── */}
        <TimePickerModal
          visible={showStartTimePicker}
          label="Start Time"
          value={startTime || undefined}
          onConfirm={t => { setStartTime(t); }}
          onClose={() => setShowStartTimePicker(false)}
        />

        {/* ── End time picker ───────────────────────────────────────── */}
        <TimePickerModal
          visible={showEndTimePicker}
          label="End Time"
          value={endTime || undefined}
          onConfirm={t => { setEndTime(t); }}
          onClose={() => setShowEndTimePicker(false)}
          minTime={startTime || undefined}
        />

        {/* ── Client picker sheet ───────────────────────────────────── */}
        <Modal visible={showClientModal} transparent animationType="slide">
          <View
            className="flex-1 justify-end"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          >
            <TouchableOpacity
              className="absolute inset-0"
              onPress={() => setShowClientModal(false)}
            />
            <View
              className="rounded-t-3xl overflow-hidden"
              style={{
                backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF',
                paddingBottom: insets.bottom + 16,
              }}
            >
              {/* Sheet header */}
              <View
                className="flex-row items-center justify-between px-5 py-4 border-b"
                style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB' }}
              >
                <TouchableOpacity onPress={() => setShowClientModal(false)}>
                  <Body className="text-sm" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>Cancel</Body>
                </TouchableOpacity>
                <Body className="font-outfit-semibold text-sm">Select Client</Body>
                <TouchableOpacity onPress={() => setShowClientModal(false)}>
                  <Body className="font-outfit-semibold text-sm" style={{ color: primaryColor }}>Done</Body>
                </TouchableOpacity>
              </View>

              {/* Drag indicator */}
              <View className="absolute top-2 self-center w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />

              {/* Client list */}
              <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
                {clients.length === 0 ? (
                  <View className="items-center justify-center py-12 gap-2">
                    <Ionicons name="business-outline" size={32} color="#9CA3AF" />
                    <Caption color="secondary" className="text-xs">No clients available</Caption>
                  </View>
                ) : (
                  clients.map((client: any) => {
                    const selected = clientCompanyId === client.id;
                    return (
                      <TouchableOpacity
                        key={client.id}
                        onPress={() => { setClientCompanyId(client.id); setShowClientModal(false); }}
                        className="flex-row items-center justify-between px-5 py-4 border-b"
                        style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6' }}
                      >
                        <View className="flex-row items-center gap-3">
                          <View
                            className="w-8 h-8 rounded-lg items-center justify-center"
                            style={{ backgroundColor: selected ? primaryColor : (isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6') }}
                          >
                            <Ionicons
                              name="business-outline"
                              size={15}
                              color={selected ? '#FFF' : '#9CA3AF'}
                            />
                          </View>
                          <Body
                            className="text-sm font-outfit-medium"
                            style={{ color: selected ? primaryColor : (isDark ? '#FFF' : '#111827') }}
                          >
                            {client.name}
                          </Body>
                        </View>
                        {selected && (
                          <Ionicons name="checkmark-circle" size={20} color={primaryColor} />
                        )}
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

      </View>
    </Modal>
  );
}

export default CreateShiftModal;

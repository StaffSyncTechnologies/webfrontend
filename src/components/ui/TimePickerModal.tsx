import React, { useState, useRef, useEffect } from 'react';
import {
  View, Modal, TouchableOpacity, ScrollView, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrgTheme, useTheme } from '../../contexts';
import { H3, Body, Caption } from '../../components/ui';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface TimePickerModalProps {
  visible: boolean;
  /** Label shown in the header e.g. "Start Time" */
  label?: string;
  /** Current value as "HH:MM" 24-hr string */
  value?: string;
  /** Called with "HH:MM" 24-hr string on confirm */
  onConfirm: (time: string) => void;
  onClose: () => void;
  /**
   * Optional earliest allowed time as "HH:MM".
   * When set the picker warns (and blocks confirm) if selected time is earlier.
   */
  minTime?: string;
  /** Optional latest allowed time as "HH:MM" */
  maxTime?: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const HOURS_12   = Array.from({ length: 12 },  (_, i) => String(i + 1).padStart(2, '0')); // 01–12
const MINUTES    = Array.from({ length: 12 },  (_, i) => String(i * 5).padStart(2, '0')); // 00,05,…,55
const ITEM_H     = 52; // height of each scroll item in px
const VISIBLE    = 5;  // number of items visible at once
const PAD        = ITEM_H * Math.floor(VISIBLE / 2);                                       // top/bottom padding so selection centres

// ─── Helpers ───────────────────────────────────────────────────────────────

function to24(h12: string, m: string, period: 'AM' | 'PM'): string {
  let h = parseInt(h12, 10);
  if (period === 'AM' && h === 12) h = 0;
  if (period === 'PM' && h !== 12) h += 12;
  return `${String(h).padStart(2, '0')}:${m}`;
}

function from24(time24: string): { h12: string; min: string; period: 'AM' | 'PM' } {
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const period: 'AM' | 'PM' = h < 12 ? 'AM' : 'PM';
  if (h === 0)  h = 12;
  if (h > 12)   h -= 12;
  // snap minute to nearest 5
  const rawMin   = parseInt(mStr, 10);
  const snapped  = Math.round(rawMin / 5) * 5;
  const min      = String(snapped === 60 ? 55 : snapped).padStart(2, '0');
  return { h12: String(h).padStart(2, '0'), min, period };
}

function parseMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function formatDisplay(time24: string): string {
  const { h12, min, period } = from24(time24);
  return `${h12}:${min} ${period}`;
}

// ─── Drum column ───────────────────────────────────────────────────────────

interface DrumProps {
  items: string[];
  selected: string;
  onChange: (v: string) => void;
  primaryColor: string;
  isDark: boolean;
}

function DrumColumn({ items, selected, onChange, primaryColor, isDark }: DrumProps) {
  const scrollRef = useRef<ScrollView>(null);
  const idx       = items.indexOf(selected);

  // Scroll to selected item on mount / change
  useEffect(() => {
    const target = Math.max(0, idx) * ITEM_H;
    scrollRef.current?.scrollTo({ y: target, animated: false });
  }, [selected]);

  const handleMomentumEnd = (e: any) => {
    const y   = e.nativeEvent.contentOffset.y;
    const i   = Math.round(y / ITEM_H);
    const clamped = Math.max(0, Math.min(items.length - 1, i));
    onChange(items[clamped]);
    scrollRef.current?.scrollTo({ y: clamped * ITEM_H, animated: true });
  };

  const handleScrollEnd = (e: any) => {
    const y   = e.nativeEvent.contentOffset.y;
    const i   = Math.round(y / ITEM_H);
    const clamped = Math.max(0, Math.min(items.length - 1, i));
    onChange(items[clamped]);
    scrollRef.current?.scrollTo({ y: clamped * ITEM_H, animated: true });
  };

  return (
    <View style={{ width: 72, height: ITEM_H * VISIBLE, overflow: 'hidden' }}>
      {/* Selection highlight */}
      <View
        className="absolute left-1 right-1 rounded-xl z-10 pointer-events-none"
        style={{
          top: PAD,
          height: ITEM_H,
          backgroundColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.06)',
          borderWidth: 1.5,
          borderColor: primaryColor + '55',
        }}
      />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumEnd}
        onScrollEndDrag={handleScrollEnd}
        contentContainerStyle={{ paddingVertical: PAD }}
        scrollEventThrottle={16}
      >
        {items.map(item => {
          const active = item === selected;
          return (
            <TouchableOpacity
              key={item}
              onPress={() => {
                onChange(item);
                const i = items.indexOf(item);
                scrollRef.current?.scrollTo({ y: i * ITEM_H, animated: true });
              }}
              style={{ height: ITEM_H, justifyContent: 'center', alignItems: 'center' }}
            >
              <Body
                className="font-outfit-bold"
                style={{
                  fontSize:  active ? 26 : 18,
                  color:     active ? primaryColor : (isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.25)'),
                  lineHeight: active ? 32 : 24,
                }}
              >
                {item}
              </Body>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {/* Top + bottom fade masks */}
      <View
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: PAD,
          backgroundColor: isDark ? 'rgba(26,26,46,1)' : 'rgba(255,255,255,1)',
        }}
      />
      <View
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: PAD }}
      />
    </View>
  );
}

// ─── Period toggle (AM / PM) ───────────────────────────────────────────────

function PeriodToggle({
  period, onChange, primaryColor, isDark,
}: {
  period: 'AM' | 'PM'; onChange: (p: 'AM' | 'PM') => void; primaryColor: string; isDark: boolean;
}) {
  return (
    <View className="gap-2">
      {(['AM', 'PM'] as const).map(p => {
        const active = period === p;
        return (
          <TouchableOpacity
            key={p}
            onPress={() => onChange(p)}
            className="w-14 h-14 rounded-2xl items-center justify-center"
            style={{
              backgroundColor: active ? primaryColor : (isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6'),
            }}
          >
            <Body
              className="font-outfit-bold text-sm"
              style={{ color: active ? '#FFF' : (isDark ? '#9CA3AF' : '#6B7280') }}
            >
              {p}
            </Body>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export function TimePickerModal({
  visible, label = 'Select Time', value, onConfirm, onClose, minTime, maxTime,
}: TimePickerModalProps) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark }       = useTheme();

  // Parse initial value
  const init = value ? from24(value) : { h12: '09', min: '00', period: 'AM' as const };
  const [selHour,   setSelHour]   = useState<string>(init.h12);
  const [selMin,    setSelMin]    = useState<string>(init.min);
  const [selPeriod, setSelPeriod] = useState<'AM' | 'PM'>(init.period);
  const [error,     setError]     = useState<string>('');

  // Re-sync when value prop changes (e.g. opening with existing time)
  useEffect(() => {
    if (visible) {
      const parsed = value ? from24(value) : { h12: '09', min: '00', period: 'AM' as const };
      setSelHour(parsed.h12);
      setSelMin(parsed.min);
      setSelPeriod(parsed.period);
      setError('');
    }
  }, [visible, value]);

  const current24 = to24(selHour, selMin, selPeriod);

  // Validate whenever selection changes
  useEffect(() => {
    const currentMins = parseMinutes(current24);
    if (minTime && currentMins < parseMinutes(minTime)) {
      setError(`Time must be after ${formatDisplay(minTime)}`);
    } else if (maxTime && currentMins > parseMinutes(maxTime)) {
      setError(`Time must be before ${formatDisplay(maxTime)}`);
    } else {
      setError('');
    }
  }, [current24, minTime, maxTime]);

  const handleConfirm = () => {
    if (error) return;
    onConfirm(current24);
    onClose();
  };

  const bgColor    = isDark ? '#1A1A2E' : '#FFFFFF';
  const dividerClr = isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB';

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
        {/* Tap-outside to dismiss */}
        <TouchableOpacity className="absolute inset-0" onPress={onClose} />

        <View
          className="rounded-t-3xl overflow-hidden"
          style={{ backgroundColor: bgColor, paddingBottom: insets.bottom + 16 }}
        >
          {/* Drag handle */}
          <View className="items-center pt-3 pb-1">
            <View
              className="w-10 h-1 rounded-full"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : '#D1D5DB' }}
            />
          </View>

          {/* Header */}
          <View
            className="flex-row items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: dividerClr }}
          >
            <TouchableOpacity onPress={onClose}>
              <Body className="text-sm" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>Cancel</Body>
            </TouchableOpacity>
            <View className="items-center">
              <H3>{label}</H3>
              {/* Live preview */}
              <Caption
                className="text-xs font-outfit-semibold mt-0.5"
                style={{ color: error ? '#EF4444' : primaryColor }}
              >
                {formatDisplay(current24)}
              </Caption>
            </View>
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={!!error}
              className="px-4 py-2 rounded-xl"
              style={{ backgroundColor: error ? '#E5E7EB' : primaryColor }}
            >
              <Body
                className="font-outfit-semibold text-sm"
                style={{ color: error ? '#9CA3AF' : '#FFF' }}
              >
                Done
              </Body>
            </TouchableOpacity>
          </View>

          {/* Drum picker */}
          <View className="flex-row items-center justify-center gap-3 py-6 px-5">
            {/* Hour drum */}
            <DrumColumn
              items={HOURS_12}
              selected={selHour}
              onChange={setSelHour}
              primaryColor={primaryColor}
              isDark={isDark}
            />

            {/* Colon separator */}
            <Body
              className="font-outfit-bold text-3xl mb-1"
              style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)' }}
            >
              :
            </Body>

            {/* Minute drum */}
            <DrumColumn
              items={MINUTES}
              selected={selMin}
              onChange={setSelMin}
              primaryColor={primaryColor}
              isDark={isDark}
            />

            {/* Spacer */}
            <View style={{ width: 12 }} />

            {/* AM / PM */}
            <PeriodToggle
              period={selPeriod}
              onChange={setSelPeriod}
              primaryColor={primaryColor}
              isDark={isDark}
            />
          </View>

          {/* Validation error */}
          {!!error && (
            <View
              className="mx-5 mb-4 flex-row items-center gap-2 px-4 py-3 rounded-xl"
              style={{ backgroundColor: isDark ? 'rgba(239,68,68,0.12)' : '#FEE2E2' }}
            >
              <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
              <Caption className="text-xs flex-1" style={{ color: '#EF4444' }}>{error}</Caption>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default TimePickerModal;

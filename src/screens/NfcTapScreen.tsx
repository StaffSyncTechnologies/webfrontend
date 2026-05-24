/**
 * NfcTapScreen — opened automatically when a worker taps an NFC sticker.
 *
 * Features added:
 *  • Biometric confirmation before clock-in (if enrolled)
 *  • Offline queue — if no connection, saves locally and syncs on reconnect
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useOrgTheme, useTheme } from '../contexts';
import { useToast } from '../contexts/ToastContext';
import { useLocation } from '../hooks/useLocation';
import { useBiometric } from '../hooks/useBiometric';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { H3, Body } from '../components/ui';
import { ClockResultCard, ClockResultState } from '../components/ClockResultCard';
import { useNfcTapClockMutation } from '../store/api/nfcApi';
import { useAppSelector } from '../store/hooks';
import { enqueue } from '../services/clockQueueService';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'NfcTap'>;

export function NfcTapScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const { success: toastSuccess, error: toastError } = useToast();
  const { getCurrentLocation, latitude, longitude } = useLocation();
  const { isAvailable: hasBiometric, authenticate } = useBiometric();
  const { isOnline } = useNetworkStatus();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const { tagCode } = route.params;

  const [tapClock] = useNfcTapClockMutation();
  const [status, setStatus] = useState<'idle' | 'biometric' | 'loading' | 'done'>('idle');
  const [result, setResult] = useState<ClockResultState | null>(null);
  const calledRef = useRef(false);

  const bgColor = isDark ? '#111827' : '#F9FAFB';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subtextColor = isDark ? '#9CA3AF' : '#6B7280';

  useEffect(() => {
    if (!isAuthenticated || calledRef.current) return;
    calledRef.current = true;
    run();
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  async function run() {
    // 1. Biometric gate
    if (hasBiometric) {
      setStatus('biometric');
      const passed = await authenticate('Confirm identity to clock in');
      if (!passed) {
        setResult({ kind: 'error', message: 'Biometric check failed. Tap the sticker again to retry.' });
        setStatus('done');
        return;
      }
    }

    setStatus('loading');
    await getCurrentLocation();

    // 2. Offline path — queue and return
    if (!isOnline) {
      const event = await enqueue({
        tagCode,
        lat: latitude ?? undefined,
        lng: longitude ?? undefined,
        recordedAt: new Date().toISOString(),
        method: 'NFC',
      });
      setResult({ kind: 'offline', recordedAt: event.recordedAt, method: 'NFC' });
      setStatus('done');
      return;
    }

    // 3. Online path — call backend
    try {
      const res = await tapClock({
        tagCode,
        lat: latitude ?? undefined,
        lng: longitude ?? undefined,
      }).unwrap();

      const d = res.data;
      setResult({
        kind: 'success',
        action: d.action,
        shiftTitle: d.shiftTitle,
        hoursWorked: d.hoursWorked,
        pointName: d.nfcPoint.name,
      });
      toastSuccess(d.action === 'CLOCK_IN' ? 'Clocked in via NFC' : 'Clocked out via NFC');
    } catch (err: any) {
      const message =
        err?.data?.message ??
        'No active shift found at this location. Check your shift has started.';
      setResult({ kind: 'error', message });
      toastError(message);
    }

    setStatus('done');
  }

  // ── Not authenticated ──────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: bgColor, paddingTop: insets.top }}>
        <View className="w-28 h-28 rounded-full items-center justify-center mb-6" style={{ backgroundColor: `${primaryColor}20` }}>
          <Ionicons name="lock-closed-outline" size={52} color={primaryColor} />
        </View>
        <H3 className="text-center mb-3" style={{ color: textColor }}>Log in to clock in</H3>
        <Body className="text-center mb-8" style={{ color: subtextColor }}>
          You need to be logged in to use NFC clock-in. After logging in, tap the sticker again.
        </Body>
        <TouchableOpacity
          className="px-8 py-4 rounded-xl w-full items-center"
          style={{ backgroundColor: primaryColor }}
          onPress={() => navigation.replace('Auth' as any)}
        >
          <Body style={{ color: '#FFFFFF', fontWeight: '700' }}>Log In</Body>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Biometric / Loading ────────────────────────────────────────────────────
  if (status === 'idle' || status === 'biometric' || status === 'loading') {
    return (
      <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: bgColor, paddingTop: insets.top }}>
        <View className="w-28 h-28 rounded-full items-center justify-center mb-6" style={{ backgroundColor: `${primaryColor}20` }}>
          {status === 'loading' ? (
            <ActivityIndicator size="large" color={primaryColor} />
          ) : (
            <Ionicons
              name={status === 'biometric' ? 'finger-print-outline' : 'radio-outline'}
              size={52}
              color={primaryColor}
            />
          )}
        </View>
        <H3 className="text-center mb-2" style={{ color: textColor }}>
          {status === 'biometric' ? 'Confirm Identity' : 'Processing…'}
        </H3>
        <Body className="text-center" style={{ color: subtextColor }}>
          {status === 'biometric'
            ? 'Use Face ID or fingerprint to confirm your clock-in.'
            : 'Finding your shift and recording attendance.'}
        </Body>
      </View>
    );
  }

  // ── Result ─────────────────────────────────────────────────────────────────
  return (
    <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: bgColor, paddingTop: insets.top }}>
      {result && (
        <ClockResultCard
          result={result}
          primaryColor={primaryColor}
          textColor={textColor}
          subtextColor={subtextColor}
          isDark={isDark}
          onDone={() => navigation.replace('WorkerMain' as any)}
          onRetry={
            result.kind === 'error'
              ? () => {
                  calledRef.current = false;
                  setStatus('idle');
                  setResult(null);
                  run();
                }
              : undefined
          }
        />
      )}
    </View>
  );
}

export default NfcTapScreen;

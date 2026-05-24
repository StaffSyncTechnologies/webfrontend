import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Vibration,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrgTheme, useTheme } from '../contexts';
import { useToast } from '../contexts/ToastContext';
import { useLocation } from '../hooks/useLocation';
import { H2, H3, Body, Caption } from '../components/ui';
import { useNfcClockInMutation, useNfcClockOutMutation, useNfcClockInRotaMutation, useNfcClockOutRotaMutation } from '../store/api/nfcApi';
import {
  initNfc,
  isNfcSupported,
  isNfcEnabled,
  readNfcClockPoint,
  cancelNfcRequest,
  goToNfcSettings,
} from '../services/nfcService';

// ─── Props ────────────────────────────────────────────────────────────────────
// Add 'NfcClockIn' to RootStackParamList with these params when connecting:
// NfcClockIn: { shiftId: string; isRecurring?: boolean; rotaShiftId?: string; clockedIn?: boolean }

interface NfcClockInScreenProps {
  route: {
    params: {
      shiftId: string;
      isRecurring?: boolean;
      rotaShiftId?: string;
      clockedIn?: boolean;
    };
  };
  navigation: any;
}

type ScanState = 'idle' | 'scanning' | 'success' | 'error';

// ─── Component ────────────────────────────────────────────────────────────────

export function NfcClockInScreen({ route, navigation }: NfcClockInScreenProps) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const { success: toastSuccess, error: toastError } = useToast();
  const { getCurrentLocation, latitude, longitude } = useLocation();

  const { shiftId, isRecurring, rotaShiftId, clockedIn: initialClockedIn } = route.params;

  const [scanState, setScanState] = useState<ScanState>('idle');
  const [nfcAvailable, setNfcAvailable] = useState<boolean | null>(null);
  const [nfcEnabled, setNfcEnabled] = useState(true);
  const [isClockedIn, setIsClockedIn] = useState(initialClockedIn ?? false);
  const [resultMessage, setResultMessage] = useState('');
  const [hoursWorked, setHoursWorked] = useState<number | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const [nfcClockIn, { isLoading: clockingIn }] = useNfcClockInMutation();
  const [nfcClockOut, { isLoading: clockingOut }] = useNfcClockOutMutation();
  const [nfcClockInRota, { isLoading: clockingInRota }] = useNfcClockInRotaMutation();
  const [nfcClockOutRota, { isLoading: clockingOutRota }] = useNfcClockOutRotaMutation();

  const isLoading = clockingIn || clockingOut || clockingInRota || clockingOutRota;

  // ── Init NFC on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const supported = await isNfcSupported();
      setNfcAvailable(supported);
      if (supported) {
        await initNfc();
        const enabled = await isNfcEnabled();
        setNfcEnabled(enabled);
      }
    })();

    return () => {
      cancelNfcRequest();
    };
  }, []);

  // ── Start NFC scan ─────────────────────────────────────────────────────────
  const startScan = useCallback(async () => {
    if (isScanning || isLoading) return;
    if (!nfcAvailable) {
      Alert.alert('NFC Not Supported', 'This device does not support NFC.');
      return;
    }
    if (!nfcEnabled) {
      Alert.alert(
        'NFC Disabled',
        'Please enable NFC in your device settings to use this feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          ...(Platform.OS === 'android'
            ? [{ text: 'Open Settings', onPress: goToNfcSettings }]
            : []),
        ]
      );
      return;
    }

    setScanState('scanning');
    setIsScanning(true);
    setResultMessage('');

    try {
      await getCurrentLocation();

      const tagCode = await readNfcClockPoint();
      if (!tagCode) {
        setScanState('error');
        setResultMessage('Invalid tag — this is not a StaffSync NFC point.');
        return;
      }

      Vibration.vibrate(100);

      const payload = {
        tagCode,
        lat: latitude ?? undefined,
        lng: longitude ?? undefined,
      };

      if (isClockedIn) {
        // Clock out
        let result: any;
        if (isRecurring && rotaShiftId) {
          result = await nfcClockOutRota({ rotaShiftId, ...payload }).unwrap();
        } else {
          result = await nfcClockOut({ shiftId, ...payload }).unwrap();
        }
        setHoursWorked(result.data.hoursWorked);
        setIsClockedIn(false);
        setScanState('success');
        setResultMessage(`Clocked out successfully! You worked ${result.data.hoursWorked.toFixed(2)} hours.`);
        toastSuccess('Clocked out via NFC');
      } else {
        // Clock in
        if (isRecurring && rotaShiftId) {
          await nfcClockInRota({ rotaShiftId, ...payload }).unwrap();
        } else {
          await nfcClockIn({ shiftId, ...payload }).unwrap();
        }
        setIsClockedIn(true);
        setScanState('success');
        setResultMessage('Clocked in successfully! Your attendance has been recorded.');
        toastSuccess('Clocked in via NFC');
      }
    } catch (err: any) {
      setScanState('error');
      const msg =
        err?.data?.message ??
        err?.message ??
        'Something went wrong. Please try again.';
      setResultMessage(msg);
      toastError(msg);
    } finally {
      setIsScanning(false);
    }
  }, [
    isScanning, isLoading, nfcAvailable, nfcEnabled, isClockedIn,
    shiftId, isRecurring, rotaShiftId, latitude, longitude,
    nfcClockIn, nfcClockOut, nfcClockInRota, nfcClockOutRota,
    getCurrentLocation, toastSuccess, toastError,
  ]);

  const handleReset = () => {
    setScanState('idle');
    setResultMessage('');
  };

  // ── Render helpers ─────────────────────────────────────────────────────────
  const bgColor = isDark ? '#1F2937' : '#F9FAFB';
  const cardBg = isDark ? '#111827' : '#FFFFFF';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subtextColor = isDark ? '#9CA3AF' : '#6B7280';

  const renderIcon = () => {
    if (scanState === 'scanning') {
      return (
        <View className="items-center justify-center w-32 h-32 rounded-full" style={{ backgroundColor: `${primaryColor}20` }}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      );
    }
    if (scanState === 'success') {
      return (
        <View className="items-center justify-center w-32 h-32 rounded-full" style={{ backgroundColor: '#10B98120' }}>
          <Ionicons name="checkmark-circle" size={64} color="#10B981" />
        </View>
      );
    }
    if (scanState === 'error') {
      return (
        <View className="items-center justify-center w-32 h-32 rounded-full" style={{ backgroundColor: '#EF444420' }}>
          <Ionicons name="close-circle" size={64} color="#EF4444" />
        </View>
      );
    }
    return (
      <TouchableOpacity
        onPress={startScan}
        activeOpacity={0.8}
        className="items-center justify-center w-32 h-32 rounded-full"
        style={{ backgroundColor: isClockedIn ? '#EF444420' : `${primaryColor}20` }}
      >
        <Ionicons
          name="phone-portrait-outline"
          size={56}
          color={isClockedIn ? '#EF4444' : primaryColor}
        />
      </TouchableOpacity>
    );
  };

  // ── NFC unavailable state ──────────────────────────────────────────────────
  if (nfcAvailable === false) {
    return (
      <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: bgColor, paddingTop: insets.top }}>
        <Ionicons name="wifi-outline" size={64} color="#9CA3AF" />
        <H3 className="mt-4 text-center" style={{ color: textColor }}>NFC Not Available</H3>
        <Body className="mt-2 text-center" style={{ color: subtextColor }}>
          Your device does not support NFC. Please use the standard GPS clock-in instead.
        </Body>
        <TouchableOpacity
          className="mt-6 px-6 py-3 rounded-xl"
          style={{ backgroundColor: primaryColor }}
          onPress={() => navigation.goBack()}
        >
          <Body style={{ color: '#FFFFFF', fontWeight: '600' }}>Go Back</Body>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: bgColor, paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <H2 style={{ color: textColor }}>NFC Clock {isClockedIn ? 'Out' : 'In'}</H2>
      </View>

      {/* Status pill */}
      <View className="px-5 mb-4">
        <View
          className="flex-row items-center self-start px-3 py-1 rounded-full"
          style={{ backgroundColor: isClockedIn ? '#10B98120' : '#F59E0B20' }}
        >
          <View
            className="w-2 h-2 rounded-full mr-2"
            style={{ backgroundColor: isClockedIn ? '#10B981' : '#F59E0B' }}
          />
          <Caption style={{ color: isClockedIn ? '#10B981' : '#F59E0B' }}>
            {isClockedIn ? 'Currently clocked in' : 'Not clocked in'}
          </Caption>
        </View>
      </View>

      {/* Main card */}
      <View className="flex-1 items-center justify-center px-6">
        <View
          className="w-full rounded-3xl p-8 items-center"
          style={{ backgroundColor: cardBg, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 }}
        >
          {renderIcon()}

          <H3 className="mt-6 text-center" style={{ color: textColor }}>
            {scanState === 'scanning'
              ? 'Hold phone near NFC tag...'
              : scanState === 'success'
              ? isClockedIn
                ? 'Clocked In!'
                : 'Clocked Out!'
              : scanState === 'error'
              ? 'Scan Failed'
              : isClockedIn
              ? 'Tap to Clock Out'
              : 'Tap to Clock In'}
          </H3>

          {resultMessage ? (
            <Body
              className="mt-3 text-center"
              style={{ color: scanState === 'error' ? '#EF4444' : '#10B981' }}
            >
              {resultMessage}
            </Body>
          ) : (
            <Body className="mt-3 text-center" style={{ color: subtextColor }}>
              {scanState === 'scanning'
                ? 'Keep your phone near the NFC sticker until the scan completes.'
                : 'Tap the button above, then hold your phone close to the StaffSync NFC sticker at your work site.'}
            </Body>
          )}

          {hoursWorked !== null && scanState === 'success' && !isClockedIn && (
            <View className="mt-4 px-5 py-3 rounded-xl" style={{ backgroundColor: '#10B98115' }}>
              <Caption style={{ color: '#10B981', textAlign: 'center' }}>
                Total hours worked: {hoursWorked.toFixed(2)} hrs
              </Caption>
            </View>
          )}

          {/* Action buttons */}
          <View className="mt-8 w-full gap-3">
            {scanState === 'idle' && (
              <TouchableOpacity
                className="py-4 rounded-xl items-center"
                style={{ backgroundColor: isClockedIn ? '#EF4444' : primaryColor }}
                onPress={startScan}
                disabled={isLoading || nfcAvailable === null}
              >
                <Body style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>
                  {isClockedIn ? 'Scan to Clock Out' : 'Scan to Clock In'}
                </Body>
              </TouchableOpacity>
            )}

            {scanState === 'scanning' && (
              <TouchableOpacity
                className="py-4 rounded-xl items-center border"
                style={{ borderColor: '#EF4444' }}
                onPress={() => {
                  cancelNfcRequest();
                  setScanState('idle');
                  setIsScanning(false);
                }}
              >
                <Body style={{ color: '#EF4444', fontWeight: '600' }}>Cancel Scan</Body>
              </TouchableOpacity>
            )}

            {(scanState === 'success' || scanState === 'error') && (
              <>
                {scanState === 'error' && (
                  <TouchableOpacity
                    className="py-4 rounded-xl items-center"
                    style={{ backgroundColor: primaryColor }}
                    onPress={handleReset}
                  >
                    <Body style={{ color: '#FFFFFF', fontWeight: '600' }}>Try Again</Body>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  className="py-4 rounded-xl items-center border"
                  style={{ borderColor: primaryColor }}
                  onPress={() => navigation.goBack()}
                >
                  <Body style={{ color: primaryColor, fontWeight: '600' }}>
                    {scanState === 'success' ? 'Done' : 'Go Back'}
                  </Body>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Info row */}
        {scanState === 'idle' && (
          <View className="mt-6 flex-row items-center gap-2">
            <Ionicons name="information-circle-outline" size={16} color={subtextColor} />
            <Caption style={{ color: subtextColor }}>
              NFC clock-in verifies your physical presence at the work site.
            </Caption>
          </View>
        )}
      </View>
    </View>
  );
}

export default NfcClockInScreen;

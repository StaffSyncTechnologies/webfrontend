/**
 * QRClockInScreen — worker scans the QR code posted at their work site.
 *
 * Features:
 *  • Camera-based QR scanner (expo-camera)
 *  • Biometric confirmation before submitting
 *  • Offline queue if no connection
 *  • Reuses /nfc/tap-clock backend endpoint (same tagCode format)
 */

import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Vibration,
} from 'react-native';
import {
  CameraView,
  useCameraPermissions,
  isCameraModuleAvailable,
} from '../shims/camera.shim';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useOrgTheme, useTheme } from '../contexts';
import { useToast } from '../contexts/ToastContext';
import { useLocation } from '../hooks/useLocation';
import { useBiometric } from '../hooks/useBiometric';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { H2, H3, Body, Caption } from '../components/ui';
import { ClockResultCard, ClockResultState } from '../components/ClockResultCard';
import { useNfcTapClockMutation } from '../store/api/nfcApi';
import { enqueue } from '../services/clockQueueService';
import { extractTagCodeFromUri } from '../services/nfcService';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'QRClockIn'>;

type ScanStatus = 'scanning' | 'processing' | 'done';

export function QRClockInScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const { success: toastSuccess, error: toastError } = useToast();
  const { getCurrentLocation, latitude, longitude } = useLocation();
  const { isAvailable: hasBiometric, authenticate } = useBiometric();
  const { isOnline } = useNetworkStatus();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanStatus, setScanStatus] = useState<ScanStatus>('scanning');
  const [result, setResult] = useState<ClockResultState | null>(null);
  const [tapClock] = useNfcTapClockMutation();
  const scannedRef = useRef(false); // prevent double-scan

  const bgColor = isDark ? '#111827' : '#F9FAFB';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subtextColor = isDark ? '#9CA3AF' : '#6B7280';

  // ── QR code scanned ────────────────────────────────────────────────────────
  async function handleBarCodeScanned({ data }: { data: string }) {
    if (scannedRef.current) return;
    scannedRef.current = true;

    Vibration.vibrate(80);

    // Extract tagCode from URI — must be a StaffSync QR code
    const tagCode = extractTagCodeFromUri(data);
    if (!tagCode) {
      Alert.alert(
        'Invalid QR Code',
        'This is not a StaffSync clock-in QR code. Please scan the code posted at your work site.',
        [{ text: 'OK', onPress: () => { scannedRef.current = false; } }],
      );
      return;
    }

    setScanStatus('processing');

    // Biometric gate
    if (hasBiometric) {
      const passed = await authenticate('Confirm identity to clock in');
      if (!passed) {
        setResult({ kind: 'error', message: 'Biometric check failed. Scan again to retry.' });
        setScanStatus('done');
        return;
      }
    }

    await getCurrentLocation();

    // Offline path
    if (!isOnline) {
      const event = await enqueue({
        tagCode,
        lat: latitude ?? undefined,
        lng: longitude ?? undefined,
        recordedAt: new Date().toISOString(),
        method: 'QR',
      });
      setResult({ kind: 'offline', recordedAt: event.recordedAt, method: 'QR' });
      setScanStatus('done');
      return;
    }

    // Online path
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
      toastSuccess(d.action === 'CLOCK_IN' ? 'Clocked in via QR' : 'Clocked out via QR');
    } catch (err: any) {
      const message = err?.data?.message ?? 'No active shift found. Check your shift has started.';
      setResult({ kind: 'error', message });
      toastError(message);
    }

    setScanStatus('done');
  }

  // ── Camera module not available (Expo Go) ─────────────────────────────────
  if (!isCameraModuleAvailable) {
    return (
      <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: bgColor, paddingTop: insets.top }}>
        <View className="flex-row items-center px-5 py-4 w-full mb-8">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <H2 style={{ color: textColor }}>QR Clock In</H2>
        </View>
        <Ionicons name="camera-outline" size={64} color={subtextColor} />
        <H3 className="mt-4 text-center mb-2" style={{ color: textColor }}>Camera Not Available</H3>
        <Body className="text-center" style={{ color: subtextColor }}>
          QR scanning requires a native build.{'\n'}Use Expo Go only for testing other features.
        </Body>
      </View>
    );
  }

  // ── Camera permission not granted ──────────────────────────────────────────
  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: bgColor, paddingTop: insets.top }}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: bgColor, paddingTop: insets.top }}>
        <View className="flex-row items-center px-5 py-4 w-full mb-8">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <H2 style={{ color: textColor }}>QR Clock In</H2>
        </View>
        <Ionicons name="camera-outline" size={64} color={subtextColor} />
        <H3 className="mt-4 text-center mb-2" style={{ color: textColor }}>Camera Permission Needed</H3>
        <Body className="text-center mb-8" style={{ color: subtextColor }}>
          StaffSync needs camera access to scan the QR code at your work site.
        </Body>
        <TouchableOpacity
          className="px-8 py-4 rounded-xl w-full items-center"
          style={{ backgroundColor: primaryColor }}
          onPress={requestPermission}
        >
          <Body style={{ color: '#FFFFFF', fontWeight: '700' }}>Allow Camera</Body>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Done (show result) ─────────────────────────────────────────────────────
  if (scanStatus === 'done' && result) {
    return (
      <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: bgColor, paddingTop: insets.top }}>
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
                  scannedRef.current = false;
                  setResult(null);
                  setScanStatus('scanning');
                }
              : undefined
          }
        />
      </View>
    );
  }

  // ── Camera + scanning overlay ──────────────────────────────────────────────
  return (
    <View className="flex-1" style={{ backgroundColor: '#000000', paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <H2 style={{ color: '#FFFFFF' }}>QR Clock In</H2>
      </View>

      {/* Camera */}
      <View className="flex-1 relative">
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={scanStatus === 'scanning' ? handleBarCodeScanned : undefined}
        />

        {/* Scan frame overlay */}
        <View className="absolute inset-0 items-center justify-center">
          {scanStatus === 'processing' ? (
            <View className="w-48 h-48 rounded-2xl items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
              <ActivityIndicator size="large" color={primaryColor} />
              <Caption style={{ color: '#FFFFFF', marginTop: 12 }}>Processing…</Caption>
            </View>
          ) : (
            <>
              {/* Corner brackets */}
              <View style={{ width: 220, height: 220, position: 'relative' }}>
                {[
                  { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 12 },
                  { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 12 },
                  { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 12 },
                  { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 12 },
                ].map((style, i) => (
                  <View
                    key={i}
                    style={[
                      { position: 'absolute', width: 40, height: 40, borderColor: primaryColor },
                      style,
                    ]}
                  />
                ))}
              </View>
              <Body style={{ color: '#FFFFFF', marginTop: 24, textAlign: 'center' }}>
                Point camera at the QR code
              </Body>
            </>
          )}
        </View>
      </View>

      {/* Footer hint */}
      <View className="px-6 py-4 items-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
        <Caption style={{ color: '#9CA3AF', textAlign: 'center' }}>
          Scan the StaffSync QR code displayed at your work site entrance.
        </Caption>
      </View>
    </View>
  );
}

export default QRClockInScreen;

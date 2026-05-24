import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Vibration,
  Platform,
} from 'react-native';
// Lazy-require expo-clipboard — its native module is absent in Expo Go and
// would crash with "Cannot find native module 'ExpoClipboard'" at import time.
type ClipboardModule = { setStringAsync: (text: string) => Promise<void> };
let Clipboard: ClipboardModule = { setStringAsync: async () => {} }; // no-op stub
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Clipboard = require('expo-clipboard') as ClipboardModule;
} catch { /* Expo Go — copy silently skipped */ }
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrgTheme, useTheme } from '../../../contexts';
import { useToast } from '../../../contexts/ToastContext';
import { H2, H3, Body, Caption } from '../../../components/ui';
import { useMarkNfcTagWrittenMutation, NfcClockPoint } from '../../../store/api/nfcApi';
import {
  initNfc,
  isNfcSupported,
  isNfcEnabled,
  writeNfcClockPoint,
  cancelNfcRequest,
  buildNfcUri,
  goToNfcSettings,
  formatTagCode,
} from '../../../services/nfcService';

// ─── Props ────────────────────────────────────────────────────────────────────
// Add 'WriteNfcTag' to RootStackParamList when connecting:
// WriteNfcTag: { point: NfcClockPoint }

interface WriteNfcTagScreenProps {
  route: { params: { point: NfcClockPoint } };
  navigation: any;
}

type WriteState = 'idle' | 'waiting' | 'writing' | 'success' | 'error';

// ─── Component ────────────────────────────────────────────────────────────────

export function WriteNfcTagScreen({ route, navigation }: WriteNfcTagScreenProps) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const { success: toastSuccess, error: toastError } = useToast();

  const { point } = route.params;

  const [writeState, setWriteState] = useState<WriteState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [nfcAvailable, setNfcAvailable] = useState<boolean | null>(null);
  const [nfcEnabled, setNfcEnabled] = useState(true);

  const [markWritten, { isLoading: markingWritten }] = useMarkNfcTagWrittenMutation();

  const bgColor = isDark ? '#111827' : '#F9FAFB';
  const cardBg = isDark ? '#1F2937' : '#FFFFFF';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subtextColor = isDark ? '#9CA3AF' : '#6B7280';
  const borderColor = isDark ? '#374151' : '#E5E7EB';

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

  // ── Start write ────────────────────────────────────────────────────────────
  const handleWrite = async () => {
    if (!nfcAvailable) {
      Alert.alert('NFC Not Supported', 'This device does not support NFC.');
      return;
    }
    if (!nfcEnabled) {
      Alert.alert(
        'NFC Disabled',
        'Please enable NFC in settings to write to a tag.',
        [
          { text: 'Cancel', style: 'cancel' },
          ...(Platform.OS === 'android'
            ? [{ text: 'Open Settings', onPress: goToNfcSettings }]
            : []),
        ]
      );
      return;
    }

    setWriteState('waiting');
    setErrorMessage('');

    try {
      setWriteState('writing');
      await writeNfcClockPoint(point.tagCode);

      Vibration.vibrate([0, 100, 50, 100]);

      // Mark as written in backend → sets status to ACTIVE
      await markWritten(point.id).unwrap();

      setWriteState('success');
      toastSuccess('NFC tag written and activated!');
    } catch (err: any) {
      setWriteState('error');
      const msg =
        err?.message?.includes('cancelled')
          ? 'Write cancelled. Try again when ready.'
          : err?.data?.message ?? err?.message ?? 'Failed to write NFC tag.';
      setErrorMessage(msg);
      toastError(msg);
    }
  };

  const handleCancel = () => {
    cancelNfcRequest();
    setWriteState('idle');
  };

  const copyTagCode = async () => {
    await Clipboard.setStringAsync(point.tagCode);
    toastSuccess('Tag code copied!');
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const renderStateIcon = () => {
    switch (writeState) {
      case 'waiting':
      case 'writing':
        return (
          <View className="w-32 h-32 rounded-full items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
            <ActivityIndicator size="large" color={primaryColor} />
          </View>
        );
      case 'success':
        return (
          <View className="w-32 h-32 rounded-full items-center justify-center" style={{ backgroundColor: '#10B98120' }}>
            <Ionicons name="checkmark-circle" size={64} color="#10B981" />
          </View>
        );
      case 'error':
        return (
          <View className="w-32 h-32 rounded-full items-center justify-center" style={{ backgroundColor: '#EF444420' }}>
            <Ionicons name="close-circle" size={64} color="#EF4444" />
          </View>
        );
      default:
        return (
          <TouchableOpacity
            onPress={handleWrite}
            className="w-32 h-32 rounded-full items-center justify-center"
            style={{ backgroundColor: `${primaryColor}20` }}
            activeOpacity={0.8}
          >
            <Ionicons name="radio-outline" size={56} color={primaryColor} />
          </TouchableOpacity>
        );
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: bgColor, paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <View>
          <H2 style={{ color: textColor }}>Write NFC Tag</H2>
          <Caption style={{ color: subtextColor }}>{point.name}</Caption>
        </View>
      </View>

      <View className="flex-1 px-5">
        {/* Tag code display */}
        <TouchableOpacity
          className="rounded-2xl p-4 mb-6 flex-row items-center"
          style={{ backgroundColor: cardBg, borderWidth: 1, borderColor }}
          onPress={copyTagCode}
          activeOpacity={0.7}
        >
          <View className="flex-1">
            <Caption style={{ color: subtextColor, marginBottom: 4 }}>TAG CODE</Caption>
            <Body style={{ color: textColor, fontFamily: 'monospace', fontWeight: '700', letterSpacing: 1 }}>
              {formatTagCode(point.tagCode)}
            </Body>
            <Caption style={{ color: subtextColor, marginTop: 2 }}>
              Will write: {buildNfcUri(point.tagCode)}
            </Caption>
          </View>
          <Ionicons name="copy-outline" size={20} color={subtextColor} />
        </TouchableOpacity>

        {/* State illustration */}
        <View className="items-center mt-4">
          {renderStateIcon()}

          <H3 className="mt-6 text-center" style={{ color: textColor }}>
            {writeState === 'idle' && 'Ready to Write'}
            {writeState === 'waiting' && 'Hold tag near phone...'}
            {writeState === 'writing' && 'Writing...'}
            {writeState === 'success' && 'Tag Written!'}
            {writeState === 'error' && 'Write Failed'}
          </H3>

          <Body className="mt-3 text-center" style={{ color: subtextColor }}>
            {writeState === 'idle' && 'Tap the button above, then hold a blank NTAG213/215/216 sticker firmly against the back of your phone.'}
            {(writeState === 'waiting' || writeState === 'writing') && 'Keep the NFC sticker pressed against the phone until the vibration confirms success.'}
            {writeState === 'success' && 'The tag is programmed and the clock point is now ACTIVE. Workers can tap it to clock in.'}
            {writeState === 'error' && (errorMessage || 'Something went wrong. Make sure the NFC sticker is blank and touching your phone.')}
          </Body>
        </View>

        {/* Supported tags note */}
        {writeState === 'idle' && (
          <View
            className="mt-8 rounded-2xl p-4"
            style={{ backgroundColor: cardBg, borderWidth: 1, borderColor }}
          >
            <View className="flex-row items-center mb-3">
              <Ionicons name="hardware-chip-outline" size={16} color={primaryColor} />
              <Caption style={{ color: textColor, fontWeight: '700', marginLeft: 6 }}>Supported NFC Tags</Caption>
            </View>
            {['NTAG213 (Recommended)', 'NTAG215', 'NTAG216', 'NFC Stickers', 'PVC NFC Cards', 'NFC Keychains'].map((tag) => (
              <View key={tag} className="flex-row items-center mb-1">
                <Ionicons name="checkmark" size={12} color="#10B981" />
                <Caption style={{ color: subtextColor, marginLeft: 6 }}>{tag}</Caption>
              </View>
            ))}
          </View>
        )}

        {/* Action buttons */}
        <View className="mt-auto pb-6 gap-3 mt-8">
          {writeState === 'idle' && (
            <TouchableOpacity
              className="py-4 rounded-xl items-center"
              style={{ backgroundColor: primaryColor }}
              onPress={handleWrite}
              disabled={nfcAvailable === null}
            >
              <Body style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>
                {nfcAvailable === null ? 'Checking NFC...' : 'Write to NFC Tag'}
              </Body>
            </TouchableOpacity>
          )}

          {(writeState === 'waiting' || writeState === 'writing') && (
            <TouchableOpacity
              className="py-4 rounded-xl items-center border"
              style={{ borderColor: '#EF4444' }}
              onPress={handleCancel}
            >
              <Body style={{ color: '#EF4444', fontWeight: '600' }}>Cancel</Body>
            </TouchableOpacity>
          )}

          {writeState === 'error' && (
            <>
              <TouchableOpacity
                className="py-4 rounded-xl items-center"
                style={{ backgroundColor: primaryColor }}
                onPress={() => setWriteState('idle')}
              >
                <Body style={{ color: '#FFFFFF', fontWeight: '600' }}>Try Again</Body>
              </TouchableOpacity>
              <TouchableOpacity
                className="py-4 rounded-xl items-center border"
                style={{ borderColor }}
                onPress={() => navigation.goBack()}
              >
                <Body style={{ color: textColor, fontWeight: '600' }}>Go Back</Body>
              </TouchableOpacity>
            </>
          )}

          {writeState === 'success' && (
            <>
              <TouchableOpacity
                className="py-4 rounded-xl items-center"
                style={{ backgroundColor: primaryColor }}
                onPress={() => navigation.navigate('NfcManagement')}
              >
                <Body style={{ color: '#FFFFFF', fontWeight: '700' }}>Back to NFC Points</Body>
              </TouchableOpacity>
              <TouchableOpacity
                className="py-4 rounded-xl items-center border"
                style={{ borderColor }}
                onPress={() => setWriteState('idle')}
              >
                <Body style={{ color: textColor, fontWeight: '600' }}>Write Another Tag</Body>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

export default WriteNfcTagScreen;

/**
 * QRCodeDisplayScreen — admin shows / shares the QR code for a clock point.
 *
 * The QR code encodes the same URI as the NFC sticker:
 *   staffsync-worker://nfc-clock/{tagCode}
 *
 * Admin can:
 *  • Show it full-screen for workers to scan from a phone/tablet
 *  • Share it to print and stick on the wall
 */

import React from 'react';
import { View, TouchableOpacity, Share, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useOrgTheme, useTheme } from '../../../contexts';
import { useToast } from '../../../contexts/ToastContext';
import { H2, H3, Body, Caption } from '../../../components/ui';
import { buildNfcUri, formatTagCode } from '../../../services/nfcService';
import type { RootStackParamList } from '../../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'QRCodeDisplay'>;

export function QRCodeDisplayScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const { success: toastSuccess } = useToast();

  const { point } = route.params;
  const uri = buildNfcUri(point.tagCode); // staffsync-worker://nfc-clock/{tagCode}

  const bgColor = isDark ? '#111827' : '#F9FAFB';
  const cardBg = isDark ? '#1F2937' : '#FFFFFF';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subtextColor = isDark ? '#9CA3AF' : '#6B7280';
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  const handleShare = async () => {
    try {
      await Share.share({
        title: `StaffSync QR Code — ${point.name}`,
        message:
          `Clock-in QR code for: ${point.name}\n` +
          (point.location ? `Site: ${point.location.name}\n` : '') +
          `Tag: ${formatTagCode(point.tagCode)}\n\n` +
          `Ask your admin to print this QR code and display it at the work site entrance.`,
      });
    } catch {
      // user cancelled
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: bgColor, paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <View className="flex-1">
          <H2 style={{ color: textColor }}>QR Code</H2>
          <Caption style={{ color: subtextColor }}>{point.name}</Caption>
        </View>
        <TouchableOpacity
          className="p-2"
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={24} color={primaryColor} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* QR Code card */}
        <View
          className="rounded-3xl p-8 items-center mb-6"
          style={{ backgroundColor: cardBg, borderWidth: 1, borderColor }}
        >
          <View className="bg-white p-4 rounded-2xl mb-5">
            <QRCode
              value={uri}
              size={220}
              color="#111827"
              backgroundColor="#FFFFFF"
              logo={undefined}
            />
          </View>

          <H3 className="text-center mb-1" style={{ color: textColor }}>{point.name}</H3>
          {point.location && (
            <Caption style={{ color: subtextColor, marginBottom: 6 }}>{point.location.name}</Caption>
          )}

          {/* Tag code chip */}
          <View
            className="flex-row items-center px-4 py-2 rounded-full mt-2"
            style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6' }}
          >
            <Ionicons name="barcode-outline" size={13} color={subtextColor} />
            <Caption style={{ color: subtextColor, fontFamily: 'monospace', marginLeft: 6 }}>
              {formatTagCode(point.tagCode)}
            </Caption>
          </View>
        </View>

        {/* How to use */}
        <View
          className="rounded-2xl p-4 mb-4"
          style={{ backgroundColor: `${primaryColor}12` }}
        >
          <View className="flex-row items-center mb-3">
            <Ionicons name="information-circle-outline" size={16} color={primaryColor} />
            <Caption style={{ color: primaryColor, fontWeight: '700', marginLeft: 6 }}>How to use</Caption>
          </View>
          {[
            { icon: 'print-outline', text: 'Print this QR code and display it at the work site entrance' },
            { icon: 'phone-portrait-outline', text: 'Workers open the app and tap "QR Clock In" from their shift' },
            { icon: 'qr-code-outline', text: 'They point the camera at this code — attendance is recorded instantly' },
            { icon: 'wifi-outline', text: 'Works offline too — syncs when back online' },
          ].map((item, i) => (
            <View key={i} className="flex-row items-start mb-2">
              <View
                className="w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <Ionicons name={item.icon as any} size={12} color={primaryColor} />
              </View>
              <Body style={{ color: subtextColor, flex: 1, fontSize: 13 }}>{item.text}</Body>
            </View>
          ))}
        </View>

        {/* Share button */}
        <TouchableOpacity
          className="py-4 rounded-xl items-center flex-row justify-center gap-2 mb-10"
          style={{ backgroundColor: primaryColor }}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={18} color="#FFFFFF" />
          <Body style={{ color: '#FFFFFF', fontWeight: '700' }}>Share / Print QR Code</Body>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

export default QRCodeDisplayScreen;

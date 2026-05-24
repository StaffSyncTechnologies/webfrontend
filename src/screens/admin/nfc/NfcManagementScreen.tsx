import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOrgTheme, useTheme } from '../../../contexts';
import { useToast } from '../../../contexts/ToastContext';
import { H2, H3, Body, Caption, Badge } from '../../../components/ui';
import {
  useGetNfcClockPointsQuery,
  useActivateNfcPointMutation,
  useDeactivateNfcPointMutation,
  useDeleteNfcPointMutation,
  NfcClockPoint,
  NfcPointStatus,
} from '../../../store/api/nfcApi';
import type { RootStackParamList } from '../../../types/navigation';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<NfcPointStatus, string> = {
  ACTIVE: '#10B981',
  PENDING: '#F59E0B',
  INACTIVE: '#EF4444',
};

const STATUS_LABEL: Record<NfcPointStatus, string> = {
  ACTIVE: 'Active',
  PENDING: 'Pending',
  INACTIVE: 'Inactive',
};

const STATUS_VARIANT: Record<NfcPointStatus, string> = {
  ACTIVE: 'success',
  PENDING: 'warning',
  INACTIVE: 'error',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function NfcManagementScreen() {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const { success: toastSuccess, error: toastError } = useToast();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [statusFilter, setStatusFilter] = useState<NfcPointStatus | undefined>(undefined);

  const { data, isLoading, refetch } = useGetNfcClockPointsQuery(
    statusFilter ? { status: statusFilter } : undefined
  );

  const [activatePoint] = useActivateNfcPointMutation();
  const [deactivatePoint] = useDeactivateNfcPointMutation();
  const [deletePoint] = useDeleteNfcPointMutation();

  const points = data?.data ?? [];

  const bgColor = isDark ? '#111827' : '#F9FAFB';
  const cardBg = isDark ? '#1F2937' : '#FFFFFF';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subtextColor = isDark ? '#9CA3AF' : '#6B7280';
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  const handleActivate = async (point: NfcClockPoint) => {
    try {
      await activatePoint(point.id).unwrap();
      toastSuccess(`${point.name} activated`);
    } catch {
      toastError('Failed to activate NFC point');
    }
  };

  const handleDeactivate = async (point: NfcClockPoint) => {
    Alert.alert('Deactivate Tag', `Workers won't be able to use "${point.name}" until re-activated.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Deactivate',
        style: 'destructive',
        onPress: async () => {
          try {
            await deactivatePoint(point.id).unwrap();
            toastSuccess(`${point.name} deactivated`);
          } catch {
            toastError('Failed to deactivate NFC point');
          }
        },
      },
    ]);
  };

  const handleDelete = async (point: NfcClockPoint) => {
    Alert.alert(
      'Delete NFC Point',
      `Are you sure you want to permanently delete "${point.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePoint(point.id).unwrap();
              toastSuccess(`${point.name} deleted`);
            } catch {
              toastError('Failed to delete NFC point');
            }
          },
        },
      ]
    );
  };

  const FILTERS: Array<{ label: string; value: NfcPointStatus | undefined }> = [
    { label: 'All', value: undefined },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Inactive', value: 'INACTIVE' },
  ];

  return (
    <View className="flex-1" style={{ backgroundColor: bgColor, paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <View>
          <H2 style={{ color: textColor }}>NFC Clock Points</H2>
          <Caption style={{ color: subtextColor }}>{points.length} point{points.length !== 1 ? 's' : ''} configured</Caption>
        </View>
        <TouchableOpacity
          className="flex-row items-center px-4 py-2 rounded-xl"
          style={{ backgroundColor: primaryColor }}
          onPress={() => (navigation as any).navigate('CreateNfcPoint')}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Body style={{ color: '#FFFFFF', fontWeight: '600', marginLeft: 4 }}>New Point</Body>
        </TouchableOpacity>
      </View>

      {/* Status filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, marginBottom: 16 }}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 20, alignItems: 'center' }}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.label}
            className="px-4 py-2 rounded-full"
            style={{
              backgroundColor: statusFilter === f.value ? primaryColor : isDark ? '#374151' : '#F3F4F6',
            }}
            onPress={() => setStatusFilter(f.value)}
          >
            <Caption style={{ color: statusFilter === f.value ? '#FFFFFF' : subtextColor, fontWeight: '600' }}>
              {f.label}
            </Caption>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      ) : points.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="wifi-outline" size={56} color={subtextColor} />
          <H3 className="mt-4 text-center" style={{ color: textColor }}>No NFC Points Yet</H3>
          <Body className="mt-2 text-center" style={{ color: subtextColor }}>
            Create your first NFC clock point and write it to a physical NFC sticker to get started.
          </Body>
          <TouchableOpacity
            className="mt-6 px-6 py-3 rounded-xl"
            style={{ backgroundColor: primaryColor }}
            onPress={() => (navigation as any).navigate('CreateNfcPoint')}
          >
            <Body style={{ color: '#FFFFFF', fontWeight: '600' }}>Create First NFC Point</Body>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          <View className="gap-3 pb-8">
            {points.map((point) => (
              <View
                key={point.id}
                className="rounded-2xl p-4"
                style={{ backgroundColor: cardBg, borderWidth: 1, borderColor }}
              >
                {/* Top row */}
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1 mr-3">
                    <Body style={{ color: textColor, fontWeight: '700', fontSize: 15 }}>{point.name}</Body>
                    <Caption style={{ color: subtextColor, marginTop: 2 }}>
                      {point.location?.name ?? 'No site assigned'}
                    </Caption>
                  </View>
                  <View
                    className="px-2 py-1 rounded-full"
                    style={{ backgroundColor: `${STATUS_COLOR[point.status]}20` }}
                  >
                    <Caption style={{ color: STATUS_COLOR[point.status], fontWeight: '700' }}>
                      {STATUS_LABEL[point.status]}
                    </Caption>
                  </View>
                </View>

                {/* Tag code */}
                <View
                  className="px-3 py-2 rounded-lg mb-3 flex-row items-center"
                  style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6' }}
                >
                  <Ionicons name="barcode-outline" size={14} color={subtextColor} />
                  <Caption style={{ color: subtextColor, fontFamily: 'monospace', marginLeft: 6 }}>
                    {point.tagCode}
                  </Caption>
                </View>

                {/* Metadata row */}
                <View className="flex-row items-center gap-4 mb-4">
                  {point.writtenAt ? (
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                      <Caption style={{ color: '#10B981' }}>Written {formatDate(point.writtenAt)}</Caption>
                    </View>
                  ) : (
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="time-outline" size={14} color="#F59E0B" />
                      <Caption style={{ color: '#F59E0B' }}>Not written to tag yet</Caption>
                    </View>
                  )}
                  <Caption style={{ color: subtextColor }}>
                    Created {formatDate(point.createdAt)}
                  </Caption>
                </View>

                {/* Action buttons */}
                <View className="flex-row gap-2">
                  {point.status === 'PENDING' && (
                    <TouchableOpacity
                      className="flex-1 py-2 rounded-xl items-center flex-row justify-center gap-1"
                      style={{ backgroundColor: '#6366F1' }}
                      onPress={() => (navigation as any).navigate('WriteNfcTag', { point })}
                    >
                      <Ionicons name="radio-outline" size={14} color="#FFFFFF" />
                      <Caption style={{ color: '#FFFFFF', fontWeight: '700' }}>Write Tag</Caption>
                    </TouchableOpacity>
                  )}

                  {point.status === 'INACTIVE' && (
                    <TouchableOpacity
                      className="flex-1 py-2 rounded-xl items-center"
                      style={{ backgroundColor: '#10B981' }}
                      onPress={() => handleActivate(point)}
                    >
                      <Caption style={{ color: '#FFFFFF', fontWeight: '700' }}>Activate</Caption>
                    </TouchableOpacity>
                  )}

                  {point.status === 'ACTIVE' && (
                    <>
                      <TouchableOpacity
                        className="flex-1 py-2 rounded-xl items-center"
                        style={{ backgroundColor: '#10B981' }}
                        onPress={() => (navigation as any).navigate('QRCodeDisplay', { point })}
                      >
                        <Caption style={{ color: '#FFFFFF', fontWeight: '700' }}>QR Code</Caption>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="flex-1 py-2 rounded-xl items-center"
                        style={{ backgroundColor: '#F59E0B' }}
                        onPress={() => handleDeactivate(point)}
                      >
                        <Caption style={{ color: '#FFFFFF', fontWeight: '700' }}>Deactivate</Caption>
                      </TouchableOpacity>
                    </>
                  )}

                  <TouchableOpacity
                    className="py-2 px-4 rounded-xl items-center border"
                    style={{ borderColor: '#EF4444' }}
                    onPress={() => handleDelete(point)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

export default NfcManagementScreen;

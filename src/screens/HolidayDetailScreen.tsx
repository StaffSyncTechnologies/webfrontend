import React from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types/navigation';
import { useOrgTheme, useTheme } from '../contexts';
import { H2, H3, Body, Caption, Button } from '../components/ui';
import { useGetHolidayDetailQuery, useCancelHolidayRequestMutation } from '../store/api/workerApi';

export function HolidayDetailScreen({ route, navigation }: RootStackScreenProps<'HolidayDetail'>) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const { holidayId } = route.params;

  const { data: holidayResponse, isLoading, refetch } = useGetHolidayDetailQuery(holidayId);
  const [cancelHolidayRequest, { isLoading: isCancelling }] = useCancelHolidayRequestMutation();

  const holiday = holidayResponse?.data;

  const STATUS_CONFIG = {
    APPROVED: { label: 'APPROVED', bg: '#DCFCE7', text: '#16A34A' },
    PENDING: { label: 'PENDING', bg: '#FEF3C7', text: '#D97706' },
    DENIED: { label: 'DENIED', bg: '#FEE2E2', text: '#DC2626' },
    CANCELLED: { label: 'CANCELLED', bg: '#F3F4F6', text: '#6B7280' },
  };

  const config = STATUS_CONFIG[holiday?.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;

  const handleCancel = async () => {
    Alert.alert(
      'Cancel Holiday Request',
      'Are you sure you want to cancel this holiday request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelHolidayRequest(holidayId).unwrap();
              refetch();
              Alert.alert('Success', 'Holiday request cancelled successfully');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error?.data?.message || 'Failed to cancel request');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-light-background-primary dark:bg-dark-background-primary">
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  if (!holiday) {
    return (
      <View className="flex-1 items-center justify-center bg-light-background-primary dark:bg-dark-background-primary px-5">
        <Body color="secondary">Holiday request not found</Body>
        <Button onPress={() => navigation.goBack()} className="mt-4">
          Go Back
        </Button>
      </View>
    );
  }

  const requestLog = holiday?.logs || [];
  const canCancel = holiday?.status === 'PENDING' || holiday?.status === 'APPROVED';

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#000035'} />
        </TouchableOpacity>
        <View className="flex-1 items-center mr-10">
          <H2>Holiday Details</H2>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Title + Badge */}
        <View className="px-5 mb-1">
          <View className="flex-row items-start justify-between">
            <H2 className="text-2xl flex-1 mr-3">{holiday.title}</H2>
            <View className="px-3 py-1 rounded-full" style={{ backgroundColor: config.bg }}>
              <Caption className="font-outfit-bold" style={{ color: config.text, fontSize: 11 }}>
                {config.label}
              </Caption>
            </View>
          </View>
        </View>

        {/* Date Range */}
        <View className="flex-row items-center gap-1.5 px-5 mb-5">
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Body color="secondary">{formatDate(holiday.startDate)} - {formatDate(holiday.endDate)} • {holiday.totalDays} days</Body>
        </View>

        {/* Leave Period Card */}
        <View className="mx-5 mb-4 p-4 rounded-2xl" style={{ borderWidth: 1, borderColor: '#E2E8F0' }}>
          <Caption color="secondary" className="mb-1.5">Leave Period</Caption>
          <H3 className="mb-1">{formatDate(holiday.startDate)} - {formatDate(holiday.endDate)}</H3>
          <Body color="secondary">{holiday.leaveType}</Body>
        </View>

        {/* Divider */}
        <View className="h-px bg-light-border-light dark:bg-dark-border-light mx-5" />

        {/* Holiday Details */}
        <View className="px-5 py-4">
          <H3 className="mb-4">Holiday Details</H3>

          <View className="flex-row items-center justify-between mb-3">
            <Body color="secondary">Leave duration</Body>
            <Body className="font-outfit-semibold">{holiday.totalDays} days ({holiday.totalHours} hours)</Body>
          </View>

          <View className="flex-row items-start justify-between mb-3">
            <Body color="secondary" className="mr-4">Reason</Body>
            <Body className="font-outfit-semibold text-right flex-1">{holiday.reason || 'N/A'}</Body>
          </View>

          <View className="flex-row items-center justify-between mb-3">
            <Body color="secondary">Requested on</Body>
            <Body className="font-outfit-semibold">{formatDateTime(holiday.createdAt)}</Body>
          </View>

          <View className="flex-row items-center justify-between">
            <Body color="secondary">Approved by</Body>
            <Body className="font-outfit-semibold">{holiday.reviewedBy?.fullName || 'N/A'}</Body>
          </View>
        </View>

        {/* Divider */}
        <View className="h-px bg-light-border-light dark:bg-dark-border-light mx-5" />

        {/* Request Log */}
        <View className="px-5 py-4">
          <H3 className="mb-4">Request Log</H3>

          {requestLog.map((entry: any, index: number) => (
            <View key={entry.id || index} className="flex-row mb-4">
              {/* Timeline Dot + Line */}
              <View className="items-center mr-3 pt-1">
                <View
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: index === 0 ? (primaryColor || '#3B82F6') : '#D1D5DB' }}
                />
                {index < requestLog.length - 1 && (
                  <View className="w-0.5 flex-1 mt-1" style={{ backgroundColor: '#E5E7EB' }} />
                )}
              </View>

              {/* Log Content */}
              <View className="flex-1 pb-2">
                <Caption
                  className="font-outfit-semibold"
                  style={{ color: index === 0 ? '#374151' : '#9CA3AF' }}
                >
                  {entry.action}
                </Caption>
                <Caption color="secondary">{entry.performedBy} • {formatDateTime(entry.createdAt)}</Caption>
                {entry.note && <Caption color="muted" className="mt-1">{entry.note}</Caption>}
              </View>
            </View>
          ))}
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Cancel Request Button */}
      {canCancel && (
        <View className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-3 bg-light-background-primary dark:bg-dark-background-primary">
          <Button onPress={handleCancel} disabled={isCancelling}>
            {isCancelling ? 'Cancelling...' : 'Cancel request'}
          </Button>
        </View>
      )}
    </View>
  );
}

export default HolidayDetailScreen;

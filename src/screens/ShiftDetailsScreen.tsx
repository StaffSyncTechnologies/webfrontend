import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types/navigation';
import { useOrgTheme } from '../contexts';
import { H2, H3, Body, Caption, Button } from '../components/ui';
import { useGetByIdQuery, useAcceptShiftMutation, useDeclineShiftMutation } from '../store/api/shiftsApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function calcTotalHours(start: string, end: string, breakMins?: number): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, (ms / 3600000) - ((breakMins || 0) / 60));
}

export function ShiftDetailsScreen({ route, navigation }: RootStackScreenProps<'ShiftDetails'>) {
  const insets = useSafeAreaInsets();
  const { shiftId } = route.params;
  const { primaryColor } = useOrgTheme();
  const userId = useSelector((state: RootState) => state.auth.worker?.id);

  const { data: shiftResponse, isLoading, isError } = useGetByIdQuery(shiftId);
  const [acceptShift, { isLoading: accepting }] = useAcceptShiftMutation();
  const [declineShift, { isLoading: declining }] = useDeclineShiftMutation();
  const [actionDone, setActionDone] = useState<'accepted' | 'declined' | null>(null);

  const shift = shiftResponse?.data;

  // Determine if the current user is assigned and the assignment status
  const myAssignment = shift?.assignments?.find((a) => a.workerId === userId);
  const assignmentStatus = myAssignment?.status;
  
  // Check if shift was broadcast to this worker
  const isBroadcastToMe = shift?.broadcasts?.some((b: any) => {
    const targets: string[] = (b.filters as any)?.targetWorkerIds || [];
    return targets.includes(userId);
  }) || false;
  
  // Check if shift is filled (all needed workers have accepted)
  const acceptedCount = shift?.assignments?.filter(a => a.status === 'ACCEPTED').length || 0;
  const isFilled = acceptedCount >= (shift?.workersNeeded || 1);
  
  // Can act if: assigned with ASSIGNED status OR broadcasted to worker (but no assignment yet) AND shift is not filled
  const canAct = (assignmentStatus === 'ASSIGNED' || (isBroadcastToMe && !myAssignment)) && !actionDone && !isFilled;

  const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
    OPEN: { label: 'OPEN', bg: '#DCFCE7', text: '#16A34A' },
    FILLED: { label: 'FILLED', bg: '#DBEAFE', text: '#2563EB' },
    IN_PROGRESS: { label: 'IN PROGRESS', bg: '#FEF3C7', text: '#D97706' },
    COMPLETED: { label: 'COMPLETED', bg: '#E5E7EB', text: '#6B7280' },
    CANCELLED: { label: 'CANCELLED', bg: '#FEE2E2', text: '#DC2626' },
    DRAFT: { label: 'DRAFT', bg: '#E5E7EB', text: '#6B7280' },
  };

  const handleAccept = async () => {
    try {
      await acceptShift(shiftId).unwrap();
      setActionDone('accepted');
      navigation.navigate('ShiftConfirmed', {
        shiftTitle: shift?.title || 'Shift',
        date: shift?.startAt ? formatDate(shift.startAt) : '',
        time: shift?.startAt && shift?.endAt
          ? `${formatTime(shift.startAt)} to ${formatTime(shift.endAt)}`
          : '',
        location: shift?.siteLocation || shift?.clientCompany?.name || 'TBC',
      });
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Failed to accept shift';
      const code = err?.data?.code;
      if (code === 'RTW_NOT_APPROVED') {
        Alert.alert(
          'Right to Work Required',
          'Your Right to Work verification must be approved before you can accept shifts. Please complete your RTW verification first.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', msg);
      }
    }
  };

  const handleDecline = () => {
    Alert.alert(
      'Decline Shift',
      'Are you sure you want to decline this shift?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              await declineShift({ shiftId }).unwrap();
              setActionDone('declined');
              Alert.alert('Shift Declined', 'You have declined this shift.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (err: any) {
              Alert.alert('Error', err?.data?.message || 'Failed to decline shift');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-light-background-primary dark:bg-dark-background-primary">
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  if (isError || !shift) {
    return (
      <View className="flex-1 items-center justify-center bg-light-background-primary dark:bg-dark-background-primary px-5">
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Body color="secondary" className="mt-3 text-center">Failed to load shift details</Body>
        <Button variant="outline" className="mt-4" fullWidth={false} onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  const statusInfo = statusConfig[shift.status];
  const hourlyRate = shift.payRate || shift.hourlyRate;
  const totalHours = calcTotalHours(shift.startAt, shift.endAt, shift.breakMinutes);
  const totalPay = hourlyRate ? (hourlyRate * totalHours) : null;

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="chevron-back" size={24} color="#000035" />
        </TouchableOpacity>
        <View className="flex-1 items-center mr-10">
          <H2>Shift Details</H2>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Title + Badge */}
        <View className="px-5 pt-2 pb-1">
          <View className="flex-row items-center justify-between mb-2">
            <H2 className="flex-1 mr-2">{shift.title}</H2>
            {statusInfo && (
              <View className="px-2.5 py-1 rounded" style={{ backgroundColor: statusInfo.bg }}>
                <Caption className="font-outfit-bold" style={{ color: statusInfo.text, fontSize: 10 }}>
                  {statusInfo.label}
                </Caption>
              </View>
            )}
          </View>

          {/* Assignment status badge */}
          {(myAssignment || isBroadcastToMe) && (
            <View className="flex-row items-center mb-2">
              <View
                className="px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor:
                    assignmentStatus === 'ACCEPTED' || actionDone === 'accepted' ? '#DCFCE7'
                    : assignmentStatus === 'DECLINED' || actionDone === 'declined' ? '#FEE2E2'
                    : isBroadcastToMe && !myAssignment ? '#DBEAFE'
                    : '#FEF3C7',
                }}
              >
                <Caption className="font-outfit-bold" style={{
                  fontSize: 10,
                  color:
                    assignmentStatus === 'ACCEPTED' || actionDone === 'accepted' ? '#16A34A'
                    : assignmentStatus === 'DECLINED' || actionDone === 'declined' ? '#DC2626'
                    : isBroadcastToMe && !myAssignment ? '#2563EB'
                    : '#D97706',
                }}>
                  {actionDone === 'accepted' ? 'ACCEPTED' : 
                   actionDone === 'declined' ? 'DECLINED' : 
                   isBroadcastToMe && !myAssignment && isFilled ? 'FILLED' :
                   isBroadcastToMe && !myAssignment ? 'BROADCASTED' : 
                   assignmentStatus}
                </Caption>
              </View>
            </View>
          )}

          {/* Client */}
          {shift.clientCompany?.name && (
            <View className="flex-row items-center gap-1.5 mb-1.5">
              <Ionicons name="business-outline" size={16} color="#6B7280" />
              <Body color="secondary">{shift.clientCompany.name}</Body>
            </View>
          )}

          {/* Location */}
          {(shift.siteLocation || shift.location?.name) && (
            <View className="flex-row items-center gap-1.5 mb-1.5">
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Body color="secondary">{shift.siteLocation || shift.location?.name}</Body>
            </View>
          )}

          {/* Date & Time */}
          <View className="flex-row items-center gap-1.5 mb-1.5">
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Body color="secondary">{formatDate(shift.startAt)}</Body>
          </View>
          <View className="flex-row items-center gap-1.5 mb-4">
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Body color="secondary">{formatTime(shift.startAt)} - {formatTime(shift.endAt)}</Body>
          </View>
        </View>

        {/* Divider */}
        <View className="h-px bg-light-border-light dark:bg-dark-border-light mx-5" />

        {/* Pay Rate */}
        {hourlyRate && (
          <>
            <View className="px-5 py-5">
              <H3 className="mb-3">Pay Rate</H3>
              <View className="flex-row">
                <View className="flex-1 pr-4 border-r border-light-border-light dark:border-dark-border-light">
                  <Caption color="secondary" className="mb-1">Hourly Rate</Caption>
                  <H2>{`\u00A3${Number(hourlyRate).toFixed(2)}/hr`}</H2>
                </View>
                <View className="flex-1 pl-4">
                  <Caption color="secondary" className="mb-1">Total Pay</Caption>
                  <H2>{totalPay ? `\u00A3${totalPay.toFixed(2)}` : 'TBC'}</H2>
                </View>
              </View>
            </View>
            <View className="h-2 bg-light-background-secondary dark:bg-dark-background-secondary" />
          </>
        )}

        {/* Location */}
        <View className="px-5 py-5">
          <H3 className="mb-3">Location</H3>
          <View className="h-44 rounded-xl overflow-hidden bg-light-background-secondary dark:bg-dark-background-secondary items-center justify-center">
            <Ionicons name="map-outline" size={40} color="#9CA3AF" />
            <Caption color="muted" className="mt-1">
              {shift.siteLocation || shift.location?.address || 'Location TBC'}
            </Caption>
          </View>
        </View>

        {/* Divider */}
        <View className="h-2 bg-light-background-secondary dark:bg-dark-background-secondary" />

        {/* Shift Info */}
        <View className="px-5 py-5">
          <H3 className="mb-4">Shift Information</H3>
          <View className="flex-row items-start gap-3 mb-3">
            <Ionicons name="time-outline" size={20} color="#6B7280" style={{ marginTop: 2 }} />
            <Body color="secondary" className="flex-1">Duration: {totalHours.toFixed(1)} hours</Body>
          </View>
          {shift.breakMinutes ? (
            <View className="flex-row items-start gap-3 mb-3">
              <Ionicons name="cafe-outline" size={20} color="#6B7280" style={{ marginTop: 2 }} />
              <Body color="secondary" className="flex-1">Break: {shift.breakMinutes} minutes</Body>
            </View>
          ) : null}
          {shift.role && (
            <View className="flex-row items-start gap-3 mb-3">
              <Ionicons name="person-outline" size={20} color="#6B7280" style={{ marginTop: 2 }} />
              <Body color="secondary" className="flex-1">Role: {shift.role}</Body>
            </View>
          )}
          {shift.notes && (
            <View className="flex-row items-start gap-3 mb-3">
              <Ionicons name="document-text-outline" size={20} color="#6B7280" style={{ marginTop: 2 }} />
              <Body color="secondary" className="flex-1">{shift.notes}</Body>
            </View>
          )}
        </View>

        <View className="h-28" />
      </ScrollView>

      {/* Action Buttons */}
      {canAct && (
        <View className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-3 bg-light-background-primary dark:bg-dark-background-primary border-t border-light-border-light dark:border-dark-border-light">
          <Button onPress={handleAccept} loading={accepting} disabled={accepting || declining}>
            Accept Shift
          </Button>
          <View className="h-3" />
          <Button variant="danger" onPress={handleDecline} loading={declining} disabled={accepting || declining}>
            Reject Shift
          </Button>
        </View>
      )}

      {/* Already accepted */}
      {(assignmentStatus === 'ACCEPTED' || actionDone === 'accepted') && !canAct && (
        <View className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-3 bg-light-background-primary dark:bg-dark-background-primary border-t border-light-border-light dark:border-dark-border-light">
          <View className="flex-row items-center justify-center py-3">
            <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
            <Body className="ml-2 font-outfit-semibold" style={{ color: '#16A34A' }}>Shift Accepted</Body>
          </View>
        </View>
      )}
    </View>
  );
}

export default ShiftDetailsScreen;

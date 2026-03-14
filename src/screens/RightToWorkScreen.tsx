import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types/navigation';
import { useOrgTheme, useToast } from '../contexts';
import { H2, H3, Body, Caption, Button } from '../components/ui';
import { useGetMyRTWQuery, useSubmitMyRTWMutation } from '../store/api/workerApi';

type RTWStatus = 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

const STATUS_CONFIG: Record<RTWStatus, { label: string; icon: keyof typeof Ionicons.glyphMap; bg: string; color: string; description: string }> = {
  NOT_STARTED: { label: 'Not Started', icon: 'alert-circle', bg: '#F3F4F6', color: '#6B7280', description: 'Submit your share code to verify your right to work.' },
  PENDING: { label: 'Pending Verification', icon: 'time', bg: '#FEF3C7', color: '#D97706', description: 'Your right to work is being verified. This may take a moment.' },
  APPROVED: { label: 'Verified', icon: 'checkmark-circle', bg: '#DCFCE7', color: '#16A34A', description: 'Your right to work has been verified successfully.' },
  REJECTED: { label: 'Rejected', icon: 'close-circle', bg: '#FEE2E2', color: '#DC2626', description: 'Verification failed. Please check your details and try again.' },
  EXPIRED: { label: 'Expired', icon: 'alert-circle', bg: '#FEE2E2', color: '#DC2626', description: 'Your right to work has expired. Please submit a new share code.' },
};

function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function RightToWorkScreen({ navigation }: RootStackScreenProps<'RightToWork'>) {
  const insets = useSafeAreaInsets();
  const { primaryColor, secondaryColor } = useOrgTheme();
  const toast = useToast();

  const { data: rtwRes, isLoading } = useGetMyRTWQuery();
  const [submitRTW, { isLoading: isSubmitting }] = useSubmitMyRTWMutation();

  const rtwData = rtwRes?.data;
  const status = (rtwData?.rtwStatus || 'NOT_STARTED') as RTWStatus;
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.NOT_STARTED;

  const [shareCode, setShareCode] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const canSubmit = status !== 'APPROVED' && status !== 'PENDING';

  const handleSubmit = async () => {
    if (!shareCode.trim()) {
      toast.error('Please enter your share code');
      return;
    }
    if (!dateOfBirth.trim()) {
      toast.error('Please enter your date of birth');
      return;
    }

    // Parse DD/MM/YYYY to ISO
    const parts = dateOfBirth.split('/');
    if (parts.length !== 3) {
      toast.error('Date of birth must be in DD/MM/YYYY format');
      return;
    }
    const [dd, mm, yyyy] = parts;
    const dob = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
    if (isNaN(dob.getTime())) {
      toast.error('Invalid date of birth');
      return;
    }

    try {
      const result = await submitRTW({
        shareCode: shareCode.trim(),
        dateOfBirth: dob.toISOString().split('T')[0],
      }).unwrap();

      if (result.data?.verificationResult?.verified) {
        toast.success('Right to work verified successfully!');
      } else {
        toast.error(result.data?.verificationResult?.errorMessage || 'Verification failed. Please try again.');
      }
    } catch (err: any) {
      toast.error(err?.data?.error || 'Failed to submit. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-light-background-primary dark:bg-dark-background-primary">
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="chevron-back" size={24} color="#000035" />
        </TouchableOpacity>
        <View className="flex-1 items-center mr-10">
          <H2>Right to Work</H2>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <View
          className="rounded-2xl p-5 mb-6"
          style={{ backgroundColor: config.bg }}
        >
          <View className="flex-row items-center mb-3">
            <View className="w-12 h-12 rounded-full items-center justify-center mr-3" style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}>
              <Ionicons name={config.icon} size={28} color={config.color} />
            </View>
            <View className="flex-1">
              <H3 style={{ color: config.color }}>{config.label}</H3>
              <Caption style={{ color: config.color, opacity: 0.8 }}>{config.description}</Caption>
            </View>
          </View>
        </View>

        {/* Current RTW Details (if verified or has data) */}
        {status !== 'NOT_STARTED' && (
          <View className="rounded-2xl p-4 mb-6" style={{ borderWidth: 1, borderColor: '#E2E8F0' }}>
            <H3 className="mb-3">Verification Details</H3>

            <View className="flex-row justify-between py-2 border-b" style={{ borderBottomColor: '#F1F5F9' }}>
              <Body color="secondary">Status</Body>
              <Body className="font-outfit-semibold" style={{ color: config.color }}>{config.label}</Body>
            </View>

            {rtwData?.rtwShareCode && (
              <View className="flex-row justify-between py-2 border-b" style={{ borderBottomColor: '#F1F5F9' }}>
                <Body color="secondary">Share Code</Body>
                <Body className="font-outfit-semibold">{rtwData.rtwShareCode}</Body>
              </View>
            )}

            <View className="flex-row justify-between py-2 border-b" style={{ borderBottomColor: '#F1F5F9' }}>
              <Body color="secondary">Checked On</Body>
              <Body className="font-outfit-semibold">{formatDate(rtwData?.rtwCheckedAt)}</Body>
            </View>

            <View className="flex-row justify-between py-2 border-b" style={{ borderBottomColor: '#F1F5F9' }}>
              <Body color="secondary">Valid Until</Body>
              <Body className="font-outfit-semibold" style={rtwData?.rtwExpiresAt ? {} : { color: '#16A34A' }}>
                {rtwData?.rtwExpiresAt ? formatDate(rtwData.rtwExpiresAt) : 'Unlimited'}
              </Body>
            </View>

            {rtwData?.rtwAuditNote && (
              <View className="py-2">
                <Body color="secondary">Notes</Body>
                <Caption color="secondary" className="mt-1">{rtwData.rtwAuditNote}</Caption>
              </View>
            )}
          </View>
        )}

        {/* Submit Form (if not approved/pending) */}
        {canSubmit && (
          <View className="rounded-2xl p-4 mb-6" style={{ borderWidth: 1, borderColor: '#E2E8F0' }}>
            <H3 className="mb-1">{status === 'NOT_STARTED' ? 'Submit Verification' : 'Re-submit Verification'}</H3>
            <Caption color="secondary" className="mb-4">
              Enter your UK Government share code and date of birth to verify your right to work.
            </Caption>

            {/* Share Code */}
            <Body className="font-outfit-semibold mb-2">
              Share Code<Body style={{ color: '#DC2626' }}>*</Body>
            </Body>
            <View
              className="flex-row items-center px-4 py-3.5 rounded-xl mb-4"
              style={{ borderWidth: 1, borderColor: '#E2E8F0' }}
            >
              <TextInput
                className="flex-1 font-outfit text-base"
                value={shareCode}
                onChangeText={setShareCode}
                placeholder="e.g. W123 456 789"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
              />
              <Ionicons name="key-outline" size={18} color="#6B7280" />
            </View>

            {/* Date of Birth */}
            <Body className="font-outfit-semibold mb-2">
              Date of Birth<Body style={{ color: '#DC2626' }}>*</Body>
            </Body>
            <View
              className="flex-row items-center px-4 py-3.5 rounded-xl mb-4"
              style={{ borderWidth: 1, borderColor: '#E2E8F0' }}
            >
              <TextInput
                className="flex-1 font-outfit text-base"
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#9CA3AF"
                keyboardType="numbers-and-punctuation"
              />
              <Ionicons name="calendar-outline" size={18} color="#6B7280" />
            </View>

            {/* Info Box */}
            <View className="flex-row items-start p-3 rounded-xl mb-4" style={{ backgroundColor: '#EFF6FF' }}>
              <Ionicons name="information-circle" size={20} color="#3B82F6" style={{ marginTop: 1, marginRight: 8 }} />
              <Caption style={{ color: '#1E40AF', flex: 1 }}>
                You can get your share code from the UK Government website at gov.uk/view-right-to-work
              </Caption>
            </View>

            <Button onPress={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Verifying...' : 'Submit for Verification'}
            </Button>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}

export default RightToWorkScreen;

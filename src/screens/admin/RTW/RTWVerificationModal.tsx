import React, { useState, useEffect } from 'react';
import { View, Modal, ScrollView, TouchableOpacity, Alert, TextInput, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrgTheme, useTheme, useToast } from '../../../contexts';
import { H3, Body, Caption, Card } from '../../../components/ui';
import { DatePickerModal } from '../../../components/ui/DatePickerModal';
import { useGetComplianceWorkerQuery, useVerifyRTWManualMutation } from '../../../store/slices/adminSlices/complianceSlice';

// ─── Types ─────────────────────────────────────────────────────────────────

interface RTWVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  worker: any;
  onSubmit: () => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
  name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

const formatDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

// ─── Step indicator ────────────────────────────────────────────────────────

function StepDot({ n, active, done, primaryColor }: { n: number; active: boolean; done: boolean; primaryColor: string }) {
  const { isDark } = useTheme();
  return (
    <View className="items-center gap-1">
      <View
        className="w-8 h-8 rounded-full items-center justify-center"
        style={{
          backgroundColor: done
            ? '#10B981'
            : active
            ? primaryColor
            : (isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6'),
        }}
      >
        {done
          ? <Ionicons name="checkmark" size={15} color="#FFF" />
          : <Body className="text-xs font-outfit-bold" style={{ color: active ? '#FFF' : '#9CA3AF' }}>{n}</Body>
        }
      </View>
    </View>
  );
}

function StepBar({ step, primaryColor }: { step: number; primaryColor: string }) {
  const { isDark } = useTheme();
  const labels = ['Worker', 'Verify', 'Decision', 'Confirm'];
  return (
    <View className="px-5 pb-4">
      <View className="flex-row items-center">
        {labels.map((label, i) => (
          <React.Fragment key={i}>
            <View className="items-center">
              <StepDot n={i + 1} active={step === i + 1} done={step > i + 1} primaryColor={primaryColor} />
              <Caption
                className="text-[9px] mt-1 font-outfit-medium"
                style={{ color: step === i + 1 ? primaryColor : '#9CA3AF' }}
              >
                {label}
              </Caption>
            </View>
            {i < labels.length - 1 && (
              <View
                className="flex-1 h-0.5 mb-4 mx-1"
                style={{ backgroundColor: step > i + 1 ? '#10B981' : (isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB') }}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

// ─── Copy row ──────────────────────────────────────────────────────────────

function CopyRow({ label, value, icon, primaryColor }: { label: string; value: string; icon: string; primaryColor: string }) {
  const { isDark } = useTheme();
  const handleCopy = () => Alert.alert('Copied', `${label} copied to clipboard`);
  return (
    <View
      className="flex-1 px-4 py-3 rounded-xl"
      style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F9FAFB', borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.10)' : '#E5E7EB' }}
    >
      <View className="flex-row items-center gap-1.5 mb-1.5">
        <Ionicons name={icon as any} size={12} color="#9CA3AF" />
        <Caption color="secondary" className="text-[10px]">{label}</Caption>
      </View>
      <View className="flex-row items-center justify-between">
        <Body className="font-outfit-bold text-base tracking-widest" style={{ color: isDark ? '#FFF' : '#111827' }}>
          {value || '—'}
        </Body>
        {!!value && (
          <TouchableOpacity
            onPress={handleCopy}
            className="w-7 h-7 rounded-lg items-center justify-center"
            style={{ backgroundColor: primaryColor + '20' }}
          >
            <Ionicons name="copy-outline" size={13} color={primaryColor} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Section label ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  const { isDark } = useTheme();
  return (
    <View className="flex-row items-center gap-2 mb-3">
      <Body className="font-outfit-semibold text-sm">{children}</Body>
      <View className="flex-1 h-px" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB' }} />
    </View>
  );
}

// ─── Main modal ────────────────────────────────────────────────────────────

export function RTWVerificationModal({ visible, onClose, worker, onSubmit }: RTWVerificationModalProps) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const { showToast } = useToast();

  const [step,       setStep]       = useState(1);
  const [decision,   setDecision]   = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [auditNote,  setAuditNote]  = useState('');
  const [expiresAt,  setExpiresAt]  = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [verifyManual, { isLoading: submitting }] = useVerifyRTWManualMutation();

  // Fetch detailed RTW data when a worker is selected
  const { data: workerDetail } = useGetComplianceWorkerQuery(
    worker?.id ?? '',
    { skip: !worker?.id || !visible }
  );

  const shareCode   = workerDetail?.rtwShareCode  ?? worker?.rtwShareCode  ?? null;
  const dateOfBirth = workerDetail?.dateOfBirth ?? null;

  // Reset on open
  useEffect(() => {
    if (visible) {
      setStep(1);
      setDecision('APPROVED');
      setAuditNote('');
      setExpiresAt(null);
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!auditNote.trim()) {
      Alert.alert('Audit Note Required', 'Please document your verification findings before submitting.');
      return;
    }
    try {
      await verifyManual({
        workerId:  worker?.id,
        status:    decision,
        auditNote: auditNote.trim(),
        expiresAt: decision === 'APPROVED' && expiresAt ? expiresAt.toISOString() : undefined,
      }).unwrap();
      showToast(`RTW ${decision === 'APPROVED' ? 'approved' : 'rejected'} successfully`, 'success');
      onSubmit();
      onClose();
    } catch (e: any) {
      showToast(e?.data?.message ?? 'Failed to submit verification', 'error');
    }
  };

  const canProceed = () => {
    if (step === 3) return !!auditNote.trim();
    return true;
  };

  const bgSecondary = isDark ? 'rgba(255,255,255,0.06)' : '#F9FAFB';
  const borderClr   = isDark ? 'rgba(255,255,255,0.10)' : '#E5E7EB';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary">

        {/* ── Header ──────────────────────────────────────────────── */}
        <View
          className="flex-row items-center justify-between px-5 pb-3 border-b border-light-border-light dark:border-dark-border-light"
          style={{ paddingTop: insets.top + 12 }}
        >
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 rounded-full items-center justify-center bg-light-background-secondary dark:bg-dark-background-secondary"
          >
            <Ionicons name="close" size={20} color={isDark ? '#FFF' : '#374151'} />
          </TouchableOpacity>
          <View className="items-center">
            <H3>RTW Verification</H3>
            <Caption color="secondary" className="text-[10px]">
              Step {step} of 4
            </Caption>
          </View>
          {/* Right spacer to balance header */}
          <View className="w-10" />
        </View>

        {/* ── Step bar ────────────────────────────────────────────── */}
        <View className="pt-4">
          <StepBar step={step} primaryColor={primaryColor} />
        </View>

        {/* ── Content ─────────────────────────────────────────────── */}
        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* ── Step 1: Worker ── */}
          {step === 1 && worker && (
            <View>
              <SectionLabel>Worker Details</SectionLabel>

              {/* Worker card */}
              <Card className="p-4 mb-4">
                <View className="flex-row items-center gap-3">
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: primaryColor + '20' }}
                  >
                    <Body className="font-outfit-bold text-sm" style={{ color: primaryColor }}>
                      {getInitials(worker.fullName)}
                    </Body>
                  </View>
                  <View className="flex-1">
                    <Body className="font-outfit-semibold text-base">{worker.fullName}</Body>
                    <Caption color="secondary" className="text-xs">{worker.email}</Caption>
                  </View>
                </View>

                {/* Current RTW status */}
                {worker.rtwStatus && (
                  <View
                    className="flex-row items-center gap-2 mt-3 px-3 py-2 rounded-xl"
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }}
                  >
                    <Ionicons name="shield-outline" size={14} color="#9CA3AF" />
                    <Caption color="secondary" className="text-xs">
                      Current status:{' '}
                      <Caption className="font-outfit-semibold text-xs" color="primary">
                        {worker.rtwStatus.replace(/_/g, ' ')}
                      </Caption>
                    </Caption>
                  </View>
                )}
              </Card>

              {/* Share code + DOB */}
              <SectionLabel>Verification Details</SectionLabel>
              <View className="flex-row gap-3 mb-4">
                <CopyRow
                  label="Share Code"
                  value={shareCode || ''}
                  icon="key-outline"
                  primaryColor={primaryColor}
                />
                <CopyRow
                  label="Date of Birth"
                  value={dateOfBirth ? new Date(dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  icon="person-outline"
                  primaryColor={primaryColor}
                />
              </View>

              {/* Gov.uk link */}
              <TouchableOpacity
                onPress={() => Linking.openURL('https://www.gov.uk/view-right-to-work')}
                className="flex-row items-center gap-3 px-4 py-4 rounded-xl mb-4"
                style={{ backgroundColor: isDark ? 'rgba(37,99,235,0.15)' : '#EFF6FF', borderWidth: 1, borderColor: isDark ? 'rgba(37,99,235,0.3)' : '#BFDBFE' }}
              >
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center"
                  style={{ backgroundColor: isDark ? 'rgba(37,99,235,0.2)' : '#DBEAFE' }}
                >
                  <Ionicons name="globe-outline" size={18} color="#2563EB" />
                </View>
                <View className="flex-1">
                  <Body className="font-outfit-semibold text-sm" style={{ color: '#1E40AF' }}>
                    Verify on GOV.UK
                  </Body>
                  <Caption className="text-[10px]" style={{ color: '#2563EB' }}>
                    gov.uk/view-right-to-work ↗
                  </Caption>
                </View>
                <Ionicons name="open-outline" size={16} color="#2563EB" />
              </TouchableOpacity>

              {/* Checklist */}
              <SectionLabel>Verification Checklist</SectionLabel>
              <Card className="p-4 mb-6">
                {[
                  'Open the GOV.UK link above',
                  'Enter the share code and date of birth',
                  'Confirm the worker\'s identity matches',
                  'Note the expiry date of the right to work',
                  'Record your decision below',
                ].map((item, i) => (
                  <View key={i} className="flex-row items-start gap-3 mb-2 last:mb-0">
                    <View
                      className="w-5 h-5 rounded-full items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: primaryColor + '20' }}
                    >
                      <Body className="text-[9px] font-outfit-bold" style={{ color: primaryColor }}>{i + 1}</Body>
                    </View>
                    <Caption color="secondary" className="text-xs flex-1 leading-relaxed">{item}</Caption>
                  </View>
                ))}
              </Card>
            </View>
          )}

          {/* ── Step 2: Verify (confirm share code used) ── */}
          {step === 2 && (
            <View>
              <SectionLabel>Confirmation</SectionLabel>
              <Card className="p-5 mb-4">
                <View
                  className="w-14 h-14 rounded-2xl items-center justify-center mb-4"
                  style={{ backgroundColor: isDark ? 'rgba(37,99,235,0.15)' : '#DBEAFE' }}
                >
                  <Ionicons name="checkmark-done-outline" size={26} color="#2563EB" />
                </View>
                <Body className="font-outfit-semibold text-base mb-2">
                  Have you checked the share code on GOV.UK?
                </Body>
                <Caption color="secondary" className="text-sm leading-relaxed">
                  Confirm that you have visited gov.uk/view-right-to-work, entered the share code{' '}
                  <Caption className="font-outfit-bold text-sm" color="primary">
                    {shareCode || '—'}
                  </Caption>{' '}
                  and the date of birth, and verified the worker's right to work in the UK.
                </Caption>
              </Card>

              <View
                className="flex-row items-start gap-3 px-4 py-3 rounded-xl mb-6"
                style={{ backgroundColor: isDark ? 'rgba(245,158,11,0.12)' : '#FFFBEB', borderWidth: 1, borderColor: isDark ? 'rgba(245,158,11,0.25)' : '#FDE68A' }}
              >
                <Ionicons name="warning-outline" size={15} color="#D97706" style={{ marginTop: 1 }} />
                <Caption className="text-xs flex-1 leading-relaxed" style={{ color: '#92400E' }}>
                  You must complete the GOV.UK check before recording a decision. Falsifying RTW records is a criminal offence.
                </Caption>
              </View>
            </View>
          )}

          {/* ── Step 3: Decision ── */}
          {step === 3 && (
            <View>
              <SectionLabel>Decision</SectionLabel>

              {/* Approve / Reject pills */}
              <View className="flex-row gap-3 mb-4">
                <TouchableOpacity
                  onPress={() => setDecision('APPROVED')}
                  className="flex-1 flex-row items-center justify-center gap-2 py-4 rounded-2xl"
                  style={{
                    backgroundColor: decision === 'APPROVED' ? '#10B981' : (isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'),
                    borderWidth: 2,
                    borderColor: decision === 'APPROVED' ? '#10B981' : 'transparent',
                  }}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={decision === 'APPROVED' ? '#FFF' : '#9CA3AF'}
                  />
                  <Body
                    className="font-outfit-bold text-sm"
                    style={{ color: decision === 'APPROVED' ? '#FFF' : '#9CA3AF' }}
                  >
                    Approve
                  </Body>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setDecision('REJECTED')}
                  className="flex-1 flex-row items-center justify-center gap-2 py-4 rounded-2xl"
                  style={{
                    backgroundColor: decision === 'REJECTED' ? '#EF4444' : (isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'),
                    borderWidth: 2,
                    borderColor: decision === 'REJECTED' ? '#EF4444' : 'transparent',
                  }}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={decision === 'REJECTED' ? '#FFF' : '#9CA3AF'}
                  />
                  <Body
                    className="font-outfit-bold text-sm"
                    style={{ color: decision === 'REJECTED' ? '#FFF' : '#9CA3AF' }}
                  >
                    Reject
                  </Body>
                </TouchableOpacity>
              </View>

              {/* Decision context banner */}
              <View
                className="flex-row items-center gap-2 px-3 py-2.5 rounded-xl mb-4"
                style={{
                  backgroundColor: decision === 'APPROVED'
                    ? (isDark ? 'rgba(16,185,129,0.12)' : '#D1FAE5')
                    : (isDark ? 'rgba(239,68,68,0.12)'  : '#FEE2E2'),
                }}
              >
                <Ionicons
                  name={decision === 'APPROVED' ? 'information-circle-outline' : 'alert-circle-outline'}
                  size={14}
                  color={decision === 'APPROVED' ? '#059669' : '#DC2626'}
                />
                <Caption
                  className="text-xs flex-1"
                  style={{ color: decision === 'APPROVED' ? '#065F46' : '#991B1B' }}
                >
                  {decision === 'APPROVED'
                    ? 'Worker will be marked as eligible to work. You may set an expiry date if applicable.'
                    : 'Worker will be flagged as ineligible. Notify HR and do not allow this worker to start shifts.'}
                </Caption>
              </View>

              {/* Expiry date — approved only */}
              {decision === 'APPROVED' && (
                <View className="mb-4">
                  <View className="flex-row items-center gap-1 mb-2">
                    <Caption color="secondary" className="text-xs font-outfit-medium">RTW Expiry Date</Caption>
                    <Caption color="secondary" className="text-[10px]">(optional)</Caption>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="flex-row items-center gap-3 px-4 h-12 rounded-xl"
                    style={{ backgroundColor: bgSecondary, borderWidth: 1, borderColor: borderClr }}
                  >
                    <Ionicons name="calendar-outline" size={18} color="#9CA3AF" />
                    <Body
                      className="flex-1 text-sm"
                      style={{ color: expiresAt ? (isDark ? '#FFF' : '#111827') : '#9CA3AF' }}
                    >
                      {expiresAt ? formatDate(expiresAt) : 'Select expiry date'}
                    </Body>
                    {expiresAt && (
                      <TouchableOpacity onPress={() => setExpiresAt(null)}>
                        <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* Audit note */}
              <View className="mb-6">
                <View className="flex-row items-center gap-1 mb-2">
                  <Caption color="secondary" className="text-xs font-outfit-medium">Audit Note</Caption>
                  <Caption className="text-[10px] text-red-400">*</Caption>
                </View>
                <View
                  className="px-4 py-3 rounded-xl min-h-[120px]"
                  style={{ backgroundColor: bgSecondary, borderWidth: 1, borderColor: auditNote ? primaryColor : borderClr }}
                >
                  <TextInput
                    placeholder="Document type checked, reference numbers, any conditions or concerns…"
                    value={auditNote}
                    onChangeText={setAuditNote}
                    multiline
                    textAlignVertical="top"
                    placeholderTextColor="#9CA3AF"
                    style={{
                      color:      isDark ? '#FFFFFF' : '#111827',
                      fontSize:   13,
                      fontFamily: 'Outfit-Regular',
                      minHeight:  100,
                    }}
                  />
                </View>
                {!auditNote.trim() && (
                  <Caption className="text-[10px] mt-1.5" style={{ color: '#EF4444' }}>
                    Audit note is required for compliance records
                  </Caption>
                )}
              </View>
            </View>
          )}

          {/* ── Step 4: Summary / confirm ── */}
          {step === 4 && (
            <View>
              <SectionLabel>Review & Confirm</SectionLabel>

              <Card className="p-4 mb-4">
                {/* Decision summary */}
                <View
                  className="flex-row items-center gap-3 p-3 rounded-xl mb-4"
                  style={{
                    backgroundColor: decision === 'APPROVED'
                      ? (isDark ? 'rgba(16,185,129,0.12)' : '#D1FAE5')
                      : (isDark ? 'rgba(239,68,68,0.12)' : '#FEE2E2'),
                  }}
                >
                  <Ionicons
                    name={decision === 'APPROVED' ? 'checkmark-circle' : 'close-circle'}
                    size={24}
                    color={decision === 'APPROVED' ? '#10B981' : '#EF4444'}
                  />
                  <View>
                    <Body
                      className="font-outfit-bold text-base"
                      style={{ color: decision === 'APPROVED' ? '#065F46' : '#991B1B' }}
                    >
                      {decision === 'APPROVED' ? 'Approved' : 'Rejected'}
                    </Body>
                    <Caption
                      className="text-xs"
                      style={{ color: decision === 'APPROVED' ? '#065F46' : '#991B1B' }}
                    >
                      RTW decision for {worker?.fullName}
                    </Caption>
                  </View>
                </View>

                {[
                  { icon: 'person-outline',   label: 'Worker',     value: worker?.fullName  },
                  { icon: 'key-outline',       label: 'Share Code', value: worker?.rtwShareCode ?? '—' },
                  ...(decision === 'APPROVED' && expiresAt
                    ? [{ icon: 'calendar-outline', label: 'Expires', value: formatDate(expiresAt) }]
                    : []
                  ),
                ].map((row, i) => (
                  <View
                    key={i}
                    className="flex-row items-center gap-3 py-2.5 border-b border-light-border-light dark:border-dark-border-light last:border-0"
                  >
                    <View
                      className="w-7 h-7 rounded-lg items-center justify-center"
                      style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6' }}
                    >
                      <Ionicons name={row.icon as any} size={13} color="#9CA3AF" />
                    </View>
                    <Caption color="secondary" className="text-xs w-20">{row.label}</Caption>
                    <Body className="text-sm font-outfit-semibold flex-1">{row.value}</Body>
                  </View>
                ))}
              </Card>

              {/* Audit note preview */}
              <Card className="p-4 mb-6">
                <View className="flex-row items-center gap-2 mb-2">
                  <Ionicons name="document-text-outline" size={14} color="#9CA3AF" />
                  <Caption color="secondary" className="text-xs">Audit Note</Caption>
                </View>
                <Body className="text-sm" style={{ color: isDark ? '#D1D5DB' : '#374151' }}>
                  {auditNote}
                </Body>
              </Card>
            </View>
          )}

          <View className="h-8" />
        </ScrollView>

        {/* ── Footer navigation ───────────────────────────────────── */}
        <View
          className="px-5 py-4 border-t border-light-border-light dark:border-dark-border-light"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <View className="flex-row gap-3">
            {step > 1 ? (
              <TouchableOpacity
                onPress={() => setStep(s => s - 1)}
                className="flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl bg-light-background-secondary dark:bg-dark-background-secondary"
              >
                <Ionicons name="chevron-back" size={16} color={isDark ? '#FFF' : '#374151'} />
                <Body className="font-outfit-semibold text-sm">Back</Body>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 py-3.5 rounded-xl bg-light-background-secondary dark:bg-dark-background-secondary items-center"
              >
                <Body className="font-outfit-semibold text-sm">Cancel</Body>
              </TouchableOpacity>
            )}

            {step < 4 ? (
              <TouchableOpacity
                onPress={() => canProceed() && setStep(s => s + 1)}
                className="flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl"
                style={{
                  backgroundColor: canProceed() ? primaryColor : (isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'),
                }}
              >
                <Body
                  className="font-outfit-semibold text-sm"
                  style={{ color: canProceed() ? '#FFF' : '#9CA3AF' }}
                >
                  {step === 1 ? 'Continue' : step === 2 ? 'Proceed' : 'Review'}
                </Body>
                <Ionicons name="chevron-forward" size={16} color={canProceed() ? '#FFF' : '#9CA3AF'} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={submitting}
                className="flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl"
                style={{ backgroundColor: decision === 'APPROVED' ? '#10B981' : '#EF4444', opacity: submitting ? 0.7 : 1 }}
              >
                {submitting
                  ? <ActivityIndicator size="small" color="#FFF" />
                  : <Ionicons name={decision === 'APPROVED' ? 'shield-checkmark-outline' : 'shield-outline'} size={16} color="#FFF" />}
                <Body className="font-outfit-bold text-sm text-white">
                  {submitting ? 'Submitting…' : decision === 'APPROVED' ? 'Approve RTW' : 'Reject RTW'}
                </Body>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Date picker ───────────────────────────────────────────── */}
        <DatePickerModal
          visible={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onConfirm={(d: Date) => { setExpiresAt(d); setShowDatePicker(false); }}
          initialDate={expiresAt ?? new Date()}
          minimumDate={new Date()}
          primaryColor={primaryColor}
        />
      </View>
    </Modal>
  );
}

export default RTWVerificationModal;

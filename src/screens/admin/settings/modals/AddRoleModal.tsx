import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useOrgTheme, useToast } from '../../../../contexts';
import { H3, Body, Caption, Input } from '../../../../components/ui';
import { useInviteStaffMutation } from '../../../../store/slices/adminSlices/hrSlice';

type InviteRole = 'OPS_MANAGER' | 'SHIFT_COORDINATOR' | 'COMPLIANCE_OFFICER';

const ROLES: Array<{ value: InviteRole; label: string; description: string; bg: string; color: string }> = [
  { value: 'OPS_MANAGER',        label: 'Operations Manager',     description: 'Manages workers and flags attendance',  bg: '#DBEAFE', color: '#1D4ED8' },
  { value: 'SHIFT_COORDINATOR',  label: 'Shift Coordinator',      description: 'Creates and manages shifts',            bg: '#D1FAE5', color: '#059669' },
  { value: 'COMPLIANCE_OFFICER', label: 'Compliance Officer',     description: 'Handles RTW and compliance checks',     bg: '#FEF3C7', color: '#D97706' },
];

interface AddRoleModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddRoleModal({ open, onClose }: AddRoleModalProps) {
  const { isDark } = useTheme();
  const { primaryColor } = useOrgTheme();
  const { showToast } = useToast();

  const [fullName, setFullName]   = useState('');
  const [email, setEmail]         = useState('');
  const [phone, setPhone]         = useState('');
  const [role, setRole]           = useState<InviteRole | null>(null);
  const [error, setError]         = useState('');

  const [inviteStaff, { isLoading }] = useInviteStaffMutation();

  const handleSubmit = async () => {
    setError('');
    if (!fullName.trim()) { setError('Full name is required.'); return; }
    if (!email.trim() || !email.includes('@')) { setError('A valid email address is required.'); return; }
    if (!role) { setError('Please select a role.'); return; }

    try {
      await inviteStaff({ fullName: fullName.trim(), email: email.trim(), phone: phone.trim() || undefined, role }).unwrap();
      showToast(`Invite sent to ${email}`, 'success');
      handleClose();
    } catch (e: any) {
      const msg = e?.data?.message ?? 'Failed to send invite. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  const handleClose = () => {
    setFullName(''); setEmail(''); setPhone(''); setRole(null); setError('');
    onClose();
  };

  const rowBg = isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB';

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-light-background-primary dark:bg-dark-background-primary rounded-t-3xl p-6" style={{ maxHeight: '85%' }}>

          {/* Header */}
          <View className="flex-row items-center justify-between mb-5">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: primaryColor + '15' }}>
                <Ionicons name="person-add" size={15} color={primaryColor} />
              </View>
              <H3>Invite Staff Member</H3>
            </View>
            <TouchableOpacity onPress={handleClose} className="w-8 h-8 items-center justify-center rounded-full bg-light-background-secondary dark:bg-dark-background-secondary">
              <Ionicons name="close" size={18} color={isDark ? '#FFFFFF' : '#000035'} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Error */}
            {error ? (
              <View className="flex-row items-center gap-2 p-3 rounded-xl mb-4" style={{ backgroundColor: '#FEE2E2' }}>
                <Ionicons name="warning-outline" size={15} color="#DC2626" />
                <Caption style={{ color: '#DC2626', fontSize: 12, flex: 1 }}>{error}</Caption>
              </View>
            ) : null}

            {/* Personal details */}
            <View className="gap-3 mb-5">
              <View>
                <Caption color="secondary" className="mb-1.5 text-xs">Full Name *</Caption>
                <Input
                  placeholder="e.g., Jane Smith"
                  value={fullName}
                  onChangeText={setFullName}
                  leftIcon={<Ionicons name="person-outline" size={18} color="#9CA3AF" />}
                />
              </View>
              <View>
                <Caption color="secondary" className="mb-1.5 text-xs">Email Address *</Caption>
                <Input
                  placeholder="jane@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon={<Ionicons name="mail-outline" size={18} color="#9CA3AF" />}
                />
              </View>
              <View>
                <Caption color="secondary" className="mb-1.5 text-xs">Phone Number (optional)</Caption>
                <Input
                  placeholder="+44 7700 000000"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  leftIcon={<Ionicons name="call-outline" size={18} color="#9CA3AF" />}
                />
              </View>
            </View>

            {/* Role selection */}
            <Body className="font-outfit-semibold mb-3 text-sm">Select Role *</Body>
            <View className="gap-2 mb-6">
              {ROLES.map((r) => {
                const selected = role === r.value;
                return (
                  <TouchableOpacity
                    key={r.value}
                    className="flex-row items-center gap-3 p-3.5 rounded-xl"
                    style={{
                      backgroundColor: selected ? r.bg : rowBg,
                      borderWidth: selected ? 1.5 : 0,
                      borderColor: r.color,
                    }}
                    onPress={() => setRole(r.value)}
                  >
                    <View className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: r.bg }}>
                      <Ionicons name="briefcase-outline" size={16} color={r.color} />
                    </View>
                    <View className="flex-1">
                      <Body className="font-outfit-semibold text-sm" style={{ color: selected ? r.color : undefined }}>{r.label}</Body>
                      <Caption color="secondary" style={{ fontSize: 11 }}>{r.description}</Caption>
                    </View>
                    {selected && <Ionicons name="checkmark-circle" size={20} color={r.color} />}
                  </TouchableOpacity>
                );
              })}
            </View>

          </ScrollView>

          {/* Actions */}
          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              className="flex-1 py-4 rounded-xl bg-light-background-secondary dark:bg-dark-background-secondary"
              onPress={handleClose}
              disabled={isLoading}
            >
              <Body className="text-center text-sm">Cancel</Body>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-4 rounded-xl items-center flex-row justify-center gap-2"
              style={{ backgroundColor: primaryColor, opacity: isLoading ? 0.7 : 1 }}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading
                ? <ActivityIndicator size="small" color="#FFF" />
                : <Ionicons name="paper-plane-outline" size={16} color="#FFF" />}
              <Body className="text-white font-outfit-semibold text-sm">
                {isLoading ? 'Sending...' : 'Send Invite'}
              </Body>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

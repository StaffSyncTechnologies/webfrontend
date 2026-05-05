import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useOrgTheme, useToast } from '../../../../contexts';
import { H3, Body, Caption, Input } from '../../../../components/ui';
import { useChangePasswordMutation } from '../../../../store/slices/adminSlices/settingsSlice';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

const REQUIREMENTS = [
  { label: 'At least 8 characters',              test: (p: string) => p.length >= 8 },
  { label: 'Uppercase & lowercase letters',       test: (p: string) => /[A-Z]/.test(p) && /[a-z]/.test(p) },
  { label: 'At least one number',                 test: (p: string) => /\d/.test(p) },
  { label: 'At least one special character',      test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const { isDark } = useTheme();
  const { primaryColor } = useOrgTheme();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword]   = useState('');
  const [newPassword, setNewPassword]             = useState('');
  const [confirmPassword, setConfirmPassword]     = useState('');
  const [showCurrent, setShowCurrent]             = useState(false);
  const [showNew, setShowNew]                     = useState(false);
  const [showConfirm, setShowConfirm]             = useState(false);
  const [error, setError]                         = useState('');

  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const allRequirementsMet = REQUIREMENTS.every(r => r.test(newPassword));
  const passwordsMatch     = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async () => {
    setError('');
    if (!currentPassword) { setError('Please enter your current password.'); return; }
    if (!allRequirementsMet) { setError('New password does not meet requirements.'); return; }
    if (!passwordsMatch) { setError('Passwords do not match.'); return; }

    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      showToast('Password changed successfully', 'success');
      handleClose();
    } catch (e: any) {
      const msg = e?.data?.message ?? 'Failed to change password. Check your current password.';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  const iconColor = isDark ? '#FFFFFF' : '#000035';

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-light-background-primary dark:bg-dark-background-primary rounded-t-3xl p-6">

          {/* Header */}
          <View className="flex-row items-center justify-between mb-5">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: primaryColor + '15' }}>
                <Ionicons name="lock-closed" size={15} color={primaryColor} />
              </View>
              <H3>Change Password</H3>
            </View>
            <TouchableOpacity onPress={handleClose} className="w-8 h-8 items-center justify-center rounded-full bg-light-background-secondary dark:bg-dark-background-secondary">
              <Ionicons name="close" size={18} color={iconColor} />
            </TouchableOpacity>
          </View>

          {/* Error banner */}
          {error ? (
            <View className="flex-row items-center gap-2 p-3 rounded-xl mb-4" style={{ backgroundColor: '#FEE2E2' }}>
              <Ionicons name="warning-outline" size={16} color="#DC2626" />
              <Caption style={{ color: '#DC2626', fontSize: 12, flex: 1 }}>{error}</Caption>
            </View>
          ) : null}

          {/* Fields */}
          <View className="gap-3 mb-4">
            <View>
              <Caption color="secondary" className="mb-1.5 text-xs">Current Password</Caption>
              <Input
                placeholder="Enter current password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrent}
                leftIcon={<Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" />}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowCurrent(v => !v)}>
                    <Ionicons name={showCurrent ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                }
              />
            </View>
            <View>
              <Caption color="secondary" className="mb-1.5 text-xs">New Password</Caption>
              <Input
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNew}
                leftIcon={<Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" />}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowNew(v => !v)}>
                    <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                }
              />
            </View>
            <View>
              <Caption color="secondary" className="mb-1.5 text-xs">Confirm New Password</Caption>
              <Input
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                leftIcon={<Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" />}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowConfirm(v => !v)}>
                    <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                }
              />
              {confirmPassword.length > 0 && (
                <View className="flex-row items-center gap-1 mt-1.5">
                  <Ionicons
                    name={passwordsMatch ? 'checkmark-circle' : 'close-circle'}
                    size={13}
                    color={passwordsMatch ? '#059669' : '#DC2626'}
                  />
                  <Caption style={{ fontSize: 11, color: passwordsMatch ? '#059669' : '#DC2626' }}>
                    {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                  </Caption>
                </View>
              )}
            </View>
          </View>

          {/* Requirements checklist */}
          {newPassword.length > 0 && (
            <View className="p-3 rounded-xl mb-4 bg-light-background-secondary dark:bg-dark-background-secondary">
              <Caption color="secondary" className="font-outfit-semibold mb-2 text-xs">Requirements</Caption>
              <View className="gap-1.5">
                {REQUIREMENTS.map(r => (
                  <View key={r.label} className="flex-row items-center gap-2">
                    <Ionicons
                      name={r.test(newPassword) ? 'checkmark-circle' : 'ellipse-outline'}
                      size={13}
                      color={r.test(newPassword) ? '#059669' : '#9CA3AF'}
                    />
                    <Caption style={{ fontSize: 11, color: r.test(newPassword) ? '#059669' : '#9CA3AF' }}>
                      {r.label}
                    </Caption>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Actions */}
          <View className="flex-row gap-3">
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
                : <Ionicons name="checkmark-circle-outline" size={16} color="#FFF" />}
              <Body className="text-white font-outfit-semibold text-sm">
                {isLoading ? 'Saving...' : 'Change Password'}
              </Body>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { useTheme, useToast } from '../../../../contexts';
import { H3, Body, Caption, Input } from '../../../../components/ui';
import { useDeleteAccountMutation } from '../../../../store/slices/adminSlices/organizationSlice';
import { logout } from '../../../../store/slices/authSlice';

interface DeleteAccountModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteAccountModal({ open, onClose, onConfirm }: DeleteAccountModalProps) {
  const { isDark } = useTheme();
  const { showToast }  = useToast();
  const dispatch = useDispatch();

  const [confirmText, setConfirmText] = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPw]     = useState(false);
  const [error, setError]             = useState('');

  const [deleteAccount, { isLoading }] = useDeleteAccountMutation();

  const canSubmit = confirmText === 'DELETE' && password.length > 0;

  const handleConfirm = async () => {
    if (!canSubmit) return;
    setError('');
    try {
      await deleteAccount({ password }).unwrap();
      showToast('Account deleted. Signing out...', 'info');
      onConfirm();
      dispatch(logout());
    } catch (e: any) {
      const msg = e?.data?.message ?? 'Failed to delete account. Check your password.';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  const handleClose = () => {
    setConfirmText(''); setPassword(''); setError(''); setShowPw(false);
    onClose();
  };

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={handleClose}>
      <View className="flex-1 items-center justify-center bg-black/60 px-5">
        <View className="bg-light-background-primary dark:bg-dark-background-primary rounded-2xl p-6 w-full">

          {/* Icon + title */}
          <View className="items-center mb-5">
            <View className="w-16 h-16 rounded-full items-center justify-center mb-3" style={{ backgroundColor: '#FEE2E2' }}>
              <Ionicons name="trash" size={30} color="#DC2626" />
            </View>
            <H3 style={{ color: '#DC2626' }}>Delete Account</H3>
          </View>

          {/* Warning */}
          <View className="p-4 rounded-xl mb-5" style={{ backgroundColor: isDark ? '#450A0A' : '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' }}>
            <View className="flex-row items-start gap-2 mb-2">
              <Ionicons name="warning" size={16} color="#DC2626" style={{ marginTop: 1 }} />
              <Body className="font-outfit-semibold text-sm flex-1" style={{ color: '#991B1B' }}>This action is permanent</Body>
            </View>
            <Caption style={{ color: isDark ? '#FCA5A5' : '#7F1D1D', fontSize: 12, lineHeight: 18 }}>
              Deleting your account will permanently remove your organisation, all workers, shifts, payroll records, and associated data. This cannot be undone.
            </Caption>
          </View>

          {/* Error */}
          {error ? (
            <View className="flex-row items-center gap-2 p-3 rounded-xl mb-4" style={{ backgroundColor: '#FEE2E2' }}>
              <Ionicons name="warning-outline" size={15} color="#DC2626" />
              <Caption style={{ color: '#DC2626', fontSize: 12, flex: 1 }}>{error}</Caption>
            </View>
          ) : null}

          {/* Form */}
          <View className="gap-3 mb-5">
            <View>
              <Caption color="secondary" className="mb-1.5 text-xs">
                Type <Body className="font-outfit-bold" style={{ color: '#DC2626' }}>DELETE</Body> to confirm
              </Caption>
              <Input
                placeholder="DELETE"
                value={confirmText}
                onChangeText={setConfirmText}
                autoCapitalize="characters"
                leftIcon={<Ionicons name="text-outline" size={18} color={confirmText === 'DELETE' ? '#DC2626' : '#9CA3AF'} />}
              />
              {confirmText.length > 0 && confirmText !== 'DELETE' && (
                <Caption style={{ color: '#DC2626', fontSize: 11, marginTop: 4 }}>Must type DELETE exactly</Caption>
              )}
            </View>
            <View>
              <Caption color="secondary" className="mb-1.5 text-xs">Your Password</Caption>
              <Input
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                leftIcon={<Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" />}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPw(v => !v)}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                }
              />
            </View>
          </View>

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
              style={{ backgroundColor: canSubmit ? '#DC2626' : '#F87171', opacity: isLoading ? 0.7 : 1 }}
              onPress={handleConfirm}
              disabled={!canSubmit || isLoading}
            >
              {isLoading
                ? <ActivityIndicator size="small" color="#FFF" />
                : <Ionicons name="trash-outline" size={16} color="#FFF" />}
              <Body className="text-white font-outfit-semibold text-sm">
                {isLoading ? 'Deleting...' : 'Delete Account'}
              </Body>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

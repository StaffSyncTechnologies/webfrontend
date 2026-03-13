import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types/navigation';
import { useOrgTheme } from '../contexts';
import { H2, Body, Caption } from '../components/ui';
import { useChangePasswordMutation } from '../store/api/authApi';
import { useTranslation } from 'react-i18next';

export function ChangePasswordScreen({ navigation }: RootStackScreenProps<'ChangePassword'>) {
  const insets = useSafeAreaInsets();
  const { secondaryColor } = useOrgTheme();
  const { t } = useTranslation();
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const accentColor = secondaryColor || '#38BDF8';

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t('changePassword.error'), t('changePassword.fillAllFields'));
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert(t('changePassword.error'), t('changePassword.minLength'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('changePassword.error'), t('changePassword.mismatch'));
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      Alert.alert(t('changePassword.success'), t('changePassword.successMessage'), [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const message = err?.data?.message || err?.data?.error || t('changePassword.failedMessage');
      Alert.alert(t('changePassword.failed'), message);
    }
  };

  const renderPasswordField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    show: boolean,
    toggleShow: () => void,
    placeholder: string,
  ) => (
    <View className="mb-4">
      <Caption color="secondary" className="font-outfit-semibold mb-1.5">{label}</Caption>
      <View
        className="flex-row items-center rounded-xl px-4"
        style={{ backgroundColor: '#F3F4F6', height: 50 }}
      >
        <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={{ marginRight: 10 }} />
        <TextInput
          className="flex-1 font-outfit text-base"
          style={{ color: '#1F2937' }}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={!show}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={toggleShow} hitSlop={8}>
          <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="chevron-back" size={24} color="#000035" />
        </TouchableOpacity>
        <View className="flex-1 items-center mr-10">
          <H2>{t('changePassword.title')}</H2>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Info */}
        <View className="flex-row items-center rounded-xl p-3 mb-5" style={{ backgroundColor: '#EFF6FF' }}>
          <Ionicons name="information-circle-outline" size={20} color="#3B82F6" style={{ marginRight: 8 }} />
          <Body className="flex-1 text-sm" style={{ color: '#1E40AF' }}>
            {t('changePassword.info')}
          </Body>
        </View>

        {renderPasswordField(
          t('changePassword.currentPassword'),
          currentPassword,
          setCurrentPassword,
          showCurrent,
          () => setShowCurrent(!showCurrent),
          t('changePassword.currentPlaceholder'),
        )}

        {renderPasswordField(
          t('changePassword.newPassword'),
          newPassword,
          setNewPassword,
          showNew,
          () => setShowNew(!showNew),
          t('changePassword.newPlaceholder'),
        )}

        {renderPasswordField(
          t('changePassword.confirmPassword'),
          confirmPassword,
          setConfirmPassword,
          showConfirm,
          () => setShowConfirm(!showConfirm),
          t('changePassword.confirmPlaceholder'),
        )}

        {/* Password Requirements */}
        <View className="mb-6">
          <Caption color="secondary" className="font-outfit-semibold mb-2">{t('changePassword.requirements')}</Caption>
          <View className="flex-row items-center mb-1">
            <Ionicons
              name={newPassword.length >= 8 ? 'checkmark-circle' : 'ellipse-outline'}
              size={16}
              color={newPassword.length >= 8 ? '#16A34A' : '#9CA3AF'}
              style={{ marginRight: 6 }}
            />
            <Caption color="secondary">{t('changePassword.req8chars')}</Caption>
          </View>
          <View className="flex-row items-center mb-1">
            <Ionicons
              name={newPassword !== confirmPassword || !confirmPassword ? 'ellipse-outline' : 'checkmark-circle'}
              size={16}
              color={newPassword === confirmPassword && confirmPassword ? '#16A34A' : '#9CA3AF'}
              style={{ marginRight: 6 }}
            />
            <Caption color="secondary">{t('changePassword.reqMatch')}</Caption>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className="rounded-xl items-center justify-center mb-8"
          style={{
            backgroundColor: accentColor,
            height: 50,
            opacity: isLoading ? 0.7 : 1,
          }}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Body className="font-outfit-bold text-white">{t('changePassword.submit')}</Body>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

export default ChangePasswordScreen;

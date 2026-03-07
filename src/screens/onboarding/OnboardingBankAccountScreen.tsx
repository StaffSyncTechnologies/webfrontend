import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrgTheme } from '../../contexts';
import { Button, Input, H1, Body, StepHeader } from '../../components/ui';
import { useSaveBankAccountMutation } from '../../store/api/authApi';
import { useToast } from '../../contexts';
import { useTranslation } from 'react-i18next';
import type { AuthStackScreenProps } from '../../types/navigation';

type Props = AuthStackScreenProps<'OnboardingBankAccount'>;

export function OnboardingBankAccountScreen({ navigation }: Props) {
  const { primaryColor } = useOrgTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { t } = useTranslation();
  const [saveBankAccount, { isLoading: isSaving }] = useSaveBankAccountMutation();

  const [accountHolder, setAccountHolder] = useState('');
  const [bankName, setBankName] = useState('');
  const [sortCode, setSortCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [buildingSocietyRef, setBuildingSocietyRef] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatSortCode = (text: string) => {
    // Remove non-digits
    const digits = text.replace(/\D/g, '').slice(0, 6);
    // Format as XX-XX-XX
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!accountHolder.trim()) newErrors.accountHolder = t('onboarding.accountHolderRequired');
    if (!bankName.trim()) newErrors.bankName = t('onboarding.bankNameRequired');

    const rawSortCode = sortCode.replace(/-/g, '');
    if (!rawSortCode) {
      newErrors.sortCode = t('onboarding.sortCodeRequired');
    } else if (rawSortCode.length !== 6 || !/^\d{6}$/.test(rawSortCode)) {
      newErrors.sortCode = t('onboarding.sortCodeInvalid');
    }

    if (!accountNumber.trim()) {
      newErrors.accountNumber = t('onboarding.accountNumberRequired');
    } else if (!/^\d{8}$/.test(accountNumber.trim())) {
      newErrors.accountNumber = t('onboarding.accountNumberInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      await saveBankAccount({
        accountHolder: accountHolder.trim(),
        bankName: bankName.trim(),
        sortCode: sortCode.trim(),
        accountNumber: accountNumber.trim(),
        buildingSocietyRef: buildingSocietyRef.trim() || undefined,
      }).unwrap();
      toast.success('Bank details saved');
      navigation.navigate('OnboardingRTW');
    } catch (err: any) {
      console.error('saveBankAccount error:', JSON.stringify(err, null, 2));
      toast.error(err?.data?.error || err?.data?.message || err?.message || 'Failed to save bank details');
    }
  };

  const handleSkip = () => {
    navigation.navigate('OnboardingRTW');
  };

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <StepHeader currentStep={5} totalSteps={6} onBack={() => navigation.goBack()} />

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <H1 className="mb-2">{t('onboarding.bankAccountDetails')}</H1>
        <Body color="secondary" className="mb-6 leading-6">
          {t('onboarding.bankAccountDesc')}
        </Body>

        {/* Info Box */}
        <View
          className="rounded-xl p-4 mb-8"
          style={{ backgroundColor: `${primaryColor}10`, borderLeftWidth: 4, borderLeftColor: primaryColor }}
        >
          <View className="flex-row items-start">
            <Body style={{ color: primaryColor, fontSize: 18, marginRight: 10 }}>🔒</Body>
            <View className="flex-1">
              <Body className="leading-6" color="secondary">
                {t('onboarding.bankSecurityNote')}
              </Body>
            </View>
          </View>
        </View>

        <View className="gap-5">
          <Input
            label={t('onboarding.accountHolderName')}
            placeholder={t('onboarding.accountHolderPlaceholder')}
            value={accountHolder}
            onChangeText={(t) => { setAccountHolder(t); setErrors({ ...errors, accountHolder: '' }); }}
            autoComplete="name"
            error={errors.accountHolder}
            required
          />

          <Input
            label={t('onboarding.bankName')}
            placeholder={t('onboarding.bankNamePlaceholder')}
            value={bankName}
            onChangeText={(t) => { setBankName(t); setErrors({ ...errors, bankName: '' }); }}
            error={errors.bankName}
            required
          />

          <View>
            <Input
              label={t('onboarding.sortCode')}
              placeholder="e.g. 12-34-56"
              value={sortCode}
              onChangeText={(t) => {
                setSortCode(formatSortCode(t));
                setErrors({ ...errors, sortCode: '' });
              }}
              keyboardType="number-pad"
              maxLength={8}
              error={errors.sortCode}
              required
            />
            <View className="flex-row items-center mt-1.5">
              <Body className="text-xs mr-1" color="muted">ⓘ</Body>
              <Body className="text-xs" color="muted">{t('onboarding.sortCodeHint')}</Body>
            </View>
          </View>

          <View>
            <Input
              label={t('onboarding.accountNumber')}
              placeholder="e.g. 12345678"
              value={accountNumber}
              onChangeText={(t) => {
                const digits = t.replace(/\D/g, '').slice(0, 8);
                setAccountNumber(digits);
                setErrors({ ...errors, accountNumber: '' });
              }}
              keyboardType="number-pad"
              maxLength={8}
              error={errors.accountNumber}
              required
            />
            <View className="flex-row items-center mt-1.5">
              <Body className="text-xs mr-1" color="muted">ⓘ</Body>
              <Body className="text-xs" color="muted">{t('onboarding.accountNumberHint')}</Body>
            </View>
          </View>

          <Input
            label={t('onboarding.buildingSocietyRef')}
            placeholder={t('onboarding.ifApplicable')}
            value={buildingSocietyRef}
            onChangeText={setBuildingSocietyRef}
          />
        </View>
      </ScrollView>

      <View className="px-6 pb-4 gap-3">
        <Button onPress={handleSave} disabled={isSaving}>
          {isSaving ? t('onboarding.saving') : t('onboarding.saveAndContinue')}
        </Button>
        <Button variant="outline" onPress={handleSkip}>
          {t('onboarding.skipForNow')}
        </Button>
      </View>
    </View>
  );
}

export default OnboardingBankAccountScreen;

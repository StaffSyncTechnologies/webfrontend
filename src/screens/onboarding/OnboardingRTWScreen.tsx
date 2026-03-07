import React, { useState } from 'react';
import { View, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrgTheme } from '../../contexts';
import { Button, Input, H1, Body, StepHeader } from '../../components/ui';
import { useTranslation } from 'react-i18next';
import type { AuthStackScreenProps } from '../../types/navigation';

type Props = AuthStackScreenProps<'OnboardingRTW'>;

export function OnboardingRTWScreen({ navigation }: Props) {
  const { primaryColor } = useOrgTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [shareCode, setShareCode] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!shareCode.trim()) newErrors.shareCode = t('onboarding.shareCodeRequired');
    if (shareCode.trim() && shareCode.trim().replace(/[-\s]/g, '').length !== 9) newErrors.shareCode = t('onboarding.shareCodeInvalid');
    if (!dateOfBirth.trim()) newErrors.dateOfBirth = t('onboarding.dobRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleComplete = () => {
    if (!validate()) return;
    // TODO: Submit RTW to backend
    navigation.navigate('VerificationSuccess');
  };

  const openHelp = () => {
    Linking.openURL('https://www.gov.uk/view-right-to-work');
  };

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <StepHeader currentStep={6} totalSteps={6} onBack={() => navigation.goBack()} />

      <View className="flex-1 px-6">
        <H1 className="mb-2">{t('onboarding.rtwVerification')}</H1>
        <Body color="secondary" className="mb-6 leading-6">
          {t('onboarding.rtwVerificationDesc')}
        </Body>

        {/* Info Box */}
        <View
          className="rounded-xl p-4 mb-8"
          style={{ backgroundColor: `${primaryColor}10`, borderLeftWidth: 4, borderLeftColor: primaryColor }}
        >
          <View className="flex-row items-start">
            <Body style={{ color: primaryColor, fontSize: 18, marginRight: 10 }}>ℹ</Body>
            <View className="flex-1">
              <Body className="leading-6" color="secondary">
                {t('onboarding.rtwInfoText')}{' '}
                <Body className="font-outfit-bold">{t('onboarding.nineCharShareCode')}</Body>{' '}
                {t('onboarding.fromHomeOffice')}
              </Body>
              <TouchableOpacity onPress={openHelp} className="mt-2">
                <Body style={{ color: primaryColor }} className="font-outfit-semibold">
                  {t('onboarding.whereToFind')}
                </Body>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="gap-5">
          <View>
            <Input
              label={t('onboarding.shareCode')}
              placeholder="e.g: A23 - 994 - 49H"
              value={shareCode}
              onChangeText={(t) => { setShareCode(t.toUpperCase()); setErrors({ ...errors, shareCode: '' }); }}
              autoCapitalize="characters"
              error={errors.shareCode}
            />
            <View className="flex-row items-center mt-1.5">
              <Body className="text-xs mr-1" color="muted">ⓘ</Body>
              <Body className="text-xs" color="muted">{t('onboarding.shareCodeHint')}</Body>
            </View>
          </View>

          <View>
            <Input
              label={t('onboarding.dateOfBirth')}
              placeholder="dd/mm/yy"
              value={dateOfBirth}
              onChangeText={(t) => { setDateOfBirth(t); setErrors({ ...errors, dateOfBirth: '' }); }}
              error={errors.dateOfBirth}
            />
            <View className="flex-row items-center mt-1.5">
              <Body className="text-xs mr-1" color="muted">ⓘ</Body>
              <Body className="text-xs" color="muted">{t('onboarding.dobHint')}</Body>
            </View>
          </View>
        </View>
      </View>

      <View className="px-6 pb-4">
        <Button onPress={handleComplete}>
          {t('onboarding.completeSetup')}
        </Button>
      </View>
    </View>
  );
}

export default OnboardingRTWScreen;

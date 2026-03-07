import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrgTheme } from '../../contexts';
import { Button, H1, Body } from '../../components/ui';
import { useTranslation } from 'react-i18next';
import type { AuthStackScreenProps } from '../../types/navigation';

type Props = AuthStackScreenProps<'VerificationSuccess'>;

export function VerificationSuccessScreen({ navigation }: Props) {
  const { primaryColor } = useOrgTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const handleGoToDashboard = () => {
    // Navigate to main app
    navigation.getParent()?.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <View className="flex-1 items-center justify-center px-8">
        {/* Checkmark */}
        <View className="mb-8">
          <View
            style={{
              width: 80,
              height: 80,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Body style={{ fontSize: 64, color: '#34A853' }}>✓</Body>
          </View>
        </View>

        {/* Title */}
        <H1 className="text-center mb-4">{t('auth.allSet')}</H1>

        {/* Description */}
        <Body color="secondary" className="text-center leading-6">
          {t('auth.allSetDesc')}
        </Body>
      </View>

      {/* Button */}
      <View className="px-6 pb-8">
        <Button onPress={handleGoToDashboard}>
          {t('auth.goToDashboard')}
        </Button>
      </View>
    </View>
  );
}

export default VerificationSuccessScreen;

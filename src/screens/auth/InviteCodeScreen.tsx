import React, { useState } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { useToast } from '../../contexts';
import { useValidateInviteCodeMutation } from '../../store';
import { Container, Input, Button, H1, Body, Caption } from '../../components/ui';
import { useTranslation } from 'react-i18next';
import type { AuthStackScreenProps } from '../../types/navigation';

type Props = AuthStackScreenProps<'InviteCode'>;

export function InviteCodeScreen({ navigation }: Props) {
  const toast = useToast();
  const { t } = useTranslation();
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [validateInviteCode, { isLoading }] = useValidateInviteCodeMutation();

  const handleVerify = async () => {
    if (!inviteCode.trim()) {
      setError(t('auth.enterInviteCode'));
      return;
    }
    setError('');

    try {
      console.log('Validating invite code:', inviteCode.trim());
      const result = await validateInviteCode({ code: inviteCode.trim() }).unwrap();
      console.log('Validation result:', result);
      if (result.success && result.data) {
        navigation.navigate('AgencyConfirm', {
          agency: {
            id: result.data.organizationId,
            name: result.data.organizationName,
            logoUrl: result.data.logoUrl,
            coverImageUrl: result.data.coverImageUrl,
            primaryColor: result.data.primaryColor,
            secondaryColor: result.data.secondaryColor,
            inviteCode: inviteCode.trim(),
          },
        });
      }
    } catch (err: any) {
      console.log('Validation error:', JSON.stringify(err, null, 2));
      const message = err?.data?.message || 'Invalid invite code';
      setError(message);
      toast.error(message);
    }
  };

  return (
    <Container keyboard padding="lg">
      <View className="flex-1 pt-10">
        <Image
          source={require('../../../assets/logo.png')}
          className="w-16 h-16 mb-6"
          resizeMode="contain"
        />
        <H1 className="mb-2">{t('auth.joinStaffSync')}</H1>
        <Body color="secondary" className="mb-8 leading-6">
          {t('auth.enterInviteCode')}
        </Body>

        <Input
          label={t('auth.agencyCode')}
          placeholder={t('auth.enterReferralCode')}
          value={inviteCode}
          onChangeText={(t) => { setInviteCode(t); setError(''); }}
          autoCapitalize="characters"
          autoCorrect={false}
          error={error}
          hint={t('auth.inviteCaseSensitive')}
          containerClassName="mt-2"
        />
      </View>

      <View className="pb-6">
        <Button onPress={handleVerify} loading={isLoading}>
          {t('auth.verifyCode')}
        </Button>
        <TouchableOpacity className="mt-4 py-2">
          <Body color="secondary" className="text-center">
            {t('auth.dontHaveCode')}{' '}
            <Body className="text-primary-blue">{t('auth.contactAgency')}</Body>
          </Body>
        </TouchableOpacity>
        <TouchableOpacity className="mt-2 py-2" onPress={() => navigation.navigate('Login', {})}>
          <Body color="secondary" className="text-center">
            {t('auth.alreadyHaveAccount')}{' '}
            <Body className="text-primary-blue font-semibold">{t('auth.login')}</Body>
          </Body>
        </TouchableOpacity>
      </View>
    </Container>
  );
}

export default InviteCodeScreen;

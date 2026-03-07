import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToast, useOrgTheme } from '../../contexts';
import { useForgotPasswordMutation } from '../../store/api/authApi';
import { Container, Input, Button, H1, H2, Body, Caption } from '../../components/ui';
import { useTranslation } from 'react-i18next';
import type { AuthStackScreenProps } from '../../types/navigation';

type Props = AuthStackScreenProps<'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const toast = useToast();
  const { t } = useTranslation();
  const { primaryColor } = useOrgTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [sent, setSent] = useState(false);
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const validate = () => {
    if (!email.trim()) {
      setError(t('auth.emailRequired'));
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(t('auth.invalidEmail'));
      return false;
    }
    setError(undefined);
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await forgotPassword({ email: email.trim() }).unwrap();
      setSent(true);
    } catch (err: any) {
      const message = err?.data?.error || err?.data?.message || err?.message || 'Something went wrong';
      toast.error(message);
    }
  };

  if (sent) {
    return (
      <Container padding="lg" className="justify-between">
        <View className="flex-1 justify-center items-center px-4">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-6"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <Ionicons name="mail-outline" size={40} color={primaryColor} />
          </View>
          <H2 className="text-center mb-3">{t('auth.resetLinkSent')}</H2>
          <Body color="secondary" className="text-center leading-5">
            {t('auth.resetLinkSentDesc')}
          </Body>
        </View>

        <View className="pb-4">
          <Button onPress={() => navigation.goBack()}>
            {t('auth.backToLogin')}
          </Button>
        </View>
      </Container>
    );
  }

  return (
    <Container keyboard padding="lg" className="justify-between">
      <View className="flex-1 justify-start pt-4">
        {/* Header */}
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-6">
          <Ionicons name="chevron-back" size={24} color="#000035" />
        </TouchableOpacity>

        <H1 className="mb-2">{t('auth.forgotPasswordTitle')}</H1>
        <Body color="secondary" className="leading-5 mb-8">
          {t('auth.forgotPasswordDesc')}
        </Body>

        <Input
          label={t('auth.emailAddress')}
          required
          placeholder={t('auth.enterEmail')}
          value={email}
          onChangeText={(text) => { setEmail(text); setError(undefined); }}
          keyboardType="email-address"
          autoComplete="email"
          autoCapitalize="none"
          error={error}
        />
      </View>

      <View className="pb-4">
        <Button onPress={handleSubmit} loading={isLoading}>
          {t('auth.sendResetLink')}
        </Button>
      </View>
    </Container>
  );
}

export default ForgotPasswordScreen;

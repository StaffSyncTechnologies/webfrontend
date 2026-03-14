import React, { useState } from 'react';
import { View, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToast, useOrgTheme } from '../../contexts';
import { useWorkerRegisterMutation } from '../../store';
import { Container, Input, Button, H1, H2, Body } from '../../components/ui';
import { useTranslation } from 'react-i18next';
import type { AuthStackScreenProps } from '../../types/navigation';

type Props = AuthStackScreenProps<'Register'>;

export function RegisterScreen({ navigation, route }: Props) {
  const toast = useToast();
  const { t } = useTranslation();
  const { orgTheme, primaryColor } = useOrgTheme();
  const { inviteCode: initialCode, agencyName } = route.params || {};
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registerWorker, { isLoading }] = useWorkerRegisterMutation();

  const clearError = (field: string) => {
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = t('auth.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = t('auth.invalidEmail');
    if (!password) newErrors.password = t('auth.passwordRequired');
    else if (password.length < 8) newErrors.password = t('auth.passwordTooShort');
    if (!confirmPassword) newErrors.confirmPassword = t('auth.confirmPasswordRequired');
    else if (password !== confirmPassword) newErrors.confirmPassword = t('auth.passwordsDoNotMatch');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      const result = await registerWorker({
        inviteCode: initialCode,
        email: email.trim(),
        password,
      }).unwrap();

      if (result.success) {
        toast.success('OTP sent to your email');
        navigation.navigate('VerifyOTP', { email: email.trim(), inviteCode: initialCode });
      }
    } catch (err: any) {
      console.error('register error:', JSON.stringify(err, null, 2));
      const message = err?.data?.error || err?.data?.message || err?.error || err?.message || 'Registration failed';
      toast.error(message);
    }
  };

  return (
    <Container keyboard scroll padding="lg">
      <View className="pt-6">
        {/* Agency Logo */}
        <View className="w-16 h-16 mb-4 rounded-xl items-center justify-center overflow-hidden bg-white">
          <Image
            source={orgTheme?.logoUrl 
              ? { uri: orgTheme.logoUrl } 
              : require('../../../assets/staffsync-logo.png')
            }
            className="w-14 h-14"
            resizeMode="contain"
          />
        </View>
        
        <H1 className="mb-2">{t('auth.createAccount')}</H1>
        {(agencyName || orgTheme?.organizationName) && (
          <Body color="secondary" className="mb-1">
            {t('auth.joining')} <Body className="font-semibold" style={{ color: primaryColor }}>{orgTheme?.organizationName || agencyName}</Body>
          </Body>
        )}
        <Body color="muted" className="mb-8">
          {t('auth.enterDetailsToStart')}
        </Body>

        <View className="gap-4">
          <Input
            label={t('auth.emailAddress')}
            placeholder={t('auth.enterEmail')}
            value={email}
            onChangeText={(t) => { setEmail(t); clearError('email'); }}
            keyboardType="email-address"
            autoComplete="email"
            autoCapitalize="none"
            error={errors.email}
            required
          />

          <Input
            label={t('auth.password')}
            placeholder={t('auth.enterPassword')}
            value={password}
            onChangeText={(t) => { setPassword(t); clearError('password'); }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            error={errors.password}
            required
            hint={t('auth.passwordMinLength')}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={22}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            }
          />

          <Input
            label={t('auth.confirmPassword')}
            placeholder={t('auth.reenterPassword')}
            value={confirmPassword}
            onChangeText={(t) => { setConfirmPassword(t); clearError('confirmPassword'); }}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            error={errors.confirmPassword}
            required
            rightIcon={
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={22}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            }
          />
        </View>
      </View>

      <View className="mt-8 pb-6">
        <Button onPress={handleRegister} loading={isLoading}>
          {t('auth.continue')}
        </Button>
        <TouchableOpacity
          className="mt-4 py-2"
          onPress={() => navigation.navigate('Login', {})}
        >
          <Body color="secondary" className="text-center">
            {t('auth.alreadyHaveAccount')}{' '}
            <Body className="font-outfit-bold" style={{ color: primaryColor }}>{t('auth.loginHere')}</Body>
          </Body>
        </TouchableOpacity>
      </View>
    </Container>
  );
}

export default RegisterScreen;

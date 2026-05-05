import React, { useState } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import { useToast, useOrgTheme, useTheme } from '../../../contexts';
import { useDispatch } from 'react-redux';
import { Container, Input, Button, H1, Body } from '../../../components/ui';
import { useTranslation } from 'react-i18next';
import { useAdminLoginMutation } from '../../../store/api/authApi';
import { setAdminCredentials } from '../../../store/slices/authSlice';
import type { AuthStackScreenProps } from '../../../types/navigation';

type Props = AuthStackScreenProps<'AgencyLogin'>;

export function AgencyLoginScreen({ navigation }: Props) {
  const dispatch = useDispatch();
  const toast = useToast();
  const { t } = useTranslation();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const [adminLogin, { isLoading }] = useAdminLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = t('auth.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = t('auth.invalidEmail');
    }
    if (!password) {
      newErrors.password = t('auth.passwordRequired');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      console.log('Attempting admin login with:', { email });
      const result = await adminLogin({ email, password }).unwrap();
      
      console.log('Admin login response:', result);
      
      if (result.success && result.data?.token && (result.data?.user || result.data?.admin)) {
        toast.success(t('auth.loginSuccess') || 'Login successful');

        // Store admin credentials in Redux
        dispatch(setAdminCredentials({
          token: result.data.token,
          admin: (result.data.admin || result.data.user)!,
          organization: result.data.organization,
        }));

        // Redirect to dashboard
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'AdminMain' }],
          })
        );
      } else {
        console.error('Login response invalid:', result);
        toast.error('Login failed: Invalid response');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      let errorMessage = t('auth.invalidCredentials') || 'Invalid email or password';
      if (err?.data?.error) {
        errorMessage = err.data.error;
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    }
  };

  return (
    <Container keyboard padding="lg" className="justify-between bg-light-background-primary dark:bg-dark-background-primary">
      {/* Top Section */}
      <View className="flex-1 justify-start pt-8">
        {/* Logo */}
        <Image
          source={require('../../../../assets/logo.png')}
          className="w-12 h-12 mb-6"
          resizeMode="contain"
        />

        {/* Heading */}
        <H1 className="mb-2">{t('auth.agencyLogin')}</H1>
        <Body color="secondary" className="leading-5 mb-8">
          {t('auth.agencyLoginDescription')}
        </Body>

        {/* Email Input */}
        <Input
          label={t('auth.emailAddress')}
          required
          placeholder={t('auth.enterEmail')}
          value={email}
          onChangeText={(text: string) => { setEmail(text); setErrors((e) => ({ ...e, email: undefined })); }}
          keyboardType="email-address"
          autoComplete="email"
          autoCapitalize="none"
          error={errors.email}
          containerClassName="mb-4"
        />

        {/* Password Input */}
        <Input
          label={t('auth.password')}
          required
          placeholder={t('auth.enterPassword')}
          value={password}
          onChangeText={(text: string) => { setPassword(text); setErrors((e) => ({ ...e, password: undefined })); }}
          secureTextEntry={!showPassword}
          autoComplete="password"
          autoCapitalize="none"
          error={errors.password}
          rightIcon={
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={22}
                color={isDark ? '#9CA3AF' : '#9CA3AF'}
              />
            </TouchableOpacity>
          }
        />

        {/* Forgot Password */}
        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
          className="self-end mt-2"
        >
          <Body className="font-outfit-semibold" style={{ color: primaryColor }}>
            {t('auth.forgotPassword')}
          </Body>
        </TouchableOpacity>
      </View>

      {/* Bottom Section */}
      <View className="pb-4">
        <Button onPress={handleLogin} className="mb-4" disabled={isLoading}>
          {isLoading ? t('common.loading') : t('auth.login')}
        </Button>

        <View className="flex-row justify-center items-center gap-1 mb-3">
          <Body color="secondary">{t('auth.dontHaveAccount')}</Body>
          <TouchableOpacity onPress={() => navigation.navigate('AdminOnboarding')}>
            <Body className="font-outfit-bold" style={{ color: primaryColor }}>{t('auth.register')}</Body>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ChooseAccountType')}>
          <Body className="text-center text-sm" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
            {t('auth.switchAccountType')}
          </Body>
        </TouchableOpacity>
      </View>
    </Container>
  );
}

export default AgencyLoginScreen;

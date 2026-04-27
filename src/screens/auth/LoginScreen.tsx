import React, { useState } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import { useToast, useOrgTheme } from '../../contexts';
import { useWorkerPasswordLoginMutation } from '../../store/api/authApi';
import { Container, Input, Button, H1, Body } from '../../components/ui';
import { useTranslation } from 'react-i18next';
import type { AuthStackScreenProps } from '../../types/navigation';
import { buildFileUrl } from '../../utils/buildFileUrl';

type Props = AuthStackScreenProps<'Login'>;

export function LoginScreen({ navigation }: Props) {
  const toast = useToast();
  const { t } = useTranslation();
  const { primaryColor, orgTheme, setOrgTheme, loadOrgTheme } = useOrgTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [login, { isLoading }] = useWorkerPasswordLoginMutation();
  const [logoError, setLogoError] = useState(false);

  // Debug logo URL and organization theme
  console.log('orgTheme.logoUrl:', orgTheme?.logoUrl);
  console.log('Full orgTheme:', orgTheme);
  console.log('orgTheme exists:', !!orgTheme);

  const handleTestThemeLoad = async () => {
    console.log('Manual theme load test...');
    await loadOrgTheme();
    console.log('Theme load test completed');
  };

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
      const result = await login({ email: email.trim(), password }).unwrap();
      console.log('Login result:', result);
      console.log('Worker data:', result.data?.worker);
      console.log('Organization data:', result.data?.worker?.organization);
      
      if (result.success && result.data?.token) {
        const org = result.data.worker?.organization;
        console.log('Org variable:', org);
        console.log('org.logoUrl raw:', org?.logoUrl);
        console.log('buildFileUrl result:', buildFileUrl(org?.logoUrl));
        
        if (org) {
          const themeData = {
            organizationId: org.id,
            organizationName: org.name,
            logoUrl: buildFileUrl(org.logoUrl),
            primaryColor: org.primaryColor || '#000035',
            secondaryColor: org.secondaryColor,
          };
          console.log('Setting orgTheme with:', themeData);
          setOrgTheme(themeData);
        }
        toast.success('Login successful');

        // Redirect to dashboard
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          })
        );
      }
    } catch (err: any) {
      console.error('Login error:', JSON.stringify(err, null, 2));
      
      // Extract the actual error message from backend response
      let errorMessage = 'Invalid email or password';
      
      if (err?.status === 401 && err?.data?.error) {
        // Backend error format: { status: 401, data: { success: false, error: "Specific message", code: "ERROR_CODE" } }
        errorMessage = err.data.error;
        
        // Set specific field errors based on error code
        if (err.data.code === 'USER_NOT_FOUND') {
          setErrors({ email: errorMessage });
        } else if (err.data.code === 'INCORRECT_PASSWORD') {
          setErrors({ password: errorMessage });
        } else {
          setErrors({ password: errorMessage });
        }
      } else if (err?.data?.error) {
        errorMessage = err.data.error;
        setErrors({ password: errorMessage });
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
        setErrors({ password: errorMessage });
      } else if (err?.message) {
        errorMessage = err.message;
        setErrors({ password: errorMessage });
      }
      
      toast.error(errorMessage);
    }
  };

  return (
    <Container keyboard padding="lg" className="justify-between">
      {/* Top Section */}
      <View className="flex-1 justify-start pt-8">
        {/* Agency Logo (falls back to StaffSync logo) */}
        {orgTheme?.logoUrl && !logoError ? (
          <Image
            source={{ uri: `${orgTheme.logoUrl}?t=${Date.now()}` }}
            className="w-16 h-16 rounded-xl mb-6"
            resizeMode="contain"
            onError={() => setLogoError(true)}
          />
        ) : (
          <Image
            source={require('../../../assets/logo.png')}
            className="w-12 h-12 mb-6"
            resizeMode="contain"
          />
        )}

        {/* Heading */}
        <H1 className="mb-2">{t('auth.welcomeBack')}</H1>
        <Body color="secondary" className="leading-5 mb-8">
          {t('auth.enterDetailsToLogin')}
        </Body>

        {/* Email Input */}
        <Input
          label={t('auth.emailAddress')}
          required
          placeholder={t('auth.enterEmail')}
          value={email}
          onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: undefined })); }}
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
          onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: undefined })); }}
          secureTextEntry={!showPassword}
          autoComplete="password"
          autoCapitalize="none"
          error={errors.password}
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
        <Button onPress={handleLogin} loading={isLoading} className="mb-4">
          {t('auth.login')}
        </Button>

        <View className="flex-row justify-center items-center gap-1">
          <Body color="secondary">{t('auth.dontHaveAccount')}</Body>
          <TouchableOpacity onPress={() => navigation.navigate('InviteCode')}>
            <Body className="font-outfit-bold" style={{ color: primaryColor }}>{t('auth.register')}</Body>
          </TouchableOpacity>
        </View>
      </View>
    </Container>
  );
}

export default LoginScreen;

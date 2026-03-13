import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, TextInput as RNTextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToast, useOrgTheme } from '../../contexts';
import { useForgotPasswordMutation, useResetPasswordWithOtpMutation } from '../../store/api/authApi';
import { Container, Input, Button, H1, H2, Body } from '../../components/ui';
import { useTranslation } from 'react-i18next';
import type { AuthStackScreenProps } from '../../types/navigation';

type Props = AuthStackScreenProps<'ForgotPassword'>;
type Step = 'email' | 'otp' | 'newPassword' | 'success';

export function ForgotPasswordScreen({ navigation }: Props) {
  const toast = useToast();
  const { t } = useTranslation();
  const { primaryColor } = useOrgTheme();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [countdown, setCountdown] = useState(0);

  const otpRefs = useRef<(RNTextInput | null)[]>([]);
  const [forgotPassword, { isLoading: isSending }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordWithOtpMutation();

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const [deliveredVia, setDeliveredVia] = useState('');

  // ── Step 1: Email ──
  const handleSendOtp = async () => {
    if (!email.trim()) {
      setErrors({ email: t('auth.emailRequired') });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrors({ email: t('auth.invalidEmail') });
      return;
    }
    setErrors({});
    try {
      const result = await forgotPassword({ email: email.trim() }).unwrap();
      const via = (result as any)?.data?.deliveredVia || 'email';
      setDeliveredVia(via);
      setStep('otp');
      setCountdown(60);
      toast.success(via === 'sms' ? 'Code sent via SMS' : 'Verification code sent to your email');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Something went wrong');
    }
  };

  // ── Step 2: OTP ──
  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    // Handle paste of full code
    if (text.length > 1) {
      const chars = text.replace(/\D/g, '').slice(0, 6).split('');
      chars.forEach((c, i) => { if (i < 6) newOtp[i] = c; });
      setOtp(newOtp);
      otpRefs.current[Math.min(chars.length, 5)]?.focus();
      return;
    }
    newOtp[index] = text.replace(/\D/g, '');
    setOtp(newOtp);
    if (text && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setErrors({ otp: 'Please enter the full 6-digit code' });
      return;
    }
    setErrors({});
    setStep('newPassword');
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    try {
      await forgotPassword({ email: email.trim() }).unwrap();
      setOtp(['', '', '', '', '', '']);
      setCountdown(60);
      toast.success('New code sent');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to resend code');
    }
  };

  // ── Step 3: New Password ──
  const handleResetPassword = async () => {
    const errs: Record<string, string> = {};
    if (!newPassword) errs.newPassword = 'Password is required';
    else if (newPassword.length < 8) errs.newPassword = 'Must be at least 8 characters';
    if (newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    try {
      await resetPassword({
        email: email.trim(),
        code: otp.join(''),
        newPassword,
      }).unwrap();
      setStep('success');
    } catch (err: any) {
      const msg = err?.data?.message || err?.data?.error || 'Reset failed';
      if (msg.toLowerCase().includes('code') || msg.toLowerCase().includes('otp')) {
        // OTP was invalid/expired, send back to OTP step
        toast.error(msg);
        setStep('otp');
        setOtp(['', '', '', '', '', '']);
      } else {
        setErrors({ submit: msg });
      }
    }
  };

  const handleBack = () => {
    if (step === 'otp') setStep('email');
    else if (step === 'newPassword') setStep('otp');
    else navigation.goBack();
  };

  // ── Success Screen ──
  if (step === 'success') {
    return (
      <Container padding="lg" className="justify-between">
        <View className="flex-1 justify-center items-center px-4">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-6"
            style={{ backgroundColor: '#34A85315' }}
          >
            <Ionicons name="checkmark-circle" size={44} color="#34A853" />
          </View>
          <H2 className="text-center mb-3">Password Reset!</H2>
          <Body color="secondary" className="text-center leading-5">
            Your password has been updated successfully. You can now log in with your new password.
          </Body>
        </View>
        <View className="pb-4">
          <Button onPress={() => navigation.navigate('Login')}>
            Back to Login
          </Button>
        </View>
      </Container>
    );
  }

  return (
    <Container keyboard padding="lg" className="justify-between">
      <View className="flex-1 justify-start pt-4">
        {/* Back Button */}
        <TouchableOpacity onPress={handleBack} className="mb-6">
          <Ionicons name="chevron-back" size={24} color="#000035" />
        </TouchableOpacity>

        {/* ── Step 1: Email ── */}
        {step === 'email' && (
          <>
            <H1 className="mb-2">{t('auth.forgotPasswordTitle')}</H1>
            <Body color="secondary" className="leading-5 mb-8">
              Enter your email address and we'll send you a verification code to reset your password.
            </Body>
            <Input
              label={t('auth.emailAddress')}
              required
              placeholder={t('auth.enterEmail')}
              value={email}
              onChangeText={(text) => { setEmail(text); setErrors({}); }}
              keyboardType="email-address"
              autoComplete="email"
              autoCapitalize="none"
              error={errors.email}
            />
          </>
        )}

        {/* ── Step 2: OTP ── */}
        {step === 'otp' && (
          <>
            <View className="items-center mb-2">
              <View
                className="w-16 h-16 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <Ionicons name="mail-open-outline" size={32} color={primaryColor} />
              </View>
            </View>
            <H1 className="mb-2 text-center">Enter Verification Code</H1>
            <Body color="secondary" className="leading-5 mb-6 text-center">
              {deliveredVia === 'sms'
                ? 'We sent a 6-digit code via SMS to your phone'
                : <>We sent a 6-digit code to{'\n'}<Body className="font-outfit-semibold">{email}</Body></>
              }
            </Body>

            {/* OTP Input Boxes */}
            <View className="flex-row justify-center mb-4" style={{ gap: 10 }}>
              {otp.map((digit, i) => (
                <RNTextInput
                  key={i}
                  ref={(ref) => { otpRefs.current[i] = ref; }}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, i)}
                  onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, i)}
                  keyboardType="number-pad"
                  maxLength={i === 0 ? 6 : 1}
                  selectTextOnFocus
                  style={{
                    width: 48, height: 56, borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: digit ? primaryColor : '#D1D5DB',
                    backgroundColor: digit ? `${primaryColor}08` : '#F9FAFB',
                    textAlign: 'center',
                    fontSize: 22,
                    fontFamily: 'Outfit-SemiBold',
                    color: '#000035',
                  }}
                />
              ))}
            </View>

            {errors.otp && (
              <Body className="text-center mb-3" style={{ color: '#EA4335', fontSize: 13 }}>{errors.otp}</Body>
            )}

            {/* Resend */}
            <View className="items-center mt-2">
              {countdown > 0 ? (
                <Body color="muted" className="text-sm">
                  Resend code in {countdown}s
                </Body>
              ) : (
                <TouchableOpacity onPress={handleResendOtp} disabled={isSending}>
                  <Body className="font-outfit-semibold" style={{ color: primaryColor }}>
                    {isSending ? 'Sending...' : 'Resend Code'}
                  </Body>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        {/* ── Step 3: New Password ── */}
        {step === 'newPassword' && (
          <>
            <H1 className="mb-2">Create New Password</H1>
            <Body color="secondary" className="leading-5 mb-8">
              Your new password must be at least 8 characters long.
            </Body>

            <Input
              label="New Password"
              required
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={(t) => { setNewPassword(t); setErrors((e) => ({ ...e, newPassword: undefined } as any)); }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              error={errors.newPassword}
              containerClassName="mb-4"
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={22} color="#9CA3AF" />
                </TouchableOpacity>
              }
            />

            <Input
              label="Confirm Password"
              required
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); setErrors((e) => ({ ...e, confirmPassword: undefined } as any)); }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              error={errors.confirmPassword}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={22} color="#9CA3AF" />
                </TouchableOpacity>
              }
            />

            {errors.submit && (
              <View className="mt-4 p-3 rounded-xl" style={{ backgroundColor: '#FEF2F2' }}>
                <Body style={{ color: '#991B1B', fontSize: 13 }}>{errors.submit}</Body>
              </View>
            )}
          </>
        )}
      </View>

      {/* Bottom Button */}
      <View className="pb-4">
        {step === 'email' && (
          <Button onPress={handleSendOtp} loading={isSending}>
            Send Verification Code
          </Button>
        )}
        {step === 'otp' && (
          <Button onPress={handleVerifyOtp}>
            Verify Code
          </Button>
        )}
        {step === 'newPassword' && (
          <Button onPress={handleResetPassword} loading={isResetting}>
            Reset Password
          </Button>
        )}
      </View>
    </Container>
  );
}

export default ForgotPasswordScreen;

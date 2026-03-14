import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast, useOrgTheme } from '../../contexts';
import { useWorkerVerifyOtpMutation, useWorkerLoginMutation } from '../../store';
import { Button, H1, Body, Label } from '../../components/ui';
import { useTranslation } from 'react-i18next';
import type { AuthStackScreenProps } from '../../types/navigation';

type Props = AuthStackScreenProps<'VerifyOTP'>;

export function VerifyOTPScreen({ route, navigation }: Props) {
  const { email } = route.params;
  const toast = useToast();
  const { t } = useTranslation();
  const { primaryColor } = useOrgTheme();
  const insets = useSafeAreaInsets();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  
  const [verifyOtp, { isLoading }] = useWorkerVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useWorkerLoginMutation();

  useEffect(() => {
    const timer = countdown > 0 && setInterval(() => setCountdown(c => c - 1), 1000);
    return () => { if (timer) clearInterval(timer); };
  }, [countdown]);

  const formatCountdown = () => {
    const mins = Math.floor(countdown / 60).toString().padStart(2, '0');
    const secs = (countdown % 60).toString().padStart(2, '0');
    return `${mins}:${secs}s`;
  };

  const handleOtpChange = (value: string, index: number) => {
    const digits = value.replace(/[^0-9]/g, '');
    if (digits.length > 1) {
      const pastedOtp = digits.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char;
      });
      setOtp(newOtp);
      inputRefs.current[Math.min(index + pastedOtp.length, 5)]?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = digits;
      setOtp(newOtp);
      if (digits && index < 5) inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace') {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return;

    try {
      const result = await verifyOtp({ email, code: otpCode }).unwrap();
      if (result.success) {
        navigation.navigate('OnboardingProfile');
      }
    } catch (err: any) {
      console.error('verifyOtp error:', JSON.stringify(err, null, 2));
      toast.error(err?.data?.error || err?.data?.message || err?.error || err?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      await resendOtp({ email }).unwrap();
      setCountdown(60);
      toast.success('Code resent to your email');
    } catch (err: any) {
      console.error('resendOtp error:', JSON.stringify(err, null, 2));
      toast.error(err?.data?.error || err?.data?.message || err?.error || err?.message || 'Failed to resend');
    }
  };

  const isComplete = otp.every(digit => digit !== '');

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center"
        >
          <Body className="text-xl">{'‹'}</Body>
        </TouchableOpacity>
        <View className="flex-1 items-center mr-10">
          <Body className="font-outfit-semibold text-base">{t('auth.verification')}</Body>
        </View>
      </View>

      {/* Content */}
      <View className="px-6 pt-6">
        <H1 className="mb-3">{t('auth.emailVerification')}</H1>
        <Body color="secondary" className="leading-6">
          {t('auth.enterOTP')}{' '}
          <Body className="font-semibold">{email}</Body>.
        </Body>

        {/* OTP Input */}
        <View className="mt-8">
          <View className="flex-row items-center mb-2">
            <Label>{t('auth.otpCode')}</Label>
            <Body className="text-status-error ml-0.5">*</Body>
          </View>
          
          <View className="flex-row gap-2">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={{ 
                  flex: 1, 
                  height: 56, 
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: digit ? primaryColor : '#D1D5DB',
                  color: '#1F2937',
                  fontSize: 22,
                  fontWeight: '600',
                  textAlign: 'center',
                }}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="number-pad"
                maxLength={6}
                selectTextOnFocus
                placeholderTextColor="#9CA3AF"
              />
            ))}
          </View>

          {/* Timer */}
          <View className="items-end mt-2">
            <Body color="secondary" className="text-sm">{formatCountdown()}</Body>
          </View>
        </View>

        {/* Resend */}
        <View className="flex-row justify-center items-center mt-4">
          <Body color="secondary">{t('auth.didntReceiveCode')}  </Body>
          <TouchableOpacity onPress={handleResend} disabled={countdown > 0 || isResending}>
            <Body className={`font-semibold ${countdown > 0 ? 'text-secondary-gray' : ''}`}
              style={countdown <= 0 ? { color: primaryColor } : undefined}
            >
              {t('auth.resend')}
            </Body>
          </TouchableOpacity>
        </View>
      </View>

      {/* Verify Button */}
      <View className="px-6 mt-10">
        <Button onPress={handleVerify} loading={isLoading} disabled={!isComplete}>
          {t('auth.verifyCode')}
        </Button>
      </View>
    </View>
  );
}

export default VerifyOTPScreen;

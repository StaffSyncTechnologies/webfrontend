import React from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import { useTheme, useOrgTheme } from '../../../contexts';
import { Body, Caption } from '../../../components/ui';

interface Props {
  otp: string[];
  setOtp: (otp: string[]) => void;
  countdown: number;
  setCountdown: (count: number) => void;
  adminEmail: string;
  inputRefs: React.MutableRefObject<(TextInput | null)[]>;
  handleOtpChange: (value: string, index: number) => void;
  handleKeyPress: (key: string, index: number) => void;
  formatCountdown: () => string;
}

export function AdminOnboardingStep4({ 
  otp, 
  setOtp, 
  countdown, 
  setCountdown, 
  adminEmail,
  inputRefs,
  handleOtpChange,
  handleKeyPress,
  formatCountdown
}: Props) {
  const { isDark } = useTheme();
  const { primaryColor } = useOrgTheme();

  return (
    <View className="gap-4">
      <Caption color="secondary" className="text-center mb-4">
        Enter the OTP code sent to your email address {adminEmail}.
      </Caption>
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
              borderColor: digit ? primaryColor : (isDark ? '#4B5563' : '#D1D5DB'),
              color: isDark ? '#FFFFFF' : '#1F2937',
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
            placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
          />
        ))}
      </View>
      <View className="flex-row justify-between items-center mt-2">
        <Caption color="secondary" className="text-sm">{formatCountdown()}</Caption>
        <TouchableOpacity onPress={() => setCountdown(60)}>
          <Body className="font-semibold" style={{ color: primaryColor }}>Resend</Body>
        </TouchableOpacity>
      </View>
    </View>
  );
}

import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useOrgTheme } from '../../../contexts';
import { useDispatch, useSelector } from 'react-redux';
import { Container, H2, Body, Caption, Button } from '../../../components/ui';
import { AdminOnboardingStep1 } from './AdminOnboardingStep1';
import { AdminOnboardingStep2 } from './AdminOnboardingStep2';
import { AdminOnboardingStep3 } from './AdminOnboardingStep3';
import { AdminOnboardingStep4 } from './AdminOnboardingStep4';
import type { AuthStackScreenProps } from '../../../types/navigation';
import {
  setCurrentStep,
  setAccountType,
  setOrgData,
  setAdminData,
  setOtp,
  setOtpDigit,
  setCountdown,
} from '../../../store/slices/adminSlices/onboardingSlice';
import type { RootState } from '../../../store';

type StepKey = 1 | 2 | 3 | 4;

type Props = AuthStackScreenProps<'AdminOnboarding'>;

export function AdminOnboardingScreen({ navigation }: Props) {
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const { primaryColor } = useOrgTheme();

  // Get state from Redux
  const {
    currentStep,
    accountType,
    orgData,
    adminData,
    otp,
    countdown,
    isLoading,
  } = useSelector((state: RootState) => state.adminOnboarding);

  // Local state for UI-only values
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const timer = countdown > 0 && setInterval(() => {
      dispatch(setCountdown(countdown - 1));
    }, 1000);
    return () => { if (timer) clearInterval(timer); };
  }, [countdown, dispatch]);

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
      dispatch(setOtp(newOtp));
      inputRefs.current[Math.min(index + pastedOtp.length, 5)]?.focus();
    } else {
      dispatch(setOtpDigit({ index, value: digits }));
      if (digits && index < 5) inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace') {
      if (otp[index]) {
        dispatch(setOtpDigit({ index, value: '' }));
      } else if (index > 0) {
        dispatch(setOtpDigit({ index: index - 1, value: '' }));
        inputRefs.current[index - 1]?.focus();
      }
    }
  };


  const industries = [
    'Healthcare & Medical', 'Hospitality & Catering', 'Warehouse & Logistics',
    'Construction', 'Retail', 'Security', 'Cleaning Services', 'Events & Entertainment',
    'Manufacturing', 'Other',
  ];

  const workerCounts = ['1-10', '11-50', '51-100', '101-500', '500+'];

  const jobTitles = [
    'CEO / Founder', 'Managing Director', 'Operations Manager', 'HR Manager',
    'Recruitment Manager', 'Branch Manager', 'Administrator', 'Other',
  ];

  const handleBack = () => {
    if (currentStep === 1) {
      navigation.goBack();
    } else {
      dispatch(setCurrentStep(currentStep - 1));
    }
  };

  const handleContinue = () => {
    if (currentStep === 1) {
      if (accountType === 'team') {
        // Navigate to respective flow
        return;
      }
      dispatch(setCurrentStep(2));
    } else if (currentStep < 4) {
      dispatch(setCurrentStep(currentStep + 1));
    } else if (currentStep === 4) {
      // After OTP verification, navigate to AgencyLogin
      navigation.navigate('AgencyLogin');
    }
  };

  const stepLabels = ['Onboarding', 'Organizational Details', 'Admin Account Setup', 'Verify Account'];


  return (
    <Container keyboard padding="lg" className="bg-light-background-primary dark:bg-dark-background-primary">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1">
          {currentStep > 1 && (
            <TouchableOpacity className="flex-row items-center gap-2 mb-6" onPress={handleBack}>
              <Ionicons name="arrow-back" size={18} color={isDark ? '#FFFFFF' : '#000035'} />
              <Body className="text-sm" style={{ color: isDark ? '#FFFFFF' : '#000035' }}>Go back</Body>
            </TouchableOpacity>
          )}

          {/* Step Indicator */}
          <View className="mb-6">
            <Caption color="secondary" className="mb-2">
              Step {currentStep > 3 ? 3 : currentStep} of 3: {stepLabels[currentStep - 1]}
            </Caption>
            <View className="flex-row gap-2">
              {[1, 2, 3].map((step) => (
                <View
                  key={step}
                  className="flex-1 h-1 rounded-full"
                  style={{ backgroundColor: currentStep >= step ? primaryColor : (isDark ? '#374151' : '#E5E7EB') }}
                />
              ))}
            </View>
          </View>

          {/* Title */}
          {currentStep === 1 && (
            <>
              <H2 className="text-center mb-2">Join STAFFSYNC</H2>
              <Caption color="secondary" className="text-center mb-6">
                Choose your account type to get started
              </Caption>
            </>
          )}

          {currentStep === 2 && (
            <>
              <H2 className="text-center mb-2">Join STAFFSYNC</H2>
              <Caption color="secondary" className="text-center mb-6">
                Help us customize your experience by providing your business details
              </Caption>
            </>
          )}

          {currentStep === 3 && (
            <>
              <H2 className="text-center mb-2">Create Admin Account</H2>
              <Caption color="secondary" className="text-center mb-6">
                This account will have full access to manage the organizational settings
              </Caption>
            </>
          )}

          {currentStep === 4 && (
            <>
              <H2 className="text-center mb-2">Verify Admin Account</H2>
              <Caption color="secondary" className="text-center mb-6">
                Enter the OTP code sent to your email address {adminData.email}.
              </Caption>
            </>
          )}

          {/* Step Content */}
          {currentStep === 1 && (
            <AdminOnboardingStep1 
              accountType={accountType} 
              setAccountType={(type) => dispatch(setAccountType(type))} 
            />
          )}
          {currentStep === 2 && (
            <AdminOnboardingStep2 
              orgData={orgData} 
              setOrgData={(data) => dispatch(setOrgData(data))} 
            />
          )}
          {currentStep === 3 && (
            <AdminOnboardingStep3 
              adminData={adminData} 
              setAdminData={(data) => dispatch(setAdminData(data))}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
            />
          )}
          {currentStep === 4 && (
            <AdminOnboardingStep4
              otp={otp}
              setOtp={(otp) => dispatch(setOtp(otp))}
              countdown={countdown}
              setCountdown={(count) => dispatch(setCountdown(count))}
              adminEmail={adminData.email}
              inputRefs={inputRefs}
              handleOtpChange={handleOtpChange}
              handleKeyPress={handleKeyPress}
              formatCountdown={formatCountdown}
            />
          )}

          {/* Continue Button */}
          <Button onPress={handleContinue} className="mt-6">
            {currentStep === 4 ? 'Complete' : 'Continue'}
          </Button>

          {/* Login Link */}
          {currentStep === 1 && (
            <View className="flex-row justify-center items-center mt-6">
              <Caption color="secondary">Already have an account?</Caption>
              <TouchableOpacity onPress={() => navigation.navigate('AgencyLogin')}>
                <Body className="ml-2 text-sm font-outfit-semibold" style={{ color: primaryColor }}>
                  Staff Login
                </Body>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </Container>
  );
}

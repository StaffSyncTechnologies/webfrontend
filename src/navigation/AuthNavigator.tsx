import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthStackParamList } from '../types/navigation';
import { LanguageSelectScreen, ChooseAccountTypeScreen, InviteCodeScreen, AgencyConfirmScreen, NearbyAgenciesScreen, AgencyContactScreen, LoginScreen, RegisterScreen, VerifyOTPScreen, VerificationSuccessScreen, ForgotPasswordScreen } from '../screens/auth';
import { OnboardingProfileScreen, OnboardingProfilePictureScreen, OnboardingSkillsScreen, OnboardingDocumentsScreen, OnboardingBankAccountScreen, OnboardingRTWScreen } from '../screens/onboarding';
import { AdminOnboardingScreen, AgencyLoginScreen } from '../screens/admin/auth';

export const HAS_LAUNCHED_KEY = '@staffsync_has_launched';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(HAS_LAUNCHED_KEY).then((value) => {
      setIsFirstLaunch(value === null);
    });
  }, []);

  if (isFirstLaunch === null) return null;

  return (
    <Stack.Navigator
      initialRouteName={isFirstLaunch ? 'LanguageSelect' : 'ChooseAccountType'}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
      <Stack.Screen name="ChooseAccountType" component={ChooseAccountTypeScreen} />
      <Stack.Screen name="InviteCode" component={InviteCodeScreen} />
      <Stack.Screen name="AgencyConfirm" component={AgencyConfirmScreen} />
      <Stack.Screen name="NearbyAgencies" component={NearbyAgenciesScreen} />
      <Stack.Screen name="AgencyContact" component={AgencyContactScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="AgencyLogin" component={AgencyLoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
      {/* Worker Onboarding Steps */}
      <Stack.Screen name="OnboardingProfile" component={OnboardingProfileScreen} />
      <Stack.Screen name="OnboardingProfilePicture" component={OnboardingProfilePictureScreen} />
      <Stack.Screen name="OnboardingSkills" component={OnboardingSkillsScreen} />
      <Stack.Screen name="OnboardingDocuments" component={OnboardingDocumentsScreen} />
      <Stack.Screen name="OnboardingBankAccount" component={OnboardingBankAccountScreen} />
      <Stack.Screen name="OnboardingRTW" component={OnboardingRTWScreen} />
      {/* Admin Onboarding */}
      <Stack.Screen name="AdminOnboarding" component={AdminOnboardingScreen} />
      <Stack.Screen name="VerificationSuccess" component={VerificationSuccessScreen} options={{ gestureEnabled: false }} />
    </Stack.Navigator>
  );
}

export default AuthNavigator;

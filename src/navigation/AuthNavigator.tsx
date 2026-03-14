import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/navigation';
import { LanguageSelectScreen, InviteCodeScreen, AgencyConfirmScreen, NearbyAgenciesScreen, AgencyContactScreen, LoginScreen, RegisterScreen, VerifyOTPScreen, VerificationSuccessScreen, ForgotPasswordScreen } from '../screens/auth';
import { OnboardingProfileScreen, OnboardingProfilePictureScreen, OnboardingSkillsScreen, OnboardingDocumentsScreen, OnboardingBankAccountScreen, OnboardingRTWScreen } from '../screens/onboarding';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="LanguageSelect"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
      <Stack.Screen name="InviteCode" component={InviteCodeScreen} />
      <Stack.Screen name="AgencyConfirm" component={AgencyConfirmScreen} />
      <Stack.Screen name="NearbyAgencies" component={NearbyAgenciesScreen} />
      <Stack.Screen name="AgencyContact" component={AgencyContactScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
      {/* Onboarding Steps */}
      <Stack.Screen name="OnboardingProfile" component={OnboardingProfileScreen} />
      <Stack.Screen name="OnboardingProfilePicture" component={OnboardingProfilePictureScreen} />
      <Stack.Screen name="OnboardingSkills" component={OnboardingSkillsScreen} />
      <Stack.Screen name="OnboardingDocuments" component={OnboardingDocumentsScreen} />
      <Stack.Screen name="OnboardingBankAccount" component={OnboardingBankAccountScreen} />
      <Stack.Screen name="OnboardingRTW" component={OnboardingRTWScreen} />
      <Stack.Screen name="VerificationSuccess" component={VerificationSuccessScreen} options={{ gestureEnabled: false }} />
    </Stack.Navigator>
  );
}

export default AuthNavigator;

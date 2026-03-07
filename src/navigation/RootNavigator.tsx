import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { ShiftDetailsScreen, ShiftConfirmedScreen, ClockInScreen, PayslipDetailScreen, HolidaysScreen, RequestHolidayScreen, HolidayRequestSubmittedScreen, HolidayDetailScreen, PrivacyPolicyScreen, ChatListScreen, ChatScreen, AppearanceScreen, NotificationSettingsScreen, SkillsCertificateScreen, ProfileDetailsScreen, RightToWorkScreen, LanguageScreen, NotificationsScreen } from '../screens';
import { SubscriptionExpiredScreen } from '../screens/SubscriptionExpiredScreen';
import { useGetSubscriptionSummaryQuery } from '../store/api/subscriptionApi';
import { useAppSelector } from '../store/hooks';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
  isAuthenticated?: boolean;
}

function SubscriptionGatedMain() {
  const token = useAppSelector((state) => state.auth.token);
  const { data: summary, isLoading } = useGetSubscriptionSummaryQuery(undefined, { skip: !token });

  // Don't block while loading — show normal app
  if (isLoading || !summary) {
    return <MainTabNavigator />;
  }

  // Block if subscription/trial expired
  if (summary.isExpired && !summary.canAccessDashboard) {
    return <SubscriptionExpiredScreen />;
  }

  return <MainTabNavigator />;
}

export function RootNavigator({ isAuthenticated = false }: RootNavigatorProps) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName={isAuthenticated ? 'Main' : 'Auth'}
    >
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="Main" component={SubscriptionGatedMain} />
      <Stack.Screen 
        name="ShiftDetails" 
        component={ShiftDetailsScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="ShiftConfirmed"
        component={ShiftConfirmedScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="ClockIn"
        component={ClockInScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="PayslipDetail"
        component={PayslipDetailScreen}
        options={{
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="Holidays"
        component={HolidaysScreen}
        options={{
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="RequestHoliday"
        component={RequestHolidayScreen}
        options={{
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="HolidayRequestSubmitted"
        component={HolidayRequestSubmittedScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="HolidayDetail"
        component={HolidayDetailScreen}
        options={{
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
      <Stack.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
      <Stack.Screen
        name="Appearance"
        component={AppearanceScreen}
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
      <Stack.Screen
        name="SkillsCertificate"
        component={SkillsCertificateScreen}
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
      <Stack.Screen
        name="ProfileDetails"
        component={ProfileDetailsScreen}
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
      <Stack.Screen
        name="RightToWork"
        component={RightToWorkScreen}
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
      <Stack.Screen
        name="Language"
        component={LanguageScreen}
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
      {/* Add more root-level screens here */}
    </Stack.Navigator>
  );
}

export default RootNavigator;

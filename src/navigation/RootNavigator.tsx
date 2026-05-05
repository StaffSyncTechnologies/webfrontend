import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { AuthNavigator } from './AuthNavigator';
import { WorkerTabNavigator } from './MainTabNavigator';
import { AdminTabNavigator } from './AdminTabNavigation';
import { ShiftDetailsScreen, ShiftConfirmedScreen, ClockInScreen, PayslipDetailScreen, HolidaysScreen, RequestHolidayScreen, HolidayRequestSubmittedScreen, HolidayDetailScreen, PrivacyPolicyScreen, ChatListScreen, ChatScreen, AppearanceScreen, NotificationSettingsScreen, SkillsCertificateScreen, ProfileDetailsScreen, RightToWorkScreen, LanguageScreen, NotificationsScreen, TimesheetScreen, ScheduleChangeRequestScreen, ShiftSwapScreen, WorkerDetailsScreen } from '../screens';
import AdminChatListScreen from '../screens/admin/chat/AdminChatListScreen';
import AdminChatScreen from '../screens/admin/chat/AdminChatScreen';
import { ShiftsScreen } from '../screens/admin/shift/ShiftsScreen';
import { ShiftDetailsScreen as AdminShiftDetailsScreen } from '../screens/admin/shift/ShiftDetailsScreen';
import { AssignScheduleScreen } from '../screens/admin/schedule/AssignScheduleScreen';
import { RotaBuilderScreen } from '../screens/admin/rota/RotaBuilderScreen';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';
import { SubscriptionExpiredScreen } from '../screens/SubscriptionExpiredScreen';
import { RTWBlockerModal } from '../components/RTWBlockerModal';
import { TimesheetScreen as AdminTimesheetScreen } from '../screens/admin/timesheet/TimesheetScreen';
import { AdminTimesheetDetailScreen } from '../screens/admin/timesheet/TimesheetDetailScreen';
import { HolidayScreen as AdminHolidayScreen } from '../screens/admin/holiday/HolidayScreen';
import { HRScreen } from '../screens/admin/hrscreen/HRScreen';
import { InviteRequestsScreen } from '../screens/admin/InviteRequestsScreen';
import { ReportsScreen } from '../screens/admin/reports/ReportsScreen';
import { RTWScreen } from '../screens/admin/RTW/RTWScreen';
import { ComplianceDashboardScreen } from '../screens/admin/dashboards/ComplianceDashboardScreen';
import { SettingsScreen } from '../screens/admin/settings/SettingsScreen';
import { useGetSubscriptionSummaryQuery } from '../store/api/subscriptionApi';
import { useAppSelector } from '../store/hooks';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
  isAuthenticated?: boolean;
  userRole?: 'worker' | 'admin';
  adminRole?: string;
}

function SubscriptionGatedMain({ role, userRole }: { role?: 'worker' | 'admin'; userRole?: string }) {
  const token = useAppSelector((state) => state.auth.token);
  const { data: summary, isLoading } = useGetSubscriptionSummaryQuery(undefined, { skip: !token });

  // Don't block while loading — show normal app
  if (isLoading || !summary) {
    return role === 'admin' ? <AdminTabNavigator userRole={userRole || 'ADMIN'} /> : <WorkerTabNavigator />;
  }

  // Block if subscription/trial expired
  if (summary.isExpired && !summary.canAccessDashboard) {
    return <SubscriptionExpiredScreen />;
  }

  return (
    <>
      {role === 'worker' && <RTWBlockerModal />}
      {role === 'admin' ? <AdminTabNavigator userRole={userRole || 'ADMIN'} /> : <WorkerTabNavigator />}
    </>
  );
}

function WorkerMainScreen() {
  return <SubscriptionGatedMain role="worker" />;
}

function AdminMainScreen({ route }: any) {
  const adminRole = route?.params?.adminRole || 'ADMIN';
  return <SubscriptionGatedMain role="admin" userRole={adminRole} />;
}

export function RootNavigator({ isAuthenticated = false, userRole = 'worker', adminRole = 'ADMIN' }: RootNavigatorProps) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName={isAuthenticated ? (userRole === 'admin' ? 'AdminMain' : 'WorkerMain') : 'Auth'}
    >
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="WorkerMain" component={WorkerMainScreen} />
      <Stack.Screen name="AdminMain" component={AdminMainScreen} initialParams={{ adminRole }} />
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
        name="AdminChatList"
        component={AdminChatListScreen}
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
      <Stack.Screen
        name="AdminChat"
        component={AdminChatScreen}
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
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
      <Stack.Screen
        name="Timesheet"
        component={TimesheetScreen}
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
      <Stack.Screen
        name="AdminTimesheet"
        component={AdminTimesheetScreen}
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
      <Stack.Screen
        name="AdminTimesheetDetail"
        component={AdminTimesheetDetailScreen}
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
      <Stack.Screen
        name="AdminHoliday"
        component={AdminHolidayScreen}
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
      <Stack.Screen
        name="HR"
        component={HRScreen}
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
      <Stack.Screen
        name="AdminShiftDetailsScreen"
        component={AdminShiftDetailsScreen}
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
      <Stack.Screen
        name="ScheduleChangeRequest"
        component={ScheduleChangeRequestScreen}
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
      <Stack.Screen
        name="ShiftSwap"
        component={ShiftSwapScreen}
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
      <Stack.Screen
        name="WorkerDetailsScreen"
        component={WorkerDetailsScreen}
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
      <Stack.Screen
        name="AssignSchedule"
        component={AssignScheduleScreen}
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
      <Stack.Screen
        name="RotaBuilder"
        component={RotaBuilderScreen}
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
      <Stack.Screen
        name="InviteRequests"
        component={InviteRequestsScreen}
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
      <Stack.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
      <Stack.Screen
        name="RTW"
        component={RTWScreen}
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
      <Stack.Screen
        name="ComplianceDashboard"
        component={ComplianceDashboardScreen}
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
    </Stack.Navigator>
  );
}

export default RootNavigator;

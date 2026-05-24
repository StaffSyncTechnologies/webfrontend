import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// Agency info from invite code verification
export interface AgencyInfo {
  id: string;
  name: string;
  logoUrl?: string;
  coverImageUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  inviteCode: string;
}

// Nearby agency info for workers without invite code
export interface NearbyAgencyInfo {
  id: string;
  name: string;
  address?: string;
  logoUrl?: string;
  primaryColor?: string;
  distance?: number; // in miles
  email?: string;
  website?: string;
  phone?: string;
  contactName?: string;
  latitude?: number;
  longitude?: number;
}

// Auth Stack
export type AuthStackParamList = {
  LanguageSelect: undefined;
  ChooseAccountType: undefined;
  InviteCode: undefined;
  AgencyConfirm: { agency: AgencyInfo };
  Login: { inviteCode?: string; role?: 'worker' | 'admin' };
  AgencyLogin: undefined;
  Register: { inviteCode: string; agencyId?: string; agencyName?: string; primaryColor?: string };
  VerifyOTP: { email: string; inviteCode?: string; agencyId?: string };
  // Worker Onboarding steps (after OTP verification)
  OnboardingProfile: undefined;
  OnboardingProfilePicture: undefined;
  OnboardingSkills: undefined;
  OnboardingDocuments: undefined;
  OnboardingBankAccount: undefined;
  OnboardingRTW: undefined;
  // Admin Onboarding
  AdminOnboarding: undefined;
  VerificationSuccess: undefined;
  ForgotPassword: undefined;
  NearbyAgencies: undefined;
  AgencyContact: { agency: NearbyAgencyInfo };
};

// Worker Tab Navigator
export type WorkerTabParamList = {
  Home: undefined;
  Shifts: undefined;
  Schedule: undefined;
  Payslip: undefined;
  Profile: undefined;
};

// Root Stack (contains Auth and Role-based Main)
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  WorkerMain: { adminRole?: string };
  AdminMain: { adminRole?: string };
  ShiftDetails: { shiftId: string };
  ShiftConfirmed: { shiftTitle: string; date: string; time: string; location: string };
  ClockIn: { shiftId: string; clockedIn?: boolean; isRecurring?: boolean; recurringScheduleId?: string | null };
  PayslipDetail: { payslipId: string };
  Holidays: undefined;
  RequestHoliday: undefined;
  HolidayRequestSubmitted: undefined;
  HolidayDetail: { holidayId: string };
  ProfileDetails: undefined;
  PrivacyPolicy: undefined;
  ChatList: undefined;
  Chat: { roomId?: string; recipientName?: string } | undefined;
  AdminChatList: undefined;
  AdminChat: { roomId?: string; recipientName?: string } | undefined;
  Appearance: undefined;
  NotificationSettings: undefined;
  SkillsCertificate: undefined;
  RightToWork: undefined;
  Language: undefined;
  Notifications: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  Documents: undefined;
  PaySlips: undefined;
  Timesheet: undefined;
  AdminTimesheet: undefined;
  AdminTimesheetDetail: { attendanceId: string };
  AdminHoliday: undefined;
  HR: undefined;
  AdminShiftDetailsScreen: { shiftId: string };
  ScheduleChangeRequest: undefined;
  ShiftSwap: { shiftId?: string } | undefined;
  WorkerDetailsScreen: { workerId: string };
  AssignSchedule: undefined;
  RotaBuilder: undefined;
  More: undefined;
  InviteRequests: undefined;
  Reports: undefined;
  RTW: undefined;
  ComplianceDashboard: undefined;
  ClientList: undefined;
  ClientDetails: { clientId: string };
  Help: undefined;
  NfcTap: { tagCode: string };
  NfcClockIn: { shiftId: string; isRecurring?: boolean; rotaShiftId?: string; clockedIn?: boolean };
  NfcManagement: undefined;
  CreateNfcPoint: undefined;
  WriteNfcTag: { point: import('../store/api/nfcApi').NfcClockPoint };
  QRClockIn: undefined;
  QRCodeDisplay: { point: import('../store/api/nfcApi').NfcClockPoint };
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = 
  CompositeScreenProps<
    NativeStackScreenProps<AuthStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type WorkerTabScreenProps<T extends keyof WorkerTabParamList> = 
  CompositeScreenProps<
    BottomTabScreenProps<WorkerTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

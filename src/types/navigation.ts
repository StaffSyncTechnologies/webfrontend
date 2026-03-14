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
  InviteCode: undefined;
  AgencyConfirm: { agency: AgencyInfo };
  Login: { inviteCode?: string };
  Register: { inviteCode: string; agencyId?: string; agencyName?: string; primaryColor?: string };
  VerifyOTP: { email: string; inviteCode?: string; agencyId?: string };
  // Onboarding steps (after OTP verification)
  OnboardingProfile: undefined;
  OnboardingProfilePicture: undefined;
  OnboardingSkills: undefined;
  OnboardingDocuments: undefined;
  OnboardingBankAccount: undefined;
  OnboardingRTW: undefined;
  VerificationSuccess: undefined;
  ForgotPassword: undefined;
  NearbyAgencies: undefined;
  AgencyContact: { agency: NearbyAgencyInfo };
};

// Main Tab Navigator
export type MainTabParamList = {
  Home: undefined;
  Shifts: undefined;
  Schedule: undefined;
  Payslip: undefined;
  Profile: undefined;
};

// Root Stack (contains Auth and Main)
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  ShiftDetails: { shiftId: string };
  ShiftConfirmed: { shiftTitle: string; date: string; time: string; location: string };
  ClockIn: { shiftId: string; clockedIn?: boolean };
  PayslipDetail: { payslipId: string };
  Holidays: undefined;
  RequestHoliday: undefined;
  HolidayRequestSubmitted: undefined;
  HolidayDetail: { holidayId: string };
  ProfileDetails: undefined;
  PrivacyPolicy: undefined;
  ChatList: undefined;
  Chat: { roomId?: string; recipientName?: string } | undefined;
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
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = 
  CompositeScreenProps<
    NativeStackScreenProps<AuthStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type MainTabScreenProps<T extends keyof MainTabParamList> = 
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

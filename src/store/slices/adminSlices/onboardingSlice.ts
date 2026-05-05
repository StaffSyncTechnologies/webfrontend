import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OrganizationData {
  organizationName: string;
  organizationEmail: string;
  tradingName: string;
  companyNumber: string;
  industry: string;
  numberOfWorkers: string;
  location: string;
  website: string;
}

interface AdminData {
  fullName: string;
  email: string;
  jobTitle: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

interface OnboardingState {
  currentStep: number;
  accountType: 'company' | 'agency' | 'team' | null;
  orgData: OrganizationData;
  adminData: AdminData;
  otp: string[];
  countdown: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: OnboardingState = {
  currentStep: 1,
  accountType: null,
  orgData: {
    organizationName: '',
    organizationEmail: '',
    tradingName: '',
    companyNumber: '',
    industry: '',
    numberOfWorkers: '',
    location: '',
    website: '',
  },
  adminData: {
    fullName: '',
    email: '',
    jobTitle: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  },
  otp: ['', '', '', '', '', ''],
  countdown: 60,
  isLoading: false,
  error: null,
};

export const adminOnboardingSlice = createSlice({
  name: 'adminOnboarding',
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    setAccountType: (state, action: PayloadAction<'company' | 'agency' | 'team' | null>) => {
      state.accountType = action.payload;
    },
    setOrgData: (state, action: PayloadAction<Partial<OrganizationData>>) => {
      state.orgData = { ...state.orgData, ...action.payload };
    },
    setAdminData: (state, action: PayloadAction<Partial<AdminData>>) => {
      state.adminData = { ...state.adminData, ...action.payload };
    },
    setOtp: (state, action: PayloadAction<string[]>) => {
      state.otp = action.payload;
    },
    setOtpDigit: (state, action: PayloadAction<{ index: number; value: string }>) => {
      const { index, value } = action.payload;
      state.otp[index] = value;
    },
    setCountdown: (state, action: PayloadAction<number>) => {
      state.countdown = action.payload;
    },
    setOnboardingLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetOnboarding: () => initialState,
  },
  extraReducers: (builder) => {
    // Add async thunks for API calls here
    // For example: registerOrganization, verifyOtp, etc.
  },
});

export const {
  setCurrentStep,
  setAccountType,
  setOrgData,
  setAdminData,
  setOtp,
  setOtpDigit,
  setCountdown,
  setOnboardingLoading,
  setError,
  resetOnboarding,
} = adminOnboardingSlice.actions;

export default adminOnboardingSlice.reducer;

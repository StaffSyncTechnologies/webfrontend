import { baseApi } from './baseApi';
import { AUTH, BANK_ACCOUNT } from '../../services/endpoints';

// Types
export interface WorkerLoginRequest {
  email: string;
}

export interface WorkerPasswordLoginRequest {
  email: string;
  password: string;
}

export interface WorkerVerifyOtpRequest {
  email: string;
  code: string;
}

export interface WorkerRegisterRequest {
  inviteCode: string;
  fullName?: string;
  phone?: string;
  email: string;
  password: string;
}

export interface WorkerSaveProfileRequest {
  email: string;
  fullName: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  postcode: string;
  niNumber: string;
}

export interface SaveBankAccountRequest {
  accountHolder: string;
  bankName: string;
  sortCode: string;
  accountNumber: string;
  buildingSocietyRef?: string;
}

export interface Worker {
  id: string;
  fullName: string;
  email?: string;
  phone: string;
  profilePicUrl?: string;
  status: string;
  rtwStatus?: string;
  onboardingStep?: number;
  organizationId: string;
  organization?: {
    id: string;
    name: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    worker: Worker;
    requiresOtp?: boolean;
    onboardingComplete?: boolean;
  };
}

export interface OtpResponse {
  success: boolean;
  message: string;
  data?: {
    otpSent: boolean;
    expiresIn: number;
  };
}

export interface ValidateInviteCodeResponse {
  success: boolean;
  message: string;
  data?: {
    organizationId: string;
    organizationName: string;
    logoUrl?: string;
    coverImageUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Validate invite code
    validateInviteCode: builder.mutation<ValidateInviteCodeResponse, { code: string }>({
      query: (body) => {
        console.log('API Request - validateInviteCode:', body);
        return {
          url: '/auth/worker/validate-invite',
          method: 'POST',
          body,
        };
      },
    }),

    // Send OTP for login
    workerLogin: builder.mutation<OtpResponse, WorkerLoginRequest>({
      query: (body) => ({
        url: AUTH.WORKER_LOGIN,
        method: 'POST',
        body,
      }),
    }),

    // Email + Password login
    workerPasswordLogin: builder.mutation<AuthResponse, WorkerPasswordLoginRequest>({
      query: (body) => ({
        url: AUTH.WORKER_PASSWORD_LOGIN,
        method: 'POST',
        body,
      }),
    }),

    // Verify OTP and get token
    workerVerifyOtp: builder.mutation<AuthResponse, WorkerVerifyOtpRequest>({
      query: (body) => ({
        url: AUTH.WORKER_VERIFY_OTP,
        method: 'POST',
        body,
      }),
    }),

    // Register new worker
    workerRegister: builder.mutation<OtpResponse, WorkerRegisterRequest>({
      query: (body) => ({
        url: AUTH.WORKER_REGISTER,
        method: 'POST',
        body,
      }),
    }),

    // Get current user
    getMe: builder.query<{ success: boolean; data: Worker }, void>({
      query: () => AUTH.ME,
      providesTags: ['Worker'],
    }),

    // Update profile
    updateMe: builder.mutation<{ success: boolean; data: Worker }, Partial<Worker> & { address?: string; postcode?: string; dateOfBirth?: string }>({
      query: (body) => ({
        url: AUTH.UPDATE_ME,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Worker'],
    }),

    // Forgot password – request reset link
    forgotPassword: builder.mutation<{ success: boolean; message: string }, { email: string }>({
      query: (body) => ({
        url: AUTH.FORGOT_PASSWORD,
        method: 'POST',
        body,
      }),
    }),

    // Logout
    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: AUTH.LOGOUT,
        method: 'POST',
      }),
    }),

    // Save worker profile (onboarding Step 1)
    workerSaveProfile: builder.mutation<{ success: boolean; message: string }, WorkerSaveProfileRequest>({
      query: (body) => ({
        url: AUTH.WORKER_SAVE_PROFILE,
        method: 'POST',
        body,
      }),
    }),

    // Save bank account details (onboarding Step 4)
    saveBankAccount: builder.mutation<{ success: boolean; message: string }, SaveBankAccountRequest>({
      query: (body) => ({
        url: BANK_ACCOUNT.SAVE,
        method: 'POST',
        body,
      }),
    }),

    // Upload profile picture (onboarding Step 2)
    workerUploadProfilePic: builder.mutation<{ success: boolean; message: string; data?: { profilePicUrl: string } }, FormData>({
      query: (formData) => ({
        url: AUTH.WORKER_PROFILE_PIC,
        method: 'POST',
        body: formData,
        formData: true,
      }),
    }),

    // Complete onboarding
    completeOnboarding: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: AUTH.WORKER_COMPLETE_ONBOARDING,
        method: 'POST',
      }),
      invalidatesTags: ['Worker'],
    }),
  }),
});

export const {
  useValidateInviteCodeMutation,
  useWorkerLoginMutation,
  useWorkerPasswordLoginMutation,
  useWorkerVerifyOtpMutation,
  useWorkerRegisterMutation,
  useWorkerSaveProfileMutation,
  useSaveBankAccountMutation,
  useGetMeQuery,
  useUpdateMeMutation,
  useForgotPasswordMutation,
  useLogoutMutation,
  useCompleteOnboardingMutation,
  useWorkerUploadProfilePicMutation,
} = authApi;

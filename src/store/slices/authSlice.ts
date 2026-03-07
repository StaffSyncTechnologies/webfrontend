import { createApi } from '@reduxjs/toolkit/query/react';
import { useDispatch } from 'react-redux';
import { AUTH } from '../../utilities/endpoint.ts';
import { axiosBaseQuery } from '../../utilities/axiosBaseQuery.ts';
import type { 
  LoginCredentials, 
  RegisterCredentials, 
  StaffLoginCredentials, 
  WorkerLoginCredentials,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  SendOtpRequest,
  VerifyOtpRequest,
  WorkerVerifyOtpRequest,
  WorkerRegisterCredentials,
  ChangePasswordRequest,
  AuthResponse,
  MeResponse,
  StaffInviteValidation,
  ApiResponse
} from '../../types/api.ts';

// Enhanced base query that handles token storage and dispatches auth actions
const createAuthBaseQuery = (dispatch: any) => axiosBaseQuery({
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      headers.authorization = `Bearer ${token}`;
    }
    return headers;
  },
});

export const createAuthApi = (dispatch: any) => createApi({
  reducerPath: 'authApi',
  baseQuery: createAuthBaseQuery(dispatch),
  tagTypes: ['Auth', 'User', 'Worker'],
  endpoints: (builder) => ({
    // Basic authentication
    register: builder.mutation<AuthResponse, RegisterCredentials>({
      query: (credentials) => ({
        url: AUTH.REGISTER,
        method: 'POST',
        body: credentials,
      }),
      onQueryStarted: async (_, { queryFulfilled, dispatch }) => {
        try {
          const { data } = await queryFulfilled;
          if (data.token) {
            // Dispatch auth action to update persisted state
            dispatch({ type: 'auth/setAuth', payload: {
              user: data.user,
              token: data.token,
              refreshToken: data.refreshToken,
              expiresIn: data.expiresIn
            }});
          }
        } catch (error) {
          // Handle error if needed
        }
      },
    }),
    
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: AUTH.LOGIN,
        method: 'POST',
        body: credentials,
      }),
      onQueryStarted: async (_, { queryFulfilled, dispatch }) => {
        try {
          const { data } = await queryFulfilled;
          if (data.token) {
            // Dispatch auth action to update persisted state
            dispatch({ type: 'auth/setAuth', payload: {
              user: data.user,
              token: data.token,
              refreshToken: data.refreshToken,
              expiresIn: data.expiresIn
            }});
          }
        } catch (error) {
          // Handle error if needed
        }
      },
    }),
    
    staffLogin: builder.mutation<AuthResponse, StaffLoginCredentials>({
      query: (credentials) => ({
        url: AUTH.STAFF_LOGIN,
        method: 'POST',
        body: credentials,
      }),
      onQueryStarted: async (_, { queryFulfilled, dispatch }) => {
        try {
          const { data } = await queryFulfilled;
          if (data.token) {
            // Dispatch auth action to update persisted state
            dispatch({ type: 'auth/setAuth', payload: {
              user: data.user,
              token: data.token,
              refreshToken: data.refreshToken,
              expiresIn: data.expiresIn
            }});
          }
        } catch (error) {
          // Handle error if needed
        }
      },
    }),
    
    workerLogin: builder.mutation<AuthResponse, WorkerLoginCredentials>({
      query: (credentials) => ({
        url: AUTH.WORKER_LOGIN,
        method: 'POST',
        body: credentials,
      }),
      onQueryStarted: async (_, { queryFulfilled, dispatch }) => {
        try {
          const { data } = await queryFulfilled;
          if (data.token) {
            // Dispatch auth action to update persisted state
            dispatch({ type: 'auth/setAuth', payload: {
              user: data.user,
              token: data.token,
              refreshToken: data.refreshToken,
              expiresIn: data.expiresIn
            }});
          }
        } catch (error) {
          // Handle error if needed
        }
      },
    }),
    
    // Password recovery
    forgotPassword: builder.mutation<ApiResponse, ForgotPasswordRequest>({
      query: (request) => ({
        url: AUTH.FORGOT_PASSWORD,
        method: 'POST',
        body: request,
      }),
    }),
    
    resetPassword: builder.mutation<ApiResponse, ResetPasswordRequest>({
      query: (request) => ({
        url: AUTH.RESET_PASSWORD,
        method: 'POST',
        body: request,
      }),
    }),
    
    // OTP verification
    sendOtp: builder.mutation<ApiResponse, SendOtpRequest>({
      query: (request) => ({
        url: AUTH.SEND_OTP,
        method: 'POST',
        body: request,
      }),
    }),
    
    verifyOtp: builder.mutation<ApiResponse, VerifyOtpRequest>({
      query: (request) => ({
        url: AUTH.VERIFY_OTP,
        method: 'POST',
        body: request,
      }),
    }),
    
    workerVerifyOtp: builder.mutation<ApiResponse, WorkerVerifyOtpRequest>({
      query: (request) => ({
        url: AUTH.WORKER_VERIFY_OTP,
        method: 'POST',
        body: request,
      }),
    }),
    
    // Staff invite handling
    validateStaffInvite: builder.query<StaffInviteValidation, string>({
      query: (token) => ({
        url: AUTH.STAFF_INVITE_VALIDATE(token),
      }),
    }),
    
    acceptStaffInvite: builder.mutation<AuthResponse, { token: string; credentials: RegisterCredentials }>({
      query: ({ token, credentials }) => ({
        url: AUTH.STAFF_INVITE_ACCEPT(token),
        method: 'POST',
        body: credentials,
      }),
      onQueryStarted: async (_, { queryFulfilled, dispatch }) => {
        try {
          const { data } = await queryFulfilled;
          if (data.token) {
            // Dispatch auth action to update persisted state
            dispatch({ type: 'auth/setAuth', payload: {
              user: data.user,
              token: data.token,
              refreshToken: data.refreshToken,
              expiresIn: data.expiresIn
            }});
          }
        } catch (error) {
          // Handle error if needed
        }
      },
    }),

    // Invite code flow (team/client registration via code)
    validateInviteCode: builder.mutation<{ valid: boolean; agency: { id: string; name: string; logo?: string; primaryColor?: string } }, { inviteCode: string }>({
      query: (data) => ({
        url: AUTH.VALIDATE_INVITE_CODE,
        method: 'POST',
        body: data,
      }),
    }),

    acceptInviteCode: builder.mutation<ApiResponse, {
      inviteCode: string;
      fullName: string;
      email: string;
      password: string;
      phone?: string;
      jobTitle?: string;
      address?: string;
      postcode?: string;
    }>({
      query: (data) => ({
        url: AUTH.ACCEPT_INVITE_CODE,
        method: 'POST',
        body: data,
      }),
    }),
    
    // Worker registration and onboarding
    workerRegister: builder.mutation<AuthResponse, WorkerRegisterCredentials>({
      query: (credentials) => ({
        url: AUTH.WORKER_REGISTER,
        method: 'POST',
        body: credentials,
      }),
      onQueryStarted: async (_, { queryFulfilled, dispatch }) => {
        try {
          const { data } = await queryFulfilled;
          if (data.token) {
            // Dispatch auth action to update persisted state
            dispatch({ type: 'auth/setAuth', payload: {
              user: data.user,
              token: data.token,
              refreshToken: data.refreshToken,
              expiresIn: data.expiresIn
            }});
          }
        } catch (error) {
          // Handle error if needed
        }
      },
    }),
    
    uploadWorkerDocuments: builder.mutation<ApiResponse, FormData>({
      query: (formData) => ({
        url: AUTH.WORKER_DOCUMENTS,
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    }),
    
    getWorkerDocuments: builder.query<ApiResponse, void>({
      query: () => ({
        url: AUTH.WORKER_DOCUMENTS_GET,
      }),
    }),
    
    deleteWorkerDocument: builder.mutation<ApiResponse, string>({
      query: (documentId) => ({
        url: AUTH.WORKER_DOCUMENT_DELETE(documentId),
        method: 'DELETE',
      }),
    }),
    
    uploadWorkerProfilePic: builder.mutation<ApiResponse, FormData>({
      query: (formData) => ({
        url: AUTH.WORKER_PROFILE_PIC,
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    }),
    
    verifyWorkerRtw: builder.mutation<ApiResponse, { documents: FormData }>({
      query: ({ documents }) => ({
        url: AUTH.WORKER_VERIFY_RTW,
        method: 'POST',
        body: documents,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    }),
    
    completeWorkerOnboarding: builder.mutation<ApiResponse, void>({
      query: () => ({
        url: AUTH.WORKER_COMPLETE_ONBOARDING,
        method: 'POST',
      }),
    }),
    
    // User profile management
    me: builder.query<MeResponse, void>({
      query: () => ({
        url: AUTH.ME,
      }),
      providesTags: ['Auth'],
      onQueryStarted: async (_, { queryFulfilled, dispatch }) => {
        try {
          const { data } = await queryFulfilled;
          // Update user in persisted state
          dispatch({ type: 'auth/updateUser', payload: data.user });
        } catch (error) {
          // Handle error - might need to clear auth if token is invalid
          dispatch({ type: 'auth/clearAuth' });
        }
      },
    }),
    
    updateMe: builder.mutation<AuthResponse, Partial<RegisterCredentials>>({
      query: (updates) => ({
        url: AUTH.UPDATE_ME,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Auth'],
      onQueryStarted: async (_, { queryFulfilled, dispatch }) => {
        try {
          const { data } = await queryFulfilled;
          // Update user in persisted state
          dispatch({ type: 'auth/updateUser', payload: data.user });
        } catch (error) {
          // Handle error
        }
      },
    }),
    
    changePassword: builder.mutation<ApiResponse, ChangePasswordRequest>({
      query: (request) => ({
        url: AUTH.CHANGE_PASSWORD,
        method: 'POST',
        body: request,
      }),
    }),
    
    // Logout
    logout: builder.mutation<ApiResponse, void>({
      query: () => ({
        url: AUTH.LOGOUT,
        method: 'POST',
      }),
      onQueryStarted: async (_, { queryFulfilled, dispatch }) => {
        try {
          await queryFulfilled;
        } catch (error) {
          // Even if the API call fails, clear auth state
        }
        // Clear auth state
        dispatch({ type: 'auth/clearAuth' });
      },
    }),
  }),
});

// Create a singleton instance that will be initialized after store creation
let authApi: ReturnType<typeof createAuthApi>;

export const initializeAuthApi = (dispatch: any) => {
  authApi = createAuthApi(dispatch);
  return authApi;
};

export const getAuthApi = () => {
  if (!authApi) {
    throw new Error('Auth API not initialized. Call initializeAuthApi first.');
  }
  return authApi;
};

// Export hooks that will work after initialization
export const useAuthApi = () => {
  const dispatch = useDispatch();
  if (!authApi) {
    authApi = initializeAuthApi(dispatch);
  }
  return authApi;
};

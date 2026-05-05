import { createApi } from '@reduxjs/toolkit/query/react';
import { AUTH } from '../../../services/endpoints';
import { baseApi } from '../../api/baseApi';

export interface UserSettings {
  email: string;
  fullName: string;
  phone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  preferences: any;
}

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<UserSettings, void>({
      query: () => ({ url: AUTH.ME }),
    }),

    updateProfile: builder.mutation<UserSettings, Partial<UserSettings>>({
      query: (body) => ({ url: AUTH.UPDATE_ME, method: 'PUT', body }),
    }),

    changePassword: builder.mutation<void, { currentPassword: string; newPassword: string }>({
      query: (body) => ({ url: AUTH.CHANGE_PASSWORD, method: 'POST', body }),
    }),

    forgotPassword: builder.mutation<void, { email: string }>({
      query: (body) => ({ url: AUTH.FORGOT_PASSWORD, method: 'POST', body }),
    }),

    resetPassword: builder.mutation<void, { token: string; newPassword: string }>({
      query: (body) => ({ url: AUTH.RESET_PASSWORD, method: 'POST', body }),
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = settingsApi;

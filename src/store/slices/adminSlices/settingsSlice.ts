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

    resetPassword: builder.mutation<void, { token: string; newPassword: string }>({
      query: (body) => ({ url: AUTH.RESET_PASSWORD, method: 'POST', body }),
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useResetPasswordMutation,
} = settingsApi;

// Re-exported from authApi — these used to be duplicated here, causing
// "overrideExisting" errors. Import from the canonical source instead.
export { useChangePasswordMutation, useForgotPasswordMutation } from '../../api/authApi';

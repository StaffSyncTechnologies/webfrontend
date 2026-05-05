import { createApi } from '@reduxjs/toolkit/query/react';
import { NOTIFICATIONS } from '../../../services/endpoints';
import { baseApi } from '../../api/baseApi';

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<{ data: Notification[] }, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 }) => ({
        url: NOTIFICATIONS.LIST,
        params: { page, limit },
      }),
    }),

    markAsRead: builder.mutation<void, string>({
      query: (id) => ({ url: NOTIFICATIONS.MARK_READ(id), method: 'POST' }),
    }),

    markAllAsRead: builder.mutation<void, void>({
      query: () => ({ url: NOTIFICATIONS.MARK_ALL_READ, method: 'POST' }),
    }),

    getUnreadCount: builder.query<{ count: number }, void>({
      query: () => ({ url: NOTIFICATIONS.UNREAD_COUNT }),
    }),

    getPreferences: builder.query<any, void>({
      query: () => ({ url: NOTIFICATIONS.PREFERENCES }),
    }),

    updatePreference: builder.mutation<any, { key: string; value: any }>({
      query: (body) => ({ url: NOTIFICATIONS.UPDATE_PREFERENCE, method: 'PUT', body }),
    }),

    updatePreferencesBulk: builder.mutation<any, any>({
      query: (body) => ({ url: NOTIFICATIONS.UPDATE_PREFERENCES_BULK, method: 'PUT', body }),
    }),

    registerDevice: builder.mutation<void, { token: string; platform: string }>({
      query: (body) => ({ url: NOTIFICATIONS.REGISTER_DEVICE, method: 'POST', body }),
    }),

    deactivateDevice: builder.mutation<void, { deviceId: string }>({
      query: (body) => ({ url: NOTIFICATIONS.DEACTIVATE_DEVICE, method: 'POST', body }),
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useGetUnreadCountQuery,
  useGetPreferencesQuery,
  useUpdatePreferenceMutation,
  useUpdatePreferencesBulkMutation,
  useRegisterDeviceMutation,
  useDeactivateDeviceMutation,
} = notificationApi;

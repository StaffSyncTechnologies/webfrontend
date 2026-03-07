import { createApi } from '@reduxjs/toolkit/query/react';
import { NOTIFICATIONS } from '../../utilities/endpoint';
import { axiosBaseQuery } from '../../utilities/axiosBaseQuery';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  referenceType?: string;
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  unreadCount: number;
}

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: axiosBaseQuery({
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.authorization = `Bearer ${token}`;
      }
      return headers;
    },
  }),
  tagTypes: ['Notification'],
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationsResponse, { page?: number; limit?: number; unreadOnly?: boolean }>({
      query: (params) => ({ url: NOTIFICATIONS.LIST, params }),
      transformResponse: (response: { success: boolean; data: NotificationsResponse }) => response.data,
      providesTags: ['Notification'],
    }),
    getUnreadCount: builder.query<{ count: number }, void>({
      query: () => ({ url: NOTIFICATIONS.UNREAD_COUNT }),
      transformResponse: (response: { success: boolean; data: { count: number } }) => response.data,
      providesTags: ['Notification'],
    }),
    markAsRead: builder.mutation<void, string>({
      query: (notificationId) => ({
        url: NOTIFICATIONS.MARK_READ(notificationId),
        method: 'POST',
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllAsRead: builder.mutation<void, void>({
      query: () => ({ url: NOTIFICATIONS.MARK_ALL_READ, method: 'POST' }),
      invalidatesTags: ['Notification'],
    }),
    registerDevice: builder.mutation<void, { token: string; platform: string }>({
      query: (data) => ({
        url: NOTIFICATIONS.REGISTER_DEVICE,
        method: 'POST',
        body: data,
      }),
    }),
    deactivateDevice: builder.mutation<void, { token: string }>({
      query: (data) => ({
        url: NOTIFICATIONS.DEACTIVATE_DEVICE,
        method: 'POST',
        body: data,
      }),
    }),
    getPreferences: builder.query<any, void>({
      query: () => ({ url: NOTIFICATIONS.PREFERENCES }),
      providesTags: ['Notification'],
    }),
    updatePreference: builder.mutation<any, any>({
      query: (preference) => ({
        url: NOTIFICATIONS.PREFERENCES,
        method: 'PUT',
        body: preference,
      }),
      invalidatesTags: ['Notification'],
    }),
    updatePreferencesBulk: builder.mutation<any, any[]>({
      query: (preferences) => ({
        url: NOTIFICATIONS.PREFERENCES_BULK,
        method: 'PUT',
        body: { preferences },
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useRegisterDeviceMutation,
  useDeactivateDeviceMutation,
  useGetPreferencesQuery,
  useUpdatePreferenceMutation,
  useUpdatePreferencesBulkMutation,
} = notificationApi;

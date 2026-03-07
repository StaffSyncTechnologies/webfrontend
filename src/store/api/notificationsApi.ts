import { baseApi } from './baseApi';

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

interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: NotificationItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    unreadCount: number;
  };
}

interface UnreadCountResponse {
  success: boolean;
  data: { count: number };
}

const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationsResponse['data'], { page?: number; limit?: number; unreadOnly?: boolean }>({
      query: ({ page = 1, limit = 20, unreadOnly = false }) =>
        `/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`,
      transformResponse: (response: NotificationsResponse) => response.data,
      providesTags: ['Notifications'],
    }),

    getUnreadCount: builder.query<number, void>({
      query: () => '/notifications/unread-count',
      transformResponse: (response: UnreadCountResponse) => response.data.count,
      providesTags: ['Notifications'],
    }),

    markAsRead: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),

    markAllAsRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),

    registerPushToken: builder.mutation<void, { pushToken: string; platform?: string; deviceId?: string }>({
      query: (body) => ({
        url: '/notifications/register-device',
        method: 'POST',
        body,
      }),
    }),

    deactivatePushToken: builder.mutation<void, { pushToken: string }>({
      query: (body) => ({
        url: '/notifications/deactivate-device',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useRegisterPushTokenMutation,
  useDeactivatePushTokenMutation,
} = notificationsApi;

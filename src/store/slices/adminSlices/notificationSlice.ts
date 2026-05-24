/**
 * notificationSlice — admin notification preferences & device registration.
 *
 * The core notification endpoints (getNotifications, markAsRead, markAllAsRead,
 * getUnreadCount) live in store/api/notificationsApi.ts.
 * This file only adds the admin-specific preference/device endpoints that don't
 * exist there, avoiding duplicate injectEndpoints registrations on baseApi.
 */

import { NOTIFICATIONS } from '../../../services/endpoints';
import { baseApi } from '../../api/baseApi';

export const notificationAdminApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
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
  useGetPreferencesQuery,
  useUpdatePreferenceMutation,
  useUpdatePreferencesBulkMutation,
  useRegisterDeviceMutation,
  useDeactivateDeviceMutation,
} = notificationAdminApi;

// Re-export the core hooks so old imports still resolve
export {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useGetUnreadCountQuery,
} from '../../api/notificationsApi';

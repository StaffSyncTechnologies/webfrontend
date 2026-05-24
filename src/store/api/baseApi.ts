import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../services/endpoints';

// Local shape — avoids a circular import with store/index.ts
// (store/index imports baseApi; importing RootState from there creates a cycle)
interface _AuthState {
  auth: { token: string | null };
}

// Action type string for auth/logout.
// We dispatch the plain object instead of importing the action creator from
// authSlice, which would create a cycle:
//   baseApi → authSlice → authApi → baseApi
const LOGOUT_ACTION = { type: 'auth/logout' } as const;

const AUTH_TOKEN_KEY = '@staffsync_auth_token';

// Custom base query with auth token
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: async (headers, { getState }) => {
    // Add API key for all requests
    const apiKey = process.env.EXPO_PUBLIC_API_KEY || '990ef49add9082155b6faf7facc842484286d9a2d3017588cdf372eb1049fc46';
    if (apiKey) {
      headers.set('X-API-Key', apiKey);
    }

    // Try to get token from Redux state first
    const state = getState() as _AuthState;
    let token = state.auth.token;

    // If not in state, try AsyncStorage
    if (!token) {
      token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    }

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Don't set Content-Type for FormData (file uploads) - let the browser set it with boundary
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    return headers;
  },
});

// Wrapper that auto-logs out on 401 (expired / invalid token)
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Token expired or invalid — clear session and force re-login
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    api.dispatch(LOGOUT_ACTION);
  }

  return result;
};

// Base API with tag types for cache invalidation
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Client',
    'ClientWorkers',
    'Worker',
    'Shifts',
    'Invoices',
    'Timesheet',
    'Attendance',
    'Payslips',
    'Documents',
    'Skills',
    'Notifications',
    'Holidays',
    'RecurringSchedules',
    'ScheduleChangeRequests',
    'InviteRequests',
    'Locations',
    'ComplianceStats',
    'ComplianceWorkers',
    'ComplianceWorker',
    'HolidayRequests',
    'HolidayBalances',
    'TimesheetStats',
    'TimesheetList',
    'Rota',
    'NfcPoints',
  ],
  endpoints: () => ({}),
});

export default baseApi;

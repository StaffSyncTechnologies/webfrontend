import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../services/endpoints';
import type { RootState } from '../index';

const AUTH_TOKEN_KEY = '@staffsync_auth_token';

// Custom base query with auth token
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: async (headers, { getState }) => {
    // Add API key for all requests
    const apiKey = process.env.EXPO_PUBLIC_API_KEY;
    if (apiKey) {
      headers.set('X-API-Key', apiKey);
    }

    // Try to get token from Redux state first
    const state = getState() as RootState;
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

// Base API with tag types for cache invalidation
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: [
    'Worker',
    'Shifts',
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
  ],
  endpoints: () => ({}),
});

export default baseApi;

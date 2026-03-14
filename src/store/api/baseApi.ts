import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../services/endpoints';
import type { RootState } from '../index';

const AUTH_TOKEN_KEY = '@staffsync_auth_token';

// Custom base query with auth token
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: async (headers, { getState }) => {
    // Try to get token from Redux state first
    const state = getState() as RootState;
    let token = state.auth.token;
    
    // If not in state, try localStorage
    if (!token) {
      token = localStorage.getItem(AUTH_TOKEN_KEY);
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
  ],
  endpoints: () => ({}),
});

export default baseApi;

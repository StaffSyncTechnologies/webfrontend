import type { BaseQueryFn } from '@reduxjs/toolkit/query/react';
import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { store } from '../store';
import { addToast } from '../store/slices/toastSlice';

export interface AxiosBaseQueryArgs {
  baseUrl?: string;
  prepareHeaders?: (headers: Record<string, string>) => Record<string, string>;
}

let lastNetworkErrorToast = 0;
const TOAST_DEBOUNCE_MS = 5000;

export type AxiosBaseQuery = BaseQueryFn<
  AxiosRequestConfig,
  unknown,
  AxiosError | { status: number; data: any }
>;

export const axiosBaseQuery = ({
  baseUrl = '',
  prepareHeaders,
}: AxiosBaseQueryArgs = {}): AxiosBaseQuery => {
  return async ({ url, method, data, body, params, headers: extraHeaders, ...rest }: any) => {
    // Support both 'data' and 'body' for request payload
    const requestData = data ?? body;
    try {
      const headers: Record<string, string> = {};
      
      // Add default headers
      if (prepareHeaders) {
        const preparedHeaders = prepareHeaders(headers);
        Object.assign(headers, preparedHeaders);
      } else {
        // Default auth header preparation
        const token = localStorage.getItem('authToken');
        if (token) {
          headers.authorization = `Bearer ${token}`;
        }
      }

      // Merge any extra headers from mutation config (but auth takes precedence)
      const finalHeaders = { ...extraHeaders, ...headers };

      const result = await axios({
        url: baseUrl + url,
        method,
        data: requestData,
        params,
        headers: finalHeaders,
        ...rest,
      });

      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      
      const isNetworkError = !err.response && (err.code === 'ERR_NETWORK' || err.message === 'Network Error' || !navigator.onLine);
      
      if (isNetworkError) {
        const now = Date.now();
        if (now - lastNetworkErrorToast > TOAST_DEBOUNCE_MS) {
          lastNetworkErrorToast = now;
          const message = !navigator.onLine 
            ? 'No internet connection. Please check your network.'
            : 'Unable to connect to server. Please try again later.';
          store.dispatch(addToast({ message, type: 'error', duration: 5000 }));
        }
      }
      
      // Handle 401 Unauthorized - redirect to login
      if (err.response?.status === 401) {
        // Get user role from store before clearing to determine correct login page
        const state = store.getState();
        const userRole = state.auth.user?.role;
        const isClientUser = userRole === 'CLIENT_ADMIN' || userRole === 'CLIENT_USER';
        const loginPage = isClientUser ? '/client-login' : '/login';
        
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiration');
        localStorage.removeItem('persist:auth');
        localStorage.setItem('forceAuthClear', 'true');
        store.dispatch(addToast({ message: 'Session expired. Please login again.', type: 'warning', duration: 4000 }));
        window.location.replace(loginPage);
      }
      
      return {
        error: {
          status: err.response?.status || (isNetworkError ? 0 : 500),
          data: err.response?.data || err.message,
        },
      };
    }
  };
};

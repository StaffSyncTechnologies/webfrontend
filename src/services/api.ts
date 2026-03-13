import axios, { AxiosError } from 'axios';
import { store } from '../store';
import { clearAuth } from '../store/slices/authPersistSlice';

const API_BASE = 'https://backend-rp5c.onrender.com';

// Create axios instance
export const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Only redirect on 401 for protected routes, not auth routes
    const isAuthRoute = error.config?.url?.includes('/auth/');
    if (error.response?.status === 401 && !isAuthRoute) {
      // Token expired or invalid - clear auth state
      store.dispatch(clearAuth());
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API error helper
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

export const getApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    return {
      message: data?.message || data?.error || error.message || 'An error occurred',
      errors: data?.errors,
      statusCode: error.response?.status,
    };
  }
  return {
    message: error instanceof Error ? error.message : 'An unknown error occurred',
  };
};

export default api;

import axios, { AxiosError } from 'axios';
import { store } from '../store';
import { clearAuth } from '../store/slices/authPersistSlice';

export const API_BASE = 'https://dev.staffsynctech.co.uk';
export const API_BASE_URL = `${API_BASE}/api/v1`;

// Create axios instance
export const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': import.meta.env.VITE_API_KEY || '',
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

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear auth state
      store.dispatch(clearAuth());
      
      // Clear any stale auth data from localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiration');
      
      // Get user role from store before clearing to determine correct login page
      const state = store.getState();
      const userRole = state.auth.user?.role;
      const isClientUser = userRole === 'CLIENT_ADMIN' || userRole === 'CLIENT_USER';
      const loginPage = isClientUser ? '/#/client-login' : '/#/login';
      
      // Use React Router navigation instead of hard redirect
      // This prevents "Not Found" issues on page reload
      if (window.location.pathname !== loginPage) {
        window.location.replace(loginPage);
      }
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

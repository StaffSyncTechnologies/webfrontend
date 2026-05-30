import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User, Worker, AuthResponse } from '../../types/api';
import {
  useValidateInviteCodeMutation,
  useWorkerLoginMutation,
  useWorkerPasswordLoginMutation,
  useWorkerVerifyOtpMutation,
  useWorkerRegisterMutation,
  useGetMeQuery,
  useUpdateMeMutation,
  useForgotPasswordMutation,
  useLogoutMutation,
  useChangePasswordMutation,
} from '../api/authApi';

interface AuthState {
  user: User | Worker | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('authToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('authToken'),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken || null;
      state.isAuthenticated = true;
      state.error = null;
      
      // Store in localStorage
      localStorage.setItem('authToken', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    },
    
    setWorker: (state, action: PayloadAction<Worker>) => {
      state.user = action.payload;
    },
    
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      
      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    hydrateAuth: (state) => {
      const token = localStorage.getItem('authToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (token) {
        state.token = token;
        state.refreshToken = refreshToken;
        state.isAuthenticated = true;
      }
    },
    
    loadAuthFromStorage: (state) => {
      const token = localStorage.getItem('authToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const userStr = localStorage.getItem('authUser');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          state.token = token;
          state.refreshToken = refreshToken;
          state.user = user;
          state.isAuthenticated = true;
        } catch (error) {
          console.error('Failed to parse user from localStorage:', error);
          // Clear invalid data
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('authUser');
        }
      }
    },
    
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setCredentials,
  setWorker,
  logout,
  setLoading,
  hydrateAuth,
  loadAuthFromStorage,
  setError,
  clearError,
} = authSlice.actions;

export { authSlice };
export default authSlice.reducer;

// Combined useAuthApi for compatibility with existing code
export const useAuthApi = () => {
  return {
    useValidateInviteCodeMutation,
    useAcceptInviteCodeMutation: useValidateInviteCodeMutation, // Alias for same functionality
    useWorkerLoginMutation,
    useWorkerPasswordLoginMutation,
    useWorkerVerifyOtpMutation,
    useWorkerRegisterMutation,
    useGetMeQuery,
    useUpdateMeMutation,
    useForgotPasswordMutation,
    useLogoutMutation,
    useChangePasswordMutation,
  };
};

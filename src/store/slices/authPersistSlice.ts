import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User, Worker } from '../../types/api.ts';

export interface AuthState {
  user: User | Worker | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tokenExpiration: number | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  tokenExpiration: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set authentication state after successful login
    setAuth: (state, action: PayloadAction<{
      user: User | Worker;
      token: string;
      refreshToken?: string;
      expiresIn?: number;
    }>) => {
      const { user, token, refreshToken, expiresIn } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken || null;
      state.isAuthenticated = true;
      state.error = null;
      
      if (expiresIn) {
        state.tokenExpiration = Date.now() + expiresIn * 1000;
      }
      
      // Also store in localStorage for backup
      localStorage.setItem('authToken', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      if (expiresIn) {
        localStorage.setItem('tokenExpiration', (Date.now() + expiresIn * 1000).toString());
      }
    },
    
    // Clear authentication state after logout
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.tokenExpiration = null;
      
      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiration');
    },
    
    // Update user information
    updateUser: (state, action: PayloadAction<Partial<User | Worker>>) => {
      if (state.user) {
        Object.assign(state.user, action.payload);
      }
    },
    
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    
    // Check token expiration and clear if expired
    checkTokenExpiration: (state) => {
      if (state.tokenExpiration && Date.now() >= state.tokenExpiration) {
        // Token expired, clear auth
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = 'Token expired';
        state.tokenExpiration = null;
        
        // Clear localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiration');
      }
    },
    
    // Restore auth state from localStorage (for hydration)
    restoreAuth: (state) => {
      const token = localStorage.getItem('authToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const tokenExpiration = localStorage.getItem('tokenExpiration');
      
      // If we have a token in localStorage, restore it
      if (token) {
        state.token = token;
        state.refreshToken = refreshToken;
        state.tokenExpiration = tokenExpiration ? parseInt(tokenExpiration, 10) : null;
        
        // Check if token is expired
        if (state.tokenExpiration && Date.now() >= state.tokenExpiration) {
          // Token expired, clear everything
          state.token = null;
          state.refreshToken = null;
          state.tokenExpiration = null;
          state.isAuthenticated = false;
          state.user = null;
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('tokenExpiration');
        } else {
          // Token is valid - mark as authenticated
          state.isAuthenticated = true;
        }
      }
      // If no token in localStorage, don't clear state.user - let redux-persist handle it
    },
  },
});

export const {
  setAuth,
  clearAuth,
  updateUser,
  setLoading,
  setError,
  checkTokenExpiration,
  restoreAuth,
} = authSlice.actions;

export default authSlice.reducer;

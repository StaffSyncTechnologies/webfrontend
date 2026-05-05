import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Worker, Admin, authApi } from '../api/authApi';

const AUTH_TOKEN_KEY = '@staffsync_auth_token';
const AUTH_WORKER_KEY = '@staffsync_worker';
const AUTH_ADMIN_KEY = '@staffsync_admin';

interface AuthState {
  token: string | null;
  worker: Worker | null;
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  onboardingComplete: boolean;
  userType: 'worker' | 'admin' | null;
}

const initialState: AuthState = {
  token: null,
  worker: null,
  admin: null,
  isAuthenticated: false,
  isLoading: true,
  onboardingComplete: false,
  userType: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; worker: Worker }>) => {
      state.token = action.payload.token;
      state.worker = action.payload.worker;
      state.userType = 'worker';
      state.isAuthenticated = true;
      state.isLoading = false;
      // Persist to AsyncStorage
      AsyncStorage.setItem(AUTH_TOKEN_KEY, action.payload.token);
      AsyncStorage.setItem(AUTH_WORKER_KEY, JSON.stringify(action.payload.worker));
    },
    setAdminCredentials: (state, action: PayloadAction<{ token: string; admin: Admin; organization?: any }>) => {
      state.token = action.payload.token;
      // Merge organization data into admin object
      if (action.payload.organization) {
        state.admin = {
          ...action.payload.admin,
          organizationName: action.payload.organization.organizationName || action.payload.organization.name,
          logoUrl: action.payload.organization.logoUrl,
          primaryColor: action.payload.organization.primaryColor,
          secondaryColor: action.payload.organization.secondaryColor,
          organization: action.payload.organization,
        };
      } else {
        state.admin = action.payload.admin;
      }
      state.userType = 'admin';
      state.isAuthenticated = true;
      state.isLoading = false;
      // Persist to AsyncStorage
      AsyncStorage.setItem(AUTH_TOKEN_KEY, action.payload.token);
      AsyncStorage.setItem(AUTH_ADMIN_KEY, JSON.stringify(state.admin));
    },
    setWorker: (state, action: PayloadAction<Worker>) => {
      state.worker = action.payload;
      AsyncStorage.setItem(AUTH_WORKER_KEY, JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.token = null;
      state.worker = null;
      state.admin = null;
      state.userType = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      
      AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      AsyncStorage.removeItem(AUTH_WORKER_KEY);
      AsyncStorage.removeItem(AUTH_ADMIN_KEY);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    hydrateAuth: (state, action: PayloadAction<{ token: string | null; worker: Worker | null; admin: Admin | null; userType: 'worker' | 'admin' | null }>) => {
      state.token = action.payload.token;
      state.worker = action.payload.worker;
      state.admin = action.payload.admin;
      state.userType = action.payload.userType;
      state.isAuthenticated = !!action.payload.token;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    // Handle successful OTP verification
    builder.addMatcher(
      authApi.endpoints.workerVerifyOtp.matchFulfilled,
      (state, { payload }) => {
        if (payload.data?.token && payload.data?.worker) {
          state.token = payload.data.token;
          state.worker = payload.data.worker;
          state.userType = 'worker';
          state.isAuthenticated = true;
          state.onboardingComplete = payload.data.onboardingComplete ?? false;
          AsyncStorage.setItem(AUTH_TOKEN_KEY, payload.data.token);
          AsyncStorage.setItem(AUTH_WORKER_KEY, JSON.stringify(payload.data.worker));
        }
      }
    );
    // Handle successful password login
    builder.addMatcher(
      authApi.endpoints.workerPasswordLogin.matchFulfilled,
      (state, { payload }) => {
        if (payload.data?.token && payload.data?.worker) {
          state.token = payload.data.token;
          state.worker = payload.data.worker;
          state.userType = 'worker';
          state.isAuthenticated = true;
          state.onboardingComplete = payload.data.onboardingComplete ?? false;
          AsyncStorage.setItem(AUTH_TOKEN_KEY, payload.data.token);
          AsyncStorage.setItem(AUTH_WORKER_KEY, JSON.stringify(payload.data.worker));
        }
      }
    );
    // Handle successful admin login
    builder.addMatcher(
      authApi.endpoints.adminLogin.matchFulfilled,
      (state, { payload }) => {
        console.log('Admin login fulfilled:', payload);
        if (payload.data?.token && payload.data?.user) {
          state.token = payload.data.token;
          state.admin = payload.data.user as Admin;
          state.userType = 'admin';
          state.isAuthenticated = true;
          AsyncStorage.setItem(AUTH_TOKEN_KEY, payload.data.token);
          AsyncStorage.setItem(AUTH_ADMIN_KEY, JSON.stringify(payload.data.user));
        }
      }
    );
    // Handle getMe
    builder.addMatcher(
      authApi.endpoints.getMe.matchFulfilled,
      (state, { payload }) => {
        if (payload.data) {
          state.worker = payload.data;
        }
      }
    );
    // Handle logout
    builder.addMatcher(
      authApi.endpoints.logout.matchFulfilled,
      (state) => {
        state.token = null;
        state.worker = null;
        state.isAuthenticated = false;
        AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        AsyncStorage.removeItem(AUTH_WORKER_KEY);
      }
    );
  },
});

export const { setCredentials, setAdminCredentials, setWorker, logout, setLoading, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;

// Helper to hydrate auth from AsyncStorage
export const loadAuthFromStorage = async (): Promise<{ token: string | null; worker: Worker | null; admin: Admin | null; userType: 'worker' | 'admin' | null }> => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    const workerStr = await AsyncStorage.getItem(AUTH_WORKER_KEY);
    const adminStr = await AsyncStorage.getItem(AUTH_ADMIN_KEY);
    const worker = workerStr ? JSON.parse(workerStr) : null;
    const admin = adminStr ? JSON.parse(adminStr) : null;
    const userType = worker ? 'worker' : (admin ? 'admin' : null);
    return { token, worker, admin, userType };
  } catch {
    return { token: null, worker: null, admin: null, userType: null };
  }
};

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Worker, authApi } from '../api/authApi';

const AUTH_TOKEN_KEY = '@staffsync_auth_token';
const AUTH_WORKER_KEY = '@staffsync_worker';

interface AuthState {
  token: string | null;
  worker: Worker | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  onboardingComplete: boolean;
}

const initialState: AuthState = {
  token: null,
  worker: null,
  isAuthenticated: false,
  isLoading: true,
  onboardingComplete: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; worker: Worker }>) => {
      state.token = action.payload.token;
      state.worker = action.payload.worker;
      state.isAuthenticated = true;
      state.isLoading = false;
      // Persist to AsyncStorage
      AsyncStorage.setItem(AUTH_TOKEN_KEY, action.payload.token);
      AsyncStorage.setItem(AUTH_WORKER_KEY, JSON.stringify(action.payload.worker));
    },
    setWorker: (state, action: PayloadAction<Worker>) => {
      state.worker = action.payload;
      AsyncStorage.setItem(AUTH_WORKER_KEY, JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.token = null;
      state.worker = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      AsyncStorage.removeItem(AUTH_WORKER_KEY);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    hydrateAuth: (state, action: PayloadAction<{ token: string | null; worker: Worker | null }>) => {
      state.token = action.payload.token;
      state.worker = action.payload.worker;
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
          state.isAuthenticated = true;
          state.onboardingComplete = payload.data.onboardingComplete ?? false;
          AsyncStorage.setItem(AUTH_TOKEN_KEY, payload.data.token);
          AsyncStorage.setItem(AUTH_WORKER_KEY, JSON.stringify(payload.data.worker));
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

export const { setCredentials, setWorker, logout, setLoading, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;

// Helper to hydrate auth from AsyncStorage
export const loadAuthFromStorage = async (): Promise<{ token: string | null; worker: Worker | null }> => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    const workerStr = await AsyncStorage.getItem(AUTH_WORKER_KEY);
    const worker = workerStr ? JSON.parse(workerStr) : null;
    return { token, worker };
  } catch {
    return { token: null, worker: null };
  }
};

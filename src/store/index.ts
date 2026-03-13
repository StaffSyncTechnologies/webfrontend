import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import authPersistReducer from './slices/authPersistSlice.ts';
import { clientRegistrationApi } from './slices/clientRegistrationSlice.ts';
import { chatApi } from './slices/chatSlice.ts';
import { dashboardApi } from './slices/dashboardSlice.ts';
import { userApi } from './slices/userSlice.ts';
import { workerApi } from './slices/workerSlice.ts';
import { shiftApi } from './slices/shiftSlice.ts';
import { attendanceApi } from './slices/attendanceSlice.ts';
import { clientApi } from './slices/clientSlice.ts';
import { organizationApi } from './slices/organizationSlice.ts';
import { onboardingApi } from './slices/onboardingSlice.ts';
import { reportApi } from './slices/reportSlice.ts';
import { notificationApi } from './slices/notificationSlice.ts';
import { skillApi } from './slices/skillSlice.ts';
import { payrollApi } from './slices/payrollSlice.ts';
import { holidayApi } from './slices/holidaySlice.ts';
import { hrApi } from './slices/hrSlice.ts';
import { complianceApi } from './slices/complianceSlice.ts';
import { subscriptionApi } from './slices/subscriptionSlice.ts';
import { settingsApi } from './slices/settingsSlice.ts';
import { bankAccountApi } from './slices/bankAccountSlice.ts';
import toastReducer from './slices/toastSlice.ts';
import { inviteRequestApi } from './slices/inviteRequestSlice.ts';

// Redux persist configuration for auth
const persistConfig = {
  key: 'auth',
  storage,
  version: 4, // Increment to force clear all stale auth data
  whitelist: ['user', 'token', 'refreshToken', 'isAuthenticated', 'tokenExpiration'],
  migrate: (state: any) => {
    // Check if logout forced a clear
    const forceAuthClear = localStorage.getItem('forceAuthClear');
    
    // Clear old persisted state by returning fresh state
    if (!state || state._persist?.version !== 4 || forceAuthClear) {
      // Remove the flag
      localStorage.removeItem('forceAuthClear');
      // Also clear localStorage to ensure clean slate
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiration');
      localStorage.removeItem('persist:auth');
      return Promise.resolve({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        tokenExpiration: null,
      });
    }
    return Promise.resolve(state);
  },
};

// Create persisted auth reducer
const persistedAuthReducer = persistReducer(persistConfig, authPersistReducer);

// Combine all reducers
const rootReducer = combineReducers({
  auth: persistedAuthReducer,
  toast: toastReducer,
  [clientRegistrationApi.reducerPath]: clientRegistrationApi.reducer,
  [chatApi.reducerPath]: chatApi.reducer,
  [dashboardApi.reducerPath]: dashboardApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [workerApi.reducerPath]: workerApi.reducer,
  [shiftApi.reducerPath]: shiftApi.reducer,
  [attendanceApi.reducerPath]: attendanceApi.reducer,
  [clientApi.reducerPath]: clientApi.reducer,
  [organizationApi.reducerPath]: organizationApi.reducer,
  [onboardingApi.reducerPath]: onboardingApi.reducer,
  [reportApi.reducerPath]: reportApi.reducer,
  [notificationApi.reducerPath]: notificationApi.reducer,
  [skillApi.reducerPath]: skillApi.reducer,
  [payrollApi.reducerPath]: payrollApi.reducer,
  [holidayApi.reducerPath]: holidayApi.reducer,
  [hrApi.reducerPath]: hrApi.reducer,
  [complianceApi.reducerPath]: complianceApi.reducer,
  [subscriptionApi.reducerPath]: subscriptionApi.reducer,
  [settingsApi.reducerPath]: settingsApi.reducer,
  [bankAccountApi.reducerPath]: bankAccountApi.reducer,
  [inviteRequestApi.reducerPath]: inviteRequestApi.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER', 'persist/PURGE'],
        ignoredPaths: ['auth'], // Ignore auth state for serializable check
      },
    })
    .concat(
      clientRegistrationApi.middleware,
      chatApi.middleware,
      dashboardApi.middleware,
      userApi.middleware,
      workerApi.middleware,
      shiftApi.middleware,
      attendanceApi.middleware,
      clientApi.middleware,
      organizationApi.middleware,
      onboardingApi.middleware,
      reportApi.middleware,
      notificationApi.middleware,
      skillApi.middleware,
      payrollApi.middleware,
      holidayApi.middleware,
      hrApi.middleware,
      complianceApi.middleware,
      subscriptionApi.middleware,
      settingsApi.middleware,
      bankAccountApi.middleware,
      inviteRequestApi.middleware
    ),
});

export const persistor = persistStore(store);

// Export typed hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

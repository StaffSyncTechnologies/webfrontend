import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import authPersistReducer from './slices/authPersistSlice';
import { clientRegistrationApi } from './slices/clientRegistrationSlice';
import { chatApi } from './slices/chatSlice';
import { dashboardApi } from './slices/dashboardSlice';
import { clientDashboardApi } from './slices/clientDashboardSlice';
import { userApi } from './slices/userSlice';
import { workerApi } from './slices/workerSlice';
import { shiftApi } from './slices/shiftSlice';
import { attendanceApi } from './slices/attendanceSlice';
import { clientApi } from './slices/clientSlice';
import { organizationApi } from './slices/organizationSlice';
import { onboardingApi } from './slices/onboardingSlice';
import { reportApi } from './slices/reportSlice';
import { notificationApi } from './slices/notificationSlice';
import { skillApi } from './slices/skillSlice';
import { payrollApi } from './slices/payrollSlice';
import { holidayApi } from './slices/holidaySlice';
import { hrApi } from './slices/hrSlice';
import { complianceApi } from './slices/complianceSlice';
import { subscriptionApi } from './slices/subscriptionSlice';
import { settingsApi } from './slices/settingsSlice';
import { bankAccountApi } from './slices/bankAccountSlice';
import toastReducer from './slices/toastSlice';
import { inviteRequestApi } from './slices/inviteRequestSlice';
import { matchingApi } from './api/matchingApi';

// Redux persist configuration for auth
const persistConfig = {
  key: 'auth',
  storage,
  version: 4, // Increment to force clear all stale auth data
  whitelist: ['user', 'token', 'refreshToken', 'isAuthenticated', 'tokenExpiration', 'agencies', 'currentAgency'],
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
  [clientDashboardApi.reducerPath]: clientDashboardApi.reducer,
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
  [matchingApi.reducerPath]: matchingApi.reducer,
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
      clientDashboardApi.middleware,
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
      inviteRequestApi.middleware,
      matchingApi.middleware
    ),
});

export const persistor = persistStore(store);

// Export typed hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

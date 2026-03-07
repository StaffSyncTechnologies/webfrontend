import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getApiError } from '../../services/api';
import { useAppDispatch } from '../../store';
import { setAuth, clearAuth, setLoading, setError } from '../../store/slices/authPersistSlice';
import type {
  LoginCredentials,
  RegisterCredentials,
  RegisterResponse,
  AuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  SendOtpRequest,
  VerifyOtpRequest,
  ChangePasswordRequest,
  MeResponse,
  StaffLoginCredentials,
  WorkerLoginCredentials,
  WorkerVerifyOtpRequest,
  WorkerRegisterCredentials,
} from '../../types/api';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

// Login mutation
export const useLogin = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      dispatch(setLoading(true));
      const response = await api.post<{ data: AuthResponse }>('/auth/login', credentials);
      return response.data.data;
    },
    onSuccess: (data) => {
      dispatch(setAuth({
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
      }));
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
    onError: (error) => {
      const apiError = getApiError(error);
      dispatch(setError(apiError.message));
    },
    onSettled: () => {
      dispatch(setLoading(false));
    },
  });
};

// Staff login mutation
export const useStaffLogin = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: StaffLoginCredentials) => {
      dispatch(setLoading(true));
      const response = await api.post<{ data: AuthResponse }>('/auth/staff/login', credentials);
      return response.data.data;
    },
    onSuccess: (data) => {
      dispatch(setAuth({
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
      }));
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
    onError: (error) => {
      const apiError = getApiError(error);
      dispatch(setError(apiError.message));
    },
    onSettled: () => {
      dispatch(setLoading(false));
    },
  });
};

// Worker login mutation
export const useWorkerLogin = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: WorkerLoginCredentials) => {
      dispatch(setLoading(true));
      const response = await api.post<{ data: AuthResponse }>('/auth/worker/login', credentials);
      return response.data.data;
    },
    onSuccess: (data) => {
      dispatch(setAuth({
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
      }));
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
    onError: (error) => {
      const apiError = getApiError(error);
      dispatch(setError(apiError.message));
    },
    onSettled: () => {
      dispatch(setLoading(false));
    },
  });
};

// Register mutation - returns requiresVerification, not auth token
export const useRegister = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      dispatch(setLoading(true));
      const response = await api.post<{ data: RegisterResponse }>('/auth/register', credentials);
      return response.data.data;
    },
    onError: (error) => {
      const apiError = getApiError(error);
      dispatch(setError(apiError.message));
    },
    onSettled: () => {
      dispatch(setLoading(false));
    },
  });
};

// Worker register mutation
export const useWorkerRegister = () => {
  return useMutation({
    mutationFn: async (credentials: WorkerRegisterCredentials) => {
      const response = await api.post<{ data: { message: string } }>('/auth/worker/register', credentials);
      return response.data.data;
    },
  });
};

// Forgot password mutation
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (data: ForgotPasswordRequest) => {
      const response = await api.post<{ data: { message: string } }>('/auth/forgot-password', data);
      return response.data.data;
    },
  });
};

// Reset password mutation
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (data: ResetPasswordRequest) => {
      const response = await api.post<{ data: { message: string } }>('/auth/reset-password', data);
      return response.data.data;
    },
  });
};

// Send OTP mutation
export const useSendOtp = () => {
  return useMutation({
    mutationFn: async (data: SendOtpRequest) => {
      const response = await api.post<{ data: { message: string } }>('/auth/send-otp', data);
      return response.data.data;
    },
  });
};

// Verify OTP mutation
// Note: Does NOT auto-login - onboarding flow handles login after plan selection
export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: async (data: VerifyOtpRequest) => {
      const response = await api.post<{ data: AuthResponse }>('/auth/verify-otp', data);
      return response.data.data;
    },
  });
};

// Worker verify OTP mutation
export const useWorkerVerifyOtp = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async (data: WorkerVerifyOtpRequest) => {
      const response = await api.post<{ data: AuthResponse }>('/auth/worker/verify-otp', data);
      return response.data.data;
    },
    onSuccess: (data) => {
      dispatch(setAuth({
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
      }));
    },
  });
};

// Change password mutation
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: ChangePasswordRequest) => {
      const response = await api.post<{ data: { message: string } }>('/auth/change-password', data);
      return response.data.data;
    },
  });
};

// Get current user query
export const useMe = (enabled = true) => {
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const response = await api.get<{ data: MeResponse }>('/auth/me');
      return response.data.data;
    },
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Logout mutation
export const useLogout = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      dispatch(clearAuth());
      queryClient.clear();
    },
    onError: () => {
      // Even if logout fails on server, clear local state
      dispatch(clearAuth());
      queryClient.clear();
    },
  });
};

// Validate staff invite token
export const useValidateStaffInvite = (token: string) => {
  return useQuery({
    queryKey: ['staff-invite', token],
    queryFn: async () => {
      const response = await api.get(`/auth/staff-invite/${token}`);
      return response.data.data;
    },
    enabled: !!token,
    retry: false,
  });
};

// Staff register / Accept staff invite mutation
export interface StaffRegisterCredentials {
  token: string;
  password: string;
  fullName?: string;
  phone?: string;
  niNumber?: string;
}

export const useStaffRegister = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ token, password, fullName, phone, niNumber }: StaffRegisterCredentials) => {
      const response = await api.post<{ data: AuthResponse }>(`/auth/staff-invite/${token}/accept`, {
        password,
        fullName,
        phone,
        niNumber,
      });
      return response.data.data;
    },
    onSuccess: (data) => {
      dispatch(setAuth({
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
      }));
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
    onError: (error) => {
      const apiError = getApiError(error);
      dispatch(setError(apiError.message));
    },
  });
};

// Alias for backwards compatibility
export const useAcceptStaffInvite = useStaffRegister;

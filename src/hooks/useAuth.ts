import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  useWorkerLoginMutation,
  useWorkerVerifyOtpMutation,
  useWorkerRegisterMutation,
  useLogoutMutation,
  useGetMeQuery,
  logout as logoutAction,
} from '../store';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { token, worker, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  const [loginMutation, { isLoading: isLoggingIn }] = useWorkerLoginMutation();
  const [verifyOtpMutation, { isLoading: isVerifying }] = useWorkerVerifyOtpMutation();
  const [registerMutation, { isLoading: isRegistering }] = useWorkerRegisterMutation();
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

  // Skip if not authenticated
  const { refetch: refetchMe } = useGetMeQuery(undefined, { skip: !isAuthenticated });

  const sendOtp = useCallback(async (phone: string) => {
    try {
      const result = await loginMutation({ phone }).unwrap();
      return { success: true, data: result };
    } catch (error: any) {
      console.error('sendOtp error:', JSON.stringify(error, null, 2));
      return { success: false, error: error?.data?.error || error?.data?.message || error?.error || error?.message || 'Failed to send OTP' };
    }
  }, [loginMutation]);

  const verifyOtp = useCallback(async (phone: string, otp: string) => {
    try {
      const result = await verifyOtpMutation({ phone, otp }).unwrap();
      return { success: true, data: result };
    } catch (error: any) {
      console.error('verifyOtp error:', JSON.stringify(error, null, 2));
      return { success: false, error: error?.data?.error || error?.data?.message || error?.error || error?.message || 'Invalid OTP' };
    }
  }, [verifyOtpMutation]);

  const register = useCallback(async (inviteCode: string, email: string) => {
    try {
      const result = await registerMutation({ inviteCode, email }).unwrap();
      return { success: true, data: result };
    } catch (error: any) {
      console.error('register error:', JSON.stringify(error, null, 2));
      return { success: false, error: error?.data?.error || error?.data?.message || error?.error || error?.message || 'Registration failed' };
    }
  }, [registerMutation]);

  const logout = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      // Logout locally even if API fails
    } finally {
      dispatch(logoutAction());
    }
  }, [logoutMutation, dispatch]);

  const refreshProfile = useCallback(async () => {
    if (isAuthenticated) {
      await refetchMe();
    }
  }, [isAuthenticated, refetchMe]);

  return {
    // State
    token,
    worker,
    isAuthenticated,
    isLoading: isLoading || isLoggingIn || isVerifying || isRegistering,
    isLoggingOut,

    // Actions
    sendOtp,
    verifyOtp,
    register,
    logout,
    refreshProfile,
  };
}

export default useAuth;

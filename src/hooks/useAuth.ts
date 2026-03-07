import { useAppSelector, useAppDispatch } from '../store';
import { setAuth, clearAuth, updateUser, checkTokenExpiration, restoreAuth } from '../store/slices/authPersistSlice';
import { useEffect } from 'react';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  // Restore auth state from localStorage on mount
  useEffect(() => {
    dispatch(restoreAuth());
  }, [dispatch]);

  // Check token expiration periodically
  useEffect(() => {
    if (auth.isAuthenticated && auth.tokenExpiration) {
      const checkExpiration = () => {
        dispatch(checkTokenExpiration());
      };

      // Check immediately
      checkExpiration();

      // Set up interval to check every minute
      const interval = setInterval(checkExpiration, 60000);

      return () => clearInterval(interval);
    }
  }, [auth.isAuthenticated, auth.tokenExpiration, dispatch]);

  const login = (user: any, token: string, refreshToken?: string, expiresIn?: number) => {
    dispatch(setAuth({ user, token, refreshToken, expiresIn }));
  };

  const logout = () => {
    dispatch(clearAuth());
  };

  const updateUserProfile = (updates: any) => {
    dispatch(updateUser(updates));
  };

  return {
    user: auth.user,
    token: auth.token,
    refreshToken: auth.refreshToken,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    tokenExpiration: auth.tokenExpiration,
    login,
    logout,
    updateUserProfile,
  };
};

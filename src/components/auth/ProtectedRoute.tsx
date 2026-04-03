import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useGetSubscriptionSummaryQuery } from '../../store/slices/subscriptionSlice';
import { SubscriptionExpiredPage } from '../../pages/SubscriptionExpiredPage';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface ProtectedRouteProps {
  children: ReactNode;
}

// Helper to check if token is valid (exists and not expired)
function isTokenValid(): boolean {
  const token = localStorage.getItem('authToken');
  const expiration = localStorage.getItem('tokenExpiration');
  
  // No token = not valid
  if (!token) return false;
  
  // If expiration is set, check if expired
  if (expiration) {
    return Date.now() < parseInt(expiration, 10);
  }
  
  // Token exists but no expiration = assume valid (backend will reject if invalid)
  return true;
}

// Helper to clear expired auth data
function clearExpiredAuth(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenExpiration');
  localStorage.removeItem('persist:auth');
}

// Routes that should remain accessible even when subscription is expired
const ALLOWED_WHEN_EXPIRED = ['/settings/billing', '/settings', '/help', '/contact'];

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();

  // Check if we're currently on the login page to prevent redirect loops
  const isLoginPage = location.pathname === '/login';

  // Only allow access if token is valid (exists AND not expired)
  if (!isTokenValid() && !isLoginPage) {
    // Clear any stale auth data
    clearExpiredAuth();
    // Redirect to login page but save the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If we're on login page but somehow have valid token, redirect to dashboard
  if (isTokenValid() && isLoginPage) {
    return <Navigate to="/dashboard" replace />;
  }

  // If we don't have a valid token and we're not on login page, show loading or redirect
  if (!isTokenValid() && !isLoginPage) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <SubscriptionGuard>{children}</SubscriptionGuard>;
}

function SubscriptionGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Skip subscription check for client users - they don't have agency subscriptions
  const isClientUser = user?.role === 'CLIENT_ADMIN' || user?.role === 'CLIENT_USER';
  
  if (isClientUser) {
    return <>{children}</>;
  }
  
  const { data: summary, isLoading } = useGetSubscriptionSummaryQuery(undefined, {
    skip: isClientUser
  });

  // Don't block while loading
  if (isLoading || !summary) {
    return <>{children}</>;
  }

  // Allow certain routes even when expired (so users can upgrade)
  const isAllowedRoute = ALLOWED_WHEN_EXPIRED.some((path) => location.pathname.startsWith(path));
  if (isAllowedRoute) {
    return <>{children}</>;
  }

  // Block access when subscription is expired
  if (summary.isExpired && !summary.canAccessDashboard) {
    return <SubscriptionExpiredPage />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;

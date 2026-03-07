import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useGetSubscriptionSummaryQuery } from '../../store/slices/subscriptionSlice';
import { SubscriptionExpiredPage } from '../../pages/SubscriptionExpiredPage';

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

  // Only allow access if token is valid (exists AND not expired)
  if (!isTokenValid()) {
    // Clear any stale auth data
    clearExpiredAuth();
    // Redirect to login page but save the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <SubscriptionGuard>{children}</SubscriptionGuard>;
}

function SubscriptionGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { data: summary, isLoading } = useGetSubscriptionSummaryQuery();

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

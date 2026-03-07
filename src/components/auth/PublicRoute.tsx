import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

interface PublicRouteProps {
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

export function PublicRoute({ children }: PublicRouteProps) {
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  // Only redirect to dashboard if token is valid (exists AND not expired)
  if (isTokenValid()) {
    return <Navigate to={from} replace />;
  }

  // Don't clear auth data here - let ProtectedRoute handle that
  // Clearing here can cause race conditions during login
  return <>{children}</>;
}

export default PublicRoute;

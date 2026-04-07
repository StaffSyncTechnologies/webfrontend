import { useEffect, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const location = useLocation();
  const { token, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Small delay to allow Redux persist to rehydrate
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show loading while auth state is being initialized
  if (!isInitialized || isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // If we're on a public route, allow access
  const publicRoutes = ['/login', '/client-login', '/register', '/forgot-password', '/reset-password', '/contact-us', '/watch-demo', '/get-started', '/privacy', '/terms', '/cookies', '/gdpr', '/delete-account', '/'];
  const isPublicRoute = publicRoutes.some(route => location.pathname === route || location.pathname.startsWith(route + '/'));

  if (isPublicRoute) {
    return <>{children}</>;
  }

  // If we don't have a token and we're not on a public route, redirect to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

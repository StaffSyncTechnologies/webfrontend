// Token management utilities
export const tokenManager = {
  // Get the auth token
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  // Get the refresh token
  getRefreshToken: (): string | null => {
    return localStorage.getItem('refreshToken');
  },

  // Set tokens
  setTokens: (token: string, refreshToken?: string): void => {
    localStorage.setItem('authToken', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  },

  // Clear tokens
  clearTokens: (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },

  // Get token expiration (if stored)
  getTokenExpiration: (): number | null => {
    const expiration = localStorage.getItem('tokenExpiration');
    return expiration ? parseInt(expiration, 10) : null;
  },

  // Set token expiration
  setTokenExpiration: (expiresIn: number): void => {
    const expirationTime = Date.now() + expiresIn * 1000; // Convert to milliseconds
    localStorage.setItem('tokenExpiration', expirationTime.toString());
  },

  // Check if token is expired
  isTokenExpired: (): boolean => {
    const expiration = tokenManager.getTokenExpiration();
    if (!expiration) return false; // No expiration set, assume not expired
    return Date.now() >= expiration;
  },
};

// Auth guard utility for protected routes
export const authGuard = {
  // Check if user can access protected route
  canAccess: (): boolean => {
    return tokenManager.isAuthenticated() && !tokenManager.isTokenExpired();
  },

  // Get redirect URL for unauthenticated users
  getLoginRedirect: (): string => {
    return '/login';
  },
};

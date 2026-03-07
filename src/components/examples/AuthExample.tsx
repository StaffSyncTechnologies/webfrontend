import React, { useState } from 'react';
import { useLoginMutation, useLogoutMutation, useMeQuery } from '../../store/slices/authSlice';
import { tokenManager } from '../../utilities/auth';

export const AuthExample: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading: isLoggingIn, error: loginError }] = useLoginMutation();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const { data: userData, isLoading: isLoadingUser, error: userError } = useMeQuery();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login({ email, password }).unwrap();
      console.log('Login successful:', result);
      // Token is automatically stored by the auth slice
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      console.log('Logout successful');
      // Tokens are automatically cleared by the auth slice
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Check authentication status
  const isAuthenticated = tokenManager.isAuthenticated();

  return (
    <div className="auth-example">
      <h2>Authentication Example</h2>
      
      {isAuthenticated ? (
        <div>
          <h3>Authenticated</h3>
          {isLoadingUser ? (
            <p>Loading user data...</p>
          ) : userError ? (
            <p>Error loading user data</p>
          ) : userData ? (
            <div>
              <p>Welcome, {userData.user.fullName}!</p>
              <p>Email: {userData.user.email}</p>
              {userData.permissions && (
                <p>Permissions: {userData.permissions.join(', ')}</p>
              )}
              <button 
                onClick={handleLogout} 
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div>
          <h3>Login</h3>
          <form onSubmit={handleLogin}>
            <div>
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {loginError && (
              <p style={{ color: 'red' }}>
                Login failed: {loginError instanceof Error ? loginError.message : 'Unknown error'}
              </p>
            )}
            <button type="submit" disabled={isLoggingIn}>
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      )}
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>Current auth token: {tokenManager.getToken() ? 'Set' : 'Not set'}</p>
        <p>Is authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        <p>Token expired: {tokenManager.isTokenExpired() ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
};

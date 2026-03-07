import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export const PersistedAuthExample: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { user, token, isAuthenticated, isLoading, error, login, logout } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate a login response
    const mockUser = {
      id: '1',
      fullName: 'John Doe',
      email: email,
      role: 'ADMIN' as const,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    const mockToken = 'mock-jwt-token';
    const mockRefreshToken = 'mock-refresh-token';
    const expiresIn = 3600; // 1 hour

    login(mockUser, mockToken, mockRefreshToken, expiresIn);
  };

  const handleLogout = () => {
    logout();
    setEmail('');
    setPassword('');
  };

  return (
    <div className="persisted-auth-example" style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Persisted Auth Example</h2>
      
      {isAuthenticated ? (
        <div>
          <h3>Authenticated ✅</h3>
          <div style={{ backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <p><strong>Welcome, {user?.fullName}!</strong></p>
            <p>Email: {user?.email}</p>
            <p>Role: {(user as any)?.role || 'N/A'}</p>
            <p style={{ fontSize: '12px', color: '#666' }}>
              Token: {token?.substring(0, 20)}...
            </p>
          </div>
          
          <button 
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
          
          <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
            <p>💾 Auth state is persisted in localStorage</p>
            <p>🔄 Try refreshing the page - you'll stay logged in!</p>
            <p>⏰ Token expires in 1 hour</p>
          </div>
        </div>
      ) : (
        <div>
          <h3>Login</h3>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
            
            {error && (
              <div style={{ 
                color: 'red', 
                marginBottom: '15px', 
                padding: '10px', 
                backgroundColor: '#ffebee',
                borderRadius: '4px'
              }}>
                Error: {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
            <p>💡 This is a mock login for demonstration</p>
            <p>💾 Your session will be persisted</p>
          </div>
        </div>
      )}
    </div>
  );
};

# Persisted Authentication Documentation

## Overview

The StaffSync application now features a comprehensive persisted authentication system using Redux Persist. This ensures that user authentication state (tokens, user info, etc.) is automatically saved to localStorage and restored when the app reloads.

## Features

### 🔄 **Automatic Persistence**
- Auth state automatically saved to localStorage
- State restored on app initialization
- Seamless user experience across page refreshes

### ⏰ **Token Expiration Handling**
- Automatic token expiration checking
- Periodic validation (every minute)
- Automatic logout when token expires

### 🛡️ **Security Features**
- Secure token storage in localStorage
- Automatic cleanup on logout
- Backup localStorage storage for redundancy

### 🎯 **Easy Integration**
- Simple `useAuth` hook for components
- Type-safe TypeScript support
- Redux DevTools integration

## Architecture

### Store Structure

```typescript
interface AuthState {
  user: User | Worker | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tokenExpiration: number | null;
}
```

### Redux Persist Configuration

```typescript
const persistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token', 'refreshToken', 'isAuthenticated', 'tokenExpiration'],
};
```

Only essential fields are persisted to avoid storing sensitive or temporary data.

## Usage Examples

### Basic Authentication Hook

```typescript
import { useAuth } from '../hooks/useAuth';

function LoginComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password }).unwrap();
      login(response.user, response.token, response.refreshToken, response.expiresIn);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <h1>Welcome, {user?.fullName}!</h1>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <form onSubmit={handleLogin}>
          {/* Login form */}
        </form>
      )}
    }
  );
}
```

### Protected Routes

```typescript
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

### API Integration

```typescript
// The auth slice automatically integrates with RTK Query APIs
// Tokens are automatically injected into requests

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: axiosBaseQuery({
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.authorization = `Bearer ${token}`;
      }
      return headers;
    },
  }),
  // ... endpoints
});
```

## Available Actions

### Auth Slice Actions

```typescript
import { setAuth, clearAuth, updateUser, checkTokenExpiration } from '../store/slices/authPersistSlice';

// Set authentication state
dispatch(setAuth({
  user: userData,
  token: jwtToken,
  refreshToken: refreshToken,
  expiresIn: 3600
}));

// Clear authentication state
dispatch(clearAuth());

// Update user information
dispatch(updateUser({ fullName: 'New Name' }));

// Check token expiration
dispatch(checkTokenExpiration());
```

### Hook Methods

```typescript
const {
  user,                    // Current user object
  token,                   // JWT token
  refreshToken,            // Refresh token
  isAuthenticated,         // Authentication status
  isLoading,               // Loading state
  error,                   // Error message
  tokenExpiration,         // Token expiration timestamp
  login,                   // Login function
  logout,                  // Logout function
  updateUserProfile,       // Update user profile
} = useAuth();
```

## Token Management

### Automatic Token Storage

When a user logs in, tokens are automatically:
1. Stored in Redux state
2. Persisted to localStorage
3. Used for API requests

### Token Expiration

The system automatically:
1. Checks token expiration on app load
2. Validates expiration every minute
3. Logs out user if token expired

### Manual Token Management

```typescript
import { tokenManager } from '../utilities/auth';

// Check if user is authenticated
const isAuth = tokenManager.isAuthenticated();

// Get current token
const token = tokenManager.getToken();

// Clear tokens manually
tokenManager.clearTokens();

// Check if token is expired
const isExpired = tokenManager.isTokenExpired();
```

## Migration Guide

### From Previous Auth System

1. **Replace auth imports**:
   ```typescript
   // Old
   import { useLoginMutation } from '../store/slices/authSlice';
   
   // New
   import { useAuth } from '../hooks/useAuth';
   ```

2. **Update login logic**:
   ```typescript
   // Old
   const [login, { isLoading }] = useLoginMutation();
   await login(credentials);
   
   // New
   const { login, isLoading } = useAuth();
   const response = await authApi.login(credentials);
   login(response.user, response.token, response.refreshToken, response.expiresIn);
   ```

3. **Update authentication checks**:
   ```typescript
   // Old
   const token = localStorage.getItem('authToken');
   
   // New
   const { isAuthenticated } = useAuth();
   ```

## Security Considerations

### ✅ **Secure Practices**
- Tokens stored in localStorage (not cookies)
- Automatic cleanup on logout
- Token expiration validation
- No sensitive data in non-persisted fields

### ⚠️ **Important Notes**
- localStorage is accessible via JavaScript
- Consider additional security measures for production
- Implement proper HTTPS in production
- Consider HttpOnly cookies for additional security

## Troubleshooting

### Common Issues

1. **Auth state not persisting**
   - Check Redux Persist configuration
   - Verify localStorage is enabled
   - Check browser console for errors

2. **Token not being injected**
   - Verify axiosBaseQuery configuration
   - Check token storage in localStorage
   - Verify API endpoint configuration

3. **User not staying logged in**
   - Check token expiration
   - Verify expiration checking logic
   - Check localStorage persistence

### Debug Tools

```typescript
// Check auth state in Redux DevTools
console.log(store.getState().auth);

// Check localStorage
console.log(localStorage.getItem('authToken'));
console.log(localStorage.getItem('persist:auth'));

// Check token expiration
console.log(tokenManager.isTokenExpired());
```

## Performance Considerations

- **Minimal persisted data**: Only essential auth fields are persisted
- **Efficient checking**: Token expiration checked periodically, not continuously
- **Optimistic updates**: Auth state updates immediately
- **Cache invalidation**: Proper cache tags for API data

## Best Practices

1. **Use the `useAuth` hook** for all auth-related operations
2. **Handle loading states** properly in UI components
3. **Implement proper error handling** for auth failures
4. **Use protected routes** for authenticated areas
5. **Test token expiration** scenarios
6. **Verify persistence** across browser sessions

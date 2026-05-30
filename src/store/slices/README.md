# Auth Slice Documentation

## Overview

The auth slice provides comprehensive authentication functionality for the StaffSync application, handling all AUTH endpoints from the API with automatic token management.

## Features

- **Multiple Login Types**: Regular login, staff login, and worker login
- **Token Management**: Automatic storage and retrieval of auth tokens
- **Password Recovery**: Forgot password and reset password functionality
- **OTP Verification**: Email and worker OTP verification
- **Staff Invites**: Validate and accept staff invitations
- **Worker Onboarding**: Complete worker registration and document upload
- **Profile Management**: Get current user info and update profile
- **Logout**: Secure logout with token cleanup

## Usage Examples

### Basic Login

```typescript
import { useLoginMutation } from '../store/slices/authSlice';

function LoginComponent() {
  const [login, { isLoading, error }] = useLoginMutation();

  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await login({ email, password }).unwrap();
      console.log('Login successful:', result);
      // Token is automatically stored in localStorage
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
}
```

### Staff Login

```typescript
import { useStaffLoginMutation } from '../store/slices/authSlice';

function StaffLoginComponent() {
  const [staffLogin, { isLoading }] = useStaffLoginMutation();

  const handleStaffLogin = async (email: string, password: string) => {
    try {
      const result = await staffLogin({ email, password }).unwrap();
      console.log('Staff login successful:', result);
    } catch (error) {
      console.error('Staff login failed:', error);
    }
  };
}
```

### Get Current User

```typescript
import { useMeQuery } from '../store/slices/authSlice';

function ProfileComponent() {
  const { data: userData, isLoading, error } = useMeQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading profile</div>;
  
  return (
    <div>
      <h1>Welcome, {userData?.user.fullName}</h1>
      <p>Email: {userData?.user.email}</p>
    </div>
  );
}
```

### Logout

```typescript
import { useLogoutMutation } from '../store/slices/authSlice';

function LogoutButton() {
  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      console.log('Logout successful');
      // Tokens are automatically cleared from localStorage
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <button onClick={handleLogout} disabled={isLoading}>
      {isLoading ? 'Logging out...' : 'Logout'}
    </button>
  );
}
```

### Worker Registration

```typescript
import { useWorkerRegisterMutation } from '../store/slices/authSlice';

function WorkerRegistrationComponent() {
  const [workerRegister, { isLoading }] = useWorkerRegisterMutation();

  const handleRegister = async (credentials: WorkerRegisterCredentials) => {
    try {
      const result = await workerRegister(credentials).unwrap();
      console.log('Worker registration successful:', result);
    } catch (error) {
      console.error('Worker registration failed:', error);
    }
  };
}
```

## Token Management

The auth slice includes automatic token management:

```typescript
import { tokenManager } from '../utilities/auth';

// Check if user is authenticated
const isAuthenticated = tokenManager.isAuthenticated();

// Get current token
const token = tokenManager.getToken();

// Clear tokens (manual logout)
tokenManager.clearTokens();

// Check if token is expired
const isExpired = tokenManager.isTokenExpired();
```

## Available Hooks

### Mutations
- `useRegisterMutation` - User registration
- `useLoginMutation` - Regular user login
- `useStaffLoginMutation` - Staff login
- `useWorkerLoginMutation` - Worker login
- `useForgotPasswordMutation` - Send password reset email
- `useResetPasswordMutation` - Reset password with token
- `useSendOtpMutation` - Send OTP verification
- `useVerifyOtpMutation` - Verify OTP
- `useWorkerVerifyOtpMutation` - Verify worker OTP
- `useAcceptStaffInviteMutation` - Accept staff invitation
- `useWorkerRegisterMutation` - Worker registration
- `useUploadWorkerDocumentsMutation` - Upload worker documents
- `useDeleteWorkerDocumentMutation` - Delete worker document
- `useUploadWorkerProfilePicMutation` - Upload worker profile picture
- `useVerifyWorkerRtwMutation` - Verify worker RTW status
- `useCompleteWorkerOnboardingMutation` - Complete worker onboarding
- `useUpdateMeMutation` - Update user profile
- `useChangePasswordMutation` - Change password
- `useLogoutMutation` - Logout

### Queries
- `useMeQuery` - Get current user information
- `useValidateStaffInviteQuery` - Validate staff invitation token

## Token Storage

Tokens are automatically stored in `localStorage`:
- `authToken`: JWT token for API authentication
- `refreshToken`: Refresh token (if provided by API)
- `tokenExpiration`: Token expiration timestamp (if provided)

## Error Handling

All auth operations return proper error responses that can be caught and handled appropriately. The auth slice uses RTK Query's built-in error handling.

## Integration with Store

The auth slice is automatically integrated with the Redux store and includes:
- Reducer for auth state management
- Middleware for automatic token injection in API requests
- Cache tags for efficient data fetching

---

# Chat Slice Documentation

## Overview

The chat slice provides comprehensive chat functionality for the StaffSync application, handling all chat endpoints with real-time messaging capabilities and room management.

## Features

- **Room Management**: Get user's chat rooms, create new rooms
- **Message History**: Retrieve messages for any room with pagination
- **Read Status**: Mark rooms as read and track unread counts
- **Direct Messaging**: Create direct message rooms with workers
- **Worker Assignment**: Get list of assigned workers for chat
- **Real-time Updates**: Cache invalidation for live updates

## Usage Examples

### Get Chat Rooms

```typescript
import { useGetMyRoomsQuery } from '../store/slices/chatSlice';

function ChatRoomsList() {
  const { data: rooms, isLoading, error } = useGetMyRoomsQuery();

  if (isLoading) return <div>Loading rooms...</div>;
  if (error) return <div>Error loading rooms</div>;

  return (
    <div>
      {rooms?.map(room => (
        <div key={room.id}>
          <h3>{room.name}</h3>
          <p>Type: {room.type}</p>
          <p>Unread: {room.unreadCount}</p>
          <p>Participants: {room.participants.length}</p>
        </div>
      ))}
    </div>
  );
}
```

### Get Room Messages

```typescript
import { useGetRoomMessagesQuery } from '../store/slices/chatSlice';

function ChatMessages({ roomId }: { roomId: string }) {
  const { data: messages, isLoading } = useGetRoomMessagesQuery(
    { roomId, limit: 50, offset: 0 },
    { skip: !roomId }
  );

  if (isLoading) return <div>Loading messages...</div>;

  return (
    <div>
      {messages?.map(message => (
        <div key={message.id}>
          <strong>{message.sender.fullName}:</strong> {message.content}
          <small>{new Date(message.createdAt).toLocaleTimeString()}</small>
        </div>
      ))}
    </div>
  );
}
```

### Mark Room as Read

```typescript
import { useMarkRoomAsReadMutation } from '../store/slices/chatSlice';

function RoomListItem({ room }: { room: ChatRoom }) {
  const [markAsRead] = useMarkRoomAsReadMutation();

  const handleMarkAsRead = async () => {
    try {
      await markAsRead(room.id).unwrap();
      console.log('Room marked as read');
    } catch (error) {
      console.error('Failed to mark room as read:', error);
    }
  };

  return (
    <div onClick={handleMarkAsRead}>
      <h3>{room.name}</h3>
      {room.unreadCount > 0 && (
        <span>Unread: {room.unreadCount}</span>
      )}
    </div>
  );
}
```

### Create Direct Message Room

```typescript
import { useGetOrCreateRoomMutation } from '../store/slices/chatSlice';

function WorkerList({ workers }: { workers: (User | Worker)[] }) {
  const [createRoom] = useGetOrCreateRoomMutation();

  const handleStartChat = async (workerId: string) => {
    try {
      const room = await createRoom({
        participantId: workerId,
        type: 'DIRECT'
      }).unwrap();
      console.log('Room created:', room);
      // Navigate to the room
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  return (
    <div>
      {workers?.map(worker => (
        <div key={worker.id} onClick={() => handleStartChat(worker.id)}>
          💬 {worker.fullName}
        </div>
      ))}
    </div>
  );
}
```

### Get Unread Count

```typescript
import { useGetUnreadCountQuery } from '../store/slices/chatSlice';

function UnreadIndicator() {
  const { data: unreadCount } = useGetUnreadCountQuery();

  if (!unreadCount || unreadCount.total === 0) return null;

  return (
    <div style={{ backgroundColor: 'red', color: 'white', borderRadius: '50%' }}>
      {unreadCount.total}
    </div>
  );
}
```

## Available Hooks

### Queries
- `useGetMyRoomsQuery` - Get user's chat rooms
- `useGetRoomMessagesQuery` - Get messages for a specific room
- `useGetUnreadCountQuery` - Get total unread count
- `useGetAssignedWorkersQuery` - Get assigned workers for chat

### Mutations
- `useGetOrCreateRoomMutation` - Get existing room or create new one
- `useMarkRoomAsReadMutation` - Mark a room as read

## Data Types

### ChatRoom
```typescript
interface ChatRoom {
  id: string;
  name: string;
  type: 'DIRECT' | 'GROUP' | 'SHIFT' | 'CLIENT';
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}
```

### ChatMessage
```typescript
interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  sender: User | Worker;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  attachments?: ChatAttachment[];
  isEdited: boolean;
  createdAt: string;
  updatedAt?: string;
  readBy?: ChatMessageRead[];
}
```

## Cache Management

The chat slice uses RTK Query's cache tags for efficient data management:
- `'ChatRoom'` - Invalidated when rooms are created/updated
- `'ChatMessage'` - Invalidated when new messages are received
- `'UnreadCount'` - Invalidated when rooms are marked as read

## Real-time Updates

When a room is marked as read, the slice automatically:
- Updates the room's unread count to 0 in the cache
- Invalidates the unread count query
- Triggers re-fetch of updated data

## Integration with Store

The chat slice is integrated with the Redux store and includes:
- Reducer for chat state management
- Middleware for automatic auth token injection
- Optimistic updates for better UX
- Cache invalidation for real-time updates

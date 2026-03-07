import { baseApi } from './baseApi';
import { CHAT } from '../../services/endpoints';

interface ChatUser {
  id: string;
  fullName: string;
  role: string;
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  content: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  createdAt: string;
  readAt: string | null;
  sender: ChatUser;
}

export interface ChatRoom {
  id: string;
  organizationId: string;
  hrUserId: string;
  workerId: string;
  lastMessageAt: string | null;
  createdAt: string;
  hrUser: ChatUser;
  worker: ChatUser;
  messages: ChatMessage[];
  unreadCount: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get or create a chat room for the worker (with their manager)
    workerGetOrCreateRoom: builder.mutation<ApiResponse<ChatRoom>, void>({
      query: () => ({
        url: CHAT.WORKER_ROOM,
        method: 'POST',
      }),
    }),

    // Get all chat rooms for the current user
    getMyRooms: builder.query<ApiResponse<ChatRoom[]>, void>({
      query: () => CHAT.ROOMS,
    }),

    // Get messages for a room
    getRoomMessages: builder.query<ApiResponse<ChatMessage[]>, { roomId: string; cursor?: string }>({
      query: ({ roomId, cursor }) => ({
        url: CHAT.MESSAGES(roomId),
        params: cursor ? { cursor, limit: 50 } : { limit: 50 },
      }),
    }),

    // Mark messages as read
    markMessagesAsRead: builder.mutation<ApiResponse<{ count: number }>, string>({
      query: (roomId) => ({
        url: CHAT.MARK_READ(roomId),
        method: 'POST',
      }),
    }),

    // Get unread message count
    getUnreadCount: builder.query<ApiResponse<{ count: number }>, void>({
      query: () => CHAT.UNREAD_COUNT,
    }),
  }),
});

export const {
  useWorkerGetOrCreateRoomMutation,
  useGetMyRoomsQuery,
  useGetRoomMessagesQuery,
  useMarkMessagesAsReadMutation,
  useGetUnreadCountQuery,
} = chatApi;

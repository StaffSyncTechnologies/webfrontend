import { baseApi } from './baseApi';
import { CHAT } from '../../services/endpoints';

interface ChatUser {
  id: string;
  fullName: string;
  role?: string;
  email?: string;
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderType: 'user' | 'client_user';
  content: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  createdAt: string;
  readAt: string | null;
  senderUser?: ChatUser;
}

export interface ChatRoom {
  id: string;
  organizationId: string;
  type: 'HR_WORKER' | 'CLIENT_AGENCY';
  // HR-Worker fields
  hrUserId?: string;
  workerId?: string;
  hrUser?: ChatUser;
  worker?: ChatUser;
  // Client-Agency fields
  clientUserId?: string;
  agencyUserId?: string;
  clientCompanyId?: string;
  clientUser?: ChatUser;
  agencyUser?: ChatUser;
  clientCompany?: { id: string; name: string };
  // Common fields
  lastMessageAt: string | null;
  createdAt: string;
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
    // HR-Worker chat endpoints (existing)
    workerGetOrCreateRoom: builder.mutation<ApiResponse<ChatRoom>, void>({
      query: () => ({
        url: CHAT.WORKER_ROOM,
        method: 'POST',
      }),
    }),

    getMyRooms: builder.query<ApiResponse<ChatRoom[]>, void>({
      query: () => CHAT.ROOMS,
    }),

    getRoomMessages: builder.query<ApiResponse<ChatMessage[]>, { roomId: string; cursor?: string }>({
      query: ({ roomId, cursor }) => ({
        url: CHAT.MESSAGES(roomId),
        params: cursor ? { cursor, limit: 50 } : { limit: 50 },
      }),
    }),

    markMessagesAsRead: builder.mutation<ApiResponse<{ count: number }>, string>({
      query: (roomId) => ({
        url: CHAT.MARK_READ(roomId),
        method: 'POST',
      }),
    }),

    getChatUnreadCount: builder.query<ApiResponse<{ count: number }>, void>({
      query: () => CHAT.UNREAD_COUNT,
    }),

    sendMessage: builder.mutation<ApiResponse<ChatMessage>, { roomId: string; content: string }>({
      query: ({ roomId, content }) => ({
        url: CHAT.SEND_MESSAGE(roomId),
        method: 'POST',
        body: { content },
      }),
    }),

    // Client-Agency chat endpoints (new)
    clientGetMyRooms: builder.query<ApiResponse<ChatRoom[]>, void>({
      query: () => CHAT.CLIENT_ROOMS,
    }),

    clientCreateRoom: builder.mutation<ApiResponse<ChatRoom>, void>({
      query: () => ({
        url: CHAT.CLIENT_CREATE_ROOM,
        method: 'POST',
      }),
    }),

    clientGetRoomMessages: builder.query<ApiResponse<ChatMessage[]>, { roomId: string; cursor?: string }>({
      query: ({ roomId, cursor }) => ({
        url: CHAT.CLIENT_MESSAGES(roomId),
        params: cursor ? { cursor, limit: 50 } : { limit: 50 },
      }),
    }),

    clientMarkMessagesAsRead: builder.mutation<ApiResponse<{ count: number }>, string>({
      query: (roomId) => ({
        url: CHAT.CLIENT_MARK_READ(roomId),
        method: 'POST',
      }),
    }),

    clientGetUnreadCount: builder.query<ApiResponse<{ count: number }>, void>({
      query: () => CHAT.CLIENT_UNREAD_COUNT,
    }),

    clientSendMessage: builder.mutation<ApiResponse<ChatMessage>, { roomId: string; content: string }>({
      query: ({ roomId, content }) => ({
        url: CHAT.CLIENT_SEND_MESSAGE(roomId),
        method: 'POST',
        body: { content },
      }),
    }),

    // Agency endpoints
    agencyGetMyRooms: builder.query<ApiResponse<ChatRoom[]>, void>({
      query: () => CHAT.AGENCY_ROOMS,
    }),

    agencyCreateRoom: builder.mutation<ApiResponse<ChatRoom>, { clientUserId: string }>({
      query: ({ clientUserId }) => ({
        url: CHAT.AGENCY_CREATE_ROOM,
        method: 'POST',
        body: { clientUserId },
      }),
    }),

    agencyGetAvailableClients: builder.query<ApiResponse<any[]>, void>({
      query: () => CHAT.AGENCY_CLIENTS,
    }),
  }),
});

export const {
  useWorkerGetOrCreateRoomMutation,
  useGetMyRoomsQuery,
  useGetRoomMessagesQuery,
  useMarkMessagesAsReadMutation,
  useGetChatUnreadCountQuery,
  useSendMessageMutation,
  // Client hooks
  useClientGetMyRoomsQuery,
  useClientCreateRoomMutation,
  useClientGetRoomMessagesQuery,
  useClientMarkMessagesAsReadMutation,
  useClientGetUnreadCountQuery,
  useClientSendMessageMutation,
  // Agency hooks
  useAgencyGetMyRoomsQuery,
  useAgencyCreateRoomMutation,
  useAgencyGetAvailableClientsQuery,
} = chatApi;

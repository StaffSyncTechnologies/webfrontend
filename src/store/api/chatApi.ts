import { baseApi } from './baseApi';
import { CHAT } from '../../services/endpoints';

interface ChatUser {
  id: string;
  fullName: string;
  role: string;
}

export interface ChatAttachment {
  id: string;
  messageId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  duration?: number;
  thumbnailUrl?: string;
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  content: string | null;
  messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  status: 'SENT' | 'DELIVERED' | 'READ';
  createdAt: string;
  readAt: string | null;
  sender: ChatUser;
  attachments: ChatAttachment[];
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

    // HR/Admin: get or create a room with a specific worker
    hrCreateRoom: builder.mutation<ApiResponse<ChatRoom>, { workerId: string }>({
      query: ({ workerId }) => ({
        url: CHAT.ROOMS,
        method: 'POST',
        body: { workerId },
      }),
    }),

    // Get workers assigned to this HR/Admin for chat
    getAssignedChatWorkers: builder.query<ApiResponse<{ id: string; fullName: string; email: string; profilePicUrl: string | null }[]>, void>({
      query: () => CHAT.ASSIGNED_WORKERS,
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
    getChatUnreadCount: builder.query<ApiResponse<{ count: number }>, void>({
      query: () => CHAT.UNREAD_COUNT,
    }),

    // Upload file
    uploadFile: builder.mutation<ApiResponse<ChatAttachment>, FormData>({
      query: (formData) => ({
        url: CHAT.UPLOAD_FILE,
        method: 'POST',
        body: formData,
      }),
    }),

    // Send simple text message
    sendMessage: builder.mutation<
      ApiResponse<ChatMessage>,
      { roomId: string; content: string }
    >({
      query: ({ roomId, content }) => ({
        url: CHAT.SEND_MESSAGE(roomId),
        method: 'POST',
        body: { content, messageType: 'TEXT' },
      }),
    }),

    // Send message with attachments
    sendMessageWithAttachments: builder.mutation<
      ApiResponse<ChatMessage>,
      {
        roomId: string;
        content?: string;
        messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
        attachments: ChatAttachment[];
      }
    >({
      query: ({ roomId, content, messageType, attachments }) => ({
        url: CHAT.SEND_WITH_ATTACHMENTS(roomId),
        method: 'POST',
        body: { content, messageType, attachments },
      }),
    }),
  }),
});

export const {
  useWorkerGetOrCreateRoomMutation,
  useHrCreateRoomMutation,
  useGetAssignedChatWorkersQuery,
  useGetMyRoomsQuery,
  useGetRoomMessagesQuery,
  useMarkMessagesAsReadMutation,
  useGetChatUnreadCountQuery,
  useUploadFileMutation,
  useSendMessageMutation,
  useSendMessageWithAttachmentsMutation,
} = chatApi;

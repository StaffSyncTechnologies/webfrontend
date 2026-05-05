import { createApi } from '@reduxjs/toolkit/query/react';
import { CHAT } from '../../../services/endpoints';
import { baseApi } from '../../api/baseApi';

export interface ChatRoom {
  id: string;
  name?: string;
  type: string;
  hrUserId?: string;
  workerId?: string;
  clientUserId?: string;
  agencyUserId?: string;
  clientCompanyId?: string;
  lastMessageAt?: string;
  createdAt: string;
  hrUser?: { id: string; fullName: string; role: string };
  worker?: { id: string; fullName: string; role: string };
  clientUser?: { id: string; fullName: string; email: string };
  agencyUser?: { id: string; fullName: string; role: string };
  clientCompany?: { id: string; name: string };
  messages?: Message[];
  unreadCount?: number;
}

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderType: string;
  content: string;
  messageType: string;
  status: string;
  readAt: string | null;
  attachments?: any[];
  createdAt: string;
  chatRoom?: any;
}

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRooms: builder.query<{ data: ChatRoom[] }, void>({
      query: () => ({ url: CHAT.ROOMS }),
    }),

    getWorkerRoom: builder.query<ChatRoom, void>({
      query: () => ({ url: CHAT.WORKER_ROOM }),
    }),

    getOrCreateRoom: builder.mutation<ChatRoom, { participantId: string; type?: string }>({
      query: (body) => ({ url: CHAT.GET_OR_CREATE_ROOM, method: 'POST', body }),
    }),

    getMessages: builder.query<{ data: Message[] }, { roomId: string; page?: number; limit?: number }>({
      query: ({ roomId, page = 1, limit = 50 }) => ({
        url: CHAT.MESSAGES(roomId),
        params: { page, limit },
      }),
    }),

    markRoomAsRead: builder.mutation<void, string>({
      query: (roomId) => ({ url: CHAT.MARK_ROOM_READ(roomId), method: 'POST' }),
    }),

    getUnreadCount: builder.query<{ count: number }, void>({
      query: () => ({ url: CHAT.UNREAD_COUNT }),
    }),

    getAssignedWorkers: builder.query<{ data: any[] }, void>({
      query: () => ({ url: CHAT.ASSIGNED_WORKERS }),
    }),

    sendMessage: builder.mutation<Message, { roomId: string; content: string; attachments?: any[] }>({
      query: (body) => ({ url: CHAT.SEND_MESSAGE(body.roomId), method: 'POST', body }),
    }),

    sendWithAttachments: builder.mutation<Message, { roomId: string; content: string; attachments: any[] }>({
      query: (body) => ({ url: CHAT.SEND_WITH_ATTACHMENTS(body.roomId), method: 'POST', body }),
    }),

    uploadFile: builder.mutation<{ url: string }, FormData>({
      query: (formData) => ({ url: CHAT.UPLOAD_FILE, method: 'POST', body: formData }),
    }),

    // Client-Agency chat endpoints
    getClientRooms: builder.query<{ data: ChatRoom[] }, void>({
      query: () => ({ url: CHAT.CLIENT_ROOMS }),
    }),

    createClientRoom: builder.mutation<ChatRoom, any>({
      query: (body) => ({ url: CHAT.CLIENT_CREATE_ROOM, method: 'POST', body }),
    }),

    getClientMessages: builder.query<{ data: Message[] }, { roomId: string; page?: number; limit?: number }>({
      query: ({ roomId, page = 1, limit = 50 }) => ({
        url: CHAT.CLIENT_MESSAGES(roomId),
        params: { page, limit },
      }),
    }),

    markClientRoomAsRead: builder.mutation<void, string>({
      query: (roomId) => ({ url: CHAT.CLIENT_MARK_READ(roomId), method: 'POST' }),
    }),

    getClientUnreadCount: builder.query<{ count: number }, void>({
      query: () => ({ url: CHAT.CLIENT_UNREAD_COUNT }),
    }),

    sendClientMessage: builder.mutation<Message, { roomId: string; content: string }>({
      query: (body) => ({ url: CHAT.CLIENT_SEND_MESSAGE(body.roomId), method: 'POST', body }),
    }),

    // Agency chat endpoints
    getAgencyRooms: builder.query<{ data: ChatRoom[] }, void>({
      query: () => ({ url: CHAT.AGENCY_ROOMS }),
    }),

    createAgencyRoom: builder.mutation<ChatRoom, any>({
      query: (body) => ({ url: CHAT.AGENCY_CREATE_ROOM, method: 'POST', body }),
    }),

    getAgencyClients: builder.query<{ data: any[] }, void>({
      query: () => ({ url: CHAT.AGENCY_CLIENTS }),
    }),

    getAgencyWorkers: builder.query<{ data: any[] }, void>({
      query: () => ({ url: CHAT.AGENCY_WORKERS }),
    }),

    createWorkerRoom: builder.mutation<ChatRoom, { workerId: string }>({
      query: (body) => ({ url: CHAT.WORKER_ROOM, method: 'POST', body }),
    }),
  }),
});

export const {
  useGetRoomsQuery,
  useGetWorkerRoomQuery,
  useGetOrCreateRoomMutation,
  useGetMessagesQuery,
  useMarkRoomAsReadMutation,
  useGetUnreadCountQuery,
  useGetAssignedWorkersQuery,
  useSendMessageMutation,
  useSendWithAttachmentsMutation,
  useUploadFileMutation,
  useGetClientRoomsQuery,
  useCreateClientRoomMutation,
  useGetClientMessagesQuery,
  useMarkClientRoomAsReadMutation,
  useGetClientUnreadCountQuery,
  useSendClientMessageMutation,
  useGetAgencyRoomsQuery,
  useCreateAgencyRoomMutation,
  useGetAgencyClientsQuery,
  useGetAgencyWorkersQuery,
  useCreateWorkerRoomMutation,
} = chatApi;

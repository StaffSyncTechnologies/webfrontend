import { createApi } from '@reduxjs/toolkit/query/react';
import { CHAT } from '../../utilities/endpoint.ts';
import { axiosBaseQuery } from '../../utilities/axiosBaseQuery.ts';
import type { 
  ChatRoom,
  ChatMessage,
  GetOrCreateRoomRequest,
  UnreadCountResponse,
  AssignedWorker,
} from '../../types/api.ts';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: axiosBaseQuery({
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.authorization = `Bearer ${token}`;
      }
      return headers;
    },
  }),
  tagTypes: ['ChatRoom', 'ChatMessage', 'UnreadCount'],
  endpoints: (builder) => ({
    // Get my chat rooms
    getMyRooms: builder.query<ChatRoom[], void>({
      query: () => ({
        url: CHAT.ROOMS,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<ChatRoom[]>) => response.data,
      providesTags: ['ChatRoom'],
    }),
    
    // Get or create a room (HR initiates chat with worker)
    getOrCreateRoom: builder.mutation<ChatRoom, GetOrCreateRoomRequest>({
      query: (request) => ({
        url: CHAT.GET_OR_CREATE_ROOM,
        method: 'POST',
        body: request,
      }),
      transformResponse: (response: ApiResponse<ChatRoom>) => response.data,
      invalidatesTags: ['ChatRoom'],
    }),
    
    // Get room messages
    getRoomMessages: builder.query<ChatMessage[], { roomId: string; cursor?: string }>({
      query: ({ roomId, cursor }) => ({
        url: CHAT.ROOM_MESSAGES(roomId),
        method: 'GET',
        params: cursor ? { cursor, limit: 50 } : { limit: 50 },
      }),
      transformResponse: (response: ApiResponse<ChatMessage[]>) => response.data,
      providesTags: (_result, _error, { roomId }) => [
        { type: 'ChatMessage', id: roomId },
        'ChatMessage',
      ],
    }),
    
    // Mark room as read
    markRoomAsRead: builder.mutation<void, string>({
      query: (roomId) => ({
        url: CHAT.MARK_ROOM_READ(roomId),
        method: 'POST',
      }),
      invalidatesTags: ['UnreadCount', 'ChatRoom'],
      onQueryStarted: async (roomId, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          dispatch(
            chatApi.util.updateQueryData('getMyRooms', undefined, (draft) => {
              const room = draft.find((r: ChatRoom) => r.id === roomId);
              if (room) {
                room.unreadCount = 0;
              }
            })
          );
        } catch {
          // silent
        }
      },
    }),
    
    // Get unread count
    getUnreadCount: builder.query<UnreadCountResponse, void>({
      query: () => ({
        url: CHAT.UNREAD_COUNT,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<UnreadCountResponse>) => response.data,
      providesTags: ['UnreadCount'],
    }),
    
    // Get assigned workers for chat
    getAssignedWorkers: builder.query<AssignedWorker[], void>({
      query: () => ({
        url: CHAT.ASSIGNED_WORKERS,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<AssignedWorker[]>) => response.data,
    }),
  }),
});

export const {
  useGetMyRoomsQuery,
  useGetOrCreateRoomMutation,
  useGetRoomMessagesQuery,
  useMarkRoomAsReadMutation,
  useGetUnreadCountQuery,
  useGetAssignedWorkersQuery,
} = chatApi;

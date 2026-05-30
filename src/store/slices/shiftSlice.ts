import { createApi } from '@reduxjs/toolkit/query/react';
import { SHIFTS } from '../../utilities/endpoint';
import { axiosBaseQuery } from '../../utilities/axiosBaseQuery';
import type { Shift, ShiftAssignment } from '../../types/api';

export const shiftApi = createApi({
  reducerPath: 'shiftApi',
  baseQuery: axiosBaseQuery({
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.authorization = `Bearer ${token}`;
      }
      return headers;
    },
  }),
  tagTypes: ['Shift', 'ShiftAssignment'],
  endpoints: (builder) => ({
    getShifts: builder.query<Shift[], { status?: string; clientId?: string }>({
      query: (params) => ({ url: SHIFTS.LIST, params }),
      transformResponse: (response: any) => response.data ?? response ?? [],
      providesTags: ['Shift'],
    }),
    createShift: builder.mutation<Shift, Partial<Shift>>({
      query: (shift) => ({ url: SHIFTS.CREATE, method: 'POST', body: shift }),
      invalidatesTags: ['Shift'],
    }),
    getMyShiftHistory: builder.query<Shift[], void>({
      query: () => ({ url: SHIFTS.MY_HISTORY }),
      providesTags: ['Shift'],
    }),
    getStaffShiftHistory: builder.query<Shift[], { staffId?: string }>({
      query: (params) => ({ url: SHIFTS.STAFF_HISTORY, params }),
      providesTags: ['Shift'],
    }),
    getShiftDetail: builder.query<Shift, string>({
      query: (shiftId) => ({ url: SHIFTS.DETAIL(shiftId) }),
      transformResponse: (response: any) => response.data ?? response,
      providesTags: ['Shift'],
    }),
    updateShift: builder.mutation<Shift, { shiftId: string; updates: Partial<Shift> }>({
      query: ({ shiftId, updates }) => ({
        url: SHIFTS.UPDATE(shiftId),
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Shift'],
    }),
    deleteShift: builder.mutation<void, string>({
      query: (shiftId) => ({ url: SHIFTS.DELETE(shiftId), method: 'DELETE' }),
      invalidatesTags: ['Shift'],
    }),
    getShiftAssignments: builder.query<ShiftAssignment[], string>({
      query: (shiftId) => ({ url: SHIFTS.ASSIGNMENTS(shiftId) }),
      transformResponse: (response: any) => response.data ?? response ?? [],
      providesTags: ['ShiftAssignment'],
    }),
    assignWorkers: builder.mutation<{ count: number }, { shiftId: string; workerIds: string[] }>({
      query: ({ shiftId, workerIds }) => ({
        url: SHIFTS.ASSIGNMENTS(shiftId),
        method: 'POST',
        body: { workerIds },
      }),
      invalidatesTags: ['Shift', 'ShiftAssignment'],
    }),
    removeAssignment: builder.mutation<void, { shiftId: string; assignmentId: string }>({
      query: ({ shiftId, assignmentId }) => ({
        url: SHIFTS.ASSIGNMENT(shiftId, assignmentId),
        method: 'DELETE',
      }),
      invalidatesTags: ['Shift', 'ShiftAssignment'],
    }),
    acceptShift: builder.mutation<void, string>({
      query: (shiftId) => ({ url: SHIFTS.ACCEPT(shiftId), method: 'POST' }),
      invalidatesTags: ['Shift'],
    }),
    declineShift: builder.mutation<void, string>({
      query: (shiftId) => ({ url: SHIFTS.DECLINE(shiftId), method: 'POST' }),
      invalidatesTags: ['Shift'],
    }),
    clockInShift: builder.mutation<any, { shiftId: string; location?: { lat: number; lng: number } }>({
      query: ({ shiftId, location }) => ({
        url: SHIFTS.CLOCK_IN(shiftId),
        method: 'POST',
        body: { location },
      }),
      invalidatesTags: ['Shift'],
    }),
    clockOutShift: builder.mutation<any, { shiftId: string; location?: { lat: number; lng: number } }>({
      query: ({ shiftId, location }) => ({
        url: SHIFTS.CLOCK_OUT(shiftId),
        method: 'POST',
        body: { location },
      }),
      invalidatesTags: ['Shift'],
    }),
    broadcastShift: builder.mutation<any, { shiftId: string; message?: string }>({
      query: ({ shiftId, message }) => ({
        url: SHIFTS.BROADCAST(shiftId),
        method: 'POST',
        body: { message },
      }),
      invalidatesTags: ['Shift'],
    }),
    cancelShift: builder.mutation<void, string>({
      query: (shiftId) => ({ url: SHIFTS.CANCEL(shiftId), method: 'POST' }),
      invalidatesTags: ['Shift'],
    }),
  }),
});

export const {
  useGetShiftsQuery,
  useCreateShiftMutation,
  useGetMyShiftHistoryQuery,
  useGetStaffShiftHistoryQuery,
  useGetShiftDetailQuery,
  useUpdateShiftMutation,
  useDeleteShiftMutation,
  useGetShiftAssignmentsQuery,
  useAssignWorkersMutation,
  useRemoveAssignmentMutation,
  useAcceptShiftMutation,
  useDeclineShiftMutation,
  useClockInShiftMutation,
  useClockOutShiftMutation,
  useBroadcastShiftMutation,
  useCancelShiftMutation,
} = shiftApi;

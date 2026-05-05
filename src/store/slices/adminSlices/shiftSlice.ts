import { createApi } from '@reduxjs/toolkit/query/react';
import { SHIFTS } from '../../../services/endpoints';
import { baseApi } from '../../api/baseApi';

export interface Shift {
  id: string;
  shiftCode: string;
  title: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  status: string;
  requiredWorkers: number;
  assignedWorkers: number;
  hourlyRate: number;
  client: {
    id: string;
    name: string;
  };
}

export const shiftApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShifts: builder.query<{ data: Shift[] }, { status?: string; dateFrom?: string; dateTo?: string }>({
      query: (params) => ({ url: SHIFTS.LIST, params }),
    }),

    getShiftHistory: builder.query<{ data: Shift[] }, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => ({
        url: SHIFTS.MY_HISTORY,
        params: { page, limit },
      }),
    }),

    getStaffHistory: builder.query<{ data: Shift[] }, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => ({
        url: SHIFTS.STAFF_HISTORY,
        params: { page, limit },
      }),
    }),

    getOpenShifts: builder.query<{ data: Shift[] }, void>({
      query: () => ({ url: SHIFTS.OPEN }),
    }),

    getShiftById: builder.query<Shift, string>({
      query: (shiftId) => ({ url: SHIFTS.GET_BY_ID(shiftId) }),
    }),

    createShift: builder.mutation<Shift, Partial<Shift>>({
      query: (body) => ({ url: SHIFTS.CREATE, method: 'POST', body }),
    }),

    updateShift: builder.mutation<Shift, { shiftId: string; updates: Partial<Shift> }>({
      query: ({ shiftId, updates }) => ({
        url: SHIFTS.UPDATE(shiftId),
        method: 'PUT',
        body: updates,
      }),
    }),

    deleteShift: builder.mutation<void, string>({
      query: (shiftId) => ({ url: SHIFTS.DELETE(shiftId), method: 'DELETE' }),
    }),

    acceptShift: builder.mutation<void, string>({
      query: (shiftId) => ({ url: SHIFTS.ACCEPT(shiftId), method: 'POST' }),
    }),

    declineShift: builder.mutation<void, string>({
      query: (shiftId) => ({ url: SHIFTS.DECLINE(shiftId), method: 'POST' }),
    }),

    claimShift: builder.mutation<void, string>({
      query: (shiftId) => ({ url: SHIFTS.CLAIM(shiftId), method: 'POST' }),
    }),

    clockInShift: builder.mutation<void, string>({
      query: (shiftId) => ({ url: SHIFTS.CLOCK_IN(shiftId), method: 'POST' }),
    }),

    clockOutShift: builder.mutation<void, string>({
      query: (shiftId) => ({ url: SHIFTS.CLOCK_OUT(shiftId), method: 'POST' }),
    }),

    getShiftAssignments: builder.query<any[], string>({
      query: (shiftId) => ({ url: SHIFTS.ASSIGNMENTS(shiftId) }),
    }),

    broadcastShift: builder.mutation<void, string>({
      query: (shiftId) => ({ url: SHIFTS.BROADCAST(shiftId), method: 'POST' }),
    }),

    cancelShift: builder.mutation<void, string>({
      query: (shiftId) => ({ url: SHIFTS.CANCEL(shiftId), method: 'POST' }),
    }),

    assignWorkers: builder.mutation<void, { shiftId: string; workerIds: string[] }>({
      query: ({ shiftId, workerIds }) => ({
        url: SHIFTS.ASSIGNMENTS(shiftId),
        method: 'POST',
        body: { workerIds },
      }),
    }),
  }),
});

export const {
  useGetShiftsQuery,
  useGetShiftHistoryQuery,
  useGetStaffHistoryQuery,
  useGetOpenShiftsQuery,
  useGetShiftByIdQuery,
  useCreateShiftMutation,
  useUpdateShiftMutation,
  useDeleteShiftMutation,
  useAcceptShiftMutation,
  useDeclineShiftMutation,
  useClaimShiftMutation,
  useClockInShiftMutation,
  useClockOutShiftMutation,
  useGetShiftAssignmentsQuery,
  useBroadcastShiftMutation,
  useCancelShiftMutation,
  useAssignWorkersMutation,
} = shiftApi;

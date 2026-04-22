import { createApi } from '@reduxjs/toolkit/query/react';
import { RECURRING_SCHEDULES } from '../../services/endpoints';
import { axiosBaseQuery } from '../../utilities/axiosBaseQuery';

// Types
export interface RecurringSchedule {
  id: string;
  workerId: string;
  worker: { id: string; fullName: string; profilePicUrl?: string | null };
  title: string;
  role?: string;
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'PAUSED' | 'ENDED';
  startDate: string;
  endDate?: string | null;
  payRate?: number | null;
  breakMinutes: number;
  days: ScheduleDay[];
  generatedUpTo?: string | null;
  clientCompany?: { id: string; name: string };
  location?: { id: string; name: string };
  createdAt: string;
  creator?: { id: string; fullName: string };
  approver?: { id: string; fullName: string };
}

export interface ScheduleDay {
  dayOfWeek: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  startTime: string;
  endTime: string;
  breakMinutes?: number;
}

export interface ScheduleChangeRequest {
  id: string;
  workerId: string;
  worker: { id: string; fullName: string; profilePicUrl?: string | null };
  requestType: 'NEW' | 'MODIFY' | 'PAUSE' | 'END';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
  createdAt: string;
  workerNote?: string;
  proposedDays: ScheduleDay[];
  proposedStartDate: string;
  proposedEndDate?: string | null;
  proposedRole?: string;
  recurringSchedule?: { id: string; title: string };
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
}

export interface CreateScheduleData {
  workerId: string;
  title: string;
  clientCompanyId?: string;
  locationId?: string;
  role?: string;
  payRate?: number;
  breakMinutes?: number;
  startDate: string;
  endDate?: string;
  days: ScheduleDay[];
  notes?: string;
}

export interface CreateRequestData {
  title?: string;
  clientCompanyId?: string;
  role?: string;
  startDate: string;
  endDate?: string;
  days: ScheduleDay[];
  workerNote?: string;
}

export const recurringScheduleApi = createApi({
  reducerPath: 'recurringScheduleApi',
  baseQuery: axiosBaseQuery({
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.authorization = `Bearer ${token}`;
      }
      return headers;
    },
  }),
  tagTypes: ['RecurringSchedule', 'ScheduleChangeRequest'],
  endpoints: (builder) => ({
    // List all schedules
    listSchedules: builder.query<RecurringSchedule[], {
      workerId?: string;
      clientCompanyId?: string;
      locationId?: string;
      status?: string;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({ url: RECURRING_SCHEDULES.LIST, params }),
      transformResponse: (response: any) => response.schedules ?? response.data ?? response ?? [],
      providesTags: ['RecurringSchedule'],
    }),

    // Get single schedule
    getSchedule: builder.query<RecurringSchedule, string>({
      query: (id) => ({ url: RECURRING_SCHEDULES.GET_BY_ID(id) }),
      transformResponse: (response: any) => response.data ?? response,
      providesTags: (result, error, id) => [{ type: 'RecurringSchedule', id }],
    }),

    // Create schedule
    createSchedule: builder.mutation<RecurringSchedule, CreateScheduleData>({
      query: (data) => ({ url: RECURRING_SCHEDULES.CREATE, method: 'POST', body: data }),
      invalidatesTags: ['RecurringSchedule'],
    }),

    // Update schedule
    updateSchedule: builder.mutation<RecurringSchedule, { id: string; data: Partial<CreateScheduleData> }>({
      query: ({ id, data }) => ({ url: RECURRING_SCHEDULES.UPDATE(id), method: 'PUT', body: data }),
      invalidatesTags: ['RecurringSchedule'],
    }),

    // Pause schedule
    pauseSchedule: builder.mutation<RecurringSchedule, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({ url: RECURRING_SCHEDULES.PAUSE(id), method: 'POST', body: { reason } }),
      invalidatesTags: ['RecurringSchedule'],
    }),

    // Resume schedule
    resumeSchedule: builder.mutation<RecurringSchedule, string>({
      query: (id) => ({ url: RECURRING_SCHEDULES.RESUME(id), method: 'POST' }),
      invalidatesTags: ['RecurringSchedule'],
    }),

    // End schedule
    endSchedule: builder.mutation<RecurringSchedule, { id: string; endDate: string; reason?: string }>({
      query: ({ id, endDate, reason }) => ({ url: RECURRING_SCHEDULES.END(id), method: 'POST', body: { endDate, reason } }),
      invalidatesTags: ['RecurringSchedule'],
    }),

    // Delete schedule
    deleteSchedule: builder.mutation<void, string>({
      query: (id) => ({ url: RECURRING_SCHEDULES.DELETE(id), method: 'DELETE' }),
      invalidatesTags: ['RecurringSchedule'],
    }),

    // List schedule change requests
    listRequests: builder.query<ScheduleChangeRequest[], {
      status?: string;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({ url: RECURRING_SCHEDULES.LIST_REQUESTS, params }),
      transformResponse: (response: any) => response.requests ?? response.data ?? response ?? [],
      providesTags: ['ScheduleChangeRequest'],
    }),

    // Approve request
    approveRequest: builder.mutation<any, { requestId: string; note?: string }>({
      query: ({ requestId, note }) => ({ url: RECURRING_SCHEDULES.APPROVE_REQUEST(requestId), method: 'POST', body: { note } }),
      invalidatesTags: ['RecurringSchedule', 'ScheduleChangeRequest'],
    }),

    // Reject request
    rejectRequest: builder.mutation<any, { requestId: string; note?: string }>({
      query: ({ requestId, note }) => ({ url: RECURRING_SCHEDULES.REJECT_REQUEST(requestId), method: 'POST', body: { note } }),
      invalidatesTags: ['ScheduleChangeRequest'],
    }),

    // Manually generate shifts
    generateShifts: builder.mutation<any, { id: string; upToDate: string }>({
      query: ({ id, upToDate }) => ({ url: RECURRING_SCHEDULES.GENERATE(id), method: 'POST', body: { upToDate } }),
      invalidatesTags: ['RecurringSchedule'],
    }),

    // Worker: List my schedules
    listMySchedules: builder.query<RecurringSchedule[], void>({
      query: () => ({ url: RECURRING_SCHEDULES.MY_LIST }),
      transformResponse: (response: any) => response.schedules ?? response.data ?? response ?? [],
      providesTags: ['RecurringSchedule'],
    }),

    // Worker: Create schedule request
    createRequest: builder.mutation<ScheduleChangeRequest, CreateRequestData>({
      query: (data) => ({ url: RECURRING_SCHEDULES.CREATE_REQUEST, method: 'POST', body: data }),
      invalidatesTags: ['ScheduleChangeRequest'],
    }),
  }),
});

export const {
  useListSchedulesQuery,
  useGetScheduleQuery,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  usePauseScheduleMutation,
  useResumeScheduleMutation,
  useEndScheduleMutation,
  useDeleteScheduleMutation,
  useListRequestsQuery,
  useApproveRequestMutation,
  useRejectRequestMutation,
  useGenerateShiftsMutation,
  useListMySchedulesQuery,
  useCreateRequestMutation,
} = recurringScheduleApi;

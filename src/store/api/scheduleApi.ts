import { baseApi } from './baseApi';

export interface AdminScheduleDay {
  id: string;
  recurringScheduleId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
}

export interface AdminSchedule {
  id: string;
  organizationId: string;
  workerId: string;
  clientCompanyId: string | null;
  locationId: string | null;
  title: string;
  role: string | null;
  payRate: number | null;
  breakMinutes: number;
  startDate: string;
  endDate: string | null;
  status: 'ACTIVE' | 'PAUSED' | 'ENDED' | 'PENDING_APPROVAL';
  notes: string | null;
  createdAt: string;
  createdBy: string;
  approvedBy: string | null;
  approvedAt: string | null;
  generatedUpTo: string | null;
  worker: {
    id: string;
    fullName: string;
    email: string;
    profilePicUrl: string | null;
  };
  days: AdminScheduleDay[];
  clientCompany: {
    id: string;
    name: string;
  } | null;
  location: {
    id: string;
    name: string;
  } | null;
  creator: {
    id: string;
    fullName: string;
  };
  isOnHoliday?: boolean;
  holidayInfo?: {
    workerId: string;
    startDate: string;
    endDate: string;
    title: string;
    status: string;
  };
}

export interface AdminScheduleRequest {
  id: string;
  organizationId: string;
  workerId: string;
  recurringScheduleId: string | null;
  requestType: 'NEW' | 'MODIFY';
  proposedDays: any[];
  proposedStartDate: string | null;
  proposedEndDate: string | null;
  workerNote: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
  worker: {
    id: string;
    fullName: string;
    profilePicUrl: string | null;
  };
  recurringSchedule: {
    id: string;
    title: string;
  } | null;
}

export const scheduleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // List all recurring schedules (admin)
    listSchedules: builder.query<{
      data: {
        schedules: AdminSchedule[];
        pagination: { page: number; limit: number; total: number; pages: number };
      };
      message: string;
      success: boolean;
    }, { workerId?: string; clientCompanyId?: string; status?: string; page?: number; limit?: number }>({
      query: (params) => ({
        url: '/recurring-schedules',
        params,
      }),
      providesTags: ['RecurringSchedules'],
    }),

    // Get single schedule
    getSchedule: builder.query<AdminSchedule, string>({
      query: (id) => `/recurring-schedules/${id}`,
      providesTags: (result, error, id) => [{ type: 'RecurringSchedules', id }],
    }),

    // Create schedule (supports multiple workers)
    createSchedule: builder.mutation<AdminSchedule[], {
      workerId?: string;
      workerIds?: string[];
      title: string;
      clientCompanyId?: string;
      locationId?: string;
      role?: string;
      payRate?: number;
      breakMinutes?: number;
      startDate: string;
      endDate?: string;
      days: { dayOfWeek: string; startTime: string; endTime: string; breakMinutes?: number }[];
      notes?: string;
    }>({
      query: (data) => ({
        url: '/recurring-schedules',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['RecurringSchedules'],
    }),

    // Update schedule
    updateSchedule: builder.mutation<AdminSchedule, {
      id: string;
      workerId?: string;
      title?: string;
      clientCompanyId?: string;
      locationId?: string;
      role?: string;
      payRate?: number;
      breakMinutes?: number;
      startDate?: string;
      endDate?: string;
      days?: { dayOfWeek: string; startTime: string; endTime: string; breakMinutes?: number }[];
      notes?: string;
    }>({
      query: (data) => ({
        url: `/recurring-schedules/${data.id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'RecurringSchedules',
        { type: 'RecurringSchedules', id },
      ],
    }),

    // Pause schedule
    pauseSchedule: builder.mutation<AdminSchedule, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/recurring-schedules/${id}/pause`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        'RecurringSchedules',
        { type: 'RecurringSchedules', id },
      ],
    }),

    // Resume schedule
    resumeSchedule: builder.mutation<AdminSchedule, string>({
      query: (id) => ({
        url: `/recurring-schedules/${id}/resume`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        'RecurringSchedules',
        { type: 'RecurringSchedules', id },
      ],
    }),

    // End schedule
    endSchedule: builder.mutation<AdminSchedule, { id: string; endDate: string; reason?: string }>({
      query: ({ id, endDate, reason }) => ({
        url: `/recurring-schedules/${id}/end`,
        method: 'POST',
        body: { endDate, reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        'RecurringSchedules',
        { type: 'RecurringSchedules', id },
      ],
    }),

    // Delete schedule
    deleteSchedule: builder.mutation<void, string>({
      query: (id) => ({
        url: `/recurring-schedules/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RecurringSchedules'],
    }),

    // List schedule change requests (admin)
    listScheduleRequests: builder.query<{
      data: {
        requests: AdminScheduleRequest[];
        pagination: { page: number; limit: number; total: number; pages: number };
      };
      message: string;
      success: boolean;
    }, { status?: string; page?: number; limit?: number }>({
      query: (params) => ({
        url: '/recurring-schedules/requests/list',
        params,
      }),
      providesTags: ['ScheduleChangeRequests'],
    }),

    // Approve schedule request
    approveScheduleRequest: builder.mutation<any, { requestId: string; note?: string }>({
      query: ({ requestId, note }) => ({
        url: `/recurring-schedules/requests/${requestId}/approve`,
        method: 'POST',
        body: { note },
      }),
      invalidatesTags: ['ScheduleChangeRequests', 'RecurringSchedules'],
    }),

    // Reject schedule request
    rejectScheduleRequest: builder.mutation<any, { requestId: string; note?: string }>({
      query: ({ requestId, note }) => ({
        url: `/recurring-schedules/requests/${requestId}/reject`,
        method: 'POST',
        body: { note },
      }),
      invalidatesTags: ['ScheduleChangeRequests'],
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
  useListScheduleRequestsQuery,
  useApproveScheduleRequestMutation,
  useRejectScheduleRequestMutation,
} = scheduleApi;

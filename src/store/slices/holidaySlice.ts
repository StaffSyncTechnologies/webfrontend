import { createApi } from '@reduxjs/toolkit/query/react';
import { HOLIDAY } from '../../utilities/endpoint';
import { axiosBaseQuery } from '../../utilities/axiosBaseQuery';

// Types
export interface LeaveRequest {
  id: string;
  workerId: string;
  worker?: {
    id: string;
    fullName: string;
    email: string;
  };
  leaveType: 'ANNUAL' | 'SICK' | 'UNPAID' | 'COMPASSIONATE' | 'MATERNITY' | 'PATERNITY' | 'OTHER';
  title: string;
  startDate: string;
  endDate: string;
  days: number;
  hours: number;
  status: 'PENDING' | 'APPROVED' | 'DENIED' | 'CANCELLED';
  reason?: string;
  reviewNote?: string;
  reviewedAt?: string;
  reviewer?: {
    id: string;
    fullName: string;
  };
  createdAt: string;
}

export interface HolidaySummary {
  contractedHoursPerWeek: number;
  totalHours: number;
  usedHours: number;
  remainingHours: number;
  totalDays: number;
  usedDays: number;
  daysLeft: number;
  carryOverHours: number;
  carryOverDays: number;
  year: number;
}

export interface HolidayListResponse {
  summary: HolidaySummary;
  upcomingHolidays: LeaveRequest[];
  holidayRequests: LeaveRequest[];
}

export interface AdminLeaveRequestsResponse {
  requests: LeaveRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    pending: number;
    approved: number;
    denied: number;
  };
}

export interface AdminLeaveRequestsParams {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'APPROVED' | 'DENIED' | 'CANCELLED';
  leaveType?: string;
  workerId?: string;
}

export interface CreateLeaveRequest {
  leaveType: 'ANNUAL' | 'SICK' | 'UNPAID' | 'COMPASSIONATE' | 'MATERNITY' | 'PATERNITY' | 'OTHER';
  title: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface ReviewLeaveRequest {
  id: string;
  status: 'APPROVED' | 'DENIED';
  reviewNote?: string;
}

export const holidayApi = createApi({
  reducerPath: 'holidayApi',
  baseQuery: axiosBaseQuery({
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.authorization = `Bearer ${token}`;
      }
      return headers;
    },
  }),
  tagTypes: ['Holiday', 'LeaveRequest'],
  endpoints: (builder) => ({
    // Get worker's holiday list and summary
    getHolidays: builder.query<HolidayListResponse, void>({
      query: () => ({
        url: HOLIDAY.LIST,
        method: 'GET',
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ['Holiday'],
    }),

    // Get entitlement details
    getEntitlement: builder.query<HolidaySummary, void>({
      query: () => ({
        url: HOLIDAY.ENTITLEMENT,
        method: 'GET',
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ['Holiday'],
    }),

    // Create leave request
    createLeaveRequest: builder.mutation<LeaveRequest, CreateLeaveRequest>({
      query: (body) => ({
        url: HOLIDAY.CREATE,
        method: 'POST',
        data: body,
      }),
      transformResponse: (response: any) => response?.data ?? response,
      invalidatesTags: ['Holiday', 'LeaveRequest'],
    }),

    // Get leave request detail
    getLeaveRequestDetail: builder.query<LeaveRequest, string>({
      query: (id) => ({
        url: HOLIDAY.DETAIL(id),
        method: 'GET',
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: (_result, _error, id) => [{ type: 'LeaveRequest', id }],
    }),

    // Cancel leave request
    cancelLeaveRequest: builder.mutation<void, string>({
      query: (id) => ({
        url: HOLIDAY.CANCEL(id),
        method: 'POST',
      }),
      invalidatesTags: ['Holiday', 'LeaveRequest'],
    }),

    // Admin: Get all leave requests
    getAdminLeaveRequests: builder.query<AdminLeaveRequestsResponse, AdminLeaveRequestsParams>({
      query: (params = {}) => ({
        url: HOLIDAY.ADMIN_REQUESTS,
        method: 'GET',
        params,
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ['LeaveRequest'],
    }),

    // Admin: Grant leave to worker
    grantLeave: builder.mutation<void, { workerId: string; leaveType: string; title: string; startDate: string; endDate: string; reason?: string }>({
      query: (body) => ({
        url: HOLIDAY.GRANT,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Holiday', 'LeaveRequest'],
    }),

    // Admin: Review leave request (approve/deny)
    reviewLeaveRequest: builder.mutation<void, ReviewLeaveRequest>({
      query: ({ id, ...body }) => ({
        url: HOLIDAY.REVIEW(id),
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Holiday', 'LeaveRequest'],
    }),

    // Admin: Update worker entitlement
    updateEntitlement: builder.mutation<void, { workerId: string; totalHours?: number; carryOverHours?: number }>({
      query: ({ workerId, ...body }) => ({
        url: HOLIDAY.UPDATE_ENTITLEMENT(workerId),
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Holiday'],
    }),
  }),
});

export const {
  useGetHolidaysQuery,
  useGetEntitlementQuery,
  useCreateLeaveRequestMutation,
  useGetLeaveRequestDetailQuery,
  useCancelLeaveRequestMutation,
  useGetAdminLeaveRequestsQuery,
  useGrantLeaveMutation,
  useReviewLeaveRequestMutation,
  useUpdateEntitlementMutation,
} = holidayApi;

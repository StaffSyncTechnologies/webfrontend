import { createApi } from '@reduxjs/toolkit/query/react';
import { HOLIDAYS } from '../../../services/endpoints';
import { baseApi } from '../../api/baseApi';

export interface Holiday {
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

export interface AdminLeaveRequestsResponse {
  requests: Holiday[];
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

export const holidayApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getMyRequests: builder.query<{ data: Holiday[] }, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => ({
        url: HOLIDAYS.MY_REQUESTS,
        params: { page, limit },
      }),
    }),

    getAdminRequests: builder.query<AdminLeaveRequestsResponse, { status?: string; page?: number; limit?: number }>({
      query: ({ status, page = 1, limit = 50 }) => ({
        url: HOLIDAYS.ADMIN_REQUESTS,
        params: { status, page, limit },
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ['HolidayRequests'] as any,
    }),

    getEntitlement: builder.query<HolidaySummary, void>({
      query: () => ({ url: '/holidays/entitlement' }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ['HolidayEntitlement'] as any,
    }),

    requestHoliday: builder.mutation<Holiday, { startDate: string; endDate: string; reason: string }>({
      query: (body) => ({ url: HOLIDAYS.REQUEST, method: 'POST', body }),
    }),

    reviewLeaveRequest: builder.mutation<Holiday, { id: string; status: 'APPROVED' | 'DENIED'; reviewNote?: string }>({
      query: ({ id, ...body }) => ({
        url: `/holidays/${id}/review`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response?.data ?? response,
      invalidatesTags: ['HolidayRequests'] as any,
    }),

    getHolidayDetail: builder.query<Holiday, string>({
      query: (requestId) => ({ url: HOLIDAYS.DETAIL(requestId) }),
    }),

    cancelHoliday: builder.mutation<void, string>({
      query: (requestId) => ({ url: HOLIDAYS.CANCEL(requestId), method: 'POST' }),
    }),
  }),
});

export const {
  useGetMyRequestsQuery,
  useGetAdminRequestsQuery,
  useGetEntitlementQuery,
  useRequestHolidayMutation,
  useReviewLeaveRequestMutation,
  useGetHolidayDetailQuery,
  useCancelHolidayMutation,
} = holidayApi;

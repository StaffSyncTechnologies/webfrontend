import { createApi } from '@reduxjs/toolkit/query/react';
import { ATTENDANCE } from '../../../services/endpoints';
import { baseApi } from '../../api/baseApi';

export interface Attendance {
  id: string;
  worker: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string | null;
  };
  client: { id: string; companyName: string } | null;
  shiftTitle: string;
  clockInAt: string;
  clockOutAt: string | null;
  date: string | null;
  shiftTime: {
    scheduled: { start: string | null; end: string | null };
    actual: { start: string | null; end: string | null };
  };
  duration: string | null;
  durationHours: number;
  status: string;
  flagReason: string | null;
  geofenceValid: boolean | null;
}

export interface TimesheetStats {
  total: { count: number; change: number };
  approved: { count: number; change: number };
  pending: { count: number; change: number };
  flagged: { count: number; change: number };
  rejected: { count: number; change: number };
  period?: {
    start: string;
    end: string;
  };
}

export const attendanceApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getMyStatus: builder.query<any, void>({
      query: () => ({ url: ATTENDANCE.MY_STATUS }),
    }),

    getMyHistory: builder.query<{ data: Attendance[] }, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => ({
        url: ATTENDANCE.MY_HISTORY,
        params: { page, limit },
      }),
    }),

    getMyTimesheet: builder.query<any, void>({
      query: () => ({ url: ATTENDANCE.MY_TIMESHEET }),
    }),

    getFlagged: builder.query<{ data: Attendance[] }, void>({
      query: () => ({ url: ATTENDANCE.FLAGGED }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ['AttendanceFlag'] as any,
    }),

    getDailyTimesheet: builder.query<any, { date?: string }>({
      query: ({ date }) => ({ url: ATTENDANCE.DAILY_TIMESHEET, params: { date } }),
    }),

    getWorkerTimesheet: builder.query<any, string>({
      query: (workerId) => ({ url: ATTENDANCE.WORKER_TIMESHEET(workerId) }),
    }),

    getShiftAttendance: builder.query<{ data: Attendance[] }, string>({
      query: (shiftId) => ({ url: ATTENDANCE.SHIFT_ATTENDANCE(shiftId) }),
    }),

    // Admin timesheet endpoints
    getTimesheetStats: builder.query<TimesheetStats, void>({
      query: () => ({ url: '/attendance/timesheet/stats' }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ['TimesheetStats'] as any,
    }),

    getTimesheetList: builder.query<{ timesheets: Attendance[]; pagination: any }, { status?: string; page?: number; limit?: number }>({
      query: ({ status, page = 1, limit = 50 }) => ({
        url: '/attendance/timesheet/list',
        params: { status, page, limit },
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ['TimesheetList'] as any,
    }),

    clockIn: builder.mutation<Attendance, string>({
      query: (shiftId) => ({ url: ATTENDANCE.CLOCK_IN(shiftId), method: 'POST' }),
    }),

    clockOut: builder.mutation<Attendance, string>({
      query: (shiftId) => ({ url: ATTENDANCE.CLOCK_OUT(shiftId), method: 'POST' }),
    }),

    approveAttendance: builder.mutation<Attendance, string>({
      query: (attendanceId) => ({ url: ATTENDANCE.APPROVE(attendanceId), method: 'POST' }),
      transformResponse: (response: any) => response?.data ?? response,
      invalidatesTags: ['TimesheetList', 'TimesheetStats'] as any,
    }),

    flagAttendance: builder.mutation<Attendance, { attendanceId: string; reason: string; note?: string }>({
      query: ({ attendanceId, reason, note }) => ({
        url: ATTENDANCE.FLAG(attendanceId),
        method: 'POST',
        body: { reason, note },
      }),
      transformResponse: (response: any) => response?.data ?? response,
      invalidatesTags: ['TimesheetList', 'TimesheetStats'] as any,
    }),

    getTimesheetDetail: builder.query<any, string>({
      query: (attendanceId) => ({ url: `/attendance/timesheet/${attendanceId}` }),
      transformResponse: (response: any) => response?.data ?? response,
    }),

    getOngoingShifts: builder.query<any[], void>({
      query: () => ({ url: ATTENDANCE.ONGOING_SHIFTS }),
    }),

    adminClockOut: builder.mutation<void, string>({
      query: (attendanceId) => ({ url: ATTENDANCE.ADMIN_CLOCK_OUT(attendanceId), method: 'POST' }),
    }),
  }),
});

export const {
  useGetMyStatusQuery,
  useGetMyHistoryQuery,
  useGetMyTimesheetQuery,
  useGetFlaggedQuery,
  useGetDailyTimesheetQuery,
  useGetWorkerTimesheetQuery,
  useGetShiftAttendanceQuery,
  useGetTimesheetStatsQuery,
  useGetTimesheetListQuery,
  useClockInMutation,
  useClockOutMutation,
  useApproveAttendanceMutation,
  useFlagAttendanceMutation,
  useGetTimesheetDetailQuery,
  useGetOngoingShiftsQuery,
  useAdminClockOutMutation,
} = attendanceApi;

import { createApi } from '@reduxjs/toolkit/query/react';
import { ATTENDANCE } from '../../utilities/endpoint';
import { axiosBaseQuery } from '../../utilities/axiosBaseQuery';
import type { Attendance, AttendanceFlag } from '../../types/api';

export const attendanceApi = createApi({
  reducerPath: 'attendanceApi',
  baseQuery: axiosBaseQuery({
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.authorization = `Bearer ${token}`;
      }
      return headers;
    },
  }),
  tagTypes: ['Attendance', 'AttendanceFlag'],
  endpoints: (builder) => ({
    getMyStatus: builder.query<any, void>({
      query: () => ({ url: ATTENDANCE.MY_STATUS }),
      providesTags: ['Attendance'],
    }),
    getMyHistory: builder.query<Attendance[], void>({
      query: () => ({ url: ATTENDANCE.MY_HISTORY }),
      providesTags: ['Attendance'],
    }),
    getFlaggedAttendance: builder.query<Attendance[], void>({
      query: () => ({ url: ATTENDANCE.FLAGGED }),
      providesTags: ['AttendanceFlag'],
    }),
    getDailyTimesheet: builder.query<any, { date?: string }>({
      query: ({ date }) => ({ url: ATTENDANCE.DAILY_TIMESHEET, params: { date } }),
      providesTags: ['Attendance'],
    }),
    getShiftAttendance: builder.query<Attendance[], string>({
      query: (shiftId) => ({ url: ATTENDANCE.SHIFT_ATTENDANCE(shiftId) }),
      providesTags: ['Attendance'],
    }),
    clockIn: builder.mutation<Attendance, { shiftId: string; location: { lat: number; lng: number } }>({
      query: ({ shiftId, location }) => ({
        url: ATTENDANCE.CLOCK_IN(shiftId),
        method: 'POST',
        body: { location },
      }),
      invalidatesTags: ['Attendance'],
    }),
    clockOut: builder.mutation<Attendance, { shiftId: string; location: { lat: number; lng: number } }>({
      query: ({ shiftId, location }) => ({
        url: ATTENDANCE.CLOCK_OUT(shiftId),
        method: 'POST',
        body: { location },
      }),
      invalidatesTags: ['Attendance'],
    }),
    approveAttendance: builder.mutation<void, string>({
      query: (attendanceId) => ({ url: ATTENDANCE.APPROVE(attendanceId), method: 'POST' }),
      invalidatesTags: ['Attendance', 'AttendanceFlag'],
    }),
    flagAttendance: builder.mutation<AttendanceFlag, { attendanceId: string; type: string; reason: string }>({
      query: ({ attendanceId, type, reason }) => ({
        url: ATTENDANCE.FLAG(attendanceId),
        method: 'POST',
        body: { type, reason },
      }),
      invalidatesTags: ['Attendance', 'AttendanceFlag'],
    }),
  }),
});

export const {
  useGetMyStatusQuery,
  useGetMyHistoryQuery,
  useGetFlaggedAttendanceQuery,
  useGetDailyTimesheetQuery,
  useGetShiftAttendanceQuery,
  useClockInMutation,
  useClockOutMutation,
  useApproveAttendanceMutation,
  useFlagAttendanceMutation,
} = attendanceApi;

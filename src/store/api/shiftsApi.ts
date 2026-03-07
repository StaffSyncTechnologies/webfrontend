import { baseApi } from './baseApi';
import { SHIFTS, ATTENDANCE } from '../../services/endpoints';

export interface Shift {
  id: string;
  title?: string;
  clientCompanyId: string;
  clientCompany?: {
    id: string;
    name: string;
    address?: string;
  };
  startTime: string;
  endTime: string;
  breakMinutes?: number;
  hourlyRate?: number;
  status: 'DRAFT' | 'OPEN' | 'FILLED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  requiredWorkers: number;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  shiftId: string;
  clockInTime?: string;
  clockOutTime?: string;
  status: 'PENDING' | 'CLOCKED_IN' | 'CLOCKED_OUT' | 'APPROVED' | 'FLAGGED';
  totalHours?: number;
  totalPay?: number;
}

export const shiftsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShifts: builder.query<{ success: boolean; data: Shift[] }, { status?: string }>({
      query: (params) => ({ url: SHIFTS.LIST, params }),
      providesTags: ['Shifts'],
    }),
    getMyShiftHistory: builder.query<{ success: boolean; data: Shift[] }, void>({
      query: () => SHIFTS.MY_HISTORY,
      providesTags: ['Shifts'],
    }),
    getShiftById: builder.query<{ success: boolean; data: Shift }, string>({
      query: (shiftId) => SHIFTS.GET_BY_ID(shiftId),
      providesTags: (r, e, id) => [{ type: 'Shifts', id }],
    }),
    acceptShift: builder.mutation<{ success: boolean }, string>({
      query: (shiftId) => ({ url: SHIFTS.ACCEPT(shiftId), method: 'POST' }),
      invalidatesTags: ['Shifts'],
    }),
    declineShift: builder.mutation<{ success: boolean }, { shiftId: string; reason?: string }>({
      query: ({ shiftId, reason }) => ({ url: SHIFTS.DECLINE(shiftId), method: 'POST', body: { reason } }),
      invalidatesTags: ['Shifts'],
    }),
    clockIn: builder.mutation<{ success: boolean; data: AttendanceRecord }, { shiftId: string; lat?: number; lng?: number }>({
      query: ({ shiftId, lat, lng }) => ({ url: SHIFTS.CLOCK_IN(shiftId), method: 'POST', body: { lat, lng } }),
      invalidatesTags: ['Shifts', 'Attendance'],
    }),
    clockOut: builder.mutation<{ success: boolean; data: AttendanceRecord }, { shiftId: string; lat?: number; lng?: number }>({
      query: ({ shiftId, lat, lng }) => ({ url: SHIFTS.CLOCK_OUT(shiftId), method: 'POST', body: { lat, lng } }),
      invalidatesTags: ['Shifts', 'Attendance'],
    }),
    getMyAttendanceStatus: builder.query<{ success: boolean; data: AttendanceRecord | null }, void>({
      query: () => ATTENDANCE.MY_STATUS,
      providesTags: ['Attendance'],
    }),
    getMyAttendanceHistory: builder.query<{ success: boolean; data: AttendanceRecord[] }, void>({
      query: () => ATTENDANCE.MY_HISTORY,
      providesTags: ['Attendance'],
    }),
  }),
});

export const {
  useGetShiftsQuery,
  useGetMyShiftHistoryQuery,
  useGetShiftByIdQuery,
  useAcceptShiftMutation,
  useDeclineShiftMutation,
  useClockInMutation,
  useClockOutMutation,
  useGetMyAttendanceStatusQuery,
  useGetMyAttendanceHistoryQuery,
} = shiftsApi;

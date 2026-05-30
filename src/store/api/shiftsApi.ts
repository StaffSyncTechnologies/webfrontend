import { baseApi } from './baseApi';
import { SHIFTS, ATTENDANCE } from '../../services/endpoints';

export interface Shift {
  id: string;
  title: string;
  clientCompanyId?: string;
  clientCompany?: {
    id: string;
    name: string;
    address?: string;
  };
  startAt: string;
  endAt: string;
  breakMinutes?: number;
  hourlyRate?: number;
  payRate?: number;
  status: 'DRAFT' | 'OPEN' | 'FILLED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  workersNeeded?: number;
  role?: string;
  notes?: string;
  siteLocation?: string;
  siteLat?: number;
  siteLng?: number;
  geofenceRadius?: number;
  location?: {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    geofenceRadius: number;
  };
  requiredSkills?: Array<{
    skillId: string;
  }>;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  createdAt: string;
  assignments?: Array<{
    id: string;
    workerId: string;
    status: string;
    worker: { id: string; fullName: string; email: string };
  }>;
  attendances?: Array<{
    id: string;
    workerId: string;
    clockInAt?: string;
    clockOutAt?: string;
    status: string;
  }>;
  broadcasts?: Array<{
    id: string;
    filters: {
      targetWorkerIds?: string[];
      [key: string]: any;
    };
  }>;
  _count?: {
    assignments: number;
    attendances: number;
  };
}

export interface AttendanceRecord {
  id: string;
  shiftId: string;
  clockInAt?: string;
  clockOutAt?: string;
  status: 'PENDING' | 'APPROVED' | 'FLAGGED';
  hoursWorked?: number;
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
    getById: builder.query<{ success: boolean; data: Shift }, string>({
      query: (shiftId) => `/shifts/${shiftId}`,
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
  useGetByIdQuery,
  useAcceptShiftMutation,
  useDeclineShiftMutation,
  useClockInMutation,
  useClockOutMutation,
  useGetMyAttendanceStatusQuery,
  useGetMyAttendanceHistoryQuery,
} = shiftsApi;

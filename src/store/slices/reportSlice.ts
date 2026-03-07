import { createApi } from '@reduxjs/toolkit/query/react';
import { REPORTS } from '../../utilities/endpoint';
import { axiosBaseQuery } from '../../utilities/axiosBaseQuery';

// Response types
export interface ExecutiveSummaryResponse {
  period: { days: number; startDate: string; endDate: string };
  kpis: Array<{
    name: string;
    value: number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
    format?: string;
  }>;
}

export interface ShiftReportResponse {
  period: { start: string; end: string };
  summary: {
    totalShifts: number;
    filledShifts: number;
    unfilledShifts: number;
    fillRate: number;
    avgFillTimeHours: number;
  };
  statusBreakdown: Array<{ status: string; count: number; percentage: number }>;
  clientBreakdown: Array<{ clientId: string; clientName: string; shiftCount: number; percentage: number }>;
  dayBreakdown: Array<{ day: string; count: number }>;
}

export interface AttendanceReportResponse {
  period: { start: string; end: string };
  summary: {
    totalRecords: number;
    approvedRecords: number;
    flaggedRecords: number;
    approvalRate: number;
    totalHoursWorked: number;
    avgHoursPerShift: number;
  };
  punctuality: {
    lateArrivals: number;
    earlyDepartures: number;
    punctualityRate: number;
  };
  statusBreakdown: Array<{ status: string; count: number; percentage: number }>;
  flagReasons: Array<{ reason: string; count: number }>;
}

export interface WorkforceReportResponse {
  summary: {
    totalWorkers: number;
    recentJoiners: number;
    retainedWorkers: number;
    retentionRate: number;
  };
  statusBreakdown: Array<{ status: string; count: number; percentage: number }>;
  rtwBreakdown: Array<{ rtwStatus: string; count: number; percentage: number }>;
  skillsDistribution: Array<{ skillId: string; skillName: string; count: number }>;
}

export interface ClientReportResponse {
  period: { start: string; end: string };
  summary: {
    totalClients: number;
    activeClients: number;
    inactiveClients: number;
    activityRate: number;
  };
  statusBreakdown: Array<{ status: string; count: number; percentage: number }>;
  clientAnalytics: Array<{
    clientId: string;
    clientName: string;
    status: string;
    industry: string;
    shiftCount: number;
    totalHours: number;
    uniqueWorkers: number;
  }>;
  topClientsByShifts: Array<any>;
  topClientsByHours: Array<any>;
}

export const reportApi = createApi({
  reducerPath: 'reportApi',
  baseQuery: axiosBaseQuery({
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.authorization = `Bearer ${token}`;
      }
      return headers;
    },
  }),
  tagTypes: ['Report'],
  endpoints: (builder) => ({
    getWorkforceReport: builder.query<WorkforceReportResponse, void>({
      query: () => ({ url: REPORTS.WORKFORCE }),
      transformResponse: (response: { success: boolean; data: WorkforceReportResponse }) => response.data,
      providesTags: ['Report'],
    }),
    getReliabilityReport: builder.query<any, { limit?: number }>({
      query: (params) => ({ url: REPORTS.RELIABILITY, params }),
      transformResponse: (response: { success: boolean; data: any }) => response.data,
      providesTags: ['Report'],
    }),
    getShiftReport: builder.query<ShiftReportResponse, { startDate?: string; endDate?: string }>({
      query: (params) => ({ url: REPORTS.SHIFTS, params }),
      transformResponse: (response: { success: boolean; data: ShiftReportResponse }) => response.data,
      providesTags: ['Report'],
    }),
    getAttendanceReport: builder.query<AttendanceReportResponse, { startDate?: string; endDate?: string }>({
      query: (params) => ({ url: REPORTS.ATTENDANCE, params }),
      transformResponse: (response: { success: boolean; data: AttendanceReportResponse }) => response.data,
      providesTags: ['Report'],
    }),
    getPayrollReport: builder.query<any, { year?: number }>({
      query: (params) => ({ url: REPORTS.PAYROLL, params }),
      transformResponse: (response: { success: boolean; data: any }) => response.data,
      providesTags: ['Report'],
    }),
    getClientReport: builder.query<ClientReportResponse, { startDate?: string; endDate?: string }>({
      query: (params) => ({ url: REPORTS.CLIENTS, params }),
      transformResponse: (response: { success: boolean; data: ClientReportResponse }) => response.data,
      providesTags: ['Report'],
    }),
    getComplianceReport: builder.query<any, void>({
      query: () => ({ url: REPORTS.COMPLIANCE }),
      transformResponse: (response: { success: boolean; data: any }) => response.data,
      providesTags: ['Report'],
    }),
    getExecutiveSummary: builder.query<ExecutiveSummaryResponse, { period?: string }>({
      query: (params) => ({ url: REPORTS.EXECUTIVE_SUMMARY, params }),
      transformResponse: (response: { success: boolean; data: ExecutiveSummaryResponse }) => response.data,
      providesTags: ['Report'],
    }),
  }),
});

export const {
  useGetWorkforceReportQuery,
  useGetReliabilityReportQuery,
  useGetShiftReportQuery,
  useGetAttendanceReportQuery,
  useGetPayrollReportQuery,
  useGetClientReportQuery,
  useGetComplianceReportQuery,
  useGetExecutiveSummaryQuery,
} = reportApi;

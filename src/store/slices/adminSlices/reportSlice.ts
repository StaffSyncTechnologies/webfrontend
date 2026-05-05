import { baseApi } from '../../api/baseApi';
import { REPORTS } from '../../../services/endpoints';

export interface ExecutiveSummaryResponse {
  period: { days: number; startDate: string; endDate: string };
  kpis: Array<{
    name: string;
    value: number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
    format: string;
  }>;
}

export interface ShiftReportResponse {
  period: { start: string; end: string };
  summary: {
    totalShifts: number;
    completedShifts: number;
    cancelledShifts: number;
    completionRate: number;
  };
  dayBreakdown: Array<{ day: string; count: number }>;
}

export interface AttendanceReportResponse {
  period: { start: string; end: string };
  summary: {
    totalRecords: number;
    approvalRate: number;
    totalHoursWorked: number;
  };
  statusBreakdown: Array<{ status: string; count: number; percentage: number }>;
  punctuality: { punctualityRate: number };
  flagReasons: Array<{ reason: string; count: number }>;
}

export interface WorkforceReportResponse {
  summary: { totalWorkers: number; recentJoiners: number };
  statusBreakdown: Array<{ status: string; count: number; percentage: number }>;
  skillsDistribution: Array<{ skillId: string; skillName: string; count: number }>;
}

export interface ClientReportResponse {
  period: { start: string; end: string };
  summary: { totalClients: number; activeClients: number; activityRate: number };
  topClientsByHours: Array<any>;
}

export const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExecutiveSummary: builder.query<ExecutiveSummaryResponse, { period?: string }>({
      query: (params) => ({ url: REPORTS.EXECUTIVE_SUMMARY, params }),
      transformResponse: (r: any) => r.data ?? r,
    }),
    getShiftReport: builder.query<ShiftReportResponse, { startDate?: string; endDate?: string }>({
      query: (params) => ({ url: REPORTS.SHIFTS, params }),
      transformResponse: (r: any) => r.data ?? r,
    }),
    getAttendanceReport: builder.query<AttendanceReportResponse, { startDate?: string; endDate?: string }>({
      query: (params) => ({ url: REPORTS.ATTENDANCE, params }),
      transformResponse: (r: any) => r.data ?? r,
    }),
    getWorkforceReport: builder.query<WorkforceReportResponse, void>({
      query: () => REPORTS.WORKFORCE,
      transformResponse: (r: any) => r.data ?? r,
    }),
    getClientReport: builder.query<ClientReportResponse, { startDate?: string; endDate?: string }>({
      query: (params) => ({ url: REPORTS.CLIENTS, params }),
      transformResponse: (r: any) => r.data ?? r,
    }),
  }),
});

export const {
  useGetExecutiveSummaryQuery,
  useGetShiftReportQuery,
  useGetAttendanceReportQuery,
  useGetWorkforceReportQuery,
  useGetClientReportQuery,
} = reportApi;

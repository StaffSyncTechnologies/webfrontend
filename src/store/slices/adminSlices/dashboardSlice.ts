import { createApi } from '@reduxjs/toolkit/query/react';
import { DASHBOARD } from '../../../services/endpoints';
import { baseApi } from '../../api/baseApi';

export interface DashboardStats {
  totalWorkers: number;
  activeShifts: number;
  pendingApprovals: number;
  totalClients: number;
}

export interface PendingApprovals {
  clients: any[];
  workers: any[];
  timesheets: any[];
  counts: {
    clients: number;
    workers: number;
    timesheets: number;
  };
}

export interface RoleDashboard {
  role: string;
  stats: DashboardStats;
}

export interface AdminDashboard {
  totalAgencies: number;
  totalWorkers: number;
  totalClients: number;
  revenue: number;
}

export interface AdminStats {
  totalWorkers: { value: number; change: number };
  totalClients: { value: number; change: number };
  totalRevenue: { value: number; change: number };
  shiftsToday: { value: number; change: number };
}

export interface ShiftsByDay {
  date: string;
  shifts: number;
}

export interface WorkersAvailability {
  available: number;
  onShift: number;
  unavailable: number;
}

export interface RecentActivity {
  activities: Array<{
    id: string;
    clockIn: string;
    clockOut: string;
    location: string;
    shiftId: string;
    shiftTitle: string;
    status: string;
    worker: {
      id: string;
      name: string;
      avatar: string | null;
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RecentActivityParams {
  page?: number;
  limit?: number;
  type?: string;
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoleDashboard: builder.query<RoleDashboard, void>({
      query: () => ({
        url: DASHBOARD.ROLE_DASHBOARD,
        method: 'GET',
      }),
    }),
    
    getAgencyDashboard: builder.query<AdminDashboard, void>({
      query: () => ({
        url: DASHBOARD.AGENCY_DASHBOARD,
        method: 'GET',
      }),
    }),
    
    getStats: builder.query<DashboardStats, void>({
      query: () => ({
        url: DASHBOARD.STATS,
        method: 'GET',
      }),
    }),
    
    getRecentClients: builder.query<any[], { limit?: number }>({
      query: ({ limit = 10 }) => ({
        url: DASHBOARD.RECENT_CLIENTS,
        method: 'GET',
        params: { limit },
      }),
    }),
    
    getRecentWorkers: builder.query<any[], { limit?: number }>({
      query: ({ limit = 10 }) => ({
        url: DASHBOARD.RECENT_WORKERS,
        method: 'GET',
        params: { limit },
      }),
    }),
    
    getPendingApprovals: builder.query<PendingApprovals, void>({
      query: () => ({
        url: DASHBOARD.PENDING_APPROVALS,
        method: 'GET',
      }),
      transformResponse: (response: any) => response?.data ?? response,
    }),
    
    getShiftsOverview: builder.query<any, { period?: string }>({
      query: ({ period = 'week' }) => ({
        url: DASHBOARD.SHIFTS_OVERVIEW,
        method: 'GET',
        params: { period },
      }),
    }),
    
    getAdminStats: builder.query<AdminStats, void>({
      query: () => ({
        url: DASHBOARD.ADMIN_STATS,
        method: 'GET',
      }),
      transformResponse: (response: any) => response?.data ?? response,
    }),
    
    getShiftsByDay: builder.query<ShiftsByDay[], { days?: number }>({
      query: ({ days = 7 } = {}) => ({
        url: DASHBOARD.ADMIN_SHIFTS_BY_DAY,
        method: 'GET',
        params: { days },
      }),
    }),
    
    getWorkersAvailability: builder.query<WorkersAvailability, void>({
      query: () => ({
        url: DASHBOARD.ADMIN_WORKERS_AVAILABILITY,
        method: 'GET',
      }),
    }),
    
    getRecentActivity: builder.query<RecentActivity, RecentActivityParams>({
      query: (params = {}) => ({
        url: DASHBOARD.ADMIN_RECENT_ACTIVITY,
        method: 'GET',
        params,
      }),
      transformResponse: (response: any) => response?.data ?? response,
    }),
  }),
});

export const {
  useGetRoleDashboardQuery,
  useGetAgencyDashboardQuery,
  useGetStatsQuery,
  useGetRecentClientsQuery,
  useGetRecentWorkersQuery,
  useGetPendingApprovalsQuery,
  useGetShiftsOverviewQuery,
  useGetAdminStatsQuery,
  useGetShiftsByDayQuery,
  useGetWorkersAvailabilityQuery,
  useGetRecentActivityQuery,
} = dashboardApi;

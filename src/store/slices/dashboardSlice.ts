import { createApi } from '@reduxjs/toolkit/query/react';
import { DASHBOARD } from '../../utilities/endpoint';
import { axiosBaseQuery } from '../../utilities/axiosBaseQuery';
import type { 
  DashboardStats, 
  PendingApprovals, 
  RoleDashboard,
  AdminDashboard,
  AdminStats,
  ShiftsByDay,
  WorkersAvailability,
  RecentActivity,
  RecentActivityParams,
} from '../../types/api';

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: axiosBaseQuery({
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.authorization = `Bearer ${token}`;
      }
      return headers;
    },
  }),
  tagTypes: ['Dashboard', 'PendingApprovals', 'RoleDashboard', 'AgencyDashboard'],
  endpoints: (builder) => ({
    // Role-based dashboard - returns data based on user role
    getRoleDashboard: builder.query<RoleDashboard, void>({
      query: () => ({
        url: DASHBOARD.ROLE_DASHBOARD,
        method: 'GET',
      }),
      providesTags: ['RoleDashboard'],
    }),
    
    // Agency dashboard - shows registered client companies
    getAgencyDashboard: builder.query<AdminDashboard, void>({
      query: () => ({
        url: DASHBOARD.AGENCY_DASHBOARD,
        method: 'GET',
      }),
      providesTags: ['AgencyDashboard'],
    }),
    
    // Dashboard statistics
    getStats: builder.query<DashboardStats, void>({
      query: () => ({
        url: DASHBOARD.STATS,
        method: 'GET',
      }),
      providesTags: ['Dashboard'],
    }),
    
    // Recent clients
    getRecentClients: builder.query<any[], { limit?: number }>({
      query: ({ limit = 10 }) => ({
        url: DASHBOARD.RECENT_CLIENTS,
        method: 'GET',
        params: { limit },
      }),
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        return [];
      },
      providesTags: ['Dashboard'],
    }),
    
    // Recent workers
    getRecentWorkers: builder.query<any[], { limit?: number }>({
      query: ({ limit = 10 }) => ({
        url: DASHBOARD.RECENT_WORKERS,
        method: 'GET',
        params: { limit },
      }),
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        return [];
      },
      providesTags: ['Dashboard'],
    }),
    
    // Pending approvals
    getPendingApprovals: builder.query<PendingApprovals, void>({
      query: () => ({
        url: DASHBOARD.PENDING_APPROVALS,
        method: 'GET',
      }),
      providesTags: ['PendingApprovals'],
    }),
    
    // Shifts overview
    getShiftsOverview: builder.query<any, { period?: string }>({
      query: ({ period = 'week' }) => ({
        url: DASHBOARD.SHIFTS_OVERVIEW,
        method: 'GET',
        params: { period },
      }),
      providesTags: ['Dashboard'],
    }),
    
    // Admin dashboard stats
    getAdminStats: builder.query<AdminStats, void>({
      query: () => ({
        url: DASHBOARD.ADMIN_STATS,
        method: 'GET',
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ['Dashboard'],
    }),
    
    // Admin shifts by day (for bar chart)
    getShiftsByDay: builder.query<ShiftsByDay, { days?: number }>({
      query: ({ days = 7 } = {}) => ({
        url: DASHBOARD.ADMIN_SHIFTS_BY_DAY,
        method: 'GET',
        params: { days },
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ['Dashboard'],
    }),
    
    // Admin workers availability (for donut chart)
    getWorkersAvailability: builder.query<WorkersAvailability, void>({
      query: () => ({
        url: DASHBOARD.ADMIN_WORKERS_AVAILABILITY,
        method: 'GET',
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ['Dashboard'],
    }),
    
    // Admin recent activity (for table)
    getRecentActivity: builder.query<RecentActivity, RecentActivityParams>({
      query: (params = {}) => ({
        url: DASHBOARD.ADMIN_RECENT_ACTIVITY,
        method: 'GET',
        params,
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ['Dashboard'],
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

import { createApi } from '@reduxjs/toolkit/query/react';
import { HR } from '../../utilities/endpoint';
import { axiosBaseQuery } from '../../utilities/axiosBaseQuery';

// Types
export interface Manager {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  roleDisplay: string;
  status: string;
  teamNumber: string | null;
  profilePicUrl: string | null;
  managedWorkersCount: number;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface ManagerStats {
  totalManagers: { count: number; change: number };
  activeManagers: { count: number; change: number };
  inactiveManagers: { count: number; change: number };
  averageCompliance: { score: number; change: number };
}

export interface ManagerListResponse {
  managers: Manager[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ManagerListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'INVITED' | 'PENDING';
  role?: 'OPS_MANAGER' | 'SHIFT_COORDINATOR' | 'COMPLIANCE_OFFICER';
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'fullName' | 'email' | 'role' | 'createdAt' | 'managedWorkersCount';
  sortOrder?: 'asc' | 'desc';
}

export interface ManagerDetail extends Manager {
  managedWorkers: Array<{
    id: string;
    fullName: string;
    email: string;
    status: string;
    workerProfile: {
      rtwStatus: string;
      onboardingStatus: string;
    } | null;
  }>;
  staffCompanyAssignments: Array<{
    clientCompany: { id: string; name: string };
    isPrimary: boolean;
  }>;
}

export interface ManagedWorker {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: string;
  workerProfile: {
    onboardingStatus: string;
    rtwStatus: string;
  } | null;
}

export const hrApi = createApi({
  reducerPath: 'hrApi',
  baseQuery: axiosBaseQuery({
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.authorization = `Bearer ${token}`;
      }
      return headers;
    },
  }),
  tagTypes: ['Manager', 'ManagerStats', 'ManagedWorkers'],
  endpoints: (builder) => ({
    // Get manager statistics
    getManagerStats: builder.query<ManagerStats, void>({
      query: () => ({
        url: HR.MANAGER_STATS,
        method: 'GET',
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ['ManagerStats'],
    }),

    // List managers with pagination
    listManagers: builder.query<ManagerListResponse, ManagerListParams>({
      query: (params) => ({
        url: HR.LIST_MANAGERS,
        method: 'GET',
        params,
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ['Manager'],
    }),

    // Get single manager details
    getManager: builder.query<ManagerDetail, string>({
      query: (managerId) => ({
        url: HR.GET_MANAGER(managerId),
        method: 'GET',
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: (_result, _error, id) => [{ type: 'Manager', id }],
    }),

    // Update manager status (activate/suspend)
    updateManagerStatus: builder.mutation<void, { managerId: string; status: 'ACTIVE' | 'SUSPENDED' }>({
      query: ({ managerId, status }) => ({
        url: HR.UPDATE_MANAGER_STATUS(managerId),
        method: 'PATCH',
        data: { status },
      }),
      invalidatesTags: ['Manager', 'ManagerStats'],
    }),

    // Delete manager
    deleteManager: builder.mutation<void, string>({
      query: (managerId) => ({
        url: HR.DELETE_MANAGER(managerId),
        method: 'DELETE',
      }),
      invalidatesTags: ['Manager', 'ManagerStats'],
    }),

    // Get managed workers by manager ID
    getManagedWorkers: builder.query<ManagedWorker[], string>({
      query: (managerId) => ({
        url: HR.MANAGED_WORKERS(managerId),
        method: 'GET',
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ['ManagedWorkers'],
    }),

    // Get my team (for logged-in staff)
    getMyTeam: builder.query<ManagedWorker[], void>({
      query: () => ({
        url: HR.MY_TEAM,
        method: 'GET',
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ['ManagedWorkers'],
    }),

    // Get unassigned workers
    getUnassignedWorkers: builder.query<ManagedWorker[], void>({
      query: () => ({
        url: HR.UNASSIGNED_WORKERS,
        method: 'GET',
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ['ManagedWorkers'],
    }),

    // Assign workers to manager
    assignWorkers: builder.mutation<{ assignedCount: number; managerId: string; managerName: string }, { managerId: string; workerIds: string[] }>({
      query: ({ managerId, workerIds }) => ({
        url: HR.ASSIGN_WORKERS(managerId),
        method: 'POST',
        data: { workerIds },
      }),
      transformResponse: (response: any) => response?.data ?? response,
      invalidatesTags: ['Manager', 'ManagedWorkers', 'ManagerStats'],
    }),

    // Unassign workers from manager
    unassignWorkers: builder.mutation<{ unassignedCount: number }, { workerIds: string[] }>({
      query: ({ workerIds }) => ({
        url: HR.UNASSIGN_WORKERS,
        method: 'POST',
        data: { workerIds },
      }),
      transformResponse: (response: any) => response?.data ?? response,
      invalidatesTags: ['Manager', 'ManagedWorkers', 'ManagerStats'],
    }),
  }),
});

export const {
  useGetManagerStatsQuery,
  useListManagersQuery,
  useGetManagerQuery,
  useUpdateManagerStatusMutation,
  useDeleteManagerMutation,
  useGetManagedWorkersQuery,
  useGetMyTeamQuery,
  useGetUnassignedWorkersQuery,
  useAssignWorkersMutation,
  useUnassignWorkersMutation,
} = hrApi;

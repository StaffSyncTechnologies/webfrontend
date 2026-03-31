import { createApi } from '@reduxjs/toolkit/query/react';
import { USERS } from '../../utilities/endpoint';
import { axiosBaseQuery } from '../../utilities/axiosBaseQuery';
import type { User } from '../../types/api';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: axiosBaseQuery({
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.authorization = `Bearer ${token}`;
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Staff', 'Worker'],
  endpoints: (builder) => ({
    // Basic user management
    getUsers: builder.query<User[], void>({
      query: () => ({ url: USERS.LIST }),
      providesTags: ['User'],
    }),
    getUserById: builder.query<User, string>({
      query: (userId) => ({ url: USERS.DETAIL(userId) }),
      providesTags: ['User'],
    }),
    createUser: builder.mutation<User, Partial<User>>({
      query: (user) => ({ url: USERS.CREATE, method: 'POST', body: user }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation<User, { userId: string; updates: Partial<User> }>({
      query: ({ userId, updates }) => ({
        url: USERS.UPDATE(userId),
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (userId) => ({ url: USERS.DELETE(userId), method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),
    
    // Suspend/Reactivate
    suspendUser: builder.mutation<void, string>({
      query: (userId) => ({ url: USERS.SUSPEND(userId), method: 'POST' }),
      invalidatesTags: ['User'],
    }),
    reactivateUser: builder.mutation<void, string>({
      query: (userId) => ({ url: USERS.REACTIVATE(userId), method: 'POST' }),
      invalidatesTags: ['User'],
    }),
    
    // Invite management
    resendInvite: builder.mutation<void, string>({
      query: (userId) => ({ url: USERS.RESEND_INVITE(userId), method: 'POST' }),
      invalidatesTags: ['User'],
    }),
    
    // Staff and worker management
    getStaffWithWorkerCounts: builder.query<any[], void>({
      query: () => ({ url: USERS.STAFF_WORKER_COUNTS }),
      providesTags: ['Staff'],
    }),
    getUnassignedWorkers: builder.query<User[], void>({
      query: () => ({ url: USERS.UNASSIGNED_WORKERS }),
      providesTags: ['Worker'],
    }),
    getMyManagedWorkers: builder.query<User[], void>({
      query: () => ({ url: USERS.MY_MANAGED_WORKERS }),
      providesTags: ['Worker'],
    }),
    getManagedWorkers: builder.query<User[], string>({
      query: (managerId) => ({ url: USERS.MANAGED_WORKERS(managerId) }),
      providesTags: ['Worker'],
    }),
    assignWorkersToManager: builder.mutation<void, { managerId: string; workerIds: string[] }>({
      query: ({ managerId, workerIds }) => ({
        url: USERS.ASSIGN_WORKERS(managerId),
        method: 'POST',
        body: { workerIds },
      }),
      invalidatesTags: ['Worker'],
    }),
    unassignWorkersFromManager: builder.mutation<void, { workerIds: string[] }>({
      query: (workerIds) => ({
        url: USERS.UNASSIGN_WORKERS,
        method: 'POST',
        body: { workerIds },
      }),
      invalidatesTags: ['Worker'],
    }),
    
    // Client assignments
    getMyClients: builder.query<any[], void>({
      query: () => ({ url: USERS.MY_CLIENTS }),
      providesTags: ['User'],
    }),
    getStaffClients: builder.query<any[], string>({
      query: (staffId) => ({ url: USERS.STAFF_CLIENTS(staffId) }),
      providesTags: ['Staff'],
    }),
    assignStaffToClients: builder.mutation<void, { staffId: string; clientIds: string[] }>({
      query: ({ staffId, clientIds }) => ({
        url: USERS.ASSIGN_CLIENTS(staffId),
        method: 'POST',
        body: { clientIds },
      }),
      invalidatesTags: ['Staff'],
    }),
    unassignStaffFromClients: builder.mutation<void, { staffId: string; clientIds: string[] }>({
      query: ({ staffId, clientIds }) => ({
        url: USERS.UNASSIGN_CLIENTS(staffId),
        method: 'POST',
        body: { clientIds },
      }),
      invalidatesTags: ['Staff'],
    }),
    getClientStaff: builder.query<User[], string>({
      query: (clientCompanyId) => ({ url: USERS.CLIENT_STAFF(clientCompanyId) }),
      providesTags: ['Staff'],
    }),
    getClientWorkers: builder.query<User[], string>({
      query: (clientCompanyId) => ({ url: USERS.CLIENT_WORKERS(clientCompanyId) }),
      providesTags: ['Worker'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useSuspendUserMutation,
  useReactivateUserMutation,
  useResendInviteMutation,
  useGetStaffWithWorkerCountsQuery,
  useGetUnassignedWorkersQuery,
  useGetMyManagedWorkersQuery,
  useGetManagedWorkersQuery,
  useAssignWorkersToManagerMutation,
  useUnassignWorkersFromManagerMutation,
  useGetMyClientsQuery,
  useGetStaffClientsQuery,
  useAssignStaffToClientsMutation,
  useUnassignStaffFromClientsMutation,
  useGetClientStaffQuery,
  useGetClientWorkersQuery,
} = userApi;

import { createApi } from '@reduxjs/toolkit/query/react';
import { WORKERS, PAYSLIPS, HOLIDAYS, WORKER_MEMBERSHIP } from '../../utilities/endpoint';
import { axiosBaseQuery } from '../../utilities/axiosBaseQuery';
import type { Worker, Skill, WorkerDocument, WorkerAvailability } from '../../types/api';

export const workerApi = createApi({
  reducerPath: 'workerApi',
  baseQuery: axiosBaseQuery({
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.authorization = `Bearer ${token}`;
      }
      return headers;
    },
  }),
  tagTypes: ['Worker', 'WorkerProfile', 'WorkerSkills', 'WorkerRTW', 'WorkerAvailability', 'WorkerBlocks'],
  endpoints: (builder) => ({
    getWorkers: builder.query<{ data: Worker[] }, { status?: string; rtwStatus?: string; search?: string }>({
      query: (params) => ({ url: WORKERS.LIST, params }),
      providesTags: ['Worker'],
    }),
    getWorkerListStats: builder.query<{
      data: {
        totalWorkers: { value: number; change: number };
        activeWorkers: { value: number; change: number };
        onShift: { value: number; change: number };
        blocked: { value: number; change: number };
      };
    }, void>({
      query: () => ({ url: WORKERS.LIST_STATS }),
      providesTags: ['Worker'],
    }),
    getWorkerHome: builder.query<any, void>({
      query: () => ({ url: WORKERS.HOME }),
      providesTags: ['WorkerProfile'],
    }),
    exportWorkers: builder.query<Blob, { format?: string }>({
      query: (params) => ({ url: WORKERS.EXPORT, params }),
    }),
    inviteWorker: builder.mutation<any, { email?: string; phone?: string; fullName: string }>({
      query: (body) => ({ url: WORKERS.INVITE, method: 'POST', data: body }),
      invalidatesTags: ['Worker'],
    }),
    getWorkerById: builder.query<Worker, string>({
      query: (workerId) => ({ url: WORKERS.DETAIL(workerId) }),
      providesTags: ['WorkerProfile'],
    }),
    getWorkerStats: builder.query<{
      totalShifts: number;
      totalEarnings: number;
      totalHours: string;
      totalMinutes: number;
      attendanceRate: number;
      completedShifts: number;
      attendedShifts: number;
    }, string>({
      query: (workerId) => ({ url: WORKERS.STATS(workerId) }),
      providesTags: ['WorkerProfile'],
    }),
    getWorkerShifts: builder.query<{
      data: Array<{
        id: string;
        shiftId: string;
        shiftCode: string;
        title: string;
        location: string;
        date: string;
        duration: string;
        status: string;
      }>;
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }, { workerId: string; page?: number; limit?: number; status?: string }>({
      query: ({ workerId, page = 1, limit = 10, status }) => ({
        url: WORKERS.SHIFTS(workerId),
        params: { page, limit, ...(status && { status }) },
      }),
      providesTags: ['WorkerProfile'],
    }),
    getWorkerProfile: builder.query<Worker, string>({
      query: (workerId) => ({ url: WORKERS.PROFILE(workerId) }),
      providesTags: ['WorkerProfile'],
    }),
    updateWorkerProfile: builder.mutation<Worker, { workerId: string; updates: Partial<Worker> }>({
      query: ({ workerId, updates }) => ({
        url: WORKERS.PROFILE(workerId),
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['WorkerProfile'],
    }),
    getWorkerSkills: builder.query<Skill[], string>({
      query: (workerId) => ({ url: WORKERS.SKILLS(workerId) }),
      providesTags: ['WorkerSkills'],
    }),
    updateWorkerSkills: builder.mutation<Skill[], { workerId: string; skills: string[] }>({
      query: ({ workerId, skills }) => ({
        url: WORKERS.SKILLS(workerId),
        method: 'PUT',
        body: { skills },
      }),
      invalidatesTags: ['WorkerSkills'],
    }),
    getWorkerRTW: builder.query<any, string>({
      query: (workerId) => ({ url: WORKERS.RTW(workerId) }),
      providesTags: ['WorkerRTW'],
    }),
    initiateWorkerRTW: builder.mutation<any, { workerId: string; shareCode: string; dateOfBirth: string }>({
      query: ({ workerId, shareCode, dateOfBirth }) => ({
        url: WORKERS.RTW_INITIATE(workerId),
        method: 'POST',
        body: { shareCode, dateOfBirth },
      }),
      invalidatesTags: ['WorkerRTW'],
    }),
    updateWorkerRTW: builder.mutation<any, { workerId: string; data: any }>({
      query: ({ workerId, data }) => ({
        url: WORKERS.RTW_UPDATE(workerId),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['WorkerRTW'],
    }),
    getWorkerAvailability: builder.query<WorkerAvailability, string>({
      query: (workerId) => ({ url: WORKERS.AVAILABILITY(workerId) }),
      providesTags: ['WorkerAvailability'],
    }),
    updateWorkerAvailability: builder.mutation<WorkerAvailability, { workerId: string; availability: WorkerAvailability }>({
      query: ({ workerId, availability }) => ({
        url: WORKERS.AVAILABILITY(workerId),
        method: 'PUT',
        body: availability,
      }),
      invalidatesTags: ['WorkerAvailability'],
    }),
    getWorkerDocuments: builder.query<WorkerDocument[], string>({
      query: (workerId) => ({ url: WORKERS.DOCUMENTS(workerId) }),
      providesTags: ['WorkerProfile'],
    }),
    uploadWorkerDocument: builder.mutation<WorkerDocument, { workerId: string; formData: FormData }>({
      query: ({ workerId, formData }) => ({
        url: WORKERS.DOCUMENTS(workerId),
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['WorkerProfile'],
    }),
    deleteWorkerDocument: builder.mutation<void, { workerId: string; docId: string }>({
      query: ({ workerId, docId }) => ({
        url: WORKERS.DOCUMENT(workerId, docId),
        method: 'DELETE',
      }),
      invalidatesTags: ['WorkerProfile'],
    }),
    verifyWorkerDocument: builder.mutation<any, { workerId: string; docId: string; status: string }>({
      query: ({ workerId, docId, status }) => ({
        url: WORKERS.DOCUMENT_VERIFY(workerId, docId),
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['WorkerProfile'],
    }),
    getWorkerBlocks: builder.query<any[], string>({
      query: (workerId) => ({ url: WORKERS.BLOCKS(workerId) }),
      providesTags: ['WorkerBlocks'],
    }),
    createWorkerBlock: builder.mutation<any, { workerId: string; reason: string; clientId?: string }>({
      query: ({ workerId, ...data }) => ({
        url: WORKERS.BLOCKS(workerId),
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['WorkerBlocks'],
    }),
    liftWorkerBlock: builder.mutation<void, { workerId: string; blockId: string }>({
      query: ({ workerId, blockId }) => ({
        url: WORKERS.BLOCK_LIFT(workerId, blockId),
        method: 'PUT',
      }),
      invalidatesTags: ['WorkerBlocks'],
    }),
    getWorkerReliability: builder.query<any, string>({
      query: (workerId) => ({ url: WORKERS.RELIABILITY(workerId) }),
    }),
    getWorkerClients: builder.query<any[], string>({
      query: (workerId) => ({ url: WORKERS.CLIENTS(workerId) }),
    }),
    assignWorkerToClient: builder.mutation<void, { workerId: string; clientId: string }>({
      query: ({ workerId, clientId }) => ({
        url: WORKERS.ASSIGN_CLIENT(workerId),
        method: 'POST',
        body: { clientId },
      }),
      invalidatesTags: ['Worker'],
    }),
    transferWorker: builder.mutation<void, { workerId: string; fromClientId: string; toClientId: string }>({
      query: ({ workerId, ...data }) => ({
        url: WORKERS.TRANSFER(workerId),
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Worker'],
    }),
    removeWorkerFromClient: builder.mutation<void, { workerId: string; clientId: string }>({
      query: ({ workerId, clientId }) => ({
        url: WORKERS.REMOVE_CLIENT(workerId),
        method: 'POST',
        body: { clientId },
      }),
      invalidatesTags: ['Worker'],
    }),
    bulkAssignWorkersToClient: builder.mutation<void, { workerIds: string[]; clientId: string }>({
      query: (data) => ({
        url: WORKERS.BULK_ASSIGN_CLIENT,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Worker'],
    }),
    getAvailableWorkersForClient: builder.query<Worker[], string>({
      query: (clientCompanyId) => ({ url: WORKERS.AVAILABLE_FOR_CLIENT(clientCompanyId) }),
      providesTags: ['Worker'],
    }),
    // Worker Payslips
    getWorkerPayslips: builder.query<{
      data: Array<{
        id: string;
        periodStart: string;
        periodEnd: string;
        payRate: number;
        grossPay: number;
        deductions: number;
        netPay: number;
        status: string;
        createdAt: string;
      }>;
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }, { workerId: string; page?: number; limit?: number }>({
      query: ({ workerId, page = 1, limit = 10 }) => ({
        url: PAYSLIPS.WORKER_PAYSLIPS(workerId),
        params: { page, limit },
      }),
      providesTags: ['WorkerProfile'],
    }),
    // Worker Holidays
    getWorkerHolidays: builder.query<{
      data: Array<{
        id: string;
        type: string;
        startDate: string;
        endDate: string;
        days: number;
        status: string;
        reason: string;
        createdAt: string;
      }>;
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }, { workerId: string; page?: number; limit?: number }>({
      query: ({ workerId, page = 1, limit = 10 }) => ({
        url: HOLIDAYS.WORKER_HOLIDAYS(workerId),
        params: { page, limit },
      }),
      providesTags: ['WorkerProfile'],
    }),
    // Suspend worker
    suspendWorker: builder.mutation<void, { workerId: string; reason?: string }>({
      query: ({ workerId, reason }) => ({
        url: WORKERS.SUSPEND(workerId),
        method: 'PUT',
        data: { reason },
      }),
      invalidatesTags: ['Worker', 'WorkerProfile'],
    }),
    // Reactivate worker
    reactivateWorker: builder.mutation<void, string>({
      query: (workerId) => ({
        url: WORKERS.REACTIVATE(workerId),
        method: 'PUT',
      }),
      invalidatesTags: ['Worker', 'WorkerProfile'],
    }),
    // Invite existing worker by email (multi-agency)
    inviteWorkerByEmail: builder.mutation<any, { email: string; hourlyRate?: number }>({
      query: (body) => ({
        url: WORKER_MEMBERSHIP.INVITE_BY_EMAIL,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Worker'],
    }),
    // Remove worker membership
    removeWorkerMembership: builder.mutation<void, string>({
      query: (membershipId) => ({
        url: WORKER_MEMBERSHIP.REMOVE(membershipId),
        method: 'DELETE',
      }),
      invalidatesTags: ['Worker'],
    }),
  }),
});

export const {
  useGetWorkersQuery,
  useGetWorkerListStatsQuery,
  useGetWorkerHomeQuery,
  useExportWorkersQuery,
  useInviteWorkerMutation,
  useGetWorkerByIdQuery,
  useGetWorkerStatsQuery,
  useGetWorkerShiftsQuery,
  useGetWorkerProfileQuery,
  useUpdateWorkerProfileMutation,
  useGetWorkerSkillsQuery,
  useUpdateWorkerSkillsMutation,
  useGetWorkerRTWQuery,
  useInitiateWorkerRTWMutation,
  useUpdateWorkerRTWMutation,
  useGetWorkerAvailabilityQuery,
  useUpdateWorkerAvailabilityMutation,
  useGetWorkerDocumentsQuery,
  useUploadWorkerDocumentMutation,
  useDeleteWorkerDocumentMutation,
  useVerifyWorkerDocumentMutation,
  useGetWorkerBlocksQuery,
  useCreateWorkerBlockMutation,
  useLiftWorkerBlockMutation,
  useGetWorkerReliabilityQuery,
  useGetWorkerClientsQuery,
  useAssignWorkerToClientMutation,
  useTransferWorkerMutation,
  useRemoveWorkerFromClientMutation,
  useBulkAssignWorkersToClientMutation,
  useGetAvailableWorkersForClientQuery,
  useGetWorkerPayslipsQuery,
  useGetWorkerHolidaysQuery,
  useSuspendWorkerMutation,
  useReactivateWorkerMutation,
  useInviteWorkerByEmailMutation,
  useRemoveWorkerMembershipMutation,
} = workerApi;

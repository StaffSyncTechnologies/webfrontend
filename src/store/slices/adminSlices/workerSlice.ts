import { createApi } from '@reduxjs/toolkit/query/react';
import { WORKER, PAYROLL, HOLIDAYS, WORKER_MEMBERSHIP, ATTENDANCE } from '../../../services/endpoints';
import { baseApi } from '../../api/baseApi';

export interface Worker {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: string;
  profilePicUrl: string | null;
  createdAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface WorkerDocument {
  id: string;
  type: string;
  url: string;
  status: string;
  expiryDate: string | null;
}

export interface WorkerAvailability {
  availableDays: string[];
  preferredShifts: string[];
  unavailableDates: string[];
}

export const workerApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getWorkers: builder.query<{ data: Worker[] }, { status?: string; rtwStatus?: string; search?: string }>({
      query: (params) => ({ url: WORKER.LIST, params }),
      transformResponse: (response: { success: boolean; data: Worker[] }) => response,
    }),
    getWorkerListStats: builder.query<{
      totalWorkers: { value: number; change: number };
      activeWorkers: { value: number; change: number };
      onShift: { value: number; change: number };
      blocked: { value: number; change: number };
      suspended: { value: number; change: number };
    }, void>({
      query: () => ({ url: WORKER.LIST_STATS }),
      transformResponse: (response: { success: boolean; data: any }) => response.data,
    }),
    getWorkerHome: builder.query<any, void>({
      query: () => ({ url: WORKER.HOME }),
    }),
    exportWorkers: builder.query<Blob, { format?: string }>({
      query: (params) => ({ url: WORKER.EXPORT, params }),
    }),
    inviteWorker: builder.mutation<any, { email?: string; phone?: string; fullName: string }>({
      query: (body) => ({ url: WORKER.INVITE, method: 'POST', body }),
    }),
    getWorkerById: builder.query<Worker, string>({
      query: (workerId) => ({ url: WORKER.DETAIL(workerId) }),
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
      query: (workerId) => ({ url: WORKER.STATS(workerId) }),
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
        url: WORKER.SHIFTS(workerId),
        params: { page, limit, ...(status && { status }) },
      }),
    }),
    getWorkerProfile: builder.query<Worker, string>({
      query: (workerId) => ({ url: WORKER.PROFILE(workerId) }),
    }),
    updateWorkerProfile: builder.mutation<Worker, { workerId: string; updates: Partial<Worker> }>({
      query: ({ workerId, updates }) => ({
        url: WORKER.PROFILE(workerId),
        method: 'PUT',
        body: updates,
      }),
    }),
    getWorkerSkills: builder.query<Skill[], string>({
      query: (workerId) => ({ url: WORKER.SKILLS(workerId) }),
    }),
    updateWorkerSkills: builder.mutation<Skill[], { workerId: string; skills: string[] }>({
      query: ({ workerId, skills }) => ({
        url: WORKER.SKILLS(workerId),
        method: 'PUT',
        body: { skills },
      }),
    }),
    getWorkerRTW: builder.query<any, string>({
      query: (workerId) => ({ url: WORKER.RTW(workerId) }),
    }),
    initiateWorkerRTW: builder.mutation<any, { workerId: string; shareCode: string; dateOfBirth: string }>({
      query: ({ workerId, shareCode, dateOfBirth }) => ({
        url: WORKER.RTW_INITIATE(workerId),
        method: 'POST',
        body: { shareCode, dateOfBirth },
      }),
    }),
    updateWorkerRTW: builder.mutation<any, { workerId: string; data: any }>({
      query: ({ workerId, data }) => ({
        url: WORKER.RTW_UPDATE(workerId),
        method: 'PUT',
        body: data,
      }),
    }),
    getWorkerAvailability: builder.query<WorkerAvailability, string>({
      query: (workerId) => ({ url: WORKER.AVAILABILITY(workerId) }),
    }),
    updateWorkerAvailability: builder.mutation<WorkerAvailability, { workerId: string; availability: WorkerAvailability }>({
      query: ({ workerId, availability }) => ({
        url: WORKER.AVAILABILITY(workerId),
        method: 'PUT',
        body: availability,
      }),
    }),
    getWorkerDocuments: builder.query<WorkerDocument[], string>({
      query: (workerId) => ({ url: WORKER.DOCUMENTS(workerId) }),
    }),
    uploadWorkerDocument: builder.mutation<WorkerDocument, { workerId: string; formData: FormData }>({
      query: ({ workerId, formData }) => ({
        url: WORKER.DOCUMENTS(workerId),
        method: 'POST',
        body: formData,
      }),
    }),
    deleteWorkerDocument: builder.mutation<void, { workerId: string; docId: string }>({
      query: ({ workerId, docId }) => ({
        url: WORKER.DOCUMENT(workerId, docId),
        method: 'DELETE',
      }),
    }),
    verifyWorkerDocument: builder.mutation<any, { workerId: string; docId: string; status: string }>({
      query: ({ workerId, docId, status }) => ({
        url: WORKER.DOCUMENT_VERIFY(workerId, docId),
        method: 'PUT',
        body: { status },
      }),
    }),
    getWorkerBlocks: builder.query<any[], string>({
      query: (workerId) => ({ url: WORKER.BLOCKS(workerId) }),
    }),
    createWorkerBlock: builder.mutation<any, { workerId: string; reason: string; blockType: string; clientId?: string }>({
      query: ({ workerId, ...data }) => ({
        url: WORKER.BLOCKS(workerId),
        method: 'POST',
        body: data,
      }),
    }),
    liftWorkerBlock: builder.mutation<void, { workerId: string; blockId: string }>({
      query: ({ workerId, blockId }) => ({
        url: WORKER.BLOCK_LIFT(workerId, blockId),
        method: 'PUT',
      }),
    }),
    getWorkerReliability: builder.query<any, string>({
      query: (workerId) => ({ url: WORKER.RELIABILITY(workerId) }),
    }),
    getWorkerClients: builder.query<any[], string>({
      query: (workerId) => ({ url: WORKER.CLIENTS(workerId) }),
    }),
    assignWorkerToClient: builder.mutation<void, { workerId: string; clientId: string }>({
      query: ({ workerId, clientId }) => ({
        url: WORKER.ASSIGN_CLIENT(workerId),
        method: 'POST',
        body: { clientId },
      }),
    }),
    transferWorker: builder.mutation<void, { workerId: string; fromClientId: string; toClientId: string }>({
      query: ({ workerId, ...data }) => ({
        url: WORKER.TRANSFER(workerId),
        method: 'POST',
        body: data,
      }),
    }),
    removeWorkerFromClient: builder.mutation<void, { workerId: string; clientId: string }>({
      query: ({ workerId, clientId }) => ({
        url: WORKER.REMOVE_CLIENT(workerId),
        method: 'POST',
        body: { clientId },
      }),
    }),
    bulkAssignWorkersToClient: builder.mutation<void, { workerIds: string[]; clientId: string }>({
      query: (data) => ({
        url: WORKER.BULK_ASSIGN_CLIENT,
        method: 'POST',
        body: data,
      }),
    }),
    getAvailableWorkersForClient: builder.query<Worker[], string>({
      query: (clientCompanyId) => ({ url: WORKER.AVAILABLE_FOR_CLIENT(clientCompanyId) }),
    }),
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
        url: PAYROLL.WORKER_PAYSLIP(workerId),
        params: { page, limit },
      }),
    }),
    getWorkerHolidays: builder.query<{
      data: Array<{
        id: string;
        type: string;
        startDate: string;
        endDate: string;
        totalDays: number;
        status: string;
        createdAt: string;
      }>;
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }, { workerId: string; page?: number; limit?: number }>({
      query: ({ workerId, page = 1, limit = 10 }) => ({
        url: HOLIDAYS.ADMIN_REQUESTS,
        params: { workerId, page, limit },
      }),
    }),
    suspendWorker: builder.mutation<void, { workerId: string; reason?: string }>({
      query: ({ workerId, reason }) => ({
        url: WORKER.SUSPEND(workerId),
        method: 'PUT',
        body: { reason },
      }),
    }),
    reactivateWorker: builder.mutation<void, string>({
      query: (workerId) => ({
        url: WORKER.REACTIVATE(workerId),
        method: 'PUT',
      }),
    }),
    inviteWorkerByEmail: builder.mutation<any, { email: string; hourlyRate?: number }>({
      query: (body) => ({
        url: WORKER_MEMBERSHIP.INVITE_BY_EMAIL,
        method: 'POST',
        body,
      }),
    }),
    removeWorkerMembership: builder.mutation<void, string>({
      query: (membershipId) => ({
        url: WORKER_MEMBERSHIP.REMOVE(membershipId),
        method: 'DELETE',
      }),
    }),
    getWorkerTimesheet: builder.query<{
      weekStart: string;
      weekEnd: string;
      summary: {
        totalHours: number;
        totalEarnings: number;
        shiftsWorked: number;
        shiftsScheduled: number;
        approved: number;
        pending: number;
        flagged: number;
      };
      days: Array<{
        dayName: string;
        date: string;
        isToday: boolean;
        totalHours: number;
        totalEarnings: number;
        entries: Array<{
          shiftId: string;
          shiftTitle: string;
          location: string | null;
          client: string | null;
          scheduledStart: string;
          scheduledEnd: string;
          hourlyRate: number | null;
          clockInAt: string | null;
          clockOutAt: string | null;
          hoursWorked: number | null;
          status: string;
          flagReason: string | null;
        }>;
      }>;
    }, { workerId: string; weekStart?: string }>({
      query: ({ workerId, weekStart }) => ({
        url: ATTENDANCE.WORKER_TIMESHEET(workerId),
        params: weekStart ? { weekStart } : undefined,
      }),
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
  useGetWorkerTimesheetQuery,
} = workerApi;

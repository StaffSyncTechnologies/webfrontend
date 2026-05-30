import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../utilities/axiosBaseQuery';
import { API_BASE_URL as API_BASE } from '../../services/api';

export interface ComplianceStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  expired: number;
  requiresReview: number;
  expiringSoon: number;
  notStarted: number;
}

export interface ComplianceWorker {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: string;
  rtwStatus: 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'REQUIRES_REVIEW' | 'EXPIRED';
  rtwShareCode: string | null;
  rtwCheckedAt: string | null;
  rtwExpiresAt: string | null;
  rtwAuditNote: string | null;
  rtwCheckedBy: string | null;
  onboardingStatus: string;
  createdAt: string;
}

export interface WorkerDocument {
  id: string;
  type: string;
  documentType: string | null;
  title: string | null;
  documentNumber: string | null;
  fileName: string | null;
  fileUrl: string | null;
  status: string;
  verified: boolean;
  verifiedAt: string | null;
  verifiedBy: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  verifier?: { fullName: string } | null;
}

export interface WorkerRTWDetails extends ComplianceWorker {
  rtwAuditUrl: string | null;
  dateOfBirth: string | null;
  documents: WorkerDocument[];
}

export interface VerificationResult {
  verified: boolean;
  status: string;
  workRestriction?: string;
  expiryDate?: string;
  referenceNumber?: string;
  errorMessage?: string;
}

export interface ListWorkersParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface VerifyAPIRequest {
  workerId: string;
  shareCode: string;
  dateOfBirth: string;
}

export interface VerifyManualRequest {
  workerId: string;
  status: 'APPROVED' | 'REJECTED' | 'REQUIRES_REVIEW';
  auditNote: string;
  expiresAt?: string;
  documentType?: string;
}

export interface BulkApproveRequest {
  workerIds: string[];
  auditNote: string;
}

export const complianceApi = createApi({
  reducerPath: 'complianceApi',
  baseQuery: axiosBaseQuery({ baseUrl: API_BASE }),
  tagTypes: ['ComplianceStats', 'ComplianceWorkers', 'WorkerRTW'],
  endpoints: (builder) => ({
    // Get compliance stats
    getComplianceStats: builder.query<ComplianceStats, void>({
      query: () => ({
        url: '/compliance/stats',
        method: 'GET',
      }),
      transformResponse: (response: { success: boolean; data: ComplianceStats }) => response.data,
      providesTags: ['ComplianceStats'],
    }),

    // List workers for compliance review
    listComplianceWorkers: builder.query<
      { workers: ComplianceWorker[]; pagination: { page: number; limit: number; total: number; totalPages: number } },
      ListWorkersParams
    >({
      query: (params) => ({
        url: '/compliance/workers',
        method: 'GET',
        params,
      }),
      transformResponse: (response: { success: boolean; data: any }) => response.data,
      providesTags: ['ComplianceWorkers'],
    }),

    // Get single worker RTW details
    getWorkerRTW: builder.query<WorkerRTWDetails, string>({
      query: (workerId) => ({
        url: `/compliance/workers/${workerId}`,
        method: 'GET',
      }),
      transformResponse: (response: { success: boolean; data: WorkerRTWDetails }) => response.data,
      providesTags: (_result, _error, workerId) => [{ type: 'WorkerRTW', id: workerId }],
    }),

    // Verify RTW using API
    verifyRTWApi: builder.mutation<
      { workerId: string; rtwStatus: string; verificationResult: VerificationResult },
      VerifyAPIRequest
    >({
      query: ({ workerId, ...body }) => ({
        url: `/compliance/workers/${workerId}/verify-api`,
        method: 'POST',
        data: body,
      }),
      transformResponse: (response: { success: boolean; data: any }) => response.data,
      invalidatesTags: ['ComplianceStats', 'ComplianceWorkers', 'WorkerRTW'],
    }),

    // Manual RTW verification
    verifyRTWManual: builder.mutation<
      { workerId: string; rtwStatus: string; rtwCheckedAt: string; rtwAuditNote: string },
      VerifyManualRequest
    >({
      query: ({ workerId, ...body }) => ({
        url: `/compliance/workers/${workerId}/verify-manual`,
        method: 'POST',
        data: body,
      }),
      transformResponse: (response: { success: boolean; data: any }) => response.data,
      invalidatesTags: ['ComplianceStats', 'ComplianceWorkers', 'WorkerRTW'],
    }),

    // Bulk approve workers
    bulkApprove: builder.mutation<{ approvedCount: number }, BulkApproveRequest>({
      query: (body) => ({
        url: '/compliance/bulk-approve',
        method: 'POST',
        data: body,
      }),
      transformResponse: (response: { success: boolean; data: any }) => response.data,
      invalidatesTags: ['ComplianceStats', 'ComplianceWorkers'],
    }),

    // Get worker documents
    getWorkerDocuments: builder.query<WorkerDocument[], string>({
      query: (workerId) => ({
        url: `/workers/${workerId}/documents`,
        method: 'GET',
      }),
      transformResponse: (response: { success: boolean; data: WorkerDocument[] }) => response.data,
      providesTags: (_result, _error, workerId) => [{ type: 'WorkerRTW', id: workerId }],
    }),

    // Verify document
    verifyDocument: builder.mutation<WorkerDocument, { workerId: string; docId: string }>({
      query: ({ workerId, docId }) => ({
        url: `/workers/${workerId}/documents/${docId}/verify`,
        method: 'PUT',
      }),
      transformResponse: (response: { success: boolean; data: WorkerDocument }) => response.data,
      invalidatesTags: ['ComplianceWorkers', 'WorkerRTW'],
    }),
  }),
});

export const {
  useGetComplianceStatsQuery,
  useListComplianceWorkersQuery,
  useGetWorkerRTWQuery,
  useVerifyRTWApiMutation,
  useVerifyRTWManualMutation,
  useBulkApproveMutation,
  useGetWorkerDocumentsQuery,
  useVerifyDocumentMutation,
} = complianceApi;

import { baseApi } from '../../api/baseApi';

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

export interface ComplianceDocument {
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
  mimeType?: string;
}

export interface WorkerRTWDetails extends ComplianceWorker {
  rtwAuditUrl: string | null;
  dateOfBirth: string | null;
  documents: ComplianceDocument[];
}

export interface VerifyManualRequest {
  workerId: string;
  status: 'APPROVED' | 'REJECTED' | 'REQUIRES_REVIEW';
  auditNote: string;
  expiresAt?: string;
}

export const complianceApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getComplianceStats: builder.query<ComplianceStats, void>({
      query: () => ({ url: '/compliance/stats' }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ['ComplianceStats'] as any,
    }),

    listComplianceWorkers: builder.query<
      { workers: ComplianceWorker[]; pagination: any },
      { status?: string; search?: string; page?: number; limit?: number }
    >({
      query: (params) => ({ url: '/compliance/workers', params }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ['ComplianceWorkers'] as any,
    }),

    getComplianceWorker: builder.query<WorkerRTWDetails, string>({
      query: (workerId) => ({ url: `/compliance/workers/${workerId}` }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: (_r: any, _e: any, id: string) => [{ type: 'ComplianceWorker' as any, id }],
    }),

    verifyRTWManual: builder.mutation<any, VerifyManualRequest>({
      query: ({ workerId, ...body }) => ({
        url: `/compliance/workers/${workerId}/verify-manual`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response?.data ?? response,
      invalidatesTags: ['ComplianceStats', 'ComplianceWorkers'] as any,
    }),

    getComplianceDocuments: builder.query<ComplianceDocument[], string>({
      query: (workerId) => ({ url: `/workers/${workerId}/documents` }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: (_r: any, _e: any, id: string) => [{ type: 'ComplianceWorker' as any, id }],
    }),

    verifyComplianceDocument: builder.mutation<any, { workerId: string; docId: string }>({
      query: ({ workerId, docId }) => ({
        url: `/workers/${workerId}/documents/${docId}/verify`,
        method: 'PUT',
      }),
      transformResponse: (response: any) => response?.data ?? response,
      invalidatesTags: ['ComplianceWorkers'] as any,
    }),
  }),
});

export const {
  useGetComplianceStatsQuery,
  useListComplianceWorkersQuery,
  useGetComplianceWorkerQuery,
  useVerifyRTWManualMutation,
  useGetComplianceDocumentsQuery,
  useVerifyComplianceDocumentMutation,
} = complianceApi;

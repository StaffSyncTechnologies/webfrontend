import { createApi } from '@reduxjs/toolkit/query/react';
import { BANK_ACCOUNT } from '../../utilities/endpoint';
import { axiosBaseQuery } from '../../utilities/axiosBaseQuery';

// Types
export interface BankAccountDetails {
  id: string;
  workerId: string;
  accountHolder: string;
  bankName: string;
  sortCode: string;
  accountNumber: string;
  buildingSocietyRef: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaveBankAccountRequest {
  accountHolder: string;
  bankName: string;
  sortCode: string;
  accountNumber: string;
  buildingSocietyRef?: string;
}

export interface WorkerBankAccountListItem {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  niNumber: string | null;
  profilePicUrl: string | null;
  bankAccount: BankAccountDetails | null;
  hasBankAccount: boolean;
  isVerified: boolean;
}

export interface BankAccountListResponse {
  workers: WorkerBankAccountListItem[];
  stats: {
    total: number;
    withBankAccount: number;
    missingBankAccount: number;
    verified: number;
    unverified: number;
  };
}

export interface PaymentSheetSummary {
  payPeriod: {
    id: string;
    startDate: string;
    endDate: string;
    status: string;
  };
  workerCount: number;
  withBankDetails: number;
  missingBankDetails: number;
  totalGrossPay: number;
  totalNetPay: number;
  workers: Array<{
    id: string;
    name: string;
    netPay: number;
    hasBankAccount: boolean;
    bankVerified: boolean;
  }>;
}

export const bankAccountApi = createApi({
  reducerPath: 'bankAccountApi',
  baseQuery: axiosBaseQuery({
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.authorization = `Bearer ${token}`;
      }
      return headers;
    },
  }),
  tagTypes: ['BankAccount', 'BankAccountList', 'PaymentSheet'],
  endpoints: (builder) => ({
    // List all workers with bank account status
    listBankAccounts: builder.query<BankAccountListResponse, { search?: string; status?: string } | void>({
      query: (params) => ({
        url: BANK_ACCOUNT.LIST,
        method: 'GET',
        params: params || {},
      }),
      transformResponse: (response: any) => response?.data ?? { workers: [], stats: { total: 0, withBankAccount: 0, missingBankAccount: 0, verified: 0, unverified: 0 } },
      providesTags: ['BankAccountList'],
    }),

    // Get worker bank account (admin view)
    getWorkerBankAccount: builder.query<BankAccountDetails | null, string>({
      query: (workerId) => ({
        url: BANK_ACCOUNT.WORKER(workerId),
        method: 'GET',
      }),
      transformResponse: (response: any) => response?.data ?? null,
      providesTags: (_result, _error, workerId) => [{ type: 'BankAccount', id: workerId }],
    }),

    // Update worker bank account (admin)
    updateWorkerBankAccount: builder.mutation<BankAccountDetails, { workerId: string; data: SaveBankAccountRequest }>({
      query: ({ workerId, data }) => ({
        url: BANK_ACCOUNT.WORKER_UPDATE(workerId),
        method: 'PUT',
        data,
      }),
      transformResponse: (response: any) => response?.data ?? response,
      invalidatesTags: (_result, _error, { workerId }) => [{ type: 'BankAccount', id: workerId }, 'BankAccountList'],
    }),

    // Verify worker bank account
    verifyBankAccount: builder.mutation<void, string>({
      query: (workerId) => ({
        url: BANK_ACCOUNT.VERIFY(workerId),
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, workerId) => [{ type: 'BankAccount', id: workerId }, 'BankAccountList'],
    }),

    // Get payment sheet summary
    getPaymentSheetSummary: builder.query<PaymentSheetSummary | null, { payPeriodId?: string } | void>({
      query: (params) => ({
        url: BANK_ACCOUNT.PAYMENT_SHEET_SUMMARY,
        method: 'GET',
        params: params || {},
      }),
      transformResponse: (response: any) => response?.data ?? null,
      providesTags: ['PaymentSheet'],
    }),
  }),
});

export const {
  useListBankAccountsQuery,
  useGetWorkerBankAccountQuery,
  useUpdateWorkerBankAccountMutation,
  useVerifyBankAccountMutation,
  useGetPaymentSheetSummaryQuery,
} = bankAccountApi;

import { createApi } from '@reduxjs/toolkit/query/react';
import { BANK_ACCOUNT } from '../../../services/endpoints';
import { baseApi } from '../../api/baseApi';

export interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  sortCode: string;
  bankName: string;
  isVerified: boolean;
  verificationStatus: string;
}

export const bankAccountApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getList: builder.query<{ data: BankAccount[] }, void>({
      query: () => ({ url: BANK_ACCOUNT.LIST }),
    }),

    getMyBankAccount: builder.query<BankAccount, void>({
      query: () => ({ url: BANK_ACCOUNT.ME }),
    }),

    saveBankAccount: builder.mutation<BankAccount, Partial<BankAccount>>({
      query: (body) => ({ url: BANK_ACCOUNT.SAVE, method: 'POST', body }),
    }),

    getWorkerBankAccount: builder.query<BankAccount, string>({
      query: (workerId) => ({ url: BANK_ACCOUNT.WORKER(workerId) }),
    }),

    updateWorkerBankAccount: builder.mutation<BankAccount, { workerId: string; data: Partial<BankAccount> }>({
      query: ({ workerId, data }) => ({
        url: BANK_ACCOUNT.WORKER_UPDATE(workerId),
        method: 'PUT',
        body: data,
      }),
    }),

    verifyBankAccount: builder.mutation<any, { workerId: string }>({
      query: ({ workerId }) => ({ url: BANK_ACCOUNT.VERIFY(workerId), method: 'POST' }),
    }),

    getPaymentSheet: builder.query<any, void>({
      query: () => ({ url: BANK_ACCOUNT.PAYMENT_SHEET }),
    }),

    getPaymentSheetSummary: builder.query<any, void>({
      query: () => ({ url: BANK_ACCOUNT.PAYMENT_SHEET_SUMMARY }),
    }),
  }),
});

export const {
  useGetListQuery,
  useGetMyBankAccountQuery,
  useSaveBankAccountMutation,
  useGetWorkerBankAccountQuery,
  useUpdateWorkerBankAccountMutation,
  useVerifyBankAccountMutation,
  useGetPaymentSheetQuery,
  useGetPaymentSheetSummaryQuery,
} = bankAccountApi;

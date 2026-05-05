import { createApi } from '@reduxjs/toolkit/query/react';
import { PAYROLL } from '../../../services/endpoints';
import { baseApi } from '../../api/baseApi';

export interface Payslip {
  id: string;
  periodStart: string;
  periodEnd: string;
  payRate: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  status: string;
  createdAt: string;
}

export const payrollApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminList: builder.query<{ data: Payslip[] }, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => ({
        url: PAYROLL.ADMIN_LIST,
        params: { page, limit },
      }),
    }),

    generatePayslips: builder.mutation<any, { periodStart: string; periodEnd: string }>({
      query: (body) => ({ url: PAYROLL.GENERATE, method: 'POST', body }),
    }),

    bulkApprove: builder.mutation<void, { payslipIds: string[] }>({
      query: (body) => ({ url: PAYROLL.BULK_APPROVE, method: 'POST', body }),
    }),

    getTeamSummary: builder.query<any, void>({
      query: () => ({ url: PAYROLL.TEAM_SUMMARY }),
    }),

    getPayslipDetail: builder.query<Payslip, string>({
      query: (payslipId) => ({ url: PAYROLL.DETAIL(payslipId) }),
    }),

    approvePayslip: builder.mutation<void, string>({
      query: (payslipId) => ({ url: PAYROLL.APPROVE(payslipId), method: 'POST' }),
    }),

    markPaid: builder.mutation<void, string>({
      query: (payslipId) => ({ url: PAYROLL.MARK_PAID(payslipId), method: 'POST' }),
    }),

    getWorkerPayslip: builder.query<{ data: Payslip[] }, string>({
      query: (workerId) => ({ url: PAYROLL.WORKER_PAYSLIP(workerId) }),
    }),

    getMyPayslip: builder.query<Payslip, void>({
      query: () => ({ url: PAYROLL.MY_PAYSLIP }),
    }),

    getPayslipList: builder.query<{ data: Payslip[] }, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => ({
        url: PAYROLL.LIST,
        params: { page, limit },
      }),
    }),
  }),
});

export const {
  useGetAdminListQuery,
  useGeneratePayslipsMutation,
  useBulkApproveMutation,
  useGetTeamSummaryQuery,
  useGetPayslipDetailQuery,
  useApprovePayslipMutation,
  useMarkPaidMutation,
  useGetWorkerPayslipQuery,
  useGetMyPayslipQuery,
  useGetPayslipListQuery,
} = payrollApi;

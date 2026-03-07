import { createApi } from '@reduxjs/toolkit/query/react';
import { PAYROLL } from '../../utilities/endpoint';
import { axiosBaseQuery } from '../../utilities/axiosBaseQuery';

// Types
export interface PayslipListItem {
  id: string;
  worker: {
    id: string;
    fullName: string;
    email: string;
  };
  periodStart: string;
  periodEnd: string;
  totalHours: number;
  grossPay: number;
  netPay: number;
  status: 'DRAFT' | 'APPROVED' | 'PAID';
}

export interface PayslipListResponse {
  payslips: PayslipListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  counts: {
    draft: number;
    approved: number;
    paid: number;
  };
}

export interface PayslipDetail {
  payments: Array<{ time: number; rate: number; amount: number }>;
  benefits: Array<{ name: string; amount: number }>;
  deductions: Array<{ name: string; amount: number }>;
  yearToDate: {
    grossPay: number;
    taxablePay: number;
    tax: number;
    employeeNI: number;
    employerNI: number;
    employeePension: number;
    employerPension: number;
  };
  summary: {
    basicPay: number;
    grossPay: number;
    deductions: number;
    netPay: number;
  };
  employee: {
    name: string;
    email: string;
    empCode: string;
    payrollNumber: string;
    taxCode: string;
    niNumber: string;
    niCode: string;
  };
  period: {
    number: number;
    batchNumber: number;
    payDate: string | null;
    payMethod: string;
    startDate: string;
    endDate: string;
  };
  status: string;
  holidayBalance?: number;
}

export interface PayslipListParams {
  page?: number;
  limit?: number;
  status?: 'DRAFT' | 'APPROVED' | 'PAID';
  payPeriodId?: string;
}

export const payrollApi = createApi({
  reducerPath: 'payrollApi',
  baseQuery: axiosBaseQuery({
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.authorization = `Bearer ${token}`;
      }
      return headers;
    },
  }),
  tagTypes: ['Payroll', 'PayslipDetail'],
  endpoints: (builder) => ({
    // Get admin payslip list
    getPayslipList: builder.query<PayslipListResponse, PayslipListParams>({
      query: (params = {}) => ({
        url: PAYROLL.ADMIN_LIST,
        method: 'GET',
        params,
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ['Payroll'],
    }),

    // Get payslip detail
    getPayslipDetail: builder.query<PayslipDetail, string>({
      query: (payslipId) => ({
        url: PAYROLL.DETAIL(payslipId),
        method: 'GET',
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: (_result, _error, id) => [{ type: 'PayslipDetail', id }],
    }),

    // Generate payslips for current period
    generatePayslips: builder.mutation<{ payPeriodId: string; count: number }, { startDate?: string; endDate?: string }>({
      query: (body) => ({
        url: PAYROLL.GENERATE,
        method: 'POST',
        data: body,
      }),
      transformResponse: (response: any) => response?.data ?? response,
      invalidatesTags: ['Payroll'],
    }),

    // Approve single payslip
    approvePayslip: builder.mutation<void, string>({
      query: (payslipId) => ({
        url: PAYROLL.APPROVE(payslipId),
        method: 'POST',
      }),
      invalidatesTags: ['Payroll'],
    }),

    // Bulk approve payslips
    bulkApprovePayslips: builder.mutation<{ approvedCount: number }, string[]>({
      query: (payslipIds) => ({
        url: PAYROLL.BULK_APPROVE,
        method: 'POST',
        data: { payslipIds },
      }),
      transformResponse: (response: any) => response?.data ?? response,
      invalidatesTags: ['Payroll'],
    }),

    // Mark payslip as paid
    markPayslipPaid: builder.mutation<void, string>({
      query: (payslipId) => ({
        url: PAYROLL.MARK_PAID(payslipId),
        method: 'POST',
      }),
      invalidatesTags: ['Payroll'],
    }),

    // Get team summary
    getTeamSummary: builder.query<any, void>({
      query: () => ({
        url: PAYROLL.TEAM_SUMMARY,
        method: 'GET',
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ['Payroll'],
    }),
  }),
});

export const {
  useGetPayslipListQuery,
  useGetPayslipDetailQuery,
  useGeneratePayslipsMutation,
  useApprovePayslipMutation,
  useBulkApprovePayslipsMutation,
  useMarkPayslipPaidMutation,
  useGetTeamSummaryQuery,
} = payrollApi;

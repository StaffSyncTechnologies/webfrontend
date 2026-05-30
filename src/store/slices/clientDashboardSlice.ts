import { createApi } from '@reduxjs/toolkit/query/react';
import { CLIENT } from '../../utilities/endpoint';
import { axiosBaseQuery } from '../../utilities/axiosBaseQuery';

// ============ Backend Response Types ============

// Matches backend getDashboard response.data.stats
export interface ClientDashboardStats {
  workersOnsite: number;
  totalShifts: number;
  pendingTimesheets: number;
  totalMoneySpent: number;
  shiftFillRate: { date: string; fillRate: number }[];
  workersAvailability: { active: number; available: number; booked: number };
  activeShifts: number;
  upcomingShifts: number;
}

export interface TodaysWorker {
  id: string;
  worker: { id: string; fullName: string };
  shift: { title: string; startAt: string; endAt: string };
}

export interface RecentInvoice {
  id: string;
  invoiceNumber: string;
  total: number;
  status: string;
  dueDate: string;
}

export interface RecentActivity {
  id: string;
  worker: string;
  clockIn: string;
  clockOut: string | null;
  department: string;
  status: string;
  action: string;
}

export interface ClientDashboardResponse {
  stats: ClientDashboardStats;
  todaysWorkers: TodaysWorker[];
  recentInvoices: RecentInvoice[];
  recentActivity: RecentActivity[];
}

// Matches backend getShifts response.data[]
export interface ClientShift {
  id: string;
  title: string;
  role: string;
  status: string;
  startAt: string;
  endAt: string;
  workersNeeded: number;
  siteLocation?: string;
  notes?: string;
  payRate?: number;
  assignments: {
    id: string;
    status: string;
    worker: { id: string; fullName: string };
  }[];
  _count: { assignments: number };
  location?: { name: string };
}

// Matches backend getTimesheets response.data[]
export interface ClientTimesheet {
  id: string;
  clockInAt: string;
  clockOutAt: string | null;
  hoursWorked: number | null;
  status: string;
  worker: { id: string; fullName: string };
  shift: { id: string; title: string; role: string; startAt: string; endAt: string };
}

// Matches backend getInvoices response.data[]
export interface ClientInvoice {
  id: string;
  invoiceNumber: string;
  total: number;
  status: string;
  dueDate: string;
  createdAt: string;
  periodStart?: string;
  periodEnd?: string;
}

// Matches backend getAssignedWorkers response.data[]
export interface ClientWorker {
  id: string;
  fullName: string;
  workerSkills: { skill: { id: string; name: string } }[];
  reliabilityScore: { score: number; avgRating: number } | null;
  _count: { shiftAssignments: number };
  isBlocked: boolean;
  shiftsWorked: number;
}

export const clientDashboardApi = createApi({
  reducerPath: 'clientDashboardApi',
  baseQuery: axiosBaseQuery({
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.authorization = `Bearer ${token}`;
      }
      return headers;
    },
  }),
  tagTypes: ['ClientDashboard', 'ClientShifts', 'ClientTimesheets', 'ClientInvoices'],
  endpoints: (builder) => ({
    // Get client dashboard overview
    getClientDashboard: builder.query<ClientDashboardResponse, void>({
      query: () => ({
        url: CLIENT.DASHBOARD,
        method: 'GET',
      }),
      providesTags: ['ClientDashboard'],
      transformResponse: (response: any) => {
        if (response?.success && response?.data) return response.data;
        if (response?.data) return response.data;
        if (response?.stats) return response;
        return response;
      },
    }),

    // Get client shifts
    getClientShifts: builder.query<ClientShift[], { status?: string; from?: string; to?: string }>({
      query: ({ status, from, to } = {}) => ({
        url: CLIENT.SHIFTS,
        method: 'GET',
        params: { ...(status && status !== 'all' ? { status } : {}), from, to },
      }),
      providesTags: ['ClientShifts'],
      transformResponse: (response: any) => {
        if (response?.success && Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response)) return response;
        return [];
      },
    }),

    // Get client timesheets (attendance records)
    getClientTimesheets: builder.query<ClientTimesheet[], { status?: string; from?: string; to?: string }>({
      query: ({ status, from, to } = {}) => ({
        url: CLIENT.TIMESHEETS,
        method: 'GET',
        params: { ...(status && status !== 'all' ? { status } : {}), from, to },
      }),
      providesTags: ['ClientTimesheets'],
      transformResponse: (response: any) => {
        if (response?.success && Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response)) return response;
        return [];
      },
    }),

    // Get client invoices
    getClientInvoices: builder.query<ClientInvoice[], { status?: string }>({
      query: ({ status } = {}) => ({
        url: CLIENT.INVOICES,
        method: 'GET',
        params: { ...(status && status !== 'all' ? { status } : {}) },
      }),
      providesTags: ['ClientInvoices'],
      transformResponse: (response: any) => {
        if (response?.success && Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response)) return response;
        return [];
      },
    }),

    // Get assigned workers
    getClientWorkers: builder.query<ClientWorker[], void>({
      query: () => ({
        url: CLIENT.WORKERS,
        method: 'GET',
      }),
      providesTags: ['ClientDashboard'],
      transformResponse: (response: any) => {
        if (response?.success && Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response)) return response;
        return [];
      },
    }),

    // Get shift details
    getClientShiftDetails: builder.query<any, string>({
      query: (shiftId) => ({
        url: CLIENT.SHIFT_DETAILS(shiftId),
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        console.log('Raw API response:', response);
        // Extract the actual shift data from the wrapped response
        if (response?.success && response?.data) {
          console.log('Extracted shift data:', response.data);
          return response.data;
        }
        return response;
      },
      providesTags: ['ClientShifts'],
    }),

    // Get timesheet details
    getClientTimesheetDetails: builder.query<any, string>({
      query: (timesheetId) => ({
        url: CLIENT.TIMESHEET_DETAILS(timesheetId),
        method: 'GET',
      }),
      providesTags: ['ClientTimesheets'],
    }),

    // Get invoice details
    getClientInvoiceDetails: builder.query<any, string>({
      query: (invoiceId) => ({
        url: CLIENT.INVOICE_DETAILS(invoiceId),
        method: 'GET',
      }),
      providesTags: ['ClientInvoices'],
    }),

    // Approve timesheet
    approveClientTimesheet: builder.mutation<void, string>({
      query: (timesheetId) => ({
        url: CLIENT.APPROVE_TIMESHEET(timesheetId),
        method: 'POST',
      }),
      invalidatesTags: ['ClientTimesheets', 'ClientDashboard'],
    }),

    // Dispute timesheet
    disputeClientTimesheet: builder.mutation<void, { timesheetId: string; reason: string; description?: string }>({
      query: ({ timesheetId, ...data }) => ({
        url: CLIENT.DISPUTE_TIMESHEET(timesheetId),
        method: 'POST',
        data,
      }),
      invalidatesTags: ['ClientTimesheets', 'ClientDashboard'],
    }),

    // Request workers for shift
    requestWorkers: builder.mutation<any, { 
      locationId?: string;
      siteLocation?: string;
      role: string;
      date: string;
      startTime: string;
      endTime: string;
      workersNeeded: number;
      requiredSkillIds?: string[];
      notes?: string;
    }>({
      query: (data) => ({
        url: CLIENT.REQUEST_WORKERS,
        method: 'POST',
        data,
      }),
      invalidatesTags: ['ClientShifts', 'ClientDashboard'],
    }),

    // Cancel shift
    cancelClientShift: builder.mutation<void, string>({
      query: (shiftId) => ({
        url: CLIENT.CANCEL_SHIFT(shiftId),
        method: 'PUT',
      }),
      invalidatesTags: ['ClientShifts', 'ClientDashboard'],
    }),

    // Get worker profile
    getClientWorkerProfile: builder.query<any, string>({
      query: (workerId) => ({
        url: CLIENT.WORKER_PROFILE(workerId),
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        if (response?.success && response?.data) return response.data;
        return response?.data || response;
      },
    }),

    // Rate worker
    rateClientWorker: builder.mutation<void, { workerId: string; rating: number; shiftId?: string; feedback?: string }>({
      query: ({ workerId, ...data }) => ({
        url: CLIENT.RATE_WORKER(workerId),
        method: 'POST',
        data,
      }),
    }),

    // Block worker
    blockClientWorker: builder.mutation<void, { workerId: string; reason: string; notes?: string }>({
      query: ({ workerId, ...data }) => ({
        url: CLIENT.BLOCK_WORKER(workerId),
        method: 'POST',
        data,
      }),
      invalidatesTags: ['ClientDashboard'],
    }),

    // Get weekly timesheet summary
    getClientWeeklyTimesheets: builder.query<any, { weekStart?: string }>({ 
      query: ({ weekStart } = {}) => ({
        url: CLIENT.WEEKLY_TIMESHEETS,
        method: 'GET',
        params: { ...(weekStart ? { weekStart } : {}) },
      }),
      providesTags: ['ClientTimesheets'],
      transformResponse: (response: any) => {
        if (response?.success && response?.data) return response.data;
        return response?.data || response;
      },
    }),

    // Get weekly timesheet details
    getClientWeeklyTimesheetDetails: builder.query<any, { weekStart?: string; workerId?: string }>({
      query: ({ weekStart, workerId } = {}) => ({
        url: CLIENT.WEEKLY_TIMESHEET_DETAILS,
        method: 'GET',
        params: { ...(weekStart ? { weekStart } : {}), ...(workerId ? { workerId } : {}) },
      }),
      providesTags: ['ClientTimesheets'],
      transformResponse: (response: any) => {
        if (response?.success && response?.data) return response.data;
        return response?.data || response;
      },
    }),

    // Generate weekly invoice
    generateClientInvoice: builder.mutation<any, { weekStart: string }>({ 
      query: (data) => ({
        url: CLIENT.GENERATE_INVOICE,
        method: 'POST',
        data,
      }),
      invalidatesTags: ['ClientInvoices', 'ClientDashboard'],
    }),

    // Download invoice
    downloadClientInvoice: builder.query<any, string>({
      query: (invoiceId) => ({
        url: CLIENT.DOWNLOAD_INVOICE(invoiceId),
        method: 'GET',
      }),
    }),

    // Get settings
    getClientSettings: builder.query<any, void>({
      query: () => ({
        url: CLIENT.SETTINGS,
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        if (response?.success && response?.data) return response.data;
        return response?.data || response;
      },
    }),

    // Update settings
    updateClientSettings: builder.mutation<any, Record<string, any>>({
      query: (data) => ({
        url: CLIENT.SETTINGS,
        method: 'PUT',
        data,
      }),
    }),

    // Get hours report
    getClientHoursReport: builder.query<any, { from?: string; to?: string }>({
      query: ({ from, to }) => ({
        url: CLIENT.HOURS_REPORT,
        method: 'GET',
        params: { from, to },
      }),
      transformResponse: (response: any) => response?.data || response,
    }),

    // Get spend report
    getClientSpendReport: builder.query<any, { from?: string; to?: string }>({
      query: ({ from, to }) => ({
        url: CLIENT.SPEND_REPORT,
        method: 'GET',
        params: { from, to },
      }),
      transformResponse: (response: any) => response?.data || response,
    }),
  }),
});

export const {
  useGetClientDashboardQuery,
  useGetClientShiftsQuery,
  useGetClientTimesheetsQuery,
  useGetClientInvoicesQuery,
  useGetClientShiftDetailsQuery,
  useGetClientTimesheetDetailsQuery,
  useGetClientInvoiceDetailsQuery,
  useApproveClientTimesheetMutation,
  useDisputeClientTimesheetMutation,
  useRequestWorkersMutation,
  useCancelClientShiftMutation,
  useGetClientWorkersQuery,
  useGetClientWorkerProfileQuery,
  useRateClientWorkerMutation,
  useBlockClientWorkerMutation,
  useGetClientWeeklyTimesheetsQuery,
  useGetClientWeeklyTimesheetDetailsQuery,
  useGenerateClientInvoiceMutation,
  useDownloadClientInvoiceQuery,
  useGetClientSettingsQuery,
  useUpdateClientSettingsMutation,
  useGetClientHoursReportQuery,
  useGetClientSpendReportQuery,
} = clientDashboardApi;

// All types are already exported above with their interface declarations

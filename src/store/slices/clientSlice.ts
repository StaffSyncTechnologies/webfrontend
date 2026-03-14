import { createApi } from '@reduxjs/toolkit/query/react';
import { CLIENT, CLIENT_REGISTRATION } from '../../utilities/endpoint.ts';
import { axiosBaseQuery } from '../../utilities/axiosBaseQuery.ts';
import type { 
  ClientDashboard,
  ClientWorker,
  ClientWorkerProfile,
  RateWorkerRequest,
  ClientShift,
  RequestWorkersRequest,
  ClientTimesheet,
  ApproveTimesheetRequest,
  DisputeTimesheetRequest,
  ClientInvoice,
  HoursReport,
  SpendReport,
  ClientSettings,
  ClientUser,
  CreateClientUserRequest,
  UpdateClientUserRequest,
  ApiResponse,
  ClientRegistrationRequest
} from '../../types/api.ts';

export const clientApi = createApi({
  reducerPath: 'clientApi',
  baseQuery: axiosBaseQuery({
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.authorization = `Bearer ${token}`;
      }
      return headers;
    },
  }),
  tagTypes: ['Client', 'ClientWorker', 'ClientShift', 'ClientTimesheet', 'ClientInvoice', 'ClientUser'],
  endpoints: (builder) => ({
    // Authentication
    clientLogin: builder.mutation<ApiResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: CLIENT.LOGIN,
        method: 'POST',
        body: credentials,
      }),
    }),
    
    clientForgotPassword: builder.mutation<ApiResponse, { email: string }>({
      query: (request) => ({
        url: CLIENT.FORGOT_PASSWORD,
        method: 'POST',
        body: request,
      }),
    }),
    
    // Dashboard
    getClientDashboard: builder.query<ClientDashboard, void>({
      query: () => ({
        url: CLIENT.DASHBOARD,
        method: 'GET',
      }),
      providesTags: ['Client'],
    }),
    
    // Workers
    getAssignedWorkers: builder.query<ClientWorker[], void>({
      query: () => ({
        url: CLIENT.WORKERS,
        method: 'GET',
      }),
      providesTags: ['ClientWorker'],
    }),
    
    getWorkerProfile: builder.query<ClientWorkerProfile, string>({
      query: (workerId) => ({
        url: CLIENT.WORKER_PROFILE(workerId),
        method: 'GET',
      }),
      providesTags: (_result, _error, workerId) => [{ type: 'ClientWorker', id: workerId }],
    }),
    
    rateWorker: builder.mutation<ApiResponse, { workerId: string; rating: RateWorkerRequest }>({
      query: ({ workerId, rating }) => ({
        url: CLIENT.RATE_WORKER(workerId),
        method: 'POST',
        body: rating,
      }),
      invalidatesTags: (_result, _error, { workerId }) => [{ type: 'ClientWorker', id: workerId }],
    }),
    
    blockWorker: builder.mutation<ApiResponse, string>({
      query: (workerId) => ({
        url: CLIENT.BLOCK_WORKER(workerId),
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, workerId) => [{ type: 'ClientWorker', id: workerId }],
    }),
    
    // Shifts / Bookings
    getShifts: builder.query<ClientShift[], { status?: string; startDate?: string; endDate?: string }>({
      query: (params) => ({
        url: CLIENT.SHIFTS,
        method: 'GET',
        params,
      }),
      providesTags: ['ClientShift'],
    }),
    
    getShiftDetails: builder.query<ClientShift, string>({
      query: (shiftId) => ({
        url: CLIENT.SHIFT_DETAILS(shiftId),
        method: 'GET',
      }),
      providesTags: (_result, _error, shiftId) => [{ type: 'ClientShift', id: shiftId }],
    }),
    
    requestWorkers: builder.mutation<ClientShift, RequestWorkersRequest>({
      query: (request) => ({
        url: CLIENT.REQUEST_WORKERS,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['ClientShift'],
    }),
    
    cancelShiftRequest: builder.mutation<ApiResponse, string>({
      query: (shiftId) => ({
        url: CLIENT.CANCEL_SHIFT(shiftId),
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, shiftId) => [{ type: 'ClientShift', id: shiftId }],
    }),
    
    // Timesheets
    getTimesheets: builder.query<ClientTimesheet[], { status?: string; startDate?: string; endDate?: string }>({
      query: (params) => ({
        url: CLIENT.TIMESHEETS,
        method: 'GET',
        params,
      }),
      providesTags: ['ClientTimesheet'],
    }),
    
    getTimesheetDetails: builder.query<ClientTimesheet, string>({
      query: (timesheetId) => ({
        url: CLIENT.TIMESHEET_DETAILS(timesheetId),
        method: 'GET',
      }),
      providesTags: (_result, _error, timesheetId) => [{ type: 'ClientTimesheet', id: timesheetId }],
    }),
    
    approveTimesheet: builder.mutation<ApiResponse, { timesheetId: string; request: ApproveTimesheetRequest }>({
      query: ({ timesheetId, request }) => ({
        url: CLIENT.APPROVE_TIMESHEET(timesheetId),
        method: 'POST',
        body: request,
      }),
      invalidatesTags: (_result, _error, { timesheetId }) => [
        { type: 'ClientTimesheet', id: timesheetId },
        'ClientTimesheet'
      ],
    }),
    
    disputeTimesheet: builder.mutation<ApiResponse, { timesheetId: string; request: DisputeTimesheetRequest }>({
      query: ({ timesheetId, request }) => ({
        url: CLIENT.DISPUTE_TIMESHEET(timesheetId),
        method: 'POST',
        body: request,
      }),
      invalidatesTags: (_result, _error, { timesheetId }) => [
        { type: 'ClientTimesheet', id: timesheetId },
        'ClientTimesheet'
      ],
    }),
    
    // Invoices
    getInvoices: builder.query<ClientInvoice[], { status?: string; year?: string; month?: string }>({
      query: (params) => ({
        url: CLIENT.INVOICES,
        method: 'GET',
        params,
      }),
      providesTags: ['ClientInvoice'],
    }),
    
    getInvoiceDetails: builder.query<ClientInvoice, string>({
      query: (invoiceId) => ({
        url: CLIENT.INVOICE_DETAILS(invoiceId),
        method: 'GET',
      }),
      providesTags: (_result, _error, invoiceId) => [{ type: 'ClientInvoice', id: invoiceId }],
    }),
    
    downloadInvoice: builder.mutation<Blob, string>({
      query: (invoiceId) => ({
        url: CLIENT.DOWNLOAD_INVOICE(invoiceId),
        method: 'GET',
        responseHandler: (response: Response) => response.blob(),
      }),
    }),
    
    // Reports
    getHoursReport: builder.query<HoursReport, { period: string }>({
      query: (params) => ({
        url: CLIENT.HOURS_REPORT,
        method: 'GET',
        params,
      }),
    }),
    
    getSpendReport: builder.query<SpendReport, { period: string }>({
      query: (params) => ({
        url: CLIENT.SPEND_REPORT,
        method: 'GET',
        params,
      }),
    }),
    
    // Settings
    getSettings: builder.query<ClientSettings, void>({
      query: () => ({
        url: CLIENT.SETTINGS,
        method: 'GET',
      }),
      providesTags: ['Client'],
    }),
    
    updateSettings: builder.mutation<ApiResponse, Partial<ClientSettings>>({
      query: (settings) => ({
        url: CLIENT.SETTINGS,
        method: 'PUT',
        body: settings,
      }),
      invalidatesTags: ['Client'],
    }),
    
    // Users (client company users)
    getUsers: builder.query<ClientUser[], void>({
      query: () => ({
        url: CLIENT.CLIENT_USERS,
        method: 'GET',
      }),
      providesTags: ['ClientUser'],
    }),
    
    createUser: builder.mutation<ClientUser, CreateClientUserRequest>({
      query: (user) => ({
        url: CLIENT.CLIENT_USERS,
        method: 'POST',
        body: user,
      }),
      invalidatesTags: ['ClientUser'],
    }),
    
    updateUser: builder.mutation<ApiResponse, { userId: string; updates: UpdateClientUserRequest }>({
      query: ({ userId, updates }) => ({
        url: CLIENT.CLIENT_USER(userId),
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'ClientUser', id: userId }],
    }),
    
    deleteUser: builder.mutation<ApiResponse, string>({
      query: (userId) => ({
        url: CLIENT.CLIENT_USER(userId),
        method: 'DELETE',
      }),
      invalidatesTags: ['ClientUser'],
    }),

    // Client Registration (public endpoints)
    validateClientCode: builder.mutation<{ valid: boolean; agency: { id: string; name: string; logo?: string; primaryColor?: string } }, { inviteCode: string }>({
      query: (data) => ({
        url: CLIENT_REGISTRATION.VALIDATE_CODE,
        method: 'POST',
        body: data,
      }),
    }),

    registerClient: builder.mutation<ApiResponse, ClientRegistrationRequest>({
      query: (data) => ({
        url: CLIENT_REGISTRATION.REGISTER,
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useClientLoginMutation,
  useClientForgotPasswordMutation,
  useGetClientDashboardQuery,
  useGetAssignedWorkersQuery,
  useGetWorkerProfileQuery,
  useRateWorkerMutation,
  useBlockWorkerMutation,
  useGetShiftsQuery,
  useGetShiftDetailsQuery,
  useRequestWorkersMutation,
  useCancelShiftRequestMutation,
  useGetTimesheetsQuery,
  useGetTimesheetDetailsQuery,
  useApproveTimesheetMutation,
  useDisputeTimesheetMutation,
  useGetInvoicesQuery,
  useGetInvoiceDetailsQuery,
  useDownloadInvoiceMutation,
  useGetHoursReportQuery,
  useGetSpendReportQuery,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useValidateClientCodeMutation,
  useRegisterClientMutation,
} = clientApi;

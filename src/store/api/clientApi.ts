import { baseApi } from './baseApi';

export interface Client {
  id: string;
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  city: string | null;
  postcode: string | null;
  industry: string | null;
  status: string;
  activeShifts: {
    filled: number;
    needed: number;
    percentage: number;
  };
  billingStatus: string;
  totalShifts: number;
  totalInvoices: number;
  createdAt: string;
}

export interface ClientWorker {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  status: string;
  workerProfile?: {
    hourlyRate: number | null;
  };
}

export interface ClientShift {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  status: string;
  role?: string;
  siteLocation?: string;
  worker?: {
    id: string;
    fullName: string;
  };
}

export interface ClientInvoice {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  total: number;
  dueDate: string;
  status: string;
}

export interface WeekData {
  weekNumber: number;
  weekLabel: string;
  weekStart: string;
  weekEnd: string;
  totalHours: number;
  totalShifts: number;
  totalWorkers: number;
  totalAmount: number;
  status: string;
  invoiceId?: string;
}

export interface CreateClientInput {
  name: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  postcode?: string;
  industry?: string;
  defaultPayRate?: number;
  defaultChargeRate?: number;
}

export interface ClientListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  industry?: string;
}

export interface ClientListResponse {
  success: boolean;
  data: {
    clients: Client[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export const clientApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getClientList: builder.query<ClientListResponse, ClientListParams>({
      query: (params) => ({
        url: '/clients/list',
        params,
      }),
      providesTags: ['Client'],
    }),
    getClientDetails: builder.query<{ success: boolean; data: Client }, string>({
      query: (clientId) => `/clients/${clientId}/details`,
      providesTags: ['Client'],
    }),
    getClientWorkers: builder.query<{ success: boolean; data: ClientWorker[] }, string>({
      query: (clientId) => `/clients/${clientId}/workers`,
      providesTags: ['ClientWorkers'],
    }),
    getAvailableWorkers: builder.query<{ success: boolean; data: ClientWorker[] }, void>({
      query: () => '/workers',
      providesTags: ['Worker'],
    }),
    bulkAssignWorkers: builder.mutation<{ success: boolean }, { workerIds: string[]; clientCompanyId: string }>({
      query: ({ workerIds, clientCompanyId }) => ({
        url: '/workers/bulk-assign-client',
        method: 'POST',
        body: { workerIds, clientCompanyId },
      }),
      invalidatesTags: ['ClientWorkers', 'Worker'],
    }),
    removeWorkerAssignment: builder.mutation<{ success: boolean }, { workerId: string; clientCompanyId: string }>({
      query: ({ workerId, clientCompanyId }) => ({
        url: `/workers/${workerId}/remove-client`,
        method: 'POST',
        body: { clientCompanyId },
      }),
      invalidatesTags: ['ClientWorkers', 'Worker'],
    }),
    getClientShifts: builder.query<{ success: boolean; data: ClientShift[] }, string>({
      query: (clientId) => `/clients/${clientId}/shifts`,
      providesTags: ['Shifts'],
    }),
    getClientInvoices: builder.query<ClientInvoice[], string>({
      query: (clientId) => `/clients/${clientId}/invoices`,
      providesTags: ['Invoices'],
    }),
    getClientTimesheet: builder.query<{ success: boolean; data: { weeks: WeekData[] } }, string>({
      query: (clientId) => `/attendance/timesheet/client/${clientId}?weeks=8`,
      providesTags: ['Timesheet'],
    }),
    createClient: builder.mutation<{ success: boolean; data: Client }, CreateClientInput>({
      query: (body) => ({
        url: '/clients',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Client'],
    }),
  }),
});

export const {
  useGetClientListQuery,
  useGetClientDetailsQuery,
  useGetClientWorkersQuery,
  useGetAvailableWorkersQuery,
  useBulkAssignWorkersMutation,
  useRemoveWorkerAssignmentMutation,
  useGetClientShiftsQuery,
  useGetClientInvoicesQuery,
  useGetClientTimesheetQuery,
  useCreateClientMutation,
} = clientApi;

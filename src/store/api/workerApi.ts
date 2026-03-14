import { baseApi } from './baseApi';
import { WORKER, PAYSLIPS, HOLIDAYS } from '../../services/endpoints';

export interface Document {
  id: string;
  type: string;
  name: string;
  url: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
  expiryDate?: string;
  createdAt: string;
}

export interface Payslip {
  id: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  totalHours: number;
  grossPay: number;
  netPay: number;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'PAID';
  paidAt?: string;
}

export interface HolidayRequest {
  id: string;
  type: 'ANNUAL' | 'SICK' | 'UNPAID' | 'OTHER';
  startDate: string;
  endDate: string;
  days: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  reason?: string;
}

export interface HomeTodayShift {
  id: string;
  title: string;
  location: string;
  client?: string;
  startAt: string;
  endAt: string;
  hourlyRate: number | null;
  startsIn: number | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  clockedIn: boolean;
  clockedOut: boolean;
}

export interface HomeNextShift {
  id: string;
  title: string;
  location: string;
  client?: string;
  startAt: string;
  endAt: string;
  hourlyRate: number | null;
}

export interface HomeHoliday {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  leaveType: string;
  status: string;
}

export interface PayslipListResponse {
  summary: {
    totalNetEarnings: number;
    totalGrossPay: number;
    totalTax: number;
  };
  months: Array<{
    month: string;
    year: number;
    payslips: Array<{
      id: string;
      periodLabel: string;
      periodStart: string;
      periodEnd: string;
      status: string;
      grossPay: number;
      netPay: number;
      payDate: string | null;
    }>;
  }>;
}

export interface ScheduleShift {
  id: string;
  title: string;
  siteLocation: string;
  startAt: string;
  endAt: string;
  payRate: number | null;
  status: string;
  clientCompany?: { id: string; name: string } | null;
}

export interface HomeData {
  greeting: string;
  worker: {
    id: string;
    name: string;
    firstName: string;
  };
  weeklyStats: {
    shifts: number;
    holidayBalance: number;
    hoursWorked: number;
  };
  todayShift: HomeTodayShift | null;
  nextShifts: HomeNextShift[];
  upcomingHolidays: HomeHoliday[];
}

export const workerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Home dashboard
    getHome: builder.query<{ success: boolean; data: HomeData }, void>({
      query: () => WORKER.HOME,
      providesTags: ['Worker', 'Shifts'],
    }),

    // Worker's schedule (assigned shifts)
    getMySchedule: builder.query<{ success: boolean; data: ScheduleShift[] }, { from?: string; to?: string } | void>({
      query: (params) => ({
        url: '/workers/my-schedule',
        params: params || undefined,
      }),
      providesTags: ['Shifts'],
    }),

    // Payslip list (grouped by month)
    getPayslipList: builder.query<{ success: boolean; data: PayslipListResponse }, void>({
      query: () => PAYSLIPS.LIST,
      providesTags: ['Payslips'],
    }),

    // Get current user profile
    getWorkerProfile: builder.query<{ success: boolean; data: any }, void>({
      query: () => '/auth/me',
      providesTags: ['Worker'],
    }),

    // RTW
    getMyRTW: builder.query<{ success: boolean; data: { rtwStatus: string; rtwShareCode?: string; rtwCheckedAt?: string; rtwExpiresAt?: string; rtwAuditNote?: string } }, void>({
      query: () => '/workers/my-rtw',
      providesTags: ['Worker'],
    }),
    submitMyRTW: builder.mutation<{ success: boolean; data: any }, { shareCode: string; dateOfBirth: string }>({
      query: (body) => ({ url: '/workers/my-rtw', method: 'POST', body }),
      invalidatesTags: ['Worker'],
    }),

    // Skills
    getMySkills: builder.query<{ success: boolean; data: Array<{ id: string; skillId: string; skill: { id: string; name: string; category: string } }> }, void>({
      query: () => '/workers/my-skills',
      providesTags: ['Skills'],
    }),
    getAllSkills: builder.query<{ success: boolean; data: { skills: Array<{ id: string; name: string; category: string }>; grouped: Record<string, Array<{ id: string; name: string; category: string }>> } }, void>({
      query: () => '/skills',
      providesTags: ['Skills'],
    }),
    addMySkill: builder.mutation<{ success: boolean }, { skillId: string }>({
      query: (body) => ({ url: '/workers/my-skills', method: 'POST', body }),
      invalidatesTags: ['Skills'],
    }),
    removeMySkill: builder.mutation<{ success: boolean }, string>({
      query: (skillId) => ({ url: `/workers/my-skills/${skillId}`, method: 'DELETE' }),
      invalidatesTags: ['Skills'],
    }),

    // Documents
    getMyDocuments: builder.query<{ success: boolean; data: Document[] }, void>({
      query: () => WORKER.MY_DOCUMENTS,
      providesTags: ['Documents'],
    }),
    uploadMyDocument: builder.mutation<{ success: boolean; data: Document }, { type: string; title: string }>({
      query: (body) => ({ url: WORKER.UPLOAD_DOCUMENT, method: 'POST', body }),
      invalidatesTags: ['Documents'],
    }),
    deleteDocument: builder.mutation<{ success: boolean }, string>({
      query: (docId) => ({ url: WORKER.DELETE_DOCUMENT(docId), method: 'DELETE' }),
      invalidatesTags: ['Documents'],
    }),

    // Payslips
    getPayslips: builder.query<{ success: boolean; data: Payslip[] }, void>({
      query: () => PAYSLIPS.LIST,
      providesTags: ['Payslips'],
    }),
    getMyPayslip: builder.query<{ success: boolean; data: Payslip }, void>({
      query: () => PAYSLIPS.MY_PAYSLIP,
      providesTags: ['Payslips'],
    }),
    getPayslipDetail: builder.query<{ success: boolean; data: Payslip }, string>({
      query: (id) => PAYSLIPS.DETAIL(id),
      providesTags: (r, e, id) => [{ type: 'Payslips', id }],
    }),

    // Holidays
    getMyHolidayRequests: builder.query<{ success: boolean; data: HolidayRequest[] }, void>({
      query: () => HOLIDAYS.MY_REQUESTS,
      providesTags: ['Holidays'],
    }),
    requestHoliday: builder.mutation<{ success: boolean }, Omit<HolidayRequest, 'id' | 'status'>>({
      query: (body) => ({ url: HOLIDAYS.REQUEST, method: 'POST', body }),
      invalidatesTags: ['Holidays'],
    }),
    cancelHolidayRequest: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: HOLIDAYS.CANCEL(id), method: 'POST' }),
      invalidatesTags: ['Holidays'],
    }),
  }),
});

export const {
  useGetHomeQuery,
  useGetMyScheduleQuery,
  useGetPayslipListQuery,
  useGetWorkerProfileQuery,
  useGetMyRTWQuery,
  useSubmitMyRTWMutation,
  useGetMySkillsQuery,
  useGetAllSkillsQuery,
  useAddMySkillMutation,
  useRemoveMySkillMutation,
  useGetMyDocumentsQuery,
  useUploadMyDocumentMutation,
  useDeleteDocumentMutation,
  useGetPayslipsQuery,
  useGetMyPayslipQuery,
  useGetPayslipDetailQuery,
  useGetMyHolidayRequestsQuery,
  useRequestHolidayMutation,
  useCancelHolidayRequestMutation,
} = workerApi;

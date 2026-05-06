import { baseApi } from './baseApi';

export interface RotaAssignment {
  rotaShiftId: string;
  startTime: string;
  endTime: string;
  role: string;
}

export interface RotaWorker {
  id: string;
  fullName: string;
  hourlyRate: number;
  unavailableDays: number[]; // 0=Mon … 6=Sun
  unavailableDates: string[]; // ISO date strings
  holidayDates: string[];    // ISO date strings
  assignments: Record<string, RotaAssignment>; // Key: "dayIndex-timeSlot"
}

export interface RotaInfo {
  id: string;
  name: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  startDate: string;
  endDate: string;
  clientCompanyId?: string | null;
}

export interface RotaStats {
  totalAssignments: number;
  totalHours: number;
  estimatedCost: number;
  workersOnHoliday: number;
}

export interface WeekRotaResponse {
  rota: RotaInfo;
  workers: RotaWorker[];
  shiftCounts: Record<string, number[]>; // Key: "HH:mm-HH:mm", value: [7] counts
  stats: RotaStats;
}

export const rotaApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getWeekRota: builder.query<WeekRotaResponse, { weekStart?: string; clientCompanyId?: string }>({
      query: ({ weekStart, clientCompanyId } = {}) => ({
        url: '/rota/week',
        params: { ...(weekStart ? { weekStart } : {}), ...(clientCompanyId ? { clientCompanyId } : {}) },
      }),
      transformResponse: (r: any) => r ?? r,
      providesTags: ['Rota'],
    }),
    assignWorker: builder.mutation<{ success: boolean; assignment: any; rotaShiftId: string }, { rotaId: string; workerId: string; date: string; startTime: string; endTime: string; role?: string }>({
      query: ({ rotaId, ...body }) => ({ url: `/rota/${rotaId}/assign`, method: 'POST', body }),
      invalidatesTags: ['Rota'],
    }),
    unassignWorker: builder.mutation<{ success: boolean }, { rotaId: string; rotaShiftId: string; workerId: string }>({
      query: ({ rotaId, ...body }) => ({ url: `/rota/${rotaId}/assign`, method: 'DELETE', body }),
      invalidatesTags: ['Rota'],
    }),
    publishRota: builder.mutation<{ success: true; rota: any }, string>({
      query: rotaId => ({ url: `/rota/${rotaId}/publish`, method: 'POST' }),
      invalidatesTags: ['Rota'],
    }),
    unpublishRota: builder.mutation<{ success: true; rota: any }, string>({
      query: rotaId => ({ url: `/rota/${rotaId}/unpublish`, method: 'POST' }),
      invalidatesTags: ['Rota'],
    }),
  }),
});

export const {
  useGetWeekRotaQuery,
  useAssignWorkerMutation,
  useUnassignWorkerMutation,
  usePublishRotaMutation,
  useUnpublishRotaMutation,
} = rotaApi;

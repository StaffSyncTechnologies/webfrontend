import { baseApi } from './baseApi';

export type ShiftType = 'morning' | 'afternoon' | 'night';

export interface RotaAssignment {
  rotaShiftId: string;
  date: string;
  shiftType: ShiftType;
  status: string;
}

export interface RotaWorker {
  id: string;
  fullName: string;
  hourlyRate: number | null;
  unavailableDays: number[]; // 0=Mon … 6=Sun
  holidayDates: string[];    // ISO date strings
  assignments: RotaAssignment[];
}

export interface RotaInfo {
  id: string;
  name: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  startDate: string;
  endDate: string;
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
  shiftCounts: Record<ShiftType, number[]>; // [Mon…Sun]
  stats: RotaStats;
}

export const rotaApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getWeekRota: builder.query<WeekRotaResponse, { weekStart?: string }>({
      query: ({ weekStart } = {}) => ({
        url: '/rota/week',
        params: weekStart ? { weekStart } : undefined,
      }),
      transformResponse: (r: any) => r?.data ?? r,
      providesTags: ['Rota'],
    }),
    assignWorker: builder.mutation<void, { rotaId: string; workerId: string; date: string; shiftType: ShiftType }>({
      query: ({ rotaId, ...body }) => ({ url: `/rota/${rotaId}/assign`, method: 'POST', body }),
      invalidatesTags: ['Rota'],
    }),
    unassignWorker: builder.mutation<void, { rotaId: string; workerId: string; rotaShiftId: string }>({
      query: ({ rotaId, ...body }) => ({ url: `/rota/${rotaId}/assign`, method: 'DELETE', body }),
      invalidatesTags: ['Rota'],
    }),
    publishRota: builder.mutation<void, string>({
      query: rotaId => ({ url: `/rota/${rotaId}/publish`, method: 'POST' }),
      invalidatesTags: ['Rota'],
    }),
    unpublishRota: builder.mutation<void, string>({
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

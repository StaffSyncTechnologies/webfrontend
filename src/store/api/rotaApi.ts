import { baseApi } from './baseApi';

// ─── Shift type helpers ───────────────────────────────────────────────────────

export type ShiftType = 'morning' | 'afternoon' | 'night';

export const SHIFT_SLOTS: Record<ShiftType, string> = {
  morning:   '06:00-14:00',
  afternoon: '14:00-22:00',
  night:     '22:00-06:00',
};

// ─── Response types ───────────────────────────────────────────────────────────

export interface RotaAssignment {
  rotaShiftId: string;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  role: string;
}

export interface RotaWorker {
  id: string;
  fullName: string;
  hourlyRate: number;
  unavailableDays: number[];  // 0=Mon … 6=Sun
  unavailableDates: string[]; // "yyyy-MM-dd"
  holidayDates: string[];     // "yyyy-MM-dd"
  /**
   * Key: "{dayIndex}-{startTime}-{endTime}"
   * e.g. "0-06:00-14:00" | "3-14:00-22:00" | "6-22:00-06:00"
   *
   * dayIndex: 0=Mon … 6=Sun, matching the rota's monday.
   * Cell.tsx looks up keys with: key.startsWith(`${dayIdx}-`)
   */
  assignments: Record<string, RotaAssignment>;
}

export interface RotaInfo {
  id: string;
  name: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  startDate: string; // "yyyy-MM-dd"
  endDate: string;   // "yyyy-MM-dd"
  clientCompanyId?: string | null;
  defaultWorkersNeeded: number;
}

export interface CompanyLocation {
  address: string | null;
  city: string | null;
  postcode: string | null;
  siteLat: number | null;
  siteLng: number | null;
  defaultPayRate: number | null;
}

export interface RotaStats {
  totalAssignments: number;
  totalHours: number;
  estimatedCost: number;
  workersOnHoliday: number;
}

export interface WeekRotaResponse {
  rota: RotaInfo;
  companyLocation: CompanyLocation | null;
  workers: RotaWorker[];
  /** Key: "HH:mm-HH:mm" → number[7], one count per day */
  shiftCounts: Record<string, number[]>;
  stats: RotaStats;
}

// ─── Mutation arg types (import these in RotaBuilderScreen) ───────────────────

export interface AssignWorkerArg {
  rotaId: string;       // from rota.id returned by getWeekRota — never derive from date
  workerId: string;
  date: string;         // "yyyy-MM-dd"
  startTime: string;    // "HH:mm"
  endTime: string;      // "HH:mm"
  role?: string;
  siteLocation?: string;
  locationId?: string;
  breakMinutes?: number;
  payRate?: number;
  notes?: string;
  workersNeeded?: number;
}

export interface UnassignWorkerArg {
  rotaId: string;
  rotaShiftId: string; // from assignment.rotaShiftId
  workerId: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const rotaApi = baseApi.injectEndpoints({
  endpoints: builder => ({

    // GET /rota/week
    getWeekRota: builder.query<
      WeekRotaResponse,
      { weekStart?: string; clientCompanyId?: string }
    >({
      query: ({ weekStart, clientCompanyId } = {}) => {
        console.log('[getWeekRota] Request params:', { weekStart, clientCompanyId });
        const queryParams = new URLSearchParams();
        if (weekStart) queryParams.append('weekStart', weekStart);
        if (clientCompanyId) queryParams.append('clientCompanyId', clientCompanyId);
        const url = `/rota/week?${queryParams.toString()}`;
        console.log('[getWeekRota] Full URL:', url);
        return {
          url,
        };
      },
      providesTags: ['Rota'],
      transformResponse: (response: WeekRotaResponse) => {
        console.log('[getWeekRota] Raw response:', response);
        return response;
      },
      transformErrorResponse: (response) => {
        console.error('[getWeekRota] API Error:', response);
        return response;
      },
    }),

    // POST /rota/:rotaId/assign
    assignWorker: builder.mutation<
      { success: boolean; assignment: any; rotaShiftId: string },
      AssignWorkerArg
    >({
      query: ({ rotaId, ...body }) => ({
        url: `/rota/${rotaId}/assign`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Rota'],
    }),

    // DELETE /rota/:rotaId/assign
    unassignWorker: builder.mutation<{ success: boolean }, UnassignWorkerArg>({
      query: ({ rotaId, ...body }) => ({
        url: `/rota/${rotaId}/assign`,
        method: 'DELETE',
        body,
      }),
      invalidatesTags: ['Rota'],
    }),

    // POST /rota/:rotaId/publish
    publishRota: builder.mutation<{ success: boolean; rota: RotaInfo }, string>({
      query: rotaId => ({ url: `/rota/${rotaId}/publish`, method: 'POST' }),
      invalidatesTags: ['Rota'],
    }),

    // POST /rota/:rotaId/unpublish
    unpublishRota: builder.mutation<{ success: boolean; rota: RotaInfo }, string>({
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
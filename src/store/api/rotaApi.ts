import { baseApi } from './baseApi';

// ─── Types ────────────────────────────────────────────────────────────────────

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
   * Key format: "{dayIndex}-{startTime}-{endTime}"
   * Examples:   "0-06:00-14:00"   (Mon morning)
   *             "2-14:00-22:00"   (Wed afternoon)
   *             "4-22:00-06:00"   (Fri night)
   *
   * Built by fmtTime() in rota.controller.ts — Cell.tsx must use the same format.
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
  /** Key: "HH:mm-HH:mm" → array of 7 counts (one per day) */
  shiftCounts: Record<string, number[]>;
  stats: RotaStats;
}

// ─── Mutation arg types ───────────────────────────────────────────────────────

export interface AssignWorkerArg {
  rotaId: string;
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
  rotaShiftId: string;
  workerId: string;
}

// ─── Injected endpoints ───────────────────────────────────────────────────────

export const rotaApi = baseApi.injectEndpoints({
  endpoints: builder => ({

    // ── GET /rota/week ────────────────────────────────────────────────────────
    // weekStart: Monday of the week as "yyyy-MM-dd"
    // clientCompanyId: optional — omit for DIRECT_COMPANY mode
    getWeekRota: builder.query<
      WeekRotaResponse,
      { weekStart?: string; clientCompanyId?: string }
    >({
      query: ({ weekStart, clientCompanyId } = {}) => ({
        url: '/rota/week',
        params: {
          ...(weekStart       ? { weekStart }       : {}),
          ...(clientCompanyId ? { clientCompanyId } : {}),
        },
      }),
      providesTags: ['Rota'],
      transformErrorResponse: (response) => {
        console.error('[getWeekRota] API Error:', response);
        return response;
      },
    }),

    // ── POST /rota/:rotaId/assign ─────────────────────────────────────────────
    // rotaId MUST be the id from getWeekRota response — never derive it from date
    assignWorker: builder.mutation<
      {
        success: boolean;
        assignment: any;
        rotaShiftId: string;
        /** "{dayIndex}-{startTime}-{endTime}" — same key used in worker.assignments */
        assignmentKey: string;
      },
      AssignWorkerArg
    >({
      query: ({ rotaId, ...body }) => ({
        url: `/rota/${rotaId}/assign`,
        method: 'POST',
        body,
      }),
      // invalidatesTags triggers a getWeekRota refetch → Cell re-renders with real data
      invalidatesTags: ['Rota'],
    }),

    // ── DELETE /rota/:rotaId/assign ───────────────────────────────────────────
    unassignWorker: builder.mutation<{ success: boolean }, UnassignWorkerArg>({
      query: ({ rotaId, ...body }) => ({
        url: `/rota/${rotaId}/assign`,
        method: 'DELETE',
        body,
      }),
      invalidatesTags: ['Rota'],
    }),

    // ── POST /rota/:rotaId/publish ────────────────────────────────────────────
    publishRota: builder.mutation<{ success: boolean; rota: RotaInfo }, string>({
      query: rotaId => ({ url: `/rota/${rotaId}/publish`, method: 'POST' }),
      invalidatesTags: ['Rota'],
    }),

    // ── POST /rota/:rotaId/unpublish ──────────────────────────────────────────
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
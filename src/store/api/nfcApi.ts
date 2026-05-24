import { baseApi } from './baseApi';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NfcPointStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE';

export interface NfcClockPoint {
  id: string;
  organizationId: string;
  locationId: string | null;
  name: string;
  tagCode: string;
  status: NfcPointStatus;
  writtenAt: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  location?: {
    id: string;
    name: string;
    address: string;
    latitude?: number;
    longitude?: number;
  } | null;
  createdBy?: {
    id: string;
    fullName: string;
  } | null;
}

export interface NfcClockInResult {
  attendance: {
    id: string;
    shiftId: string | null;
    rotaShiftId: string | null;
    workerId: string;
    clockInAt: string;
    status: string;
  };
  nfcPoint: {
    id: string;
    name: string;
    tagCode: string;
  };
}

export interface NfcTapClockResult {
  action: 'CLOCK_IN' | 'CLOCK_OUT';
  attendance: {
    id: string;
    clockInAt?: string;
    clockOutAt?: string;
    hoursWorked?: number;
    status: string;
  };
  shiftTitle: string;
  hoursWorked?: number;
  nfcPoint: {
    id: string;
    name: string;
  };
}

export interface NfcClockOutResult {
  attendance: {
    id: string;
    clockInAt: string;
    clockOutAt: string;
    hoursWorked: number;
    status: string;
  };
  hoursWorked: number;
  nfcPoint: {
    id: string;
    name: string;
  };
}

export interface NfcLogEntry {
  id: string;
  clockInAt: string | null;
  clockOutAt: string | null;
  clockInDevice: string | null;
  hoursWorked: number | null;
  status: string;
  worker: { id: string; fullName: string; email: string };
  shift?: { id: string; title: string; startAt: string; endAt: string } | null;
}

export interface NfcLogsResponse {
  logs: NfcLogEntry[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface CreateNfcPointBody {
  name: string;
  locationId?: string;
  clientId?: string;
  description?: string;
  address?: string;
  postcode?: string;
  latitude?: number;
  longitude?: number;
}

export interface NfcClockBody {
  tagCode: string;
  lat?: number;
  lng?: number;
}

const NFC_BASE = '/nfc';

export const nfcApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ── Admin: list all NFC points ─────────────────────────────────────────
    getNfcClockPoints: builder.query<
      { success: boolean; data: NfcClockPoint[] },
      { status?: NfcPointStatus; locationId?: string } | void
    >({
      query: (params) => ({ url: NFC_BASE, params: params ?? {} }),
      providesTags: ['NfcPoints'],
    }),

    // ── Admin: get single NFC point ────────────────────────────────────────
    getNfcClockPoint: builder.query<{ success: boolean; data: NfcClockPoint }, string>({
      query: (id) => `${NFC_BASE}/${id}`,
      providesTags: ['NfcPoints'],
    }),

    // ── Admin: create NFC point ────────────────────────────────────────────
    createNfcClockPoint: builder.mutation<{ success: boolean; data: NfcClockPoint }, CreateNfcPointBody>({
      query: (body) => ({ url: NFC_BASE, method: 'POST', body }),
      invalidatesTags: ['NfcPoints'],
    }),

    // ── Admin: update NFC point ────────────────────────────────────────────
    updateNfcClockPoint: builder.mutation<
      { success: boolean; data: NfcClockPoint },
      { id: string; name?: string; locationId?: string | null }
    >({
      query: ({ id, ...body }) => ({ url: `${NFC_BASE}/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['NfcPoints'],
    }),

    // ── Admin: mark tag as written + activate ─────────────────────────────
    markNfcTagWritten: builder.mutation<{ success: boolean; data: NfcClockPoint }, string>({
      query: (id) => ({ url: `${NFC_BASE}/${id}/mark-written`, method: 'POST' }),
      invalidatesTags: ['NfcPoints'],
    }),

    // ── Admin: activate ────────────────────────────────────────────────────
    activateNfcPoint: builder.mutation<{ success: boolean; data: NfcClockPoint }, string>({
      query: (id) => ({ url: `${NFC_BASE}/${id}/activate`, method: 'POST' }),
      invalidatesTags: ['NfcPoints'],
    }),

    // ── Admin: deactivate ──────────────────────────────────────────────────
    deactivateNfcPoint: builder.mutation<{ success: boolean; data: NfcClockPoint }, string>({
      query: (id) => ({ url: `${NFC_BASE}/${id}/deactivate`, method: 'POST' }),
      invalidatesTags: ['NfcPoints'],
    }),

    // ── Admin: delete ──────────────────────────────────────────────────────
    deleteNfcPoint: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `${NFC_BASE}/${id}`, method: 'DELETE' }),
      invalidatesTags: ['NfcPoints'],
    }),

    // ── Admin: NFC attendance logs ─────────────────────────────────────────
    getNfcLogs: builder.query<
      { success: boolean; data: NfcLogsResponse },
      { tagCode?: string; page?: number; limit?: number } | void
    >({
      query: (params) => ({ url: `${NFC_BASE}/logs`, params: params ?? {} }),
      providesTags: ['Attendance'],
    }),

    // ── Worker: Tap-to-clock (auto-detects shift from tag, used by deep link) ─
    nfcTapClock: builder.mutation<
      { success: boolean; data: NfcTapClockResult },
      NfcClockBody
    >({
      query: (body) => ({ url: `${NFC_BASE}/tap-clock`, method: 'POST', body }),
      invalidatesTags: ['Attendance', 'Shifts', 'NfcPoints'],
    }),

    // ── Worker: NFC clock-in (regular shift) ──────────────────────────────
    nfcClockIn: builder.mutation<
      { success: boolean; data: NfcClockInResult },
      { shiftId: string } & NfcClockBody
    >({
      query: ({ shiftId, ...body }) => ({
        url: `${NFC_BASE}/clock-in/${shiftId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Attendance', 'Shifts'],
    }),

    // ── Worker: NFC clock-out (regular shift) ─────────────────────────────
    nfcClockOut: builder.mutation<
      { success: boolean; data: NfcClockOutResult },
      { shiftId: string } & NfcClockBody
    >({
      query: ({ shiftId, ...body }) => ({
        url: `${NFC_BASE}/clock-out/${shiftId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Attendance', 'Shifts'],
    }),

    // ── Worker: NFC clock-in (rota shift) ─────────────────────────────────
    nfcClockInRota: builder.mutation<
      { success: boolean; data: NfcClockInResult },
      { rotaShiftId: string } & NfcClockBody
    >({
      query: ({ rotaShiftId, ...body }) => ({
        url: `${NFC_BASE}/rota/clock-in/${rotaShiftId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Attendance'],
    }),

    // ── Worker: NFC clock-out (rota shift) ────────────────────────────────
    nfcClockOutRota: builder.mutation<
      { success: boolean; data: NfcClockOutResult },
      { rotaShiftId: string } & NfcClockBody
    >({
      query: ({ rotaShiftId, ...body }) => ({
        url: `${NFC_BASE}/rota/clock-out/${rotaShiftId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Attendance'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useNfcTapClockMutation,
  useGetNfcClockPointsQuery,
  useGetNfcClockPointQuery,
  useCreateNfcClockPointMutation,
  useUpdateNfcClockPointMutation,
  useMarkNfcTagWrittenMutation,
  useActivateNfcPointMutation,
  useDeactivateNfcPointMutation,
  useDeleteNfcPointMutation,
  useGetNfcLogsQuery,
  useNfcClockInMutation,
  useNfcClockOutMutation,
  useNfcClockInRotaMutation,
  useNfcClockOutRotaMutation,
} = nfcApi;

import { createApi } from '@reduxjs/toolkit/query/react';
import { NFC, LOCATIONS } from '../../utilities/endpoint';
import { axiosBaseQuery } from '../../utilities/axiosBaseQuery';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NfcPointStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE';

export interface NfcLocation {
  id: string;
  name: string;
  address?: string;
}

export interface NfcClockPoint {
  id: string;
  organizationId: string;
  name: string;
  tagCode: string;
  status: NfcPointStatus;
  locationId?: string | null;
  location?: NfcLocation | null;
  writtenAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNfcPointPayload {
  name: string;
  locationId?: string;
}

// ─── API Slice ────────────────────────────────────────────────────────────────

export const nfcApi = createApi({
  reducerPath: 'nfcApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['NfcPoints', 'Locations'],
  endpoints: (builder) => ({
    // List NFC clock points (optionally filtered by status)
    getNfcClockPoints: builder.query<
      { success: boolean; data: NfcClockPoint[] },
      { status?: NfcPointStatus } | void
    >({
      query: (params) => ({
        url: NFC.LIST,
        params: params || undefined,
      }),
      providesTags: ['NfcPoints'],
    }),

    // Create a new NFC clock point
    createNfcClockPoint: builder.mutation<
      { success: boolean; data: NfcClockPoint },
      CreateNfcPointPayload
    >({
      query: (body) => ({
        url: NFC.CREATE,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['NfcPoints'],
    }),

    // Activate a point (INACTIVE → ACTIVE)
    activateNfcPoint: builder.mutation<{ success: boolean; data: NfcClockPoint }, string>({
      query: (id) => ({
        url: NFC.ACTIVATE(id),
        method: 'PATCH',
      }),
      invalidatesTags: ['NfcPoints'],
    }),

    // Deactivate a point (ACTIVE → INACTIVE)
    deactivateNfcPoint: builder.mutation<{ success: boolean; data: NfcClockPoint }, string>({
      query: (id) => ({
        url: NFC.DEACTIVATE(id),
        method: 'PATCH',
      }),
      invalidatesTags: ['NfcPoints'],
    }),

    // Delete a point
    deleteNfcPoint: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: NFC.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['NfcPoints'],
    }),

    // List organisation locations (for location picker)
    getLocations: builder.query<NfcLocation[], void>({
      query: () => ({ url: LOCATIONS.LIST }),
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        return [];
      },
      providesTags: ['Locations'],
    }),
  }),
});

export const {
  useGetNfcClockPointsQuery,
  useCreateNfcClockPointMutation,
  useActivateNfcPointMutation,
  useDeactivateNfcPointMutation,
  useDeleteNfcPointMutation,
  useGetLocationsQuery,
} = nfcApi;

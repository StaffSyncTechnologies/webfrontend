import { baseApi } from './baseApi';
import { SWAP } from '../../services/endpoints';

export type SwapType = 'GIVE_AWAY' | 'DIRECT_SWAP';
export type SwapStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export interface SwapShift {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  siteLocation?: string;
  payRate?: number;
  hourlyRate?: number;
  role?: string;
  breakMinutes?: number;
  clientCompany?: { id: string; name: string };
}

export interface SwapUser {
  id: string;
  fullName: string;
}

export interface SwapRequest {
  id: string;
  organizationId: string;
  requesterId: string;
  requesterShiftId: string;
  targetId?: string;
  targetShiftId?: string;
  swapType: SwapType;
  status: SwapStatus;
  requesterNote?: string;
  adminNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  requester: SwapUser;
  requesterShift: SwapShift;
  target?: SwapUser;
  targetShift?: SwapShift;
}

export interface CreateSwapBody {
  requesterShiftId: string;
  swapType: SwapType;
  targetId?: string;
  targetShiftId?: string;
  requesterNote?: string;
}

export const swapApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMySwapRequests: builder.query<{ success: boolean; data: SwapRequest[] }, void>({
      query: () => SWAP.MY,
      providesTags: ['Shifts'],
    }),
    getAvailableGiveAways: builder.query<{ success: boolean; data: SwapRequest[] }, void>({
      query: () => SWAP.AVAILABLE,
      providesTags: ['Shifts'],
    }),
    createSwapRequest: builder.mutation<{ success: boolean; data: SwapRequest }, CreateSwapBody>({
      query: (body) => ({ url: SWAP.CREATE, method: 'POST', body }),
      invalidatesTags: ['Shifts'],
    }),
    claimGiveAway: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: SWAP.CLAIM(id), method: 'POST' }),
      invalidatesTags: ['Shifts'],
    }),
    respondToSwap: builder.mutation<
      { success: boolean },
      { id: string; accepted: boolean; note?: string }
    >({
      query: ({ id, ...body }) => ({ url: SWAP.RESPOND(id), method: 'PUT', body }),
      invalidatesTags: ['Shifts'],
    }),
    cancelSwapRequest: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: SWAP.CANCEL(id), method: 'DELETE' }),
      invalidatesTags: ['Shifts'],
    }),
  }),
});

export const {
  useGetMySwapRequestsQuery,
  useGetAvailableGiveAwaysQuery,
  useCreateSwapRequestMutation,
  useClaimGiveAwayMutation,
  useRespondToSwapMutation,
  useCancelSwapRequestMutation,
} = swapApi;

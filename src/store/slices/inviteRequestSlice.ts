import { createApi } from '@reduxjs/toolkit/query/react';
import { INVITE_REQUESTS } from '../../utilities/endpoint';
import { axiosBaseQuery } from '../../utilities/axiosBaseQuery';

export interface InviteCodeRequest {
  id: string;
  organizationId: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy: string | null;
  reviewedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  reviewer?: { id: string; fullName: string } | null;
}

export const inviteRequestApi = createApi({
  reducerPath: 'inviteRequestApi',
  baseQuery: axiosBaseQuery({
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.authorization = `Bearer ${token}`;
      }
      return headers;
    },
  }),
  tagTypes: ['InviteRequest'],
  endpoints: (builder) => ({
    getInviteRequests: builder.query<{ success: boolean; data: InviteCodeRequest[] }, { status?: string } | void>({
      query: (params) => ({
        url: INVITE_REQUESTS.LIST,
        params: params || undefined,
      }),
      providesTags: ['InviteRequest'],
    }),
    reviewInviteRequest: builder.mutation<
      { success: boolean; data: InviteCodeRequest },
      { id: string; status: 'APPROVED' | 'REJECTED'; notes?: string }
    >({
      query: ({ id, ...body }) => ({
        url: INVITE_REQUESTS.REVIEW(id),
        method: 'PATCH',
        data: body,
      }),
      invalidatesTags: ['InviteRequest'],
    }),
  }),
});

export const {
  useGetInviteRequestsQuery,
  useReviewInviteRequestMutation,
} = inviteRequestApi;

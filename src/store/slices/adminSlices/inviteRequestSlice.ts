import { baseApi } from '../../api/baseApi';
import { INVITE_REQUESTS } from '../../../services/endpoints';

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

export const inviteRequestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInviteRequests: builder.query<{ success: boolean; data: InviteCodeRequest[] }, { status?: string } | void>({
      query: (params) => ({
        url: INVITE_REQUESTS.LIST,
        params: params ?? undefined,
      }),
      providesTags: ['InviteRequests'],
    }),

    reviewInviteRequest: builder.mutation<
      { success: boolean; data: InviteCodeRequest },
      { id: string; status: 'APPROVED' | 'REJECTED'; notes?: string }
    >({
      query: ({ id, ...body }) => ({
        url: INVITE_REQUESTS.REVIEW(id),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['InviteRequests'],
    }),
  }),
});

export const {
  useGetInviteRequestsQuery,
  useReviewInviteRequestMutation,
} = inviteRequestApi;

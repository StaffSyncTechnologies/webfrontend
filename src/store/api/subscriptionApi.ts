import { baseApi } from './baseApi';

export interface SubscriptionSummary {
  planTier: string;
  planName: string;
  status: string;
  isTrialing: boolean;
  isExpired: boolean;
  daysRemaining: number | null;
  trialEnd: string | null;
  currentPeriodEnd: string | null;
  canAccessDashboard: boolean;
}

const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptionSummary: builder.query<SubscriptionSummary, void>({
      query: () => '/subscriptions/summary',
      transformResponse: (response: { success: boolean; data: SubscriptionSummary }) => response.data,
    }),
  }),
});

export const { useGetSubscriptionSummaryQuery } = subscriptionApi;

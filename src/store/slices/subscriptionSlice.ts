import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../utilities/axiosBaseQuery';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

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

export interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  workerLimit: number | string;
  clientLimit: number | string;
  features: string[];
  isCustomPricing: boolean;
  trialDays: number | null;
}

export interface PlansResponse {
  plans: Plan[];
  freeTrialDays: number;
  currency: string;
}

export const subscriptionApi = createApi({
  reducerPath: 'subscriptionApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Subscription', 'Plans'],
  endpoints: (builder) => ({
    // Get subscription summary for dashboard
    getSubscriptionSummary: builder.query<SubscriptionSummary, void>({
      query: () => ({
        url: `${API_BASE}/api/v1/subscriptions/summary`,
        method: 'GET',
      }),
      transformResponse: (response: { success: boolean; data: SubscriptionSummary }) => response.data,
      providesTags: ['Subscription'],
    }),

    // Get available plans
    getPlans: builder.query<PlansResponse, void>({
      query: () => ({
        url: `${API_BASE}/api/v1/subscriptions/plans`,
        method: 'GET',
      }),
      transformResponse: (response: { success: boolean; data: PlansResponse }) => response.data,
      providesTags: ['Plans'],
    }),

    // Get full subscription details
    getSubscription: builder.query<any, void>({
      query: () => ({
        url: `${API_BASE}/api/v1/subscriptions`,
        method: 'GET',
      }),
      transformResponse: (response: { success: boolean; data: any }) => response.data,
      providesTags: ['Subscription'],
    }),

    // Create checkout session
    createCheckout: builder.mutation<{ sessionId: string; url: string }, { planTier: string; billingCycle: string }>({
      query: (body) => ({
        url: `${API_BASE}/api/v1/subscriptions/checkout`,
        method: 'POST',
        data: body,
      }),
      transformResponse: (response: { success: boolean; data: { sessionId: string; url: string } }) => response.data,
    }),

    // Cancel subscription
    cancelSubscription: builder.mutation<any, { immediately?: boolean }>({
      query: (body) => ({
        url: `${API_BASE}/api/v1/subscriptions/cancel`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Subscription'],
    }),

    // Resume subscription
    resumeSubscription: builder.mutation<any, void>({
      query: () => ({
        url: `${API_BASE}/api/v1/subscriptions/resume`,
        method: 'POST',
      }),
      invalidatesTags: ['Subscription'],
    }),
  }),
});

export const {
  useGetSubscriptionSummaryQuery,
  useGetPlansQuery,
  useGetSubscriptionQuery,
  useCreateCheckoutMutation,
  useCancelSubscriptionMutation,
  useResumeSubscriptionMutation,
} = subscriptionApi;

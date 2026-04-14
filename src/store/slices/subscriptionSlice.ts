import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../utilities/axiosBaseQuery';

const API_BASE = 'https://backend-rp5c.onrender.com';

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
  monthlyPricePerWorker: number;
  yearlyPricePerWorker: number;
  monthlyPrice?: number;
  yearlyPrice?: number;
  minWorkers: number;
  maxWorkers: number | string;
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
  pricingModel: string;
}

export interface SubscriptionHistoryItem {
  id: string;
  planType: string;
  amount: string;
  billingCycle: string;
  date: string;
  transactionId: string;
  status: string;
}

export interface SubscriptionLimits {
  workerLimit: number;
  clientLimit: number;
  currentWorkers: number;
  currentClients: number;
  canAddWorker: boolean;
  canAddClient: boolean;
}

export interface SubscriptionHistoryResponse {
  history: SubscriptionHistoryItem[];
  currentPlan: {
    planTier: string;
    status: string;
    startDate: string;
    nextBillingDate: string;
    cost: string;
  } | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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

    // Get subscription limits
    getSubscriptionLimits: builder.query<SubscriptionLimits, void>({
      query: () => ({
        url: `${API_BASE}/api/v1/subscriptions/limits`,
        method: 'GET',
      }),
      transformResponse: (response: { success: boolean; data: SubscriptionLimits }) => response.data,
      providesTags: ['Subscription'],
    }),

    // Create checkout session
    createCheckout: builder.mutation<
      { sessionId: string; url: string }, 
      { planTier: string; billingCycle: string; workerCount?: number }
    >({
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

    // Update subscription (upgrade/downgrade)
    updateSubscription: builder.mutation<any, { planTier?: string; billingCycle?: string; workerCount?: number }>({
      query: (body) => ({
        url: `${API_BASE}/api/v1/subscriptions`,
        method: 'PUT',
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

    // Get subscription history
    getSubscriptionHistory: builder.query<SubscriptionHistoryResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `${API_BASE}/api/v1/subscriptions/history?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      transformResponse: (response: { success: boolean; data: SubscriptionHistoryResponse }) => response.data,
      providesTags: ['Subscription'],
    }),
  }),
});

export const {
  useGetSubscriptionSummaryQuery,
  useGetPlansQuery,
  useGetSubscriptionQuery,
  useGetSubscriptionLimitsQuery,
  useCreateCheckoutMutation,
  useCancelSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useResumeSubscriptionMutation,
  useGetSubscriptionHistoryQuery,
} = subscriptionApi;

import { createApi } from '@reduxjs/toolkit/query/react';
import { ONBOARDING } from '../../utilities/endpoint';
import { axiosBaseQuery } from '../../utilities/axiosBaseQuery';
import type { OnboardingStatus } from '../../types/api';

export const onboardingApi = createApi({
  reducerPath: 'onboardingApi',
  baseQuery: axiosBaseQuery({
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.authorization = `Bearer ${token}`;
      }
      return headers;
    },
  }),
  tagTypes: ['Onboarding'],
  endpoints: (builder) => ({
    getOnboardingStatus: builder.query<OnboardingStatus, void>({
      query: () => ({ url: ONBOARDING.STATUS }),
      providesTags: ['Onboarding'],
    }),
    updateBranding: builder.mutation<any, any>({
      query: (branding) => ({
        url: ONBOARDING.BRANDING,
        method: 'PUT',
        body: branding,
      }),
      invalidatesTags: ['Onboarding'],
    }),
    addLocation: builder.mutation<any, any>({
      query: (location) => ({
        url: ONBOARDING.LOCATION,
        method: 'POST',
        body: location,
      }),
      invalidatesTags: ['Onboarding'],
    }),
    inviteWorker: builder.mutation<any, any>({
      query: (workerData) => ({
        url: ONBOARDING.WORKER_INVITE,
        method: 'POST',
        body: workerData,
      }),
      invalidatesTags: ['Onboarding'],
    }),
    addClient: builder.mutation<any, any>({
      query: (clientData) => ({
        url: ONBOARDING.CLIENT,
        method: 'POST',
        body: clientData,
      }),
      invalidatesTags: ['Onboarding'],
    }),
    inviteTeam: builder.mutation<any, any>({
      query: (teamData) => ({
        url: ONBOARDING.TEAM_INVITE,
        method: 'POST',
        body: teamData,
      }),
      invalidatesTags: ['Onboarding'],
    }),
    skipOnboarding: builder.mutation<void, void>({
      query: () => ({ url: ONBOARDING.SKIP, method: 'PUT' }),
      invalidatesTags: ['Onboarding'],
    }),
    completeOnboarding: builder.mutation<void, void>({
      query: () => ({ url: ONBOARDING.COMPLETE, method: 'PUT' }),
      invalidatesTags: ['Onboarding'],
    }),
  }),
});

export const {
  useGetOnboardingStatusQuery,
  useUpdateBrandingMutation,
  useAddLocationMutation,
  useInviteWorkerMutation,
  useAddClientMutation,
  useInviteTeamMutation,
  useSkipOnboardingMutation,
  useCompleteOnboardingMutation,
} = onboardingApi;

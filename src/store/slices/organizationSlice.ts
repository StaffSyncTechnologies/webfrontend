import { createApi } from '@reduxjs/toolkit/query/react';
import { ORGANIZATION } from '../../utilities/endpoint';
import { axiosBaseQuery } from '../../utilities/axiosBaseQuery';
import type { Organization, Client, OrganizationBranding } from '../../types/api';

export const organizationApi = createApi({
  reducerPath: 'organizationApi',
  baseQuery: axiosBaseQuery({
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.authorization = `Bearer ${token}`;
      }
      return headers;
    },
  }),
  tagTypes: ['Organization', 'Client', 'InviteCode'],
  endpoints: (builder) => ({
    getCurrentOrganization: builder.query<Organization, void>({
      query: () => ({ url: ORGANIZATION.CURRENT }),
      providesTags: ['Organization'],
    }),
    updateCurrentOrganization: builder.mutation<Organization, Partial<Organization>>({
      query: (updates) => ({
        url: ORGANIZATION.CURRENT,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Organization'],
    }),
    getOrganizationSettings: builder.query<any, void>({
      query: () => ({ url: ORGANIZATION.SETTINGS }),
      providesTags: ['Organization'],
    }),
    updateOrganizationSettings: builder.mutation<any, any>({
      query: (settings) => ({
        url: ORGANIZATION.SETTINGS,
        method: 'PUT',
        body: settings,
      }),
      invalidatesTags: ['Organization'],
    }),
    updateOrganizationBranding: builder.mutation<any, Partial<OrganizationBranding>>({
      query: (branding) => ({
        url: ORGANIZATION.BRANDING,
        method: 'PUT',
        body: branding,
      }),
      invalidatesTags: ['Organization'],
    }),
    getClients: builder.query<Client[], void>({
      query: () => ({ url: ORGANIZATION.CLIENTS }),
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        return [];
      },
      providesTags: ['Client'],
    }),
    createClient: builder.mutation<Client, Partial<Client>>({
      query: (client) => ({ url: ORGANIZATION.CREATE_CLIENT, method: 'POST', body: client }),
      invalidatesTags: ['Client'],
    }),
    getClientDetail: builder.query<Client, string>({
      query: (clientId) => ({ url: ORGANIZATION.CLIENT_DETAIL(clientId) }),
      providesTags: ['Client'],
    }),
    updateClient: builder.mutation<Client, { clientId: string; updates: Partial<Client> }>({
      query: ({ clientId, updates }) => ({
        url: ORGANIZATION.CLIENT_DETAIL(clientId),
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Client'],
    }),
    deleteClient: builder.mutation<void, string>({
      query: (clientId) => ({ url: ORGANIZATION.CLIENT_DETAIL(clientId), method: 'DELETE' }),
      invalidatesTags: ['Client'],
    }),
    getClientUsers: builder.query<any[], string>({
      query: (clientId) => ({ url: ORGANIZATION.CLIENT_USERS(clientId) }),
      providesTags: ['Client'],
    }),
    addClientUser: builder.mutation<any, { clientId: string; user: any }>({
      query: ({ clientId, user }) => ({
        url: ORGANIZATION.CLIENT_USERS(clientId),
        method: 'POST',
        body: user,
      }),
      invalidatesTags: ['Client'],
    }),
    resendClientUserInvite: builder.mutation<void, { clientId: string; userId: string }>({
      query: ({ clientId, userId }) => ({
        url: ORGANIZATION.CLIENT_USER_RESEND_INVITE(clientId, userId),
        method: 'POST',
      }),
    }),
    setClientPayRates: builder.mutation<any, { clientId: string; payRates: any[] }>({
      query: ({ clientId, payRates }) => ({
        url: ORGANIZATION.CLIENT_PAY_RATES(clientId),
        method: 'PUT',
        body: { payRates },
      }),
      invalidatesTags: ['Client'],
    }),
    getInviteCodes: builder.query<any[], void>({
      query: () => ({ url: ORGANIZATION.INVITE_CODES }),
      providesTags: ['InviteCode'],
    }),
    createInviteCode: builder.mutation<any, { name?: string }>({
      query: (data) => ({
        url: ORGANIZATION.INVITE_CODES,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['InviteCode'],
    }),
    revokeInviteCode: builder.mutation<void, string>({
      query: (codeId) => ({
        url: ORGANIZATION.INVITE_CODE(codeId),
        method: 'DELETE',
      }),
      invalidatesTags: ['InviteCode'],
    }),
  }),
});

export const {
  useGetCurrentOrganizationQuery,
  useUpdateCurrentOrganizationMutation,
  useGetOrganizationSettingsQuery,
  useUpdateOrganizationSettingsMutation,
  useUpdateOrganizationBrandingMutation,
  useGetClientsQuery,
  useCreateClientMutation,
  useGetClientDetailQuery,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useGetClientUsersQuery,
  useAddClientUserMutation,
  useResendClientUserInviteMutation,
  useSetClientPayRatesMutation,
  useGetInviteCodesQuery,
  useCreateInviteCodeMutation,
  useRevokeInviteCodeMutation,
} = organizationApi;

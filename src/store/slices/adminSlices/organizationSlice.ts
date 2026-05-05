import { createApi } from '@reduxjs/toolkit/query/react';
import { ORGANIZATION } from '../../../services/endpoints';
import { baseApi } from '../../api/baseApi';

export interface Organization {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  logo: string | null;
  settings: any;
  branding: any;
}

export const organizationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrent: builder.query<Organization, void>({
      query: () => ({ url: ORGANIZATION.CURRENT }),
      transformResponse: (response: any) => response?.data ?? response,
    }),

    updateCurrentOrg: builder.mutation<Organization, Partial<Organization>>({
      query: (body) => ({ url: ORGANIZATION.CURRENT, method: 'PUT', body }),
    }),

    getSettings: builder.query<any, void>({
      query: () => ({ url: ORGANIZATION.SETTINGS }),
      transformResponse: (response: any) => response?.data ?? response,
    }),

    updateSettings: builder.mutation<any, Partial<any>>({
      query: (body) => ({ url: ORGANIZATION.SETTINGS, method: 'PUT', body }),
    }),

    getBranding: builder.query<any, void>({
      query: () => ({ url: ORGANIZATION.BRANDING }),
    }),

    updateBranding: builder.mutation<any, Partial<any>>({
      query: (body) => ({ url: ORGANIZATION.BRANDING, method: 'PUT', body }),
    }),

    getClients: builder.query<{ data: any[] }, void>({
      query: () => ({ url: ORGANIZATION.CLIENTS }),
    }),

    createClient: builder.mutation<any, Partial<any>>({
      query: (body) => ({ url: ORGANIZATION.CREATE_CLIENT, method: 'POST', body }),
    }),

    getClientDetail: builder.query<any, string>({
      query: (clientId) => ({ url: ORGANIZATION.CLIENT_DETAIL(clientId) }),
    }),

    getClientUsers: builder.query<any[], string>({
      query: (clientId) => ({ url: ORGANIZATION.CLIENT_USERS(clientId) }),
    }),

    resendClientUserInvite: builder.mutation<void, { clientId: string; userId: string }>({
      query: ({ clientId, userId }) => ({
        url: ORGANIZATION.CLIENT_USER_RESEND_INVITE(clientId, userId),
        method: 'POST',
      }),
    }),

    getClientPayRates: builder.query<any, string>({
      query: (clientId) => ({ url: ORGANIZATION.CLIENT_PAY_RATES(clientId) }),
    }),

    updateClientPayRates: builder.mutation<any, { clientId: string; data: any }>({
      query: ({ clientId, data }) => ({
        url: ORGANIZATION.CLIENT_PAY_RATES(clientId),
        method: 'PUT',
        body: data,
      }),
    }),

    getInviteCodes: builder.query<{ data: any[] }, void>({
      query: () => ({ url: ORGANIZATION.INVITE_CODES }),
    }),

    createInviteCode: builder.mutation<any, any>({
      query: (body) => ({ url: ORGANIZATION.INVITE_CODES, method: 'POST', body }),
    }),

    getInviteCode: builder.query<any, string>({
      query: (codeId) => ({ url: ORGANIZATION.INVITE_CODE(codeId) }),
    }),

    updateInviteCode: builder.mutation<any, { codeId: string; data: any }>({
      query: ({ codeId, data }) => ({
        url: ORGANIZATION.INVITE_CODE(codeId),
        method: 'PUT',
        body: data,
      }),
    }),

    deleteInviteCode: builder.mutation<void, string>({
      query: (codeId) => ({ url: ORGANIZATION.INVITE_CODE(codeId), method: 'DELETE' }),
    }),

    deleteAccount: builder.mutation<void, { password: string }>({
      query: (body) => ({ url: ORGANIZATION.CURRENT, method: 'DELETE', body }),
    }),

    getLocations: builder.query<any[], void>({
      query: () => ({ url: '/locations' }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ['Locations'] as any,
    }),

    addLocation: builder.mutation<any, { name: string; address: string; isPrimary: boolean }>({
      query: (body) => ({ url: '/locations', method: 'POST', body }),
      invalidatesTags: ['Locations'] as any,
    }),

    updateLocation: builder.mutation<any, { locationId: string; name: string; address: string; isPrimary: boolean }>({
      query: ({ locationId, ...body }) => ({ url: `/locations/${locationId}`, method: 'PUT', body }),
      invalidatesTags: ['Locations'] as any,
    }),
  }),
});

export const {
  useGetCurrentQuery,
  useUpdateCurrentOrgMutation,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetBrandingQuery,
  useUpdateBrandingMutation,
  useGetClientsQuery,
  useCreateClientMutation,
  useGetClientDetailQuery,
  useGetClientUsersQuery,
  useResendClientUserInviteMutation,
  useGetClientPayRatesQuery,
  useUpdateClientPayRatesMutation,
  useGetInviteCodesQuery,
  useCreateInviteCodeMutation,
  useGetInviteCodeQuery,
  useUpdateInviteCodeMutation,
  useDeleteInviteCodeMutation,
  useDeleteAccountMutation,
  useGetLocationsQuery,
  useAddLocationMutation,
  useUpdateLocationMutation,
} = organizationApi;

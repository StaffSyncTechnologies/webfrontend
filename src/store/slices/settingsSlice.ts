import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../utilities/axiosBaseQuery';
import { API_BASE } from '../../services/api';

export interface Organization {
  id: string;
  name: string;
  email?: string;
  tradingName?: string;
  registrationNumber?: string;
  vatNumber?: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  _count?: {
    users: number;
    clientCompanies: number;
    locations: number;
    shifts: number;
  };
}

export interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  geofenceRadius: number;
  contactName?: string;
  contactPhone?: string;
  isPrimary: boolean;
  isActive: boolean;
  _count?: {
    shifts: number;
  };
}

export interface StaffUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface StaffUserListResponse {
  users: StaffUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const settingsApi = createApi({
  reducerPath: 'settingsApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Organization', 'Locations', 'StaffUsers'],
  endpoints: (builder) => ({
    // Organization
    getOrganization: builder.query<Organization, void>({
      query: () => ({
        url: `${API_BASE}/api/v1/organizations/current`,
        method: 'GET',
      }),
      transformResponse: (response: { success: boolean; data: Organization }) => response.data,
      providesTags: ['Organization'],
    }),

    updateOrganization: builder.mutation<Organization, Partial<Organization>>({
      query: (data) => ({
        url: `${API_BASE}/api/v1/organizations/current`,
        method: 'PUT',
        data,
      }),
      transformResponse: (response: { success: boolean; data: Organization }) => response.data,
      invalidatesTags: ['Organization'],
    }),

    updateBranding: builder.mutation<Organization, { logoUrl?: string; primaryColor?: string; secondaryColor?: string }>({
      query: (data) => ({
        url: `${API_BASE}/api/v1/organizations/current/branding`,
        method: 'PUT',
        data,
      }),
      transformResponse: (response: { success: boolean; data: Organization }) => response.data,
      invalidatesTags: ['Organization'],
    }),

    uploadLogo: builder.mutation<{ logoUrl: string; filename: string; originalName: string; size: number }, FormData>({
      query: (formData) => ({
        url: `${API_BASE}/api/v1/organizations/current/logo`,
        method: 'POST',
        data: formData,
      }),
      transformResponse: (response: { success: boolean; data: { logoUrl: string; filename: string; originalName: string; size: number } }) => response.data,
      invalidatesTags: ['Organization'],
    }),

    uploadCoverImage: builder.mutation<{ coverImageUrl: string; filename: string; originalName: string; size: number }, FormData>({
      query: (formData) => ({
        url: `${API_BASE}/api/v1/organizations/current/cover`,
        method: 'POST',
        data: formData,
      }),
      transformResponse: (response: { success: boolean; data: { coverImageUrl: string; filename: string; originalName: string; size: number } }) => response.data,
      invalidatesTags: ['Organization'],
    }),

    // Locations
    getLocations: builder.query<Location[], void>({
      query: () => ({
        url: `${API_BASE}/api/v1/locations`,
        method: 'GET',
      }),
      transformResponse: (response: { success: boolean; data: Location[] }) => response.data,
      providesTags: ['Locations'],
    }),

    createLocation: builder.mutation<Location, Partial<Location>>({
      query: (data) => ({
        url: `${API_BASE}/api/v1/locations`,
        method: 'POST',
        data,
      }),
      transformResponse: (response: { success: boolean; data: Location }) => response.data,
      invalidatesTags: ['Locations'],
    }),

    updateLocation: builder.mutation<void, { id: string; data: Partial<Location> }>({
      query: ({ id, data }) => ({
        url: `${API_BASE}/api/v1/locations/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Locations'],
    }),

    deleteLocation: builder.mutation<void, string>({
      query: (id) => ({
        url: `${API_BASE}/api/v1/locations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Locations'],
    }),

    // Staff Users
    getStaffUsers: builder.query<StaffUserListResponse, { page?: number; limit?: number; search?: string; role?: string; status?: string }>({
      query: (params) => ({
        url: `${API_BASE}/api/v1/hr/managers`,
        method: 'GET',
        params,
      }),
      transformResponse: (response: { success: boolean; data: StaffUserListResponse }) => response.data,
      providesTags: ['StaffUsers'],
    }),

    inviteStaffUser: builder.mutation<StaffUser, { email: string; fullName: string; role: string; phone?: string }>({
      query: (data) => ({
        url: `${API_BASE}/api/v1/users`,
        method: 'POST',
        data: { ...data, sendInvite: true },
      }),
      transformResponse: (response: { success: boolean; data: StaffUser }) => response.data,
      invalidatesTags: ['StaffUsers'],
    }),

    updateStaffUser: builder.mutation<StaffUser, { id: string; data: Partial<StaffUser> }>({
      query: ({ id, data }) => ({
        url: `${API_BASE}/api/v1/users/${id}`,
        method: 'PUT',
        data,
      }),
      transformResponse: (response: { success: boolean; data: StaffUser }) => response.data,
      invalidatesTags: ['StaffUsers'],
    }),

    suspendUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `${API_BASE}/api/v1/users/${id}/suspend`,
        method: 'PUT',
      }),
      invalidatesTags: ['StaffUsers'],
    }),

    reactivateUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `${API_BASE}/api/v1/users/${id}/reactivate`,
        method: 'PUT',
      }),
      invalidatesTags: ['StaffUsers'],
    }),

    // Change Password
    changePassword: builder.mutation<void, { currentPassword: string; newPassword: string }>({
      query: (data) => ({
        url: `${API_BASE}/api/v1/auth/change-password`,
        method: 'POST',
        data,
      }),
    }),

    // Delete Organization
    deleteOrganization: builder.mutation<void, { password: string; reason?: string }>({
      query: (data) => ({
        url: `${API_BASE}/api/v1/organizations/current`,
        method: 'DELETE',
        data,
      }),
    }),
  }),
});

export const {
  useGetOrganizationQuery,
  useUpdateOrganizationMutation,
  useUpdateBrandingMutation,
  useUploadLogoMutation,
  useUploadCoverImageMutation,
  useGetLocationsQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
  useGetStaffUsersQuery,
  useInviteStaffUserMutation,
  useUpdateStaffUserMutation,
  useSuspendUserMutation,
  useReactivateUserMutation,
  useChangePasswordMutation,
  useDeleteOrganizationMutation,
} = settingsApi;

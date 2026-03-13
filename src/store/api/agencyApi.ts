import { baseApi } from './baseApi';
import { AGENCIES } from '../../services/endpoints';

export interface NearbyAgency {
  id: string;
  name: string;
  address: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  email: string | null;
  website: string | null;
  phone: string | null;
  contactName: string | null;
  latitude: number | null;
  longitude: number | null;
  distance: number | null;
}

export interface NearbyAgenciesResponse {
  success: boolean;
  data: NearbyAgency[];
}

export interface NearbyAgenciesRequest {
  lat?: number;
  lng?: number;
  radiusMiles?: number;
  city?: string;
}

export const agencyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNearbyAgencies: builder.query<NearbyAgenciesResponse, NearbyAgenciesRequest>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.lat !== undefined) searchParams.set('lat', String(params.lat));
        if (params.lng !== undefined) searchParams.set('lng', String(params.lng));
        if (params.radiusMiles !== undefined) searchParams.set('radiusMiles', String(params.radiusMiles));
        if (params.city) searchParams.set('city', params.city);
        const qs = searchParams.toString();
        return `${AGENCIES.NEARBY}${qs ? `?${qs}` : ''}`;
      },
    }),
  }),
});

export const { useGetNearbyAgenciesQuery } = agencyApi;

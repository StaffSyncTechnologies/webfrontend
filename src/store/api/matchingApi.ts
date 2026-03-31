import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../utilities/axiosBaseQuery';
import { mockMatchingApi } from '../../utils/mockMatchingApi';
import type { 
  MatchingRequest, 
  BulkMatchingRequest, 
  WorkerMatchingRequest, 
  MatchingResult 
} from '../../types/matching';

// Use real backend API - backend is deploying!
const USE_MOCK_DATA = false; // Test real backend deployment

// Fallback to mock data if backend fails
const mockBaseQuery = async (args: any) => {
  const { url, method, body } = args;
  
  console.log('🔍 MOCK BASE QUERY: Called with:', { url, method, body });
  
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Route to appropriate mock function
    if (url.includes('/workers') && !url.includes('/top')) {
      console.log('🔍 MOCK BASE QUERY: Routing to matchWorkersToShift');
      // Extract shiftId from URL and other params from args.params
      const urlParts = url.split('/');
      const shiftId = urlParts[urlParts.length - 2]; // Extract shiftId from URL
      const { limit, minScore } = args.params || {};
      console.log('🔍 MOCK BASE QUERY: Extracted params:', { shiftId, limit, minScore });
      return { data: await mockMatchingApi.matchWorkersToShift({ shiftId, limit, minScore }) };
    }
    
    if (url.includes('/top')) {
      // Extract shiftId from URL and limit from params
      const urlParts = url.split('/');
      const shiftId = urlParts[urlParts.length - 2]; // Extract shiftId from URL
      const { limit } = args.params || {};
      console.log('🔍 MOCK BASE QUERY: Top matches extracted params:', { shiftId, limit });
      return { data: await mockMatchingApi.getTopMatches({ shiftId, limit }) };
    }
    
    if (url.includes('/insights')) {
      const { shiftId } = args.params || {};
      return { data: await mockMatchingApi.getMatchingInsights({ shiftId }) };
    }
    
    if (url.includes('/bulk')) {
      const { shiftIds, limit, minScore } = body || {};
      const results: Record<string, MatchingResult[]> = {};
      for (const shiftId of shiftIds) {
        results[shiftId] = await mockMatchingApi.matchWorkersToShift({ shiftId, limit, minScore });
      }
      return { data: results };
    }
    
    if (url.includes('/shifts') && url.includes('/worker')) {
      const { workerId, shiftIds, limit, minScore } = args.params || {};
      const allResults: MatchingResult[] = [];
      for (const shiftId of (shiftIds || ['test-shift-123'])) {
        const matches = await mockMatchingApi.matchWorkersToShift({ shiftId, limit, minScore });
        allResults.push(...matches);
      }
      return { data: allResults };
    }
    
    throw new Error('Mock endpoint not found');
  } catch (error) {
    return { error: { status: 500, data: error } };
  }
};

// Enhanced base query with fallback
const enhancedBaseQuery = async (args: any, api: any, extraOptions: any) => {
  console.log('🔍 ENHANCED BASE QUERY: USE_MOCK_DATA =', USE_MOCK_DATA);
  console.log('🔍 ENHANCED BASE QUERY: args =', args);
  
  if (USE_MOCK_DATA) {
    console.log('🔍 ENHANCED BASE QUERY: Using mock data');
    return mockBaseQuery(args);
  }
  
  try {
    console.log('🔍 ENHANCED BASE QUERY: Trying real backend');
    // Try real backend first
    const result = await axiosBaseQuery({
      prepareHeaders: (headers) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          headers.authorization = `Bearer ${token}`;
        }
        return headers;
      },
    })(args, api, extraOptions);
    
    // Check if response is HTML (indicates backend route not found)
    if (result.data && typeof result.data === 'string' && result.data.includes('<!doctype html>')) {
      console.log('🔍 ENHANCED BASE QUERY: Backend returned HTML, falling back to mock');
      return mockBaseQuery(args);
    }
    
    return result;
  } catch (error) {
    console.log('🔍 ENHANCED BASE QUERY: Backend failed, falling back to mock');
    console.log('🔍 ENHANCED BASE QUERY: Backend error was:', error);
    // Fallback to mock on any error
    return mockBaseQuery(args);
  }
};

export const matchingApi = createApi({
  reducerPath: 'matchingApi',
  baseQuery: enhancedBaseQuery,
  tagTypes: ['Matching'],
  endpoints: (builder) => ({
    // Match workers to a specific shift - matches your backend route!
    matchWorkersToShift: builder.query<MatchingResult[], MatchingRequest>({
      query: ({ shiftId, limit, minScore }) => ({
        url: `/api/v1/matching/shifts/${shiftId}/workers`, // FIXED: Added /api/v1 prefix
        params: { limit, minScore, includeUnavailable: true }, // TEMP: Include unavailable workers for testing
      }),
      providesTags: ['Matching'],
      transformResponse: (response: any) => {
        // Debug: Log the actual response from backend
        console.log('Backend Response:', response);
        
        // Handle both mock data (direct array) and real backend (wrapped in data object)
        let matches = [];
        
        if (Array.isArray(response)) {
          // Mock data returns the array directly
          matches = response;
          console.log('🔍 TRANSFORM: Using mock data structure (direct array)');
        } else if (response.data?.matches) {
          // Real backend returns { data: { matches: [...] } }
          matches = response.data.matches;
          console.log('🔍 TRANSFORM: Using real backend structure (data.matches)');
        } else if (response.data && Array.isArray(response.data)) {
          // Alternative structure
          matches = response.data;
          console.log('🔍 TRANSFORM: Using alternative structure (data is array)');
        }
        
        console.log('🔍 TRANSFORM: Final matches array:', matches.length, matches);
        
        // Ensure matches is always an array
        if (!Array.isArray(matches)) {
          console.error('Expected array but got:', typeof matches, matches);
          return [];
        }
        
        return matches;
      },
    }),

    // Match a worker to available shifts - matches your backend route!
    matchWorkerToShifts: builder.query<MatchingResult[], WorkerMatchingRequest>({
      query: ({ workerId, shiftIds, limit, minScore }) => ({
        url: `/api/v1/matching/workers/${workerId}/shifts`, // FIXED: Added /api/v1 prefix
        params: { limit, minScore, status: 'OPEN' },
      }),
      providesTags: ['Matching'],
      transformResponse: (response: any) => {
        console.log('Worker Shifts Response:', response);
        const matches = response.data?.matches || [];
        if (!Array.isArray(matches)) {
          console.error('Expected array but got:', typeof matches, matches);
          return [];
        }
        return matches;
      },
    }),

    // Quick match endpoint - matches your backend route!
    quickMatch: builder.mutation<MatchingResult, { workerId: string; shiftId: string }>({
      query: ({ workerId, shiftId }) => ({
        url: '/api/v1/matching/quick-match', // FIXED: Added /api/v1 prefix
        method: 'POST',
        body: { workerId, shiftId },
      }),
      transformResponse: (response: any) => {
        console.log('Quick Match Response:', response);
        return response.data;
      },
    }),

    // Get top matches (using the main endpoint with limit)
    getTopMatches: builder.query<MatchingResult[], { shiftId: string; limit?: number }>({
      query: ({ shiftId, limit = 5 }) => ({
        url: `/api/v1/matching/shifts/${shiftId}/workers`, // FIXED: Added /api/v1 prefix
        params: { limit, minScore: 70, includeUnavailable: true }, // TEMP: Include unavailable workers for testing
      }),
      providesTags: ['Matching'],
      transformResponse: (response: any) => {
        console.log('Top Matches Response:', response);
        
        // Handle both mock data (direct array) and real backend response
        let matches = [];
        
        if (Array.isArray(response)) {
          // Mock data returns the array directly
          matches = response;
          console.log('🔍 TOP TRANSFORM: Using mock data structure (direct array)');
        } else if (response.data?.matches) {
          // Real backend returns { data: { matches: [...] } }
          matches = response.data.matches;
          console.log('🔍 TOP TRANSFORM: Using real backend structure (data.matches)');
        } else if (response.data && Array.isArray(response.data)) {
          // Alternative structure
          matches = response.data;
          console.log('🔍 TOP TRANSFORM: Using alternative structure (data is array)');
        }
        
        console.log('🔍 TOP TRANSFORM: Final matches array:', matches.length, matches);
        
        if (!Array.isArray(matches)) {
          console.error('Expected array but got:', typeof matches, matches);
          return [];
        }
        return matches; // Let the component handle the limit
      },
    }),

    // Health check for matching service
    getMatchingHealth: builder.query<{ success: boolean; service: string; status: string }, void>({
      query: () => '/api/v1/matching/health', // FIXED: Added /api/v1 prefix
      providesTags: ['Matching'],
    }),
  }),
});

export const {
  useMatchWorkersToShiftQuery,
  useMatchWorkerToShiftsQuery,
  useGetTopMatchesQuery,
  useQuickMatchMutation,
  useGetMatchingHealthQuery,
} = matchingApi;

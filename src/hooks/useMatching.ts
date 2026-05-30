import { useState, useCallback } from 'react';
import { useMatchWorkersToShiftQuery, useGetTopMatchesQuery } from '../store/api/matchingApi';
import type { MatchingResult } from '../types/matching';

// Add styled component for error messages
const ErrorMessage = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
};

interface UseMatchingOptions {
  shiftId: string;
  limit?: number;
  minScore?: number;
  autoFetch?: boolean;
}

export const useMatching = ({ 
  shiftId, 
  limit = 10, 
  minScore = 0,
  autoFetch = true 
}: UseMatchingOptions) => {
  const [showResults, setShowResults] = useState(false);
  
  // Only fetch if we have a valid shiftId and autoFetch is true
  const shouldFetch = autoFetch && Boolean(shiftId);
  
  // DEBUG: Log what we're working with
  console.log('🔍 useMatching DEBUG:', JSON.stringify({
    shiftId,
    autoFetch,
    shouldFetch,
    limit,
    minScore,
  }, null, 2));
  
  // Full matching query
  const {
    data: matches,
    isLoading: isLoadingMatches,
    error: matchesError,
    refetch: refetchMatches,
  } = useMatchWorkersToShiftQuery(
    { shiftId: shiftId!, limit, minScore },
    { skip: !shouldFetch }
  );

  // Quick top matches query
  const {
    data: topMatches,
    isLoading: isLoadingTop,
    error: topError,
    refetch: refetchTop,
  } = useGetTopMatchesQuery(
    { shiftId: shiftId!, limit: Math.min(limit, 5) },
    { skip: !shouldFetch }
  );

  const getMatchingScore = useCallback((workerId: string): number => {
    const result = matches?.find(m => m.workerId === workerId) || 
                  topMatches?.find(m => m.workerId === workerId);
    return result?.overallScore || 0;
  }, [matches, topMatches]);

  const getWorkerWarnings = useCallback((workerId: string): string[] => {
    const result = matches?.find(m => m.workerId === workerId) || 
                  topMatches?.find(m => m.workerId === workerId);
    return result?.warnings || [];
  }, [matches, topMatches]);

  const getWorkerReasons = useCallback((workerId: string): string[] => {
    const result = matches?.find(m => m.workerId === workerId) || 
                  topMatches?.find(m => m.workerId === workerId);
    return result?.reasons || [];
  }, [matches, topMatches]);

  const isGoodMatch = useCallback((workerId: string, threshold = 70): boolean => {
    return getMatchingScore(workerId) >= threshold;
  }, [getMatchingScore]);

  const getBestMatches = useCallback((count = 3): MatchingResult[] => {
    const allMatches = [...(matches || []), ...(topMatches || [])];
    const uniqueMatches = allMatches.filter((match, index, self) => 
      index === self.findIndex(m => m.workerId === match.workerId)
    );
    return uniqueMatches
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, count);
  }, [matches, topMatches]);

  const refreshMatches = useCallback(() => {
    refetchMatches();
    refetchTop();
  }, [refetchMatches, refetchTop]);

  // DEBUG: Log what the hook is returning
  console.log('🔍 useMatching RETURN DEBUG:', JSON.stringify({
    matches,
    matchesLength: matches?.length,
    isLoading: isLoadingMatches || isLoadingTop,
    error: matchesError || topError,
  }, null, 2));

  return {
    // Data
    matches: matches || [],
    topMatches: topMatches || [],
    bestMatches: getBestMatches(),
    
    // Loading states
    isLoading: isLoadingMatches || isLoadingTop,
    isLoadingMatches,
    isLoadingTop,
    
    // Errors
    error: matchesError || topError,
    matchesError,
    topError,
    
    // UI state
    showResults,
    setShowResults,
    
    // Actions
    refreshMatches,
    refetchMatches,
    refetchTop,
    
    // Utility functions
    getMatchingScore,
    getWorkerWarnings,
    getWorkerReasons,
    isGoodMatch,
    getBestMatches,
  };
};

// Mock data for testing Smart Matching Engine when backend isn't ready
import type { MatchingResult } from '../types/matching';

// Generate mock matching results for testing
export const generateMockMatches = (shiftId: string, count: number = 10): MatchingResult[] => {
  const workers = [
    { id: 'worker-001', skills: ['Nursing', 'Care', 'First Aid'], performance: 0.9 },
    { id: 'worker-002', skills: ['Nursing', 'Medication'], performance: 0.85 },
    { id: 'worker-003', skills: ['Care', 'Support'], performance: 0.7 },
    { id: 'worker-004', skills: ['Nursing', 'Emergency'], performance: 0.95 },
    { id: 'worker-005', skills: ['Support', 'Care'], performance: 0.6 },
    { id: 'worker-006', skills: ['First Aid', 'Emergency'], performance: 0.8 },
    { id: 'worker-007', skills: ['Nursing', 'Care'], performance: 0.75 },
    { id: 'worker-008', skills: ['Medication', 'Support'], performance: 0.65 },
    { id: 'worker-009', skills: ['Emergency', 'First Aid'], performance: 0.9 },
    { id: 'worker-010', skills: ['Care', 'Nursing'], performance: 0.55 },
  ];

  return workers.slice(0, count).map((worker, index) => {
    // Create varied scores for testing different scenarios
    const baseScore = worker.performance * 100;
    const variation = (Math.random() - 0.5) * 40; // ±20 points variation
    const overallScore = Math.max(0, Math.min(100, baseScore + variation));

    // Generate different scenarios
    const skillMatch = overallScore + (Math.random() - 0.5) * 30;
    const locationMatch = Math.random() * 100;
    const performanceScore = worker.performance * 100;
    const availabilityMatch = 60 + Math.random() * 40;
    const preferenceMatch = 50 + Math.random() * 50;

    const reasons: string[] = [];
    const warnings: string[] = [];

    // Add reasons based on scores
    if (performanceScore >= 80) reasons.push('Excellent performance record');
    if (skillMatch >= 80) reasons.push('Strong skill match');
    if (locationMatch >= 80) reasons.push('Very close to work location');
    if (availabilityMatch >= 80) reasons.push('Perfect time availability');

    // Add warnings based on low scores
    if (skillMatch < 50) warnings.push('May lack some required skills');
    if (locationMatch < 40) warnings.push('Long commute distance');
    if (performanceScore < 60) warnings.push('Mixed performance history');
    if (preferenceMatch < 50) warnings.push('Below preferred pay rate');

    return {
      workerId: worker.id,
      shiftId,
      overallScore: Math.round(overallScore * 10) / 10,
      breakdown: {
        skillMatch: Math.round(Math.max(0, Math.min(100, skillMatch)) * 10) / 10,
        availabilityMatch: Math.round(availabilityMatch * 10) / 10,
        locationMatch: Math.round(locationMatch * 10) / 10,
        performanceScore: Math.round(performanceScore * 10) / 10,
        preferenceMatch: Math.round(preferenceMatch * 10) / 10,
      },
      confidence: 0.6 + Math.random() * 0.4, // 60-100% confidence
      reasons,
      warnings,
    };
  });
};

// Mock API responses
export const mockMatchingApi = {
  matchWorkersToShift: async ({ shiftId, limit = 10, minScore = 0 }: { shiftId: string; limit?: number; minScore?: number }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('🔍 MOCK API: matchWorkersToShift called with:', { shiftId, limit, minScore });
    
    const allMatches = generateMockMatches(shiftId, 15);
    console.log('🔍 MOCK API: Generated matches:', allMatches.length);
    console.log('🔍 MOCK API: Sample match:', allMatches[0]);
    
    const filteredMatches = allMatches.filter(match => match.overallScore >= minScore);
    console.log('🔍 MOCK API: Matches after minScore filter (>=', minScore, '):', filteredMatches.length);
    
    const finalMatches = filteredMatches.slice(0, limit);
    console.log('🔍 MOCK API: Final matches after limit:', finalMatches.length);
    
    return finalMatches;
  },

  getTopMatches: async ({ shiftId, limit = 5 }: { shiftId: string; limit?: number }) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const allMatches = generateMockMatches(shiftId, 10);
    const sortedMatches = allMatches.sort((a, b) => b.overallScore - a.overallScore);
    return sortedMatches.slice(0, limit);
  },

  getMatchingInsights: async ({ shiftId }: { shiftId: string }) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const matches = generateMockMatches(shiftId, 20);
    const totalCandidates = matches.length;
    const averageScore = matches.reduce((sum, m) => sum + m.overallScore, 0) / totalCandidates;

    return {
      totalCandidates,
      averageScore: Math.round(averageScore * 10) / 10,
      skillDistribution: {
        'Nursing': matches.filter(m => m.breakdown.skillMatch >= 70).length,
        'Care': matches.filter(m => m.breakdown.skillMatch >= 60).length,
        'Support': matches.filter(m => m.breakdown.skillMatch >= 50).length,
      },
      locationDistribution: {
        'Nearby': matches.filter(m => m.breakdown.locationMatch >= 70).length,
        'Moderate': matches.filter(m => m.breakdown.locationMatch >= 40 && m.breakdown.locationMatch < 70).length,
        'Far': matches.filter(m => m.breakdown.locationMatch < 40).length,
      },
      topReasons: [
        'Strong skill match',
        'Excellent performance record',
        'Very close to work location',
      ],
      commonWarnings: [
        'Long commute distance',
        'May lack some required skills',
        'Below preferred pay rate',
      ],
    };
  },
};

// Export for easy testing
export const mockShiftId = 'test-shift-123';
export const mockWorkerId = 'worker-001';

// Types for Smart Matching Engine
export interface WorkerProfile {
  id: string;
  skills: string[];
  performance: {
    reliabilityScore: number; // 0-1
    averageRating: number; // 0-5
    punctualityScore: number; // 0-1
    completedShifts: number;
    noShowRate: number; // 0-1
  };
  availability: {
    preferredShifts: ('morning' | 'afternoon' | 'night' | 'overnight')[];
    noticePeriod: number; // hours
  };
  location: {
    latitude: number;
    longitude: number;
    maxTravelDistance: number; // km
  };
  preferences: {
    minHourlyRate: number;
    preferredLocations: string[];
  };
}

export interface ShiftRequirement {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  specialRequirements: string[];
  timing: {
    startTime: string; // ISO string
    endTime: string; // ISO string
  };
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  compensation: {
    hourlyRate: number;
  };
  urgency: 'normal' | 'high' | 'critical';
}

export interface MatchingResult {
  workerId: string;
  shiftId: string;
  overallScore: number; // 0-100
  breakdown: {
    skillMatch: number;
    availabilityMatch: number;
    locationMatch: number;
    performanceScore: number;
    preferenceMatch: number;
  };
  confidence: number; // 0-1
  reasons: string[];
  warnings: string[];
}

export interface MatchingRequest {
  shiftId: string;
  limit?: number; // Optional limit on number of results
  minScore?: number; // Optional minimum score threshold
}

export interface BulkMatchingRequest {
  shiftIds: string[];
  limit?: number;
  minScore?: number;
}

export interface WorkerMatchingRequest {
  workerId: string;
  shiftIds?: string[]; // Optional specific shifts
  limit?: number;
  minScore?: number;
}

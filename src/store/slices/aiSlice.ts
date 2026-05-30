import { createApi } from '@reduxjs/toolkit/query/react';
import { AI } from '../../utilities/endpoint';
import { axiosBaseQuery } from '../../utilities/axiosBaseQuery';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WorkerSuggestion {
  workerId:       string;
  name:           string;
  skills:         string[];
  attendanceRate: number;      // 0–100
  totalShifts:    number;
  reliability:    number;      // 0–100
  score:          number;      // 0–100, AI-assigned fit score
  reasoning:      string;      // one-sentence AI explanation
  warnings:       string[];    // concerns flagged by AI
}

export interface SuggestWorkersRequest {
  description:      string;
  date?:            string;    // YYYY-MM-DD
  requiredCount?:   number;
  shiftId?:         string;
  requiredSkillIds?: string[];
}

export interface AbsencePrediction {
  workerId:          string;
  workerName:        string;
  shiftId:           string;
  shiftTitle:        string;
  startTime:         string;
  noShowProbability: number;   // 0–1
  riskLevel:         'low' | 'medium' | 'high' | 'critical';
  confidence:        number;   // 0–1
  keyRiskFactors:    Array<{ factor: string; impact: number; description: string }>;
  recommendations:   string[];
  attendanceStats:   { total: number; missed: number; rate: number };
}

export interface AbsencePredictionsResponse {
  date:         string;
  totalWorkers: number;
  atRiskCount:  number;
  highRiskCount: number;
  predictions:  AbsencePrediction[];
}

// ─── API Slice ────────────────────────────────────────────────────────────────

export const aiApi = createApi({
  reducerPath: 'aiApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['AISuggestions', 'AbsencePredictions'],
  endpoints: (builder) => ({

    // Feature 1: AI worker suggestions
    suggestWorkers: builder.mutation<
      { success: boolean; data: WorkerSuggestion[] },
      SuggestWorkersRequest
    >({
      query: (body) => ({
        url:    AI.SUGGEST_WORKERS,
        method: 'POST',
        data:   body,
      }),
    }),

    // Feature 2: Absence predictions for a given date
    getAbsencePredictions: builder.query<
      { success: boolean; data: AbsencePredictionsResponse },
      { date?: string } | void
    >({
      query: (params) => ({
        url:    AI.ABSENCE_PREDICTIONS,
        params: params || undefined,
      }),
      providesTags: ['AbsencePredictions'],
    }),

  }),
});

export const {
  useSuggestWorkersMutation,
  useGetAbsencePredictionsQuery,
} = aiApi;

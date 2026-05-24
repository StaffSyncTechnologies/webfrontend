/**
 * shiftSlice — admin shift operations.
 * All endpoints now live in store/api/shiftsApi.ts to avoid duplicate
 * injectEndpoints registrations on baseApi.
 * This file simply re-exports everything from there for backwards-compat.
 */
export * from '../../api/shiftsApi';

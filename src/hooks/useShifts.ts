import { useCallback, useMemo } from 'react';
import {
  useGetShiftsQuery,
  useGetMyShiftHistoryQuery,
  useAcceptShiftMutation,
  useDeclineShiftMutation,
  useClockInMutation,
  useClockOutMutation,
  useGetMyAttendanceStatusQuery,
} from '../store';

export function useShifts(status?: string) {
  const { data: shiftsData, isLoading, refetch } = useGetShiftsQuery({ status });
  const { data: historyData } = useGetMyShiftHistoryQuery();
  const { data: attendanceData } = useGetMyAttendanceStatusQuery();

  const [acceptMutation] = useAcceptShiftMutation();
  const [declineMutation] = useDeclineShiftMutation();
  const [clockInMutation] = useClockInMutation();
  const [clockOutMutation] = useClockOutMutation();

  const shifts = shiftsData?.data || [];
  const history = historyData?.data || [];
  const attendance = attendanceData?.data || null;

  const categorized = useMemo(() => ({
    upcoming: shifts.filter((s) => new Date(s.startTime) > new Date()),
    available: shifts.filter((s) => s.status === 'OPEN'),
    completed: history.filter((s) => s.status === 'COMPLETED'),
  }), [shifts, history]);

  const accept = useCallback(async (id: string) => {
    try {
      await acceptMutation(id).unwrap();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.data?.message };
    }
  }, [acceptMutation]);

  const decline = useCallback(async (id: string, reason?: string) => {
    try {
      await declineMutation({ shiftId: id, reason }).unwrap();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.data?.message };
    }
  }, [declineMutation]);

  const clockIn = useCallback(async (id: string, lat?: number, lng?: number) => {
    try {
      await clockInMutation({ shiftId: id, lat, lng }).unwrap();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.data?.message };
    }
  }, [clockInMutation]);

  const clockOut = useCallback(async (id: string, lat?: number, lng?: number) => {
    try {
      await clockOutMutation({ shiftId: id, lat, lng }).unwrap();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.data?.message };
    }
  }, [clockOutMutation]);

  return { shifts, history, attendance, categorized, isLoading, refetch, accept, decline, clockIn, clockOut };
}

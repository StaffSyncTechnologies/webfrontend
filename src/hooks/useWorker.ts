import { useCallback } from 'react';
import {
  useGetHomeQuery,
  useGetMyDocumentsQuery,
  useDeleteDocumentMutation,
  useGetPayslipsQuery,
  useGetMyHolidayRequestsQuery,
  useRequestHolidayMutation,
  useCancelHolidayRequestMutation,
} from '../store';

export function useWorker() {
  const { data: homeData, isLoading: isLoadingHome, refetch: refetchHome } = useGetHomeQuery();
  const { data: docsData, isLoading: isLoadingDocs, refetch: refetchDocs } = useGetMyDocumentsQuery();
  const { data: payslipsData, isLoading: isLoadingPayslips } = useGetPayslipsQuery();
  const { data: holidaysData, isLoading: isLoadingHolidays } = useGetMyHolidayRequestsQuery();

  const [deleteDocMutation] = useDeleteDocumentMutation();
  const [requestHolidayMutation] = useRequestHolidayMutation();
  const [cancelHolidayMutation] = useCancelHolidayRequestMutation();

  const home = homeData?.data || null;
  const documents = docsData?.data || [];
  const payslips = payslipsData?.data || [];
  const holidays = holidaysData?.data || [];

  const deleteDocument = useCallback(async (docId: string) => {
    try {
      await deleteDocMutation(docId).unwrap();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.data?.message };
    }
  }, [deleteDocMutation]);

  const requestHoliday = useCallback(async (data: { type: string; startDate: string; endDate: string; days: number; reason?: string }) => {
    try {
      await requestHolidayMutation(data as any).unwrap();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.data?.message };
    }
  }, [requestHolidayMutation]);

  const cancelHoliday = useCallback(async (id: string) => {
    try {
      await cancelHolidayMutation(id).unwrap();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.data?.message };
    }
  }, [cancelHolidayMutation]);

  return {
    home,
    documents,
    payslips,
    holidays,
    isLoading: isLoadingHome || isLoadingDocs || isLoadingPayslips || isLoadingHolidays,
    refetchHome,
    refetchDocs,
    deleteDocument,
    requestHoliday,
    cancelHoliday,
  };
}

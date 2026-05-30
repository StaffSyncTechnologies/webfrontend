import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';

// Types
export interface TimesheetStats {
  total: { count: number; change: number };
  approved: { count: number; change: number };
  pending: { count: number; change: number };
  flagged: { count: number; change: number };
}

export interface TimesheetWorker {
  id: string;
  fullName: string;
  email?: string;
  avatar?: string;
}

export interface TimesheetClient {
  id: string;
  companyName: string;
}

export interface TimesheetShiftTime {
  scheduled: { start: string; end: string };
  actual: { start: string | null; end: string | null };
}

export interface TimesheetItem {
  id: string;
  worker: TimesheetWorker;
  client: { id: string; companyName: string } | null;
  date: string | null;
  shiftTime: TimesheetShiftTime;
  duration: string | null;
  durationHours: number;
  status: 'PENDING' | 'APPROVED' | 'FLAGGED';
  flagReason?: string;
  geofenceValid: boolean | null;
}

export interface TimesheetListResponse {
  timesheets: TimesheetItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TimesheetDetailActivity {
  time: string;
  action: string;
  details: string;
}

export interface TimesheetDetail {
  id: string;
  worker: TimesheetWorker & { phone?: string };
  shift: { title: string; startAt: string; endAt: string; location?: string };
  client: TimesheetClient | null;
  clockInAt: string | null;
  clockOutAt: string | null;
  scheduledHours: number;
  actualHours: number;
  breakDuration: number;
  status: 'PENDING' | 'APPROVED' | 'FLAGGED';
  variance: number;
  isLate: boolean;
  isEarlyLeave: boolean;
  geofenceValid: boolean;
  notes?: string;
  activityLog: TimesheetDetailActivity[];
}

export interface TimesheetListParams {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'APPROVED' | 'FLAGGED';
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface ClientWeeklyHours {
  week: string;
  hours: number;
  workers: number;
}

export interface ClientTimesheetData {
  clientId: string;
  clientName: string;
  totalHours: number;
  avgWeeklyHours: number;
  avgWorkers: number;
  weeklyBreakdown: ClientWeeklyHours[];
}

export interface TimesheetByClientResponse {
  clients: ClientTimesheetData[];
  period: {
    weeks: number;
    from: string;
    to: string;
  };
}

// Query keys
export const timesheetKeys = {
  all: ['timesheet'] as const,
  stats: () => [...timesheetKeys.all, 'stats'] as const,
  list: (params?: TimesheetListParams) => [...timesheetKeys.all, 'list', params] as const,
  detail: (id: string) => [...timesheetKeys.all, 'detail', id] as const,
  byClient: (weeks?: number) => [...timesheetKeys.all, 'by-client', weeks] as const,
};

// Get timesheet stats
export const useTimesheetStats = () => {
  return useQuery({
    queryKey: timesheetKeys.stats(),
    queryFn: async () => {
      const response = await api.get<{ data: TimesheetStats }>('/attendance/timesheet/stats');
      return response.data.data;
    },
  });
};

// Get timesheet list
export const useTimesheetList = (params?: TimesheetListParams) => {
  return useQuery({
    queryKey: timesheetKeys.list(params),
    queryFn: async () => {
      const response = await api.get<{ data: TimesheetListResponse }>('/attendance/timesheet/list', {
        params,
      });
      return response.data.data;
    },
  });
};

// Get timesheet by client (hours worked per client per week)
export const useTimesheetByClient = (weeks: number = 4) => {
  return useQuery({
    queryKey: timesheetKeys.byClient(weeks),
    queryFn: async () => {
      const response = await api.get<{ data: TimesheetByClientResponse }>('/attendance/timesheet/by-client', {
        params: { weeks },
      });
      return response.data.data;
    },
  });
};

// Get timesheet detail
export const useTimesheetDetail = (attendanceId: string) => {
  return useQuery({
    queryKey: timesheetKeys.detail(attendanceId),
    queryFn: async () => {
      const response = await api.get<{ data: TimesheetDetail }>(`/attendance/timesheet/${attendanceId}`);
      return response.data.data;
    },
    enabled: !!attendanceId,
  });
};

// Approve single timesheet
export const useApproveTimesheet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attendanceId: string) => {
      const response = await api.post(`/attendance/${attendanceId}/approve`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timesheetKeys.all });
    },
  });
};

// Flag timesheet
export const useFlagTimesheet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ attendanceId, reason }: { attendanceId: string; reason: string }) => {
      const response = await api.post(`/attendance/${attendanceId}/flag`, { reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timesheetKeys.all });
    },
  });
};

// Bulk approve timesheets
export const useBulkApproveTimesheets = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attendanceIds: string[]) => {
      const response = await api.post('/attendance/timesheet/bulk-approve', { attendanceIds });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timesheetKeys.all });
    },
  });
};

// Export timesheets
export const useExportTimesheets = () => {
  return useMutation({
    mutationFn: async (params?: { status?: string; startDate?: string; endDate?: string }) => {
      const response = await api.get('/attendance/timesheet/export', {
        params,
        responseType: 'blob',
      });
      
      // Create download link
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `timesheets-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    },
  });
};

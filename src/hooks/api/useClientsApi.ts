import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

// ============ TYPES ============
export interface ClientStats {
  total: { count: number; change: number };
  active: { count: number; change: number };
  inactive: { count: number; change: number };
  outstandingInvoices: { count: number; change: number };
}

export interface ClientActiveShifts {
  filled: number;
  needed: number;
  percentage: number;
}

export interface ClientListItem {
  id: string;
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  industry: string | null;
  status: string;
  activeShifts: ClientActiveShifts;
  billingStatus: 'PAID' | 'PENDING' | 'OVERDUE' | 'NONE';
  totalShifts: number;
  totalInvoices: number;
  createdAt: string;
}

export interface ClientListResponse {
  clients: ClientListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ClientListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  industry?: string;
  billingStatus?: string;
}

export interface CreateClientData {
  name: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  postcode?: string;
  industry?: string;
  defaultPayRate?: number;
  defaultChargeRate?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

// ============ QUERY KEYS ============
export const clientKeys = {
  all: ['clients'] as const,
  stats: () => [...clientKeys.all, 'stats'] as const,
  list: (params?: ClientListParams) => [...clientKeys.all, 'list', params] as const,
  detail: (id: string) => [...clientKeys.all, 'detail', id] as const,
};

// ============ HOOKS ============

// Get client stats
export const useClientStats = () => {
  return useQuery({
    queryKey: clientKeys.stats(),
    queryFn: async () => {
      const response = await api.get<{ data: ClientStats }>('/clients/stats');
      return response.data.data;
    },
  });
};

// Get client list
export const useClientList = (params?: ClientListParams) => {
  return useQuery({
    queryKey: clientKeys.list(params),
    queryFn: async () => {
      const response = await api.get<{ data: ClientListResponse }>('/clients/list', { params });
      return response.data.data;
    },
  });
};

// Get client details
export const useClientDetails = (clientId: string) => {
  return useQuery({
    queryKey: clientKeys.detail(clientId),
    queryFn: async () => {
      const response = await api.get<{ data: any }>(`/clients/${clientId}/details`);
      return response.data.data;
    },
    enabled: !!clientId,
  });
};

// Create client
export const useCreateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateClientData) => {
      const response = await api.post('/clients', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
};

// Update client
export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ clientId, data }: { clientId: string; data: Partial<CreateClientData> }) => {
      const response = await api.put(`/clients/${clientId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
};

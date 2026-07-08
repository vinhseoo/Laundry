import { apiClient } from '@/config/apiClient';
import type { 
  ApiResponse, 
  PageResponse, 
  OrderResponse, 
  OrderRequest, 
  TableParams 
} from '@/types';

export const orderService = {
  getAll: (params?: TableParams & { status?: string }): Promise<ApiResponse<PageResponse<OrderResponse>>> => {
    return apiClient.get('/orders', { params });
  },

  getById: (id: number): Promise<ApiResponse<OrderResponse>> => {
    return apiClient.get(`/orders/${id}`);
  },

  create: (data: OrderRequest): Promise<ApiResponse<OrderResponse>> => {
    return apiClient.post('/orders', data);
  },

  updateStatus: (id: number, status: string): Promise<ApiResponse<OrderResponse>> => {
    return apiClient.put(`/orders/${id}/status`, null, { params: { status } });
  },

  getSlaWarnings: (): Promise<ApiResponse<OrderResponse[]>> => {
    return apiClient.get('/orders/sla-warnings');
  },

  delete: (id: number): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/orders/${id}`);
  },
};

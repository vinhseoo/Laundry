import { apiClient } from '@/config/apiClient';
import type { 
  ApiResponse, 
  PageResponse, 
  OrderResponse, 
  OrderRequest, 
  OrderDeliveryRequest,
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

  assignRack: (id: number, rackId: number): Promise<ApiResponse<OrderResponse>> => {
    return apiClient.put(`/orders/${id}/assign-rack`, null, { params: { rackId } });
  },

  deliver: (id: number, data: OrderDeliveryRequest): Promise<ApiResponse<OrderResponse>> => {
    return apiClient.put(`/orders/${id}/delivery`, data);
  },

  getSlaWarnings: (): Promise<ApiResponse<OrderResponse[]>> => {
    return apiClient.get('/orders/sla-warnings');
  },

  notifyCustomer: (id: number): Promise<ApiResponse<OrderResponse>> => {
    return apiClient.put(`/orders/${id}/notify-customer`);
  },

  delete: (id: number): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/orders/${id}`);
  },
};

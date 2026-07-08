import { apiClient } from '@/config/apiClient';
import type { 
  ApiResponse, 
  PageResponse, 
  LaundryBasketResponse, 
  LaundryBasketRequest, 
  TableParams 
} from '@/types';

export const basketService = {
  getAll: (params?: TableParams & { status?: string }): Promise<ApiResponse<PageResponse<LaundryBasketResponse>>> => {
    return apiClient.get('/baskets', { params });
  },

  getActive: (): Promise<ApiResponse<LaundryBasketResponse[]>> => {
    return apiClient.get('/baskets/active');
  },

  getById: (id: number): Promise<ApiResponse<LaundryBasketResponse>> => {
    return apiClient.get(`/baskets/${id}`);
  },

  create: (data: LaundryBasketRequest): Promise<ApiResponse<LaundryBasketResponse>> => {
    return apiClient.post('/baskets', data);
  },

  update: (id: number, data: LaundryBasketRequest): Promise<ApiResponse<LaundryBasketResponse>> => {
    return apiClient.put(`/baskets/${id}`, data);
  },

  assignToOrder: (id: number, orderId?: number | null): Promise<ApiResponse<LaundryBasketResponse>> => {
    return apiClient.put(`/baskets/${id}/assign-order`, null, { params: { orderId } });
  },

  assignToEquipment: (id: number, equipmentId: number): Promise<ApiResponse<LaundryBasketResponse>> => {
    return apiClient.put(`/baskets/${id}/assign-equipment/${equipmentId}`);
  },

  releaseFromEquipment: (id: number): Promise<ApiResponse<LaundryBasketResponse>> => {
    return apiClient.put(`/baskets/${id}/release`);
  },

  delete: (id: number): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/baskets/${id}`);
  },
};

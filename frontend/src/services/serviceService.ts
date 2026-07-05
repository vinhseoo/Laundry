import { apiClient } from '@/config/apiClient';
import type { 
  ApiResponse, 
  PageResponse, 
  ServiceResponse, 
  ServiceRequest, 
  TableParams 
} from '@/types';

export const serviceService = {
  getAll: (params?: TableParams): Promise<ApiResponse<PageResponse<ServiceResponse>>> => {
    return apiClient.get('/services', { params });
  },

  getById: (id: number): Promise<ApiResponse<ServiceResponse>> => {
    return apiClient.get(`/services/${id}`);
  },

  create: (data: ServiceRequest): Promise<ApiResponse<ServiceResponse>> => {
    return apiClient.post('/services', data);
  },

  update: (id: number, data: ServiceRequest): Promise<ApiResponse<ServiceResponse>> => {
    return apiClient.put(`/services/${id}`, data);
  },

  delete: (id: number): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/services/${id}`);
  },
};

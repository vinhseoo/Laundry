import { apiClient } from '@/config/apiClient';
import type { 
  ApiResponse, 
  PageResponse, 
  StorageRackResponse, 
  StorageRackRequest, 
  TableParams 
} from '@/types';

export const storageRackService = {
  getAll: (params?: TableParams & { status?: string }): Promise<ApiResponse<PageResponse<StorageRackResponse>>> => {
    return apiClient.get('/storage-racks', { params });
  },

  getAvailable: (): Promise<ApiResponse<StorageRackResponse[]>> => {
    return apiClient.get('/storage-racks/available');
  },

  getById: (id: number): Promise<ApiResponse<StorageRackResponse>> => {
    return apiClient.get(`/storage-racks/${id}`);
  },

  create: (data: StorageRackRequest): Promise<ApiResponse<StorageRackResponse>> => {
    return apiClient.post('/storage-racks', data);
  },

  update: (id: number, data: StorageRackRequest): Promise<ApiResponse<StorageRackResponse>> => {
    return apiClient.put(`/storage-racks/${id}`, data);
  },

  delete: (id: number): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/storage-racks/${id}`);
  },
};

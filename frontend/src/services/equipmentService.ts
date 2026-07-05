import { apiClient } from '@/config/apiClient';
import type { 
  ApiResponse, 
  PageResponse, 
  EquipmentResponse, 
  EquipmentRequest, 
  TableParams 
} from '@/types';

export interface EquipmentTableParams extends TableParams {
  type?: string;
  status?: string;
}

export const equipmentService = {
  getAll: (params?: EquipmentTableParams): Promise<ApiResponse<PageResponse<EquipmentResponse>>> => {
    return apiClient.get('/equipment', { params });
  },

  getById: (id: number): Promise<ApiResponse<EquipmentResponse>> => {
    return apiClient.get(`/equipment/${id}`);
  },

  create: (data: EquipmentRequest): Promise<ApiResponse<EquipmentResponse>> => {
    return apiClient.post('/equipment', data);
  },

  update: (id: number, data: EquipmentRequest): Promise<ApiResponse<EquipmentResponse>> => {
    return apiClient.put(`/equipment/${id}`, data);
  },

  delete: (id: number): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/equipment/${id}`);
  },
};

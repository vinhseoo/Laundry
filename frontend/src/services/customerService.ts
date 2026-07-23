import { apiClient } from '@/config/apiClient';
import type { ApiResponse, PageResponse, TableParams } from '@/types';

export interface CustomerStatsResponse {
  id: number;
  name: string;
  phone: string;
  isActive: boolean;
  totalOrders: number;
  totalSpent: number;
}

export interface CustomerResponse {
  id: number;
  name: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerRequest {
  name: string;
  phone: string;
}

export const customerService = {
  getAll: (params?: TableParams): Promise<ApiResponse<PageResponse<CustomerStatsResponse>>> => {
    return apiClient.get('/customers', { params });
  },

  search: (query: string): Promise<ApiResponse<CustomerResponse[]>> => {
    return apiClient.get('/customers/search', { params: { query } });
  },

  getById: (id: number): Promise<ApiResponse<CustomerResponse>> => {
    return apiClient.get(`/customers/${id}`);
  },

  create: (data: CustomerRequest): Promise<ApiResponse<CustomerResponse>> => {
    return apiClient.post('/customers', data);
  },

  update: (id: number, data: CustomerRequest): Promise<ApiResponse<CustomerResponse>> => {
    return apiClient.put(`/customers/${id}`, data);
  },

  delete: (id: number): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/customers/${id}`);
  },

  getOrders: (id: number): Promise<ApiResponse<any[]>> => {
    return apiClient.get(`/customers/${id}/orders`);
  },
};

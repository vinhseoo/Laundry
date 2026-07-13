import { apiClient } from '@/config/apiClient';
import type { ApiResponse, SystemSettingResponse, SystemSettingRequest } from '@/types';

export const settingsService = {
  getAll: (): Promise<ApiResponse<SystemSettingResponse[]>> => {
    return apiClient.get('/settings');
  },

  getByGroup: (groupName: string): Promise<ApiResponse<SystemSettingResponse[]>> => {
    return apiClient.get(`/settings/group/${groupName}`);
  },

  updateSettings: (data: SystemSettingRequest[]): Promise<ApiResponse<void>> => {
    return apiClient.put('/settings', data);
  },
};

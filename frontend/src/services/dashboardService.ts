import { apiClient } from '@/config/apiClient';
import type { ApiResponse, DashboardStatsResponse, EquipmentReportResponse } from '@/types';

export const dashboardService = {
  getStats: (): Promise<ApiResponse<DashboardStatsResponse>> => {
    return apiClient.get('/dashboard/stats');
  },

  getEquipmentReport: (): Promise<ApiResponse<EquipmentReportResponse[]>> => {
    return apiClient.get('/dashboard/equipment-report');
  },
};

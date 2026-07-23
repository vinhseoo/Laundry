import { apiClient } from '@/config/apiClient';
import type { ApiResponse, PageResponse, TableParams } from '@/types';

export interface NotificationResponse {
  id: number;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  getMyNotifications: (params?: TableParams): Promise<ApiResponse<PageResponse<NotificationResponse>>> => {
    return apiClient.get('/notifications', { params });
  },

  getUnreadCount: (): Promise<ApiResponse<number>> => {
    return apiClient.get('/notifications/unread-count');
  },

  markAsRead: (id: number): Promise<ApiResponse<void>> => {
    return apiClient.put(`/notifications/${id}/read`);
  },

  markAllAsRead: (): Promise<ApiResponse<void>> => {
    return apiClient.put('/notifications/read-all');
  },
};

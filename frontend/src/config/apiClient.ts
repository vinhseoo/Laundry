import axios from 'axios';
import { message, modal } from '@/utils/antd';
import { useAuthStore } from '@/stores/authStore';

let isForbiddenModalOpen = false;
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — unwrap ApiResponse & handle errors
apiClient.interceptors.response.use(
  (response) => {
    // Unwrap: backend returns { success, message, data, ... }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi';

    // Prevent loop if the request URL is auth endpoints
    const isAuthRequest = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh');

    if (status === 401 && !originalRequest._retry && !isAuthRequest) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, { refreshToken });
          const apiResponse = res.data;

          if (apiResponse && apiResponse.success && apiResponse.data) {
            const { accessToken, refreshToken: newRefreshToken, user } = apiResponse.data;

            // Sync to Zustand Auth Store (which also updates localStorage)
            useAuthStore.getState().setAuth(accessToken, newRefreshToken, user);

            apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            processQueue(null, accessToken);
            isRefreshing = false;

            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;

          useAuthStore.getState().logout();
          if (window.location.pathname !== '/login') {
            message.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.');
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      }
    }

    switch (status) {
      case 401:
        if (!originalRequest._retry) {
          useAuthStore.getState().logout();
          if (window.location.pathname !== '/login') {
            message.error('Phiên đăng nhập đã hết hạn');
            window.location.href = '/login';
          }
        }
        break;
      case 403:
        if (!isForbiddenModalOpen) {
          isForbiddenModalOpen = true;
          modal.error({
            title: 'Truy cập bị từ chối',
            content: 'Bạn không có quyền thực hiện thao tác này. Vui lòng liên hệ quản trị viên để được cấp quyền.',
            okText: 'Đồng ý',
            onOk: () => {
              isForbiddenModalOpen = false;
            },
            onCancel: () => {
              isForbiddenModalOpen = false;
            }
          });
        }
        break;
      case 400:
      case 409:
      case 422:
        message.error(errorMessage);
        break;
      case 500:
        message.error('Lỗi hệ thống. Vui lòng thử lại sau.');
        break;
      default:
        if (!status) {
          message.error('Không thể kết nối đến server');
        }
    }

    return Promise.reject(error);
  }
);

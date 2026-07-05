import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Spin } from 'antd';
import { AppLayout } from './components/layout/AppLayout';

// Lazy-loaded pages
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage'));
const UsersPage = lazy(() => import('./features/auth/pages/UsersPage'));
const ProfilePage = lazy(() => import('./features/auth/pages/ProfilePage'));
const ServicesPage = lazy(() => import('./features/services/pages/ServicesPage'));
const EquipmentPage = lazy(() => import('./features/equipment/pages/EquipmentPage'));

const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen bg-slate-50">
    <Spin size="large" tip="Đang tải hệ thống..." />
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/equipment" element={<EquipmentPage />} />
          {/* Default redirect inside AppLayout */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

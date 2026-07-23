import { useState } from 'react';
import type { FC } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Badge, Card, message } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  ShopOutlined,
  DatabaseOutlined,
  SolutionOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  GlobalOutlined,
  SwapOutlined,
  SunOutlined,
  MoonOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useQuery, useMutation } from '@tanstack/react-query';
import { notificationService } from '@/services/notificationService';
import { useThemeStore } from '@/stores/themeStore';
import dayjs from 'dayjs';

const { Header, Sider, Content } = Layout;

export const AppLayout: FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPermission } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  // Notification Queries
  const { data: unreadData, refetch: refetchUnread } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const res = await notificationService.getUnreadCount();
      return res.data;
    },
    refetchInterval: 15000,
    enabled: !!user
  });

  const { data: listData, refetch: refetchList } = useQuery({
    queryKey: ['notifications', 'latest'],
    queryFn: async () => {
      const res = await notificationService.getMyNotifications({ size: 5 });
      return res.data.content;
    },
    enabled: !!user
  });

  const markAllMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      refetchUnread();
      refetchList();
      message.success('Đã đánh dấu tất cả là đã đọc');
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      refetchUnread();
      refetchList();
    }
  });

  const notifications = listData || [];
  const unreadCount = unreadData || 0;

  const notificationMenu = (
    <Card 
      className="shadow-2xl border border-slate-100 rounded-2xl w-80 md:w-96 overflow-hidden"
      bodyStyle={{ padding: 0 }}
    >
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
        <span className="font-bold text-slate-800">Thông báo mới</span>
        {unreadCount > 0 && (
          <Button 
            type="link" 
            size="small" 
            onClick={() => markAllMutation.mutate()} 
            className="text-indigo-600 font-bold p-0"
          >
            Đọc tất cả
          </Button>
        )}
      </div>
      <div className="max-h-[300px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-slate-400 italic text-xs">
            Không có thông báo nào
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id} 
              onClick={() => {
                if (!n.isRead) {
                  markAsReadMutation.mutate(n.id);
                }
              }}
              className={`p-3 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50/50 flex gap-3 items-start ${
                !n.isRead ? 'bg-indigo-50/30' : ''
              }`}
            >
              <div className="text-lg">
                {n.type === 'SLA_WARNING' ? '⚠️' : n.type === 'MACHINE_COMPLETED' ? '✅' : 'ℹ️'}
              </div>
              <div className="flex-1 space-y-1">
                <div className={`text-xs ${!n.isRead ? 'font-bold text-slate-800' : 'text-slate-600'}`}>
                  {n.title}
                </div>
                <div className="text-[11px] text-slate-500 leading-normal">
                  {n.content}
                </div>
                <div className="text-[10px] text-slate-400">
                  {dayjs(n.createdAt).format('DD/MM HH:mm')}
                </div>
              </div>
              {!n.isRead && (
                <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0" />
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    } else {
      navigate(key);
    }
  };

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'intake-group',
      icon: <ShopOutlined />,
      label: 'Tiếp nhận & Thiết bị',
      children: [
        { key: '/orders/new', label: 'Tiếp nhận đồ', icon: <SolutionOutlined /> },
        { key: '/equipment', label: 'Giám sát máy', icon: <GlobalOutlined /> },
      ],
    },
    {
      key: 'ops-group',
      icon: <SwapOutlined />,
      label: 'Vận hành & Kho',
      children: [
        { key: '/orders', label: 'Tiến trình đơn hàng', icon: <SolutionOutlined /> },
        { key: '/storage', label: 'Kho chờ & Giao nhận', icon: <GlobalOutlined /> },
        { key: '/customers', label: 'Khách hàng', icon: <UserOutlined /> },
      ],
    },
    {
      key: 'settings-group',
      icon: <SettingOutlined />,
      label: 'Danh mục & Thiết lập',
      children: [
        { key: '/services', label: 'Bảng giá dịch vụ', icon: <DatabaseOutlined /> },
        { key: '/users', label: 'Nhân viên & Quyền', icon: <UserOutlined /> },
        { key: '/settings', label: 'Cấu hình chung' },
      ],
    },
  ];

  // Helper to filter menu items recursively based on permissions
  const filterMenuByPermissions = (items: any[]): any[] => {
    return items
      .map(item => {
        if (item.children) {
          const filteredChildren = filterMenuByPermissions(item.children);
          if (filteredChildren.length === 0) return null;
          return { ...item, children: filteredChildren };
        }
        if (item.key === '/users') {
          return hasPermission('GET:/api/users') || hasPermission('GET:/api/roles') ? item : null;
        }
        if (item.key === '/services') {
          return hasPermission('GET:/api/services') ? item : null;
        }
        if (item.key === '/equipment') {
          return hasPermission('GET:/api/equipment') ? item : null;
        }
        if (item.key === '/customers') {
          return hasPermission('GET:/api/customers') ? item : null;
        }
        return item;
      })
      .filter(Boolean);
  };

  const filteredMenuItems = filterMenuByPermissions(menuItems);

  const userDropdownItems = [
    {
      key: '/profile',
      label: 'Thông tin cá nhân',
      icon: <UserOutlined />,
    },
    {
      key: '/settings',
      label: 'Cài đặt tài khoản',
      icon: <SettingOutlined />,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Sider trigger={null} collapsible collapsed={collapsed} className="shadow-xl border-r-0 bg-[#0f172a]">
        <div className="h-16 flex items-center justify-center border-b border-slate-800 bg-[#0f172a]">
          <span className="font-extrabold text-lg tracking-wider flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-[0_2px_8px_rgba(99,102,241,0.3)]">
            {collapsed ? '🧼' : '🧼 BubbleFlow'}
          </span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['intake-group', 'ops-group', 'settings-group']}
          items={filteredMenuItems}
          onClick={handleMenuClick}
          className="border-none py-4"
        />
      </Sider>
      <Layout>
        <Header className={`h-16 px-6 flex justify-between items-center border-b transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg w-10 h-10 flex items-center justify-center"
          />
          <div className="flex items-center gap-6">
            <Button
              type="text"
              icon={isDarkMode ? <SunOutlined className="text-amber-500 text-lg" /> : <MoonOutlined className="text-slate-600 text-lg" />}
              onClick={toggleDarkMode}
              className="w-10 h-10 flex items-center justify-center"
            />

            <Dropdown dropdownRender={() => notificationMenu} placement="bottomRight" trigger={['click']} arrow>
              <Badge count={unreadCount} size="small" className="cursor-pointer">
                <BellOutlined className="text-xl text-gray-600 hover:text-blue-600 transition-colors" />
              </Badge>
            </Dropdown>

            <Dropdown menu={{ items: userDropdownItems, onClick: handleMenuClick }} placement="bottomRight" arrow>
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar src={user?.avatarUrl} icon={<UserOutlined />} className="bg-blue-500" />
                <span className="font-medium text-gray-700 hidden sm:inline">{user?.fullName || 'Tài khoản'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="min-h-[calc(100vh-64px)]">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

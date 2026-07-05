import { useState } from 'react';
import type { FC } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Badge } from 'antd';
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
  SwapOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

const { Header, Sider, Content } = Layout;

export const AppLayout: FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPermission } = useAuthStore();

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
        <Header className="h-16 px-6 bg-white flex justify-between items-center border-b border-gray-200">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg w-10 h-10 flex items-center justify-center"
          />
          <div className="flex items-center gap-6">
            <Badge count={5} size="small" className="cursor-pointer">
              <BellOutlined className="text-xl text-gray-600 hover:text-blue-600 transition-colors" />
            </Badge>

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

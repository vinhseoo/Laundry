import { useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { LoginRequest } from '@/types';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

const { Title, Text } = Typography;

export const LoginPage = () => {
  const [form] = Form.useForm<LoginRequest>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleFinish = async (values: LoginRequest) => {
    setLoading(true);
    try {
      const response = await authService.login(values);
      if (response.success && response.data) {
        const { accessToken, refreshToken, user } = response.data;
        
        // Map user properties to store format
        setAuth(accessToken, refreshToken, {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          roles: user.roles,
          permissions: user.permissions
        });

        message.success('Đăng nhập thành công!');
        navigate('/dashboard');
      } else {
        message.error(response.message || 'Đăng nhập thất bại');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // Errors are already handled and toasted by apiClient interceptor, but we catch to reset loading
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0891b2 0%, #0f172a 100%)',
      }}
    >
      <Card
        style={{
          width: 420,
          borderRadius: 20,
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
          background: 'rgba(255, 255, 255, 0.98)',
        }}
        bordered={false}
      >
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          <div>
            <Title level={2} style={{ marginBottom: 4, color: '#0891b2' }}>
              🧼 BUBBLEFLOW
            </Title>
            <Text type="secondary">Hệ thống Quản lý Giặt là & Giặt sấy</Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            size="large"
            style={{ textAlign: 'left' }}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' },
              ]}
            >
              <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
            >
              <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="Mật khẩu" />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                loading={loading}
                style={{ 
                  height: 44, 
                  borderRadius: 10, 
                  background: 'linear-gradient(135deg, #0891b2 0%, #0369a1 100%)',
                  border: 'none'
                }}
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          <Text type="secondary" style={{ fontSize: 12 }}>
            Tài khoản mặc định: admin@laundry.local / Admin@123
          </Text>
        </Space>
      </Card>
    </div>
  );
};

export default LoginPage;

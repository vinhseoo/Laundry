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
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Dynamic Bubble Background */}
      <div className="bubble-bg">
        <div className="bubble-item" style={{ left: '10%', width: 80, height: 80, animationDelay: '0s', animationDuration: '14s' }} />
        <div className="bubble-item" style={{ left: '25%', width: 45, height: 45, animationDelay: '2s', animationDuration: '18s' }} />
        <div className="bubble-item" style={{ left: '40%', width: 90, height: 90, animationDelay: '5s', animationDuration: '16s' }} />
        <div className="bubble-item" style={{ left: '60%', width: 60, height: 60, animationDelay: '1s', animationDuration: '20s' }} />
        <div className="bubble-item" style={{ left: '75%', width: 100, height: 100, animationDelay: '7s', animationDuration: '15s' }} />
        <div className="bubble-item" style={{ left: '90%', width: 50, height: 50, animationDelay: '3s', animationDuration: '12s' }} />
      </div>

      <Card
        className="glassmorphism"
        style={{
          width: 420,
          borderRadius: 24,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
          zIndex: 1,
        }}
        bordered={false}
      >
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          <div>
            <Title level={2} style={{ marginBottom: 4, color: '#6366f1', letterSpacing: '1px', fontWeight: 800 }}>
              🧼 BUBBLEFLOW
            </Title>
            <Text style={{ color: '#64748b', fontWeight: 500 }}>Hệ thống Quản lý Giặt là & Giặt sấy</Text>
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
              <Input 
                prefix={<UserOutlined style={{ color: '#6366f1' }} />} 
                placeholder="Email" 
                style={{ borderRadius: 10, border: '1px solid #cbd5e1' }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: '#6366f1' }} />} 
                placeholder="Mật khẩu" 
                style={{ borderRadius: 10, border: '1px solid #cbd5e1' }}
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                loading={loading}
                style={{ 
                  height: 46, 
                  borderRadius: 10, 
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  border: 'none',
                  fontWeight: 600,
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
                }}
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          <Text style={{ fontSize: 12, color: '#94a3b8' }}>
            Tài khoản mặc định: <span className="font-semibold text-slate-600">admin@laundry.local</span> / <span className="font-semibold text-slate-600">Admin@123</span>
          </Text>
        </Space>
      </Card>
    </div>
  );
};

export default LoginPage;

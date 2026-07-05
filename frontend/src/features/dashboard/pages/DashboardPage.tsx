import type { FC } from 'react';
import { Typography, Row, Col, Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, InboxOutlined, SyncOutlined, AlertOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { PageContainer } from '@/components/layout/PageContainer';

const { Title } = Typography;

const DashboardPage: FC = () => {
  return (
    <PageContainer title="Dashboard Tổng quan">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="hover:shadow-md transition-shadow duration-300">
            <Statistic
              title="Doanh Thu Hôm Nay"
              value={1250000}
              precision={0}
              valueStyle={{ color: '#0891b2' }}
              prefix={<SafetyCertificateOutlined />}
              suffix="₫"
            />
            <div className="mt-2 text-xs text-gray-500">
              <span className="text-cyan-500 font-semibold"><ArrowUpOutlined /> 8%</span> so với hôm qua
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="hover:shadow-md transition-shadow duration-300">
            <Statistic
              title="Đơn Hàng Hôm Nay"
              value={24}
              valueStyle={{ color: '#1677ff' }}
              prefix={<InboxOutlined />}
            />
            <div className="mt-2 text-xs text-gray-500">
              18 Hoàn thành | 6 Đang xử lý
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="hover:shadow-md transition-shadow duration-300">
            <Statistic
              title="Máy Đang Hoạt Động"
              value={8}
              suffix="/ 12"
              valueStyle={{ color: '#faad14' }}
              prefix={<SyncOutlined spin />}
            />
            <div className="mt-2 text-xs text-gray-500">
              6 máy giặt | 2 máy sấy đang chạy
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="hover:shadow-md transition-shadow duration-300">
            <Statistic
              title="Đơn Hàng Trễ SLA"
              value={2}
              valueStyle={{ color: '#cf1322' }}
              prefix={<AlertOutlined />}
            />
            <div className="mt-2 text-xs text-gray-500">
              <span className="text-red-500 font-semibold"><ArrowDownOutlined /> 2 đơn hàng</span> chờ giặt quá 2 giờ
            </div>
          </Card>
        </Col>
      </Row>
 
      <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <Title level={4}>Hệ thống Quản lý Chuỗi Cửa Hàng Giặt Là / Giặt Sấy Tự Động (BubbleFlow)</Title>
        <p className="text-gray-600 mt-2">
          Chào mừng bạn đến với hệ thống quản trị BubbleFlow. Đây là giao diện điều khiển trung tâm giúp giám sát trạng thái cửa hàng, tiếp nhận đơn hàng giặt sấy của khách hàng, theo dõi hiệu suất máy móc thiết bị, kiểm soát thời gian xử lý dịch vụ SLA, quản lý lưu kho chờ và giao trả hàng.
        </p>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;

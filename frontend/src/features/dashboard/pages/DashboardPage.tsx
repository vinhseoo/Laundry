import { useState } from 'react';
import type { FC } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Tabs, 
  Table, 
  Tag, 
  Progress, 
  Badge 
} from 'antd';
import { 
  ArrowUpOutlined, 
  InboxOutlined, 
  SyncOutlined, 
  AlertOutlined, 
  SafetyCertificateOutlined,
  DashboardOutlined,
  ToolOutlined,
  CompassOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';
import { PageContainer } from '@/components/layout/PageContainer';
import type { EquipmentReportResponse } from '@/types';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import dayjs from 'dayjs';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#10b981', '#f59e0b'];

export const DashboardPage: FC = () => {
  const [activeTab, setActiveTab] = useState('business');

  // Queries
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const response = await dashboardService.getStats();
      return response.data;
    },
    refetchInterval: 10000 // Refetch every 10 seconds for real-time Redis stats!
  });

  const { data: reportData, isLoading: isReportLoading } = useQuery({
    queryKey: ['dashboard', 'equipment-report'],
    queryFn: async () => {
      const response = await dashboardService.getEquipmentReport();
      return response.data;
    }
  });

  // Table Columns for Equipment Report
  const equipmentColumns = [
    {
      title: 'Mã máy',
      dataIndex: 'code',
      key: 'code',
      width: 110,
      render: (code: string) => <span className="font-bold text-slate-700">{code}</span>
    },
    {
      title: 'Tên máy',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (name: string, record: EquipmentReportResponse) => (
        <div>
          <span className="font-medium text-slate-700">{name}</span>
          <div className="text-[10px] text-slate-400">
            Loại: {record.type === 'WASHING_MACHINE' ? '🧼 MÁY GIẶT' : '💨 MÁY SẤY'}
          </div>
        </div>
      )
    },
    {
      title: 'Số chu kỳ chạy',
      dataIndex: 'totalCycles',
      key: 'totalCycles',
      width: 130,
      align: 'center' as const,
      render: (cycles: number) => <Badge count={cycles} color="#6366f1" showZero />
    },
    {
      title: 'Số giờ chạy (h)',
      dataIndex: 'totalRuntimeHours',
      key: 'totalRuntimeHours',
      width: 130,
      align: 'right' as const,
      render: (hours: number) => <span className="font-bold text-slate-700">{hours.toFixed(2)} h</span>
    },
    {
      title: 'Độ hao mòn (Khấu hao)',
      dataIndex: 'depreciationPercent',
      key: 'depreciationPercent',
      width: 180,
      render: (percent: number) => (
        <div className="flex items-center gap-2">
          <Progress 
            percent={percent} 
            size="small" 
            status={percent > 75 ? 'exception' : percent > 50 ? 'active' : 'normal'}
            strokeColor={percent > 75 ? '#ef4444' : percent > 50 ? '#f59e0b' : '#10b981'}
          />
        </div>
      )
    },
    {
      title: 'Độ mòn',
      dataIndex: 'wearRate',
      key: 'wearRate',
      width: 110,
      render: (rate: string) => {
        const colorMap: Record<string, string> = {
          LOW: 'green',
          MEDIUM: 'blue',
          HIGH: 'orange',
          CRITICAL: 'red'
        };
        return <Tag color={colorMap[rate] || 'default'} className="font-bold">{rate}</Tag>;
      }
    },
    {
      title: 'Bảo trì định kỳ',
      dataIndex: 'hoursToNextMaintenance',
      key: 'hoursToNextMaintenance',
      width: 160,
      render: (hours: number, record: EquipmentReportResponse) => {
        const statusColors: Record<string, string> = {
          OK: 'success',
          DUE_SOON: 'warning',
          OVERDUE: 'error'
        };
        return (
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-600">Còn {hours} giờ chạy</span>
            <Badge status={statusColors[record.maintenanceStatus] as any} text={record.maintenanceStatus} className="text-[10px] uppercase font-bold mt-1" />
          </div>
        );
      }
    }
  ];

  // Formatting helper for currency
  const formatCurrency = (val: number) => {
    return `${val?.toLocaleString('vi-VN')} ₫`;
  };

  return (
    <PageContainer title="Dashboard & Báo Cáo Phân Tích">
      {/* Top summary row */}
      {isStatsLoading ? (
        <div className="text-center py-6 text-slate-500">Đang tải chỉ số tổng quan...</div>
      ) : (
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="hover:shadow-md transition-shadow duration-300 rounded-xl border border-slate-100/50">
              <Statistic
                title="Doanh Thu Hôm Nay (Redis real-time)"
                value={statsData?.todayRevenue || 0}
                precision={0}
                valueStyle={{ color: '#6366f1', fontWeight: 800 }}
                prefix={<SafetyCertificateOutlined className="mr-1" />}
                formatter={(v) => formatCurrency(Number(v))}
              />
              <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                <span className="text-indigo-500 font-semibold"><ArrowUpOutlined /> Real-time</span> cập nhật ngay khi tạo đơn
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="hover:shadow-md transition-shadow duration-300 rounded-xl border border-slate-100/50">
              <Statistic
                title="Đơn Hàng Hôm Nay (Redis real-time)"
                value={statsData?.todayOrders || 0}
                valueStyle={{ color: '#a855f7', fontWeight: 800 }}
                prefix={<InboxOutlined className="mr-1" />}
              />
              <div className="mt-2 text-xs text-slate-400">
                Đếm lưu lượng đơn tiếp nhận trong ngày
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="hover:shadow-md transition-shadow duration-300 rounded-xl border border-slate-100/50">
              <Statistic
                title="Máy Đang Hoạt Động"
                value={statsData?.activeMachines || 0}
                valueStyle={{ color: '#10b981', fontWeight: 800 }}
                prefix={<SyncOutlined spin={Number(statsData?.activeMachines) > 0} className="mr-1" />}
              />
              <div className="mt-2 text-xs text-slate-400">
                Thiết bị đang chạy chu trình giặt/sấy
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="hover:shadow-md transition-shadow duration-300 rounded-xl border border-slate-100/50">
              <Statistic
                title="Đơn Hàng Trễ SLA"
                value={statsData?.slaWarnings || 0}
                valueStyle={{ color: '#ef4444', fontWeight: 800 }}
                prefix={<AlertOutlined className="mr-1 text-red-500 animate-pulse" />}
              />
              <div className="mt-2 text-xs text-slate-400">
                Đơn hàng vượt giới hạn thời gian trạng thái
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Tabs segment */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        className="premium-tabs"
        items={[
          {
            key: 'business',
            label: (
              <span className="flex items-center gap-2 px-2 py-1 font-medium">
                <DashboardOutlined /> Doanh Thu & Hiệu Suất
              </span>
            ),
            children: (
              <div className="space-y-6">
                <Row gutter={[16, 16]}>
                  {/* Revenue Trend Chart */}
                  <Col xs={24} lg={16}>
                    <Card title="Biểu đồ Doanh thu 7 ngày qua" className="rounded-xl border border-slate-100 shadow-xs">
                      <div className="h-[320px] w-full">
                        {statsData && statsData.weeklyRevenue && (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={statsData.weeklyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis 
                                dataKey="date" 
                                stroke="#94a3b8" 
                                fontSize={11} 
                                tickLine={false}
                                tickFormatter={(tick) => dayjs(tick).format('DD/MM')}
                              />
                              <YAxis 
                                stroke="#94a3b8" 
                                fontSize={11} 
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => `${val / 1000}k`}
                              />
                              <ChartTooltip 
                                formatter={(value) => [formatCurrency(Number(value)), 'Doanh thu']}
                                labelFormatter={(label) => dayjs(label).format('DD/MM/YYYY')}
                                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="#6366f1" 
                                strokeWidth={3} 
                                dot={{ stroke: '#6366f1', strokeWidth: 2, r: 4, fill: '#fff' }}
                                activeDot={{ r: 6, fill: '#6366f1' }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </Card>
                  </Col>

                  {/* Service pricing Share Pie Chart */}
                  <Col xs={24} lg={8}>
                    <Card title="Tỷ trọng theo gói Dịch vụ" className="rounded-xl border border-slate-100 shadow-xs">
                      <div className="h-[320px] w-full flex flex-col justify-between">
                        <div className="h-[230px] w-full">
                          {statsData && statsData.serviceRevenueShare && statsData.serviceRevenueShare.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={statsData.serviceRevenueShare}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={4}
                                  dataKey="revenue"
                                  nameKey="serviceName"
                                >
                                  {statsData.serviceRevenueShare.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <ChartTooltip 
                                  formatter={(value) => formatCurrency(Number(value))}
                                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">
                              Chưa có dữ liệu giao dịch
                            </div>
                          )}
                        </div>
                        {/* Custom Legend */}
                        <div className="flex flex-wrap gap-2 justify-center text-[10px] text-slate-500 overflow-y-auto max-h-[80px]">
                          {statsData?.serviceRevenueShare?.map((item, index) => (
                            <span key={item.serviceName} className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                              {item.serviceName} ({Math.round((item.revenue / statsData.serviceRevenueShare.reduce((a,b)=>a+b.revenue, 0)) * 100)}%)
                            </span>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </div>
            )
          },
          {
            key: 'equipment',
            label: (
              <span className="flex items-center gap-2 px-2 py-1 font-medium">
                <ToolOutlined /> Giám Sát & Khấu Hao Thiết Bị
              </span>
            ),
            children: (
              <div className="space-y-6">
                <Row gutter={[16, 16]}>
                  {/* Load Metrics bar chart */}
                  <Col xs={24} lg={16}>
                    <Card title="Thống kê Tần suất hoạt động máy móc (Số chu kỳ chạy)" className="rounded-xl border border-slate-100 shadow-xs">
                      <div className="h-[280px] w-full">
                        {reportData && (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reportData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="code" stroke="#94a3b8" fontSize={11} tickLine={false} />
                              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                              <ChartTooltip 
                                formatter={(value) => [value, 'Chu kỳ chạy']}
                                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                              />
                              <Bar dataKey="totalCycles" fill="#a855f7" radius={[4, 4, 0, 0]} maxBarSize={45}>
                                {reportData.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </Card>
                  </Col>

                  {/* Device Status Pie Chart */}
                  <Col xs={24} lg={8}>
                    <Card title="Phân bố Trạng thái Thiết bị" className="rounded-xl border border-slate-100 shadow-xs">
                      <div className="h-[280px] w-full flex flex-col justify-between">
                        <div className="h-[200px] w-full">
                          {statsData && statsData.machineStatusDistribution ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={statsData.machineStatusDistribution}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={70}
                                  dataKey="count"
                                  nameKey="status"
                                >
                                  {statsData.machineStatusDistribution.map((item, index) => {
                                    const statusColors: Record<string, string> = {
                                      IDLE: '#10b981',      // Green
                                      RUNNING: '#6366f1',   // Indigo
                                      MAINTENANCE: '#f59e0b',// Amber
                                      OUT_OF_SERVICE: '#ef4444' // Red
                                    };
                                    return <Cell key={`cell-${index}`} fill={statusColors[item.status] || COLORS[index % COLORS.length]} />;
                                  })}
                                </Pie>
                                <ChartTooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} />
                              </PieChart>
                            </ResponsiveContainer>
                          ) : null}
                        </div>
                        {/* Custom Legend */}
                        <div className="flex gap-4 justify-center text-[10px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#10b981]"></span> Rảnh (IDLE)
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#6366f1]"></span> Đang chạy (RUNNING)
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#f59e0b]"></span> Bảo trì (MAINT)
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#ef4444]"></span> Hỏng (OUT_OF_SER)
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Col>
                </Row>

                {/* Analytical wear table */}
                <Card title="Chi tiết Chỉ số hao mòn & Dự đoán bảo trì" className="rounded-xl border border-slate-100 shadow-xs overflow-hidden">
                  <Table
                    rowKey="id"
                    columns={equipmentColumns}
                    dataSource={reportData || []}
                    loading={isReportLoading}
                    pagination={false}
                    className="premium-table"
                  />
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-100 text-slate-600 rounded-lg text-xs flex items-start gap-2">
                    <CompassOutlined className="text-blue-500 mt-0.5" />
                    <div>
                      <span className="font-bold text-blue-800">Thuật toán Dự đoán Bảo trì:</span> Khấu hao hao mòn máy được tính toán dựa trên cumulative runtime hours (Số giờ chạy tích lũy) so với vòng đời tiêu chuẩn là 2,000 giờ. Thiết bị tự động yêu cầu bảo trì định kỳ sau mỗi 100 giờ chạy máy. Khi còn ít hơn 10 giờ chạy sẽ hiển thị trạng thái cảnh báo <span className="font-bold text-orange-600">DUE_SOON</span> để kỹ thuật viên chủ động xử lý trước khi gặp sự cố.
                    </div>
                  </div>
                </Card>
              </div>
            )
          }
        ]}
      />
    </PageContainer>
  );
};

export default DashboardPage;

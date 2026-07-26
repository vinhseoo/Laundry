import { useState } from 'react';
import { 
  Table, 
  Tag, 
  Button, 
  Space, 
  Card, 
  Modal, 
  Select, 
  message, 
  Row, 
  Col, 
  Input, 
  Tooltip,
  Badge,
  Tabs,
  Progress,
  Steps,
  Alert
} from 'antd';
import type { TableColumnsType } from 'antd';
import { 
  SearchOutlined,
  SolutionOutlined,
  CompassOutlined,
  GlobalOutlined,
  ArrowRightOutlined,
  SyncOutlined,
  InboxOutlined,
  PoweroffOutlined
} from '@ant-design/icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { orderService } from '@/services/orderService';
import { basketService } from '@/services/basketService';
import { equipmentService } from '@/services/equipmentService';
import { useAuthStore } from '@/stores/authStore';
import { PageContainer } from '@/components/layout/PageContainer';
import type { OrderResponse, LaundryBasketResponse, EquipmentResponse } from '@/types';
import dayjs from 'dayjs';

const OrderTimelineSteps = ({ record }: { record: OrderResponse }) => {
  const steps = [
    { title: 'Tiếp nhận', description: record.status === 'RECEIVED' ? record.currentDuration : '' },
    { title: 'Phân loại', description: record.status === 'SORTING' ? record.currentDuration : '' },
    { title: 'Đang giặt', description: record.status === 'WASHING' ? record.currentDuration : '' },
    { title: 'Đang sấy', description: record.status === 'DRYING' ? record.currentDuration : '' },
    { title: 'Chờ trả đồ', description: record.status === 'AWAITING_DELIVERY' ? record.currentDuration : '' },
    { title: 'Hoàn thành', description: record.status === 'COMPLETED' ? record.currentDuration : '' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'RECEIVED': return 0;
      case 'SORTING': return 1;
      case 'WASHING': return 2;
      case 'DRYING': return 3;
      case 'AWAITING_DELIVERY': return 4;
      case 'COMPLETED': return 5;
      default: return 0;
    }
  };

  return (
    <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl">
      <div className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Tiến trình chi tiết:</div>
      <Steps
        current={getStepIndex(record.status)}
        size="small"
        items={steps}
      />
      {record.notes && (
        <div className="mt-3 text-xs text-slate-600 dark:text-slate-350 bg-white dark:bg-slate-900 p-2 border border-slate-100 dark:border-slate-800 rounded-md">
          <span className="font-bold text-slate-700 dark:text-slate-200">Ghi chú đơn hàng:</span> {record.notes}
        </div>
      )}
    </div>
  );
};

export const OrderListPage = () => {
  const { hasPermission } = useAuthStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(0);

  // States for Modals
  const [isAssignBasketOpen, setIsAssignBasketOpen] = useState(false);
  const [selectedOrderForBasket, setSelectedOrderForBasket] = useState<OrderResponse | null>(null);
  const [selectedBasketId, setSelectedBasketId] = useState<number | null>(null);

  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [selectedBasketForDispatch, setSelectedBasketForDispatch] = useState<LaundryBasketResponse | null>(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(null);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter(undefined);
    setPage(0);
  };

  // Data Queries
  const { data: ordersData, isLoading: isOrdersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['orders', search, statusFilter, page],
    queryFn: async () => {
      const response = await orderService.getAll({ page, search, status: statusFilter });
      return response.data;
    }
  });

  const { data: basketsData, isLoading: isBasketsLoading, refetch: refetchBaskets } = useQuery({
    queryKey: ['baskets', 'all'],
    queryFn: async () => {
      const response = await basketService.getAll({ size: 100 });
      return response.data.content;
    }
  });

  const { data: equipmentData, isLoading: isEquipmentLoading, refetch: refetchEquipment } = useQuery({
    queryKey: ['equipment', 'all'],
    queryFn: async () => {
      const response = await equipmentService.getAll({ size: 100 });
      return response.data.content;
    }
  });

  // SLA Warnings Query
  const { data: slaWarnings } = useQuery({
    queryKey: ['orders', 'sla-warnings'],
    queryFn: async () => {
      const response = await orderService.getSlaWarnings();
      return response.data;
    },
    refetchInterval: 30000
  });

  const orders: OrderResponse[] = ordersData?.content || [];
  const baskets: LaundryBasketResponse[] = basketsData || [];
  const equipments: EquipmentResponse[] = equipmentData || [];

  // Mutations
  const assignBasketMutation = useMutation({
    mutationFn: ({ basketId, orderId }: { basketId: number; orderId: number | null }) => 
      basketService.assignToOrder(basketId, orderId),
    onSuccess: () => {
      message.success('Gán giỏ đồ thành công!');
      setIsAssignBasketOpen(false);
      setSelectedOrderForBasket(null);
      setSelectedBasketId(null);
      refetchOrders();
      refetchBaskets();
    }
  });

  const dispatchMutation = useMutation({
    mutationFn: ({ basketId, equipmentId }: { basketId: number; equipmentId: number }) => 
      basketService.assignToEquipment(basketId, equipmentId),
    onSuccess: () => {
      message.success('Điều phối giỏ đồ chạy máy thành công!');
      setIsDispatchOpen(false);
      setSelectedBasketForDispatch(null);
      setSelectedEquipmentId(null);
      refetchOrders();
      refetchBaskets();
      refetchEquipment();
    }
  });

  const releaseMutation = useMutation({
    mutationFn: (basketId: number) => basketService.releaseFromEquipment(basketId),
    onSuccess: () => {
      message.success('Đã giải phóng máy giặt/sấy thành công!');
      refetchOrders();
      refetchBaskets();
      refetchEquipment();
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) => 
      orderService.updateStatus(orderId, status),
    onSuccess: () => {
      message.success('Cập nhật tiến trình đơn hàng thành công!');
      refetchOrders();
    }
  });

  // Helpers
  const getOrderStatusTag = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return <Tag color="default" style={{ borderRadius: 6, fontWeight: 600 }}>1. TIẾP NHẬN</Tag>;
      case 'SORTING':
        return <Tag color="cyan" style={{ borderRadius: 6, fontWeight: 600 }}>2. PHÂN LOẠI</Tag>;
      case 'WASHING':
        return <Tag color="blue" style={{ borderRadius: 6, fontWeight: 600 }} icon={<SyncOutlined spin />}>3. ĐANG GIẶT</Tag>;
      case 'DRYING':
        return <Tag color="orange" style={{ borderRadius: 6, fontWeight: 600 }} icon={<SyncOutlined spin />}>4. ĐANG SẤY</Tag>;
      case 'AWAITING_DELIVERY':
        return <Tag color="purple" style={{ borderRadius: 6, fontWeight: 600 }}>5. CHỜ TRẢ ĐỒ</Tag>;
      case 'COMPLETED':
        return <Tag color="success" style={{ borderRadius: 6, fontWeight: 600 }}>6. HOÀN THÀNH</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const getMachineStatusBadge = (status: string) => {
    switch (status) {
      case 'IDLE':
        return <Badge status="success" text="Sẵn sàng (Rảnh)" />;
      case 'RUNNING':
        return <Badge status="processing" text="Đang chạy" />;
      case 'MAINTENANCE':
        return <Badge status="warning" text="Bảo trì" />;
      case 'OUT_OF_SERVICE':
      default:
        return <Badge status="error" text="Hỏng / Khóa" />;
    }
  };

  // Table Columns
  const columns: TableColumnsType<OrderResponse> = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderCode',
      key: 'orderCode',
      render: (code: string, record) => (
        <Space size={4}>
          <span className="font-bold text-indigo-600 font-mono">{code}</span>
          {record.slaViolated && (
            <Tooltip title="Vi phạm SLA thời hạn xử lý!">
              <span className="text-rose-500 animate-pulse text-base">🚨</span>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Thời hạn SLA',
      key: 'sla',
      render: (_, record) => {
        if (record.status === 'COMPLETED') {
          return <Tag color="success" style={{ borderRadius: 6 }}>Đã hoàn thành</Tag>;
        }
        if (record.slaRemainingMinutes === undefined || record.slaRemainingMinutes === null) {
          return <span className="text-slate-400 font-medium">-</span>;
        }
        if (record.slaViolated) {
          return (
            <Tag color="error" style={{ borderRadius: 6, fontStyle: 'normal', fontWeight: 700 }} className="animate-pulse m-0">
              Trễ {Math.abs(record.slaRemainingMinutes)} phút
            </Tag>
          );
        }
        return (
          <Tag color="warning" style={{ borderRadius: 6, fontWeight: 600 }} className="m-0">
            Còn {record.slaRemainingMinutes} phút
          </Tag>
        );
      }
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div className="font-semibold text-slate-800 dark:text-slate-200">{record.customerName}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{record.customerPhone}</div>
        </div>
      ),
    },
    {
      title: 'Chi tiết dịch vụ',
      key: 'items',
      render: (_, record) => (
        <div className="space-y-1">
          {record.items.map(item => (
            <div key={item.id} className="text-xs text-slate-700 font-medium">
              • {item.serviceName} <span className="text-slate-400">x</span> <span className="text-indigo-600 font-semibold">{item.quantity}</span> {item.serviceCode.includes('GIAT_KHO') || item.serviceCode.includes('GIAY') ? 'Chiếc' : 'KG'}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => (
        <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
        </span>
      ),
    },
    {
      title: 'Giỏ đồ gán',
      key: 'basket',
      render: (_, record) => {
        const assignedBaskets = baskets.filter(b => b.orderId === record.id);
        
        if (assignedBaskets.length > 0) {
          return (
            <Space direction="vertical" size={2}>
              {assignedBaskets.map(b => {
                const canDispatch = ['RECEIVED', 'SORTING', 'WASHING', 'DRYING'].includes(record.status);
                const canUnassign = !['AWAITING_DELIVERY', 'COMPLETED'].includes(record.status);
                
                return (
                  <div key={b.id} className="flex items-center gap-1.5">
                    <Tag color="geekblue" style={{ borderRadius: 4, fontWeight: 600 }}>🧺 {b.basketCode}</Tag>
                    {b.equipmentId ? (
                      <Tag color="purple" style={{ borderRadius: 4, fontSize: '10px' }}>💻 {b.equipmentCode}</Tag>
                    ) : (
                      canDispatch && hasPermission('PUT:/api/baskets/{id}/assign-equipment/{equipmentId}') && (
                        <Tooltip title="Điều phối vào máy giặt/sấy">
                          <Button 
                            type="text" 
                            size="small"
                            icon={<ArrowRightOutlined className="text-indigo-500" />} 
                            onClick={() => {
                              setSelectedBasketForDispatch(b);
                              setIsDispatchOpen(true);
                            }}
                          />
                        </Tooltip>
                      )
                    )}
                    {canUnassign && (
                      <Button 
                        type="text" 
                        danger 
                        size="small" 
                        className="text-slate-400 hover:text-red-500 font-bold"
                        onClick={() => assignBasketMutation.mutate({ basketId: b.id, orderId: null })}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                );
              })}
            </Space>
          );
        }

        const canAssignBasket = !['AWAITING_DELIVERY', 'COMPLETED'].includes(record.status);

        return (
          canAssignBasket && hasPermission('PUT:/api/baskets/{id}/assign-order') ? (
            <Button 
              type="dashed" 
              size="small" 
              icon={<InboxOutlined />} 
              onClick={() => {
                setSelectedOrderForBasket(record);
                setIsAssignBasketOpen(true);
              }}
              style={{ borderRadius: 6, fontSize: '12px' }}
            >
              Gán giỏ
            </Button>
          ) : <span className="text-slate-400 italic">Chưa gán</span>
        );
      },
    },
    {
      title: 'Tiến trình',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record) => {
        const canUpdate = hasPermission('PUT:/api/orders/{id}/status');
        if (canUpdate) {
          return (
            <Select 
              value={status}
              size="small"
              bordered={false}
              className="font-bold border border-slate-100 rounded-md bg-slate-50 text-xs"
              style={{ width: 140 }}
              onChange={(val) => updateStatusMutation.mutate({ orderId: record.id, status: val })}
            >
              <Select.Option value="RECEIVED">TIẾP NHẬN</Select.Option>
              <Select.Option value="SORTING">PHÂN LOẠI</Select.Option>
              <Select.Option value="WASHING">ĐANG GIẶT</Select.Option>
              <Select.Option value="DRYING">ĐANG SẤY</Select.Option>
              <Select.Option value="AWAITING_DELIVERY">CHỜ TRẢ ĐỒ</Select.Option>
              <Select.Option value="COMPLETED">HOÀN THÀNH</Select.Option>
            </Select>
          );
        }
        return getOrderStatusTag(status);
      },
    },
    {
      title: 'Ngày tiếp nhận',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
  ];

  return (
    <PageContainer title="Vận Hành & Điều Phối Đơn Hàng">
      <Tabs 
        defaultActiveKey="orders-list"
        items={[
          {
            key: 'orders-list',
            label: <span className="text-base px-2 font-medium"><SolutionOutlined /> Quản lý Đơn hàng</span>,
            children: (
              <div className="space-y-4 mt-2">
                {/* SLA Warnings Alert Banner */}
                {slaWarnings && slaWarnings.length > 0 && (
                  <Alert
                    message={
                      <div className="flex items-center text-rose-800 text-xs md:text-sm font-semibold">
                        <span>🚨 CẢNH BÁO SLA: Đang có {slaWarnings.length} đơn hàng vi phạm thời hạn xử lý tối đa! Vui lòng kiểm tra và xử lý gấp.</span>
                      </div>
                    }
                    type="error"
                    showIcon
                    className="border-rose-100 bg-rose-50/70 rounded-xl shadow-xs"
                  />
                )}

                {/* Search Bar */}
                <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs transition-colors">
                  <Input
                    placeholder="Tìm theo mã đơn, khách hàng, số điện thoại..."
                    prefix={<SearchOutlined className="text-gray-400" />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: 320, borderRadius: 8 }}
                    allowClear
                  />
                  <Select
                    placeholder="Lọc trạng thái..."
                    allowClear
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: 180 }}
                  >
                    <Select.Option value="RECEIVED">1. Tiếp nhận</Select.Option>
                    <Select.Option value="SORTING">2. Phân loại</Select.Option>
                    <Select.Option value="WASHING">3. Đang giặt</Select.Option>
                    <Select.Option value="DRYING">4. Đang sấy</Select.Option>
                    <Select.Option value="AWAITING_DELIVERY">5. Chờ trả đồ</Select.Option>
                    <Select.Option value="COMPLETED">6. Hoàn thành</Select.Option>
                  </Select>
                  <Button 
                    type="default" 
                    icon={<SyncOutlined />} 
                    onClick={() => { refetchOrders(); refetchBaskets(); refetchEquipment(); }} 
                    style={{ borderRadius: 8 }}
                  />
                  <Button
                    type="default"
                    onClick={handleResetFilters}
                    style={{ borderRadius: 8 }}
                  >
                    Đặt lại bộ lọc
                  </Button>
                </div>

                <Table 
                  columns={columns} 
                  dataSource={orders} 
                  rowKey="id"
                  loading={isOrdersLoading}
                  pagination={{
                    total: ordersData?.totalElements || 0,
                    pageSize: ordersData?.size || 20,
                    current: (ordersData?.page || 0) + 1,
                    onChange: (p) => setPage(p - 1),
                  }}
                  expandable={{
                    expandedRowRender: (record) => <OrderTimelineSteps record={record} />,
                    rowExpandable: () => true,
                  }}
                  className="shadow-xs rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors"
                />
              </div>
            )
          },
          {
            key: 'dispatch-center',
            label: <span className="text-base px-2 font-medium"><CompassOutlined /> Trung tâm Điều phối Máy</span>,
            children: (
              <div className="space-y-6 mt-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs transition-colors">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-2">⚡ Sơ đồ máy giặt & máy sấy đang vận hành</h3>
                  <p className="text-sm text-slate-400 dark:text-slate-500">Giám sát và kết thúc quá trình giặt/sấy của từng giỏ đồ trong thiết bị.</p>
                </div>

                {isEquipmentLoading || isBasketsLoading ? (
                  <div className="text-center py-12 text-slate-400">Đang tải thông tin thiết bị điều phối...</div>
                ) : (
                  <Row gutter={[20, 20]}>
                    {equipments.filter(e => e.isActive).map((eq) => {
                      // Find if any baskets are loaded into this machine
                      const loadedBaskets = baskets.filter(b => b.equipmentId === eq.id);
                      const isRunning = eq.status === 'RUNNING';
                      const currentWeight = loadedBaskets.reduce((sum, b) => sum + (b.orderWeight || 0), 0);
                      const capacity = eq.capacity || 10;
                      const weightPercent = Math.min(Math.round((currentWeight / capacity) * 100), 100);

                      return (
                        <Col xs={24} sm={12} md={8} lg={6} key={eq.id}>
                          <Card
                            className={`border transition-all duration-300 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden ${
                              isRunning 
                                ? 'shadow-[0_0_15px_rgba(99,102,241,0.15)] border-indigo-200 dark:border-indigo-800/40 bg-indigo-50/10 dark:bg-indigo-950/10' 
                                : 'border-slate-100 dark:border-slate-800 shadow-xs'
                            }`}
                            bodyStyle={{ padding: '20px' }}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="text-xs font-bold text-slate-400 tracking-wider block uppercase">
                                  {eq.type === 'WASHING_MACHINE' ? '🧼 MÁY GIẶT' : '💨 MÁY SẤY'}
                                </span>
                                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1">{eq.name}</h4>
                                <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400">{eq.code}</span>
                              </div>
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${isRunning ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                {eq.type === 'WASHING_MACHINE' ? '🧼' : '💨'}
                              </span>
                            </div>

                            <div className="py-3 border-t border-slate-100 dark:border-slate-800 my-3">
                              {isRunning && loadedBaskets.length > 0 ? (
                                <div className="space-y-3">
                                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                                    {loadedBaskets.map((b) => (
                                      <div key={b.id} className="flex justify-between items-center text-xs bg-slate-50 dark:bg-slate-950/40 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                        <div>
                                          <Tag color="geekblue" className="m-0 font-bold text-[10px]">🧺 {b.basketCode}</Tag>
                                          <span className="font-semibold text-slate-500 dark:text-slate-400 ml-1.5 font-mono text-[10px]">{b.orderCode}</span>
                                        </div>
                                        <span className="font-bold text-slate-600 dark:text-slate-350 text-[10px]">{b.orderWeight || 0} kg</span>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="pt-1 text-xs">
                                    <div className="flex justify-between mb-1">
                                      <span className="text-slate-400 font-semibold">Tải trọng:</span>
                                      <span className="font-bold text-indigo-600 font-mono">{currentWeight} / {capacity} kg</span>
                                    </div>
                                    <Progress percent={weightPercent} status="active" strokeColor={{ '0%': '#6366f1', '100%': '#a855f7' }} showInfo={false} size="small" className="m-0" />
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs text-slate-400 italic py-2">
                                  {eq.status === 'IDLE' ? 'Trống — Sẵn sàng tải giỏ đồ mới' : 'Tạm khóa / Đang bảo trì'}
                                </div>
                              )}
                            </div>

                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                              <span className="text-xs">{getMachineStatusBadge(eq.status)}</span>
                              
                              {isRunning && loadedBaskets.length > 0 && hasPermission('PUT:/api/baskets/{id}/release') && (
                                <Button
                                  type="primary"
                                  danger
                                  size="small"
                                  icon={<PoweroffOutlined />}
                                  onClick={() => releaseMutation.mutate(loadedBaskets[0].id)}
                                  style={{ borderRadius: 6, fontSize: '11px' }}
                                >
                                  Hoàn thành
                                </Button>
                              )}
                            </div>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                )}
              </div>
            )
          }
        ]}
      />

      {/* Modal: Assign Basket to Order */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <InboxOutlined className="text-indigo-500 text-xl" />
            <span className="font-bold text-slate-800">Gán Giỏ Đồ Cho Đơn Hàng</span>
          </div>
        }
        open={isAssignBasketOpen}
        onCancel={() => {
          setIsAssignBasketOpen(false);
          setSelectedOrderForBasket(null);
          setSelectedBasketId(null);
        }}
        onOk={() => {
          if (selectedBasketId && selectedOrderForBasket) {
            assignBasketMutation.mutate({ basketId: selectedBasketId, orderId: selectedOrderForBasket.id });
          } else {
            message.warning('Vui lòng chọn giỏ đồ');
          }
        }}
        okText="Gán giỏ đồ"
        cancelText="Hủy"
        confirmLoading={assignBasketMutation.isPending}
      >
        {selectedOrderForBasket && (
          <div className="mt-4 space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1">
              <div className="text-xs text-slate-500">Thông tin đơn hàng tiếp nhận:</div>
              <div className="font-bold text-slate-800">{selectedOrderForBasket.customerName} ({selectedOrderForBasket.customerPhone})</div>
              <div className="font-mono text-xs text-indigo-600 font-bold">{selectedOrderForBasket.orderCode}</div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">Chọn giỏ đồ vật lý trống:</label>
              <Select
                placeholder="Chọn mã giỏ đồ..."
                style={{ width: '100%', borderRadius: 8 }}
                value={selectedBasketId || undefined}
                onChange={setSelectedBasketId}
              >
                {baskets
                  .filter(b => b.isActive && b.status === 'IDLE')
                  .map(b => (
                    <Select.Option key={b.id} value={b.id}>
                      🧺 {b.basketCode} {b.name ? `- ${b.name}` : ''}
                    </Select.Option>
                  ))}
              </Select>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Dispatch Basket to Machine */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <GlobalOutlined className="text-indigo-500 text-xl" />
            <span className="font-bold text-slate-800">Điều Phối Chạy Máy Giặt / Sấy</span>
          </div>
        }
        open={isDispatchOpen}
        onCancel={() => {
          setIsDispatchOpen(false);
          setSelectedBasketForDispatch(null);
          setSelectedEquipmentId(null);
        }}
        onOk={() => {
          if (selectedEquipmentId && selectedBasketForDispatch) {
            dispatchMutation.mutate({ basketId: selectedBasketForDispatch.id, equipmentId: selectedEquipmentId });
          } else {
            message.warning('Vui lòng chọn máy');
          }
        }}
        okText="Bắt đầu chạy máy"
        cancelText="Hủy"
        confirmLoading={dispatchMutation.isPending}
      >
        {selectedBasketForDispatch && (
          <div className="mt-4 space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1">
              <div className="text-xs text-slate-500">Giỏ đồ điều phối:</div>
              <div className="font-bold text-slate-800">🧺 Giỏ {selectedBasketForDispatch.basketCode}</div>
              <div className="text-xs text-slate-500 mt-1">Đơn hàng: <span className="font-mono font-bold text-indigo-600">{selectedBasketForDispatch.orderCode}</span></div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">Chọn thiết bị máy giặt hoặc sấy phù hợp:</label>
              <Select
                placeholder="Chọn máy..."
                style={{ width: '100%', borderRadius: 8 }}
                value={selectedEquipmentId || undefined}
                onChange={setSelectedEquipmentId}
              >
                {(() => {
                  const isDryingOrder = selectedBasketForDispatch.orderStatus === 'DRYING';
                  const targetType = isDryingOrder ? 'DRYER' : 'WASHING_MACHINE';
                  
                  const getEquipmentCurrentWeight = (eqId: number) => {
                    return baskets
                      .filter(b => b.equipmentId === eqId)
                      .reduce((sum, b) => sum + (b.orderWeight || 0), 0);
                  };

                  return equipments
                    .filter(e => e.isActive && (e.status === 'IDLE' || e.status === 'RUNNING') && e.type === targetType)
                    .map(e => {
                      const curWeight = getEquipmentCurrentWeight(e.id);
                      const basketWeight = selectedBasketForDispatch.orderWeight || 0;
                      const isOverCapacity = curWeight + basketWeight > e.capacity;
                      return (
                        <Select.Option key={e.id} value={e.id} disabled={isOverCapacity}>
                          {e.type === 'WASHING_MACHINE' ? '🧼 MÁY GIẶT' : '💨 MÁY SẤY'} — {e.name} ({curWeight}/{e.capacity}kg - {e.code}) {isOverCapacity ? '(Quá công suất)' : ''}
                        </Select.Option>
                      );
                    });
                })()}
              </Select>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default OrderListPage;

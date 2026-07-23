import { useState } from 'react';
import type { FC } from 'react';
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
  Form,
  Popconfirm
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  PlusOutlined,
  SearchOutlined,
  InboxOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storageRackService } from '@/services/storageRackService';
import { orderService } from '@/services/orderService';
import { useAuthStore } from '@/stores/authStore';
import { PageContainer } from '@/components/layout/PageContainer';
import type { StorageRackResponse, OrderResponse, StorageRackRequest, OrderDeliveryRequest } from '@/types';
import dayjs from 'dayjs';

export const StoragePage: FC = () => {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuthStore();
  const [activeTab, setActiveTab] = useState('racks');
  
  // Storage Racks Search & Page States
  const [rackSearch, setRackSearch] = useState('');
  const [rackStatus, setRackStatus] = useState<string | undefined>(undefined);
  const [rackPage, setRackPage] = useState(0);

  // Orders Search & Page States
  const [orderSearch, setOrderSearch] = useState('');
  const [orderPage, setOrderPage] = useState(0);

  // Modals for Storage Rack CRUD
  const [isRackModalOpen, setIsRackModalOpen] = useState(false);
  const [editingRack, setEditingRack] = useState<StorageRackResponse | null>(null);
  const [rackForm] = Form.useForm();

  // Modals for Order operations
  const [isAssignRackOpen, setIsAssignRackOpen] = useState(false);
  const [selectedOrderForRack, setSelectedOrderForRack] = useState<OrderResponse | null>(null);
  const [selectedRackId, setSelectedRackId] = useState<number | null>(null);

  const [isDeliverOpen, setIsDeliverOpen] = useState(false);
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState<OrderResponse | null>(null);
  const [deliveryForm] = Form.useForm();
  const [deliveryType, setDeliveryType] = useState('PICKUP');

  const handleResetRackFilters = () => {
    setRackSearch('');
    setRackStatus(undefined);
    setRackPage(0);
  };

  const handleResetOrderFilters = () => {
    setOrderSearch('');
    setOrderPage(0);
  };

  // Queries
  const { data: racksData, isLoading: isRacksLoading } = useQuery({
    queryKey: ['storage-racks', rackSearch, rackStatus, rackPage],
    queryFn: async () => {
      const response = await storageRackService.getAll({ 
        page: rackPage, 
        size: 12, 
        search: rackSearch, 
        status: rackStatus 
      });
      return response.data;
    }
  });

  const { data: availableRacks } = useQuery({
    queryKey: ['storage-racks', 'available'],
    queryFn: async () => {
      const response = await storageRackService.getAvailable();
      return response.data;
    },
    enabled: isAssignRackOpen
  });

  const { data: ordersData, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['orders', 'awaiting-delivery', orderSearch, orderPage],
    queryFn: async () => {
      const response = await orderService.getAll({ 
        page: orderPage, 
        size: 20, 
        search: orderSearch, 
        status: 'AWAITING_DELIVERY' 
      });
      return response.data;
    }
  });

  // Mutations
  const createRackMutation = useMutation({
    mutationFn: storageRackService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage-racks'] });
      message.success('Tạo kệ thành công');
      setIsRackModalOpen(false);
      rackForm.resetFields();
    }
  });

  const updateRackMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: StorageRackRequest }) => 
      storageRackService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage-racks'] });
      message.success('Cập nhật kệ thành công');
      setIsRackModalOpen(false);
      setEditingRack(null);
      rackForm.resetFields();
    }
  });

  const deleteRackMutation = useMutation({
    mutationFn: storageRackService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage-racks'] });
      message.success('Xóa kệ thành công');
    }
  });

  const assignRackMutation = useMutation({
    mutationFn: ({ id, rackId }: { id: number; rackId: number }) => 
      orderService.assignRack(id, rackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['storage-racks'] });
      message.success('Gán kệ lưu kho thành công');
      setIsAssignRackOpen(false);
      setSelectedOrderForRack(null);
      setSelectedRackId(null);
    }
  });

  const deliverMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: OrderDeliveryRequest }) => 
      orderService.deliver(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['storage-racks'] });
      message.success('Giao nhận trả hàng và thanh toán thành công 🧼');
      setIsDeliverOpen(false);
      setSelectedOrderForDelivery(null);
      deliveryForm.resetFields();
    }
  });

  // Storage Rack Handlers
  const handleOpenCreateRack = () => {
    setEditingRack(null);
    rackForm.resetFields();
    setIsRackModalOpen(true);
  };

  const handleOpenEditRack = (rack: StorageRackResponse) => {
    setEditingRack(rack);
    rackForm.setFieldsValue({
      code: rack.code,
      name: rack.name,
      status: rack.status
    });
    setIsRackModalOpen(true);
  };

  const handleSaveRack = () => {
    rackForm.validateFields().then(values => {
      if (editingRack) {
        updateRackMutation.mutate({ id: editingRack.id, data: values });
      } else {
        createRackMutation.mutate(values);
      }
    });
  };

  const handleDeleteRack = (id: number) => {
    deleteRackMutation.mutate(id);
  };

  // Order Handlers
  const handleOpenAssignRack = (order: OrderResponse) => {
    setSelectedOrderForRack(order);
    setSelectedRackId(order.storageRackId || null);
    setIsAssignRackOpen(true);
  };

  const handleSaveAssignRack = () => {
    if (selectedOrderForRack && selectedRackId) {
      assignRackMutation.mutate({ id: selectedOrderForRack.id, rackId: selectedRackId });
    } else {
      message.warning('Vui lòng chọn một kệ');
    }
  };

  const handleOpenDeliver = (order: OrderResponse) => {
    setSelectedOrderForDelivery(order);
    setDeliveryType('PICKUP');
    deliveryForm.setFieldsValue({
      paymentMethod: 'CASH',
      deliveryType: 'PICKUP',
      shipperName: '',
      shipperPhone: ''
    });
    setIsDeliverOpen(true);
  };

  const handleConfirmDelivery = () => {
    deliveryForm.validateFields().then(values => {
      if (selectedOrderForDelivery) {
        deliverMutation.mutate({ id: selectedOrderForDelivery.id, data: values });
      }
    });
  };

  // Table Columns
  const orderColumns: ColumnsType<OrderResponse> = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderCode',
      key: 'orderCode',
      width: 140,
      render: (code: string) => <span className="font-bold text-slate-700">{code}</span>
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      ellipsis: true,
      render: (name: string, record) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-700">{name}</span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <PhoneOutlined style={{ fontSize: 10 }} /> {record.customerPhone}
          </span>
        </div>
      )
    },
    {
      title: 'Thành tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount: number) => (
        <span className="font-bold text-indigo-600">
          {amount.toLocaleString('vi-VN')} ₫
        </span>
      )
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 125,
      render: (status: string) => (
        <Tag color={status === 'PAID' ? 'green' : 'orange'} className="font-medium">
          {status === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
        </Tag>
      )
    },
    {
      title: 'Vị trí kệ chờ',
      dataIndex: 'storageRackName',
      key: 'storageRackName',
      width: 180,
      render: (name: string) => {
        if (name) {
          return (
            <Tag color="purple" icon={<EnvironmentOutlined />} className="flex items-center gap-1 w-fit py-0.5 px-2 rounded font-medium">
              {name}
            </Tag>
          );
        }
        return (
          <Tag color="red" icon={<WarningOutlined />} className="flex items-center gap-1 w-fit py-0.5 px-2 rounded font-medium animate-pulse">
            CHƯA GÁN KỆ
          </Tag>
        );
      }
    },
    {
      title: 'Ngày tiếp nhận',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          {hasPermission('PUT:/orders/{id}/assign-rack') && (
            <Button 
              type="text" 
              className="text-purple-600 hover:text-purple-800"
              icon={<EnvironmentOutlined />} 
              onClick={() => handleOpenAssignRack(record)}
            >
              Gán kệ
            </Button>
          )}
          {hasPermission('PUT:/orders/{id}/delivery') && (
            <Button 
              type="primary" 
              className="bg-indigo-600 hover:bg-indigo-700"
              size="small"
              icon={<CheckCircleOutlined />} 
              onClick={() => handleOpenDeliver(record)}
            >
              Trả đồ & Thanh toán
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <PageContainer title="Kho Chờ & Giao Nhận Trả Hàng">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        className="premium-tabs"
        items={[
          {
            key: 'racks',
            label: (
              <span className="flex items-center gap-2 px-2 py-1 font-medium">
                <InboxOutlined /> Kệ Lưu Kho Chờ
              </span>
            ),
            children: (
              <div className="space-y-6">
                {/* Search & Actions Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-xl shadow-xs border border-slate-100">
                  <div className="flex flex-1 flex-col sm:flex-row gap-3">
                    <Input
                      placeholder="Tìm kiếm kệ lưu kho..."
                      prefix={<SearchOutlined className="text-gray-400" />}
                      value={rackSearch}
                      onChange={(e) => setRackSearch(e.target.value)}
                      style={{ maxWidth: 300, borderRadius: 8 }}
                      allowClear
                    />
                    <Select
                      placeholder="Trạng thái kệ"
                      style={{ width: 160, borderRadius: 8 }}
                      value={rackStatus}
                      onChange={setRackStatus}
                      allowClear
                    >
                      <Select.Option value="AVAILABLE">Trống (AVAILABLE)</Select.Option>
                      <Select.Option value="OCCUPIED">Đang có đồ (OCCUPIED)</Select.Option>
                      <Select.Option value="MAINTENANCE">Bảo trì (MAINTENANCE)</Select.Option>
                    </Select>
                    <Button
                      type="default"
                      onClick={handleResetRackFilters}
                      style={{ borderRadius: 8 }}
                    >
                      Đặt lại bộ lọc
                    </Button>
                  </div>
                  {hasPermission('POST:/storage-racks') && (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleOpenCreateRack}
                      style={{ borderRadius: 8, height: 38 }}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Thêm kệ mới
                    </Button>
                  )}
                </div>

                {/* Grid Racks Display */}
                {isRacksLoading ? (
                  <div className="text-center py-12 text-slate-500">Đang tải danh sách kệ lưu kho...</div>
                ) : (
                  <div>
                    <Row gutter={[16, 16]}>
                      {racksData?.content.map((rack) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={rack.id}>
                          <Card
                            className="shadow-sm hover:shadow-md transition-all border border-slate-100 hover:border-indigo-100 rounded-xl"
                            actions={[
                              hasPermission('PUT:/storage-racks/{id}') && (
                                <Tooltip title="Chỉnh sửa" key="edit">
                                  <EditOutlined onClick={() => handleOpenEditRack(rack)} className="hover:text-indigo-600" />
                                </Tooltip>
                              ),
                              hasPermission('DELETE:/storage-racks/{id}') && (
                                <Popconfirm
                                  title="Xóa kệ này?"
                                  description="Bạn chắc chắn muốn xóa kệ lưu kho này?"
                                  onConfirm={() => handleDeleteRack(rack.id)}
                                  okText="Xóa"
                                  cancelText="Hủy"
                                  key="delete"
                                >
                                  <DeleteOutlined className="text-red-500 hover:text-red-700" />
                                </Popconfirm>
                              )
                            ].filter(Boolean)}
                          >
                            <Card.Meta
                              avatar={
                                <Badge
                                  status={
                                    rack.status === 'AVAILABLE' ? 'success' :
                                    rack.status === 'OCCUPIED' ? 'warning' : 'default'
                                  }
                                >
                                  <div className="w-12 h-12 bg-slate-100 flex items-center justify-center rounded-lg text-lg text-slate-600">
                                    📦
                                  </div>
                                </Badge>
                              }
                              title={
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-slate-700">{rack.name}</span>
                                  <Tag color={
                                    rack.status === 'AVAILABLE' ? 'green' :
                                    rack.status === 'OCCUPIED' ? 'orange' : 'default'
                                  } className="text-[10px] font-bold">
                                    {rack.status}
                                  </Tag>
                                </div>
                              }
                              description={
                                <div className="space-y-2 mt-2">
                                  <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                                    Mã kệ: {rack.code}
                                  </div>
                                  
                                  {rack.status === 'OCCUPIED' ? (
                                    <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-100 text-xs">
                                      <div className="font-bold text-amber-800">Đơn hàng hiện tại:</div>
                                      <div className="font-medium text-slate-700 mt-1">{rack.currentOrderCode}</div>
                                      <div className="text-slate-500 mt-0.5">{rack.currentCustomerName}</div>
                                    </div>
                                  ) : (
                                    <div className="text-xs text-slate-400 italic mt-3">Kệ trống sẵn sàng xếp đồ</div>
                                  )}
                                </div>
                              }
                            />
                          </Card>
                        </Col>
                      ))}
                    </Row>

                    {/* Simple Pagination */}
                    {racksData && racksData.totalPages > 1 && (
                      <div className="flex justify-end mt-6">
                        <Space>
                          <Button 
                            disabled={rackPage === 0} 
                            onClick={() => setRackPage(prev => prev - 1)}
                          >
                            Trước
                          </Button>
                          <span className="text-slate-600 font-medium">Trang {rackPage + 1} / {racksData.totalPages}</span>
                          <Button 
                            disabled={rackPage === racksData.totalPages - 1} 
                            onClick={() => setRackPage(prev => prev + 1)}
                          >
                            Sau
                          </Button>
                        </Space>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          },
          {
            key: 'orders',
            label: (
              <span className="flex items-center gap-2 px-2 py-1 font-medium">
                <Badge count={ordersData?.totalElements || 0} size="small" offset={[8, -4]} showZero color="#6366f1">
                  <CheckCircleOutlined />
                </Badge>
                Đơn Hàng Chờ Trả
              </span>
            ),
            children: (
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="flex justify-start items-center gap-3 bg-white p-4 rounded-xl shadow-xs border border-slate-100">
                  <Input
                    placeholder="Tìm kiếm theo mã đơn, tên, số điện thoại..."
                    prefix={<SearchOutlined className="text-gray-400" />}
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    style={{ width: 360, borderRadius: 8 }}
                    allowClear
                  />
                  <Button
                    type="default"
                    onClick={handleResetOrderFilters}
                    style={{ borderRadius: 8 }}
                  >
                    Đặt lại bộ lọc
                  </Button>
                </div>

                {/* Table */}
                <Table
                  rowKey="id"
                  columns={orderColumns}
                  dataSource={ordersData?.content || []}
                  loading={isOrdersLoading}
                  scroll={{ x: 1000 }}
                  pagination={{
                    current: orderPage + 1,
                    pageSize: 20,
                    total: ordersData?.totalElements,
                    showSizeChanger: false,
                    showTotal: (total) => `Tổng ${total} đơn hàng`,
                    onChange: (p) => setOrderPage(p - 1),
                  }}
                  className="premium-table border border-slate-100 rounded-xl overflow-hidden"
                />
              </div>
            )
          }
        ]}
      />

      {/* CRUD Storage Rack Modal */}
      <Modal
        title={editingRack ? "Cập nhật kệ lưu kho" : "Thêm kệ lưu kho mới"}
        open={isRackModalOpen}
        onOk={handleSaveRack}
        onCancel={() => setIsRackModalOpen(false)}
        okText={editingRack ? "Cập nhật" : "Tạo kệ"}
        cancelText="Hủy"
        okButtonProps={{ className: "bg-indigo-600" }}
        style={{ borderRadius: 12 }}
      >
        <Form
          form={rackForm}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="code"
            label="Mã kệ"
            rules={[
              { required: true, message: 'Vui lòng nhập mã kệ (ví dụ: RACK_C1)' },
              { max: 50, message: 'Mã kệ tối đa 50 ký tự' }
            ]}
          >
            <Input placeholder="RACK_A1" disabled={!!editingRack} style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên kệ hiển thị"
            rules={[
              { required: true, message: 'Vui lòng nhập tên kệ hiển thị' },
              { max: 100, message: 'Tên kệ tối đa 100 ký tự' }
            ]}
          >
            <Input placeholder="Kệ A - Tầng 1" style={{ borderRadius: 8 }} />
          </Form.Item>

          {editingRack && (
            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: 'Chọn trạng thái kệ' }]}
            >
              <Select style={{ borderRadius: 8 }}>
                <Select.Option value="AVAILABLE">AVAILABLE (Trống)</Select.Option>
                <Select.Option value="OCCUPIED" disabled>OCCUPIED (Đang có đồ - Sẽ tự động gán theo đơn hàng)</Select.Option>
                <Select.Option value="MAINTENANCE">MAINTENANCE (Bảo trì)</Select.Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Assign Storage Rack Modal */}
      <Modal
        title="Gán kệ lưu kho cho đơn hàng"
        open={isAssignRackOpen}
        onOk={handleSaveAssignRack}
        onCancel={() => setIsAssignRackOpen(false)}
        okText="Lưu vị trí"
        cancelText="Hủy"
        okButtonProps={{ className: "bg-indigo-600" }}
      >
        {selectedOrderForRack && (
          <div className="space-y-4 py-2">
            <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1">
              <div><span className="font-bold">Đơn hàng:</span> {selectedOrderForRack.orderCode}</div>
              <div><span className="font-bold">Khách hàng:</span> {selectedOrderForRack.customerName}</div>
              <div><span className="font-bold">Tổng tiền:</span> {selectedOrderForRack.totalAmount.toLocaleString('vi-VN')} ₫</div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">Chọn kệ trống (AVAILABLE):</label>
              <Select
                placeholder="Chọn kệ lưu kho chờ..."
                style={{ width: '100%', borderRadius: 8 }}
                value={selectedRackId}
                onChange={setSelectedRackId}
              >
                {availableRacks?.map(r => (
                  <Select.Option key={r.id} value={r.id}>
                    📦 {r.name} ({r.code})
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
        )}
      </Modal>

      {/* Deliver / Handover Modal */}
      <Modal
        title="Xác nhận trả đồ & Thanh toán"
        open={isDeliverOpen}
        onOk={handleConfirmDelivery}
        onCancel={() => setIsDeliverOpen(false)}
        okText="Xác nhận giao hàng & Thanh toán"
        cancelText="Hủy"
        okButtonProps={{ className: "bg-indigo-600" }}
        width={550}
      >
        {selectedOrderForDelivery && (
          <Form
            form={deliveryForm}
            layout="vertical"
            style={{ marginTop: 16 }}
            onValuesChange={(changed) => {
              if (changed.deliveryType) {
                setDeliveryType(changed.deliveryType);
              }
            }}
          >
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl space-y-2 mb-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-500">Mã đơn hàng:</span>
                <span className="font-bold text-slate-800 text-sm">{selectedOrderForDelivery.orderCode}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-500">Khách hàng:</span>
                <span className="font-bold text-slate-800">{selectedOrderForDelivery.customerName} ({selectedOrderForDelivery.customerPhone})</span>
              </div>
              {selectedOrderForDelivery.storageRackName && (
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-500">Kệ đang lưu:</span>
                  <Tag color="purple">{selectedOrderForDelivery.storageRackName}</Tag>
                </div>
              )}
              <div className="border-t border-indigo-100/50 my-2 pt-2 flex justify-between items-center">
                <span className="font-bold text-indigo-800">Tổng thanh toán:</span>
                <span className="font-extrabold text-indigo-600 text-lg flex items-center gap-1">
                  <DollarOutlined /> {selectedOrderForDelivery.totalAmount.toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="paymentMethod"
                  label="Phương thức thanh toán"
                  rules={[{ required: true, message: 'Chọn phương thức thanh toán' }]}
                >
                  <Select style={{ borderRadius: 8 }}>
                    <Select.Option value="CASH">💵 Tiền mặt (Cash)</Select.Option>
                    <Select.Option value="BANK_TRANSFER">🏦 Chuyển khoản (Bank)</Select.Option>
                    <Select.Option value="MOMO">📱 Ví Momo</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="deliveryType"
                  label="Hình thức giao trả đồ"
                  rules={[{ required: true, message: 'Chọn hình thức giao trả' }]}
                >
                  <Select style={{ borderRadius: 8 }}>
                    <Select.Option value="PICKUP">🚪 Khách nhận tại quầy</Select.Option>
                    <Select.Option value="SHIPPER">🛵 Bàn giao shipper</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {deliveryType === 'SHIPPER' && (
              <Card size="small" className="bg-slate-50 border-slate-100 mb-2 rounded-lg" title="Thông tin Shipper">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="shipperName"
                      label="Tên Shipper/Đơn vị vận chuyển"
                      rules={[{ required: true, message: 'Nhập tên shipper' }]}
                    >
                      <Input placeholder="Nguyễn Văn A / AhaMove..." style={{ borderRadius: 8 }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="shipperPhone"
                      label="SĐT Shipper"
                      rules={[
                        { required: true, message: 'Nhập số điện thoại shipper' },
                        { pattern: /^[0-9+-\s]*$/, message: 'SĐT không hợp lệ' }
                      ]}
                    >
                      <Input placeholder="0987654321" style={{ borderRadius: 8 }} />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            )}
          </Form>
        )}
      </Modal>
    </PageContainer>
  );
};

export default StoragePage;

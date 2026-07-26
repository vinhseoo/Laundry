import { useState } from 'react';
import type { FC } from 'react';
import { 
  Table, 
  Tag, 
  Button, 
  Space, 
  Card, 
  Modal, 
  message, 
  Input, 
  Form, 
  Popconfirm,
  Tooltip,
  Drawer,
  Steps,
  Divider,
  Row,
  Col
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
  PhoneOutlined,
  DollarOutlined,
  SolutionOutlined,
  EditOutlined,
  DeleteOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { customerService } from '@/services/customerService';
import { orderService } from '@/services/orderService';
import { useAuthStore } from '@/stores/authStore';
import { PageContainer } from '@/components/layout/PageContainer';
import type { CustomerStatsResponse, CustomerRequest } from '@/types';
import dayjs from 'dayjs';

const getOrderStatusTag = (status: string) => {
  switch (status) {
    case 'RECEIVED': return <Tag color="cyan">TIẾP NHẬN</Tag>;
    case 'SORTING': return <Tag color="blue">PHÂN LOẠI</Tag>;
    case 'WASHING': return <Tag color="geekblue">ĐANG GIẶT</Tag>;
    case 'DRYING': return <Tag color="purple">ĐANG SẤY</Tag>;
    case 'AWAITING_DELIVERY': return <Tag color="warning">CHỜ TRẢ ĐỒ</Tag>;
    case 'COMPLETED': return <Tag color="green">HOÀN THÀNH</Tag>;
    default: return <Tag>{status}</Tag>;
  }
};

export const CustomerListPage: FC = () => {
  const { hasPermission } = useAuthStore();
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // CRUD state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerStatsResponse | null>(null);
  const [form] = Form.useForm();

  // Order History state
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<CustomerStatsResponse | null>(null);
  const [selectedOrderIdForDetails, setSelectedOrderIdForDetails] = useState<number | null>(null);

  // Queries for Order History
  const { data: customerOrders, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['customer-orders', selectedCustomerForHistory?.id],
    queryFn: async () => {
      if (!selectedCustomerForHistory) return [];
      const res = await customerService.getOrders(selectedCustomerForHistory.id);
      return res.data;
    },
    enabled: !!selectedCustomerForHistory
  });

  const { data: orderDetailData, isLoading: isDetailLoading } = useQuery({
    queryKey: ['orders-detail', selectedOrderIdForDetails],
    queryFn: async () => {
      if (!selectedOrderIdForDetails) return null;
      const res = await orderService.getById(selectedOrderIdForDetails);
      return res.data;
    },
    enabled: !!selectedOrderIdForDetails
  });

  // Queries
  const { data: customerData, isLoading: isCustomersLoading, refetch } = useQuery({
    queryKey: ['customers', search, page, pageSize],
    queryFn: async () => {
      const response = await customerService.getAll({ 
        page, 
        size: pageSize, 
        search 
      });
      return response.data;
    }
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: customerService.create,
    onSuccess: () => {
      message.success('Thêm khách hàng thành công');
      refetch();
      handleCancel();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CustomerRequest }) => 
      customerService.update(id, data),
    onSuccess: () => {
      message.success('Cập nhật khách hàng thành công');
      refetch();
      handleCancel();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: customerService.delete,
    onSuccess: () => {
      message.success('Vô hiệu hóa khách hàng thành công');
      refetch();
    }
  });

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (customer: CustomerStatsResponse) => {
    setEditingCustomer(customer);
    form.setFieldsValue({
      name: customer.name,
      phone: customer.phone
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingCustomer) {
        updateMutation.mutate({ id: editingCustomer.id, data: values });
      } else {
        createMutation.mutate(values);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setPage(0);
  };

  // Table Columns
  const columns: ColumnsType<CustomerStatsResponse> = [
    {
      title: 'Tên khách hàng',
      key: 'name',
      render: (_, record) => (
        <Space>
          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            {record.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold text-slate-800">{record.name}</span>
        </Space>
      )
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => (
        <span className="font-medium text-slate-600 font-mono">
          <PhoneOutlined className="mr-1.5 text-slate-400" />
          {phone}
        </span>
      )
    },
    {
      title: 'Tổng số đơn hàng',
      dataIndex: 'totalOrders',
      key: 'totalOrders',
      sorter: (a, b) => a.totalOrders - b.totalOrders,
      render: (orders: number) => (
        <span className="font-bold text-slate-700">
          <SolutionOutlined className="mr-1.5 text-slate-400" />
          {orders || 0}
        </span>
      )
    },
    {
      title: 'Doanh thu đóng góp',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      sorter: (a, b) => (a.totalSpent || 0) - (b.totalSpent || 0),
      render: (spent: number) => (
        <span className="font-extrabold text-emerald-600 font-mono">
          <DollarOutlined className="mr-1 text-emerald-500" />
          {(spent || 0).toLocaleString('vi-VN')} ₫
        </span>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'} style={{ borderRadius: 6 }}>
          {isActive ? 'HOẠT ĐỘNG' : 'TẠM KHÓA'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          {hasPermission('GET:/api/customers/{id}/orders') && (
            <Tooltip title="Lịch sử đơn hàng">
              <Button 
                type="text" 
                icon={<HistoryOutlined className="text-purple-600" />} 
                onClick={() => setSelectedCustomerForHistory(record)}
              />
            </Tooltip>
          )}
          {hasPermission('PUT:/api/customers/{id}') && (
            <Tooltip title="Chỉnh sửa">
              <Button 
                type="text" 
                icon={<EditOutlined className="text-indigo-600" />} 
                onClick={() => handleOpenEdit(record)}
              />
            </Tooltip>
          )}
          {record.isActive && hasPermission('DELETE:/api/customers/{id}') && (
            <Popconfirm
              title="Vô hiệu hóa khách hàng?"
              description="Bạn có chắc chắn muốn ngừng kích hoạt khách hàng này?"
              onConfirm={() => deleteMutation.mutate(record.id)}
              okText="Đồng ý"
              cancelText="Hủy"
            >
              <Tooltip title="Vô hiệu hóa">
                <Button 
                  type="text" 
                  danger
                  icon={<DeleteOutlined />} 
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <PageContainer title="Quản Lý Khách Hàng">
      <div className="space-y-4">
        {/* Search Bar & Add Button */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-xs border border-slate-100 flex-wrap gap-4">
          <Space size="middle">
            <Input
              placeholder="Tìm theo tên, số điện thoại..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 280, borderRadius: 8 }}
              allowClear
            />
            <Button
              type="default"
              onClick={handleResetFilters}
              style={{ borderRadius: 8 }}
            >
              Đặt lại bộ lọc
            </Button>
          </Space>

          {hasPermission('POST:/api/customers') && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}
              style={{ borderRadius: 8, height: 38 }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Thêm khách hàng mới
            </Button>
          )}
        </div>

        {/* Table list */}
        <Table
          rowKey="id"
          columns={columns}
          dataSource={customerData?.content || []}
          loading={isCustomersLoading}
          pagination={{
            total: customerData?.totalElements || 0,
            pageSize: customerData?.size || 20,
            current: (customerData?.page || 0) + 1,
            onChange: (p, s) => {
              setPage(p - 1);
              setPageSize(s);
            }
          }}
          className="shadow-xs rounded-xl overflow-hidden border border-slate-100 bg-white"
        />
      </div>

      {/* Modal: Create/Edit Customer */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <UserOutlined className="text-indigo-500 text-xl" />
            <span className="font-bold text-slate-800">
              {editingCustomer ? 'Cập Nhật Thông Tin Khách Hàng' : 'Thêm Khách Hàng Mới'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleSubmit}
        okText={editingCustomer ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^[0-9+()#&.\s-]{9,15}$/, message: 'Số điện thoại không hợp lệ' }
            ]}
          >
            <Input placeholder="0987654321" disabled={!!editingCustomer} style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên khách hàng"
            rules={[
              { required: true, message: 'Vui lòng nhập tên khách hàng' },
              { max: 150, message: 'Tên không quá 150 ký tự' }
            ]}
          >
            <Input placeholder="Nguyễn Văn A" style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Drawer: Lịch sử đơn hàng */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <HistoryOutlined className="text-indigo-500 text-xl" />
            <span className="font-bold">Lịch sử đơn hàng: {selectedCustomerForHistory?.name}</span>
          </div>
        }
        width={720}
        placement="right"
        onClose={() => setSelectedCustomerForHistory(null)}
        open={!!selectedCustomerForHistory}
      >
        <Table
          rowKey="id"
          loading={isOrdersLoading}
          dataSource={customerOrders || []}
          pagination={{ pageSize: 10 }}
          columns={[
            {
              title: 'Mã đơn',
              dataIndex: 'orderCode',
              key: 'orderCode',
              render: (code) => <span className="font-bold text-slate-700">{code}</span>
            },
            {
              title: 'Ngày đặt',
              dataIndex: 'createdAt',
              key: 'createdAt',
              render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
            },
            {
              title: 'Tổng tiền',
              dataIndex: 'totalAmount',
              key: 'totalAmount',
              render: (amount) => <span className="font-bold text-indigo-600 font-mono">{amount.toLocaleString('vi-VN')} ₫</span>
            },
            {
              title: 'Thanh toán',
              dataIndex: 'paymentStatus',
              key: 'paymentStatus',
              render: (status) => (
                <Tag color={status === 'PAID' ? 'green' : 'orange'} style={{ borderRadius: 4 }}>
                  {status === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                </Tag>
              )
            },
            {
              title: 'Trạng thái',
              dataIndex: 'status',
              key: 'status',
              render: (status) => getOrderStatusTag(status)
            },
            {
              title: 'Thao tác',
              key: 'action',
              render: (_, record) => (
                <Button 
                  type="link" 
                  onClick={() => setSelectedOrderIdForDetails(record.id)}
                  style={{ padding: 0 }}
                  className="font-bold text-indigo-600 hover:text-indigo-800"
                >
                  Chi tiết
                </Button>
              )
            }
          ]}
        />
      </Drawer>

      {/* Modal: Chi tiết đơn hàng */}
      <Modal
        title={
          <div className="flex items-center gap-2 border-b pb-3 border-slate-100">
            <SolutionOutlined className="text-indigo-500 text-2xl" />
            <div>
              <span className="font-bold text-slate-800 text-lg">Đơn hàng {orderDetailData?.orderCode}</span>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                Ngày tiếp nhận: {orderDetailData && dayjs(orderDetailData.createdAt).format('DD/MM/YYYY HH:mm')}
              </div>
            </div>
          </div>
        }
        open={!!selectedOrderIdForDetails}
        onCancel={() => setSelectedOrderIdForDetails(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setSelectedOrderIdForDetails(null)}>
            Đóng
          </Button>
        ]}
        width={800}
        loading={isDetailLoading}
      >
        {orderDetailData && (
          <div className="space-y-6 mt-4">
            {/* Steps Timeline */}
            <Card className="bg-slate-50/50 border border-slate-100 rounded-xl">
              <Steps
                current={['RECEIVED', 'SORTING', 'WASHING', 'DRYING', 'AWAITING_DELIVERY', 'COMPLETED'].indexOf(orderDetailData.status)}
                size="small"
                items={[
                  { title: 'Tiếp nhận' },
                  { title: 'Phân loại' },
                  { title: 'Đang giặt' },
                  { title: 'Đang sấy' },
                  { title: 'Chờ trả đồ' },
                  { title: 'Hoàn thành' },
                ]}
              />
            </Card>

            {/* General Info Grid */}
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="space-y-2">
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Thông tin khách hàng</div>
                  <div className="font-bold text-slate-700">{orderDetailData.customerName}</div>
                  <div className="text-xs text-slate-500 font-mono"><PhoneOutlined className="mr-1" /> {orderDetailData.customerPhone}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="space-y-2">
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Giao nhận & Kệ lưu kho</div>
                  <div className="text-xs text-slate-600">
                    <span className="font-bold">Hình thức:</span> {orderDetailData.deliveryType === 'PICKUP' ? 'Nhận tại quầy' : 'Giao hàng tận nơi (Shipper)'}
                  </div>
                  {orderDetailData.storageRackName && (
                    <div className="text-xs text-slate-600">
                      <span className="font-bold">Kệ chờ:</span> <Tag color="purple" icon={<EnvironmentOutlined />}>{orderDetailData.storageRackName}</Tag>
                    </div>
                  )}
                  {orderDetailData.deliveryType === 'SHIPPER' && orderDetailData.shipperName && (
                    <div className="text-xs text-slate-500 italic">
                      Shipper: {orderDetailData.shipperName} ({orderDetailData.shipperPhone})
                    </div>
                  )}
                </div>
              </Col>
            </Row>

            <Divider className="my-2" />

            {/* Services Table */}
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Chi tiết dịch vụ</div>
              <Table
                rowKey="id"
                dataSource={orderDetailData.items || []}
                pagination={false}
                size="small"
                columns={[
                  {
                    title: 'Dịch vụ',
                    dataIndex: 'serviceName',
                    key: 'serviceName',
                    render: (name) => <span className="font-semibold text-slate-700">{name}</span>
                  },
                  {
                    title: 'Số lượng',
                    dataIndex: 'quantity',
                    key: 'quantity',
                    align: 'right',
                    render: (q, record) => (
                      <span className="font-bold text-slate-600">
                        {q} {record.serviceCode.includes('GIAT_KHO') || record.serviceCode.includes('GIAY') ? 'Chiếc' : 'KG'}
                      </span>
                    )
                  },
                  {
                    title: 'Đơn giá',
                    dataIndex: 'unitPrice',
                    key: 'unitPrice',
                    align: 'right',
                    render: (price) => <span className="font-medium text-slate-500">{price.toLocaleString('vi-VN')} ₫</span>
                  },
                  {
                    title: 'Thành tiền',
                    dataIndex: 'subtotal',
                    key: 'subtotal',
                    align: 'right',
                    render: (sub) => <span className="font-bold text-slate-700 font-mono">{sub.toLocaleString('vi-VN')} ₫</span>
                  }
                ]}
              />
            </div>

            {/* Billing breakdown */}
            <div className="flex flex-col items-end gap-2 pr-4">
              <div className="flex justify-between w-64 text-slate-600 text-xs">
                <span>Tạm tính (chưa VAT):</span>
                <span className="font-bold font-mono">
                  {(orderDetailData.items?.reduce((sum, item) => sum + item.subtotal, 0) || 0).toLocaleString('vi-VN')} ₫
                </span>
              </div>
              <div className="flex justify-between w-64 text-slate-600 text-xs">
                <span>Thuế VAT:</span>
                <span className="font-bold font-mono">
                  {(orderDetailData.totalAmount - (orderDetailData.items?.reduce((sum, item) => sum + item.subtotal, 0) || 0)).toLocaleString('vi-VN')} ₫
                </span>
              </div>
              <div className="flex justify-between w-64 text-slate-800 text-sm font-bold border-t pt-2 border-slate-100">
                <span>Tổng cộng thanh toán:</span>
                <span className="text-indigo-600 font-mono text-base">
                  {orderDetailData.totalAmount.toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>

            {/* SLA Alert Status */}
            {orderDetailData.slaViolated && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-red-700 text-xs flex gap-2 items-center">
                <InfoCircleOutlined className="text-base" />
                <span className="font-bold">Đơn hàng này đã quá hạn xử lý tối đa theo thỏa thuận chất lượng dịch vụ (SLA)!</span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default CustomerListPage;

import { useState } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Space, 
  Modal, 
  Form, 
  Select, 
  Tag, 
  message, 
  Popconfirm,
  Tooltip,
  InputNumber,
  Tabs,
  Card,
  Row,
  Col,
  Progress
} from 'antd';
import type { TableColumnsType } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  DashboardOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { equipmentService } from '@/services/equipmentService';
import { useAuthStore } from '@/stores/authStore';
import type { EquipmentResponse, EquipmentRequest } from '@/types';
import { PageContainer } from '@/components/layout/PageContainer';
import dayjs from 'dayjs';

export const EquipmentPage = () => {
  const { hasPermission } = useAuthStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentResponse | null>(null);
  
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const handleResetFilters = () => {
    setSearch('');
    setTypeFilter(undefined);
    setStatusFilter(undefined);
  };

  // Fetch Equipment
  const { data: equipmentData, isLoading: isEquipmentLoading, refetch: refetchEquipment } = useQuery({
    queryKey: ['equipment', search, typeFilter, statusFilter],
    queryFn: async () => {
      const response = await equipmentService.getAll({ 
        search, 
        type: typeFilter, 
        status: statusFilter 
      });
      return response.data;
    }
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: equipmentService.create,
    onSuccess: () => {
      message.success('Thêm máy móc thành công');
      refetchEquipment();
      handleCancelCreate();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: EquipmentRequest }) => equipmentService.update(id, data),
    onSuccess: () => {
      message.success('Cập nhật máy móc thành công');
      refetchEquipment();
      handleCancelEdit();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: equipmentService.delete,
    onSuccess: () => {
      message.success('Vô hiệu hóa thiết bị thành công');
      refetchEquipment();
    }
  });

  const handleOpenCreate = () => {
    createForm.resetFields();
    setIsCreateModalOpen(true);
  };

  const handleCancelCreate = () => {
    setIsCreateModalOpen(false);
    createForm.resetFields();
  };

  const handleOpenEdit = (equipment: EquipmentResponse) => {
    setSelectedEquipment(equipment);
    editForm.setFieldsValue({
      code: equipment.code,
      name: equipment.name,
      type: equipment.type,
      capacity: equipment.capacity,
      status: equipment.status,
    });
    setIsEditModalOpen(true);
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setSelectedEquipment(null);
    editForm.resetFields();
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      createMutation.mutate(values as EquipmentRequest);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditSubmit = async () => {
    try {
      if (!selectedEquipment) return;
      const values = await editForm.validateFields();
      updateMutation.mutate({ id: selectedEquipment.id, data: values as EquipmentRequest });
    } catch (error) {
      console.error(error);
    }
  };

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, request }: { id: number; request: EquipmentRequest }) => 
      equipmentService.update(id, request),
    onSuccess: () => {
      message.success('Cập nhật trạng thái máy thành công');
      refetchEquipment();
    }
  });

  const handleStatusChange = (record: EquipmentResponse, newStatus: string) => {
    updateStatusMutation.mutate({
      id: record.id,
      request: {
        code: record.code,
        name: record.name,
        type: record.type,
        capacity: record.capacity,
        status: newStatus
      }
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'IDLE':
        return { 
          color: 'success', 
          text: 'Sẵn sàng (Rảnh)', 
          bgClass: 'border-emerald-200 bg-emerald-50/50',
          glowClass: 'shadow-[0_0_15px_rgba(16,185,129,0.15)] border-emerald-500/30',
          dotColor: 'bg-emerald-500',
          icon: '🟢'
        };
      case 'RUNNING':
        return { 
          color: 'processing', 
          text: 'Đang chạy', 
          bgClass: 'border-indigo-200 bg-indigo-50/50',
          glowClass: 'shadow-[0_0_15px_rgba(99,102,241,0.2)] border-indigo-500/30',
          dotColor: 'bg-indigo-500 animate-ping',
          icon: '🌀'
        };
      case 'MAINTENANCE':
        return { 
          color: 'warning', 
          text: 'Bảo trì', 
          bgClass: 'border-amber-200 bg-amber-50/50',
          glowClass: 'shadow-[0_0_15px_rgba(245,158,11,0.15)] border-amber-500/30',
          dotColor: 'bg-amber-500',
          icon: '🛠️'
        };
      case 'OUT_OF_SERVICE':
        default:
        return { 
          color: 'error', 
          text: 'Hỏng hóc (Khóa)', 
          bgClass: 'border-red-200 bg-red-50/50',
          glowClass: 'shadow-[0_0_15px_rgba(239,68,68,0.15)] border-red-500/30',
          dotColor: 'bg-red-500',
          icon: '⚠️'
        };
    }
  };

  const columns: TableColumnsType<EquipmentResponse> = [
    {
      title: 'Mã máy',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <span className="font-semibold text-indigo-600">{code}</span>,
    },
    {
      title: 'Tên máy',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span className="font-semibold text-gray-800">{name}</span>,
    },
    {
      title: 'Loại máy',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'WASHING_MACHINE' ? 'blue' : 'orange'} style={{ borderRadius: 6, fontWeight: 500 }}>
          {type === 'WASHING_MACHINE' ? 'Máy Giặt' : 'Máy Sấy'}
        </Tag>
      ),
    },
    {
      title: 'Công suất (KG)',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (capacity: number) => <span className="font-bold">{capacity} kg</span>,
    },
    {
      title: 'Trạng thái hoạt động',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record) => {
        const config = getStatusConfig(status);
        const canUpdateStatus = hasPermission('PUT:/api/equipment/{id}');
        if (canUpdateStatus) {
          return (
            <Select 
              value={status} 
              style={{ width: 170 }} 
              onChange={(val) => handleStatusChange(record, val)}
              bordered={false}
              className={`rounded-md border px-1 ${config.bgClass} font-semibold`}
            >
              <Select.Option value="IDLE">🟢 Sẵn sàng (Rảnh)</Select.Option>
              <Select.Option value="RUNNING">🌀 Đang chạy</Select.Option>
              <Select.Option value="MAINTENANCE">🛠️ Bảo trì</Select.Option>
              <Select.Option value="OUT_OF_SERVICE">⚠️ Hỏng hóc (Khóa)</Select.Option>
            </Select>
          );
        }
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Kích hoạt',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'} style={{ borderRadius: 4 }}>
          {isActive ? 'Hoạt động' : 'Vô hiệu'}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
  ];

  const canEdit = hasPermission('PUT:/api/equipment/{id}');
  const canDelete = hasPermission('DELETE:/api/equipment/{id}');

  if (canEdit || canDelete) {
    columns.push({
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: EquipmentResponse) => (
        <Space size="middle">
          {canEdit && (
            <Tooltip title="Chỉnh sửa cấu hình">
              <Button 
                type="text" 
                icon={<EditOutlined style={{ color: '#6366f1' }} />} 
                onClick={() => handleOpenEdit(record)} 
              />
            </Tooltip>
          )}
          {record.isActive && canDelete && (
            <Popconfirm
              title="Bạn muốn vô hiệu hóa thiết bị này?"
              description="Thiết bị sẽ không còn hiển thị trong danh sách vận hành."
              okText="Đồng ý"
              cancelText="Hủy"
              onConfirm={() => deleteMutation.mutate(record.id)}
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
      ),
    });
  }

  // Filter machines for grid monitor view
  const allEquipment = equipmentData?.content || [];

  return (
    <PageContainer title="Giám Sát & Quản Lý Máy Móc">
      <Tabs 
        defaultActiveKey="monitor"
        className="bg-transparent"
        items={[
          {
            key: 'monitor',
            label: <span className="text-base px-2 font-medium"><DashboardOutlined /> Giám sát máy móc</span>,
            children: (
              <div className="space-y-6 mt-4">
                {/* Visual filter bar */}
                <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
                  <span className="font-semibold text-slate-700">Bộ lọc nhanh:</span>
                  <Select 
                    placeholder="Loại máy" 
                    allowClear 
                    value={typeFilter}
                    onChange={setTypeFilter} 
                    style={{ width: 150 }}
                  >
                    <Select.Option value="WASHING_MACHINE">Máy Giặt</Select.Option>
                    <Select.Option value="DRYER">Máy Sấy</Select.Option>
                  </Select>

                  <Select 
                    placeholder="Trạng thái" 
                    allowClear 
                    value={statusFilter}
                    onChange={setStatusFilter} 
                    style={{ width: 170 }}
                  >
                    <Select.Option value="IDLE">🟢 Sẵn sàng (Rảnh)</Select.Option>
                    <Select.Option value="RUNNING">🌀 Đang chạy</Select.Option>
                    <Select.Option value="MAINTENANCE">🛠️ Bảo trì</Select.Option>
                    <Select.Option value="OUT_OF_SERVICE">⚠️ Hỏng hóc (Khóa)</Select.Option>
                  </Select>

                  <Input
                    placeholder="Tìm kiếm máy..."
                    prefix={<SearchOutlined className="text-gray-400" />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: 220 }}
                    allowClear
                  />
                  
                  <Button
                    type="default"
                    onClick={handleResetFilters}
                    style={{ borderRadius: 8 }}
                  >
                    Đặt lại bộ lọc
                  </Button>
                </div>

                {isEquipmentLoading ? (
                  <div className="text-center py-12 text-slate-400 font-medium">Đang tải trạng thái thiết bị...</div>
                ) : allEquipment.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 font-medium bg-white rounded-xl border border-slate-100">Không tìm thấy thiết bị nào.</div>
                ) : (
                  <Row gutter={[20, 20]}>
                    {allEquipment.map((eq: EquipmentResponse) => {
                      const cfg = getStatusConfig(eq.status);
                      return (
                        <Col xs={24} sm={12} md={8} lg={6} key={eq.id}>
                          <Card 
                            className={`border transition-all duration-300 rounded-2xl bg-white overflow-hidden ${cfg.glowClass}`}
                            bodyStyle={{ padding: '20px' }}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <span className="text-xs font-bold text-slate-400 tracking-wider block mb-1 uppercase">
                                  {eq.type === 'WASHING_MACHINE' ? '🧼 MÁY GIẶT' : '💨 MÁY SẤY'}
                                </span>
                                <h3 className="text-lg font-bold text-slate-800 leading-tight">
                                  {eq.name}
                                </h3>
                                <span className="text-xs font-semibold text-indigo-500 mt-1 inline-block">
                                  {eq.code}
                                </span>
                              </div>
                              <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-lg ${eq.status === 'RUNNING' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                                {eq.type === 'WASHING_MACHINE' ? '🧼' : '💨'}
                              </span>
                            </div>

                            <div className="my-4 pt-2 border-t border-slate-100">
                              <div className="flex justify-between items-center text-sm mb-2">
                                <span className="text-slate-500 font-medium">Công suất:</span>
                                <span className="font-bold text-slate-800">{eq.capacity} kg</span>
                              </div>
                              {eq.status === 'RUNNING' ? (
                                <div>
                                  <div className="flex justify-between text-xs text-indigo-600 font-bold mb-1">
                                    <span>Đang vắt/sấy...</span>
                                    <span>65%</span>
                                  </div>
                                  <Progress percent={65} size="small" strokeColor={{ '0%': '#6366f1', '100%': '#8b5cf6' }} showInfo={false} />
                                </div>
                              ) : (
                                <div className="text-xs text-slate-400 font-semibold py-1">
                                  {eq.status === 'IDLE' ? 'Sẵn sàng tiếp nhận đồ mới' : eq.status === 'MAINTENANCE' ? 'Đang thực hiện kiểm tra định kỳ' : 'Đang tạm dừng hoạt động'}
                                </div>
                              )}
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                              <span className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${cfg.dotColor}`} />
                                <span className="text-xs font-bold text-slate-600 uppercase">{cfg.text}</span>
                              </span>

                              {hasPermission('PUT:/api/equipment/{id}') && (
                                <Select 
                                  value={eq.status}
                                  size="small"
                                  style={{ width: 110 }}
                                  bordered={false}
                                  onChange={(val) => handleStatusChange(eq, val)}
                                  className="text-xs font-bold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100/50 rounded-md"
                                  dropdownMatchSelectWidth={false}
                                >
                                  <Select.Option value="IDLE">🟢 Rảnh</Select.Option>
                                  <Select.Option value="RUNNING">🌀 Chạy</Select.Option>
                                  <Select.Option value="MAINTENANCE">🛠️ Bảo trì</Select.Option>
                                  <Select.Option value="OUT_OF_SERVICE">⚠️ Hỏng</Select.Option>
                                </Select>
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
          },
          {
            key: 'list',
            label: <span className="text-base px-2 font-medium"><UnorderedListOutlined /> Thiết lập & Quản lý danh mục</span>,
            children: (
              <div className="space-y-4 mt-4">
                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-xs border border-slate-100">
                  <Space size="middle">
                    <Input
                      placeholder="Tìm kiếm máy..."
                      prefix={<SearchOutlined className="text-gray-400" />}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ width: 250, borderRadius: 8 }}
                      allowClear
                    />
                    <Select 
                      placeholder="Chọn loại máy..." 
                      allowClear 
                      value={typeFilter}
                      onChange={setTypeFilter}
                      style={{ width: 160 }}
                    >
                      <Select.Option value="WASHING_MACHINE">Máy Giặt</Select.Option>
                      <Select.Option value="DRYER">Máy Sấy</Select.Option>
                    </Select>
                    <Button
                      type="default"
                      onClick={handleResetFilters}
                      style={{ borderRadius: 8 }}
                    >
                      Đặt lại bộ lọc
                    </Button>
                  </Space>
                  {hasPermission('POST:/api/equipment') && (
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />} 
                      onClick={handleOpenCreate}
                      style={{ borderRadius: 8, height: 38 }}
                    >
                      Thêm máy mới
                    </Button>
                  )}
                </div>

                <Table 
                  columns={columns} 
                  dataSource={equipmentData?.content || []} 
                  rowKey="id"
                  loading={isEquipmentLoading}
                  pagination={{
                    total: equipmentData?.totalElements || 0,
                    pageSize: equipmentData?.size || 20,
                    current: (equipmentData?.page || 0) + 1,
                    showSizeChanger: false,
                  }}
                  className="shadow-xs rounded-xl overflow-hidden border border-slate-100 bg-white"
                />
              </div>
            )
          }
        ]}
      />

      {/* Add Equipment Modal */}
      <Modal
        title="Thêm mới Thiết bị Máy móc"
        open={isCreateModalOpen}
        onOk={handleCreateSubmit}
        onCancel={handleCancelCreate}
        okText="Tạo mới"
        cancelText="Hủy"
        confirmLoading={createMutation.isPending}
      >
        <Form form={createForm} layout="vertical" className="mt-4" initialValues={{ type: 'WASHING_MACHINE', status: 'IDLE' }}>
          <Form.Item
            name="code"
            label="Mã máy"
            rules={[
              { required: true, message: 'Vui lòng nhập mã máy' },
              { max: 50, message: 'Mã không quá 50 ký tự' }
            ]}
          >
            <Input placeholder="Ví dụ: WASH_05" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên máy"
            rules={[
              { required: true, message: 'Vui lòng nhập tên máy' },
              { max: 200, message: 'Tên không quá 200 ký tự' }
            ]}
          >
            <Input placeholder="Ví dụ: Máy giặt Electrolux 11kg C" style={{ borderRadius: 8 }} />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="type"
              label="Loại máy"
              rules={[{ required: true, message: 'Vui lòng chọn loại máy' }]}
            >
              <Select style={{ borderRadius: 8 }}>
                <Select.Option value="WASHING_MACHINE">Máy Giặt (WASHING_MACHINE)</Select.Option>
                <Select.Option value="DRYER">Máy Sấy (DRYER)</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="capacity"
              label="Công suất chứa đồ (KG)"
              rules={[{ required: true, message: 'Vui lòng nhập công suất' }]}
            >
              <InputNumber
                min={1}
                max={100}
                step={0.5}
                style={{ width: '100%', borderRadius: 8 }}
                placeholder="11"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="status"
            label="Trạng thái khởi tạo"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select style={{ borderRadius: 8 }}>
              <Select.Option value="IDLE">🟢 Sẵn sàng hoạt động (IDLE)</Select.Option>
              <Select.Option value="MAINTENANCE">🛠️ Bảo trì kỹ thuật (MAINTENANCE)</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Equipment Modal */}
      <Modal
        title="Cập nhật thông tin Thiết bị"
        open={isEditModalOpen}
        onOk={handleEditSubmit}
        onCancel={handleCancelEdit}
        okText="Cập nhật"
        cancelText="Hủy"
        confirmLoading={updateMutation.isPending}
      >
        <Form form={editForm} layout="vertical" className="mt-4">
          <Form.Item
            name="code"
            label="Mã máy"
            rules={[
              { required: true, message: 'Vui lòng nhập mã máy' },
              { max: 50, message: 'Mã không quá 50 ký tự' }
            ]}
          >
            <Input placeholder="Ví dụ: WASH_05" style={{ borderRadius: 8 }} disabled />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên máy"
            rules={[
              { required: true, message: 'Vui lòng nhập tên máy' },
              { max: 200, message: 'Tên không quá 200 ký tự' }
            ]}
          >
            <Input placeholder="Ví dụ: Máy giặt Electrolux 11kg C" style={{ borderRadius: 8 }} />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="type"
              label="Loại máy"
              rules={[{ required: true, message: 'Vui lòng chọn loại máy' }]}
            >
              <Select style={{ borderRadius: 8 }}>
                <Select.Option value="WASHING_MACHINE">Máy Giặt</Select.Option>
                <Select.Option value="DRYER">Máy Sấy</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="capacity"
              label="Công suất chứa đồ (KG)"
              rules={[{ required: true, message: 'Vui lòng nhập công suất' }]}
            >
              <InputNumber
                min={1}
                max={100}
                step={0.5}
                style={{ width: '100%', borderRadius: 8 }}
                placeholder="11"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select style={{ borderRadius: 8 }}>
              <Select.Option value="IDLE">🟢 Sẵn sàng hoạt động (IDLE)</Select.Option>
              <Select.Option value="RUNNING">🌀 Đang chạy dịch vụ (RUNNING)</Select.Option>
              <Select.Option value="MAINTENANCE">🛠️ Bảo trì định kỳ (MAINTENANCE)</Select.Option>
              <Select.Option value="OUT_OF_SERVICE">⚠️ Hỏng hóc / Khóa (OUT_OF_SERVICE)</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default EquipmentPage;

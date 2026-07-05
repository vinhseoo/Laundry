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
  InputNumber
} from 'antd';
import type { TableColumnsType } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined
} from '@ant-design/icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { serviceService } from '@/services/serviceService';
import { useAuthStore } from '@/stores/authStore';
import type { ServiceResponse, ServiceRequest } from '@/types';
import { PageContainer } from '@/components/layout/PageContainer';
import dayjs from 'dayjs';

export const ServicesPage = () => {
  const { hasPermission } = useAuthStore();
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [selectedService, setSelectedService] = useState<ServiceResponse | null>(null);
  
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Fetch Services
  const { data: servicesData, isLoading: isServicesLoading, refetch: refetchServices } = useQuery({
    queryKey: ['services', search],
    queryFn: async () => {
      const response = await serviceService.getAll({ search });
      return response.data;
    }
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: serviceService.create,
    onSuccess: () => {
      message.success('Thêm dịch vụ thành công');
      refetchServices();
      handleCancelCreate();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ServiceRequest }) => serviceService.update(id, data),
    onSuccess: () => {
      message.success('Cập nhật dịch vụ thành công');
      refetchServices();
      handleCancelEdit();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: serviceService.delete,
    onSuccess: () => {
      message.success('Vô hiệu hóa dịch vụ thành công');
      refetchServices();
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

  const handleOpenEdit = (service: ServiceResponse) => {
    setSelectedService(service);
    editForm.setFieldsValue({
      code: service.code,
      name: service.name,
      description: service.description,
      price: service.price,
      priceUnit: service.priceUnit,
    });
    setIsEditModalOpen(true);
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setSelectedService(null);
    editForm.resetFields();
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      createMutation.mutate(values as ServiceRequest);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditSubmit = async () => {
    try {
      if (!selectedService) return;
      const values = await editForm.validateFields();
      updateMutation.mutate({ id: selectedService.id, data: values as ServiceRequest });
    } catch (error) {
      console.error(error);
    }
  };

  const columns: TableColumnsType<ServiceResponse> = [
    {
      title: 'Mã dịch vụ',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <span className="font-semibold text-indigo-600">{code}</span>,
    },
    {
      title: 'Tên dịch vụ',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span className="font-semibold text-gray-800">{name}</span>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => text || <span className="text-gray-400">Không có mô tả</span>,
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => (
        <span className="font-bold text-slate-800">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
        </span>
      ),
    },
    {
      title: 'Đơn vị tính',
      dataIndex: 'priceUnit',
      key: 'priceUnit',
      render: (priceUnit: string) => (
        <Tag color={priceUnit === 'KG' ? 'purple' : 'cyan'} style={{ borderRadius: 6, fontWeight: 600 }}>
          {priceUnit === 'KG' ? 'Theo cân (KG)' : 'Theo chiếc (ITEM)'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
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

  const canEdit = hasPermission('PUT:/api/services/{id}');
  const canDelete = hasPermission('DELETE:/api/services/{id}');

  if (canEdit || canDelete) {
    columns.push({
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: ServiceResponse) => (
        <Space size="middle">
          {canEdit && (
            <Tooltip title="Chỉnh sửa">
              <Button 
                type="text" 
                icon={<EditOutlined style={{ color: '#6366f1' }} />} 
                onClick={() => handleOpenEdit(record)} 
              />
            </Tooltip>
          )}
          {record.isActive && canDelete && (
            <Popconfirm
              title="Bạn muốn vô hiệu hóa dịch vụ này?"
              description="Dịch vụ sẽ bị ẩn hoặc không thể chọn trong đơn hàng mới."
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

  return (
    <PageContainer title="Bảng Giá Dịch Vụ">
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-xs border border-slate-100">
          <Input
            placeholder="Tìm kiếm dịch vụ..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 300, borderRadius: 8 }}
            allowClear
          />
          {hasPermission('POST:/api/services') && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleOpenCreate}
              style={{ borderRadius: 8, height: 38 }}
            >
              Thêm dịch vụ
            </Button>
          )}
        </div>

        <Table 
          columns={columns} 
          dataSource={servicesData?.content || []} 
          rowKey="id"
          loading={isServicesLoading}
          pagination={{
            total: servicesData?.totalElements || 0,
            pageSize: servicesData?.size || 20,
            current: (servicesData?.page || 0) + 1,
            showSizeChanger: false,
          }}
          className="shadow-xs rounded-xl overflow-hidden border border-slate-100 bg-white"
        />

        {/* Add Service Modal */}
        <Modal
          title="Thêm mới Dịch vụ Giặt sấy / Giặt khô"
          open={isCreateModalOpen}
          onOk={handleCreateSubmit}
          onCancel={handleCancelCreate}
          okText="Tạo mới"
          cancelText="Hủy"
          confirmLoading={createMutation.isPending}
        >
          <Form form={createForm} layout="vertical" className="mt-4" initialValues={{ priceUnit: 'KG' }}>
            <Form.Item
              name="code"
              label="Mã dịch vụ"
              rules={[
                { required: true, message: 'Vui lòng nhập mã dịch vụ' },
                { max: 50, message: 'Mã không quá 50 ký tự' }
              ]}
            >
              <Input placeholder="Ví dụ: GIAT_SAY_NHANH" style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item
              name="name"
              label="Tên dịch vụ"
              rules={[
                { required: true, message: 'Vui lòng nhập tên dịch vụ' },
                { max: 200, message: 'Tên không quá 200 ký tự' }
              ]}
            >
              <Input placeholder="Ví dụ: Giặt sấy lấy ngay" style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả dịch vụ"
            >
              <Input.TextArea rows={3} placeholder="Mô tả ngắn gọn về quy trình, cam kết chất lượng..." style={{ borderRadius: 8 }} />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="price"
                label="Đơn giá (VND)"
                rules={[{ required: true, message: 'Vui lòng nhập đơn giá' }]}
              >
                <InputNumber
                  min={0}
                  step={1000}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => (value ? parseFloat(value.replace(/\$\s?|(,*)/g, '')) : 0) as any}
                  style={{ width: '100%', borderRadius: 8 }}
                  placeholder="20,000"
                />
              </Form.Item>

              <Form.Item
                name="priceUnit"
                label="Đơn vị tính"
                rules={[{ required: true, message: 'Vui lòng chọn đơn vị tính' }]}
              >
                <Select style={{ borderRadius: 8 }}>
                  <Select.Option value="KG">Theo cân nặng (KG)</Select.Option>
                  <Select.Option value="ITEM">Theo chiếc/món (ITEM)</Select.Option>
                </Select>
              </Form.Item>
            </div>
          </Form>
        </Modal>

        {/* Edit Service Modal */}
        <Modal
          title="Cập nhật Dịch vụ"
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
              label="Mã dịch vụ"
              rules={[
                { required: true, message: 'Vui lòng nhập mã dịch vụ' },
                { max: 50, message: 'Mã không quá 50 ký tự' }
              ]}
            >
              <Input placeholder="Ví dụ: GIAT_SAY_NHANH" style={{ borderRadius: 8 }} disabled />
            </Form.Item>

            <Form.Item
              name="name"
              label="Tên dịch vụ"
              rules={[
                { required: true, message: 'Vui lòng nhập tên dịch vụ' },
                { max: 200, message: 'Tên không quá 200 ký tự' }
              ]}
            >
              <Input placeholder="Ví dụ: Giặt sấy lấy ngay" style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả dịch vụ"
            >
              <Input.TextArea rows={3} placeholder="Mô tả ngắn gọn..." style={{ borderRadius: 8 }} />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="price"
                label="Đơn giá (VND)"
                rules={[{ required: true, message: 'Vui lòng nhập đơn giá' }]}
              >
                <InputNumber
                  min={0}
                  step={1000}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => (value ? parseFloat(value.replace(/\$\s?|(,*)/g, '')) : 0) as any}
                  style={{ width: '100%', borderRadius: 8 }}
                  placeholder="20,000"
                />
              </Form.Item>

              <Form.Item
                name="priceUnit"
                label="Đơn vị tính"
                rules={[{ required: true, message: 'Vui lòng chọn đơn vị tính' }]}
              >
                <Select style={{ borderRadius: 8 }}>
                  <Select.Option value="KG">Theo cân nặng (KG)</Select.Option>
                  <Select.Option value="ITEM">Theo chiếc/món (ITEM)</Select.Option>
                </Select>
              </Form.Item>
            </div>
          </Form>
        </Modal>
      </div>
    </PageContainer>
  );
};

export default ServicesPage;

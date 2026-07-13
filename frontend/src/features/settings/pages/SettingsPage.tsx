import { useState, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import {
  Tabs,
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  message,
  Descriptions,
  Spin,
  Alert,
} from 'antd';
import {
  ShopOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/settingsService';
import { PageContainer } from '@/components/layout/PageContainer';
import type { SystemSettingResponse, SystemSettingRequest } from '@/types';

export const SettingsPage: FC = () => {
  const [activeTab, setActiveTab] = useState('STORE_INFO');
  const queryClient = useQueryClient();

  // ---- Queries ----
  const { data: allSettings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await settingsService.getAll();
      return res.data;
    },
  });

  // ---- Mutation ----
  const updateMutation = useMutation({
    mutationFn: (data: SystemSettingRequest[]) => settingsService.updateSettings(data),
    onSuccess: () => {
      message.success('Cập nhật cấu hình thành công!');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: () => {
      message.error('Cập nhật thất bại. Vui lòng thử lại.');
    },
  });

  // ---- Helpers ----
  const getSettingValue = useCallback(
    (key: string): string => {
      const found = allSettings?.find((s: SystemSettingResponse) => s.settingKey === key);
      return found?.settingValue ?? '';
    },
    [allSettings],
  );

  const getSettingsByGroup = useCallback(
    (group: string): SystemSettingResponse[] => {
      return allSettings?.filter((s: SystemSettingResponse) => s.groupName === group) ?? [];
    },
    [allSettings],
  );

  // ---- Tab content components ----
  const StoreInfoTab = () => {
    const [form] = Form.useForm();

    useEffect(() => {
      form.setFieldsValue({
        store_name: getSettingValue('store_name'),
        store_phone: getSettingValue('store_phone'),
        store_address: getSettingValue('store_address'),
      });
    }, [form]);

    const handleSave = () => {
      form.validateFields().then((values) => {
        const payload: SystemSettingRequest[] = Object.entries(values).map(([key, val]) => ({
          settingKey: key,
          settingValue: String(val),
        }));
        updateMutation.mutate(payload);
      });
    };

    return (
      <Card className="rounded-xl border border-slate-100 shadow-xs">
        <Form form={form} layout="vertical" className="max-w-lg">
          <Form.Item
            name="store_name"
            label={<span className="font-semibold text-slate-700">Tên cửa hàng</span>}
            rules={[{ required: true, message: 'Vui lòng nhập tên cửa hàng' }]}
          >
            <Input placeholder="Ví dụ: BubbleFlow Premium Laundry" size="large" />
          </Form.Item>
          <Form.Item
            name="store_phone"
            label={<span className="font-semibold text-slate-700">Số điện thoại liên hệ</span>}
            rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}
          >
            <Input placeholder="Ví dụ: 0987654321" size="large" />
          </Form.Item>
          <Form.Item
            name="store_address"
            label={<span className="font-semibold text-slate-700">Địa chỉ cửa hàng</span>}
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input.TextArea rows={3} placeholder="Ví dụ: 123 Đường Láng, Đống Đa, Hà Nội" />
          </Form.Item>

          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={updateMutation.isPending}
            size="large"
            className="bg-indigo-500 hover:bg-indigo-600 border-none"
          >
            Lưu thay đổi
          </Button>
        </Form>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <Descriptions title="Thông tin hiện tại" bordered size="small" column={1}>
            {getSettingsByGroup('STORE_INFO').map((s) => (
              <Descriptions.Item key={s.settingKey} label={s.description}>
                <span className="font-medium text-slate-700">{s.settingValue}</span>
              </Descriptions.Item>
            ))}
          </Descriptions>
        </div>
      </Card>
    );
  };

  const SlaConfigTab = () => {
    const [form] = Form.useForm();

    useEffect(() => {
      form.setFieldsValue({
        sla_received_sorting: Number(getSettingValue('sla_received_sorting')) || 120,
        sla_washing_drying: Number(getSettingValue('sla_washing_drying')) || 60,
        sla_awaiting_delivery: Number(getSettingValue('sla_awaiting_delivery')) || 1440,
      });
    }, [form]);

    const handleSave = () => {
      form.validateFields().then((values) => {
        const payload: SystemSettingRequest[] = Object.entries(values).map(([key, val]) => ({
          settingKey: key,
          settingValue: String(val),
        }));
        updateMutation.mutate(payload);
      });
    };

    return (
      <Card className="rounded-xl border border-slate-100 shadow-xs">
        <Alert
          className="mb-6"
          type="info"
          showIcon
          message="Cấu hình SLA (Service Level Agreement)"
          description="Các ngưỡng thời gian tối đa (phút) cho mỗi trạng thái đơn hàng. Khi vượt ngưỡng, đơn hàng sẽ hiển thị cảnh báo trễ SLA trên Dashboard và trang quản lý đơn hàng."
        />

        <Form form={form} layout="vertical" className="max-w-lg">
          <Form.Item
            name="sla_received_sorting"
            label={<span className="font-semibold text-slate-700">SLA Tiếp nhận & Phân loại (phút)</span>}
            rules={[{ required: true, message: 'Vui lòng nhập số phút' }]}
            extra="Thời gian tối đa cho trạng thái RECEIVED / SORTING"
          >
            <InputNumber
              min={1}
              max={9999}
              size="large"
              className="w-full"
              addonAfter="phút"
            />
          </Form.Item>
          <Form.Item
            name="sla_washing_drying"
            label={<span className="font-semibold text-slate-700">SLA Giặt & Sấy (phút)</span>}
            rules={[{ required: true, message: 'Vui lòng nhập số phút' }]}
            extra="Thời gian tối đa cho trạng thái WASHING / DRYING"
          >
            <InputNumber
              min={1}
              max={9999}
              size="large"
              className="w-full"
              addonAfter="phút"
            />
          </Form.Item>
          <Form.Item
            name="sla_awaiting_delivery"
            label={<span className="font-semibold text-slate-700">SLA Chờ giao nhận (phút)</span>}
            rules={[{ required: true, message: 'Vui lòng nhập số phút' }]}
            extra="Thời gian tối đa cho trạng thái AWAITING_DELIVERY"
          >
            <InputNumber
              min={1}
              max={99999}
              size="large"
              className="w-full"
              addonAfter="phút"
            />
          </Form.Item>

          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={updateMutation.isPending}
            size="large"
            className="bg-indigo-500 hover:bg-indigo-600 border-none"
          >
            Lưu thay đổi
          </Button>
        </Form>
      </Card>
    );
  };

  const FinancialConfigTab = () => {
    const [form] = Form.useForm();

    useEffect(() => {
      form.setFieldsValue({
        vat_rate: Number(getSettingValue('vat_rate')) || 8,
      });
    }, [form]);

    const handleSave = () => {
      form.validateFields().then((values) => {
        const payload: SystemSettingRequest[] = Object.entries(values).map(([key, val]) => ({
          settingKey: key,
          settingValue: String(val),
        }));
        updateMutation.mutate(payload);
      });
    };

    return (
      <Card className="rounded-xl border border-slate-100 shadow-xs">
        <Form form={form} layout="vertical" className="max-w-lg">
          <Form.Item
            name="vat_rate"
            label={<span className="font-semibold text-slate-700">Thuế VAT (%)</span>}
            rules={[{ required: true, message: 'Vui lòng nhập phần trăm thuế' }]}
            extra="Thuế giá trị gia tăng áp dụng cho đơn hàng"
          >
            <InputNumber
              min={0}
              max={100}
              size="large"
              className="w-full"
              addonAfter="%"
            />
          </Form.Item>

          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={updateMutation.isPending}
            size="large"
            className="bg-indigo-500 hover:bg-indigo-600 border-none"
          >
            Lưu thay đổi
          </Button>
        </Form>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <PageContainer title="Cấu hình chung">
        <div className="flex justify-center items-center py-20">
          <Spin size="large" tip="Đang tải cấu hình hệ thống..." />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Cấu hình chung">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        className="premium-tabs"
        items={[
          {
            key: 'STORE_INFO',
            label: (
              <span className="flex items-center gap-2 px-2 py-1 font-medium">
                <ShopOutlined /> Thông tin Cửa hàng
              </span>
            ),
            children: <StoreInfoTab />,
          },
          {
            key: 'SLA',
            label: (
              <span className="flex items-center gap-2 px-2 py-1 font-medium">
                <ClockCircleOutlined /> Cấu hình SLA
              </span>
            ),
            children: <SlaConfigTab />,
          },
          {
            key: 'FINANCIAL',
            label: (
              <span className="flex items-center gap-2 px-2 py-1 font-medium">
                <DollarOutlined /> Cấu hình Tài chính
              </span>
            ),
            children: <FinancialConfigTab />,
          },
        ]}
      />
    </PageContainer>
  );
};

export default SettingsPage;

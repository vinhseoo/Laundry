import { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Select, 
  InputNumber, 
  Divider, 
  Modal, 
  message, 
  Typography,
  AutoComplete 
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  FileTextOutlined, 
  PrinterOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { serviceService } from '@/services/serviceService';
import { orderService } from '@/services/orderService';
import { customerService } from '@/services/customerService';
import { settingsService } from '@/services/settingsService';
import { PageContainer } from '@/components/layout/PageContainer';
import type { ServiceResponse, OrderRequest, OrderResponse } from '@/types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const OrderIntakePage = () => {
  const [form] = Form.useForm();
  const [createdOrder, setCreatedOrder] = useState<OrderResponse | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);

  // Fetch Services for selection
  const { data: servicesData, isLoading: isServicesLoading } = useQuery({
    queryKey: ['services', 'active-only'],
    queryFn: async () => {
      const response = await serviceService.getAll({ size: 100 });
      return response.data.content.filter(s => s.isActive);
    }
  });

  const services: ServiceResponse[] = servicesData || [];

  // Fetch System Settings
  const { data: settingsData } = useQuery({
    queryKey: ['settings', 'all'],
    queryFn: async () => {
      const response = await settingsService.getAll();
      return response.data;
    }
  });

  const storeName = settingsData?.find(s => s.settingKey === 'store_name')?.settingValue || 'BubbleFlow Premium Laundry';
  const storeAddress = settingsData?.find(s => s.settingKey === 'store_address')?.settingValue || '123 Đường Láng, Đống Đa, Hà Nội';
  const storePhone = settingsData?.find(s => s.settingKey === 'store_phone')?.settingValue || '0987654321';
  const vatRateStr = settingsData?.find(s => s.settingKey === 'vat_rate')?.settingValue || '8';
  const vatRate = parseFloat(vatRateStr) || 0;

  // Search Customer suggestion
  const handlePhoneSearch = async (value: string) => {
    if (value && value.length >= 3) {
      try {
        const response = await customerService.search(value);
        setCustomerSuggestions(response.data || []);
      } catch (e) {
        console.error(e);
      }
    } else {
      setCustomerSuggestions([]);
    }
  };

  // Create Order Mutation
  const createOrderMutation = useMutation({
    mutationFn: orderService.create,
    onSuccess: (response) => {
      message.success('Tạo đơn hàng tiếp nhận thành công!');
      setCreatedOrder(response.data);
      setIsReceiptOpen(true);
      form.resetFields();
      setCustomerSuggestions([]);
    }
  });

  // Calculate live total price
  const [itemsList, setItemsList] = useState<Array<{ serviceId?: number; quantity?: number }>>([{}]);

  const handleValuesChange = (_: any, allValues: any) => {
    if (allValues.items) {
      setItemsList(allValues.items);
    }
  };

  const calculateSubtotal = () => {
    let subtotal = 0;
    if (itemsList && Array.isArray(itemsList)) {
      itemsList.forEach((item) => {
        if (item && item.serviceId && item.quantity) {
          const service = services.find(s => s.id === item.serviceId);
          if (service) {
            subtotal += service.price * item.quantity;
          }
        }
      });
    }
    return subtotal;
  };

  const calculateVat = () => {
    return calculateSubtotal() * (vatRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVat();
  };

  const handleCreateSubmit = async (values: any) => {
    try {
      const formattedItems = values.items.map((item: any) => ({
        serviceId: item.serviceId,
        quantity: item.quantity,
        notes: item.notes || ''
      }));

      const requestPayload: OrderRequest = {
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        notes: values.notes || '',
        items: formattedItems
      };

      createOrderMutation.mutate(requestPayload);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('receipt-print-area')?.innerHTML;
    if (printContent) {
      const winPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
      if (winPrint) {
        winPrint.document.write(`
          <html>
            <head>
              <title>In Biên Nhận - BubbleFlow</title>
              <style>
                body { font-family: 'Courier New', Courier, monospace; padding: 20px; color: #000; }
                .receipt { width: 300px; margin: 0 auto; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .bold { font-weight: bold; }
                .divider { border-top: 1px dashed #000; margin: 10px 0; }
                table { width: 100%; border-collapse: collapse; }
                td { padding: 4px 0; vertical-align: top; }
              </style>
            </head>
            <body onload="window.print();window.close()">
              <div class="receipt">
                ${printContent}
              </div>
            </body>
          </html>
        `);
        winPrint.document.close();
      }
    }
  };

  return (
    <PageContainer title="Tiếp Nhận Đơn Hàng Mới">
      <div className="max-w-6xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateSubmit}
          onValuesChange={handleValuesChange}
          initialValues={{ items: [{}] }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Customer info */}
          <div className="lg:col-span-1 space-y-6">
            <Card 
              title={<span className="font-bold text-slate-800 dark:text-slate-200"><FileTextOutlined className="mr-2 text-indigo-500" /> Thông tin khách hàng</span>}
              className="shadow-sm rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors"
            >
              <Form.Item
                name="customerPhone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại' },
                  { pattern: /^[0-9+()#&.\s-]{9,15}$/, message: 'Số điện thoại không hợp lệ' }
                ]}
              >
                <AutoComplete
                  options={customerSuggestions.map(c => ({ value: c.phone, label: `${c.phone} - ${c.name}`, customer: c }))}
                  onSearch={handlePhoneSearch}
                  onSelect={(_, option) => {
                    form.setFieldsValue({
                      customerName: option.customer.name
                    });
                  }}
                  placeholder="Nhập hoặc tìm số điện thoại..."
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item
                name="customerName"
                label="Tên khách hàng"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên khách hàng' },
                  { max: 150, message: 'Tên không quá 150 ký tự' }
                ]}
              >
                <Input placeholder="Nguyễn Văn A" style={{ borderRadius: 8 }} />
              </Form.Item>

              <Form.Item
                name="notes"
                label="Ghi chú đơn hàng"
              >
                <Input.TextArea rows={3} placeholder="Yêu cầu giặt riêng, giao giờ hành chính..." style={{ borderRadius: 8 }} />
              </Form.Item>
            </Card>

            {/* Price calculation block */}
            <Card 
              className="shadow-md rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-0"
              bodyStyle={{ padding: '24px' }}
            >
              <div className="space-y-2 mb-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tạm tính:</span>
                  <span className="font-mono">{new Intl.NumberFormat('vi-VN').format(calculateSubtotal())}đ</span>
                </div>
                {vatRate > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Thuế VAT ({vatRate}%):</span>
                    <span className="font-mono">{new Intl.NumberFormat('vi-VN').format(calculateVat())}đ</span>
                  </div>
                )}
              </div>
              <Divider className="border-slate-800 my-2" />
              <Text className="text-slate-300 font-medium block text-xs tracking-wider uppercase mb-1">
                Tổng thanh toán (gồm VAT)
              </Text>
              <Title level={2} className="text-white !m-0 !font-extrabold flex items-baseline gap-1">
                <span className="text-xl">VND</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-indigo-100 font-mono">
                  {new Intl.NumberFormat('vi-VN').format(calculateTotal())}
                </span>
              </Title>
              <Divider className="border-slate-800 my-4" />
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={createOrderMutation.isPending}
                style={{
                  borderRadius: 12,
                  height: 48,
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  border: 'none',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
                }}
              >
                Tạo Đơn Hàng & In Biên Nhận
              </Button>
            </Card>
          </div>

          {/* Service items */}
          <div className="lg:col-span-2">
            <Card 
              title={
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Dịch vụ giặt là chi tiết</span>
                  <span className="text-xs text-indigo-500 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-800/40 transition-colors">
                    {itemsList.length} Dịch vụ
                  </span>
                </div>
              }
              className="shadow-sm rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors"
            >
              <Form.List name="items">
                {(fields, { add, remove }) => (
                  <div className="space-y-4">
                    {fields.map(({ key, name, ...restField }) => {
                      const currentServiceId = form.getFieldValue(['items', name, 'serviceId']);
                      const selectedService = services.find(s => s.id === currentServiceId);
                      const unitText = selectedService ? (selectedService.priceUnit === 'KG' ? 'KG' : 'Món') : 'Đơn vị';

                      return (
                        <div 
                          key={key} 
                          className="p-4 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-950/60 transition-colors border border-slate-100 dark:border-slate-800 rounded-xl relative pt-6 md:pt-4"
                        >
                          {/* Close button on top-right for mobile */}
                          {fields.length > 1 && (
                            <Button 
                              type="text" 
                              danger 
                              icon={<DeleteOutlined />} 
                              onClick={() => remove(name)}
                              className="absolute top-2 right-2 md:hidden z-10"
                            />
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                            <Form.Item
                              {...restField}
                              name={[name, 'serviceId']}
                              rules={[{ required: true, message: 'Chọn dịch vụ' }]}
                              className="md:col-span-5 !mb-0"
                              label={<span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Dịch vụ</span>}
                            >
                              <Select 
                                placeholder="Chọn gói dịch vụ..." 
                                loading={isServicesLoading}
                                style={{ borderRadius: 8 }}
                                onChange={() => {
                                  // Trigger validation/calc update
                                  form.setFieldsValue({
                                    items: form.getFieldValue('items')
                                  });
                                }}
                              >
                                {services.map(s => (
                                  <Select.Option key={s.id} value={s.id}>
                                    {s.name} ({new Intl.NumberFormat('vi-VN').format(s.price)}đ/{s.priceUnit})
                                  </Select.Option>
                                ))}
                              </Select>
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, 'quantity']}
                              rules={[{ required: true, message: 'Nhập số lượng' }]}
                              className="md:col-span-3 !mb-0"
                              label={<span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Số lượng ({unitText})</span>}
                            >
                              <InputNumber 
                                min={0.1} 
                                step={selectedService?.priceUnit === 'KG' ? 0.1 : 1}
                                placeholder="1.0"
                                style={{ width: '100%', borderRadius: 8 }} 
                              />
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, 'notes']}
                              className="md:col-span-3 !mb-0"
                              label={<span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Lưu ý riêng</span>}
                            >
                              <Input placeholder="Bị rách, lem màu..." style={{ borderRadius: 8 }} />
                            </Form.Item>

                            {fields.length > 1 && (
                              <div className="md:col-span-1 hidden md:flex items-end justify-center pb-1">
                                <Button 
                                  type="text" 
                                  danger 
                                  icon={<DeleteOutlined />} 
                                  onClick={() => remove(name)}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    <Button 
                      type="dashed" 
                      onClick={() => add()} 
                      block 
                      icon={<PlusOutlined />}
                      style={{ borderRadius: 8, height: 40 }}
                    >
                      Thêm dịch vụ khác
                    </Button>
                  </div>
                )}
              </Form.List>
            </Card>
          </div>
        </Form>
      </div>

      {/* Modern Thermal Receipt Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <CheckCircleOutlined className="text-emerald-500 text-xl" />
            <span className="font-bold text-slate-800 dark:text-slate-200">Biên Nhận Đơn Hàng</span>
          </div>
        }
        open={isReceiptOpen}
        onCancel={() => setIsReceiptOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsReceiptOpen(false)} style={{ borderRadius: 8 }}>
            Đóng
          </Button>,
          <Button 
            key="print" 
            type="primary" 
            icon={<PrinterOutlined />} 
            onClick={handlePrint}
            style={{ borderRadius: 8, background: '#10b981', borderColor: '#10b981' }}
          >
            In Biên Nhận
          </Button>
        ]}
        bodyStyle={{ padding: '24px 0' }}
        width={400}
      >
        <div 
          id="receipt-print-area" 
          className="mx-auto p-6 bg-slate-50 border border-slate-200 rounded-xl"
          style={{ fontFamily: 'monospace', color: '#333' }}
        >
          {createdOrder && (
            <div className="space-y-4">
              <div className="text-center">
                <Title level={4} className="!m-0 !font-extrabold tracking-wider" style={{ fontFamily: 'monospace' }}>
                  🧼 {storeName.toUpperCase()}
                </Title>
                <Text className="text-xs text-slate-500 block mt-1" style={{ fontFamily: 'monospace' }}>
                  {storeAddress}
                </Text>
                <Text className="text-xs text-slate-500 block" style={{ fontFamily: 'monospace' }}>
                  Hotline: {storePhone}
                </Text>
              </div>

              <div style={{ borderTop: '1px dashed #cbd5e1', margin: '12px 0' }} />

              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã hóa đơn:</span>
                  <span className="font-bold">{createdOrder.orderCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ngày lập:</span>
                  <span>{dayjs(createdOrder.createdAt).format('DD/MM/YYYY HH:mm')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Khách hàng:</span>
                  <span className="font-bold">{createdOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số ĐT:</span>
                  <span>{createdOrder.customerPhone}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed #cbd5e1', margin: '12px 0' }} />

              <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr className="border-b border-slate-200 text-left font-bold text-slate-600">
                    <th className="pb-1">Dịch vụ</th>
                    <th className="pb-1 text-center">SL</th>
                    <th className="pb-1 text-right">Đ.Giá</th>
                    <th className="pb-1 text-right">T.Tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {createdOrder.items.map(item => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="py-1.5 max-w-[150px] truncate">
                        <div>{item.serviceName}</div>
                        {item.notes && <div className="text-[10px] text-red-500 font-semibold italic">Lưu ý: {item.notes}</div>}
                      </td>
                      <td className="py-1.5 text-center">{item.quantity}</td>
                      <td className="py-1.5 text-right">{new Intl.NumberFormat('vi-VN').format(item.unitPrice)}đ</td>
                      <td className="py-1.5 text-right font-bold">{new Intl.NumberFormat('vi-VN').format(item.subtotal)}đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ borderTop: '1px dashed #cbd5e1', margin: '12px 0' }} />

              <div className="text-xs space-y-1" style={{ fontFamily: 'monospace' }}>
                {(() => {
                  const subtotal = createdOrder.items.reduce((sum, item) => sum + item.subtotal, 0);
                  const vatAmount = createdOrder.totalAmount - subtotal;
                  return (
                    <>
                      <div className="flex justify-between">
                        <span>Tạm tính:</span>
                        <span>{new Intl.NumberFormat('vi-VN').format(subtotal)}đ</span>
                      </div>
                      {vatAmount > 0 && (
                        <div className="flex justify-between">
                          <span>Thuế VAT ({vatRate}%):</span>
                          <span>{new Intl.NumberFormat('vi-VN').format(vatAmount)}đ</span>
                        </div>
                      )}
                      <div style={{ borderTop: '1px dashed #cbd5e1', margin: '6px 0' }} />
                      <div className="flex justify-between font-bold text-sm">
                        <span>TỔNG CỘNG:</span>
                        <span className="text-indigo-600 font-mono text-base">
                          {new Intl.NumberFormat('vi-VN').format(createdOrder.totalAmount)}đ
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>

              {createdOrder.notes && (
                <>
                  <div style={{ borderTop: '1px dashed #cbd5e1', margin: '12px 0' }} />
                  <div className="text-xs">
                    <span className="text-slate-500">Ghi chú chung: </span>
                    <span className="italic">{createdOrder.notes}</span>
                  </div>
                </>
              )}

              <div style={{ borderTop: '1px dashed #cbd5e1', margin: '12px 0' }} />

              <div className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-4">
                BubbleFlow cám ơn quý khách!
              </div>
            </div>
          )}
        </div>
      </Modal>
    </PageContainer>
  );
};

export default OrderIntakePage;

// ===== API Response Types =====

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: FieldError[];
  timestamp: string;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// ===== Auth Types =====

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  roles: string[];
  permissions: string[];
  createdAt: string;
}

// ===== Common Types =====

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface TableParams {
  page?: number;
  size?: number;
  search?: string;
  sort?: string;
  direction?: 'asc' | 'desc';
}

// ===== Role & Permission Types =====

export interface PermissionResponse {
  id: number;
  name: string;
  path: string;
  method: string;
  apiGroup: string;
  description: string;
}

export type RoleType = 'ALL' | 'CUSTOM';

export interface RoleResponse {
  id: number;
  name: string;
  description?: string;
  type: RoleType;
  isActive: boolean;
  permissions: PermissionResponse[];
  createdAt: string;
  updatedAt?: string;
}

export interface RoleRequest {
  name: string;
  description?: string;
  type: RoleType;
  permissionIds?: number[];
}

// ===== User CRUD Types =====

export interface UserCreateRequest {
  email: string;
  fullName: string;
  password?: string;
  phone?: string;
  avatarUrl?: string;
  roleIds: number[];
}

export interface UserUpdateRequest {
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  roleIds: number[];
}

export interface ResetPasswordRequest {
  newPassword?: string;
}

export interface ChangePasswordRequest {
  oldPassword?: string;
  newPassword?: string;
}

// ===== Service Catalog Types =====

export interface ServiceResponse {
  id: number;
  code: string;
  name: string;
  description?: string;
  price: number;
  priceUnit: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ServiceRequest {
  code: string;
  name: string;
  description?: string;
  price: number;
  priceUnit: string;
}

// ===== Equipment Catalog Types =====

export interface EquipmentResponse {
  id: number;
  code: string;
  name: string;
  type: string; // WASHING_MACHINE, DRYER
  capacity: number; // kg
  status: string; // IDLE, RUNNING, MAINTENANCE, OUT_OF_SERVICE
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface EquipmentRequest {
  code: string;
  name: string;
  type: string;
  capacity: number;
  status: string;
}

// ===== Order & Basket Types =====

export interface OrderItemRequest {
  serviceId: number;
  quantity: number;
  notes?: string;
}

export interface OrderRequest {
  customerName: string;
  customerPhone: string;
  notes?: string;
  items: OrderItemRequest[];
}

export interface OrderItemResponse {
  id: number;
  serviceId: number;
  serviceName: string;
  serviceCode: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
}

export interface OrderResponse {
  id: number;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  status: string; // RECEIVED, SORTING, WASHING, DRYING, AWAITING_DELIVERY, COMPLETED
  notes?: string;
  items: OrderItemResponse[];
  storageRackId?: number | null;
  storageRackName?: string | null;
  paymentStatus?: string;
  paymentMethod?: string | null;
  deliveryType?: string;
  shipperName?: string | null;
  shipperPhone?: string | null;
  deliveredAt?: string | null;
  deliveredBy?: string | null;
  slaRemainingMinutes?: number | null;
  slaViolated?: boolean;
  currentDuration?: string;
  customerNotified?: boolean;
  notifiedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface LaundryBasketRequest {
  basketCode: string;
  name?: string;
  status?: string;
  orderId?: number;
  equipmentId?: number;
}

export interface LaundryBasketResponse {
  id: number;
  basketCode: string;
  name?: string;
  orderId?: number;
  orderCode?: string;
  orderStatus?: string;
  orderWeight?: number;
  equipmentId?: number;
  equipmentCode?: string;
  status: string; // IDLE, USING
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ===== Storage Rack Types =====

export interface StorageRackRequest {
  code: string;
  name: string;
  status?: string;
}

export interface StorageRackResponse {
  id: number;
  code: string;
  name: string;
  status: string; // AVAILABLE, OCCUPIED, MAINTENANCE
  isActive: boolean;
  currentOrderCode?: string | null;
  currentCustomerName?: string | null;
  currentOrderId?: number | null;
  currentCustomerNotified?: boolean | null;
  currentNotifiedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderDeliveryRequest {
  paymentMethod: string;
  deliveryType: string;
  shipperName?: string;
  shipperPhone?: string;
}

// ===== Dashboard & Report Types =====

export interface DailyRevenue {
  date: string;
  revenue: number;
}

export interface ServiceRevenueShare {
  serviceName: string;
  revenue: number;
}

export interface MachineStatusDistribution {
  status: string;
  count: number;
}

export interface DashboardStatsResponse {
  todayOrders: number;
  todayRevenue: number;
  activeMachines: number;
  slaWarnings: number;
  weeklyRevenue: DailyRevenue[];
  serviceRevenueShare: ServiceRevenueShare[];
  machineStatusDistribution: MachineStatusDistribution[];
}

export interface EquipmentReportResponse {
  id: number;
  code: string;
  name: string;
  type: string;
  status: string;
  totalCycles: number;
  totalRuntimeHours: number;
  depreciationPercent: number;
  wearRate: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  hoursToNextMaintenance: number;
  maintenanceStatus: 'OK' | 'DUE_SOON' | 'OVERDUE';
}

// ===== System Settings Types =====

export interface SystemSettingResponse {
  id: number;
  settingKey: string;
  settingValue: string;
  description: string;
  groupName: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SystemSettingRequest {
  settingKey: string;
  settingValue: string;
}

// ===== Customer Types =====

export interface CustomerStatsResponse {
  id: number;
  name: string;
  phone: string;
  isActive: boolean;
  totalOrders: number;
  totalSpent: number;
}

export interface CustomerResponse {
  id: number;
  name: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerRequest {
  name: string;
  phone: string;
}

// ===== Notification Types =====

export interface NotificationResponse {
  id: number;
  title: string;
  content: string;
  type: string; // SLA_WARNING, MACHINE_COMPLETED, SYSTEM
  isRead: boolean;
  createdAt: string;
}

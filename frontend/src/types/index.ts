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
  equipmentId?: number;
  equipmentCode?: string;
  status: string; // IDLE, USING
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

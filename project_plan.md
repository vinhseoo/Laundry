# BubbleFlow Project — Project Progress & Tracking Plan

Tài liệu này dùng để theo dõi tiến độ phát triển hệ thống Quản lý Chuỗi Cửa Hàng Giặt Là / Giặt Sấy Tự Động (**BubbleFlow**). Mỗi khi hoàn thành chức năng nào hoặc có thay đổi/sửa lỗi (fix), thông tin sẽ được cập nhật trực tiếp tại đây.

---

## 📊 Tổng quan tiến độ

- **Trạng thái hiện tại:** Đã thiết lập khung dự án, cơ chế bảo mật JWT, phân quyền động, thiết kế lại giao diện Teal & Cyan cao cấp với font chữ Plus Jakarta Sans.
- **Tiến độ tổng thể:** `[████░░░░░░░░░░░░░░░░]` ~20% Hoàn thành
- **Giai đoạn hiện tại:** Thực hiện **Phase 1: Đăng nhập & Quản lý Người dùng/Quyền hạn**

---

## 📝 Nhật ký thay đổi & Sửa lỗi (Fix Logs)

| Ngày | Người thực hiện | Nội dung thay đổi / Sửa lỗi | Chi tiết / File liên quan |
| :--- | :--- | :--- | :--- |
| 05/07/2026 | Antigravity | Re-branding & Thiết kế lại Giao diện | Xóa sạch lịch sử Git cũ để khởi tạo dự án giặt sấy mới. Thiết lập hệ thống Token Theme mới của Ant Design sử dụng font Plus Jakarta Sans và màu chủ đạo Cyan/Teal (#0891b2). Chuyển đổi Layout Sider sang màu sáng (Light Theme) hiện đại. |
| 05/07/2026 | Antigravity | Đổi tên dữ liệu Seed & User | Chuyển đổi email admin từ `admin@scim.local` sang `admin@laundry.local`. Cập nhật danh sách Seed Permissions và Roles sang phạm vi quản lý cửa hàng giặt sấy. |

---

## 🗺️ Chi tiết các giai đoạn phát triển (Phases)

### Phase 0: Foundation — Hạ tầng & Khung dự án
- [x] **Backend Skeleton** — Khởi tạo Spring Boot 3.5.3 (Java 21, Maven)
- [x] **Hạ tầng Docker** — Setup PostgreSQL 16 + Redis 7 + pgAdmin 4
- [x] **Base Layer** — Thiết lập `BaseEntity`, `ApiResponse`, `PageResponse`
- [x] **Xử lý lỗi & Log** — Cài đặt `GlobalExceptionHandler` + Custom exceptions + Logback configs
- [x] **Frontend Skeleton** — Khởi tạo React + Vite + TypeScript + Tailwind CSS v4
- [x] **API Client** — Thiết lập Axios client tự động đính kèm JWT và bắt lỗi tập trung
- [x] **AI Guidelines** — Viết `AGENTS.md` và 11 Skills lập trình phù hợp
- [x] **Clean Commit Git** — Xóa sạch Git history cũ, tạo baseline sạch cho dự án mới

---

### Phase 1: Authentication & User Management
- **Đăng nhập & Xác thực**
  - [x] Migration V1: Thiết lập cấu trúc cơ bản cho User, Role, Permission và `refresh_tokens`
  - [x] JWT Provider: Tạo access token (15p) + refresh token (7 ngày)
  - [x] API Đăng nhập / Refresh token / Đăng xuất
  - [x] Giao diện Trang Login (Giao diện BubbleFlow Cyan gradient hiện đại)
  - [x] Zustand Auth store quản lý session & token
- **Phân quyền người dùng (RBAC) & Cấu hình Động**
  - [x] Migration V2: Bổ sung cột `type` (ALL/CUSTOM) vào bảng `roles`, cấu trúc lại bảng `permissions` và `role_permissions`
  - [ ] Auto-sync API: Quét toàn bộ Controller khi startup để tự động cập nhật bảng `permissions` (lấy description từ `@Operation` hoặc tên method)
  - [ ] Spring Security: Bộ lọc phân quyền động (Dynamic AuthorizationManager) khớp URL + Method với phân quyền của người dùng (không dùng `@PreAuthorize` cứng)
  - [ ] APIs: CRUD Roles (hỗ trợ type ALL/CUSTOM) và danh sách Permissions gom nhóm theo Controller
  - [ ] Giao diện: Quản lý Roles (Checkbox gán Permission động gom nhóm theo Controller, tự động check/disable dựa trên type)
  - [ ] Phân quyền ẩn hiện UI frontend động dựa trên danh sách quyền API nhận từ backend
- **Quản lý người dùng**
  - [ ] APIs: CRUD Users (Search, Pagination, Soft delete)
  - [ ] Giao diện: Quản lý người dùng (DataTable + FormModal)
  - [ ] API & Giao diện: Reset mật khẩu (Admin)
- **Trang cá nhân**
  - [ ] API & Giao diện: Xem/Sửa Profile cá nhân & Thay đổi mật khẩu
  - [ ] Tích hợp API Upload avatar cá nhân

---

### Phase 2: Master Data — Danh mục Dịch vụ & Thiết bị
- **Quản lý Dịch vụ (Services)**
  - [ ] Migration & Entity: Bảng `services` (mã dịch vụ, tên, mô tả, cách tính giá, đơn giá...)
  - [ ] APIs: CRUD Dịch vụ (Hỗ trợ cấu hình gói dịch vụ: giặt sấy theo kg, giặt khô theo món/combo)
  - [ ] Giao diện: Quản lý Bảng giá & Gói dịch vụ (DataTable + FormModal)
- **Quản lý Máy móc & Thiết bị (Equipment)**
  - [ ] Migration & Entity: Bảng `equipments` (mã máy, loại máy: giặt/sấy, công suất, trạng thái: rảnh, đang chạy, bảo trì...)
  - [ ] APIs: CRUD Thiết bị & Theo dõi trạng thái hoạt động của máy móc
  - [ ] Giao diện: Màn hình Giám sát Máy móc (Dạng lưới trạng thái trực quan, cập nhật real-time)

---

### Phase 3: Core Operations — Tiếp nhận & Điều phối đơn hàng
- **Tiếp nhận đơn hàng (Order Intake)**
  - [ ] Migration & Entity: Bảng `orders`, `order_items`, `laundry_baskets`
  - [ ] APIs: Tạo đơn hàng tiếp nhận (Nhận đầu vào: cân ký đồ, chọn gói dịch vụ, phân loại đồ chăn ga/giày/vest...)
  - [ ] Logic: Tự động tính toán giá tiền động theo kg hoặc theo món, tạo mã vạch/mã đơn hàng
  - [ ] Giao diện: Màn hình tiếp nhận đơn hàng (Form tính tiền động, in biên nhận tạm thời)
- **Giao việc & Điều phối (Dispatching)**
  - [ ] APIs: Gán đơn hàng/mã lồng giặt vào máy giặt hoặc máy sấy đang rảnh
  - [ ] Giao diện: Thao tác điều phối đơn hàng vào lồng giặt/lồng sấy bằng kéo thả hoặc chọn nhanh

---

### Phase 4: Order Lifecycle & SLA (State Machine)
- **Quản lý Máy trạng thái đơn hàng (Spring Statemachine)**
  - [ ] Backend: Định nghĩa và kiểm soát vòng đời đơn hàng qua các trạng thái:
    `RECEIVED` (Tiếp nhận) -> `SORTING` (Phân loại) -> `WASHING` (Đang giặt) -> `DRYING` (Đang sấy) -> `AWAITING_DELIVERY` (Chờ nhận) -> `COMPLETED` (Đã hoàn thành)
  - [ ] Database log: Bảng `order_state_logs` ghi lại thời gian chi tiết của mỗi lần đổi trạng thái để phục vụ tính toán SLA
  - [ ] Giao diện: Quản lý tiến trình đơn hàng (sử dụng component Steps/Timeline trực quan)
- **Kiểm soát thỏa thuận dịch vụ (SLA Alerts)**
  - [ ] Logic: Kiểm tra thời hạn xử lý tối đa tại mỗi trạng thái (ví dụ: Chờ giặt quá 2 tiếng sẽ vi phạm SLA)
  - [ ] APIs: API cảnh báo vi phạm SLA
  - [ ] Giao diện: Hiển thị cảnh báo đỏ nổi bật trên màn hình quản lý đối với các đơn hàng quá hạn

---

### Phase 5: Lưu kho chờ & Giao nhận trả hàng
- **Đóng gói & Lưu kho chờ**
  - [ ] Migration & Entity: Bảng `storage_racks` (quản lý kệ đồ hoàn thành)
  - [ ] APIs: Cập nhật vị trí kệ chờ sau khi sấy xong (Ví dụ: Kệ B - Tầng 3) để dễ tìm đồ
  - [ ] Giao diện: Quản lý kệ lưu kho chờ & Tìm kiếm vị trí đồ theo đơn hàng
- **Giao nhận trả hàng (Delivery)**
  - [ ] APIs: Quy trình thanh toán, xuất kho và giao trả đồ cho khách hàng tại quầy hoặc bàn giao shipper
  - [ ] Giao diện: Màn hình bàn giao/bàn giao shipper và cập nhật trạng thái thanh toán

---

### Phase 6: Dashboard & Báo cáo Phân tích
- **Báo cáo máy móc & Khấu hao**
  - [ ] Backend: Phân tích logs hoạt động thiết bị để tính tần suất sử dụng, số giờ chạy tích lũy
  - [ ] Logic: Tính toán khấu hao thiết bị tự động và đưa ra dự đoán bảo trì định kỳ
  - [ ] Giao diện: Biểu đồ phụ tải máy giặt/sấy, thông số hao mòn thiết bị
- **Báo cáo doanh thu & Hiệu suất**
  - [ ] Giao diện: Dashboard biểu đồ doanh thu theo ngày/tháng, tỷ trọng doanh thu theo từng gói dịch vụ (Recharts)
  - [ ] Real-time update: Đếm số đơn hàng và cập nhật doanh thu real-time bằng Redis

---

### Phase 7: Polish & Optimization
- [ ] **Performance Tuning** — Tối ưu DB Indexes, xử lý N+1 JPA query
- [ ] **UI/UX Polish** — Thiết lập responsive đầy đủ trên thiết bị di động, chế độ Dark Mode
- [ ] **Security Hardening** — Xử lý API Rate limiting, chống SQL Injection
- [ ] **Testing** — Viết Unit test JUnit cho luồng State Machine (Statemachine)
- [ ] **Documentation** — Tài liệu vận hành hệ thống và tài liệu tích hợp API Swagger UI

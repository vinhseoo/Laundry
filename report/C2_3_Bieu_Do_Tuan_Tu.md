# Chương 2 (Tiếp theo)

## 2.3. Thiết kế Động - Biểu đồ tuần tự (Sequence Diagrams)

Để mô tả sự tương tác động giữa các thành phần trong hệ thống (Frontend, Security Filter, Controllers, Services, Repositories và Database), phần này thiết lập 4 biểu đồ tuần tự cho các luồng nghiệp vụ cốt lõi bằng cú pháp Mermaid.

---

### 2.3.1. Biểu đồ tuần tự luồng Đăng nhập & Phân quyền động (Dynamic RBAC)

Luồng đăng nhập thực hiện xác thực người dùng, cấp Access Token/Refresh Token. Sau đó, mỗi khi có yêu cầu gọi API, bộ lọc `Dynamic AuthorizationManager` của Spring Security sẽ kiểm tra quyền truy cập động bằng cách đối chiếu thông tin yêu cầu với dữ liệu quyền của người dùng trong cơ sở dữ liệu.

```mermaid
sequenceDiagram
    autonumber
    actor User as "Người dùng (Staff/Admin)"
    participant FE as "Frontend App (React)"
    participant Filter as "DynamicSecurityFilter"
    participant AuthCtrl as "AuthController"
    participant AuthService as "AuthServiceImpl"
    participant UserRepo as "UserRepository"
    participant DB as "PostgreSQL DB"

    %% Đăng nhập
    Note over User, FE: Giai đoạn 1: Đăng nhập & Nhận Token
    User->>FE: Nhập Email/Password & Click Login
    FE->>AuthCtrl: POST /api/auth/login (Request DTO)
    AuthCtrl->>AuthService: authenticate(loginRequest)
    AuthService->>UserRepo: findByEmail(email)
    UserRepo->>DB: Query User & Roles
    DB-->>UserRepo: Trả về User Entity + Roles
    AuthService->>AuthService: Kiểm tra mật khẩu (BCrypt Match)
    AuthService->>AuthService: Sinh Access Token & Refresh Token
    AuthService-->>AuthCtrl: Trả về LoginResponse DTO
    AuthCtrl-->>FE: Trả về HTTP 200 OK + JWT Tokens
    FE->>FE: Lưu Access Token trong memory (Zustand), Refresh Token trong LocalStorage
    FE-->>User: Hiển thị màn hình Dashboard chính

    %% Giao dịch gọi API được bảo vệ
    Note over User, Filter: Giai đoạn 2: Gọi API được bảo vệ & Kiểm tra RBAC động
    FE->>Filter: GET /api/users (Kèm Authorization Bearer Header)
    Filter->>Filter: Giải mã JWT, trích xuất Email và Roles của User
    Filter->>Filter: Khớp URL "/api/users" + Method "GET"
    Filter->>DB: Query bảng permissions & role_permissions xem Role có quyền này không
    DB-->>Filter: Xác nhận quyền hợp lệ (user:read)
    Filter->>Filter: Cho phép đi qua (Access Granted)
    Filter->>FE: Forward request đến Controller xử lý tiếp
```

---

### 2.3.2. Biểu đồ tuần tự luồng Tiếp nhận đơn hàng & Tính giá tự động

Khi nhân viên tiếp nhận đồ bẩn, nhập cân nặng hoặc số lượng món, hệ thống tự động gọi dữ liệu bảng giá dịch vụ để tính tiền và lưu trữ đơn hàng.

```mermaid
sequenceDiagram
    autonumber
    actor Staff as "Nhân viên (Staff)"
    participant FE as "Frontend (OrderIntakePage)"
    participant OrderCtrl as "OrderController"
    participant OrderService as "OrderServiceImpl"
    participant ServiceRepo as "ServiceRepository"
    participant OrderRepo as "OrderRepository"
    participant DB as "PostgreSQL DB"

    Staff->>FE: Chọn gói dịch vụ & Nhập Số lượng / Cân nặng
    FE->>FE: Tính nhẩm giá tạm tính (hiển thị trên UI)
    Staff->>FE: Nhập Tên + SĐT Khách hàng & Bấm "Tạo Đơn"
    FE->>OrderCtrl: POST /api/orders (OrderRequest DTO)
    OrderCtrl->>OrderCtrl: Validate dữ liệu đầu vào (@Valid)
    OrderCtrl->>OrderService: createOrder(orderRequestDTO)
    
    OrderService->>ServiceRepo: findById(serviceId)
    ServiceRepo->>DB: Query thông tin dịch vụ (đơn giá)
    DB-->>ServiceRepo: Trả về Service Entity
    
    OrderService->>OrderService: Tính tổng tiền: Subtotal = Qty * Price
    OrderService->>OrderService: Sinh mã hóa đơn duy nhất ORD-[Date]-[Sequence]
    OrderService->>OrderService: Thiết lập trạng thái ban đầu = RECEIVED
    
    OrderService->>OrderRepo: save(orderEntity)
    OrderRepo->>DB: INSERT INTO orders & order_items
    DB-->>OrderRepo: Xác nhận lưu thành công (ID sinh tự động)
    
    OrderService-->>OrderCtrl: Trả về OrderResponse DTO
    OrderCtrl-->>FE: Trả về HTTP 201 Created + Dữ liệu đơn hàng
    FE->>FE: Hiển thị popup in biên nhận nhiệt K80
    FE-->>Staff: Kích hoạt lệnh in nhiệt vật lý
```

---

### 2.3.3. Biểu đồ tuần tự luồng Điều phối & Gán giỏ đồ vào máy chạy

Quy trình nhân viên gán giỏ đồ của đơn hàng vào một máy giặt/máy sấy đang rảnh. Trạng thái máy được cập nhật thời gian thực và Spring Statemachine kiểm soát việc chuyển đổi trạng thái của đơn hàng.

```mermaid
sequenceDiagram
    autonumber
    actor Staff as "Nhân viên (Staff)"
    participant FE as "Frontend (OrderListPage)"
    participant OrderCtrl as "OrderController"
    participant OrderService as "OrderServiceImpl"
    participant MachineRepo as "EquipmentRepository"
    participant BasketRepo as "LaundryBasketRepository"
    participant Statemachine as "Spring Statemachine"
    participant StateLogRepo as "OrderStateLogRepository"
    participant DB as "PostgreSQL DB"

    Staff->>FE: Chọn Đơn hàng, Giỏ đồ & Máy giặt (WASH_01)
    FE->>OrderCtrl: POST /api/orders/{id}/dispatch (DispatchDTO)
    OrderCtrl->>OrderService: dispatchOrderToMachine(orderId, basketId, equipmentId)
    
    OrderService->>MachineRepo: findById(equipmentId)
    MachineRepo->>DB: Query thông tin máy giặt
    DB-->>MachineRepo: Trả về Equipment Entity
    
    OrderService->>BasketRepo: findById(basketId)
    BasketRepo->>DB: Query thông tin giỏ đồ
    DB-->>BasketRepo: Trả về LaundryBasket Entity

    Note over OrderService, Statemachine: Kích hoạt State Machine để chuyển trạng thái
    OrderService->>Statemachine: Gửi sự kiện WASHING_START (Order ID)
    Statemachine->>Statemachine: Kiểm tra trạng thái hiện tại (RECEIVED -> WASHING)
    Statemachine-->>OrderService: Xác nhận chuyển trạng thái hợp lệ
    
    OrderService->>OrderService: Cập nhật trạng thái Order = WASHING
    OrderService->>OrderService: Cập nhật trạng thái Máy = RUNNING
    OrderService->>OrderService: Cập nhật trạng thái Giỏ = USING (gán orderId, equipmentId)
    
    OrderService->>StateLogRepo: save(orderStateLog) (Ghi log đổi trạng thái)
    
    %% Lưu thay đổi vào DB trong một Transaction
    OrderService->>DB: Lưu các thực thể (Order, Equipment, Basket, Log)
    DB-->>OrderService: Commit Transaction thành công
    
    OrderService-->>OrderCtrl: Trả về ApiResponse (Success)
    OrderCtrl-->>FE: Trả về HTTP 200 OK
    FE->>FE: Cập nhật lưới giám sát thiết bị & timeline đơn hàng
    FE-->>Staff: Hiển thị thông báo điều phối máy thành công
```

---

### 2.3.4. Biểu đồ tuần tự luồng Tác vụ ngầm quét và phát hiện vi phạm SLA

Luồng tự động chạy ngầm dưới nền của máy chủ (Background Job) để phát hiện trễ hẹn ở từng trạng thái xử lý đơn hàng.

```mermaid
sequenceDiagram
    autonumber
    participant System as "Spring Boot Task Scheduler"
    participant SLAService as "SLAAlertService"
    participant OrderRepo as "OrderRepository"
    participant StateLogRepo as "OrderStateLogRepository"
    participant DB as "PostgreSQL DB"
    participant FE as "Frontend (OrderListPage)"

    System->>SLAService: Trigger @Scheduled (mỗi 30 giây)
    SLAService->>OrderRepo: findActiveOrders() (Trạng thái khác COMPLETED)
    OrderRepo->>DB: SELECT * FROM orders WHERE status != 'COMPLETED'
    DB-->>OrderRepo: Trả về danh sách đơn hàng đang hoạt động
    
    loop Đối với mỗi Đơn hàng (Order)
        SLAService->>StateLogRepo: findLatestStateLog(orderId)
        StateLogRepo->>DB: SELECT * FROM order_state_logs WHERE order_id = ? ORDER BY changed_at DESC LIMIT 1
        DB-->>StateLogRepo: Trả về bản ghi đổi trạng thái gần nhất
        
        SLAService->>SLAService: Tính toán: Thời gian trôi qua = Hiện tại - Thời điểm đổi trạng thái
        SLAService->>SLAService: Đối chiếu với cấu hình SLA của trạng thái hiện tại
        
        alt Thời gian trôi qua > SLA quy định
            SLAService->>SLAService: Gắn cờ slaBreached = true & Tính toán thời gian trễ
        else
            SLAService->>SLAService: Gắn cờ slaBreached = false
        end
    end
    
    Note over SLAService, FE: Nhân viên tải lại hoặc WebSocket cập nhật
    FE->>OrderRepo: GET /api/orders (Lấy danh sách đơn hàng kèm cờ SLA)
    OrderRepo-->>FE: Trả về danh sách đơn hàng có cờ slaBreached=true
    FE->>FE: Phát tín hiệu nhấp nháy 🚨 và tô đỏ đơn hàng trên màn hình
```

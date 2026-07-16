# Chương 3: Phát triển và Thử nghiệm hệ thống

## 3.1. Kiến trúc và Công nghệ phát triển

Chương này trình bày chi tiết về việc lựa chọn công nghệ phát triển, thiết kế kiến trúc phân lớp của hệ thống **BubbleFlow** nhằm đáp ứng các yêu cầu nghiệp vụ phức tạp và hiệu suất vận hành cao của cửa hàng giặt sấy.

---

### 3.1.1. Công nghệ phát triển

Hệ thống được phát triển dựa trên mô hình Client-Server hiện đại, phân tách hoàn toàn giữa Frontend (giao diện người dùng) và Backend (xử lý nghiệp vụ & cơ sở dữ liệu), kết nối thông qua các giao thức RESTful APIs.

#### 1. Công nghệ Backend
* **Java 21 (LTS)**: Phiên bản Java dài hạn mới nhất mang lại hiệu năng tối ưu và hỗ trợ các tính năng ngôn ngữ hiện đại như: *Records* (cho các DTO bất biến), *Pattern Matching for switch*, *Virtual Threads* giúp hệ thống xử lý lượng lớn kết nối đồng thời dễ dàng hơn.
* **Spring Boot 3.5.3**: Khung ứng dụng chính cung cấp:
  * **Spring Data JPA & Hibernate**: Tự động hóa ánh xạ quan hệ thực thể, tối ưu hóa truy vấn thông qua cơ chế trì hoãn tải (Lazy Loading) và phân trang cưỡng chế (Pagination).
  * **Spring Security**: Triển khai cơ chế xác thực dựa trên Token JWT kết hợp bộ lọc phân quyền tùy biến.
  * **Spring Statemachine**: Quản lý vòng đời trạng thái đơn hàng một cách tường minh và an toàn qua cấu hình máy trạng thái.
* **PostgreSQL 16**: Hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ, đảm bảo tính nhất quán (ACID), xử lý tốt các liên kết khóa ngoại phức tạp của đơn hàng và thiết bị.
* **Redis 7**: Cơ sở dữ liệu trong bộ nhớ (In-memory database) làm nhiệm vụ:
  * Cache Master Data (bảng giá dịch vụ, danh sách quyền hạn người dùng) giúp giảm tải truy vấn lặp lại xuống PostgreSQL.
  * Hỗ trợ lưu trữ tạm thời các biến đếm và tính toán doanh thu thời gian thực phục vụ Dashboard.

#### 2. Công nghệ Frontend
* **React 18 & TypeScript**: Thư viện UI xây dựng các thành phần giao diện động (Component-based). TypeScript đảm bảo phát hiện lỗi kiểu dữ liệu ngay từ quá trình biên dịch (compile-time), tăng độ ổn định cho client.
* **Ant Design (Antd)**: Thư viện các thành phần giao diện (UI Components) chất lượng cao. Hệ thống sử dụng Ant Design để xây dựng các bảng dữ liệu nâng cao (`Table`), biểu mẫu xác thực (`Form`), các ô chọn gán quyền (`Checkbox`), và thanh tiến trình (`Steps/Timeline`).
* **Tailwind CSS v4**: Framework CSS tiện ích giúp tùy biến giao diện nhanh chóng, thiết lập giao diện đáp ứng (Responsive Grid) trên các thiết bị máy tính bảng và điện thoại di động.
* **Zustand**: Thư viện quản lý trạng thái toàn cục (Global State Store) siêu nhẹ dùng để quản lý phiên đăng nhập và thông tin tài khoản người dùng hiện tại ở client.
* **React Query (TanStack Query)**: Quản lý trạng thái đồng bộ với Server (Server State). React Query giúp tự động cache dữ liệu API, tự động gọi lại dữ liệu (refetching) khi người dùng đổi tab hoặc khi hết hạn cache, đem lại trải nghiệm trơn tru như ứng dụng máy để bàn.

---

### 3.1.2. Kiến trúc phân lớp Backend (Layered Architecture)

Backend tuân thủ nghiêm ngặt mô hình kiến trúc 3 lớp chuẩn mực theo nguyên tắc *Single Responsibility* (Mỗi lớp chỉ có một trách nhiệm duy nhất):

```
+-------------------------------------------------------------+
|                     Client (React Web App)                  |
+-------------------------------------------------------------+
                              | (HTTP REST Request)
                              v
+-------------------------------------------------------------+
|                        Controller Layer                     |
|  - Nhận yêu cầu HTTP, kiểm tra dữ liệu đầu vào (@Valid)     |
|  - Gọi Service Layer xử lý nghiệp vụ                        |
|  - Trả về đối tượng ApiResponse<T> (HTTP Status Code)       |
+-------------------------------------------------------------+
                              | (DTOs)
                              v
+-------------------------------------------------------------+
|                         Service Layer                       |
|  - Chứa logic nghiệp vụ chính (Business Logic)              |
|  - Quản lý Giao dịch DB (Declarative Transaction - @Transactional)|
|  - Điều khiển Spring Statemachine, tính toán SLA            |
+-------------------------------------------------------------+
                              | (Entity / Entities)
                              v
+-------------------------------------------------------------+
|                       Repository Layer                      |
|  - Kế thừa JpaRepository từ Spring Data                     |
|  - Giao tiếp dữ liệu với DB (PostgreSQL) thông qua JPQL/SQL  |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                     Database (PostgreSQL)                   |
+-------------------------------------------------------------+
```

* **Controller Layer**: Tiếp nhận yêu cầu. Controller tuyệt đối không chứa logic nghiệp vụ. Sử dụng các annotation của Jakarta Validation để validate dữ liệu đầu vào.
* **Service Layer**: Trái tim của ứng dụng. Mọi logic nghiệp vụ từ việc sinh mã đơn hàng, tính tiền, gán thiết bị, đổi trạng thái qua Statemachine đều được đặt ở đây.
* **Repository Layer**: Chỉ làm nhiệm vụ truy cập dữ liệu. Mọi truy vấn phức tạp hoặc yêu cầu hiệu năng cao đều sử dụng JPQL với `@EntityGraph` hoặc `JOIN FETCH` để triệt tiêu lỗi N+1 Query.
* **DTO & MapStruct Mapper**: Dữ liệu truyền giữa các lớp và trả về Client bắt buộc phải đi qua DTO. MapStruct tự động sinh mã nguồn chuyển đổi hiệu năng cao giữa Entity và DTO tại thời điểm compile, ngăn chặn hoàn toàn việc rò rỉ các thông tin nhạy cảm của Entity (như password, salt) ra ngoài API.

---

### 3.1.3. Kiến trúc Frontend (Feature-based Architecture)

Frontend được cấu trúc theo phương pháp tiếp cận hướng tính năng (Feature-based), giúp dễ dàng bảo trì và mở rộng khi quy mô dự án phình to. Cấu trúc thư mục của dự án:

```
src/
├── components/          # Các components dùng chung (Button, Input, Layout, Sider)
├── config/              # Các cấu hình hệ thống (axiosConfig, themeConfig)
├── routes.tsx           # Cấu hình định tuyến Route của toàn ứng dụng
├── services/            # Tầng gọi API chung (authService, fileService)
├── stores/              # Zustand global stores (authStore)
├── styles/              # CSS toàn cục và Tailwind configs
├── types/               # Định nghĩa kiểu dữ liệu TypeScript dùng chung
├── utils/               # Các hàm tiện ích (định dạng tiền, định dạng ngày tháng)
└── features/            # Thư mục chứa các tính năng lớn độc lập
    ├── auth/            # Trang đăng nhập, đăng xuất, đổi mật khẩu
    ├── services/        # Quản lý danh mục dịch vụ & bảng giá
    ├── equipment/       # Giám sát lưới thiết bị thời gian thực
    ├── orders/          # Màn hình tiếp nhận đơn (Intake) & Màn hình điều phối (Dispatch)
    └── dashboard/       # Dashboard hiển thị báo cáo & biểu đồ phân tích
```

Mỗi thư mục con trong `features/` tự đóng gói toàn bộ các thành phần liên quan đến tính năng đó bao gồm: `components/` (các UI con), `hooks/` (các React Query hooks tự định nghĩa), và `pages/` (trang route chính).

---

### 3.1.4. Giải pháp bảo mật & Phân quyền động (Dynamic RBAC)

Khác với cơ chế phân quyền cứng truyền thống (sử dụng `@PreAuthorize("hasAuthority('...')")` tại các phương thức), BubbleFlow triển khai cơ chế **Dynamic RBAC (Role-Based Access Control)** cực kỳ linh hoạt:

1. **Bộ quét tự động (Auto-scanning)**: Khi ứng dụng Backend khởi động, hệ thống sử dụng Reflection để quét toàn bộ các Controller và phương thức API trong dự án. Từ đó tự động ghi nhận hoặc cập nhật danh sách các Endpoint (bao gồm Method và Path) vào bảng `permissions` trong DB.
2. **Bộ lọc Spring Security tùy biến**:
   Khi có HTTP Request gửi đến, `DynamicAuthorizationManager` sẽ chặn lại, lấy ra Path và Method của request.
   Nó thực hiện truy vấn DB để lấy danh sách các Quyền của người dùng hiện tại và đối chiếu. Nếu có quyền trùng khớp với cặp (Path, Method), request sẽ được thông qua. Nếu không, hệ thống trả về HTTP 403 Forbidden.
3. **Phân quyền UI Phía Client**:
   Khi đăng nhập thành công, Frontend nhận về danh sách quyền hạn chi tiết của người dùng. Một Component bọc bảo vệ `<PermissionGuard requiredPermission="...">` được sử dụng để ẩn/hiện hoặc vô hiệu hóa (disabled) các nút chức năng trên giao diện. Điều này đảm bảo an toàn tuyệt đối từ cả hai phía Client và Server.

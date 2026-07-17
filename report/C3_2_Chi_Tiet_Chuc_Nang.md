# Chương 3 (Tiếp theo)

## 3.2. Hiện thực hóa các chức năng & Mô tả giao diện

Phần này trình bày cách triển khai chi tiết mã nguồn tiêu biểu ở Backend và thiết kế giao diện tương tác Frontend của hệ thống **BubbleFlow**.

---

### 3.2.1. Module Đăng nhập & Phân quyền động (Dynamic RBAC)

#### 1. Triển khai Backend: Bộ lọc phân quyền động (Spring Security)
Hệ thống triển khai bộ lọc phân quyền động thông qua cơ chế tự kiểm tra (`DynamicAuthorizationManager`) thực thi giao diện của Spring Security để quản lý việc truy cập tài nguyên API theo quy trình 4 giai đoạn cụ thể như sau:

1.  **Lọc bỏ các Endpoint công khai**: Tự động thông qua các API công khai không yêu cầu bảo mật, ví dụ như API Đăng nhập (`/api/auth/login`) hay tài liệu OpenAPI/Swagger UI (`/swagger-ui/**`).
2.  **Xác thực Phiên làm việc**: Giải mã và kiểm tra token JWT gửi kèm trong Request Header. Nếu token không hợp lệ hoặc phiên làm việc đã hết hạn, hệ thống trả về mã lỗi 401 Unauthorized.
3.  **Quyền ưu tiên của Quản trị viên (Admin Bypass)**: Kiểm tra vai trò của người dùng. Nếu người dùng sở hữu vai trò quản trị tối cao (`ROLE_ADMIN`), yêu cầu được duyệt qua trực tiếp mà không cần đối chiếu quyền riêng lẻ.
4.  **Tra cứu và Quyết định phân quyền động (Dynamic DB Lookup)**:
    *   Sử dụng URL Path và HTTP Method (ví dụ: `POST /api/orders`) để đối chiếu tìm quyền tương ứng (`permission_id`) trong bảng danh mục quyền `permissions`.
    *   Kiểm tra sự tồn tại của mối quan hệ giữa các Vai trò hiện có của tài khoản với quyền đó trong bảng liên kết `role_permissions`.
    *   Chấp thuận yêu cầu nếu mối quan hệ tồn tại, ngược lại từ chối và trả về HTTP 403 Forbidden.


#### 2. Giao diện Đăng nhập Glassmorphism
Trang đăng nhập được thiết kế với phong cách **Glassmorphism** thời thượng trên nền dốc (Gradient background) Indigo và Violet. Trên nền hiển thị hiệu ứng các bong bóng xà phòng động bay lên chậm rãi từ đáy màn hình bằng hiệu ứng CSS Keyframe. Khung đăng nhập có độ mờ nhám (backdrop-filter: blur) cùng viền bán trong suốt tạo cảm giác premium cao cấp.

#### Minh họa giao diện Đăng nhập Glassmorphism:
![Giao diện Đăng nhập Glassmorphism](images/login_page.png)

---

### 3.2.2. Module Quản lý Dịch vụ & Giám sát Thiết bị

#### 1. Lưới giám sát thiết bị thời gian thực (Equipment Monitoring Grid)
Tại Frontend, màn hình quản lý thiết bị được thiết kế dưới dạng Grid (lưới) trực quan. Mỗi máy giặt hoặc máy sấy được biểu diễn bằng một thẻ Card hình chữ nhật đứng (mô phỏng hình dáng máy thật):
* **Máy rảnh (IDLE)**: Viền và nền Teal nhạt, chữ xanh Teal dịu mắt.
* **Máy đang chạy (RUNNING)**: Viền và nền Indigo, hiển thị kèm mã giỏ đồ đang chạy bên trong và vòng tròn quay động thể hiện máy đang hoạt động.
* **Máy bảo trì (MAINTENANCE)**: Nền xám nhạt, có biểu tượng cờ lê 🔧.
* **Máy hỏng (OUT_OF_SERVICE)**: Viền đỏ nhạt, hiển thị cảnh báo ngưng hoạt động.

*Giao diện tự động cập nhật trạng thái ngay lập tức khi nhân viên thao tác gán giỏ đồ nhờ cơ chế React Query refetch dữ liệu định kỳ.*

#### Minh họa lưới giám sát thiết bị thời gian thực:
![Lưới giám sát thiết bị thời gian thực](images/equipment_monitoring.png)

---

### 3.2.3. Module Tiếp nhận đơn & Điều phối

#### 1. Giao diện Tiếp nhận đơn hàng (Order Intake)
* **Biểu mẫu thông tin**: Nhân viên chỉ cần nhập số điện thoại khách hàng, hệ thống tự động tra cứu nhanh qua database và hiển thị họ tên cũ.
* **Bảng tính tiền động**: Khi nhân viên chọn dịch vụ giặt sấy tiêu chuẩn (ví dụ 15,000đ/kg) và nhập số ký đồ bẩn là `6.5`, hệ thống sử dụng state của React để nhân trực tiếp và hiển thị tổng tiền `97,500đ` theo thời gian thực mà không cần tải lại trang.
* **Hóa đơn nhiệt K80**: Khi nhấn "Tạo đơn", hệ thống sinh mã đơn dạng Barcode, hiển thị mẫu hóa đơn biên nhận gọn gàng gồm: Logo BubbleFlow, mã đơn hàng, tên khách hàng, chi tiết dịch vụ, tổng tiền và cam kết thời gian hoàn thành (SLA).

#### Minh họa giao diện Tiếp nhận đơn hàng & Biên nhận K80:
![Giao diện Tiếp nhận đơn hàng và hóa đơn K80](images/order_intake.png)

#### 2. Thao tác Điều phối đơn hàng (Dispatching)
Màn hình điều phối là nơi kết nối giữa Đơn hàng, Giỏ đồ và Máy móc. Nhân viên chọn đơn hàng ở danh sách bên trái, chọn giỏ đồ trống ở giữa, và nhấp chọn một máy giặt/sấy đang rảnh ở bên phải. Hệ thống kiểm soát tính đúng đắn: máy giặt chỉ chấp nhận giỏ đồ ở khâu giặt, máy sấy chỉ chấp nhận giỏ đồ ở khâu sấy.

---

### 3.2.4. Module Vòng đời đơn hàng & Cảnh báo SLA

#### 1. Triển khai Backend: Cấu hình Spring Statemachine
Vòng đời đơn hàng được quản lý chặt chẽ thông qua cấu hình máy trạng thái (Spring Statemachine) ở backend, nhằm kiểm soát các bước xử lý đồ bẩn một cách tự động và tuần tự, ngăn chặn hoàn toàn việc nhân viên làm sai quy trình. Cấu trúc cấu hình hoạt động như sau:

*   **Khởi tạo trạng thái ban đầu**: Thiết lập trạng thái mặc định của mọi đơn hàng khi tiếp nhận thành công là `RECEIVED`.
*   **Khai báo tập hợp trạng thái**: Đăng ký toàn bộ 6 trạng thái hợp lệ trong vòng đời của đơn hàng (`RECEIVED`, `SORTING`, `WASHING`, `DRYING`, `AWAITING_DELIVERY`, `COMPLETED`).
*   **Cấu hình quy tắc chuyển trạng thái thông qua các Sự kiện (Events)**:
    *   **START_SORT**: Chuyển từ khâu vừa nhận `RECEIVED` sang phân loại `SORTING`.
    *   **START_WASH**: Chuyển từ phân loại `SORTING` sang giặt `WASHING` khi gán giỏ đồ vào máy giặt.
    *   **START_DRY**: Chuyển từ giặt `WASHING` sang sấy `DRYING` khi chuyển đồ sang máy sấy.
    *   **FINISH_PROCESS**: Chuyển từ sấy `DRYING` sang đóng gói chờ giao `AWAITING_DELIVERY`.
    *   **DELIVER**: Chuyển sang hoàn tất `COMPLETED` sau khi giao đồ cho khách hàng và thu tiền.

*Bất kỳ sự kiện chuyển tiếp trạng thái bất thường nào không nằm trong chuỗi tuần tự này đều sẽ bị Spring Statemachine từ chối thực thi và đưa ra cảnh báo lỗi nghiệp vụ hệ thống.*


#### 2. Cảnh báo trực quan SLA (SLA Alerts UI)
Trên màn hình **Danh sách đơn hàng (Order List)**:
* Các đơn hàng bị quá thời gian cho phép tại bước hiện tại (ví dụ: nằm ở khâu `SORTING` quá 30 phút do nhân viên quên phân loại) sẽ lập tức bị gắn cờ `slaBreached: true`.
* **Còi báo động đỏ nhấp nháy 🚨**: Được thiết kế bằng CSS Animation hiệu ứng nhấp nháy liên tục (blink effect) kết hợp viền đỏ bao quanh hàng đơn hàng đó để thu hút sự chú ý tối đa của nhân viên.
* **Expandable Row (Dòng mở rộng)**: Khi click vào một đơn hàng, dòng chi tiết sẽ mở rộng xuống dưới hiển thị một thanh tiến trình ngang (`Steps` component của Antd) thể hiện rõ lịch sử thời gian đơn hàng đi qua từng trạng thái và khoanh vùng đỏ tại bước đang bị tắc nghẽn giúp nhân viên dễ dàng kiểm soát xử lý.

#### Minh họa giao diện Cảnh báo vi phạm SLA:
![Giao diện danh sách đơn hàng và cảnh báo SLA](images/sla_alerts.png)

---

### 3.2.5. Module Quản lý Danh mục Dịch vụ (Service Catalog Management)

Màn hình quản lý dịch vụ (`/services`) cho phép cấp quản trị hoặc quản lý thiết lập bảng giá dịch vụ giặt là một cách chuyên nghiệp:
*   **Bảng liệt kê nâng cao (Ant Design Table)**: Hiển thị danh mục dịch vụ với các cột chi tiết gồm: Mã dịch vụ (ví dụ: `SVC-01`), Tên dịch vụ (Giặt sấy tiêu chuẩn, Giặt hấp vest), Đơn giá (đơn vị VND), Đơn vị tính (KG hoặc ITEM), và Trạng thái hoạt động (bật/tắt qua Switch component).
*   **Biểu mẫu Thêm/Sửa (Modal Form)**: Hỗ trợ form Drawer động trượt ra từ góc bên phải, tích hợp validation để kiểm tra dữ liệu đầu vào (tên dịch vụ bắt buộc nhập, đơn giá phải lớn hơn 0). Khi lưu thành công, React Query tự động làm mới (invalidates cache) để đồng bộ danh sách bảng giá tức thì.

#### Minh họa giao diện Quản lý Danh mục Dịch vụ:
![Giao diện danh mục dịch vụ](images/service_management.png)

---

### 3.2.6. Module Quản lý Người dùng & Ma trận Phân quyền (Users & Dynamic Permission Settings)

Hệ thống cung cấp trang quản trị cấu hình nâng cao (`/users`) cho phép Admin giám sát tài khoản nhân viên và tùy biến phân quyền truy cập:
*   **Bảng quản lý tài khoản nhân viên**: Hiển thị danh sách các tài khoản trong hệ thống kèm ảnh đại diện, email, số điện thoại, và các thẻ vai trò (Role tags như `ROLE_STAFF`, `ROLE_MANAGER`). Cho phép Admin CRUD tài khoản và vô hiệu hóa tạm thời nhân viên qua cột trạng thái `is_active`.
*   **Ma trận Phân quyền Động (Dynamic Permission Matrix)**: Admin có thể truy cập tab cấu hình quyền để phân cấp quyền của từng vai trò thông qua một lưới danh sách các Endpoint quét được từ backend (ví dụ: `GET /api/orders`, `POST /api/users`). Tích hợp giao diện checkbox trực quan cho phép Admin chỉ định quyền nào thuộc về vai trò nào. Khi nhấn lưu, hệ thống tự động ghi nhận thay đổi xuống bảng `role_permissions` trong DB mà không cần sửa code hay restart server.

#### Minh họa giao diện Admin Quản lý Tài khoản & Phân quyền:
![Giao diện Admin quản lý tài khoản và phân quyền](images/user_management.png)

---

### 3.2.7. Module Thống kê & Báo cáo Phân tích (Analytics Dashboard)

Màn hình trang chủ Dashboard (`/dashboard`) cung cấp cái nhìn toàn cảnh về hiệu suất kinh doanh và khai thác thiết bị của chuỗi cửa hàng giặt là:
*   **Thẻ chỉ số đo lường (KPI Cards)**: Thiết kế dạng hộp bóng bẩy hiển thị ba số liệu cốt lõi: Tổng doanh thu lũy kế (VND), Tổng số đơn hàng trong ngày, và Tỷ lệ lấp đầy lồng giặt của máy móc (%). Các số liệu này được backend cache tạm thời trong Redis và tự động cộng dồn theo thời gian thực.
*   **Biểu đồ phân tích (Interactive Charts)**:
    *   **Tỷ lệ doanh thu theo gói dịch vụ (Pie Chart)**: Thể hiện trực quan gói dịch vụ nào mang lại nguồn thu lớn nhất (giúp Manager điều chỉnh kế hoạch marketing).
    *   **Xu hướng doanh thu theo tuần (Line Chart)**: Vẽ đồ thị dạng đường cong mượt mà theo dõi biến động doanh thu qua các ngày, hỗ trợ so sánh hiệu quả giữa các tuần.

#### Minh họa giao diện Báo cáo Thống kê Dashboard:
![Giao diện bảng điều khiển thống kê doanh thu và hiệu suất](images/dashboard_analytics.png)


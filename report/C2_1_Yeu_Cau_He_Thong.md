# Chương 2: Phân tích yêu cầu và Thiết kế hệ thống

## 2.1. Phân tích yêu cầu hệ thống

Để xây dựng một hệ thống quản lý giặt sấy vận hành trơn tru, việc đầu tiên là xác định rõ ràng các nhóm tác nhân (Actors) tham gia vào hệ thống, từ đó đặc tả các yêu cầu chức năng (Functional Requirements) và phi chức năng (Non-functional Requirements) chi tiết.

### 2.1.1. Xác định các tác nhân (Actors)
Hệ thống **BubbleFlow** xác định 4 nhóm tác nhân chính tương tác trực tiếp hoặc gián tiếp:
1. **Khách hàng (Customer)**: Đối tượng thụ hưởng dịch vụ. Khách hàng trực tiếp mang đồ đến cửa hàng, cung cấp thông tin định danh (Họ tên, Số điện thoại) để hệ thống lưu trữ và theo dõi tích lũy đơn hàng.
2. **Nhân viên cửa hàng (Staff)**: Tác nhân vận hành cốt lõi tại cửa hàng. Staff thực hiện tiếp nhận đồ, cân ký, tạo đơn hàng trên phần mềm, phân loại đồ, gán giỏ đồ vào máy giặt/máy sấy, cập nhật trạng thái đơn hàng khi máy chạy xong, đóng gói và thực hiện bàn giao trả đồ, thu tiền của khách.
3. **Quản lý cửa hàng (Manager)**: Giám sát toàn bộ hoạt động kinh doanh tại cửa hàng. Manager có quyền quản lý danh mục dịch vụ (gói giặt sấy theo kg, giặt khô theo món), quản lý cấu hình danh sách máy móc, theo dõi hiệu suất làm việc của nhân viên, hiệu suất khai thác thiết bị và xem báo cáo doanh thu.
4. **Quản trị hệ thống (Admin)**: Người có quyền hạn cao nhất trong hệ thống. Admin chịu trách nhiệm khởi tạo tài khoản cho nhân viên, quản lý phân quyền chi tiết (Roles & Permissions), cấu hình hệ thống, và giám sát lịch sử hoạt động (Audit Logs).

---

### 2.1.2. Phân tích yêu cầu chức năng (Functional Requirements)
Yêu cầu chức năng của hệ thống được chia làm 5 phân hệ chính:

#### 1. Phân hệ Xác thực & Phân quyền (Authentication & RBAC)
* Hệ thống phải cho phép người dùng đăng nhập bằng Email và Mật khẩu.
* Hệ thống cấp phát cặp mã thông báo JWT (Access Token thời hạn ngắn 15 phút để bảo mật và Refresh Token thời hạn dài 7 ngày lưu trữ phiên đăng nhập).
* Hệ thống phải cung cấp cơ chế phân quyền động: tự động quét tất cả các API endpoints khi khởi động và cho phép Admin gán quyền truy cập API cụ thể cho từng Vai trò (Role) thông qua giao diện Checkbox trực quan.
* Giao diện người dùng (UI) tại Frontend phải tự động ẩn hoặc vô hiệu hóa các nút chức năng/menu dựa trên danh sách quyền hạn mà tài khoản đăng nhập sở hữu.

#### 2. Phân hệ Quản lý Danh mục (Master Data Management)
* **Quản lý Dịch vụ**: Cho phép Manager/Admin CRUD dịch vụ giặt là (mã dịch vụ, tên dịch vụ, đơn giá, đơn vị tính: KG/ITEM, mô tả).
* **Quản lý Thiết bị**: Cho phép Manager/Admin CRUD danh sách máy giặt và máy sấy (mã thiết bị, tên máy, loại máy: Máy giặt / Máy sấy, công suất: 9kg/11kg/15kg, trạng thái: IDLE, RUNNING, MAINTENANCE, OUT_OF_SERVICE).

#### 3. Phân hệ Tiếp nhận & Điều phối (Order Intake & Dispatching)
* **Tiếp nhận đơn hàng**: Staff nhập thông tin khách hàng, chọn các dịch vụ khách sử dụng, nhập số ký (đối với dịch vụ tính theo kg) hoặc số lượng món (đối với giặt hấp vest/giày). Hệ thống tự động tính tiền theo đơn giá gói dịch vụ và sinh mã đơn hàng duy nhất dưới dạng Barcode.
* **In biên nhận tạm thời**: Hệ thống hỗ trợ sinh hóa đơn biên nhận nhiệt (giao diện tối ưu hóa cho khổ giấy K80) để in và đưa cho khách hoặc đính kèm vào giỏ đồ.
* **Điều phối đơn hàng**: Staff gán mã giỏ đồ (`laundry_baskets`) vào đơn hàng, sau đó gán giỏ đồ này vào một máy giặt hoặc máy sấy đang ở trạng thái rảnh (`IDLE`). Hệ thống sẽ tự động chuyển trạng thái máy sang `RUNNING` và khóa giỏ đồ đó.

#### 4. Phân hệ Máy trạng thái & Giám sát SLA (State Machine & SLA Alerts)
* **Quản lý trạng thái**: Kiểm soát vòng đời đơn hàng đi qua đúng chuỗi trạng thái: `RECEIVED` $\rightarrow$ `SORTING` $\rightarrow$ `WASHING` $\rightarrow$ `DRYING` $\rightarrow$ `AWAITING_DELIVERY` $\rightarrow$ `COMPLETED`. Mỗi lần chuyển trạng thái phải được hệ thống ghi log chi tiết (thời gian, người thực hiện).
* **Giám sát SLA**: Hệ thống tự động cấu hình thời gian xử lý tối đa cho phép ở mỗi trạng thái (ví dụ: khâu giặt tối đa 90 phút, sấy tối đa 60 phút). Nếu đơn hàng ở một trạng thái quá thời gian cấu hình mà chưa chuyển bước, hệ thống phải kích hoạt cờ cảnh báo quá hạn.
* **Cảnh báo trực quan**: Trên màn hình điều hành, đơn hàng vi phạm SLA sẽ hiển thị biểu tượng nhấp nháy 🚨 màu đỏ và thanh tiến trình hiển thị rõ bước bị nghẽn.

#### 5. Phân hệ Thống kê & Dashboard
* Hiển thị tổng quan số lượng đơn hàng trong ngày, doanh thu tích lũy, số lượng máy đang hoạt động.
* Biểu đồ doanh thu theo thời gian và tỷ trọng dịch vụ sử dụng nhiều nhất.
* Biểu đồ giám sát công suất tải của máy móc trong ngày.

---

### 2.1.3. Phân tích yêu cầu phi chức năng (Non-functional Requirements)
* **Tính hiệu năng (Performance)**:
  * Thời gian phản hồi của các API nghiệp vụ chính (tạo đơn, điều phối máy) phải dưới 500ms trong điều kiện mạng bình thường.
  * Tận dụng bộ nhớ đệm Redis 7 để lưu trữ các thông tin tĩnh như danh mục dịch vụ, quyền hạn người dùng để giảm tải cho cơ sở dữ liệu PostgreSQL.
  * Tích hợp Redis để làm bộ đếm doanh thu real-time trên Dashboard.
* **Tính bảo mật (Security)**:
  * Toàn bộ mật khẩu của người dùng phải được băm bằng thuật toán mã hóa mạnh **BCrypt** trước khi lưu vào cơ sở dữ liệu.
  * Phòng chống các lỗ hổng bảo mật phổ biến như SQL Injection (thông qua Spring Data JPA/Hibernate sử dụng tham số hóa truy vấn), XSS, và CSRF.
  * Phân quyền bảo mật chặt chẽ ở mức phương thức (Method-level) và mức URL (Request-level) ở Backend, không cho phép bypass bằng cách đổi URL ở Client.
* **Tính sẵn sàng & Khả năng mở rộng (Availability & Scalability)**:
  * Hệ thống có khả năng hoạt động ổn định liên tục 24/7.
  * Thiết kế cơ sở dữ liệu chuẩn hóa, đánh chỉ mục (Index) đầy đủ trên các cột khóa ngoại và các cột thường xuyên tìm kiếm (Email, Order Code, Status, Device Code) giúp truy vấn nhanh chóng khi dữ liệu lên tới hàng triệu bản ghi.
  * Triển khai dễ dàng bằng Docker Container giúp mở rộng quy mô (Scale out) Backend khi tải trọng tăng cao.

---

### 2.1.4. Biểu đồ Use Case tổng thể hệ thống
Dưới đây là sơ đồ Use Case tổng thể của hệ thống BubbleFlow, thể hiện các chức năng chính và các tác nhân tương tác:

#### Hình ảnh trực quan sơ đồ Use Case:
![Sơ đồ Use Case tổng thể hệ thống BubbleFlow](images/usecase_diagram.png)


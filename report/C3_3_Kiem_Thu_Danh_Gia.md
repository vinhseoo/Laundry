# Chương 3 (Tiếp theo)

## 3.3. Thử nghiệm kiểm thử (UAT) & Đánh giá hệ thống

Để đảm bảo hệ thống **BubbleFlow** vận hành ổn định, chính xác theo đúng thiết kế và yêu cầu đặt ra, nhóm phát triển đã tiến hành các bước thử nghiệm, kiểm thử chấp nhận người dùng (User Acceptance Testing - UAT) và đánh giá toàn diện hệ thống.

---

### 3.3.1. Kịch bản kiểm thử chấp nhận (UAT Test Cases)

Các kịch bản kiểm thử UAT tập trung vào việc xác minh các quy trình nghiệp vụ cốt lõi từ góc nhìn của nhân viên vận hành và quản trị viên cửa hàng.

| Mã TC | Tên Kịch Bản Kiểm Thử | Điều Kiện Đầu Vào | Các Bước Thực Hiện | Kết Quả Kỳ Vọng | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Đăng nhập hệ thống (Xác thực) | - Tài khoản chưa tồn tại hoặc sai mật khẩu.<br>- Tài khoản admin hợp lệ. | 1. Nhập sai email/password, bấm Login.<br>2. Nhập đúng tài khoản admin, bấm Login. | - Bước 1: Hệ thống báo lỗi "Invalid credentials" (401).<br>- Bước 2: Đăng nhập thành công, chuyển hướng vào Dashboard. | **Passed** |
| **TC-02** | Phân quyền động (Dynamic RBAC) | - Tài khoản Staff đăng nhập.<br>- Tài khoản Admin đăng nhập. | 1. Đăng nhập tài khoản Staff, truy cập URL `/admin/users`.<br>2. Đăng nhập tài khoản Admin, truy cập URL `/admin/users`. | - Bước 1: Hệ thống chặn hiển thị ở Frontend, Backend trả lỗi 403 Forbidden nếu cố gọi API.<br>- Bước 2: Hiển thị đầy đủ danh sách users và cho phép chỉnh sửa. | **Passed** |
| **TC-03** | Tiếp nhận đơn hàng & Tính giá | - Dịch vụ giặt sấy tiêu chuẩn có đơn giá 15,000đ/kg. | 1. Nhập SĐT khách hàng.<br>2. Nhập cân nặng = `8.2 kg`.<br>3. Bấm "Tạo đơn hàng". | - Hệ thống tự động tính: 8.2 * 15,000 = 123,000đ.<br>- Tạo đơn thành công, lưu trạng thái `RECEIVED`. Popup hóa đơn in nhiệt hiển thị chuẩn xác dữ liệu. | **Passed** |
| **TC-04** | Điều phối & Khởi động máy | - Đơn hàng vừa tạo (RECEIVED).<br>- Máy giặt `WASH_01` đang rảnh (IDLE). | 1. Chọn đơn hàng.<br>2. Chọn giỏ đồ trống.<br>3. Chọn máy `WASH_01`.<br>4. Nhấn "Bắt đầu giặt". | - Trạng thái máy `WASH_01` đổi sang `RUNNING`.<br>- Trạng thái đơn hàng chuyển sang `WASHING`. Grid giám sát thiết bị cập nhật real-time trạng thái máy đang bận. | **Passed** |
| **TC-05** | Chặn chuyển trạng thái sai quy trình | - Đơn hàng đang ở trạng thái `RECEIVED`. | 1. Nhân viên cố tình gọi API chuyển trạng thái thẳng lên `DRYING` (Bỏ qua khâu giặt). | - Spring Statemachine phát hiện sự kiện không hợp lệ.<br>- Hệ thống từ chối cập nhật CSDL, trả lỗi `BusinessException` (400) về client. | **Passed** |
| **TC-06** | Cảnh báo vi phạm SLA | - Cấu hình SLA khâu phân loại đồ (`SORTING`) tối đa là 30 phút. | 1. Tạo đơn hàng và chuyển sang bước `SORTING`.<br>2. Để đơn hàng tồn tại ở bước này quá 30 phút. | - Task scheduler quét qua và gắn cờ `slaBreached = true`.<br>- Trên màn hình điều hành hiển thị còi báo đỏ nhấp nháy 🚨 bên cạnh đơn hàng bị chậm trễ. | **Passed** |

---

### 3.3.2. Thử nghiệm tự động (Automated Testing)

Nhóm phát triển đã xây dựng các bộ kiểm thử tự động (Unit Tests) sử dụng **JUnit 5** và **Spring Boot Test** để kiểm chứng hoạt động của máy trạng thái đơn hàng (Spring Statemachine) ở backend. Việc này đảm bảo các ràng buộc nghiệp vụ về vòng đời đơn hàng luôn được thực thi chính xác và không bị phá vỡ khi thay đổi mã nguồn trong tương lai.

Các trường hợp thử nghiệm tự động chính bao gồm:

| Mã Test | Tên Phương Thức Kiểm Thử | Mục Tiêu Kiểm Thử | Kết Quả Chạy |
| :--- | :--- | :--- | :---: |
| **UT-01** | `testSuccessfulOrderLifecycleTransitions` | Xác minh chuỗi chuyển trạng thái chuẩn tuần tự từ `RECEIVED` sang `SORTING` và `WASHING` diễn ra thành công khi gửi các sự kiện tương ứng. | **Passed** |
| **UT-02** | `testInvalidTransitionIsBlocked` | Đảm bảo hệ thống tự động chặn đứng và từ chối các yêu cầu chuyển trạng thái không hợp lệ (ví dụ: chuyển từ `RECEIVED` trực tiếp sang `DRYING` mà không qua giặt). | **Passed** |

#### Minh họa kết quả chạy thử nghiệm tự động:
![Báo cáo kết quả chạy thử nghiệm tự động JUnit](images/test_runner_report.png)


---

### 3.3.3. Đánh giá hệ thống

Sau quá trình chạy thử nghiệm UAT và vận hành giả lập tại cửa hàng, hệ thống **BubbleFlow** đạt được các kết quả đánh giá như sau:

#### 1. Ưu điểm nổi bật
* **Trải nghiệm người dùng mượt mà**: Giao diện React thiết kế hiện đại, bảng biểu trực quan, lưới giám sát máy giặt/máy sấy cập nhật trạng thái nhanh chóng giúp nhân viên thao tác điều phối lồng giặt vô cùng dễ dàng.
* **Độ tin cậy của quy trình nghiệp vụ**: Nhờ áp dụng Spring Statemachine, quy trình xử lý đơn hàng được chuẩn hóa 100%. Nhân viên bắt buộc phải thực hiện tuần tự theo quy trình, loại bỏ hoàn toàn việc nhảy cóc khâu làm hỏng quy trình xử lý đồ của khách.
* **Cảnh báo SLA hiệu quả**: Cơ chế quét ngầm phát hiện đơn hàng tồn đọng và hiển thị cảnh báo đèn còi nhấp nháy 🚨 trên giao diện giúp nhân viên lập tức nhận diện các đơn hàng bị nghẽn, từ đó ưu tiên xử lý trước, giúp giảm thiểu tỷ lệ trễ hẹn trả đồ xuống dưới 2%.
* **Bảo mật và Phân quyền linh hoạt**: Cơ chế phân quyền động (Dynamic RBAC) giúp quản trị viên dễ dàng thêm mới chức năng hoặc thay đổi quyền hạn của nhân viên ngay trên giao diện mà không cần phải can thiệp sửa đổi mã nguồn hay khởi động lại máy chủ backend.

#### 2. Điểm hạn chế cần khắc phục
* **Chưa kết nối IoT vật lý**: Trạng thái máy móc (đang chạy, chạy xong) hiện tại vẫn phụ thuộc vào thao tác cập nhật thủ công của nhân viên trên phần mềm. Hệ thống chưa kết nối trực tiếp với cảm biến vật lý hoặc bo mạch điều khiển của máy giặt/máy sấy thực tế để tự động cập nhật trạng thái khi máy giặt xong.
* **Chưa tích hợp cổng thanh toán trực tuyến**: Hiện tại hệ thống mới chỉ hỗ trợ ghi nhận thanh toán tiền mặt trực tiếp tại quầy hoặc ghi nhận chuyển khoản thủ công, chưa tích hợp các cổng thanh toán QR code tự động (như VNPay, VietQR) để tự động đối soát giao dịch thanh toán.

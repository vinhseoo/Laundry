# Chương 3 (Tiếp theo)

## 3.4. Kết luận và Hướng phát triển tương lai

### 3.4.1. Kết luận chung về dự án

Trải qua quá trình nghiên cứu, phân tích thiết kế hệ thống và tiến hành hiện thực hóa mã nguồn, đề tài **"Xây dựng Hệ thống Quản lý Chuỗi Cửa Hàng Giặt Là / Giặt Sấy Tự Động (BubbleFlow)"** đã hoàn thành đầy đủ các mục tiêu đề ra ban đầu. Dự án mang lại những kết quả chính sau:

1. **Về mặt lý thuyết & quy trình**: Số hóa thành công toàn bộ các khâu vận hành của cửa hàng giặt là. Thiết lập quy chuẩn về vòng đời đơn hàng nghiêm ngặt sử dụng Máy trạng thái (State Machine) và tiêu chuẩn hóa cam kết dịch vụ trả đồ đúng hạn (SLA) vốn chưa được chú trọng ở các cửa hàng giặt là truyền thống.
2. **Về mặt kỹ thuật & công nghệ**:
   * Xây dựng hệ thống Backend phân lớp ổn định trên nền tảng Spring Boot 3.5.3, quản lý dữ liệu an toàn với PostgreSQL 16 và nâng cao tốc độ phản hồi bằng cache Redis 7.
   * Triển khai giải pháp phân quyền động (Dynamic RBAC) ưu việt, tự động đồng bộ hóa APIs của hệ thống và bảo vệ đa tầng từ Server đến Client.
   * Xây dựng giao diện Frontend Single Page App hiện đại bằng React và TypeScript, tận dụng Ant Design cho các tương tác phức tạp và Tailwind CSS v4 giúp tối ưu hiển thị.
3. **Về mặt thực tiễn**: Hệ thống đã chứng minh tính hiệu quả qua các bài kiểm thử UAT: giúp nhân viên cửa hàng tiếp nhận đồ nhanh chóng, theo dõi trạng thái thiết bị thời gian thực để phân phối hợp lý, và phản ứng kịp thời trước các cảnh báo quá hạn xử lý (SLA Alerts) nhờ còi báo động trực quan 🚨.

---

### 3.4.2. Hướng phát triển trong tương lai

Mặc dù các chức năng cốt lõi đã chạy ổn định, hệ thống BubbleFlow vẫn còn nhiều tiềm năng để tiếp tục cải tiến và nâng cấp. Nhóm phát triển định hướng các bước đi tiếp theo như sau:

#### 1. Hoàn thiện các Phase nghiệp vụ nâng cao (Phase 5 & Phase 6)
* **Triển khai Module Lưu kho chờ (Phase 5)**: Thiết lập bảng dữ liệu kệ đồ `storage_racks` để định danh vị trí lưu trữ (Ví dụ: Kệ A - Tầng 1, Kệ B - Tầng 3) cho các đơn hàng sau khi sấy khô và gấp gọn. Khi khách đến nhận đồ, hệ thống hiển thị chính xác vị trí kệ giúp nhân viên tìm đồ trong vòng 5 giây, triệt tiêu hoàn toàn việc tìm đồ thủ công mất thời gian.
* **Hỗ trợ giao hàng thông qua Shipper**: Tích hợp API của các đơn vị vận chuyển (như GrabExpress, AhaMove, Giao Hàng Tiết Kiệm) để tự động gọi tài xế đến lấy đồ giặt xong giao trả tận nhà cho khách hàng khi có yêu cầu trên phần mềm.
* **Dashboard phân tích sâu & Dự đoán bảo trì (Phase 6)**: Sử dụng các thuật toán phân tích lịch sử hoạt động của thiết bị để tính toán khấu hao máy tự động. Đưa ra các dự báo bảo trì định kỳ dựa trên số giờ chạy tích lũy của từng thiết bị để ngăn ngừa hỏng hóc giữa chừng.

#### 2. Tích hợp giải pháp phần cứng IoT (Internet of Things)
* Kết nối trực tiếp hệ thống với bo mạch máy giặt/máy sấy thông qua các vi điều khiển (như ESP32/Raspberry Pi) chạy giao thức truyền tin nhẹ **MQTT**. 
* Khi máy giặt/sấy hoàn thành chu trình vật lý, bo mạch tự động bắn tín hiệu về backend để tự động cập nhật trạng thái đơn hàng sang `AWAITING_DELIVERY` và giải phóng trạng thái thiết bị về `IDLE` mà không cần nhân viên phải thao tác thủ công trên phần mềm.

#### 3. Phát triển Mobile App dành cho Khách hàng
* Xây dựng ứng dụng di động dành riêng cho khách hàng sử dụng dịch vụ giặt sấy (phát triển bằng React Native hoặc Flutter).
* Ứng dụng cho phép khách hàng đặt chỗ trước lồng giặt/lồng sấy trống trước khi đến cửa hàng để tránh xếp hàng chờ đợi, theo dõi trực tiếp tiến trình giặt đồ của mình (đang giặt, đang sấy hay đã xếp lên kệ), tích lũy điểm thưởng thành viên và nhận các thông báo khuyến mãi cá nhân hóa.

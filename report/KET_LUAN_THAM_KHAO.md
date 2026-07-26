# KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN & TÀI LIỆU THAM KHẢO

## KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

### 1. Kết quả đạt được của Đồ án
Sau quá trình nghiên cứu lý thuyết, phân tích thiết kế và tiến hành lập trình thực tế, đề tài **"BubbleFlow — Xây dựng Hệ thống Quản lý Chuỗi Cửa Hàng Giặt Là / Giặt Sấy Tự Động"** đã hoàn thành đầy đủ các mục tiêu đề ra ban đầu, cụ thể:

*   **Về mặt Nghiệp vụ**: Xây dựng thành công một giải pháp nghiệp vụ khép kín chuẩn hóa cho ngành giặt là đa chuỗi, bao gồm các phân hệ:
    1. Tiếp nhận đơn hàng linh hoạt tại quầy (Order Intake), tự động tính toán đơn giá theo kg hoặc theo món đồ, sinh mã vạch và in trực tiếp biên nhận nhiệt cho khách hàng qua OpenPDF.
    2. Điều phối đơn hàng thông minh (Dispatching) giúp liên kết giỏ đồ vật lý với các máy giặt, máy sấy đang rảnh.
    3. Kiểm soát nghiêm ngặt vòng đời đồ giặt bằng máy trạng thái Spring Statemachine, tính toán mốc thời gian chuyển trạng thái để tự động hiển thị cảnh báo nhấp nháy 🚨 nếu vi phạm cam kết SLA trả đồ cho khách hàng.
    4. Phân khu lưu kho chờ giao đồ (Storage Rack) giúp sắp xếp túi đồ hoàn thành vào đúng kệ hàng và giải phóng kệ tự động khi bàn giao.
    5. Dashboard trực quan hóa doanh thu theo ngày/tháng và tần suất hoạt động của máy giặt/sấy cùng tính năng xuất Excel qua Apache POI.
*   **Về mặt Công nghệ**:
    *   Ứng dụng thành công Java 21 kết hợp với Spring Boot 3.5 và cơ sở dữ liệu PostgreSQL.
    *   Tối ưu hóa tốc độ tải và giảm tải CSDL bằng việc cache dữ liệu tĩnh qua Redis.
    *   Triển khai bộ xác thực không trạng thái JWT an toàn đi kèm hệ phân quyền động (Dynamic RBAC) kiểm soát chặt chẽ đến từng endpoint API và bộ giới hạn tần suất truy cập `RateLimitInterceptor` bảo vệ hệ thống.
    *   Xây dựng giao diện web SPA trực quan, mượt mà bằng ReactJS, TypeScript và Ant Design v5.

---

### 2. Các hạn chế còn tồn tại
Mặc dù hệ thống đã đáp ứng tốt các yêu cầu nghiệp vụ cơ bản tại cửa hàng, tuy nhiên dự án vẫn còn một số điểm cần tiếp tục hoàn thiện:
*   *Mô phỏng phần cứng*: Hệ thống hiện tại vẫn đang nhận tín hiệu hoàn thành chu trình chạy của máy giặt/sấy thông qua thao tác bấm nút thủ công trên giao diện của nhân viên, chưa có kết nối trực tiếp với mạch điều khiển IoT vật lý trên thiết bị.
*   *Dữ liệu lớn (Big Data)*: Màn hình báo cáo doanh thu truy vấn trực tiếp cơ sở dữ liệu PostgreSQL. Khi chuỗi cửa hàng mở rộng lên hàng trăm chi nhánh với hàng triệu đơn hàng mỗi năm, các câu lệnh SQL thống kê có thể gây chậm hệ thống nếu không được phân tách dữ liệu cũ (Data Archiving) hoặc phân mảnh bảng (Database Partitioning).

---

### 3. Hướng phát triển trong tương lai
Để phát triển BubbleFlow thành một giải pháp ERP toàn diện cho ngành dịch vụ giặt sấy, định hướng nghiên cứu tiếp theo sẽ tập trung vào các nội dung:
1.  **Tích hợp vi mạch IoT thực tế**: Lắp đặt các cảm biến dòng điện và bộ điều khiển kết nối Wi-Fi vào bo mạch máy giặt sấy công nghiệp, cho phép máy tự động gửi tín hiệu "đang chạy" hoặc "đã sấy xong" về máy chủ Backend, loại bỏ hoàn toàn thao tác thủ công của nhân viên.
2.  **Mở rộng kiến trúc Microservices**: Tách biệt phân hệ Auth, phân hệ Order và phân hệ Dashboard Báo cáo thành các dịch vụ nhỏ chạy độc lập (Microservices) để tăng khả năng chịu tải của chuỗi khi số lượng cửa hàng tăng mạnh.
3.  **Tích hợp AI dự báo bảo trì máy**: Sử dụng các thuật toán máy học phân tích lịch sử nhật ký sử dụng thiết bị (`equipment_usage_logs`) để dự đoán thời điểm máy móc có nguy cơ bị hỏng vòng bi hoặc thanh nhiệt sấy, đưa ra cảnh báo bảo trì định kỳ trước khi máy gặp sự cố vật lý.
4.  **Tích hợp ứng dụng cho Khách hàng (Customer App)**: Phát triển thêm ứng dụng di động dành riêng cho khách hàng để đặt lịch giặt sấy trước, thanh toán trực tuyến qua mã QR động và nhận thông báo đẩy (Push Notification) tự động khi quần áo đã được giặt xong và xếp lên kệ lưu trữ.

---

## TÀI LIỆU THAM KHẢO

1.  **Spring Boot & Spring Cloud**:
    *   Craig Walls, *Spring in Action, Sixth Edition*, Manning Publications, 2022.
    *   Spring Framework Documentation, *Spring Boot Reference Guide*, [Online]. Available: https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/.
2.  **ReactJS & Frontend Engineering**:
    *   Robin Wieruch, *The Road to React*, leanpub.com, 2021.
    *   TypeScript Documentation, *TypeScript Handbook*, [Online]. Available: https://www.typescriptlang.org/docs/handbook/intro.html.
3.  **Database & Caching Technologies**:
    *   Vlad Mihalcea, *High-Performance Java Persistence*, Vlad Mihalcea, 2017.
    *   Redis Documentation, *Redis Developer Guide & Caching Patterns*, [Online]. Available: https://redis.io/docs/.
4.  **Web Application Security**:
    *   OAuth 2.0 Web Authorization Standards, *RFC 6749 - The OAuth 2.0 Authorization Framework*, [Online]. Available: https://datatracker.ietf.org/doc/html/rfc6749.
    *   OWASP Top 10 Vulnerabilities, *OWASP Foundation - Top 10 Web Application Security Risks*, 2021. [Online]. Available: https://owasp.org/www-project-top-ten/.
5.  **Software Architecture & State Machines**:
    *   Martin Fowler, *Patterns of Enterprise Application Architecture*, Addison-Wesley Professional, 2002.
    *   Spring Projects, *Spring Statemachine Reference Documentation*, [Online]. Available: https://docs.spring.io/spring-statemachine/docs/current/reference/.

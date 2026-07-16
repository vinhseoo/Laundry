# Chương 1: Tổng quan về đề tài

## 1.1. Lý do chọn đề tài
Trong kỷ nguyên hiện đại, sự phát triển nhanh chóng của các đô thị lớn cùng với lối sống bận rộn đã thúc đẩy nhu cầu sử dụng các dịch vụ tiện ích gia đình tăng cao. Trong đó, dịch vụ giặt là và giặt sấy tự động đã và đang trở thành một phần thiết yếu đối với người dân đô thị, học sinh, sinh viên và những người đi làm có quỹ thời gian hạn hẹp. 

Tuy nhiên, phần lớn các cửa hàng giặt là hiện nay tại Việt Nam vẫn đang vận hành theo các phương thức truyền thống:
* **Ghi chép thủ công hoặc phần mềm đơn giản**: Thông tin đơn hàng, cân nặng, gói dịch vụ thường được ghi tay hoặc lưu trên các bảng tính Excel rời rạc. Điều này dễ dẫn đến sai sót, nhầm lẫn thông tin khách hàng, nhầm lẫn giữa các gói dịch vụ (giặt sấy tiêu chuẩn, giặt nhanh, giặt khô cao cấp).
* **Thất lạc hoặc lẫn lộn đồ của khách**: Đây là vấn đề nhức nhối nhất trong ngành giặt là. Việc gom chung nhiều đơn hàng không được gán nhãn mã vạch hoặc mã giỏ đồ rõ ràng dẫn đến tình trạng trả nhầm đồ hoặc mất mát tài sản của khách.
* **Lãng phí công suất máy móc**: Không có công cụ theo dõi trạng thái máy giặt/máy sấy trong thời gian thực (real-time). Nhân viên không biết máy nào đang chạy, máy nào đang rảnh hoặc đang hỏng để điều phối giỏ đồ hợp lý, gây tắc nghẽn vào giờ cao điểm.
* **Vi phạm thời gian cam kết trả hàng (SLA)**: Khách hàng thường yêu cầu lấy đồ đúng hẹn (đặc biệt là dịch vụ giặt nhanh). Thiếu đi hệ thống cảnh báo tự động khi đơn hàng bị nghẽn ở các khâu (như phân loại quá lâu, sấy xong chưa xếp vào kệ) dẫn đến trễ hẹn trả đồ, giảm uy tín thương hiệu.

Nhận thấy các thách thức thực tế trên, đề tài **"Xây dựng Hệ thống Quản lý Chuỗi Cửa Hàng Giặt Là / Giặt Sấy Tự Động (BubbleFlow)"** được lựa chọn nghiên cứu và phát triển nhằm số hóa toàn diện quy trình vận hành cửa hàng, tối ưu hóa điều phối thiết bị và đảm bảo chất lượng dịch vụ cam kết với khách hàng.

---

## 1.2. Mục tiêu đề tài
Đề tài hướng tới nghiên cứu và xây dựng một giải pháp phần mềm toàn diện đạt được các mục tiêu cụ thể sau:
1. **Số hóa quy trình tiếp nhận & thanh toán**: Xây dựng phân hệ tiếp nhận đơn hàng nhanh chóng, tự động tính phí dựa trên cân nặng hoặc số lượng món đồ, hỗ trợ in hóa đơn nhiệt/biên nhận tạm thời chứa mã vạch định danh đơn hàng.
2. **Quản lý & Giám sát thiết bị thời gian thực**: Thiết lập màn hình giám sát trạng thái hoạt động (Rảnh, Đang chạy, Bảo trì, Lỗi) của toàn bộ hệ thống máy giặt/máy sấy dưới dạng lưới trực quan giúp nhân viên dễ dàng phân phối lồng giặt.
3. **Kiểm soát chặt chẽ vòng đời đơn hàng**: Áp dụng mô hình máy trạng thái (State Machine) để quản lý luồng trạng thái nghiêm ngặt từ: *Tiếp nhận (RECEIVED)* $\rightarrow$ *Phân loại (SORTING)* $\rightarrow$ *Đang giặt (WASHING)* $\rightarrow$ *Đang sấy (DRYING)* $\rightarrow$ *Chờ nhận (AWAITING_DELIVERY)* $\rightarrow$ *Hoàn thành (COMPLETED)*, đảm bảo tính nhất quán của dữ liệu.
4. **Giám sát cam kết dịch vụ (SLA Alerts)**: Tự động đo lường thời gian xử lý ở từng bước trạng thái và phát tín hiệu cảnh báo trực quan (nhấp nháy đèn còi 🚨) khi có đơn hàng bị tồn đọng quá hạn quy định, giúp nhân viên xử lý kịp thời.
5. **Phân quyền và bảo mật nâng cao (Dynamic RBAC)**: Triển khai cơ chế phân quyền động dựa trên vai trò (Role-Based Access Control) tự động đồng bộ hóa APIs của backend và phân quyền hiển thị giao diện phía khách (Frontend), nâng cao độ an toàn thông tin cho toàn hệ thống.

---

## 1.3. Đối tượng và Phạm vi nghiên cứu
### 1.3.1. Đối tượng nghiên cứu
* Quy trình nghiệp vụ tiếp nhận đồ, phân loại đồ, tính toán đơn giá dịch vụ giặt sấy/giặt khô.
* Quy trình điều phối lồng giặt/sấy và quản lý vòng đời hoạt động của các thiết bị máy giặt/sấy công nghiệp.
* Quy trình kiểm soát thời gian xử lý đơn hàng và cơ chế phát hiện cảnh báo vi phạm SLA.
* Kiến trúc phần mềm phân lớp, cơ chế xác thực bảo mật JWT kết hợp phân quyền động Dynamic Security trong Spring Security.

### 1.3.2. Phạm vi nghiên cứu
* **Về mặt chức năng**: Tập trung xây dựng các phân hệ cốt lõi phục vụ vận hành nội bộ cửa hàng giặt là bao gồm: Quản lý người dùng & phân quyền; Quản lý danh mục dịch vụ & thiết bị; Tiếp nhận đơn hàng & in biên nhận; Điều phối đơn hàng vào thiết bị; Máy trạng thái vòng đời đơn hàng & Cảnh báo SLA; Dashboard thống kê doanh thu và tải trọng máy móc.
* **Về mặt công nghệ**: Phát triển ứng dụng Web App trên nền tảng Spring Boot 3.5.3 (Java 21) cho Backend và React JS 18 (TypeScript, Ant Design, Tailwind CSS v4) cho Frontend, kết hợp hệ quản trị cơ sở dữ liệu PostgreSQL 16 và bộ đệm Redis 7.
* **Phạm vi triển khai**: Áp dụng thử nghiệm tại một cửa hàng hoặc chuỗi cửa hàng giặt là tự động quy mô vừa và nhỏ.

---

## 1.4. Cấu trúc của báo cáo
Nội dung báo cáo đề tài được chia bố cục thành 3 chương chính như sau:
* **Chương 1: Tổng quan về đề tài**: Giới thiệu lý do chọn đề tài, mục tiêu, đối tượng, phạm vi nghiên cứu và ý nghĩa thực tiễn của đề tài.
* **Chương 2: Phân tích yêu cầu và Thiết kế hệ thống**:
  * Trình bày các yêu cầu chức năng và phi chức năng của hệ thống.
  * Phân tích tác nhân (Actors) và xây dựng sơ đồ Use Case tổng thể cùng kịch bản đặc tả chi tiết các Use Case quan trọng.
  * Thiết kế động hệ thống thông qua các biểu đồ tuần tự (Sequence Diagram) cho các luồng xử lý chính.
  * Thiết kế tĩnh hệ thống qua biểu đồ lớp thực thể (Class Diagram) và sơ đồ quan hệ cơ sở dữ liệu (ERD).
* **Chương 3: Phát triển và Thử nghiệm hệ thống**:
  * Giới thiệu công nghệ phát triển, kiến trúc phân lớp của Backend và cấu trúc thư mục của Frontend.
  * Trình bày quá trình hiện thực hóa các chức năng cốt lõi kèm mã nguồn tiêu biểu và hình ảnh mô tả giao diện hệ thống.
  * Xây dựng kịch bản kiểm thử (Test Cases), đánh giá kết quả thử nghiệm hệ thống và rút ra kết luận, hướng phát triển tương lai của đề tài.

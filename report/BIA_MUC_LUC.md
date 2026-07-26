# TRANG BÌA & CÁC PHẦN ĐẦU TÀI LIỆU

*(Định dạng căn lề trang bìa: Trên 2.0cm, Dưới 2.0cm, Trái 3.0cm, Phải 1.5cm)*

---

```
                   BỘ THÔNG TIN VÀ TRUYỀN THÔNG
            HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG
                  KHOA CÔNG NGHỆ THÔNG TIN 1
                           *******



                     ĐỒ ÁN TỐT NGHIỆP ĐẠI HỌC



                             ĐỀ TÀI:
          BUBBLEFLOW — XÂY DỰNG HỆ THỐNG QUẢN LÝ CHUỖI
             CỬA HÀNG GIẶT LÀ / GIẶT SẤY TỰ ĐỘNG




                   Sinh viên thực hiện : Nguyễn Minh Đức
                   Mã số sinh viên     : B21DCCNxxx
                   Lớp                 : D21CNPMxx
                   Ngành               : Công nghệ thông tin
                   Chuyên ngành        : Công nghệ phần mềm

                   Giảng viên hướng dẫn: TS. Nguyễn Văn A




                          HÀ NỘI — 2026
```

---
<div style="page-break-after: always;"></div>

## NHẬN XÉT CỦA GIẢNG VIÊN HƯỚNG DẪN

**1. Thái độ và ý thức thực hiện đồ án tốt nghiệp của sinh viên:**
....................................................................................................................................................................................
....................................................................................................................................................................................

**2. Chất lượng và độ tin cậy của các kết quả nghiên cứu, sản phẩm phần mềm:**
....................................................................................................................................................................................
....................................................................................................................................................................................

**3. Khả năng áp dụng vào thực tiễn:**
....................................................................................................................................................................................
....................................................................................................................................................................................

**4. Đánh giá chung và kiến nghị:**
....................................................................................................................................................................................
....................................................................................................................................................................................

*Hà Nội, ngày ..... tháng ..... năm 2026*
**Giảng viên hướng dẫn**
*(Ký và ghi rõ họ tên)*


---
<div style="page-break-after: always;"></div>

## LỜI CẢM ƠN

Lời đầu tiên, em xin được gửi lời cảm ơn sâu sắc nhất tới Ban giám hiệu cùng tập thể các thầy cô giáo Học viện Công nghệ Bưu chính Viễn thông (PTIT), đặc biệt là các thầy cô thuộc Khoa Công nghệ Thông tin 1. Trong suốt những năm học tập và rèn luyện dưới mái trường Học viện, thầy cô đã tận tình giảng dạy, truyền đạt những kiến thức khoa học quý báu cùng những kỹ năng sống thiết thực, tạo nền tảng vững chắc cho sự nghiệp tương lai của em.

Đặc biệt, em xin bày tỏ lòng biết ơn chân thành và sâu sắc nhất tới thầy **TS. Nguyễn Văn A**, người đã trực tiếp định hướng đề tài, tận tình hướng dẫn, chỉ bảo và động viên em trong suốt quá trình hoàn thành đồ án tốt nghiệp này. Sự định hướng khoa học cùng những lời khuyên nghiệp vụ sâu sắc của thầy là kim chỉ nam giúp em giải quyết hiệu quả các bài toán kỹ thuật phức tạp trong hệ thống.

Mặc dù đã cố gắng nỗ lực hết mình với tinh thần nghiêm túc và trách nhiệm cao nhất, song do hạn chế về thời gian cũng như kinh nghiệm thực tiễn, đồ án chắc chắn không tránh khỏi những thiếu sót. Em rất mong nhận được sự quan tâm, đóng góp ý kiến của các thầy cô giáo trong Hội đồng chấm đồ án tốt nghiệp để sản phẩm phần mềm cũng như báo cáo nghiên cứu này được hoàn thiện hơn.

Em xin chân thành cảm ơn!

*Hà Nội, ngày 26 tháng 07 năm 2026*
**Sinh viên thực hiện**
*Nguyễn Minh Đức*

---
<div style="page-break-after: always;"></div>

## DANH MỤC TỪ VIẾT TẮT

*Bảng: Danh mục các từ viết tắt chuyên ngành sử dụng trong tài liệu*

| Ký hiệu viết tắt | Cụm từ đầy đủ (Tiếng Anh) | Ý nghĩa / Giải nghĩa |
| :--- | :--- | :--- |
| **API** | Application Programming Interface | Giao diện lập trình ứng dụng |
| **RBAC** | Role-Based Access Control | Kiểm soát truy cập dựa trên vai trò |
| **JWT** | JSON Web Token | Chuỗi token định danh chuẩn JSON mã hóa |
| **JPA** | Jakarta Persistence API | Giao diện quản lý quan hệ thực thể Java |
| **ORM** | Object-Relational Mapping | Ánh xạ đối tượng sang cơ sở dữ liệu quan hệ |
| **SLA** | Service Level Agreement | Thỏa thuận cam kết mức độ dịch vụ |
| **DDoS** | Distributed Denial of Service | Tấn công từ chối dịch vụ phân tán |
| **XSS** | Cross-Site Scripting | Tấn công chèn mã kịch bản chéo trang |
| **SPA** | Single Page Application | Ứng dụng web đơn trang |
| **DOM** | Document Object Model | Mô hình đối tượng tài liệu HTML |
| **CSDL** | Cơ sở dữ liệu | Nơi lưu trữ thông tin có cấu trúc của hệ thống |
| **UI/UX** | User Interface / User Experience | Giao diện người dùng / Trải nghiệm người dùng |

---
<div style="page-break-after: always;"></div>

## LỜI MỞ ĐẦU

### 1. Tính cấp thiết của đề tài
Trong đời sống hiện đại tại các đô thị đông đúc, quỹ thời gian của con người ngày càng trở nên hạn hẹp. Các nhu cầu phục vụ đời sống thường nhật như giặt là, sấy khô quần áo đang ngày càng có xu hướng dịch chuyển từ tự làm tại nhà sang sử dụng dịch vụ chuyên nghiệp bên ngoài để tối ưu thời gian. Tuy nhiên, các cửa hàng giặt là truyền thống tại Việt Nam hiện nay chủ yếu vẫn vận hành theo phương thức thủ công: ghi nhận hóa đơn bằng giấy, giao tiếp trạng thái đơn hàng mơ hồ, điều phối lồng giặt và quản lý kệ lưu trữ quần áo sau khi sấy hoàn toàn dựa vào trí nhớ của nhân viên. Điều này dễ dẫn đến thất lạc đồ của khách hàng, vi phạm thời gian cam kết trả đồ (SLA), và gây lãng phí công suất sử dụng của các máy giặt, máy sấy đắt tiền.

Nhận thức được thực tế này, đề tài **"BubbleFlow — Xây dựng Hệ thống Quản lý Chuỗi Cửa Hàng Giặt Là / Giặt Sấy Tự Động"** được lựa chọn nhằm phát triển một giải pháp phần mềm chuyên sâu. Hệ thống không chỉ giúp nhân viên trực quầy tạo hóa đơn và in biên nhận tức thì, mà còn kiểm soát chặt chẽ vòng đời xử lý đồ giặt thông qua bộ máy trạng thái (State Machine), tự động hóa việc gán lồng giặt với đơn hàng, giám sát tải thiết bị thời gian thực và quản lý phân kho lưu trữ kệ đồ hoàn thành, giúp nâng cao hiệu quả vận hành chuỗi và tối đa hóa sự hài lòng của khách hàng.

### 2. Mục tiêu nghiên cứu
*   Nghiên cứu kiến trúc ứng dụng web hiện đại sử dụng Spring Boot ở Backend kết hợp với ReactJS ở Frontend.
*   Ứng dụng mô hình máy trạng thái (JPA State Machine) để chuẩn hóa và kiểm soát quy trình xử lý đồ vật lý của cửa hàng.
*   Thiết lập giải pháp an ninh API toàn diện bao gồm: Phân quyền động (Dynamic RBAC), xác thực JWT không trạng thái, và kiểm soát giới hạn tần suất truy cập (Rate Limiting) sử dụng Redis.
*   Xây dựng hoàn thiện sản phẩm phần mềm BubbleFlow đáp ứng đầy đủ nghiệp vụ tiếp nhận đơn hàng, in hóa đơn nhiệt, điều phối lồng giặt, lưu kho chờ và bàn giao trả đồ.

### 3. Cấu trúc của Đồ án tốt nghiệp
Tài liệu báo cáo đồ án tốt nghiệp được chia cấu trúc thành 3 chương chính:
*   **CHƯƠNG 1: Tổng quan về lĩnh vực & Bối cảnh dự án** – Giới thiệu về thị trường giặt sấy, mô hình kinh doanh, tiến trình bùng nổ công nghệ, phân tích ưu nhược điểm của các giải pháp hiện tại và các giải pháp hạ tầng an toàn bảo mật.
*   **CHƯƠNG 2: Phân tích yêu cầu và Thiết kế hệ thống** – Trình bày kiến trúc 3 tầng hệ thống, đặc tả chi tiết 11 Use Case nghiệp vụ cốt lõi kèm theo bảng kịch bản và biểu đồ tuần tự (Sequence Diagram), thiết kế cơ sở dữ liệu quan hệ gồm 18 bảng chi tiết cùng sơ đồ ERD tổng thể.
*   **CHƯƠNG 3: Phát triển và Thử nghiệm hệ thống** – Giới thiệu chi tiết các công nghệ phát triển (Spring Boot, ReactJS, Tailwind CSS), trình bày các đoạn mã nguồn hiện thực hóa các nghiệp vụ nâng cao (State Machine, Dynamic RBAC, Rate Limiting), đưa ra 8 kịch bản kiểm thử (Test Cases) thực tế tại hệ thống và đánh giá ưu nhược điểm.
*   **KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN** – Đánh giá những kết quả đạt được của đề tài, các hạn chế kỹ thuật hiện tại và đề xuất giải pháp cải tiến trong tương lai.

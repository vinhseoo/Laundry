# CHƯƠNG 1: TỔNG QUAN VỀ LĨNH VỰC & BỐI CẢNH DỰ ÁN

## 1.1. Khái niệm tổng quan về lĩnh vực dịch vụ giặt là/giặt sấy tự động và sự phát triển của các nền tảng trực tuyến

### 1.1.1. Khái niệm và Bối cảnh thị trường
Trong kỷ nguyên hiện đại, đô thị hóa nhanh chóng kết hợp với nhịp sống bận rộn đã làm thay đổi sâu sắc thói quen sinh hoạt của người dân tại các thành phố lớn. Dịch vụ giặt sấy tự động (Laundromat) – mô hình cửa hàng cung cấp các thiết bị giặt, sấy hoạt động tự động hoặc bán tự động – đang dịch chuyển mạnh mẽ từ mô hình truyền thống (khách hàng mang đồ đến tiệm, ghi sổ thủ công và chờ đợi nhiều ngày) sang mô hình số hóa thông minh.

Bối cảnh thị trường dịch vụ giặt sấy tại Việt Nam (đặc biệt tại Hà Nội và TP. Hồ Chí Minh) ghi nhận tiềm năng tăng trưởng vượt trội do các yếu tố cốt lõi:
1. **Mật độ dân cư đô thị tăng cao**: Sự gia tăng nhanh chóng của các khu chung cư, nhà trọ sinh viên, căn hộ dịch vụ diện tích nhỏ không đủ không gian phơi đồ hoặc lắp đặt máy sấy công suất lớn.
2. **Nhu cầu tiết kiệm thời gian**: Người tiêu dùng trẻ (nhân viên văn phòng, sinh viên, các hộ gia đình trẻ) sẵn sàng chi trả cho các dịch vụ tiện ích để tối ưu hóa thời gian cá nhân.
3. **Yêu cầu vệ sinh và sức khỏe**: Nhu cầu giặt sấy chuyên biệt cho các chất liệu nhạy cảm (đồ len, đồ vest, giày, chăn ga gối đệm khổ lớn) đòi hỏi trang thiết bị công nghiệp có chương trình giặt và nhiệt độ sấy chuẩn xác để diệt khuẩn.

Từ các tiệm giặt là tự phát nhỏ lẻ sử dụng máy giặt gia đình, thị trường đang chuyển mình sang các chuỗi cửa hàng giặt sấy quy mô lớn, được trang bị máy giặt sấy công nghiệp tốc độ cao. Để quản lý hiệu quả chuỗi cửa hàng này mà không làm tăng chi phí nhân sự, việc áp dụng công nghệ thông tin nhằm quản lý trạng thái máy, tiến độ đơn hàng và bảo mật dữ liệu là yêu cầu sống còn.

---

### 1.1.2. Các mô hình kinh doanh chính trong lĩnh vực giặt sấy
Lĩnh vực giặt sấy tự động hiện nay được vận hành dựa trên ba mô hình kinh doanh cốt lõi:

1. **Mô hình B2C (Business to Customer) - Trực tiếp tới người tiêu dùng**:
   - Đây là mô hình phổ biến nhất. Hệ thống cửa hàng cung cấp dịch vụ giặt sấy theo kg hoặc theo món trực tiếp cho khách hàng lẻ.
   - Khách hàng mang đồ đến cửa hàng hoặc đặt dịch vụ giao nhận. Nhân viên tiếp nhận đơn hàng, cân ký, phân loại và tiến hành giặt sấy bằng hệ thống máy của cửa hàng.
   - Trải nghiệm B2C hiện đại đòi hỏi quy trình minh bạch: khách hàng có thể theo dõi tiến độ đơn hàng theo thời gian thực (real-time) từ lúc tiếp nhận đến khi đóng gói lưu kho.

2. **Mô hình B2B (Business to Business) - Hợp tác doanh nghiệp**:
   - Cung cấp dịch vụ giặt sấy số lượng lớn theo hợp đồng định kỳ cho các đối tác doanh nghiệp như: khách sạn nhỏ, homestay, trung tâm thể hình (gym), spa, thẩm mỹ viện, hoặc các trường học nội trú.
   - Mô hình này đòi hỏi hệ thống quản lý phải có khả năng xử lý đơn hàng lô lớn, quản lý công nợ khách hàng doanh nghiệp và kiểm soát chặt chẽ thời hạn hoàn thành (SLA) để không ảnh hưởng đến hoạt động kinh doanh của đối tác.

3. **Mô hình O2O (Online-to-Offline) - Tích hợp trực tuyến**:
   - Khách hàng thực hiện tương tác, tạo yêu cầu và thanh toán trực tuyến qua ứng dụng di động hoặc cổng thông tin web, sau đó việc thực hiện dịch vụ (giặt sấy vật lý) diễn ra tại các cửa hàng offline.
   - Mô hình này tối ưu hóa công suất hoạt động của máy móc thông qua việc điều phối thông minh và giảm thiểu tối đa thời gian chờ đợi của khách hàng tại quầy.

---

### 1.1.3. Lịch sử phát triển và giai đoạn bùng nổ công nghệ
Sự phát triển của ngành công nghiệp giặt sấy tự động gắn liền với các làn sóng tiến bộ kỹ thuật số. Tiến trình phát triển có thể chia làm ba giai đoạn chính:

*Bảng 1.1: Tiến trình phát triển công nghệ trong ngành giặt sấy*

| Giai đoạn | Đặc trưng kỹ thuật | Phương thức thanh toán | Quản lý vận hành |
| :--- | :--- | :--- | :--- |
| **2015 - 2018** | Máy giặt gia đình độc lập, công nghệ cơ học truyền thống. | Tiền mặt trực tiếp. | Ghi sổ thủ công, không có hệ thống phần mềm hỗ trợ. |
| **2019 - 2022** | Chuyển đổi sang máy công nghiệp. Bắt đầu có phần mềm quản lý POS đơn giản. | Tiền mặt, chuyển khoản ngân hàng hoặc quét mã QR tĩnh. | Quản lý tập trung tại một cửa hàng, chưa có đồng bộ dữ liệu chuỗi. |
| **2023 - Nay** | Thiết bị IoT tích hợp cảm biến thông minh. Sử dụng State Machine kiểm soát vòng đời đơn hàng, SLA alerts. | Thanh toán QR động, ví điện tử, quản lý công nợ trực tuyến. | Hệ thống quản lý đa chuỗi (Multi-branch), đồng bộ dữ liệu đám mây, giám sát thiết bị real-time. |

Sự bùng nổ của công nghệ điện toán đám mây và kết nối vạn vật (IoT) từ năm 2023 đến nay đã thúc đẩy nhu cầu xây dựng các hệ thống quản trị chuyên sâu. Các hệ thống này không chỉ đơn thuần ghi nhận đơn hàng mà còn đóng vai trò là "bộ não" điều phối toàn bộ tài nguyên cửa hàng: tối ưu hiệu suất sử dụng máy, cảnh báo sự cố kỹ thuật, tự động gán giỏ đồ vật lý với đơn hàng và tối ưu hóa thời gian trả đồ cho khách hàng thông qua phân khu lưu kho thông minh.

[Hình 1.1: Biểu đồ tốc độ tăng trưởng doanh thu ngành giặt sấy thông minh tại Việt Nam]

---

## 1.2. Giới thiệu các nền tảng/hệ thống tương tự hiện nay

Hiện nay trên thị trường đã xuất hiện một số giải pháp phần mềm quản lý tiệm giặt là. Tuy nhiên, qua khảo sát thực tế, các hệ thống này vẫn tồn tại những ưu và nhược điểm nhất định khi áp dụng vào mô hình chuỗi tự động hiện đại:

1. **Các phần mềm quản lý bán hàng đa năng (KiotViet, Sapo)**:
   - *Ưu điểm*: Thương hiệu uy tín, hệ thống vận hành ổn định, giao diện bán hàng trực quan, tích hợp tốt các thiết bị phần cứng như máy in hóa đơn, ngăn kéo đựng tiền.
   - *Nhược điểm*: Không được thiết kế chuyên biệt cho ngành giặt là. Thiếu các tính năng cốt lõi như quản lý trạng thái máy giặt/sấy (rảnh, đang chạy, lỗi), không gán được giỏ đồ vật lý với thiết bị, không kiểm soát được vòng đời đơn hàng qua các công đoạn kỹ thuật phức tạp (Phân loại -> Giặt -> Sấy -> Lưu kệ), và hoàn toàn thiếu cơ chế cảnh báo vi phạm cam kết chất lượng dịch vụ (SLA) tại từng khâu.

2. **Các ứng dụng quản lý giặt là chuyên biệt nội địa (Giặt Là 247, phần mềm tự phát)**:
   - *Ưu điểm*: Có chức năng tính tiền theo kg hoặc theo món (chăn ga, giày, vest), hỗ trợ in hóa đơn.
   - *Nhược điểm*: Giao diện cũ kỹ, trải nghiệm người dùng kém (UI/UX chưa tối ưu hóa). Đa số chạy local trên một máy tính tại cửa hàng, dễ mất mát dữ liệu khi gặp sự cố phần cứng. Chưa tích hợp hệ thống phân quyền động linh hoạt cho nhân viên vận hành và quản trị viên chuỗi. Không có khả năng giám sát trực quan trạng thái tải của máy móc theo thời gian thực.

Từ những hạn chế trên, đề tài **"BubbleFlow — Xây dựng Hệ thống Quản lý Chuỗi Cửa Hàng Giặt Là / Giặt Sấy Tự Động"** được nghiên cứu và phát triển nhằm giải quyết triệt để các bài toán vận hành thực tế bằng cách cung cấp một nền tảng chuyên sâu, đồng bộ từ lõi nghiệp vụ đến giao diện tương tác.

---

## 1.3. Các giải pháp Kỹ thuật & Hạ tầng hỗ trợ trong dự án

Để xây dựng một hệ thống hoạt động ổn định, minh bạch và chuyên nghiệp tại quầy dịch vụ, dự án BubbleFlow tập trung triển khai các giải pháp kỹ thuật nội bộ tối ưu mà không phụ thuộc vào các dịch vụ bên thứ ba phức tạp:

1. **Hệ thống hóa đơn điện tử & In hóa đơn nhiệt nội bộ (OpenPDF)**:
   - Tại quầy tiếp nhận, khi nhân viên hoàn tất cân đo và nhập thông tin đơn hàng, hệ thống cần xuất biên nhận ngay lập tức cho khách hàng.
   - Giải pháp: Sử dụng thư viện **OpenPDF** phía Backend để sinh trực tiếp tệp biên nhận chuẩn định dạng máy in nhiệt khổ K80 hoặc K57 dưới dạng file PDF tối giản, truyền thẳng xuống trình duyệt của nhân viên để thực hiện lệnh in tức thời. Giải pháp này giúp tiết kiệm thời gian, tăng tính chuyên nghiệp và giảm thiểu sai sót thông tin.

2. **Mã hóa và sinh QR Code/Barcode định danh thiết bị và đơn hàng (ZXing)**:
   - Mỗi đơn hàng và giỏ đồ vật lý (`LaundryBasket`) cần được gắn một mã số định danh duy nhất để tránh thất lạc đồ của khách hàng trong quá trình chuyển giao giữa các máy giặt và máy sấy.
   - Giải pháp: Tích hợp thư viện **ZXing (Zebra Crossing)** phía Backend để tự động sinh mã vạch (Barcode) hoặc mã phản hồi nhanh (QR Code) từ mã đơn hàng (`order_code`) hoặc mã giỏ đồ (`basket_code`). Nhân viên vận hành chỉ cần quét mã này bằng máy quét cầm tay để cập nhật trạng thái đơn hàng hoặc gán nhanh vào thiết bị.

3. **Xuất bản báo cáo thống kê định dạng văn phòng (Apache POI)**:
   - Quản trị viên cần xuất dữ liệu doanh thu, tần suất sử dụng thiết bị và lịch sử đơn hàng ra file Excel để phục vụ công tác kế toán và đánh giá hiệu quả kinh doanh.
   - Giải pháp: Sử dụng thư viện **Apache POI** để kết xuất dữ liệu động từ cơ sở dữ liệu thành các tệp bảng tính Excel (`.xlsx`) được định dạng chuyên nghiệp, hỗ trợ phân loại cột, tính tổng tự động và định dạng dữ liệu tiền tệ trực quan.

---

## 1.4. Vấn đề An toàn & Bảo mật thông tin trong hệ thống

Là một hệ thống quản lý chuỗi chạy trên môi trường Web, BubbleFlow phải đối mặt với nhiều nguy cơ bảo mật tiềm ẩn. Dự án đã chủ động thiết kế và cấu hình các cơ chế phòng chống trực tiếp ngay trong kiến trúc mã nguồn:

### 1.4.1. Tấn công SQL Injection
- *Nguy cơ*: Kẻ tấn công cố tình chèn các đoạn mã SQL độc hại vào các ô tìm kiếm hoặc trường nhập liệu nhằm can thiệp vào truy vấn cơ sở dữ liệu để lấy thông tin nhạy cảm hoặc xóa dữ liệu.
- *Giải pháp*: Dự án sử dụng **Spring Data JPA** làm lớp ORM chủ đạo. Mọi truy vấn đều được thực thi dưới dạng Parameterized Queries (PreparedStatement) thông qua Hibernate, đảm bảo các tham số đầu vào được xử lý như các giá trị thuần túy (literals) chứ không phải là mã lệnh thực thi SQL.

### 1.4.2. Tấn công Cross-Site Scripting (XSS)
- *Nguy cơ*: Kẻ tấn công chèn mã JavaScript độc hại vào hệ thống (ví dụ: tên khách hàng chứa thẻ `<script>`), khi nhân viên mở trang quản lý đơn hàng, mã này sẽ thực thi trên trình duyệt của nhân viên để đánh cắp token hoặc phiên làm việc.
- *Giải pháp*:
  - **Phía Backend**: Sử dụng Jakarta Validation (`@NotBlank`, `@Size`, `@Pattern`) trên các DTO Request đầu vào để lọc bỏ dữ liệu không hợp lệ.
  - **Phía Frontend**: ReactJS tự động encode toàn bộ các giá trị biến hiển thị trong JSX, ngăn chặn việc thực thi trực tiếp các thẻ HTML/Script độc hại từ người dùng nhập vào.

### 1.4.3. Tấn công Brute Force & Khai thác API quá tải (Spam/Bots/DDoS)
- *Nguy cơ*: Kẻ tấn công hoặc các script tự động cố gắng gửi liên tục hàng ngàn yêu cầu đăng nhập hoặc spam tạo đơn hàng ảo làm nghẽn băng thông hệ thống và quá tải cơ sở dữ liệu.
- *Giải pháp*:
  - Triển khai bộ lọc **`RateLimitInterceptor`** trong Spring Boot hoạt động kết hợp với **Redis**.
  - Mỗi địa chỉ IP hoặc định danh tài khoản chỉ được phép gửi tối đa một số lượng yêu cầu nhất định trong một đơn vị thời gian (ví dụ: tối đa 60 requests/phút đối với các API thông thường và 5 requests/phút đối với API đăng nhập). Nếu vượt quá hạn mức, Redis sẽ nhanh chóng chặn và trả về mã lỗi HTTP 429 (Too Many Requests) ngay tại tầng Interceptor trước khi yêu cầu đi sâu vào tầng Service giúp bảo vệ tài nguyên hệ thống.

### 1.4.4. Đánh cắp phiên làm việc và Giả mạo yêu cầu (Session Hijacking & XSRF)
- *Nguy cơ*: Kẻ tấn công đánh cắp token xác thực để giả mạo danh nghĩa người dùng hợp lệ nhằm thay đổi trạng thái đơn hàng hoặc thông tin hệ thống.
- *Giải pháp*:
  - Sử dụng cơ chế xác thực không trạng thái (Stateless Authentication) dựa trên **JSON Web Token (JWT)**. Access Token được cấu hình có thời gian hết hạn rất ngắn (15 phút) nhằm giảm thiểu thiệt hại nếu bị lộ.
  - Sử dụng **Refresh Token** có hạn dài hơn (7 ngày) lưu trữ trong cơ sở dữ liệu để cấp lại Access Token mới. Khi người dùng thực hiện Đăng xuất, toàn bộ Refresh Token tương ứng sẽ bị vô hiệu hóa ngay lập tức.
  - Cấu hình Spring Security vô hiệu hóa session state (`SessionCreationPolicy.STATELESS`) để triệt tiêu nguy cơ tấn công CSRF thông qua Session Cookies thông thường.

---

## 1.5. Kết luận Chương 1

Chương 1 đã làm rõ bối cảnh phát triển của lĩnh vực giặt sấy tự động thông minh, khẳng định xu hướng dịch chuyển tất yếu từ quản lý thủ công sang chuyển đổi số toàn diện. Qua việc phân tích các giải pháp hiện tại trên thị trường, báo cáo đã chỉ rõ những khoảng trống công nghệ mà hệ thống **BubbleFlow** cần lấp đầy. Đồng thời, chương này cũng phác thảo rõ nét các giải pháp kỹ thuật nền tảng (in hóa đơn OpenPDF, định danh QR Code ZXing, báo cáo Apache POI) cùng các giải pháp an toàn bảo mật (Rate Limiter Interceptor thông qua Redis, Spring Security, JPA Parameterized Queries) được áp dụng trực tiếp trong dự án. Đây là tiền đề và cơ sở hạ tầng quan trọng phục vụ cho việc Phân tích yêu cầu và Thiết kế chi tiết hệ thống ở Chương 2.

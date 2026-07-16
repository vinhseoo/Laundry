# Báo cáo Đề tài: Hệ thống Quản lý Chuỗi Cửa Hàng Giặt Là / Giặt Sấy Tự Động (BubbleFlow)

Chào mừng bạn đến với tài liệu báo cáo chi tiết của dự án **BubbleFlow**. Để tránh tình trạng vượt quá giới hạn ngữ cảnh (context limit) và đảm bảo báo cáo được viết một cách đầy đủ, chi tiết và có chiều sâu nhất, toàn bộ nội dung đã được chia tách thành các chương và phần cụ thể dưới đây:

---

## 📌 Mục lục & Tiến độ thực hiện

### 📖 Chương 1: Tổng quan về đề tài
- [x] [Chương 1: Tổng quan về đề tài](C1_Tong_Quan.md)
  * Lý do chọn đề tài, mục tiêu, đối tượng, phạm vi nghiên cứu và cấu trúc báo cáo.

### 📊 Chương 2: Phân tích yêu cầu và Thiết kế hệ thống
- [x] [Chương 2 - Phần 1: Phân tích yêu cầu hệ thống & Sơ đồ Use Case tổng thể](C2_1_Yeu_Cau_He_Thong.md)
  * Nhóm tác nhân (Actors), các yêu cầu chức năng & phi chức năng, biểu đồ Use Case tổng quát.
- [x] [Chương 2 - Phần 2: Kịch bản đặc tả Use Case chi tiết](C2_2_Kich_Ban_Use_Case.md)
  * Kịch bản chi tiết cho các Use Case trọng tâm: Intake, Dispatch, Chuyển trạng thái, Giám sát SLA.
- [x] [Chương 2 - Phần 3: Thiết kế Động - Biểu đồ tuần tự (Sequence Diagrams)](C2_3_Bieu_Do_Tuan_Tu.md)
  * Biểu đồ tuần tự biểu diễn bằng Mermaid cho các luồng nghiệp vụ cốt lõi.
- [x] [Chương 2 - Phần 4: Thiết kế Tĩnh - Biểu đồ lớp & Sơ đồ CSDL ERD](C2_4_Thiet_Ke_Lop_ERD.md)
  * Biểu đồ Class và sơ đồ thực thể liên kết cơ sở dữ liệu (ERD) bằng Mermaid.

### 🛠️ Chương 3: Phát triển và Thử nghiệm hệ thống
- [x] [Chương 3 - Phần 1: Công nghệ phát triển & Kiến trúc hệ thống](C3_1_Kien_Truc_Cong_Nghe.md)
  * Stack công nghệ sử dụng, giải thích kiến trúc phân lớp Backend & cấu trúc React Frontend, giải pháp bảo mật Dynamic RBAC.
- [x] [Chương 3 - Phần 2: Hiện thực hóa các chức năng & Mô tả giao diện](C3_2_Chi_Tiet_Chuc_Nang.md)
  * Chi tiết hiện thực hóa các chức năng trọng tâm, đoạn mã tiêu biểu, thiết kế giao diện.
- [x] [Chương 3 - Phần 3: Thử nghiệm kiểm thử (UAT) & Đánh giá hệ thống](C3_3_Kiem_Thu_Danh_Gia.md)
  * Kịch bản kiểm thử (Test Cases), kết quả chạy Unit Test & tích hợp, đánh giá hệ thống.
- [x] [Chương 3 - Phần 4: Kết luận & Hướng phát triển](C3_4_Ket_Luan_Huong_Di.md)
  * Các thành tựu đạt được, điểm hạn chế và định hướng phát triển tương lai.

---

## 📈 Hướng dẫn xuất báo cáo
Các tài liệu được viết dưới dạng **Markdown chuẩn (GitHub Flavored Markdown)** tích hợp biểu đồ **Mermaid**. Khi cần xuất ra file Word (`.docx`) hoặc PDF để nộp, bạn có thể thực hiện theo các cách sau:
1. **Dùng VSCode / Markdown Preview**: Mở file Markdown trong VSCode, sử dụng extension như **Markdown PDF** hoặc **Markdown Preview Enhanced** để xuất trực tiếp sang PDF/HTML/Word.
2. **Dùng Pandoc**: Chạy lệnh chuyển đổi từ Markdown sang Word:
   ```bash
   pandoc -s report/C1_Tong_Quan.md report/C2_1_Yeu_Cau_He_Thong.md ... -o Bao_Cao_BubbleFlow.docx
   ```
3. **Copy-paste trực tiếp**: Copy nội dung hiển thị (Preview) và paste vào Word, các bảng biểu và đề mục sẽ tự động giữ nguyên định dạng. Các hình vẽ Mermaid sẽ tự động render thành hình ảnh trực quan trên trình đọc Markdown.

# Chương 2 (Tiếp theo)

## 2.2. Kịch bản đặc tả Use Case chi tiết

Để làm sáng tỏ luồng nghiệp vụ hoạt động của hệ thống BubbleFlow, dưới đây là đặc tả chi tiết (Use Case Scenarios) của 4 Use Case cốt lõi:

---

### 2.2.1. Kịch bản Use Case 1: Tiếp nhận đơn hàng (Order Intake)

#### Minh họa giao diện Tiếp nhận đơn hàng:
![Giao diện Tiếp nhận đơn hàng UC_01](images/order_intake.png)

* **Tên Use Case**: Tiếp nhận đơn hàng & Cân ký tự động
* **Mã Use Case**: UC_01
* **Tác nhân chính**: Nhân viên cửa hàng (Staff)
* **Tác nhân phụ**: Khách hàng (Customer)
* **Mô tả**: Nhân viên tiếp nhận đồ bẩn từ khách hàng, phân loại đồ, cân trọng lượng đồ hoặc đếm số lượng món đồ, chọn gói dịch vụ tương ứng trên hệ thống, nhập thông tin khách hàng và hoàn tất tạo đơn. Hệ thống tự động tính tiền và sinh mã đơn hàng để in hóa đơn nhiệt.
* **Tiền điều kiện**: 
  * Nhân viên cửa hàng đã đăng nhập thành công vào hệ thống.
  * Danh mục dịch vụ và bảng giá đã được thiết lập sẵn trên cơ sở dữ liệu.
* **Hậu điều kiện**: 
  * Đơn hàng được tạo thành công với trạng thái ban đầu là `RECEIVED`.
  * Hóa đơn tạm thời (biên nhận) được hiển thị dạng bản in nhiệt để nhân viên in ra đính kèm vào giỏ đồ.
  
#### Luồng sự kiện chính (Basic Flow)
1. Khách hàng mang đồ đến quầy giao dịch.
2. Nhân viên mở màn hình **Tiếp nhận đơn hàng (Order Intake)**.
3. Nhân viên nhập thông tin định danh khách hàng (Số điện thoại và Họ tên). Hệ thống tự động kiểm tra xem khách hàng đã tồn tại chưa:
   * Nếu đã tồn tại: Hệ thống tự động điền họ tên khách hàng.
   * Nếu chưa tồn tại: Nhân viên nhập mới họ tên khách hàng.
4. Nhân viên chọn loại dịch vụ từ danh sách (ví dụ: Giặt sấy tiêu chuẩn, Giặt sấy nhanh, Giặt khô áo vest...).
5. Nhân viên cân đồ (hoặc đếm số lượng món đồ) rồi nhập số liệu vào hệ thống (ví dụ: 8.5 kg hoặc 2 cái áo vest).
6. Hệ thống tự động tính tổng tiền dựa trên công thức: $\text{Tổng tiền} = \text{Số lượng (hoặc số kg)} \times \text{Đơn giá dịch vụ}$.
7. Nhân viên nhập ghi chú của đơn hàng (nếu có, ví dụ: đồ lụa giặt riêng, giày rách nhẹ đế...).
8. Nhân viên nhấn nút **Tạo Đơn Hàng**.
9. Hệ thống lưu đơn hàng vào Cơ sở dữ liệu, sinh mã đơn hàng độc nhất (Ví dụ: `ORD-20260715-001`) và tự động hiển thị popup in hóa đơn nhiệt có chứa mã vạch đơn hàng.
10. Nhân viên in hóa đơn, giao một bản cho khách và đính kèm bản còn lại vào giỏ đồ bẩn.

#### Luồng sự kiện thay thế & Ngoại lệ
* **Thay thế 3a (Thông tin khách hàng bị thiếu)**: Nhân viên chỉ cần nhập số điện thoại khách hàng, tên khách hàng có thể nhập là "Khách vãng lai" nếu khách không muốn để lại họ tên thật.
* **Ngoại lệ 6a (Không hợp lệ số lượng/số cân)**: Số cân nặng hoặc số lượng món đồ nhập vào là số âm hoặc bằng 0. Hệ thống hiển thị thông báo lỗi và yêu cầu nhân viên nhập lại giá trị hợp lệ lớn hơn 0 trước khi cho phép tạo đơn.

---

### 2.2.2. Kịch bản Use Case 2: Điều phối & Gán lồng giặt (Dispatching)

#### Minh họa giao diện Điều phối thiết bị:
![Giao diện Lưới Giám sát và Điều phối Thiết bị UC_02](images/equipment_monitoring.png)

* **Tên Use Case**: Điều phối & Gán lồng giặt vào máy
* **Mã Use Case**: UC_02
* **Tác nhân chính**: Nhân viên cửa hàng (Staff)
* **Mô tả**: Nhân viên gán mã giỏ đồ (lồng giặt) chứa đồ của khách vào một thiết bị (máy giặt hoặc máy sấy) đang rảnh để bắt đầu quá trình giặt/sấy.
* **Tiền điều kiện**: 
  * Đơn hàng đang ở trạng thái `RECEIVED` hoặc `SORTING`.
  * Có ít nhất một giỏ đồ (`laundry_baskets`) ở trạng thái rảnh (`IDLE`).
  * Có ít nhất một máy giặt/máy sấy (`equipments`) ở trạng thái rảnh (`IDLE`).
* **Hậu điều kiện**: 
  * Giỏ đồ được liên kết với đơn hàng và máy giặt/sấy cụ thể.
  * Trạng thái máy giặt/sấy chuyển từ `IDLE` sang `RUNNING`.
  * Trạng thái giỏ đồ chuyển từ `IDLE` sang `USING`.
  * Trạng thái đơn hàng chuyển sang `WASHING` (nếu gán vào máy giặt) hoặc `DRYING` (nếu gán vào máy sấy).

#### Luồng sự kiện chính (Basic Flow)
1. Nhân viên truy cập màn hình **Điều phối đơn hàng (Order Dispatching)**.
2. Hệ thống hiển thị danh sách đơn hàng đang chờ xử lý và lưới trạng thái hoạt động của các máy.
3. Nhân viên chọn một đơn hàng cần xử lý.
4. Nhân viên chọn một Giỏ đồ trống (ví dụ: `BSK_01 - Giỏ đồ xanh A`).
5. Nhân viên chọn một Máy giặt đang rảnh (ví dụ: `WASH_01 - Máy giặt Electrolux 11kg A`).
6. Nhân viên nhấn nút **Bắt đầu Giặt**.
7. Hệ thống xác nhận và thực hiện các cập nhật sau trong một Transaction:
   * Gán `order_id` và `equipment_id` vào giỏ đồ `BSK_01`.
   * Cập nhật trạng thái giỏ đồ `BSK_01` thành `USING`.
   * Cập nhật trạng thái máy `WASH_01` thành `RUNNING`.
   * Chuyển trạng thái đơn hàng sang `WASHING`.
   * Ghi nhận lịch sử chuyển đổi trạng thái đơn hàng vào bảng `order_state_logs`.
8. Hệ thống cập nhật giao diện thời gian thực (real-time grid) để phản ánh máy `WASH_01` đang hoạt động.

#### Luồng sự kiện thay thế & Ngoại lệ
* **Ngoại lệ 5a (Máy bị lỗi đột ngột)**: Khi nhân viên chọn máy nhưng thiết bị đó vừa được Manager chuyển sang trạng thái `MAINTENANCE` hoặc `OUT_OF_SERVICE`. Hệ thống thông báo máy không khả dụng và yêu cầu chọn máy khác.
* **Ngoại lệ 7a (Quá tải công suất máy)**: Cân nặng của đơn hàng vượt quá công suất định mức của máy (Ví dụ đơn hàng 13kg nhưng gán vào máy sấy 9kg). Hệ thống sẽ đưa ra cảnh báo nhắc nhở nhân viên xác nhận xem có muốn chia nhỏ đồ hoặc đổi sang máy công suất lớn hơn không.

---

### 2.2.3. Kịch bản Use Case 3: Theo dõi & Chuyển trạng thái đơn hàng (State Transition)

* **Tên Use Case**: Theo dõi & Chuyển trạng thái đơn hàng
* **Mã Use Case**: UC_03
* **Tác nhân chính**: Hệ thống (System), Nhân viên cửa hàng (Staff)
* **Mô tả**: Vòng đời của một đơn hàng được kiểm soát nghiêm ngặt bằng cơ chế Spring Statemachine thông qua các trạng thái tuần tự nhằm đảm bảo không có khâu nào bị bỏ sót và thông tin luôn đồng bộ.
* **Tiền điều kiện**: 
  * Đơn hàng đã được khởi tạo trong hệ thống.
* **Hậu điều kiện**: 
  * Trạng thái của đơn hàng được chuyển dịch chính xác sang bước tiếp theo.
  * Bản ghi lịch sử đổi trạng thái được ghi vào cơ sở dữ liệu để phục vụ kiểm toán và tính toán SLA.

#### Luồng sự kiện chính (Basic Flow)
1. Đơn hàng mới được tạo thành công mặc định nhận trạng thái `RECEIVED`.
2. Nhân viên tiến hành phân loại đồ của khách (ví dụ tách đồ màu, đồ trắng, đồ chất liệu đặc biệt), bấm chọn chuyển trạng thái đơn hàng sang `SORTING`.
3. Khi nhân viên điều phối gán giỏ đồ của đơn hàng vào máy giặt và khởi động máy (xem UC_02), hệ thống tự động chuyển trạng thái đơn hàng sang `WASHING`.
4. Sau khi máy giặt chạy xong, nhân viên lấy đồ ra, chuyển đồ vào máy sấy và gán thiết bị sấy, hệ thống tự động chuyển trạng thái đơn hàng sang `DRYING`.
5. Khi máy sấy hoàn thành chu kỳ sấy, nhân viên lấy đồ ra, tiến hành gấp gọn gàng, đóng túi nilon và xếp lên kệ chờ giao trả. Nhân viên bấm xác nhận hoàn thành xử lý, hệ thống tự động chuyển trạng thái đơn hàng sang `AWAITING_DELIVERY`.
6. Khách hàng đến nhận đồ hoặc shipper đến lấy đồ giao đi, nhân viên xác nhận thanh toán (nếu chưa thanh toán trước đó) và bấm trả hàng, hệ thống chuyển trạng thái đơn hàng sang `COMPLETED`.

#### Luồng sự kiện thay thế & Ngoại lệ
* **Ngoại lệ (Chuyển trạng thái không hợp lệ)**: Nhân viên cố tình thao tác bỏ qua các khâu (ví dụ chuyển thẳng từ `RECEIVED` sang `DRYING` mà không qua `WASHING`). Cơ chế Spring Statemachine ở Backend sẽ chặn hành động này, từ chối cập nhật cơ sở dữ liệu và throw ra `BusinessException` với thông báo "Trạng thái chuyển đổi không hợp lệ".

---

### 2.2.4. Kịch bản Use Case 4: Giám sát & Cảnh báo vi phạm SLA (SLA Alerting)

#### Minh họa giao diện Cảnh báo SLA trễ hạn:
![Giao diện Cảnh báo vi phạm SLA UC_04](images/sla_alerts.png)

* **Tên Use Case**: Giám sát & Cảnh báo vi phạm SLA
* **Mã Use Case**: UC_04
* **Tác nhân chính**: Hệ thống (Tự động chạy ngầm - Background Service)
* **Tác nhân phụ**: Nhân viên cửa hàng (Staff)
* **Mô tả**: Hệ thống tự động quét và tính toán thời gian tồn đọng của từng đơn hàng tại mỗi khâu trạng thái. Nếu vượt quá giới hạn SLA cấu hình, hệ thống sẽ kích hoạt trạng thái cảnh báo vi phạm để nhân viên lập tức xử lý đơn hàng bị chậm trễ.
* **Tiền điều kiện**: 
  * Cấu hình thời gian SLA cho từng trạng thái được thiết lập trong cài đặt hệ thống (Ví dụ: `SORTING` tối đa 30 phút, `WASHING` tối đa 90 phút, `DRYING` tối đa 60 phút).
* **Hậu điều kiện**: 
  * Các đơn hàng quá hạn SLA bị gắn cờ cảnh báo quá hạn.
  * Hiển thị cảnh báo trực quan trên giao diện màn hình điều hành.

#### Luồng sự kiện chính (Basic Flow)
1. Định kỳ mỗi 30 giây, một tác vụ ngầm chạy tự động (Scheduled Task) ở Backend kích hoạt.
2. Tác vụ ngầm truy vấn tất cả các đơn hàng chưa hoàn thành (trạng thái khác `COMPLETED`).
3. Đối với mỗi đơn hàng, hệ thống lấy mốc thời gian chuyển vào trạng thái hiện tại từ bảng `order_state_logs`.
4. Hệ thống so sánh: $\text{Thời gian đã trôi qua} = \text{Thời gian hiện tại} - \text{Thời gian chuyển trạng thái gần nhất}$.
5. Hệ thống đối chiếu với cấu hình SLA của trạng thái hiện tại:
   * Nếu $\text{Thời gian đã trôi qua} > \text{Thời gian SLA cấu hình}$, hệ thống đánh dấu đơn hàng này là **Vi phạm SLA (SLA Breached)**.
6. Backend trả về thông tin vi phạm SLA thông qua API danh sách đơn hàng.
7. Màn hình quản lý tại Frontend (được cập nhật liên tục) nhận diện cờ vi phạm SLA của đơn hàng:
   * Kích hoạt còi báo động đỏ nhấp nháy 🚨 bên cạnh mã đơn hàng.
   * Tô màu đỏ dòng đơn hàng bị vi phạm.
   * Hiển thị thời gian đã quá hạn (Ví dụ: "Quá hạn 15 phút").
8. Nhân viên nhìn thấy cảnh báo và ưu tiên xử lý đơn hàng bị tồn đọng này trước.

#### Luồng sự kiện thay thế & Ngoại lệ
* **Thay thế (Xử lý giải tỏa cảnh báo)**: Ngay sau khi nhân viên thao tác chuyển đơn hàng sang trạng thái tiếp theo, cờ vi phạm SLA tại trạng thái cũ tự động biến mất và bộ đếm thời gian SLA cho trạng thái mới bắt đầu chạy lại từ 0.

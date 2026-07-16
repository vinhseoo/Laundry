# Chương 3 (Tiếp theo)

## 3.2. Hiện thực hóa các chức năng & Mô tả giao diện

Phần này trình bày cách triển khai chi tiết mã nguồn tiêu biểu ở Backend và thiết kế giao diện tương tác Frontend của hệ thống **BubbleFlow**.

---

### 3.2.1. Module Đăng nhập & Phân quyền động (Dynamic RBAC)

#### 1. Triển khai Backend: Bộ lọc phân quyền động (Spring Security)
Hệ thống sử dụng lớp cấu hình `DynamicAuthorizationManager` thực thi giao diện `AuthorizationManager<RequestAuthorizationContext>` để kiểm soát quyền truy cập của mọi API Request đến hệ thống một cách linh hoạt:

```java
@Component
@RequiredArgsConstructor
public class DynamicAuthorizationManager implements AuthorizationManager<RequestAuthorizationContext> {

    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;

    @Override
    public AuthorizationDecision check(Supplier<Authentication> authentication, RequestAuthorizationContext context) {
        HttpServletRequest request = context.getRequest();
        String path = request.getRequestURI();
        String method = request.getMethod();

        // 1. Bỏ qua kiểm tra đối với các API công khai (Login, Swagger, etc.)
        if (path.startsWith("/api/auth/login") || path.startsWith("/swagger-ui")) {
            return new AuthorizationDecision(true);
        }

        Authentication auth = authentication.get();
        if (auth == null || !auth.isAuthenticated()) {
            return new AuthorizationDecision(false);
        }

        // 2. Lấy danh sách Roles của người dùng hiện tại
        Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
        List<String> userRoles = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        // Nếu người dùng có quyền ADMIN (RoleType = ALL), cho phép truy cập tất cả
        if (userRoles.contains("ROLE_ADMIN")) {
            return new AuthorizationDecision(true);
        }

        // 3. Truy vấn Database để khớp URL + Method với Quyền
        Optional<Permission> matchedPermission = permissionRepository.findByPathAndMethod(path, method);
        if (matchedPermission.isEmpty()) {
            // Không tìm thấy cấu hình quyền cho API này -> Mặc định từ chối
            return new AuthorizationDecision(false);
        }

        // 4. Kiểm tra xem Role của người dùng có chứa Permission này không
        Long permissionId = matchedPermission.get().getId();
        boolean hasPermission = rolePermissionRepository.existsByRoleNamesAndPermissionId(userRoles, permissionId);

        return new AuthorizationDecision(hasPermission);
    }
}
```

#### 2. Giao diện Đăng nhập Glassmorphism
Trang đăng nhập được thiết kế với phong cách **Glassmorphism** thời thượng trên nền dốc (Gradient background) Indigo và Violet. Trên nền hiển thị hiệu ứng các bong bóng xà phòng động bay lên chậm rãi từ đáy màn hình bằng hiệu ứng CSS Keyframe. Khung đăng nhập có độ mờ nhám (backdrop-filter: blur) cùng viền bán trong suốt tạo cảm giác premium cao cấp.

---

### 3.2.2. Module Quản lý Dịch vụ & Giám sát Thiết bị

#### 1. Lưới giám sát thiết bị thời gian thực (Equipment Monitoring Grid)
Tại Frontend, màn hình quản lý thiết bị được thiết kế dưới dạng Grid (lưới) trực quan. Mỗi máy giặt hoặc máy sấy được biểu diễn bằng một thẻ Card hình chữ nhật đứng (mô phỏng hình dáng máy thật):
* **Máy rảnh (IDLE)**: Viền và nền Teal nhạt, chữ xanh Teal dịu mắt.
* **Máy đang chạy (RUNNING)**: Viền và nền Indigo, hiển thị kèm mã giỏ đồ đang chạy bên trong và vòng tròn quay động thể hiện máy đang hoạt động.
* **Máy bảo trì (MAINTENANCE)**: Nền xám nhạt, có biểu tượng cờ lê 🔧.
* **Máy hỏng (OUT_OF_SERVICE)**: Viền đỏ nhạt, hiển thị cảnh báo ngưng hoạt động.

*Giao diện tự động cập nhật trạng thái ngay lập tức khi nhân viên thao tác gán giỏ đồ nhờ cơ chế React Query refetch dữ liệu định kỳ.*

---

### 3.2.3. Module Tiếp nhận đơn & Điều phối

#### 1. Giao diện Tiếp nhận đơn hàng (Order Intake)
* **Biểu mẫu thông tin**: Nhân viên chỉ cần nhập số điện thoại khách hàng, hệ thống tự động tra cứu nhanh qua database và hiển thị họ tên cũ.
* **Bảng tính tiền động**: Khi nhân viên chọn dịch vụ giặt sấy tiêu chuẩn (ví dụ 15,000đ/kg) và nhập số ký đồ bẩn là `6.5`, hệ thống sử dụng state của React để nhân trực tiếp và hiển thị tổng tiền `97,500đ` theo thời gian thực mà không cần tải lại trang.
* **Hóa đơn nhiệt K80**: Khi nhấn "Tạo đơn", hệ thống sinh mã đơn dạng Barcode, hiển thị mẫu hóa đơn biên nhận gọn gàng gồm: Logo BubbleFlow, mã đơn hàng, tên khách hàng, chi tiết dịch vụ, tổng tiền và cam kết thời gian hoàn thành (SLA).

#### 2. Thao tác Điều phối đơn hàng (Dispatching)
Màn hình điều phối là nơi kết nối giữa Đơn hàng, Giỏ đồ và Máy móc. Nhân viên chọn đơn hàng ở danh sách bên trái, chọn giỏ đồ trống ở giữa, và nhấp chọn một máy giặt/sấy đang rảnh ở bên phải. Hệ thống kiểm soát tính đúng đắn: máy giặt chỉ chấp nhận giỏ đồ ở khâu giặt, máy sấy chỉ chấp nhận giỏ đồ ở khâu sấy.

---

### 3.2.4. Module Vòng đời đơn hàng & Cảnh báo SLA

#### 1. Triển khai Backend: Cấu hình Spring Statemachine
Vòng đời đơn hàng được quản lý chặt chẽ thông qua cấu hình máy trạng thái của Spring:

```java
@Configuration
@EnableStateMachineFactory
public class OrderStateMachineConfig extends StateMachineConfigurerAdapter<OrderState, OrderEvent> {

    @Override
    public void configure(StateMachineStateConfigurer<OrderState, OrderEvent> states) throws Exception {
        states
            .withStates()
            .initial(OrderState.RECEIVED)
            .states(EnumSet.allOf(OrderState.class));
    }

    @Override
    public void configure(StateMachineTransitionConfigurer<OrderState, OrderEvent> transitions) throws Exception {
        transitions
            .withExternal().source(OrderState.RECEIVED).target(OrderState.SORTING).event(OrderEvent.START_SORT)
            .and()
            .withExternal().source(OrderState.SORTING).target(OrderState.WASHING).event(OrderEvent.START_WASH)
            .and()
            .withExternal().source(OrderState.WASHING).target(OrderState.DRYING).event(OrderEvent.START_DRY)
            .and()
            .withExternal().source(OrderState.DRYING).target(OrderState.AWAITING_DELIVERY).event(OrderEvent.FINISH_PROCESS)
            .and()
            .withExternal().source(OrderState.AWAITING_DELIVERY).target(OrderState.COMPLETED).event(OrderEvent.DELIVER);
    }
}
```

#### 2. Cảnh báo trực quan SLA (SLA Alerts UI)
Trên màn hình **Danh sách đơn hàng (Order List)**:
* Các đơn hàng bị quá thời gian cho phép tại bước hiện tại (ví dụ: nằm ở khâu `SORTING` quá 30 phút do nhân viên quên phân loại) sẽ lập tức bị gắn cờ `slaBreached: true`.
* **Còi báo động đỏ nhấp nháy 🚨**: Được thiết kế bằng CSS Animation hiệu ứng nhấp nháy liên tục (blink effect) kết hợp viền đỏ bao quanh hàng đơn hàng đó để thu hút sự chú ý tối đa của nhân viên.
* **Expandable Row (Dòng mở rộng)**: Khi click vào một đơn hàng, dòng chi tiết sẽ mở rộng xuống dưới hiển thị một thanh tiến trình ngang (`Steps` component của Antd) thể hiện rõ lịch sử thời gian đơn hàng đi qua từng trạng thái và khoanh vùng đỏ tại bước đang bị tắc nghẽn giúp nhân viên dễ dàng kiểm soát xử lý.

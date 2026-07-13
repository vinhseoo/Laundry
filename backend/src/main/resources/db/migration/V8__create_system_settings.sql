-- =========================================================
-- V8: Create System Settings table and seed configuration
-- =========================================================

CREATE TABLE system_settings (
    id             BIGSERIAL PRIMARY KEY,
    setting_key    VARCHAR(100) NOT NULL UNIQUE,
    setting_value  VARCHAR(255) NOT NULL,
    description    VARCHAR(255),
    group_name     VARCHAR(50) NOT NULL DEFAULT 'STORE_INFO', -- STORE_INFO, SLA, FINANCIAL
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP,
    created_by     VARCHAR(100),
    updated_by     VARCHAR(100),
    version        BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_system_settings_key ON system_settings(setting_key);

-- Seed Default Settings
INSERT INTO system_settings (setting_key, setting_value, description, group_name, created_by) VALUES
('store_name', 'BubbleFlow Premium Laundry', 'Tên cửa hàng giặt là', 'STORE_INFO', 'system'),
('store_phone', '0987654321', 'Số điện thoại liên hệ', 'STORE_INFO', 'system'),
('store_address', '123 Đường Láng, Đống Đa, Hà Nội', 'Địa chỉ cửa hàng', 'STORE_INFO', 'system'),
('sla_received_sorting', '120', 'SLA thời gian phân loại tối đa (phút)', 'SLA', 'system'),
('sla_washing_drying', '60', 'SLA thời gian giặt/sấy tối đa (phút)', 'SLA', 'system'),
('sla_awaiting_delivery', '1440', 'SLA thời gian chờ giao nhận trả đồ tối đa (phút)', 'SLA', 'system'),
('vat_rate', '8', 'Thuế giá trị gia tăng VAT (%)', 'FINANCIAL', 'system');

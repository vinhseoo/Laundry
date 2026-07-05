-- =============================================
-- V3: Create Services and Equipments tables
-- =============================================

-- Create services table
CREATE TABLE services (
    id            BIGSERIAL PRIMARY KEY,
    code          VARCHAR(50) NOT NULL UNIQUE,
    name          VARCHAR(200) NOT NULL,
    description   TEXT,
    price         NUMERIC(12, 2) NOT NULL,
    price_unit    VARCHAR(50) NOT NULL, -- e.g. KG, ITEM
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP,
    created_by    VARCHAR(100),
    updated_by    VARCHAR(100),
    version       BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_services_code ON services(code);
CREATE INDEX idx_services_is_active ON services(is_active);

-- Create equipments table
CREATE TABLE equipments (
    id            BIGSERIAL PRIMARY KEY,
    code          VARCHAR(50) NOT NULL UNIQUE,
    name          VARCHAR(200) NOT NULL,
    type          VARCHAR(50) NOT NULL, -- e.g. WASHING_MACHINE, DRYER
    capacity      DOUBLE PRECISION NOT NULL, -- e.g. 11.0, 15.0 kg
    status        VARCHAR(50) NOT NULL, -- e.g. IDLE, RUNNING, MAINTENANCE, OUT_OF_SERVICE
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP,
    created_by    VARCHAR(100),
    updated_by    VARCHAR(100),
    version       BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_equipments_code ON equipments(code);
CREATE INDEX idx_equipments_status ON equipments(status);
CREATE INDEX idx_equipments_is_active ON equipments(is_active);

-- Seed Services
INSERT INTO services (code, name, description, price, price_unit, created_by) VALUES
('GIAT_SAY_TIEU_CHUAN', 'Giặt sấy tiêu chuẩn', 'Giặt nước ấm, sấy khô hoàn toàn, gấp đồ gọn gàng (tính theo cân nặng)', 15000.00, 'KG', 'system'),
('GIAT_SAY_NHANH', 'Giặt sấy nhanh', 'Giặt sấy lấy ngay trong vòng 2 giờ (tính theo cân nặng)', 25000.00, 'KG', 'system'),
('GIAT_KHO_VEST', 'Giặt khô áo Vest', 'Giặt khô chuyên nghiệp cho áo Vest nam/nữ (tính theo chiếc)', 80000.00, 'ITEM', 'system'),
('GIAT_KHO_VAY_CUOI', 'Giặt khô Váy cưới', 'Hấp giặt khô cao cấp và bảo quản váy cưới (tính theo chiếc)', 200000.00, 'ITEM', 'system'),
('GIAT_HAP_GIAY', 'Giặt hấp giày', 'Làm sạch sâu vết bẩn, khử mùi và diệt khuẩn cho giày thể thao/sneaker', 50000.00, 'ITEM', 'system');

-- Seed Equipments
INSERT INTO equipments (code, name, type, capacity, status, created_by) VALUES
('WASH_01', 'Máy giặt Electrolux 11kg A', 'WASHING_MACHINE', 11.0, 'IDLE', 'system'),
('WASH_02', 'Máy giặt Electrolux 11kg B', 'WASHING_MACHINE', 11.0, 'RUNNING', 'system'),
('WASH_03', 'Máy giặt LG Giant-C 15kg A', 'WASHING_MACHINE', 15.0, 'IDLE', 'system'),
('WASH_04', 'Máy giặt LG Giant-C 15kg B', 'WASHING_MACHINE', 15.0, 'MAINTENANCE', 'system'),
('DRY_01', 'Máy sấy Electrolux 9kg A', 'DRYER', 9.0, 'IDLE', 'system'),
('DRY_02', 'Máy sấy Electrolux 9kg B', 'DRYER', 9.0, 'RUNNING', 'system'),
('DRY_03', 'Máy sấy LG Giant-C 14kg A', 'DRYER', 14.0, 'IDLE', 'system'),
('DRY_04', 'Máy sấy LG Giant-C 14kg B', 'DRYER', 14.0, 'OUT_OF_SERVICE', 'system');

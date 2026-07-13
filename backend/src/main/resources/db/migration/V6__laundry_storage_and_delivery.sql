-- =========================================================
-- V6: Create Storage Racks and expand Orders for Delivery
-- =========================================================

-- Create storage_racks table
CREATE TABLE storage_racks (
    id             BIGSERIAL PRIMARY KEY,
    code           VARCHAR(50) NOT NULL UNIQUE,
    name           VARCHAR(100) NOT NULL UNIQUE,
    status         VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE, OCCUPIED, MAINTENANCE
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP,
    created_by     VARCHAR(100),
    updated_by     VARCHAR(100),
    version        BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_storage_racks_code ON storage_racks(code);
CREATE INDEX idx_storage_racks_status ON storage_racks(status);
CREATE INDEX idx_storage_racks_is_active ON storage_racks(is_active);

-- Seed initial storage racks
INSERT INTO storage_racks (code, name, status, created_by) VALUES
('RACK_A1', 'Kệ A - Tầng 1', 'AVAILABLE', 'system'),
('RACK_A2', 'Kệ A - Tầng 2', 'AVAILABLE', 'system'),
('RACK_A3', 'Kệ A - Tầng 3', 'AVAILABLE', 'system'),
('RACK_B1', 'Kệ B - Tầng 1', 'AVAILABLE', 'system'),
('RACK_B2', 'Kệ B - Tầng 2', 'AVAILABLE', 'system'),
('RACK_B3', 'Kệ B - Tầng 3', 'AVAILABLE', 'system');

-- Alter orders table to include storage rack and delivery info
ALTER TABLE orders ADD COLUMN storage_rack_id BIGINT REFERENCES storage_racks(id);
ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50) NOT NULL DEFAULT 'UNPAID';
ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50);
ALTER TABLE orders ADD COLUMN delivery_type VARCHAR(50) NOT NULL DEFAULT 'PICKUP'; -- PICKUP, SHIPPER
ALTER TABLE orders ADD COLUMN shipper_name VARCHAR(150);
ALTER TABLE orders ADD COLUMN shipper_phone VARCHAR(50);
ALTER TABLE orders ADD COLUMN delivered_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN delivered_by VARCHAR(100);

-- Indexes for orders new fields
CREATE INDEX idx_orders_storage_rack_id ON orders(storage_rack_id);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_delivery_type ON orders(delivery_type);

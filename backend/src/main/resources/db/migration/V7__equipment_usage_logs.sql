-- =========================================================
-- V7: Create Equipment Usage Logs and seed historical stats
-- =========================================================

-- Create equipment_usage_logs table
CREATE TABLE equipment_usage_logs (
    id             BIGSERIAL PRIMARY KEY,
    equipment_id   BIGINT NOT NULL REFERENCES equipments(id),
    order_id       BIGINT REFERENCES orders(id),
    start_time     TIMESTAMP NOT NULL DEFAULT NOW(),
    end_time       TIMESTAMP,
    duration_minutes BIGINT,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP,
    created_by     VARCHAR(100),
    updated_by     VARCHAR(100),
    version        BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_equipment_usage_logs_equipment_id ON equipment_usage_logs(equipment_id);
CREATE INDEX idx_equipment_usage_logs_start_time ON equipment_usage_logs(start_time);

-- Seed historical orders for the last 7 days to populate daily revenue chart
INSERT INTO orders (order_code, customer_name, customer_phone, total_amount, status, payment_status, payment_method, delivery_type, created_at, is_active) VALUES
('ORD-2026070701', 'Nguyễn Văn A', '0912345678', 120000.00, 'COMPLETED', 'PAID', 'CASH', 'PICKUP', NOW() - INTERVAL '6 days', TRUE),
('ORD-2026070702', 'Lê Văn B', '0912345679', 150000.00, 'COMPLETED', 'PAID', 'MOMO', 'PICKUP', NOW() - INTERVAL '6 days', TRUE),
('ORD-2026070801', 'Trần Thị C', '0912345680', 75000.00, 'COMPLETED', 'PAID', 'BANK_TRANSFER', 'PICKUP', NOW() - INTERVAL '5 days', TRUE),
('ORD-2026070802', 'Nguyễn Thị D', '0912345681', 200000.00, 'COMPLETED', 'PAID', 'CASH', 'SHIPPER', NOW() - INTERVAL '5 days', TRUE),
('ORD-2026070901', 'Phạm Văn E', '0912345682', 45000.00, 'COMPLETED', 'PAID', 'MOMO', 'PICKUP', NOW() - INTERVAL '4 days', TRUE),
('ORD-2026070902', 'Vũ Thị F', '0912345683', 350000.00, 'COMPLETED', 'PAID', 'BANK_TRANSFER', 'SHIPPER', NOW() - INTERVAL '4 days', TRUE),
('ORD-2026071001', 'Đỗ Văn G', '0912345684', 90000.00, 'COMPLETED', 'PAID', 'CASH', 'PICKUP', NOW() - INTERVAL '3 days', TRUE),
('ORD-2026071002', 'Ngô Thị H', '0912345685', 180000.00, 'COMPLETED', 'PAID', 'MOMO', 'PICKUP', NOW() - INTERVAL '3 days', TRUE),
('ORD-2026071101', 'Bùi Văn I', '0912345686', 110000.00, 'COMPLETED', 'PAID', 'BANK_TRANSFER', 'PICKUP', NOW() - INTERVAL '2 days', TRUE),
('ORD-2026071102', 'Hoàng Thị J', '0912345687', 220000.00, 'COMPLETED', 'PAID', 'CASH', 'SHIPPER', NOW() - INTERVAL '2 days', TRUE),
('ORD-2026071201', 'Đặng Văn K', '0912345688', 130000.00, 'COMPLETED', 'PAID', 'MOMO', 'PICKUP', NOW() - INTERVAL '1 days', TRUE),
('ORD-2026071202', 'Mai Thị L', '0912345689', 95000.00, 'COMPLETED', 'PAID', 'BANK_TRANSFER', 'PICKUP', NOW() - INTERVAL '1 days', TRUE);

-- Helper mapping to link order items for pricing charts
-- Order IDs are typically 1, 2, 3... in a clean DB. We link service IDs to order items.
-- Since order IDs are generated sequentially, let's select from orders.
-- To ensure order_items are present, let's insert some items
INSERT INTO order_items (order_id, service_id, quantity, unit_price, subtotal, created_at)
SELECT o.id, 1, 3.5, 15000.00, 52500.00, o.created_at FROM orders o;
INSERT INTO order_items (order_id, service_id, quantity, unit_price, subtotal, created_at)
SELECT o.id, 3, 1, 80000.00, 80000.00, o.created_at FROM orders o WHERE o.total_amount > 100000.00;

-- Seed historical logs for machine usage
-- Machine 1 (Electrolux 11kg A)
INSERT INTO equipment_usage_logs (equipment_id, start_time, end_time, duration_minutes, created_by) VALUES
(1, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '45 minutes', 45, 'system'),
(1, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '50 minutes', 50, 'system'),
(1, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '40 minutes', 40, 'system'),
(1, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '45 minutes', 45, 'system'),
(1, NOW() - INTERVAL '1 days', NOW() - INTERVAL '1 days' + INTERVAL '55 minutes', 55, 'system');

-- Machine 2 (Electrolux 11kg B)
INSERT INTO equipment_usage_logs (equipment_id, start_time, end_time, duration_minutes, created_by) VALUES
(2, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '60 minutes', 60, 'system'),
(2, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '55 minutes', 55, 'system'),
(2, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '65 minutes', 65, 'system'),
(2, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '50 minutes', 50, 'system'),
(2, NOW() - INTERVAL '1 days', NOW() - INTERVAL '1 days' + INTERVAL '60 minutes', 60, 'system');

-- Machine 3 (LG Giant-C 15kg A)
INSERT INTO equipment_usage_logs (equipment_id, start_time, end_time, duration_minutes, created_by) VALUES
(3, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days' + INTERVAL '80 minutes', 80, 'system'),
(3, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '75 minutes', 75, 'system'),
(3, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '85 minutes', 85, 'system'),
(3, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '70 minutes', 70, 'system'),
(3, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '90 minutes', 90, 'system'),
(3, NOW() - INTERVAL '1 days', NOW() - INTERVAL '1 days' + INTERVAL '75 minutes', 75, 'system');

-- Machine 5 (Electrolux 9kg A)
INSERT INTO equipment_usage_logs (equipment_id, start_time, end_time, duration_minutes, created_by) VALUES
(5, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '45 minutes', 45, 'system'),
(5, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '40 minutes', 40, 'system'),
(5, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '50 minutes', 50, 'system'),
(5, NOW() - INTERVAL '1 days', NOW() - INTERVAL '1 days' + INTERVAL '45 minutes', 45, 'system');

-- Machine 6 (Electrolux 9kg B)
INSERT INTO equipment_usage_logs (equipment_id, start_time, end_time, duration_minutes, created_by) VALUES
(6, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '55 minutes', 55, 'system'),
(6, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '60 minutes', 60, 'system'),
(6, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '50 minutes', 50, 'system'),
(6, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '55 minutes', 55, 'system'),
(6, NOW() - INTERVAL '1 days', NOW() - INTERVAL '1 days' + INTERVAL '60 minutes', 60, 'system');

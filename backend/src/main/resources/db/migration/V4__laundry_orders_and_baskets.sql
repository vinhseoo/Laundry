-- =========================================================
-- V4: Create Orders, Order Items, and Laundry Baskets tables
-- =========================================================

-- Create orders table
CREATE TABLE orders (
    id             BIGSERIAL PRIMARY KEY,
    order_code     VARCHAR(50) NOT NULL UNIQUE,
    customer_name  VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    total_amount   NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status         VARCHAR(50) NOT NULL DEFAULT 'RECEIVED',
    notes          TEXT,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP,
    created_by     VARCHAR(100),
    updated_by     VARCHAR(100),
    version        BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_orders_code ON orders(order_code);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_is_active ON orders(is_active);

-- Create order_items table
CREATE TABLE order_items (
    id             BIGSERIAL PRIMARY KEY,
    order_id       BIGINT NOT NULL REFERENCES orders(id),
    service_id     BIGINT NOT NULL REFERENCES services(id),
    quantity       NUMERIC(10, 2) NOT NULL,
    unit_price     NUMERIC(12, 2) NOT NULL,
    subtotal       NUMERIC(12, 2) NOT NULL,
    notes          TEXT,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP,
    created_by     VARCHAR(100),
    updated_by     VARCHAR(100),
    version        BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_service_id ON order_items(service_id);
CREATE INDEX idx_order_items_is_active ON order_items(is_active);

-- Create laundry_baskets table
CREATE TABLE laundry_baskets (
    id             BIGSERIAL PRIMARY KEY,
    basket_code    VARCHAR(50) NOT NULL UNIQUE,
    name           VARCHAR(100),
    order_id       BIGINT REFERENCES orders(id),
    equipment_id   BIGINT REFERENCES equipments(id),
    status         VARCHAR(50) NOT NULL DEFAULT 'IDLE', -- IDLE, USING
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP,
    created_by     VARCHAR(100),
    updated_by     VARCHAR(100),
    version        BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_laundry_baskets_code ON laundry_baskets(basket_code);
CREATE INDEX idx_laundry_baskets_order_id ON laundry_baskets(order_id);
CREATE INDEX idx_laundry_baskets_equipment_id ON laundry_baskets(equipment_id);
CREATE INDEX idx_laundry_baskets_status ON laundry_baskets(status);
CREATE INDEX idx_laundry_baskets_is_active ON laundry_baskets(is_active);

-- Seed initial laundry baskets
INSERT INTO laundry_baskets (basket_code, name, status, created_by) VALUES
('BSK_01', 'Giỏ đồ xanh A', 'IDLE', 'system'),
('BSK_02', 'Giỏ đồ xanh B', 'IDLE', 'system'),
('BSK_03', 'Giỏ đồ đỏ A', 'IDLE', 'system'),
('BSK_04', 'Giỏ đồ đỏ B', 'IDLE', 'system'),
('BSK_05', 'Giỏ đồ vàng A', 'IDLE', 'system'),
('BSK_06', 'Giỏ đồ vàng B', 'IDLE', 'system');

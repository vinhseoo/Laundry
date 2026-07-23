-- =========================================================
-- V9: Create Customers table and link existing orders
-- =========================================================

-- Create customers table
CREATE TABLE customers (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    phone       VARCHAR(20) NOT NULL UNIQUE,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP,
    created_by  VARCHAR(100),
    updated_by  VARCHAR(100),
    version     BIGINT NOT NULL DEFAULT 0
);

-- Seed customers from existing unique customer info in orders
INSERT INTO customers (name, phone, created_by)
SELECT DISTINCT customer_name, customer_phone, 'migration'
FROM orders
ON CONFLICT (phone) DO NOTHING;

-- Link orders to customers table
ALTER TABLE orders ADD COLUMN customer_id BIGINT REFERENCES customers(id);

-- Update customer_id in orders by matching phone
UPDATE orders o
SET customer_id = (SELECT id FROM customers c WHERE c.phone = o.customer_phone LIMIT 1);

-- Create indexes for performance
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_is_active ON customers(is_active);

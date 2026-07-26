-- =======================================================
-- V12: Add customer notification tracking to orders
-- =======================================================

ALTER TABLE orders ADD COLUMN customer_notified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN notified_at TIMESTAMP;

CREATE INDEX idx_orders_customer_notified ON orders(customer_notified);

-- Indexes for performance tuning in BubbleFlow

-- Optimize Order queries
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_is_active ON orders (is_active);

-- Optimize Order State Logs mapping
CREATE INDEX idx_order_state_logs_order_id ON order_state_logs (order_id);

-- Optimize Order Items mapping
CREATE INDEX idx_order_items_order_id ON order_items (order_id);

-- Optimize Laundry Baskets mappings
CREATE INDEX idx_laundry_baskets_order_id ON laundry_baskets (order_id);
CREATE INDEX idx_laundry_baskets_equipment_id ON laundry_baskets (equipment_id);

-- Optimize Notifications query
CREATE INDEX idx_notifications_user_is_read ON notifications (user_id, is_read);

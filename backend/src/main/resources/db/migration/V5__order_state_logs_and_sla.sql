-- =======================================================
-- V5: Create Order State Logs table for SLA calculations
-- =======================================================

CREATE TABLE order_state_logs (
    id          BIGSERIAL PRIMARY KEY,
    order_id    BIGINT NOT NULL REFERENCES orders(id),
    from_state  VARCHAR(50),
    to_state    VARCHAR(50) NOT NULL,
    changed_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    changed_by  VARCHAR(100),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP,
    created_by  VARCHAR(100),
    updated_by  VARCHAR(100),
    version     BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_order_state_logs_order_id ON order_state_logs(order_id);
CREATE INDEX idx_order_state_logs_changed_at ON order_state_logs(changed_at);

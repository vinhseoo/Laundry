-- =========================================================
-- V10: Create Notifications table
-- =========================================================

CREATE TABLE notifications (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(150) NOT NULL,
    content     TEXT NOT NULL,
    type        VARCHAR(50) NOT NULL, -- SLA_WARNING, MACHINE_COMPLETED, SYSTEM
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    user_id     BIGINT REFERENCES users(id) ON DELETE CASCADE, -- null if broadcast to all users
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    version     BIGINT NOT NULL DEFAULT 0
);

-- Indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

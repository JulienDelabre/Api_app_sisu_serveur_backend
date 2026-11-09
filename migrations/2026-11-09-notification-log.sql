-- Journal d’idempotence des notifications push envoyées par le cron.
CREATE TABLE IF NOT EXISTS notification_log (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  type VARCHAR(50) NOT NULL,
  local_date DATE NOT NULL,
  status ENUM('pending','sent') NOT NULL DEFAULT 'pending',
  detail VARCHAR(120) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_notification_log_user_type_date (user_id, type, local_date),
  KEY idx_notification_log_created (created_at),
  CONSTRAINT fk_notification_log_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SISU app user-owned data not yet represented by the normalized API tables.
-- Run once on the production MariaDB database before deploying this backend revision.
CREATE TABLE IF NOT EXISTS user_app_state (
  user_id CHAR(36) NOT NULL,
  state_key VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  state_value JSON NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, state_key),
  CONSTRAINT fk_user_app_state_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

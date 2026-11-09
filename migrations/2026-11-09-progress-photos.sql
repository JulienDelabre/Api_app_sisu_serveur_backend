-- Progress and inspiration photos belong to the user's account and are never stored on-device.
CREATE TABLE IF NOT EXISTS user_progress_photos (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  photo_type ENUM('progress','current','inspiration') NOT NULL,
  label VARCHAR(120) NULL,
  mime_type ENUM('image/jpeg','image/png','image/webp') NOT NULL,
  image MEDIUMBLOB NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_progress_photos_created (user_id, created_at),
  CONSTRAINT fk_user_progress_photos_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

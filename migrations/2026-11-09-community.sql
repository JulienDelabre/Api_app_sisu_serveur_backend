-- Shared community content and weekly challenge catalog.
-- Run this migration before deploying the community routes.
CREATE TABLE IF NOT EXISTS community_posts (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  category ENUM('sport','food','skincare','mind') NOT NULL,
  content VARCHAR(1000) NOT NULL DEFAULT '',
  compiled_data JSON NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_community_posts_created (created_at),
  KEY idx_community_posts_user_day (user_id, created_at),
  CONSTRAINT fk_community_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_post_reactions (
  post_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  reaction ENUM('heart','muscle','rocket') NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, user_id, reaction),
  KEY idx_community_reactions_user (user_id),
  CONSTRAINT fk_community_reactions_post FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_community_reactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_challenges (
  id VARCHAR(64) NOT NULL,
  title VARCHAR(160) NOT NULL,
  subtitle VARCHAR(500) NOT NULL DEFAULT '',
  category ENUM('sport','food','skincare','mind') NOT NULL,
  duration_days SMALLINT UNSIGNED NOT NULL DEFAULT 7,
  target_value DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit VARCHAR(30) NOT NULL DEFAULT 'fois',
  active TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY idx_community_challenges_active (active, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_challenge_memberships (
  user_id CHAR(36) NOT NULL,
  challenge_id VARCHAR(64) NOT NULL,
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, challenge_id),
  KEY idx_challenge_memberships_challenge (challenge_id),
  CONSTRAINT fk_challenge_memberships_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_challenge_memberships_challenge FOREIGN KEY (challenge_id) REFERENCES community_challenges(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO community_challenges (id, title, subtitle, category, duration_days, target_value, unit)
VALUES
  ('ch-sport', 'Défi Sport · séances de régularité', 'Valider ses entraînements cette semaine', 'sport', 7, 3, 'séances'),
  ('ch-food', 'Défi Nutrition · journal alimentaire', 'Enregistrer ses repas et garder le cap', 'food', 7, 5, 'repas'),
  ('ch-skincare', 'Défi Skincare · routine régulière', 'Suivre sa routine de soin chaque jour', 'skincare', 7, 5, 'jours'),
  ('ch-mind', 'Défi Bien-être · temps pour soi', 'Réaliser des actions de respiration, méditation ou journal', 'mind', 7, 5, 'actions')
ON DUPLICATE KEY UPDATE
  title = VALUES(title), subtitle = VALUES(subtitle), category = VALUES(category),
  duration_days = VALUES(duration_days), target_value = VALUES(target_value), unit = VALUES(unit), active = 1;

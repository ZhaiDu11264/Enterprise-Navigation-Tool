-- Migration: 004_add_user_profile_fields
-- Description: Add profile fields for user display name and avatar
-- Date: 2024-01-13

SET @sql_display_name := (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = 'users'
        AND column_name = 'display_name'
    ),
    'SELECT 1',
    'ALTER TABLE users ADD COLUMN display_name VARCHAR(80) NULL AFTER username'
  )
);
PREPARE stmt_display_name FROM @sql_display_name;
EXECUTE stmt_display_name;
DEALLOCATE PREPARE stmt_display_name;

SET @sql_avatar_url := (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = 'users'
        AND column_name = 'avatar_url'
    ),
    'SELECT 1',
    'ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) NULL AFTER display_name'
  )
);
PREPARE stmt_avatar_url FROM @sql_avatar_url;
EXECUTE stmt_avatar_url;
DEALLOCATE PREPARE stmt_avatar_url;

SET @sql_updated_at := (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = 'users'
        AND column_name = 'updated_at'
    ),
    'SELECT 1',
    'ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER last_login_at'
  )
);
PREPARE stmt_updated_at FROM @sql_updated_at;
EXECUTE stmt_updated_at;
DEALLOCATE PREPARE stmt_updated_at;

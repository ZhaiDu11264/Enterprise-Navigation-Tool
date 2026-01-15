-- Migration: 006_add_notifications
-- Description: Add notifications for admin broadcasts and user targeting
-- Date: 2026-01-14

CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  level ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_created_by (created_by),
  INDEX idx_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS notification_recipients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  notification_id INT NOT NULL,
  user_id INT NOT NULL,
  read_at TIMESTAMP NULL,
  delivered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_notification_user (notification_id, user_id),
  INDEX idx_user_read (user_id, read_at)
);

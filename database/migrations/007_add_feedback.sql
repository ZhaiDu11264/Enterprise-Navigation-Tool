-- Migration: 007_add_feedback
-- Description: Add user feedback entries
-- Date: 2026-01-15

CREATE TABLE IF NOT EXISTS user_feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('bug', 'feature', 'ui', 'data', 'other') NOT NULL,
  message TEXT NOT NULL,
  status ENUM('new', 'reviewed', 'resolved') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_feedback_user (user_id),
  INDEX idx_feedback_type (type),
  INDEX idx_feedback_status (status),
  INDEX idx_feedback_created (created_at)
);

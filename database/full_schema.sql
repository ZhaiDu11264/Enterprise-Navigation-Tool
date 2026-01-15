-- ============================================================================
-- Enterprise Navigation Tool - 完整数据库导入脚本
-- ============================================================================
-- 版本: 1.0
-- 生成日期: 2026-01-15
-- 描述: 整合所有迁移脚本的完整数据库架构
-- 数据库: MySQL 8.0+
-- ============================================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS enterprise_navigation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE enterprise_navigation;

-- ============================================================================
-- 1. 用户表 (users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(80) NULL,
  avatar_url VARCHAR(500) NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. 分组表 (groups)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `groups` (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_system_group BOOLEAN DEFAULT FALSE,
  is_deletable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_sort (user_id, sort_order),
  INDEX idx_user_active (user_id, is_active),
  INDEX idx_system_group (is_system_group)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. 网站链接表 (website_links)
-- ============================================================================
CREATE TABLE IF NOT EXISTS website_links (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  group_id INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  icon_url VARCHAR(500),
  sort_order INT DEFAULT 0,
  is_favorite BOOLEAN DEFAULT FALSE,
  access_count INT DEFAULT 0,
  last_accessed_at TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_system_link BOOLEAN DEFAULT FALSE,
  is_deletable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE CASCADE,
  INDEX idx_user_group_sort (user_id, group_id, sort_order),
  INDEX idx_user_favorite (user_id, is_favorite),
  INDEX idx_user_active (user_id, is_active),
  INDEX idx_system_link (is_system_link),
  FULLTEXT idx_search (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- 4. 默认配置表 (default_configurations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS default_configurations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  config_data JSON NOT NULL,
  version INT DEFAULT 1,
  is_active BOOLEAN DEFAULT FALSE,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_active (is_active),
  INDEX idx_version (version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. 用户会话表 (user_sessions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id VARCHAR(128) PRIMARY KEY,
  user_id INT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_expires (user_id, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. Favicon缓存表 (favicon_cache)
-- ============================================================================
CREATE TABLE IF NOT EXISTS favicon_cache (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain VARCHAR(255) UNIQUE NOT NULL,
  icon_url VARCHAR(500) NOT NULL,
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  
  INDEX idx_domain_expires (domain, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. 审计日志表 (audit_logs)
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(80) NOT NULL,
  entity_type VARCHAR(40) NULL,
  entity_id INT NULL,
  description VARCHAR(500) NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_audit_logs_created_at (created_at),
  INDEX idx_audit_logs_user_id (user_id),
  INDEX idx_audit_logs_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. 通知表 (notifications)
-- ============================================================================
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 9. 通知接收者表 (notification_recipients)
-- ============================================================================
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 10. 用户反馈表 (user_feedback)
-- ============================================================================
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- 初始数据
-- ============================================================================

-- 插入默认管理员用户 (密码: admin123)
-- 注意: 生产环境请务必修改密码
INSERT INTO users (username, email, password_hash, role) VALUES 
('admin', 'admin@company.com', '$2b$10$rQZ8kJZjZjZjZjZjZjZjZeK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'admin')
ON DUPLICATE KEY UPDATE username = username;

-- 插入默认配置（包含内部办公系统）
INSERT INTO default_configurations (name, description, config_data, is_active, created_by) VALUES 
('Default Enterprise Configuration', 'Standard configuration for new users with internal office systems', 
'{
  "groups": [
    {
      "name": "内部办公",
      "description": "公司内部办公系统（管理员配置，不可删除）",
      "sortOrder": 0,
      "isSystemGroup": true,
      "isDeletable": false
    }
  ],
  "links": [
    {
      "name": "公司网站",
      "url": "http://wm.czgm.com",
      "description": "公司官方网站",
      "groupName": "内部办公",
      "sortOrder": 0,
      "isSystemLink": true,
      "isDeletable": false
    },
    {
      "name": "协同办公系统(OA)",
      "url": "http://oa.czgm.com",
      "description": "办公自动化系统",
      "groupName": "内部办公",
      "sortOrder": 1,
      "isSystemLink": true,
      "isDeletable": false
    },
    {
      "name": "人力资源系统(EHR)",
      "url": "http://ehr.czgm.com",
      "description": "人力资源管理系统",
      "groupName": "内部办公",
      "sortOrder": 2,
      "isSystemLink": true,
      "isDeletable": false
    },
    {
      "name": "电子邮件系统",
      "url": "http://mail.czgm.com",
      "description": "企业邮箱系统",
      "groupName": "内部办公",
      "sortOrder": 3,
      "isSystemLink": true,
      "isDeletable": false
    },
    {
      "name": "CRM系统",
      "url": "http://192.168.21.197",
      "description": "客户关系管理系统",
      "groupName": "内部办公",
      "sortOrder": 4,
      "isSystemLink": true,
      "isDeletable": false
    }
  ]
}', 
true, 1)
ON DUPLICATE KEY UPDATE name = name;

-- ============================================================================
-- 完成
-- ============================================================================
-- 数据库初始化完成！
-- 
-- 使用方法:
--   mysql -u root -p < database/full_schema.sql
--
-- 或者在 MySQL 客户端中执行:
--   source database/full_schema.sql
--
-- 包含的表:
--   1. users              - 用户表
--   2. groups             - 分组表
--   3. website_links      - 网站链接表
--   4. default_configurations - 默认配置表
--   5. user_sessions      - 用户会话表
--   6. favicon_cache      - Favicon缓存表
--   7. audit_logs         - 审计日志表
--   8. notifications      - 通知表
--   9. notification_recipients - 通知接收者表
--  10. user_feedback      - 用户反馈表
-- ============================================================================

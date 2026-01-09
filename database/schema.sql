-- Enterprise Navigation Tool Database Schema
-- MySQL 8.0+

-- Create database
CREATE DATABASE IF NOT EXISTS enterprise_navigation;
USE enterprise_navigation;

-- Users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Groups table
CREATE TABLE `groups` (
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
);

-- Website links table
CREATE TABLE website_links (
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
);

-- Default configurations table
CREATE TABLE default_configurations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  config_data JSON NOT NULL,
  version INT DEFAULT 1,
  is_active BOOLEAN DEFAULT FALSE,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_active (is_active),
  INDEX idx_version (version)
);

-- User sessions table
CREATE TABLE user_sessions (
  id VARCHAR(128) PRIMARY KEY,
  user_id INT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_expires (user_id, expires_at)
);

-- Favicon cache table
CREATE TABLE favicon_cache (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain VARCHAR(255) UNIQUE NOT NULL,
  icon_url VARCHAR(500) NOT NULL,
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  
  INDEX idx_domain_expires (domain, expires_at)
);

-- Insert default admin user (password: admin123)
-- Note: This should be changed in production
INSERT INTO users (username, email, password_hash, role) VALUES 
('admin', 'admin@company.com', '$2b$10$rQZ8kJZjZjZjZjZjZjZjZeK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'admin');

-- Insert default configuration with internal office systems
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
true, 1);

-- Migration: Add system fields for groups and links
-- This migration adds support for system-managed groups and links that cannot be deleted by users

-- Add system fields to groups table
ALTER TABLE `groups` 
ADD COLUMN is_system_group BOOLEAN DEFAULT FALSE AFTER is_active,
ADD COLUMN is_deletable BOOLEAN DEFAULT TRUE AFTER is_system_group,
ADD INDEX idx_system_group (is_system_group);

-- Add system fields to website_links table
ALTER TABLE website_links 
ADD COLUMN is_system_link BOOLEAN DEFAULT FALSE AFTER is_active,
ADD COLUMN is_deletable BOOLEAN DEFAULT TRUE AFTER is_system_link,
ADD INDEX idx_system_link (is_system_link);

-- Update default configuration with internal office systems
UPDATE default_configurations 
SET config_data = '{
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
}'
WHERE is_active = true;

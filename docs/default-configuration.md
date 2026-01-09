# 默认配置系统说明

## 概述

企业导航工具的默认配置系统允许管理员为新用户设置标准的分组和链接配置。系统内置了"内部办公"分组，包含公司的核心办公系统链接，这些链接对所有用户都是必需的且不可删除。

## 内置系统链接

每个新注册的用户都会自动获得以下系统链接：

### 内部办公分组
- **公司网站**: http://wm.czgm.com - 公司官方网站
- **协同办公系统(OA)**: http://oa.czgm.com - 办公自动化系统
- **人力资源系统(EHR)**: http://ehr.czgm.com - 人力资源管理系统
- **电子邮件系统**: http://mail.czgm.com - 企业邮箱系统
- **CRM系统**: http://192.168.21.197 - 客户关系管理系统

## 系统保护机制

### 不可删除的分组和链接
- 标记为 `isSystemGroup: true` 的分组不能被普通用户删除
- 标记为 `isSystemLink: true` 的链接不能被普通用户删除
- 标记为 `isDeletable: false` 的项目受到额外保护

### 用户界面指示
- 系统分组和链接在界面上会显示特殊的锁定图标 🔒
- 删除按钮对于受保护的项目不会显示
- 鼠标悬停时会显示"系统链接，不可删除"的提示

## 管理员功能

### 配置管理
管理员可以通过以下API端点管理默认配置：

```bash
# 获取所有配置
GET /api/admin/configurations

# 创建新配置
POST /api/admin/configurations

# 更新配置
PUT /api/admin/configurations/:id

# 激活配置
POST /api/admin/configurations/:id/activate

# 删除配置
DELETE /api/admin/configurations/:id
```

### 配置数据结构
```json
{
  "groups": [
    {
      "name": "内部办公",
      "description": "公司内部办公系统",
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
    }
  ]
}
```

## 自动应用机制

### 新用户注册
当新用户注册时，系统会自动：
1. 获取当前激活的默认配置
2. 为用户创建配置中定义的分组
3. 为用户创建配置中定义的链接
4. 设置适当的系统保护标记

### 配置更新同步
管理员可以选择将配置更新同步到现有用户：
- `reset` 模式：删除用户现有数据，应用新配置
- `merge` 模式：保留用户数据，添加新的配置项

## 数据库结构

### 新增字段
```sql
-- groups 表新增字段
ALTER TABLE `groups` 
ADD COLUMN is_system_group BOOLEAN DEFAULT FALSE,
ADD COLUMN is_deletable BOOLEAN DEFAULT TRUE;

-- website_links 表新增字段
ALTER TABLE website_links 
ADD COLUMN is_system_link BOOLEAN DEFAULT FALSE,
ADD COLUMN is_deletable BOOLEAN DEFAULT TRUE;
```

### 默认配置表
```sql
CREATE TABLE default_configurations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  config_data JSON NOT NULL,
  version INT DEFAULT 1,
  is_active BOOLEAN DEFAULT FALSE,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 使用命令

### 初始化默认配置
```bash
npm run init-config
```

### 运行数据库迁移
```bash
npm run migrate
```

### 演示默认配置功能
```bash
npm run demo-config
```

## 安全考虑

1. **权限控制**: 只有管理员可以修改默认配置
2. **数据完整性**: 系统链接受到删除保护
3. **配置验证**: 创建配置时会验证数据格式和完整性
4. **审计日志**: 所有配置更改都会记录日志

## 故障排除

### 常见问题

**Q: 用户看不到内部办公链接**
A: 检查默认配置是否已激活，运行 `npm run init-config` 初始化

**Q: 系统链接可以被删除**
A: 检查数据库迁移是否已运行，确保 `is_system_link` 和 `is_deletable` 字段存在

**Q: 新用户没有获得默认配置**
A: 检查注册流程中是否调用了 `ConfigurationService.applyActiveConfigurationToUser()`

### 调试命令
```bash
# 检查数据库结构
npm run validate

# 运行配置演示
npm run demo-config

# 查看迁移状态
npm run migrate
```

## 最佳实践

1. **定期备份**: 在修改默认配置前备份数据库
2. **测试环境**: 在测试环境中验证配置更改
3. **渐进部署**: 使用 `merge` 模式逐步推送配置更新
4. **监控日志**: 关注配置应用过程中的错误日志
5. **用户培训**: 向用户说明哪些链接是系统必需的
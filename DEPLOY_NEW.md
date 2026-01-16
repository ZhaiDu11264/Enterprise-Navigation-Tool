# Enterprise Navigation Tool 部署指南

## 系统要求
- Node.js 18+
- MySQL 8.0+
- npm 或 yarn

## 部署步骤

### 1. 数据库初始化
```bash
mysql -u root -p < database/full_schema.sql
```

### 2. 配置环境变量
```bash
cp .env.production .env
# 编辑 .env 文件，配置数据库连接等信息
```

### 3. 安装后端依赖并构建
```bash
npm install --production
npm run build
```

### 4. 安装前端依赖并构建
```bash
cd frontend
npm install
npm run build
cd ..
```

### 5. 启动服务
```bash
npm start
```
```bash
cd .\frontend\
npm start
```

## Docker 部署（可选）
```bash
docker-compose -f docker-compose.dev.yml up -d
```

## 默认管理员账号
- 用户名: admin
- 邮箱: admin@company.com
- 密码: admin123（请立即修改）

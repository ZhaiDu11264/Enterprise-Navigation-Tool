# ============================================================================
# Enterprise Navigation Tool - 生产版本导出脚本 (PowerShell)
# ============================================================================
# 用法: powershell -ExecutionPolicy Bypass -File scripts\export-production.ps1
# ============================================================================

$ErrorActionPreference = "Stop"

$ExportDir = "production-export"
$ZipName = "enterprise-navigation-production.zip"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host " Enterprise Navigation Tool 生产版本导出" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# 清理旧目录
if (Test-Path $ExportDir) {
    Write-Host "清理旧的导出目录..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $ExportDir
}

if (Test-Path $ZipName) {
    Remove-Item -Force $ZipName
}

# 创建目录结构
Write-Host "创建目录结构..." -ForegroundColor Green
New-Item -ItemType Directory -Path $ExportDir -Force | Out-Null
New-Item -ItemType Directory -Path "$ExportDir/src" -Force | Out-Null
New-Item -ItemType Directory -Path "$ExportDir/database" -Force | Out-Null
New-Item -ItemType Directory -Path "$ExportDir/frontend" -Force | Out-Null
New-Item -ItemType Directory -Path "$ExportDir/uploads" -Force | Out-Null

# 复制后端源码 (排除测试)
Write-Host "复制后端源码..." -ForegroundColor Green
$backendDirs = @("config", "middleware", "models", "routes", "services", "utils")
foreach ($dir in $backendDirs) {
    if (Test-Path "src/$dir") {
        Copy-Item -Recurse -Force "src/$dir" "$ExportDir/src/$dir"
    }
}
Copy-Item -Force "src/app.ts" "$ExportDir/src/"
Copy-Item -Force "src/server.ts" "$ExportDir/src/"

# 删除测试文件
Get-ChildItem -Path "$ExportDir/src" -Recurse -Include "*.test.ts","*.spec.ts","__tests__" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

# 复制数据库脚本
Write-Host "复制数据库脚本..." -ForegroundColor Green
Copy-Item -Force "database/full_schema.sql" "$ExportDir/database/"

# 复制前端源码
Write-Host "复制前端源码..." -ForegroundColor Green
Copy-Item -Recurse -Force "frontend/src" "$ExportDir/frontend/src"
Copy-Item -Recurse -Force "frontend/public" "$ExportDir/frontend/public"
Copy-Item -Force "frontend/package.json" "$ExportDir/frontend/"
Copy-Item -Force "frontend/tsconfig.json" "$ExportDir/frontend/"
if (Test-Path "frontend/.env.example") {
    Copy-Item -Force "frontend/.env.example" "$ExportDir/frontend/"
}

# 删除前端测试文件
Get-ChildItem -Path "$ExportDir/frontend/src" -Recurse -Include "*.test.ts","*.test.tsx","*.spec.ts","*.spec.tsx","__tests__" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

# 复制配置文件
Write-Host "复制配置文件..." -ForegroundColor Green
$configFiles = @("package.json", "tsconfig.json", "Dockerfile", "docker-compose.dev.yml", ".env.example", ".gitignore", "nodemon.json", "README.md")
foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Copy-Item -Force $file "$ExportDir/"
    }
}

# 创建生产环境配置模板
Write-Host "创建生产配置模板..." -ForegroundColor Green

$envContent = @"
# 生产环境配置
NODE_ENV=production
PORT=3001

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=enterprise_navigation

# JWT配置 (请修改为安全的密钥)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=24h

# 前端URL
FRONTEND_URL=http://localhost:3000
"@
$envContent | Out-File -FilePath "$ExportDir/.env.production" -Encoding UTF8

# 创建部署说明
$deployContent = @"
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

## Docker 部署 (可选)
```bash
docker-compose -f docker-compose.dev.yml up -d
```

## 默认管理员账户
- 用户名: admin
- 邮箱: admin@company.com
- 密码: admin123 (请立即修改!)
"@
$deployContent | Out-File -FilePath "$ExportDir/DEPLOY.md" -Encoding UTF8

# 创建ZIP压缩包
Write-Host "创建ZIP压缩包..." -ForegroundColor Green
Compress-Archive -Path "$ExportDir/*" -DestinationPath $ZipName -Force

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " 导出完成!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host " 输出文件:" -ForegroundColor White
Write-Host "   - 目录: $ExportDir" -ForegroundColor Yellow
Write-Host "   - 压缩包: $ZipName" -ForegroundColor Yellow
Write-Host ""
Write-Host " 包含内容:" -ForegroundColor White
Write-Host "   - 后端源码 (src/)" -ForegroundColor Gray
Write-Host "   - 前端源码 (frontend/)" -ForegroundColor Gray
Write-Host "   - 数据库脚本 (database/full_schema.sql)" -ForegroundColor Gray
Write-Host "   - 配置文件模板" -ForegroundColor Gray
Write-Host "   - 部署说明 (DEPLOY.md)" -ForegroundColor Gray
Write-Host ""
Write-Host " 已排除:" -ForegroundColor White
Write-Host "   - node_modules" -ForegroundColor DarkGray
Write-Host "   - 测试文件 (__tests__, *.test.ts)" -ForegroundColor DarkGray
Write-Host "   - 开发脚本 (scripts/)" -ForegroundColor DarkGray
Write-Host "   - 文档 (docs/, *.md 除README)" -ForegroundColor DarkGray
Write-Host "   - 日志文件" -ForegroundColor DarkGray
Write-Host "============================================" -ForegroundColor Cyan

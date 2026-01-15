@echo off
REM ============================================================================
REM Enterprise Navigation Tool - 生产版本导出脚本
REM ============================================================================
REM 用法: scripts\export-production.bat
REM 输出: production-release.zip
REM ============================================================================

setlocal enabledelayedexpansion

set "EXPORT_DIR=production-export"
set "ZIP_NAME=enterprise-navigation-production.zip"

echo ============================================
echo  Enterprise Navigation Tool 生产版本导出
echo ============================================
echo.

REM 清理旧的导出目录
if exist "%EXPORT_DIR%" (
    echo 清理旧的导出目录...
    rmdir /s /q "%EXPORT_DIR%"
)

REM 创建导出目录结构
echo 创建目录结构...
mkdir "%EXPORT_DIR%"
mkdir "%EXPORT_DIR%\src"
mkdir "%EXPORT_DIR%\database"
mkdir "%EXPORT_DIR%\frontend"
mkdir "%EXPORT_DIR%\uploads"

REM 复制后端源码 (排除测试文件)
echo 复制后端源码...
xcopy /E /I /Y "src\config" "%EXPORT_DIR%\src\config"
xcopy /E /I /Y "src\middleware" "%EXPORT_DIR%\src\middleware"
xcopy /E /I /Y "src\models" "%EXPORT_DIR%\src\models"
xcopy /E /I /Y "src\routes" "%EXPORT_DIR%\src\routes"
xcopy /E /I /Y "src\services" "%EXPORT_DIR%\src\services"
xcopy /E /I /Y "src\utils" "%EXPORT_DIR%\src\utils"
copy /Y "src\app.ts" "%EXPORT_DIR%\src\"
copy /Y "src\server.ts" "%EXPORT_DIR%\src\"

REM 复制数据库脚本
echo 复制数据库脚本...
copy /Y "database\full_schema.sql" "%EXPORT_DIR%\database\"

REM 复制前端源码 (排除测试和node_modules)
echo 复制前端源码...
xcopy /E /I /Y "frontend\src" "%EXPORT_DIR%\frontend\src" /EXCLUDE:scripts\export-exclude.txt
xcopy /E /I /Y "frontend\public" "%EXPORT_DIR%\frontend\public"
copy /Y "frontend\package.json" "%EXPORT_DIR%\frontend\"
copy /Y "frontend\tsconfig.json" "%EXPORT_DIR%\frontend\"
if exist "frontend\.env.example" copy /Y "frontend\.env.example" "%EXPORT_DIR%\frontend\"

REM 复制配置文件
echo 复制配置文件...
copy /Y "package.json" "%EXPORT_DIR%\"
copy /Y "tsconfig.json" "%EXPORT_DIR%\"
copy /Y "Dockerfile" "%EXPORT_DIR%\"
copy /Y "docker-compose.dev.yml" "%EXPORT_DIR%\"
copy /Y ".env.example" "%EXPORT_DIR%\"
copy /Y ".gitignore" "%EXPORT_DIR%\"
copy /Y "nodemon.json" "%EXPORT_DIR%\"

REM 复制README
copy /Y "README.md" "%EXPORT_DIR%\"

echo.
echo ============================================
echo  导出完成！
echo ============================================
echo  输出目录: %EXPORT_DIR%
echo.
echo  下一步:
echo  1. 进入 %EXPORT_DIR% 目录
echo  2. 运行 npm install 安装后端依赖
echo  3. 进入 frontend 目录运行 npm install
echo  4. 导入数据库: mysql -u root -p ^< database\full_schema.sql
echo  5. 配置 .env 文件
echo  6. 运行 npm run build 构建后端
echo  7. 运行 npm start 启动服务
echo ============================================

pause

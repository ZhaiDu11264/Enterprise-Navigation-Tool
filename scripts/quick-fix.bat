@echo off
echo 🔧 快速修复速率限制问题
echo ================================

echo 1. 设置开发环境变量...
set NODE_ENV=development

echo 2. 显示当前环境...
echo NODE_ENV=%NODE_ENV%

echo 3. 清除可能的缓存...
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .next rmdir /s /q .next

echo 4. 提示重启服务器...
echo.
echo ⚠️  请手动重启后端服务器:
echo    1. 按 Ctrl+C 停止当前服务器
echo    2. 运行: npm run dev
echo.
echo ⚠️  如果问题持续，请清除浏览器缓存:
echo    1. 打开开发者工具 (F12)
echo    2. 右键刷新按钮，选择"清空缓存并硬性重新加载"
echo.

pause
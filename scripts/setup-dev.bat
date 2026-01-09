@echo off
REM Development setup script for Enterprise Navigation Tool (Windows)

echo 🚀 Setting up Enterprise Navigation Tool development environment...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Copy environment file if it doesn't exist
if not exist .env (
    echo 📄 Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please update .env file with your database credentials
)

REM Create uploads directory
echo 📁 Creating uploads directory...
if not exist uploads mkdir uploads

REM Build the project
echo 🔨 Building TypeScript...
npm run build

echo ✅ Development environment setup complete!
echo.
echo Next steps:
echo 1. Update .env file with your database credentials
echo 2. Create MySQL database: CREATE DATABASE enterprise_navigation;
echo 3. Start development server: npm run dev
echo 4. Visit http://localhost:3000/health to verify setup

pause
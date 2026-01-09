#!/bin/bash

# Development setup script for Enterprise Navigation Tool

echo "🚀 Setting up Enterprise Navigation Tool development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env file with your database credentials"
fi

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p uploads

# Build the project
echo "🔨 Building TypeScript..."
npm run build

echo "✅ Development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your database credentials"
echo "2. Create MySQL database: CREATE DATABASE enterprise_navigation;"
echo "3. Start development server: npm run dev"
echo "4. Visit http://localhost:3000/health to verify setup"
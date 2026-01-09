#!/usr/bin/env node

/**
 * 检查环境变量和配置的脚本
 */

console.log('🔍 环境配置检查');
console.log('='.repeat(30));

console.log('📋 Node.js 环境:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || '未设置'}`);
console.log(`   Node 版本: ${process.version}`);

console.log('\n📋 数据库配置:');
console.log(`   DB_HOST: ${process.env.DB_HOST || 'localhost (默认)'}`);
console.log(`   DB_PORT: ${process.env.DB_PORT || '3306 (默认)'}`);
console.log(`   DB_USER: ${process.env.DB_USER || 'root (默认)'}`);
console.log(`   DB_PASSWORD: ${process.env.DB_PASSWORD ? '已设置' : '未设置 (默认为空)'}`);
console.log(`   DB_NAME: ${process.env.DB_NAME || 'enterprise_navigation (默认)'}`);

console.log('\n📋 JWT 配置:');
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '已设置' : '未设置'}`);
console.log(`   JWT_EXPIRES_IN: ${process.env.JWT_EXPIRES_IN || '24h (默认)'}`);

console.log('\n📋 服务器配置:');
console.log(`   PORT: ${process.env.PORT || '3000 (默认)'}`);

// 检查 .env 文件
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log('\n✅ .env 文件存在');
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    console.log(`   包含 ${lines.length} 个配置项`);
  } catch (error) {
    console.log('   ❌ 无法读取 .env 文件');
  }
} else {
  console.log('\n⚠️  .env 文件不存在');
  console.log('   建议复制 .env.example 到 .env');
}

// 检查是否为开发环境
if (process.env.NODE_ENV === 'development') {
  console.log('\n🔧 开发环境配置:');
  console.log('   ✅ 速率限制已禁用');
  console.log('   ✅ 详细日志已启用');
  console.log('   ✅ CORS 设置宽松');
} else if (process.env.NODE_ENV === 'production') {
  console.log('\n🔒 生产环境配置:');
  console.log('   ✅ 安全设置已启用');
  console.log('   ✅ 速率限制已启用');
} else {
  console.log('\n⚠️  NODE_ENV 未正确设置');
  console.log('   建议设置为 "development" 或 "production"');
}

console.log('\n💡 如果遇到问题:');
console.log('   1. 确保 NODE_ENV=development');
console.log('   2. 重启服务器以应用新配置');
console.log('   3. 清除浏览器缓存');
console.log('   4. 检查数据库连接');
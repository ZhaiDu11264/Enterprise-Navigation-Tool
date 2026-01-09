#!/usr/bin/env node

/**
 * 重置管理员账号的脚本
 * 用于解决管理员无法登录的问题
 */

const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'enterprise_navigation'
};

async function resetAdmin() {
  let connection;
  
  try {
    console.log('🔄 连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ 数据库连接成功');
    
    // 检查是否存在管理员账号
    const [users] = await connection.execute(
      'SELECT id, username, email, role FROM users WHERE role = "admin"'
    );
    
    console.log(`📊 找到 ${users.length} 个管理员账号:`);
    users.forEach(user => {
      console.log(`   - ID: ${user.id}, 用户名: ${user.username}, 邮箱: ${user.email}`);
    });
    
    // 生成新密码哈希
    const newPassword = 'admin123';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    if (users.length > 0) {
      // 更新现有管理员密码
      const adminUser = users[0];
      await connection.execute(
        'UPDATE users SET password_hash = ?, is_active = true WHERE id = ?',
        [passwordHash, adminUser.id]
      );
      
      console.log('✅ 管理员密码已重置');
      console.log(`   用户名: ${adminUser.username}`);
      console.log(`   新密码: ${newPassword}`);
      console.log(`   邮箱: ${adminUser.email}`);
    } else {
      // 创建新的管理员账号
      await connection.execute(
        'INSERT INTO users (username, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?)',
        ['admin', 'admin@company.com', passwordHash, 'admin', true]
      );
      
      console.log('✅ 新管理员账号已创建');
      console.log('   用户名: admin');
      console.log(`   密码: ${newPassword}`);
      console.log('   邮箱: admin@company.com');
    }
    
    // 验证更新
    const [updatedUsers] = await connection.execute(
      'SELECT id, username, email, role, is_active FROM users WHERE role = "admin"'
    );
    
    console.log('\n📋 当前管理员账号状态:');
    updatedUsers.forEach(user => {
      console.log(`   - ID: ${user.id}, 用户名: ${user.username}, 激活: ${user.is_active ? '是' : '否'}`);
    });
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 数据库连接被拒绝，请检查:');
      console.log('   1. MySQL 服务是否正在运行');
      console.log('   2. 数据库配置是否正确');
      console.log('   3. 数据库是否已创建');
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('\n💡 数据表不存在，请先运行数据库迁移:');
      console.log('   mysql -u root -p < database/schema.sql');
    }
    
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

// 检查必要的依赖
try {
  require('bcrypt');
  require('mysql2/promise');
} catch (error) {
  console.error('❌ 缺少必要的依赖包:', error.message);
  console.log('\n💡 请安装依赖:');
  console.log('   npm install bcrypt mysql2');
  process.exit(1);
}

console.log('🔧 管理员账号重置工具');
console.log('='.repeat(30));

resetAdmin();
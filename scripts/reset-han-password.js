const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function resetHanPassword() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'enterprise_navigation'
  });

  try {
    console.log('🔑 重置han用户密码');
    console.log('==================');

    const newPassword = 'han123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await connection.execute(
      'UPDATE users SET password_hash = ? WHERE username = ?',
      [hashedPassword, 'han']
    );

    console.log('✅ han用户密码已重置');
    console.log('用户名: han');
    console.log('密码: han123');

  } finally {
    await connection.end();
  }
}

resetHanPassword().catch(console.error);
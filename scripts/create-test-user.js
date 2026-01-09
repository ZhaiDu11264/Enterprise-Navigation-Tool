const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function createTestUser() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'enterprise_navigation'
  });

  try {
    // Check if test user exists
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE username = ?',
      ['testuser']
    );

    if (existing.length > 0) {
      console.log('Test user already exists, updating password...');
      const hashedPassword = await bcrypt.hash('test123', 10);
      await connection.execute(
        'UPDATE users SET password_hash = ? WHERE username = ?',
        [hashedPassword, 'testuser']
      );
    } else {
      console.log('Creating new test user...');
      const hashedPassword = await bcrypt.hash('test123', 10);
      await connection.execute(
        'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['testuser', 'test@company.com', hashedPassword, 'user']
      );
    }

    console.log('✅ Test user ready: username=testuser, password=test123');
  } finally {
    await connection.end();
  }
}

createTestUser().catch(console.error);
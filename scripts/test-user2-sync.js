const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testUser2Sync() {
  try {
    console.log('🧪 测试用户2的配置同步');
    console.log('========================');

    // 获取用户2的信息
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'enterprise_navigation'
    });

    const [users] = await connection.execute('SELECT * FROM users WHERE id = 2');
    if (users.length === 0) {
      console.log('❌ 用户2不存在');
      return;
    }

    const user2 = users[0];
    console.log('用户2信息:', user2.username);

    // 检查用户2同步前的CRM链接
    const [beforeLinks] = await connection.execute(
      'SELECT name, url FROM website_links WHERE user_id = 2 AND name LIKE "%CRM%" AND is_active = 1'
    );
    console.log('同步前CRM链接:', beforeLinks);

    await connection.end();

    // 使用testuser登录（因为我们知道这个用户的密码）
    console.log('\n1. 使用testuser登录进行同步测试...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'testuser',
      password: 'test123'
    });

    if (!loginResponse.data.success) {
      throw new Error('登录失败');
    }

    const userToken = loginResponse.data.data.token;
    console.log('✅ 登录成功');

    // 测试配置同步
    console.log('\n2. 执行配置同步...');
    const refreshResponse = await axios.post(`${BASE_URL}/config/refresh`, {}, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    console.log('✅ 同步响应:', refreshResponse.data);

    // 检查同步后的结果
    const connection2 = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'enterprise_navigation'
    });

    const [afterLinks] = await connection2.execute(
      'SELECT user_id, name, url FROM website_links WHERE name LIKE "%CRM%" AND is_active = 1 ORDER BY user_id'
    );
    
    console.log('\n3. 所有用户的CRM链接状态:');
    afterLinks.forEach(link => {
      console.log(`用户 ${link.user_id}: ${link.name} -> ${link.url}`);
    });

    await connection2.end();

    console.log('\n🎉 测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

testUser2Sync();
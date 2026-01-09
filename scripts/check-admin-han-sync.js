const mysql = require('mysql2/promise');
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function checkAdminHanSync() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'enterprise_navigation'
  });

  try {
    console.log('🔍 检查admin和han用户的同步状态');
    console.log('=====================================');

    // 1. 查看所有用户信息
    const [users] = await connection.execute('SELECT id, username, role FROM users ORDER BY id');
    console.log('1. 系统用户列表:');
    users.forEach(user => {
      console.log(`  ID: ${user.id}, 用户名: ${user.username}, 角色: ${user.role}`);
    });

    // 2. 查看当前默认配置
    const [configs] = await connection.execute('SELECT id, name, version, updated_at FROM default_configurations WHERE is_active = 1');
    if (configs.length > 0) {
      console.log('\n2. 当前默认配置:');
      console.log(`  配置ID: ${configs[0].id}, 版本: ${configs[0].version}, 更新时间: ${configs[0].updated_at}`);
    }

    // 3. 检查admin用户的链接
    const adminUser = users.find(u => u.username === 'admin');
    if (adminUser) {
      const [adminLinks] = await connection.execute(
        'SELECT name, url FROM website_links WHERE user_id = ? AND is_active = 1 ORDER BY name',
        [adminUser.id]
      );
      console.log(`\n3. admin用户 (ID: ${adminUser.id}) 的链接:`);
      adminLinks.forEach(link => {
        console.log(`  ${link.name}: ${link.url}`);
      });
    } else {
      console.log('\n3. ❌ 未找到admin用户');
    }

    // 4. 检查han用户的链接
    const hanUser = users.find(u => u.username === 'han');
    if (hanUser) {
      const [hanLinks] = await connection.execute(
        'SELECT name, url FROM website_links WHERE user_id = ? AND is_active = 1 ORDER BY name',
        [hanUser.id]
      );
      console.log(`\n4. han用户 (ID: ${hanUser.id}) 的链接:`);
      hanLinks.forEach(link => {
        console.log(`  ${link.name}: ${link.url}`);
      });

      // 5. 测试han用户的同步功能
      console.log('\n5. 测试han用户同步功能...');
      
      // 首先需要han用户的密码，让我们尝试重置或创建
      try {
        // 尝试用默认密码登录
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          username: 'han',
          password: 'han123'
        });

        if (loginResponse.data.success) {
          console.log('✅ han用户登录成功');
          
          const hanToken = loginResponse.data.data.token;
          
          // 测试配置同步
          const refreshResponse = await axios.post(`${BASE_URL}/config/refresh`, {}, {
            headers: { Authorization: `Bearer ${hanToken}` }
          });
          
          console.log('✅ han用户同步响应:', refreshResponse.data);
          
          // 检查同步后的链接
          const [hanLinksAfter] = await connection.execute(
            'SELECT name, url FROM website_links WHERE user_id = ? AND is_active = 1 ORDER BY name',
            [hanUser.id]
          );
          console.log('\n6. han用户同步后的链接:');
          hanLinksAfter.forEach(link => {
            console.log(`  ${link.name}: ${link.url}`);
          });
          
        } else {
          console.log('❌ han用户登录失败:', loginResponse.data);
        }
        
      } catch (loginError) {
        console.log('❌ han用户登录失败:', loginError.response?.data || loginError.message);
        console.log('💡 可能需要重置han用户密码');
      }
      
    } else {
      console.log('\n4. ❌ 未找到han用户');
    }

    // 6. 比较所有用户的CRM系统链接
    console.log('\n7. 所有用户的CRM系统链接对比:');
    const [crmLinks] = await connection.execute(
      'SELECT u.username, wl.url FROM website_links wl JOIN users u ON wl.user_id = u.id WHERE wl.name = "CRM系统" AND wl.is_active = 1 ORDER BY u.id'
    );
    
    crmLinks.forEach(link => {
      console.log(`  ${link.username}: ${link.url}`);
    });

  } finally {
    await connection.end();
  }
}

checkAdminHanSync().catch(console.error);
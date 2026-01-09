const mysql = require('mysql2/promise');
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testSyncDataUpdate() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'enterprise_navigation'
  });

  try {
    console.log('🧪 测试同步数据更新');
    console.log('==================');

    // 1. 修改默认配置中的一个链接
    console.log('1. 修改默认配置...');
    const [configs] = await connection.execute('SELECT * FROM default_configurations WHERE is_active = 1');
    const config = configs[0];
    const configData = config.config_data;
    
    // 修改公司网站的URL作为测试
    const companyLink = configData.links.find(link => link.name === '公司网站');
    const originalUrl = companyLink.url;
    const testUrl = 'http://test.czgm.com';
    companyLink.url = testUrl;
    
    await connection.execute(
      'UPDATE default_configurations SET config_data = ?, version = version + 1, updated_at = NOW() WHERE id = ?',
      [JSON.stringify(configData), config.id]
    );
    
    console.log(`✅ 默认配置已更新: 公司网站 ${originalUrl} -> ${testUrl}`);

    // 2. 检查用户同步前的数据
    const [beforeLinks] = await connection.execute(
      'SELECT user_id, name, url FROM website_links WHERE name = "公司网站" AND is_active = 1 ORDER BY user_id'
    );
    
    console.log('\n2. 同步前用户数据:');
    beforeLinks.forEach(link => {
      console.log(`  用户 ${link.user_id}: ${link.url}`);
    });

    // 3. 执行API同步
    console.log('\n3. 执行API同步...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'testuser',
      password: 'test123'
    });

    const userToken = loginResponse.data.data.token;
    const refreshResponse = await axios.post(`${BASE_URL}/config/refresh`, {}, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    console.log('✅ API同步响应:', refreshResponse.data);

    // 4. 检查同步后的数据
    const [afterLinks] = await connection.execute(
      'SELECT user_id, name, url FROM website_links WHERE name = "公司网站" AND is_active = 1 ORDER BY user_id'
    );
    
    console.log('\n4. 同步后用户数据:');
    afterLinks.forEach(link => {
      console.log(`  用户 ${link.user_id}: ${link.url}`);
    });

    // 5. 验证结果
    const testUserLink = afterLinks.find(link => link.user_id === 5); // testuser的ID
    if (testUserLink && testUserLink.url === testUrl) {
      console.log('\n✅ 数据库同步成功！用户数据已更新');
    } else {
      console.log('\n❌ 数据库同步失败！用户数据未更新');
      console.log('预期URL:', testUrl);
      console.log('实际URL:', testUserLink?.url);
    }

    // 6. 恢复原始配置
    console.log('\n5. 恢复原始配置...');
    companyLink.url = originalUrl;
    await connection.execute(
      'UPDATE default_configurations SET config_data = ?, version = version + 1, updated_at = NOW() WHERE id = ?',
      [JSON.stringify(configData), config.id]
    );
    console.log('✅ 配置已恢复');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  } finally {
    await connection.end();
  }
}

testSyncDataUpdate();
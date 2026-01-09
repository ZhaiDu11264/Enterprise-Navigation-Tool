const axios = require('axios');
const mysql = require('mysql2/promise');

const BASE_URL = 'http://localhost:3000/api';

async function testAutoSync() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'enterprise_navigation'
  });

  try {
    console.log('🧪 测试管理员自动同步功能');
    console.log('============================');

    // 1. 管理员登录
    console.log('1. 管理员登录...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    const adminToken = loginResponse.data.data.token;
    console.log('✅ 管理员登录成功');

    // 2. 查看当前默认配置版本
    const [configsBefore] = await connection.execute('SELECT version FROM default_configurations WHERE is_active = 1');
    const versionBefore = configsBefore[0].version;
    console.log('2. 当前默认配置版本:', versionBefore);

    // 3. 管理员修改CRM系统链接
    console.log('3. 管理员修改CRM系统链接...');
    
    // 先获取管理员的CRM链接ID
    const [adminLinks] = await connection.execute(
      'SELECT id FROM website_links WHERE user_id = 1 AND name = "CRM系统" AND is_active = 1'
    );
    
    if (adminLinks.length === 0) {
      console.log('❌ 未找到管理员的CRM系统链接');
      return;
    }

    const crmLinkId = adminLinks[0].id;
    const testUrl = `http://192.168.21.${Math.floor(Math.random() * 100) + 100}`; // 随机IP

    // 通过API更新链接
    const updateResponse = await axios.put(`${BASE_URL}/links/${crmLinkId}`, {
      url: testUrl,
      description: '测试自动同步功能'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ 管理员更新CRM链接:', testUrl);

    // 4. 检查默认配置是否自动更新
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒

    const [configsAfter] = await connection.execute('SELECT version, config_data FROM default_configurations WHERE is_active = 1');
    const versionAfter = configsAfter[0].version;
    const configData = configsAfter[0].config_data;

    console.log('4. 更新后默认配置版本:', versionAfter);

    if (versionAfter > versionBefore) {
      console.log('✅ 默认配置版本已自动递增！');
      
      // 检查CRM系统URL是否已更新
      const crmLink = configData.links.find(link => link.name === 'CRM系统');
      if (crmLink && crmLink.url === testUrl) {
        console.log('✅ 默认配置中的CRM系统URL已自动更新:', crmLink.url);
      } else {
        console.log('❌ 默认配置中的CRM系统URL未更新');
      }
    } else {
      console.log('❌ 默认配置版本未递增');
    }

    // 5. 测试普通用户同步
    console.log('\n5. 测试普通用户同步...');
    const userLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'testuser',
      password: 'test123'
    });

    const userToken = userLoginResponse.data.data.token;
    
    const syncResponse = await axios.post(`${BASE_URL}/config/refresh`, {}, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    console.log('✅ 普通用户同步响应:', syncResponse.data);

    // 6. 验证普通用户是否获得了最新配置
    const [userLinks] = await connection.execute(
      'SELECT url FROM website_links WHERE user_id = 5 AND name = "CRM系统" AND is_active = 1'
    );

    if (userLinks.length > 0 && userLinks[0].url === testUrl) {
      console.log('✅ 普通用户已同步到管理员的最新修改:', userLinks[0].url);
    } else {
      console.log('❌ 普通用户未同步到最新修改');
    }

    console.log('\n🎉 自动同步功能测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  } finally {
    await connection.end();
  }
}

testAutoSync();
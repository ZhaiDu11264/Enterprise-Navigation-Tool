const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testSystemLinkUpdate() {
  try {
    console.log('🧪 测试系统链接更新逻辑');
    console.log('==========================');

    // 1. 先修改默认配置，将CRM系统改回旧IP
    console.log('1. 将默认配置中的CRM系统改回旧IP进行测试...');
    
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'enterprise_navigation'
    });

    // 获取当前配置
    const [configs] = await connection.execute('SELECT * FROM default_configurations WHERE is_active = 1');
    const config = configs[0];
    const configData = config.config_data;
    
    // 修改CRM系统URL为测试IP
    const crmLink = configData.links.find(link => link.name === 'CRM系统');
    const originalUrl = crmLink.url;
    crmLink.url = 'http://192.168.21.999'; // 测试IP
    
    // 更新配置
    await connection.execute(
      'UPDATE default_configurations SET config_data = ?, version = version + 1, updated_at = NOW() WHERE id = ?',
      [JSON.stringify(configData), config.id]
    );
    
    console.log(`✅ 默认配置已更新: CRM系统 ${originalUrl} -> ${crmLink.url}`);

    // 2. 检查用户5同步前的CRM链接
    const [beforeLinks] = await connection.execute(
      'SELECT name, url, is_system_link FROM website_links WHERE user_id = 5 AND name = "CRM系统" AND is_active = 1'
    );
    console.log('用户5同步前的CRM链接:', beforeLinks);

    await connection.end();

    // 3. 使用testuser登录并执行同步
    console.log('\n2. 执行配置同步...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'testuser',
      password: 'test123'
    });

    const userToken = loginResponse.data.data.token;
    
    const refreshResponse = await axios.post(`${BASE_URL}/config/refresh`, {}, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    console.log('✅ 同步响应:', refreshResponse.data);

    // 4. 检查同步后的结果
    const connection2 = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'enterprise_navigation'
    });

    const [afterLinks] = await connection2.execute(
      'SELECT name, url, is_system_link FROM website_links WHERE user_id = 5 AND name = "CRM系统" AND is_active = 1'
    );
    
    console.log('\n3. 用户5同步后的CRM链接:', afterLinks);

    // 5. 恢复原始配置
    console.log('\n4. 恢复原始配置...');
    const [currentConfigs] = await connection2.execute('SELECT * FROM default_configurations WHERE is_active = 1');
    const currentConfig = currentConfigs[0];
    const currentConfigData = currentConfig.config_data;
    
    const currentCrmLink = currentConfigData.links.find(link => link.name === 'CRM系统');
    currentCrmLink.url = originalUrl; // 恢复原始URL
    
    await connection2.execute(
      'UPDATE default_configurations SET config_data = ?, version = version + 1, updated_at = NOW() WHERE id = ?',
      [JSON.stringify(currentConfigData), currentConfig.id]
    );
    
    console.log(`✅ 配置已恢复: CRM系统 -> ${originalUrl}`);

    await connection2.end();

    // 6. 分析结果
    const beforeUrl = beforeLinks[0]?.url;
    const afterUrl = afterLinks[0]?.url;
    
    console.log('\n📊 测试结果分析:');
    console.log(`同步前URL: ${beforeUrl}`);
    console.log(`同步后URL: ${afterUrl}`);
    console.log(`预期URL: http://192.168.21.999`);
    
    if (afterUrl === 'http://192.168.21.999') {
      console.log('🎉 系统链接更新逻辑工作正常！');
    } else {
      console.log('❌ 系统链接更新逻辑有问题，需要调试');
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

testSystemLinkUpdate();
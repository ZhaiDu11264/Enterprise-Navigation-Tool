const axios = require('axios');
const mysql = require('mysql2/promise');

const BASE_URL = 'http://localhost:3000/api';

async function testFullFieldSync() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'enterprise_navigation'
  });

  try {
    console.log('🧪 测试管理员全字段自动同步功能');
    console.log('================================');

    // 1. 管理员登录
    console.log('1. 管理员登录...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    const adminToken = loginResponse.data.data.token;
    console.log('✅ 管理员登录成功');

    // 2. 查看当前默认配置版本
    const [configsBefore] = await connection.execute('SELECT version, config_data FROM default_configurations WHERE is_active = 1');
    const versionBefore = configsBefore[0].version;
    const configDataBefore = configsBefore[0].config_data;
    console.log('2. 当前默认配置版本:', versionBefore);

    // 3. 获取管理员的CRM系统链接
    const [adminLinks] = await connection.execute(
      'SELECT id, name, url, description, icon_url, sort_order FROM website_links WHERE user_id = 1 AND name = "CRM系统" AND is_active = 1'
    );
    
    if (adminLinks.length === 0) {
      console.log('❌ 未找到管理员的CRM系统链接');
      return;
    }

    const crmLinkId = adminLinks[0].id;
    const originalData = adminLinks[0];
    console.log('3. 原始CRM链接数据:', originalData);

    // 4. 管理员修改CRM系统链接的多个字段
    console.log('4. 管理员修改CRM系统链接的多个字段...');
    
    const testUrl = `http://192.168.21.${Math.floor(Math.random() * 100) + 100}`;
    const testDescription = `更新时间: ${new Date().toLocaleString()} - 测试全字段同步`;
    const testIconUrl = 'https://example.com/new-crm-icon.png';

    const updateResponse = await axios.put(`${BASE_URL}/links/${crmLinkId}`, {
      url: testUrl,
      description: testDescription,
      iconUrl: testIconUrl
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ 管理员更新CRM链接:');
    console.log('  - URL:', testUrl);
    console.log('  - Description:', testDescription);
    console.log('  - IconUrl:', testIconUrl);

    // 5. 检查默认配置是否自动更新所有字段
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒

    const [configsAfter] = await connection.execute('SELECT version, config_data FROM default_configurations WHERE is_active = 1');
    const versionAfter = configsAfter[0].version;
    const configDataAfter = configsAfter[0].config_data;

    console.log('5. 更新后默认配置版本:', versionAfter);

    if (versionAfter > versionBefore) {
      console.log('✅ 默认配置版本已自动递增！');
      
      // 检查所有字段是否已更新
      const crmLinkInConfig = configDataAfter.links.find(link => link.name === 'CRM系统');
      if (crmLinkInConfig) {
        console.log('6. 检查默认配置中的字段同步:');
        
        // 检查URL
        if (crmLinkInConfig.url === testUrl) {
          console.log('  ✅ URL已同步:', crmLinkInConfig.url);
        } else {
          console.log('  ❌ URL未同步. 期望:', testUrl, '实际:', crmLinkInConfig.url);
        }
        
        // 检查Description
        if (crmLinkInConfig.description === testDescription) {
          console.log('  ✅ Description已同步:', crmLinkInConfig.description);
        } else {
          console.log('  ❌ Description未同步. 期望:', testDescription, '实际:', crmLinkInConfig.description);
        }
        
        // 检查IconUrl
        if (crmLinkInConfig.iconUrl === testIconUrl) {
          console.log('  ✅ IconUrl已同步:', crmLinkInConfig.iconUrl);
        } else {
          console.log('  ❌ IconUrl未同步. 期望:', testIconUrl, '实际:', crmLinkInConfig.iconUrl);
        }
        
        // 检查其他字段
        console.log('  📊 其他字段:');
        console.log('    - sortOrder:', crmLinkInConfig.sortOrder);
        console.log('    - isSystemLink:', crmLinkInConfig.isSystemLink);
        console.log('    - isDeletable:', crmLinkInConfig.isDeletable);
        
      } else {
        console.log('❌ 默认配置中未找到CRM系统链接');
      }
    } else {
      console.log('❌ 默认配置版本未递增');
    }

    // 7. 测试普通用户同步
    console.log('\n7. 测试普通用户同步...');
    const userLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'testuser',
      password: 'test123'
    });

    const userToken = userLoginResponse.data.data.token;
    
    const syncResponse = await axios.post(`${BASE_URL}/config/refresh`, {}, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    console.log('✅ 普通用户同步响应:', syncResponse.data);

    // 8. 验证普通用户是否获得了所有字段的最新配置
    const [userLinks] = await connection.execute(
      'SELECT url, description, icon_url FROM website_links WHERE user_id = 5 AND name = "CRM系统" AND is_active = 1'
    );

    if (userLinks.length > 0) {
      const userCrmLink = userLinks[0];
      console.log('8. 验证普通用户同步结果:');
      
      if (userCrmLink.url === testUrl) {
        console.log('  ✅ 用户URL已同步:', userCrmLink.url);
      } else {
        console.log('  ❌ 用户URL未同步. 期望:', testUrl, '实际:', userCrmLink.url);
      }
      
      if (userCrmLink.description === testDescription) {
        console.log('  ✅ 用户Description已同步:', userCrmLink.description);
      } else {
        console.log('  ❌ 用户Description未同步. 期望:', testDescription, '实际:', userCrmLink.description);
      }
      
      if (userCrmLink.icon_url === testIconUrl) {
        console.log('  ✅ 用户IconUrl已同步:', userCrmLink.icon_url);
      } else {
        console.log('  ❌ 用户IconUrl未同步. 期望:', testIconUrl, '实际:', userCrmLink.icon_url);
      }
      
    } else {
      console.log('❌ 普通用户未找到CRM系统链接');
    }

    console.log('\n🎉 全字段自动同步功能测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  } finally {
    await connection.end();
  }
}

testFullFieldSync();
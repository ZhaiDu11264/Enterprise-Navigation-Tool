const mysql = require('mysql2/promise');

async function syncAdminToDefault() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'enterprise_navigation'
  });

  try {
    console.log('🔄 将admin用户的修改同步到默认配置');
    console.log('=====================================');

    // 1. 获取admin用户的CRM系统链接
    const [adminLinks] = await connection.execute(
      'SELECT name, url FROM website_links WHERE user_id = 1 AND name = "CRM系统" AND is_active = 1'
    );

    if (adminLinks.length === 0) {
      console.log('❌ 未找到admin用户的CRM系统链接');
      return;
    }

    const adminCrmUrl = adminLinks[0].url;
    console.log('1. admin用户的CRM系统URL:', adminCrmUrl);

    // 2. 获取当前默认配置
    const [configs] = await connection.execute('SELECT * FROM default_configurations WHERE is_active = 1');
    const config = configs[0];
    const configData = config.config_data;

    const crmLink = configData.links.find(link => link.name === 'CRM系统');
    const oldUrl = crmLink.url;
    console.log('2. 默认配置中的CRM系统URL:', oldUrl);

    if (adminCrmUrl === oldUrl) {
      console.log('✅ admin用户和默认配置已经一致，无需更新');
      return;
    }

    // 3. 更新默认配置
    console.log('3. 更新默认配置...');
    crmLink.url = adminCrmUrl;

    await connection.execute(
      'UPDATE default_configurations SET config_data = ?, version = version + 1, updated_at = NOW() WHERE id = ?',
      [JSON.stringify(configData), config.id]
    );

    console.log(`✅ 默认配置已更新: ${oldUrl} -> ${adminCrmUrl}`);

    // 4. 验证更新
    const [updatedConfigs] = await connection.execute('SELECT version FROM default_configurations WHERE id = ?', [config.id]);
    console.log('4. 新版本号:', updatedConfigs[0].version);

    console.log('\n🎉 现在其他用户可以同步到admin的CRM系统IP了！');
    console.log('💡 建议用户执行手动同步来获取最新配置');

  } finally {
    await connection.end();
  }
}

syncAdminToDefault().catch(console.error);
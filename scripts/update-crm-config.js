const mysql = require('mysql2/promise');

async function updateCrmConfig() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'enterprise_navigation'
  });
  
  try {
    console.log('🔄 更新默认配置中的CRM系统IP...');
    
    // 1. 获取当前活跃的默认配置
    const [configs] = await connection.execute('SELECT * FROM default_configurations WHERE is_active = 1');
    if (configs.length === 0) {
      console.log('❌ 没有找到活跃的默认配置！');
      return;
    }
    
    const config = configs[0];
    const configData = config.config_data;
    
    console.log('当前CRM系统URL:', configData.links.find(link => link.name === 'CRM系统')?.url);
    
    // 2. 更新CRM系统的URL
    const crmLink = configData.links.find(link => link.name === 'CRM系统');
    if (crmLink) {
      const oldUrl = crmLink.url;
      crmLink.url = 'http://192.168.21.206'; // 新的IP
      
      console.log(`✅ 更新CRM系统URL: ${oldUrl} -> ${crmLink.url}`);
      
      // 3. 更新数据库中的默认配置
      await connection.execute(
        'UPDATE default_configurations SET config_data = ?, version = version + 1, updated_at = NOW() WHERE id = ?',
        [JSON.stringify(configData), config.id]
      );
      
      console.log('✅ 默认配置已更新，版本号已递增');
      
      // 4. 验证更新
      const [updatedConfigs] = await connection.execute('SELECT version, updated_at FROM default_configurations WHERE id = ?', [config.id]);
      console.log('新版本号:', updatedConfigs[0].version);
      console.log('更新时间:', updatedConfigs[0].updated_at);
      
    } else {
      console.log('❌ 在默认配置中没有找到CRM系统链接！');
    }
    
  } finally {
    await connection.end();
  }
}

updateCrmConfig().catch(console.error);
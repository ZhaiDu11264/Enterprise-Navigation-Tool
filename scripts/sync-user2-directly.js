const mysql = require('mysql2/promise');

// 直接调用配置同步逻辑
async function syncUser2Directly() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'enterprise_navigation'
  });
  
  try {
    console.log('🔄 直接为用户2执行配置同步...');
    
    // 1. 获取活跃的默认配置
    const [configs] = await connection.execute('SELECT * FROM default_configurations WHERE is_active = 1');
    if (configs.length === 0) {
      console.log('❌ 没有找到活跃的默认配置');
      return;
    }
    
    const config = configs[0];
    console.log('使用配置版本:', config.version);
    
    // 2. 查找用户2的内部办公组
    const [groups] = await connection.execute('SELECT * FROM `groups` WHERE user_id = 2 AND name = "内部办公" AND is_active = 1');
    if (groups.length === 0) {
      console.log('❌ 用户2没有"内部办公"组');
      return;
    }
    
    const groupId = groups[0].id;
    console.log('用户2的内部办公组ID:', groupId);
    
    // 3. 查找用户2现有的CRM系统链接
    const [existingCrmLinks] = await connection.execute(
      'SELECT * FROM website_links WHERE user_id = 2 AND name = "CRM系统" AND is_system_link = 1 AND is_active = 1'
    );
    
    console.log('用户2现有的CRM系统链接:', existingCrmLinks.length, '个');
    existingCrmLinks.forEach(link => {
      console.log(`  ID: ${link.id}, URL: ${link.url}`);
    });
    
    // 4. 从默认配置中获取新的CRM链接信息
    const configData = config.config_data;
    const crmLinkConfig = configData.links.find(link => link.name === 'CRM系统');
    
    if (!crmLinkConfig) {
      console.log('❌ 默认配置中没有找到CRM系统链接');
      return;
    }
    
    console.log('默认配置中的CRM系统URL:', crmLinkConfig.url);
    
    // 5. 更新现有的系统CRM链接
    if (existingCrmLinks.length > 0) {
      const existingLink = existingCrmLinks[0];
      console.log(`🔄 更新现有CRM链接 (ID: ${existingLink.id}) 从 ${existingLink.url} 到 ${crmLinkConfig.url}`);
      
      await connection.execute(
        'UPDATE website_links SET url = ?, description = ?, sort_order = ?, updated_at = NOW() WHERE id = ?',
        [crmLinkConfig.url, crmLinkConfig.description, crmLinkConfig.sortOrder, existingLink.id]
      );
      
      console.log('✅ CRM链接更新成功');
      
      // 如果有多个重复的，删除其他的
      if (existingCrmLinks.length > 1) {
        for (let i = 1; i < existingCrmLinks.length; i++) {
          await connection.execute(
            'UPDATE website_links SET is_active = 0 WHERE id = ?',
            [existingCrmLinks[i].id]
          );
          console.log(`🗑️ 删除重复的CRM链接 (ID: ${existingCrmLinks[i].id})`);
        }
      }
    } else {
      console.log('🆕 创建新的CRM系统链接');
      await connection.execute(
        'INSERT INTO website_links (user_id, name, url, description, group_id, sort_order, is_system_link, is_deletable, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [2, crmLinkConfig.name, crmLinkConfig.url, crmLinkConfig.description, groupId, crmLinkConfig.sortOrder, 1, 0, 1]
      );
      console.log('✅ 新CRM链接创建成功');
    }
    
    // 6. 验证结果
    const [updatedLinks] = await connection.execute(
      'SELECT name, url FROM website_links WHERE user_id = 2 AND name = "CRM系统" AND is_active = 1'
    );
    
    console.log('\n✅ 同步完成！用户2的CRM链接:');
    updatedLinks.forEach(link => {
      console.log(`  ${link.name}: ${link.url}`);
    });
    
  } finally {
    await connection.end();
  }
}

syncUser2Directly().catch(console.error);
const mysql = require('mysql2/promise');

async function checkConfigSync() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'enterprise_navigation'
  });
  
  try {
    console.log('=== 当前默认配置 ===');
    const [configs] = await connection.execute('SELECT * FROM default_configurations WHERE is_active = 1');
    if (configs.length > 0) {
      console.log('配置名称:', configs[0].name);
      console.log('版本:', configs[0].version);
      console.log('更新时间:', configs[0].updated_at);
      console.log('配置内容:');
      console.log(JSON.stringify(configs[0].config_data, null, 2));
    } else {
      console.log('❌ 没有找到活跃的默认配置！');
    }
    
    console.log('\n=== 用户链接数据 ===');
    const [userLinks] = await connection.execute('SELECT id, name, url, user_id FROM website_links WHERE name LIKE "%CRM%" AND is_active = 1');
    console.log('用户CRM链接:');
    if (userLinks.length === 0) {
      console.log('❌ 没有找到用户的CRM链接！');
    } else {
      userLinks.forEach(link => {
        console.log(`用户ID: ${link.user_id}, 名称: ${link.name}, URL: ${link.url}`);
      });
    }
    
    console.log('\n=== 所有用户链接 ===');
    const [allLinks] = await connection.execute('SELECT id, name, url, user_id FROM website_links WHERE is_active = 1 ORDER BY user_id, name');
    const userGroups = {};
    allLinks.forEach(link => {
      if (!userGroups[link.user_id]) {
        userGroups[link.user_id] = [];
      }
      userGroups[link.user_id].push(link);
    });
    
    Object.keys(userGroups).forEach(userId => {
      console.log(`\n用户 ${userId} 的链接:`);
      userGroups[userId].forEach(link => {
        console.log(`  - ${link.name}: ${link.url}`);
      });
    });
    
  } finally {
    await connection.end();
  }
}

checkConfigSync().catch(console.error);
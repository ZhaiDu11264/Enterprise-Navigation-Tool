const mysql = require('mysql2/promise');

async function cleanupDuplicateCrm() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'enterprise_navigation'
  });
  
  try {
    console.log('🧹 清理重复的CRM链接...');
    
    // 查找所有用户的CRM链接
    const [crmLinks] = await connection.execute(
      'SELECT id, name, url, user_id FROM website_links WHERE name LIKE "%CRM%" AND is_active = 1 ORDER BY user_id, id'
    );
    
    console.log(`找到 ${crmLinks.length} 个CRM链接`);
    
    // 按用户分组
    const userGroups = {};
    crmLinks.forEach(link => {
      if (!userGroups[link.user_id]) {
        userGroups[link.user_id] = [];
      }
      userGroups[link.user_id].push(link);
    });
    
    // 对每个用户，保留最新的CRM链接（新IP），删除旧的
    for (const userId of Object.keys(userGroups)) {
      const userCrmLinks = userGroups[userId];
      
      if (userCrmLinks.length > 1) {
        console.log(`\n用户 ${userId} 有 ${userCrmLinks.length} 个CRM链接:`);
        userCrmLinks.forEach(link => {
          console.log(`  ID: ${link.id}, URL: ${link.url}`);
        });
        
        // 找到新IP的链接 (192.168.21.206)
        const newIpLink = userCrmLinks.find(link => link.url.includes('192.168.21.206'));
        const oldIpLinks = userCrmLinks.filter(link => link.url.includes('192.168.21.197'));
        
        if (newIpLink && oldIpLinks.length > 0) {
          console.log(`  保留新IP链接 (ID: ${newIpLink.id})`);
          
          // 删除旧IP的链接
          for (const oldLink of oldIpLinks) {
            console.log(`  删除旧IP链接 (ID: ${oldLink.id})`);
            await connection.execute(
              'UPDATE website_links SET is_active = 0 WHERE id = ?',
              [oldLink.id]
            );
          }
        }
      }
    }
    
    console.log('\n✅ 清理完成！');
    
  } finally {
    await connection.end();
  }
}

cleanupDuplicateCrm().catch(console.error);
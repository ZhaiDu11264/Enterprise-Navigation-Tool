const mysql = require('mysql2/promise');

async function finalCheck() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'enterprise_navigation'
  });
  
  try {
    const [crmLinks] = await connection.execute(
      'SELECT user_id, name, url FROM website_links WHERE name = "CRM系统" AND is_active = 1 ORDER BY user_id'
    );
    
    console.log('🎯 最终状态 - 所有用户的CRM系统链接:');
    crmLinks.forEach(link => {
      console.log(`用户 ${link.user_id}: ${link.url}`);
    });
    
    // 检查是否所有用户都有正确的IP
    const correctIp = 'http://192.168.21.206';
    const allCorrect = crmLinks.every(link => link.url === correctIp);
    
    if (allCorrect) {
      console.log('\n✅ 所有用户的CRM系统都已同步到正确的IP地址！');
    } else {
      console.log('\n⚠️ 还有用户没有同步到正确的IP地址');
    }
    
  } finally {
    await connection.end();
  }
}

finalCheck().catch(console.error);